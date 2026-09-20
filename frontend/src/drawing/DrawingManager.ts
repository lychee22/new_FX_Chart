// 绘图工具管理器 + 渲染 Primitive
// 支持工具 (对齐旧系统 setTool / drawLines / drawFibRet / drawFibPrj / drawTextBox):
//   - 趋势线 (TRENDLINE): 射线, 两点确定, 延伸到右边缘
//   - 平行线 (PARALLEL_LINE): 第一条线 + 中点平移得到平行第二条
//   - 斐波那契回调 (FIBON_RET): 两点, 按 [0.382,0.5,0.618,1.618,2] 画水平线
//   - 斐波那契投射 (FIBON_PRO): 三点, 按 [0.618,1,1.618] 投射
//   - 文本框 (TEXTBOX): 点击位置弹出输入框
//
// 绘制锚定 bar 时间 + 价格, 缩放/平移后自动跟随 (对齐旧系统 lineBarStore/linePriceStore)

import type {
  IChartApi,
  ISeriesApi,
  ISeriesPrimitive,
  IPrimitivePaneView,
  IPrimitivePaneRenderer,
  Time,
} from 'lightweight-charts';
import { TOOL, FIB_RE_RATIOS, FIB_PR_RATIOS, COLORS, MAX_PER_TYPE, LIMITED_TOOLS } from './tools';

// 2026-07-31：handleClick 返回值：
//   true  = 该点击被绘图工具正常消费 (含完成了某对象的创建 / 进入下一击阶段)
//   false = 该点击未消费 (NONE 工具 或 鼠标不在有效区域)
// 新增 'limit' = 该点击因类型上限被拒绝 — ChartPanel 据此触发提示。
export type ClickResult = boolean | 'limit';

/** 2026-07-31：统计指定类型已绘制的对象数（精确匹配 type）。 */
function countByType(objects: DrawObject[], type: number): number {
  let n = 0;
  for (const o of objects) if (o.type === type) n++;
  return n;
}

// ---- 绘图对象数据结构 ----

interface BaseDraw {
  type: number;
  // 2026-09-04：逐对象显隐标记 — 抽屉 "隐藏画线" 切换时只标记当下已存在对象 hidden=true，
  // 新 push 的对象保持 undefined（视为可见）。这样切换语义变成 "隐藏当前所有画线"，而非
  // "全局开关一刀切"，与用户的真实意图（"隐藏只针对已存在，新画的依然可见"）一致。
  // 只有再次点击隐藏按钮才会把含新画线在内的全部对象再次隐藏。
  hidden?: boolean;
}
interface TrendLine extends BaseDraw {
  type: typeof TOOL.TRENDLINE;
  t1: Time; p1: number;  // 起点 (时间, 价格)
  t2: Time; p2: number;  // 终点
}
interface ParallelLine extends BaseDraw {
  type: typeof TOOL.PARALLEL_LINE;
  t1: Time; p1: number;
  t2: Time; p2: number;
  // 第二条线由中点平移产生 (交互时第三点定义偏移)。
  // 2026-08-03：从像素 offset 改为存第三点数据坐标锚点 — 渲染时现算偏移,
  // 避免缩放/平移中途 (第二点与第三点之间) 像素偏移错位。
  anchor3: { t: Time; p: number };
}
interface FibRet extends BaseDraw {
  type: typeof TOOL.FIBON_RET;
  t1: Time; p1: number;  // 100% 起点
  t2: Time; p2: number;  // 0% 终点
}
interface FibPro extends BaseDraw {
  type: typeof TOOL.FIBON_PRO;
  t1: Time; p1: number;  // 基准段起点 P1
  t2: Time; p2: number;  // 基准段终点 P2
  t3: Time; p3: number;  // 投射原点 P3
}
interface TextBox extends BaseDraw {
  type: typeof TOOL.TEXTBOX;
  t: Time; p: number;
  text: string;
}
interface ParallelChannel extends BaseDraw {
  type: typeof TOOL.PARALLEL_CHANNEL;
  // 2026-09-02：三点定位改为"先定平行四边形左边, 再定右上角"：
  //   t1/p1 = 左下角 P1, t2/p2 = 左上角 P2 (P1→P2 确定左边), t3/p3 = 右上角 P3；
  //   右下角 P4 = P3 + P1 − P2 由渲染层自动推算 (见 channelCorners)。
  t1: Time; p1: number;
  t2: Time; p2: number;
  t3: Time; p3: number;
}

type DrawObject = TrendLine | ParallelLine | FibRet | FibPro | TextBox | ParallelChannel;

// ---- 平行通道四角推算 ----
// 三点约定：P1=左下角, P2=左上角, P3=右上角；右下角 P4 由平行四边形对边平行规则自动推算：
//   P4 = P3 + P1 − P2  →  t4 = t3 + t1 − t2, p4 = p3 + p1 − p2
// 两条通道线 = 下边 P1→P4 / 上边 P2→P3 (方向同为 P3−P2, 天然平行)。
// 时间统一为数字 UTC 时间戳 (与 handleClick 中 `t3 - t1` 的既有数值运算约定一致)。
interface ChannelCorners {
  t1: Time; p1: number;  // 左下 (锚点1)
  t2: Time; p2: number;  // 左上 (锚点2)
  t3: Time; p3: number;  // 右上 (锚点3)
  t4: Time; p4: number;  // 右下 (自动推算)
}

function channelCorners(ch: ParallelChannel): ChannelCorners {
  // 2026-09-02: t4 = t3 + t1 - t2 强转 number 之前必须保证输入是 number。
  // 若 t1/t2/t3 已被 BusinessDay 污染 (拖拽过程历史数据脏), 算出的 t4 可能是 NaN,
  // 进一步让 P4 = xxyy 返回 null → 整条通道不画 (变形根因)。这里若任一为非 number,
  // 直接返回 NaN t4, 上层 drawParallelChannel 入口的 number 校验会一并拒绝画任何东西。
  const t1n = typeof ch.t1 === 'number' ? ch.t1 : NaN;
  const t2n = typeof ch.t2 === 'number' ? ch.t2 : NaN;
  const t3n = typeof ch.t3 === 'number' ? ch.t3 : NaN;
  return {
    t1: t1n as Time, p1: ch.p1,
    t2: t2n as Time, p2: ch.p2,
    t3: t3n as Time, p3: ch.p3,
    t4: (t3n + t1n - t2n) as Time,
    p4: ch.p3 + ch.p1 - ch.p2,
  };
}

/**
 * 斐波那契投射的唯一价格计算入口。渲染与命中检测必须共用这份几何，
 * 避免线条可视范围和可点选范围再次偏离。
 * 标准三点 Fibonacci Extension 公式：
 *   price = sign * |P1-P2| * ratio + P3
 */
function fibProjectionLevels(fib: FibPro): Array<{ ratio: number; price: number }> {
  const baseHeight = Math.abs(fib.p1 - fib.p2);
  // 投射方向跟随 P1→P2 的主趋势：P2 高于 P1 时向上，否则向下。
  const direction = fib.p2 >= fib.p1 ? 1 : -1;
  return FIB_PR_RATIOS.map(ratio => ({
    ratio,
    price: direction * baseHeight * ratio + fib.p3,
  }));
}

/**
 * 斐波那契回调的唯一价格计算入口，渲染与命中检测共用这份几何，
 * 与旧版 simplechart.js compFibRe 对齐：
 * 0% 基线(P2) + 5 条比例线 + 100% 基线(P1)，共 7 条。
 */
function fibRetracementLevels(fib: FibRet): Array<{ label: string; price: number }> {
  const sign = fib.p1 > fib.p2 ? 1 : -1;
  const diff = Math.abs(fib.p1 - fib.p2);
  return [
    { label: '(0.0)', price: fib.p2 },
    ...FIB_RE_RATIOS.map(r => ({ label: `(${r})`, price: sign * diff * r + fib.p2 })),
    { label: '(1.0)', price: fib.p1 },
  ];
}
// ---- 渲染器 ----

class DrawingRenderer implements IPrimitivePaneRenderer {
  constructor(private mgr: DrawingManager) {}

  draw(target: any): void {
    const m = this.mgr;
    if (!m.chart || !m.series) return;
    // 2026-09-04：逐对象显隐 — 抽屉 "隐藏画线" 切换时只标记当下已存在对象 hidden=true,
    // 新 push 的对象默认可见。语义："隐藏当前画线"，新画的不受历史隐藏状态影响。
    // 用户再次点隐藏才会把含新画线在内的全部对象标 hidden。
    const ts = m.chart.timeScale();

    target.useBitmapCoordinateSpace((space: any) => {
      const ctx = space.context;
      ctx.save();
      ctx.scale(space.horizontalPixelRatio, space.verticalPixelRatio);

      const drawAll = (objects: DrawObject[]) => {
        for (let i = 0; i < objects.length; i++) {
          const obj = objects[i];
          // 2026-09-04：跳过隐藏对象 — 与 setVisible(false) 当时标记的对象集合对应
          if (obj.hidden) continue;
          this.drawObject(ctx, ts, obj);
          // 2026-09-01：选中态绘制锚点小圆点 — 仅对真实 objects (m.objects) 的选中项。
          // m.preview 是绘制过程中未提交的预览对象，无下标概念，不参与选中渲染。
          if (m.selected === i) this.drawAnchors(ctx, ts, obj);
        }
      };

      // 已提交对象 — 仅渲染未标记 hidden 的对象。隐藏语义落到逐对象上。
      drawAll(m.objects);

      // 2026-09-02：进行中的画线 — 在预览对象之前绘制已定下的蓝色锚点小圆圈，
      // 让用户在 tap 后立即看到"自己点在了哪里"（与 TradingView 触屏画线体验一致）。
      this.drawPendingAnchors(ctx, ts);

      // 预览中的对象 (鼠标拖动时)
      if (m.preview) this.drawObject(ctx, ts, m.preview);

      ctx.restore();
    });
  }

  /**
   * 2026-09-01：绘制选中对象的锚点小圆点。
   * TradingView 风格：白色填充 + 深色描边，直径 10px。
   * 各类型对象的锚点定义：
   *   - TrendLine / FibRet：t1/p1, t2/p2
   *   - FibPro：t1/p1(基准起点), t2/p2(基准终点), t3/p3(投射起点)
   *   - ParallelChannel：t1/p1(左下), t2/p2(左上), t3/p3(右上)
   *     和派生的右下角。第四个点仅用于选中态展示；创建流程和待定点数仍为 3 个真实锚点。
   */
  private drawAnchors(ctx: CanvasRenderingContext2D, ts: any, obj: DrawObject): void {
    const m = this.mgr;
    if (!m.series) return;
    const anchors: Array<{ t: Time; p: number }> = [];
    if (obj.type === TOOL.TRENDLINE || obj.type === TOOL.FIBON_RET) {
      anchors.push({ t: obj.t1, p: obj.p1 }, { t: obj.t2, p: obj.p2 });
    } else if (obj.type === TOOL.FIBON_PRO) {
      anchors.push({ t: obj.t1, p: obj.p1 }, { t: obj.t2, p: obj.p2 }, { t: obj.t3, p: obj.p3 });
    } else if (obj.type === TOOL.PARALLEL_CHANNEL) {
      const corners = channelCorners(obj);
      anchors.push(
        { t: corners.t1, p: corners.p1 },
        { t: corners.t2, p: corners.p2 },
        { t: corners.t3, p: corners.p3 },
        { t: corners.t4, p: corners.p4 },
      );
    } else {
      return;
    }
    const fill = '#ffffff';
    const stroke = '#1f2937';
    const r = 5;
    for (const a of anchors) {
      const x = ts.timeToCoordinate(a.t);
      const y = m.series.priceToCoordinate(a.p);
      if (x === null || y === null) continue;
      ctx.beginPath();
      ctx.arc(x as number, y as number, r, 0, Math.PI * 2);
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = stroke;
      ctx.stroke();
    }
  }

  /**
   * 2026-09-02：绘制进行中画线的蓝色锚点小圆圈。
   * 在每次 tap 定点后立即显示，与截图中的"小圆圈"视觉一致，
   * 区分于"已提交对象的选中态"（白色 + 深色描边）。
   * 各类型需要的点数：
   *   - TrendLine / FibRet：最多 2 个
   *   - FibPro / ParallelChannel：最多 3 个
   * 仅在 pendingPoints 非空时绘制；提交后 pendingPoints 清空 → 锚点自动消失。
   */
  private drawPendingAnchors(ctx: CanvasRenderingContext2D, ts: any): void {
    const m = this.mgr;
    if (!m.series) return;
    // 通过公开 getter 访问 (DrawingManager.pendingPoints 是 private)
    const pts = m.getPendingPoints();
    if (!pts || pts.length === 0) return;
    // 仅对需要定点落点的绘图工具展示待定锚点。
    const active = m.getActiveTool();
    const max =
      active === TOOL.TRENDLINE || active === TOOL.FIBON_RET ? 2 :
      active === TOOL.FIBON_PRO || active === TOOL.PARALLEL_CHANNEL ? 3 :
      0;
    if (max === 0) return;
    const count = Math.min(pts.length, max);
    const fill = '#2196F3';      // 蓝色 — 与通道线颜色一致
    const stroke = '#ffffff';    // 白色描边 — 在彩色 K 线上更醒目
    const r = 6;
    for (let i = 0; i < count; i++) {
      const a = pts[i];
      const x = ts.timeToCoordinate(a.t);
      const y = m.series.priceToCoordinate(a.p);
      if (x === null || y === null) continue;
      ctx.beginPath();
      ctx.arc(x as number, y as number, r, 0, Math.PI * 2);
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = stroke;
      ctx.stroke();
    }
  }

  private drawObject(ctx: CanvasRenderingContext2D, ts: any, obj: DrawObject): void {
    const m = this.mgr;
    if (obj.type === TOOL.TRENDLINE) {
      this.drawTrendRay(ctx, ts, obj.t1, obj.p1, obj.t2, obj.p2, COLORS.LINE);
    } else if (obj.type === TOOL.PARALLEL_LINE) {
      const o = obj as ParallelLine;
      this.drawTrendRay(ctx, ts, o.t1, o.p1, o.t2, o.p2, COLORS.LINE);
      // 平行线: 整体平移 offset — 2026-08-03 改由第三点数据坐标锚点现算,
      // 与 drawParallelChannel 一致, 缩放/平移后仍保持平行关系。
      const x1 = ts.timeToCoordinate(o.t1);
      const x2 = ts.timeToCoordinate(o.t2);
      if (x1 !== null && x2 !== null) {
        const y1 = m.series!.priceToCoordinate(o.p1);
        const y2 = m.series!.priceToCoordinate(o.p2);
        // 偏移 = 锚点相对基线中点的像素差 (原第三点分支同一套数学, 从"捕获时"挪到"渲染时")
        const midP = (o.p1 + o.p2) / 2;
        const xBase = ts.timeToCoordinate(o.t1);
        const xNew = ts.timeToCoordinate(o.anchor3.t);
        const yBase = m.series!.priceToCoordinate(midP);
        const yNew = m.series!.priceToCoordinate(o.anchor3.p);
        if (y1 !== null && y2 !== null && xNew !== null && yNew !== null && yBase !== null && xBase !== null) {
          const dt = (xNew as number) - (xBase as number);
          const dp = (yNew as number) - (yBase as number);
          ctx.strokeStyle = COLORS.LINE;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo((x1 as number) + dt, y1 as number + dp);
          ctx.lineTo((x2 as number) + dt, y2 as number + dp);
          ctx.stroke();
        }
      }
    } else if (obj.type === TOOL.FIBON_RET) {
      this.drawFib(ctx, ts, obj as FibRet);
    } else if (obj.type === TOOL.FIBON_PRO) {
      this.drawFibProjection(ctx, ts, obj as FibPro);
    } else if (obj.type === TOOL.PARALLEL_CHANNEL) {
      this.drawParallelChannel(ctx, ts, obj as ParallelChannel);
    }
    // 2026-07-27：TEXTBOX 不再走 canvas，改为 React 层绝对定位的 antd 文本框。
  }

  /** 趋势线段: 仅在 p1 与 p2 之间画线段 (不再延伸到右边缘)。 */
  private drawTrendRay(
    ctx: CanvasRenderingContext2D, ts: any,
    t1: Time, p1: number, t2: Time, p2: number, color: string,
  ): void {
    const m = this.mgr;
    const x1 = ts.timeToCoordinate(t1);
    const x2 = ts.timeToCoordinate(t2);
    if (x1 === null || x2 === null) return;
    const y1 = m.series!.priceToCoordinate(p1);
    const y2 = m.series!.priceToCoordinate(p2);
    if (y1 === null || y2 === null) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x1 as number, y1 as number);
    ctx.lineTo(x2 as number, y2 as number);
    ctx.stroke();
  }

  /** 手动绘制虚线段。Bitmap coordinate space 中统一按 CSS 像素计算。 */
  private drawDashedSegment(
    ctx: CanvasRenderingContext2D,
    ax: number, ay: number, bx: number, by: number,
    color: string,
  ): void {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();

    const dx = bx - ax;
    const dy = by - ay;
    const len = Math.hypot(dx, dy);
    if (len === 0) {
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();
      return;
    }

    // 4px 实线 / 2px 空白，避免部分浏览器在 bitmap coordinate space 中缩放 setLineDash 不稳定。
    const dashLen = 4;
    const gapLen = 2;
    const ux = dx / len;
    const uy = dy / len;
    for (let d = 0; d < len; d += dashLen + gapLen) {
      const segEnd = Math.min(d + dashLen, len);
      ctx.moveTo(ax + ux * d, ay + uy * d);
      ctx.lineTo(ax + ux * segEnd, ay + uy * segEnd);
    }
    ctx.stroke();
  }

  /**
   * 斐波那契回调: 与旧版 simplechart.js compFibRe 的 7 条线级对齐。
   * 0%/100% 基线 + 5 条比例线，水平线只画在两锚点的时间范围内（线段）；
   * 价格 = P2 ± |P1-P2| * ratio，从 P2 往 P1 方向回调。
   */
  private drawFib(ctx: CanvasRenderingContext2D, ts: any, fib: FibRet): void {
    const m = this.mgr;
    const xStart = ts.timeToCoordinate(fib.t1);
    const xEnd = ts.timeToCoordinate(fib.t2);
    if (xStart === null || xEnd === null) return;

    // 反向拖动（P2 在 P1 左侧）时按左右边界绘制。
    const left = Math.min(xStart as number, xEnd as number);
    const right = Math.max(xStart as number, xEnd as number);

    // P1→P2 虚线基线，标明两锚点的连接关系（预览与成品共用本函数）。
    const y1 = m.series!.priceToCoordinate(fib.p1);
    const y2 = m.series!.priceToCoordinate(fib.p2);
    if (y1 !== null && y2 !== null) {
      this.drawDashedSegment(ctx, xStart as number, y1 as number, xEnd as number, y2 as number, COLORS.FIB_RE);
    }

    for (const level of fibRetracementLevels(fib)) {
      const y = m.series!.priceToCoordinate(level.price);
      if (y === null) continue;

      ctx.strokeStyle = COLORS.FIB_RE;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(left, y as number);
      ctx.lineTo(right, y as number);
      ctx.stroke();

      ctx.fillStyle = COLORS.FIB_RE;
      ctx.font = '11px Arial';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`${level.price.toFixed(m.decimals)} ${level.label}`, right - 4, (y as number) - 2);
    }
  }

  /**
   * 斐波那契投射（三点逻辑，与旧版 chart/js/simplechart.js 对齐）：
   *   P1→P2 = 已走完的基准行情，高度 |P1-P2| 用于计算投射距离；
   *   P3    = 新行情起点（投射原点）；
   *   price = P3 ± |P1-P2| * ratio。
   * 投射方向跟随 P1→P2 的主趋势：P2 高于 P1 时向上，否则向下。
   * 三点之间按 1→2→3 画两条虚线；水平投射线与斐波那契回调一致，
   * 从三点中最左侧锚点延伸到图表右缘，避免投射线起点晚于基准路径。
   */
  private drawFibProjection(ctx: CanvasRenderingContext2D, ts: any, fib: FibPro): void {
    const m = this.mgr;
    const x1 = ts.timeToCoordinate(fib.t1);
    const x2 = ts.timeToCoordinate(fib.t2);
    const x3 = ts.timeToCoordinate(fib.t3);
    const y1 = m.series!.priceToCoordinate(fib.p1);
    const y2 = m.series!.priceToCoordinate(fib.p2);
    const y3 = m.series!.priceToCoordinate(fib.p3);

    // 预览阶段必须等 P2 已落定、正在定 P3 时才显示水平投射线。
    // 只定完 P1 时，仅显示 P1→鼠标位置的虚线，不出现三条平行投射线。
    const isPreview = m.preview === fib;
    const p2IsFixed = !isPreview || m.getPendingPoints().length >= 2;

    // 基准路径必须完整可见：P1→P2、P2→P3 都使用虚线，明确三点先后关系。
    if (x1 !== null && x2 !== null && y1 !== null && y2 !== null) {
      this.drawDashedSegment(ctx, x1, y1, x2, y2, COLORS.FIB_PR);
    }
    if (!p2IsFixed || x3 === null) return;
    if (x2 !== null && y2 !== null && y3 !== null) {
      this.drawDashedSegment(ctx, x2, y2, x3, y3, COLORS.FIB_PR);
    }

    // 与斐波那契回调同一水平线绘制规则：先经过完整三点路径，再向右延伸。
    // 反向拖动时同样从三点中最左侧锚点开始，保证三条投射线彼此左对齐。
    if (x1 === null || x2 === null) return;
    const left = Math.min(x1 as number, x2 as number, x3 as number);
    const rightEdge = ts.width() - 1;
    for (const level of fibProjectionLevels(fib)) {
      const y = m.series!.priceToCoordinate(level.price);
      if (y === null) continue;

      ctx.strokeStyle = COLORS.FIB_PR;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(left, y as number);
      ctx.lineTo(rightEdge, y as number);
      ctx.stroke();

      const label = `${level.price.toFixed(m.decimals)} (${level.ratio})`;
      ctx.fillStyle = COLORS.FIB_PR;
      ctx.font = '11px Arial';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      ctx.fillText(label, rightEdge - 4, (y as number) - 2);
    }
  }
  /**
   * 平行通道 (Parallel Channel):
   *   - 三点定位: P1=左下角, P2=左上角 (P1→P2 即平行四边形左边), P3=右上角
   *   - 右下角 P4 = P3 + P1 − P2 自动推算, 保证对边平行
   *   - 两条通道线: 下边 P1→P4, 上边 P2→P3 (方向相同)
   *   - 视觉: 半透明填充四边形 P1→P2→P3→P4 + 两条平行有限段 + 50% 虚线中线
   *     (左右侧边不画, 不再延伸到右边缘)
   *   - 预览退化态: 仅按下 1 点时 P2==P3 → 四边形退化, 只画 P1→P2 的左边预览线
   */
  private drawParallelChannel(
    ctx: CanvasRenderingContext2D, ts: any, ch: ParallelChannel,
  ): void {
    const m = this.mgr;
    const c = channelCorners(ch);
    // 2026-09-02: t1/t2/t3/t4 必须都是 number 才能正确画通道。若有任一为非 number
    // (BusinessDay 污染 / 历史脏数据), 整个通道拒绝绘制 (含填充 + 边线 + 中线),
    // 避免部分元素被画出来而另一些不可见造成的"图像变形"观感。
    if (typeof c.t1 !== 'number' || typeof c.t2 !== 'number' ||
        typeof c.t3 !== 'number' || typeof c.t4 !== 'number') return;
    const xxyy = (t: Time, p: number): [number, number] | null => {
      const x = ts.timeToCoordinate(t);
      const y = m.series!.priceToCoordinate(p);
      if (x === null || y === null) return null;
      return [x as number, y as number];
    };
    const P1 = xxyy(c.t1, c.p1);
    const P2 = xxyy(c.t2, c.p2);
    const P3 = xxyy(c.t3, c.p3);
    const P4 = xxyy(c.t4, c.p4);
    if (!P1 || !P2 || !P3 || !P4) return;

    // 预览退化态 (P2==P3 且 P4==P1): 只画左边 P1→P2
    if (((c.t2 as number) === (c.t3 as number) && c.p2 === c.p3)
        && ((c.t4 as number) === (c.t1 as number) && c.p4 === c.p1)) {
      ctx.strokeStyle = COLORS.CHANNEL_LINE;
      ctx.lineWidth = 1;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(P1[0], P1[1]);
      ctx.lineTo(P2[0], P2[1]);
      ctx.stroke();
      return;
    }

    // 1. 半透明填充 (四边形 P1→P2→P3→P4)
    ctx.fillStyle = COLORS.CHANNEL_FILL;
    ctx.beginPath();
    ctx.moveTo(P1[0], P1[1]);
    ctx.lineTo(P2[0], P2[1]);
    ctx.lineTo(P3[0], P3[1]);
    ctx.lineTo(P4[0], P4[1]);
    ctx.closePath();
    ctx.fill();

    // 2. 两条平行通道线 (实线): 下边 P1→P4, 上边 P2→P3
    ctx.strokeStyle = COLORS.CHANNEL_LINE;
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(P1[0], P1[1]);
    ctx.lineTo(P4[0], P4[1]);
    ctx.moveTo(P2[0], P2[1]);
    ctx.lineTo(P3[0], P3[1]);
    ctx.stroke();

    // 3. 视觉 50% 虚线中线: 左侧边屏幕中点 → 右侧边屏幕中点。
    //    timeToCoordinate 只能可靠映射已有 bar 的时间, 对落在 bar 间隙的时间会返回 null;
    //    因此不要用 (t1+t2)/2 这类时间中点再反查坐标, 直接基于已映射的 P1~P4 求中点。
    //    对数价格轴或时间轴存在跳空时, 该线代表视觉中点而非数据空间算术中点。
    //    注意: lightweight-charts 的 useBitmapCoordinateSpace 内部对 setLineDash 的支持
    //    在部分浏览器/缩放下不稳定, 故采用手动绘制短实线段模拟虚线 — 长度 4px 实线 / 2px 间隔。
    const M1: [number, number] = [
      (P1[0] + P2[0]) / 2,
      (P1[1] + P2[1]) / 2,
    ];
    const M2: [number, number] = [
      (P3[0] + P4[0]) / 2,
      (P3[1] + P4[1]) / 2,
    ];
    ctx.strokeStyle = COLORS.CHANNEL_LINE;
    ctx.lineWidth = 1;
    const dashLen = 4;   // 实线段长 (px)
    const gapLen = 2;    // 间隔长 (px)
    const cycle = dashLen + gapLen;
    const dx = M2[0] - M1[0];
    const dy = M2[1] - M1[1];
    const len = Math.hypot(dx, dy);
    if (len > 0) {
      const ux = dx / len;
      const uy = dy / len;
      ctx.beginPath();
      for (let s = 0; s < len; s += cycle) {
        const a = s;
        const b = Math.min(s + dashLen, len);
        ctx.moveTo(M1[0] + ux * a, M1[1] + uy * a);
        ctx.lineTo(M1[0] + ux * b, M1[1] + uy * b);
      }
      ctx.stroke();
    }
  }
}

class DrawingPaneView implements IPrimitivePaneView {
  constructor(private mgr: DrawingManager) {}
  zOrder(): 'top' | 'normal' | 'bottom' {
    return 'top';
  }
  renderer(): IPrimitivePaneRenderer | null {
    return new DrawingRenderer(this.mgr);
  }
}

/**
 * 绘图管理器: 管理所有用户绘图对象 + 交互状态机 + 渲染。
 * 由 ChartPanel 组件驱动鼠标事件 (click/mousemove) 调用本类的 handle* 方法。
 */
export class DrawingManager implements ISeriesPrimitive<Time> {
  chart: IChartApi | null = null;
  series: ISeriesApi<any> | null = null;
  // 2026-09-02: lightweight-charts v5 attached() 注入 requestUpdate, 是 primitive
  // 主动通知 chart 重绘的标准接口。原 chart?.applyOptions({}) 不可靠 (空 options
  // 不触发 primitive update), 表现为 50% 中线偶发不显示 / 拖拽时图像变形。
  private requestUpdateFn: (() => void) | null = null;
  // 2026-09-02: fallback 一次性警告标志 — requestUpdate 不可用是异常状态 (理论上
  // attached() 跑过就一定有), 仅警告一次避免刷屏, 方便开发者定位未正确注入的情况。
  private fallbackWarned = false;
  objects: DrawObject[] = [];
  preview: DrawObject | null = null;
  decimals = 2;

  // 2026-09-01：移动端全局显隐 + 选中态 — 全局显隐用于抽屉中的"隐藏/显示画线"开关；
  // 选中态用于移动端点选已画对象显示锚点 + 悬浮删除按钮。
  visible: boolean = true;
  selected: number | null = null;

  // 交互状态机
  private activeTool: number = TOOL.NONE;
  private clickStage = 0;          // 当前点击阶段 (0/1/2)
  private pendingPoints: { t: Time; p: number }[] = [];
  private mouseTime: Time | null = null;
  private mousePrice = 0;

  // 2026-07-27：文字框变更订阅 — ChartPanel 用来把文字框同步到 React state
  private textBoxListeners: Set<() => void> = new Set();
  // 2026-09-07：通用对象变化订阅 — 任何 objects 数组突变（新增/删除/清空）都会
  // 通知监听器, 让 UI 侧 (ChartPanel) 能即时同步每类工具的计数, 用于工具按钮
  // 提前检查上限 (避免用户选了已满 5 个的工具按钮后落点时才报错)。
  private objectListeners: Set<() => void> = new Set();

  private paneView = new DrawingPaneView(this);

  constructor(chart: IChartApi, series: ISeriesApi<any>) {
    this.chart = chart;
    this.series = series;
  }

  setTool(tool: number): void {
    this.activeTool = tool;
    this.clickStage = 0;
    this.pendingPoints = [];
    this.preview = null;
    // 即时动作 (清除类) — 2026-09-07：每次修改 objects 后通知对象监听器
    if (tool === TOOL.CLEAR_ONELINE) {
      if (this.objects.length > 0) { this.objects.pop(); this.redraw(); this.notifyObjectsChanged(); }
    }
    else if (tool === TOOL.CLEAR_ALLLINE) {
      const next = this.objects.filter(o =>
        o.type === TOOL.TEXTBOX
        || o.type === TOOL.FIBON_RET
        || o.type === TOOL.FIBON_PRO
        || o.type === TOOL.PARALLEL_CHANNEL,
      );
      if (next.length !== this.objects.length) {
        this.objects = next; this.redraw(); this.notifyObjectsChanged();
      }
    }
    else if (tool === TOOL.CLEAR_FIBON) {
      const next = this.objects.filter(o => o.type !== TOOL.FIBON_RET && o.type !== TOOL.FIBON_PRO);
      if (next.length !== this.objects.length) { this.objects = next; this.redraw(); this.notifyObjectsChanged(); }
    }
    else if (tool === TOOL.CLEAR_ONETEXT) {
      const before = this.objects.length;
      this.removeLastByType(TOOL.TEXTBOX);
      if (this.objects.length !== before) this.notifyObjectsChanged();
      this.redraw();
    }
    else if (tool === TOOL.CLEAR_ALLTEXT) {
      const next = this.objects.filter(o => o.type !== TOOL.TEXTBOX);
      if (next.length !== this.objects.length) { this.objects = next; this.redraw(); this.notifyObjectsChanged(); }
    }
  }

  /**
   * 撤销最后一个用户绘图对象 (含文字框, 但不动尚未提交的预览)。
   * 由 App / Toolbar / Ctrl+Z 快捷键调用。
   * 返回是否真的撤销了某个对象。
   */
  undoLast(): boolean {
    if (this.objects.length === 0) return false;
    const removed = this.objects.pop()!;
    // 同步通知 TextBox 监听器 (若有 TextBox 被撤销)
    if (removed.type === TOOL.TEXTBOX) this.notifyTextBoxesChanged();
    // 2026-09-07：通知通用对象监听器, 让 UI 侧同步每类计数
    this.notifyObjectsChanged();
    this.redraw();
    return true;
  }

  /** 是否存在可撤销的绘图对象。用于按钮 disabled 状态。 */
  canUndo(): boolean {
    return this.objects.length > 0;
  }

  /**
   * 2026-07-31：清空所有已绘制对象（趋势线/平行线/平行通道/斐波那契/文字框），
   * 由工具栏的"清除所有"按钮触发。返回是否真的有对象被清除。
   * 与 Ctrl+Z 不同：本方法一次性清空所有对象，不可单步撤销。
   */
  clearAllDrawings(): boolean {
    if (this.objects.length === 0) return false;
    // 若有文字框被清掉, 需要通知 TextBoxLayer 同步 React state
    const hadTextBox = this.objects.some((o) => o.type === TOOL.TEXTBOX);
    this.objects = [];
    // 清掉任何进行中的画线状态, 避免"空对象但有 pendingPoints"的怪异态
    this.pendingPoints = [];
    this.preview = null;
    this.clickStage = 0;
    this.pendingParallelBase = null;
    // 2026-09-01：清除全部时同步清选中态
    this.selected = null;
    this.redraw();
    if (hadTextBox) this.notifyTextBoxesChanged();
    // 2026-09-07：通知通用对象监听器, 让 UI 侧同步每类计数 (清空后全 0)
    this.notifyObjectsChanged();
    return true;
  }

/**
   * 2026-09-02：右键取消当前正在进行的画线操作。
   * 清空点击阶段 / 预览 / 平行线中间态, 但保留已选中的工具 (用户可重新开始画)。
   * 若当前没有进行中的画线, 返回 false。
   */
  cancelDrawing(): boolean {
    const hadPending = this.pendingPoints.length > 0
      || this.preview !== null
      || this.clickStage !== 0
      || this.pendingParallelBase !== null;
    if (!hadPending) return false;
    this.pendingParallelBase = null;
    this.reset();
    this.redraw();
    return true;
  }

  /**
   * 2026-09-02: 取消当前进行中的画线 (清 pendingPoints/preview) 但保留 activeTool —
   * 用于触屏拖拽中途被打断 (pointercancel/leave/抽屉关闭) 时, 让用户重新按下继续画。
   */
  cancelPendingDrawing(): void {
    if (this.pendingPoints.length > 0
        || this.preview !== null
        || this.pendingParallelBase !== null) {
      this.pendingParallelBase = null;
      this.reset();
      this.redraw();
    }
  }

  private removeLastByType(type: number): void {
    for (let i = this.objects.length - 1; i >= 0; i--) {
      if (this.objects[i].type === type) { this.objects.splice(i, 1); return; }
    }
  }

  /**
   * 处理点击事件。
   * 返回值：
   *   true  = 该事件被绘图工具正常消费 (阻止默认行为)
   *   false = 该事件未被消费 (NONE 工具 或 鼠标不在有效区域)
   *   'limit' = 该事件因类型上限被拒绝 — ChartPanel 据此触发 toast 提示。
   *
   * 2026-07-31：LIMITED_TOOLS 内的五类工具最多 5 个；TRENDLINE (画线) 不限。
   */
  handleClick(time: Time | null, price: number | null): ClickResult {
    if (this.activeTool === TOOL.NONE || time === null || price === null) return false;
    // 2026-09-02: coordinateToTime 在 lightweight-charts v5 中可能返回 BusinessDay 对象
    // (周末跳空区段/某些缩放下)。落到 ParallelChannel.t1/t2/t3 后强转 number 得 NaN,
    // 导致 50% 中线 / 整条通道不可绘制 (表现为拖拽变形)。源头拒绝非 number 时间戳。
    if (typeof time !== 'number') return false;

    // 上限检查 — 仅在"即将 push 一个对象"的临界点拒绝。
    // pendingPoints.push 之前的当前长度 N；push 后变 N+1。判断 N+1 是否达到创建条件。
    if (this.activeTool === TOOL.TRENDLINE) {
      // 画线不限, 直接进入正常流程
    } else if (LIMITED_TOOLS.has(this.activeTool)) {
      const cur = this.pendingPoints.length;
      let willCreateNow = false;
      if (this.activeTool === TOOL.PARALLEL_LINE) {
        // PARALLEL_LINE：第二击仅建立 pendingParallelBase（不计对象）；第三击真正 push 对象
        willCreateNow = this.clickStage === 2 && this.pendingParallelBase !== null && cur === 2;
      } else if (this.activeTool === TOOL.PARALLEL_CHANNEL) {
        willCreateNow = cur === 2; // push 后变 3
      } else if (this.activeTool === TOOL.FIBON_RET) {
        willCreateNow = cur === 1; // push 后变 2
      } else if (this.activeTool === TOOL.FIBON_PRO) {
        willCreateNow = cur === 2; // push 后变 3
      }
      if (willCreateNow && countByType(this.objects, this.activeTool) >= MAX_PER_TYPE) {
        // 拒绝此次创建 — 回滚本次 pendingPoints 与临时状态
        this.reset();
        this.pendingParallelBase = null;
        this.redraw();
        return 'limit';
      }
    }

    this.pendingPoints.push({ t: time, p: price });
    // 2026-09-02：点位留存 — 新画线第一点落下时, 清除上一对象的留存锚点 (选中态)
    if (this.pendingPoints.length === 1) this.selected = null;

    if (this.activeTool === TOOL.TRENDLINE || this.activeTool === TOOL.PARALLEL_LINE) {
      if (this.pendingPoints.length === 1) {
        this.clickStage = 1;
      } else if (this.pendingPoints.length === 2) {
        const obj: TrendLine = {
          type: TOOL.TRENDLINE,
          t1: this.pendingPoints[0].t, p1: this.pendingPoints[0].p,
          t2: this.pendingPoints[1].t, p2: this.pendingPoints[1].p,
        };
        if (this.activeTool === TOOL.PARALLEL_LINE) {
          // 平行线: 先提交第一条, 等第三点定义偏移
          this.pendingParallelBase = { t1: obj.t1, p1: obj.p1, t2: obj.t2, p2: obj.p2 };
          this.clickStage = 2;
          return true;
        }
        this.objects.push(obj);
        // 2026-09-02：点位留存 — 完成即选中, 锚点持续显示 (供拖拽微调/删除)
        this.selected = this.objects.length - 1;
        this.reset();
        this.redraw();
        // 2026-09-07：通知通用对象监听器, 让 UI 侧同步每类计数
        this.notifyObjectsChanged();
      }
    } else if (this.activeTool === TOOL.PARALLEL_LINE && this.clickStage === 2 && this.pendingParallelBase) {
      // 第三点定义平行偏移 — 真正的对象创建点, 已在进入时做过上限检查
      const base = this.pendingParallelBase;
      // 2026-08-03：存第三点数据坐标锚点 (不再算像素 offset), 渲染时现算, 缩放中途不偏移错位。
      const obj: ParallelLine = {
        type: TOOL.PARALLEL_LINE,
        t1: base.t1, p1: base.p1, t2: base.t2, p2: base.p2,
        anchor3: { t: this.pendingPoints[2]?.t ?? time, p: price },
      };
      this.objects.push(obj);
      this.pendingParallelBase = null;
      // 2026-09-02：点位留存 — 完成即选中
      this.selected = this.objects.length - 1;
      this.reset();
      this.redraw();
      // 2026-09-07：通知通用对象监听器, 让 UI 侧同步每类计数
      this.notifyObjectsChanged();
    } else if (this.activeTool === TOOL.PARALLEL_CHANNEL) {
      if (this.pendingPoints.length === 3) {
        // 三点顺序: [0]=左下角, [1]=左上角, [2]=右上角 — 右下角由渲染层自动推算
        this.objects.push({
          type: TOOL.PARALLEL_CHANNEL,
          t1: this.pendingPoints[0].t, p1: this.pendingPoints[0].p,
          t2: this.pendingPoints[1].t, p2: this.pendingPoints[1].p,
          t3: this.pendingPoints[2].t, p3: this.pendingPoints[2].p,
        } as ParallelChannel);
        // 2026-09-02：点位留存 — 完成即选中, 锚点持续显示
        this.selected = this.objects.length - 1;
        this.reset();
        this.redraw();
        // 2026-09-07：通知通用对象监听器, 让 UI 侧同步每类计数
        this.notifyObjectsChanged();
      }
    } else if (this.activeTool === TOOL.FIBON_RET) {
      if (this.pendingPoints.length === 2) {
        this.objects.push({
          type: TOOL.FIBON_RET,
          t1: this.pendingPoints[0].t, p1: this.pendingPoints[0].p,
          t2: this.pendingPoints[1].t, p2: this.pendingPoints[1].p,
        } as FibRet);
        // 2026-09-02：点位留存 — 完成即选中
        this.selected = this.objects.length - 1;
        this.reset();
        this.redraw();
        // 2026-09-07：通知通用对象监听器, 让 UI 侧同步每类计数
        this.notifyObjectsChanged();
      }
    } else if (this.activeTool === TOOL.FIBON_PRO) {
      // 点击后立即刷新预览，避免 P2 落定瞬间仍沿用上一帧鼠标位置的旧 P2。
      if (this.pendingPoints.length === 1) {
        this.preview = {
          type: TOOL.FIBON_PRO,
          t1: this.pendingPoints[0].t, p1: this.pendingPoints[0].p,
          t2: time, p2: price, t3: time, p3: price,
        } as FibPro;
      } else if (this.pendingPoints.length === 2) {
        this.preview = {
          type: TOOL.FIBON_PRO,
          t1: this.pendingPoints[0].t, p1: this.pendingPoints[0].p,
          t2: this.pendingPoints[1].t, p2: this.pendingPoints[1].p,
          t3: time, p3: price,
        } as FibPro;
      }
      if (this.pendingPoints.length === 3) {
        this.objects.push({
          type: TOOL.FIBON_PRO,
          t1: this.pendingPoints[0].t, p1: this.pendingPoints[0].p,
          t2: this.pendingPoints[1].t, p2: this.pendingPoints[1].p,
          t3: this.pendingPoints[2].t, p3: this.pendingPoints[2].p,
        } as FibPro);
        // 2026-09-02：点位留存 — 完成即选中
        this.selected = this.objects.length - 1;
        this.reset();
        this.redraw();
        // 2026-09-07：通知通用对象监听器, 让 UI 侧同步每类计数
        this.notifyObjectsChanged();
      }
    }
    // 2026-09-02：中间点（尚未凑满一个对象）也必须重绘——移动端没有鼠标 hover，
    // 不重绘则蓝色待定锚点要等到下一次 pointermove 才可见。
    this.redraw();
    return true;
  }

  private pendingParallelBase: { t1: Time; p1: number; t2: Time; p2: number } | null = null;

  /** 鼠标移动: 更新预览。返回是否实际生成/更新了预览对象。 */
  handleMouseMove(time: Time | null, price: number | null): boolean {
    // 2026-09-02: 拒绝非 number 时间戳 (BusinessDay), 避免残留鼠标位脏数据导致
    // ParallelChannel 预览渲染 NaN。直接清空 mouseTime + preview 让下一次合法
    // move 事件重新生成预览。
    const validTime = time !== null && typeof time === 'number' ? time : null;
    this.mouseTime = validTime;
    this.mousePrice = price ?? 0;
    if (this.activeTool === TOOL.NONE || !validTime || price === null) {
      if (this.preview) { this.preview = null; this.redraw(); return true; }
      return false;
    }
    // 生成预览对象 (validTime 已保证是 number, 可安全赋给 t2/t3)
    if ((this.activeTool === TOOL.TRENDLINE) && this.pendingPoints.length === 1) {
      this.preview = {
        type: TOOL.TRENDLINE,
        t1: this.pendingPoints[0].t, p1: this.pendingPoints[0].p,
        t2: validTime, p2: price,
      } as TrendLine;
      this.redraw();
      return true;
    } else if (this.activeTool === TOOL.FIBON_RET && this.pendingPoints.length === 1) {
      this.preview = {
        type: TOOL.FIBON_RET,
        t1: this.pendingPoints[0].t, p1: this.pendingPoints[0].p,
        t2: validTime, p2: price,
      } as FibRet;
      this.redraw();
      return true;
    } else if (this.activeTool === TOOL.FIBON_PRO && this.pendingPoints.length >= 1 && this.pendingPoints.length < 3) {
      if (this.pendingPoints.length === 1) {
        this.preview = {
          type: TOOL.FIBON_PRO,
          t1: this.pendingPoints[0].t, p1: this.pendingPoints[0].p,
          t2: validTime, p2: price, t3: validTime, p3: price,
        } as FibPro;
      } else {
        this.preview = {
          type: TOOL.FIBON_PRO,
          t1: this.pendingPoints[0].t, p1: this.pendingPoints[0].p,
          t2: this.pendingPoints[1].t, p2: this.pendingPoints[1].p,
          t3: validTime, p3: price,
        } as FibPro;
      }
      this.redraw();
      return true;
    } else if (this.activeTool === TOOL.PARALLEL_CHANNEL && this.pendingPoints.length >= 1 && this.pendingPoints.length < 3) {
      // 平行通道预览: 第1击后 P2/P3 都跟随光标 (P2==P3 四边形退化 → 渲染层只画 P1→光标 的左边线段);
      // 第2击后仅 P3 跟随光标 (完整平行四边形预览)
      if (this.pendingPoints.length === 1) {
        this.preview = {
          type: TOOL.PARALLEL_CHANNEL,
          t1: this.pendingPoints[0].t, p1: this.pendingPoints[0].p,
          t2: validTime, p2: price, t3: validTime, p3: price,
        } as ParallelChannel;
      } else {
        this.preview = {
          type: TOOL.PARALLEL_CHANNEL,
          t1: this.pendingPoints[0].t, p1: this.pendingPoints[0].p,
          t2: this.pendingPoints[1].t, p2: this.pendingPoints[1].p,
          t3: validTime, p3: price,
        } as ParallelChannel;
      }
      this.redraw();
      return true;
    }
    return false;
  }

  /**
   * 2026-09-01：移动端全局显隐开关。false 时渲染器跳过所有对象，含选中锚点。
   * 不影响 objects 数组本身 — 抽屉关闭后再打开可恢复显示。
   */
  setVisible(v: boolean): void {
    if (this.visible === v) return;
    this.visible = v;
    // 2026-09-04：逐对象 hidden 标记 — 翻转显隐开关时, 仅对当下已存在的对象 (m.objects)
    // 设置/清除 hidden。新 push 的对象保持 undefined → 视为可见。这才是用户语义:
    // "隐藏当前所有画线, 新画的依然可见, 直到再次点击隐藏"。
    if (!v) {
      for (const obj of this.objects) obj.hidden = true;
      // 2026-09-04：隐藏时同步清选中态 — 隐藏对象在 UI 上不存在, 选中无意义。
      // 移动端删除 FAB 完全靠 selected 驱动, 必须把 React state 也清掉, 但这里只能
      // 清 mgr.selected; 外层 effect 会通过 hitTestObject 或显式同步清 React state。
      this.selected = null;
    } else {
      for (const obj of this.objects) obj.hidden = false;
    }
    // 2026-09-11：hidden 标记翻转后通知文字框监听器 — TextBoxLayer 现按 box.hidden
    // 逐对象过滤（不再整层卸载），需要新的 textBoxes 数组引用触发 memo 层重渲染。
    this.notifyTextBoxesChanged();
    this.redraw();
  }

  /**
   * 2026-09-01：选中态切换。传入 null 取消选中。
   * 选中由渲染器在已有 objects 之上叠加锚点绘制，不修改 objects。
   */
  selectObject(index: number | null): void {
    if (this.selected === index) return;
    this.selected = index;
    this.redraw();
  }

  /**
   * 2026-09-01：按下标删除任意对象。
   * 与 undoLast 类似，但允许按任意下标删除，并同步选中态：
   *   - 删除后若 selected >= 删除点下标，selected--，否则 selected=deleted 失效则置 null
   *   - TextBox 被删时通知监听器
   */
  deleteObject(index: number): boolean {
    const obj = this.objects[index];
    if (!obj) return false;
    this.objects.splice(index, 1);
    // 选中态同步：删除点之前的下标不受影响；删除点及其后下标需前移 1
    if (this.selected !== null) {
      if (index === this.selected) this.selected = null;
      else if (this.selected > index) this.selected = this.selected - 1;
    }
    if (obj.type === TOOL.TEXTBOX) this.notifyTextBoxesChanged();
    // 2026-09-07：通知通用对象监听器, 让 UI 侧同步每类计数
    this.notifyObjectsChanged();
    this.redraw();
    return true;
  }

  /**
   * 2026-09-01：屏幕坐标 (px, py) 命中测试，返回 m.objects 中命中的下标或 null。
   * 仅在主图可见区域内检测，按"后绘制的优先"顺序匹配。
   * 距离阈值 threshold=12 px；通道对象额外支持填充区内命中。
   */
  hitTestObject(px: number, py: number, threshold = 12): number | null {
    if (!this.chart || !this.series) return null;
    // 2026-09-04：移除全局 visible 短路 — 改为逐对象 hidden 标记判断。
    // 隐藏状态下, 仅 skip 标了 hidden 的对象; 新画的 (hidden=undefined) 仍可点选。
    const ts = this.chart.timeScale();
    // 从后往前匹配（最后绘制的在最上层，优先被选中）
    for (let i = this.objects.length - 1; i >= 0; i--) {
      const obj = this.objects[i];
      // 跳过已标记 hidden 的对象 — 与渲染器一致, 隐藏对象不可点选
      if (obj.hidden) continue;
      if (this.hitTestSingle(obj, px, py, threshold, ts)) return i;
    }
    return null;
  }

  private hitTestSingle(obj: DrawObject, px: number, py: number, threshold: number, ts: any): boolean {
    if (!this.series) return false;
    const xy = (t: Time, p: number): [number, number] | null => {
      const x = ts.timeToCoordinate(t);
      const y = this.series!.priceToCoordinate(p);
      if (x === null || y === null) return null;
      return [x as number, y as number];
    };
    // 点到线段距离
    const segDist = (a: [number, number], b: [number, number]): number => {
      const [x1, y1] = a, [x2, y2] = b;
      const dx = x2 - x1, dy = y2 - y1;
      const len2 = dx * dx + dy * dy;
      let t = len2 === 0 ? 0 : ((px - x1) * dx + (py - y1) * dy) / len2;
      t = Math.max(0, Math.min(1, t));
      const cx = x1 + t * dx, cy = y1 + t * dy;
      return Math.hypot(px - cx, py - cy);
    };
    // 点到水平线段距离 (y 坐标固定；调用方传入的左右端点顺序不受限制)
    const horizSegDist = (yLine: number, x1: number, x2: number): number => {
      const left = Math.min(x1, x2);
      const right = Math.max(x1, x2);
      const cx = Math.max(Math.min(px, right), left);
      return Math.hypot(px - cx, py - yLine);
    };

    if (obj.type === TOOL.TRENDLINE) {
      const a = xy(obj.t1, obj.p1), b = xy(obj.t2, obj.p2);
      if (!a || !b) return false;
      return segDist(a, b) <= threshold;
    }
    if (obj.type === TOOL.PARALLEL_CHANNEL) {
      // 命中两条通道线 (下边 P1→P4 / 上边 P2→P3) + 四边形填充区 (P1→P2→P3→P4)
      const c = channelCorners(obj);
      const a = xy(c.t1, c.p1);   // P1 左下
      const b = xy(c.t2, c.p2);   // P2 左上
      const p3c = xy(c.t3, c.p3); // P3 右上
      const d = xy(c.t4, c.p4);   // P4 右下 (自动推算)
      if (!a || !b || !p3c || !d) return false;
      // 1) 边线命中
      if (segDist(a, d) <= threshold) return true;   // 下边 P1→P4
      if (segDist(b, p3c) <= threshold) return true; // 上边 P2→P3
      // 2) 填充区命中 (平行四边形点 in polygon; 顶点按边界顺序 P1→P2→P3→P4)
      const inPoly = (P: [number, number], A: [number, number], B: [number, number],
                     C: [number, number], D: [number, number]): boolean => {
        const sign = (p1: [number, number], p2: [number, number], p3: [number, number]) =>
          (p1[0] - p3[0]) * (p2[1] - p3[1]) - (p2[0] - p3[0]) * (p1[1] - p3[1]);
        const d1 = sign(P, A, B), d2 = sign(P, B, C), d3 = sign(P, C, D), d4 = sign(P, D, A);
        const hasNeg = (d1 < 0) || (d2 < 0) || (d3 < 0) || (d4 < 0);
        const hasPos = (d1 > 0) || (d2 > 0) || (d3 > 0) || (d4 > 0);
        return !(hasNeg && hasPos);
      };
      return inPoly([px, py], a, b, p3c, d);
    }
    if (obj.type === TOOL.FIBON_PRO) {
      // 命中范围与 drawFibProjection 完全一致：从三点最左侧锚点延伸到图表右缘。
      const x1 = ts.timeToCoordinate(obj.t1);
      const x2 = ts.timeToCoordinate(obj.t2);
      const x3 = ts.timeToCoordinate(obj.t3);
      if (x1 === null || x2 === null || x3 === null) return false;
      const left = Math.min(x1 as number, x2 as number, x3 as number);
      const rightEdge = ts.width() - 1;
      for (const level of fibProjectionLevels(obj)) {
        const y = this.series.priceToCoordinate(level.price);
        if (y === null) continue;
        if (horizSegDist(y as number, left, rightEdge) <= threshold) return true;
      }

      // P1→P2、P2→P3 两条虚线路径同样支持点选/删除/拖拽。
      const a = xy(obj.t1, obj.p1);
      const b = xy(obj.t2, obj.p2);
      const c = xy(obj.t3, obj.p3);
      if (a && b && segDist(a, b) <= threshold) return true;
      return !!b && !!c && segDist(b, c) <= threshold;
    }
    if (obj.type === TOOL.FIBON_RET) {
      const xStart = ts.timeToCoordinate(obj.t1);
      const xEnd = ts.timeToCoordinate(obj.t2);
      if (xStart === null || xEnd === null) return false;
      // 与 drawFib 一致：两锚点时间范围内的 7 条水平线段
      const left = Math.min(xStart as number, xEnd as number);
      const right = Math.max(xStart as number, xEnd as number);
      for (const level of fibRetracementLevels(obj)) {
        const y = this.series.priceToCoordinate(level.price);
        if (y === null) continue;
        if (horizSegDist(y as number, left, right) <= threshold) return true;
      }
      // P1→P2 虚线基线同样支持点选/删除/拖拽。
      const a = xy(obj.t1, obj.p1);
      const b = xy(obj.t2, obj.p2);
      return !!a && !!b && segDist(a, b) <= threshold;
    }
    // 其他类型（文本框/平行线等）暂不参与单条删除：文本框用现有 Layer；平行线工具未在移动端抽屉暴露
    return false;
  }

  /**
   * 2026-09-02: 锚点字段键表 — 顺序与 drawAnchors / drawPendingAnchors 一致。
   * 支持锚点拖拽的绘图类型; 其他类型返回 null。
   */
  private anchorKeysFor(obj: DrawObject): Array<[string, string]> | null {
    if (obj.type === TOOL.TRENDLINE || obj.type === TOOL.FIBON_RET) {
      return [['t1', 'p1'], ['t2', 'p2']];
    }
    if (obj.type === TOOL.FIBON_PRO) {
      return [['t1', 'p1'], ['t2', 'p2'], ['t3', 'p3']];
    }
    if (obj.type === TOOL.PARALLEL_CHANNEL) {
      // 锚点顺序: 左下 / 左上 / 右上 (右下角自动推算, 拖动前三角即重算)
      return [['t1', 'p1'], ['t2', 'p2'], ['t3', 'p3']];
    }
    return null;
  }

  /**
   * 2026-09-02: 命中当前选中对象的锚点 (白色圆点)。返回锚点下标 (0/1/2) 或 null。
   * 触屏阈值默认 24px — 锚点半径仅 5px, 手指命中区必须放大。
   */
  hitTestSelectedAnchor(px: number, py: number, threshold = 24): number | null {
    if (!this.chart || !this.series) return null;
    if (this.selected === null) return null;
    const obj = this.objects[this.selected];
    if (!obj) return null;
    const keys = this.anchorKeysFor(obj);
    if (!keys) return null;
    const ts = this.chart.timeScale();
    let best = -1;
    let bestD = Infinity;
    for (let i = 0; i < keys.length; i++) {
      const x = ts.timeToCoordinate((obj as any)[keys[i][0]]);
      const y = this.series.priceToCoordinate((obj as any)[keys[i][1]]);
      if (x === null || y === null) continue;
      const d = Math.hypot(px - (x as number), py - (y as number));
      if (d < bestD) { bestD = d; best = i; }
    }
    return bestD <= threshold ? best : null;
  }

  /**
   * 2026-09-02: 移动指定对象的锚点 (移动端手指拖动调整已画线条)。
   * anchorIdx 与 drawAnchors 的锚点顺序一致; 立即重绘让线条实时跟随。
   */
  moveObjectAnchor(index: number, anchorIdx: number, time: Time, price: number): boolean {
    const obj = this.objects[index];
    if (!obj) return false;
    const keys = this.anchorKeysFor(obj);
    if (!keys || anchorIdx < 0 || anchorIdx >= keys.length) return false;
    // 2026-09-02: 防御 time 为 BusinessDay 对象 — 写入前校验 number, 避免拖动时
    // 某个锚点被改成 NaN, 通道变成不可绘制的状态。
    if (typeof time !== 'number' || !Number.isFinite(price)) return false;
    (obj as any)[keys[anchorIdx][0]] = time;
    (obj as any)[keys[anchorIdx][1]] = price;
    this.redraw();
    return true;
  }

  /**
   * 2026-09-02: 整体平移指定对象 (移动端手指拖动主体 — 非锚点 — 整体平移通道)。
   * dt/dPrice 是数据坐标增量 (Time 是数字 UTC 时间戳, 直接相加)。
   * 平行通道右下角由 channelCorners 现算, 不需显式更新。
   * 立即重绘让通道实时跟随。
   */
  moveObject(index: number, dt: number, dPrice: number): boolean {
    // 2026-09-02: 防御 NaN/±Infinity 输入 — tp.time 若为 BusinessDay 对象 (coordinateToTime
    // 在某些时间尺度下可能返回), 强制 cast number 后相减得 NaN, 污染 t1/t2/t3 导致整条
    // channel 不可绘制 (拖拽变形的关键源头)。非有限值直接拒绝, 不修改 obj。
    if (!Number.isFinite(dt) || !Number.isFinite(dPrice)) return false;
    const obj = this.objects[index];
    if (!obj) return false;
    const keys = this.anchorKeysFor(obj);
    if (!keys) return false;
    for (const [tk, pk] of keys) {
      (obj as any)[tk] = ((obj as any)[tk] as number) + dt;
      (obj as any)[pk] = (obj as any)[pk] + dPrice;
    }
    this.redraw();
    return true;
  }

  /**
   * 2026-09-02: 命中进行中画线的蓝色待定锚点。仅计当前工具有效个数 (两点工具 2 / 通道 3)。
   */
  hitTestPendingAnchor(px: number, py: number, threshold = 24): number | null {
    if (!this.chart || !this.series) return null;
    if (this.pendingPoints.length === 0) return null;
    const max =
      this.activeTool === TOOL.TRENDLINE || this.activeTool === TOOL.FIBON_RET ? 2 :
      this.activeTool === TOOL.FIBON_PRO || this.activeTool === TOOL.PARALLEL_CHANNEL ? 3 : 0;
    if (max === 0) return null;
    const count = Math.min(this.pendingPoints.length, max);
    const ts = this.chart.timeScale();
    let best = -1;
    let bestD = Infinity;
    for (let i = 0; i < count; i++) {
      const a = this.pendingPoints[i];
      const x = ts.timeToCoordinate(a.t);
      const y = this.series.priceToCoordinate(a.p);
      if (x === null || y === null) continue;
      const d = Math.hypot(px - (x as number), py - (y as number));
      if (d < bestD) { bestD = d; best = i; }
    }
    return bestD <= threshold ? best : null;
  }

  /** 2026-09-02: 移动待定锚点 (画线中途调整已落点)。 */
  movePendingAnchor(anchorIdx: number, time: Time, price: number): boolean {
    if (anchorIdx < 0 || anchorIdx >= this.pendingPoints.length) return false;
    // 2026-09-02: 拒绝非 number 时间戳, 避免 BusinessDay 污染 pendingPoints,
    // 进而导致 ParallelChannel handleClick 时 t1/t2/t3 为对象 → 中线 / 通道无法渲染。
    if (typeof time !== 'number') return false;
    this.pendingPoints[anchorIdx] = { t: time, p: price };
    this.redraw();
    return true;
  }

  /**
   * 2026-09-01：当前工具定点进度。返回 { tool, placed, total } 或 null（无工具/工具无需定点）。
   * 用于移动端顶部持续分步提示条：
   *   趋势线 (2 点): "请点击放置起点 (0/2)" / "点击放置终点 (1/2)" / "已完成"
   *   平行通道 (3 点): "点击放置左下角 (0/3)" / "点击放置左上角 (1/3)" / "点击放置右上角 (2/3)"
   *   斐波那契回调 (2 点): "请点击放置起点 (0/2)" / "点击确定回调终点 (1/2)"
   * NONE 工具或点击阶段已满（clickStage=0 但 pendingPoints.length=0 完成态）时返回 null。
   */
  getDrawProgress(toolOverride?: number): { tool: number; placed: number; total: number } | null {
    // 2026-09-02: 支持外部传入工具 — React 侧提示 effect 可能先于 setTool 执行,
    // 直接读 this.activeTool 会拿到旧工具的 total, 造成 0/2 与 0/3 错位
    const tool = toolOverride !== undefined ? toolOverride : this.activeTool;
    if (tool === TOOL.NONE) return null;
    const total =
      tool === TOOL.TRENDLINE ? 2 :
      tool === TOOL.PARALLEL_CHANNEL ? 3 :
      tool === TOOL.PARALLEL_LINE ? 3 :
      tool === TOOL.FIBON_RET ? 2 :
      tool === TOOL.FIBON_PRO ? 3 :
      tool === TOOL.TEXTBOX ? 1 :
      0;
    if (total === 0) return null;
    // PARALLEL_LINE 三击 (其中第二击建立 pendingParallelBase) — 按用户视角统一为 3 点进度
    const placed = this.pendingPoints.length;
    // 若 placed 已达 total，表示该对象已提交 — 返回 null 让上层展示"已完成"逻辑
    if (placed >= total) return null;
    return { tool, placed, total };
  }

  /**
   * 文本框: 由 ChartPanel 触发创建。空文字表示"占位待输入"。
   * 返回新建文字框的下标；超出 TEXTBOX 上限（2026-07-31: 5 个）时返回 -1，
   * 由 ChartPanel 据此触发 toast 提示。
   */
  addTextBox(time: Time, price: number, text = ''): number {
    if (countByType(this.objects, TOOL.TEXTBOX) >= MAX_PER_TYPE) {
      return -1;
    }
    this.objects.push({ type: TOOL.TEXTBOX, t: time, p: price, text });
    const idx = this.objects.length - 1;
    this.redraw();
    this.notifyTextBoxesChanged();
    // 2026-09-07：通知通用对象监听器, 让 UI 侧同步每类计数
    this.notifyObjectsChanged();
    return idx;
  }

  /** 更新文字框文本。传空字符串保留空白；传 null 表示删除空框。返回是否真的写入了。 */
  updateTextBox(index: number, text: string | null): boolean {
    const obj = this.objects[index];
    if (!obj || obj.type !== TOOL.TEXTBOX) return false;
    const removed = text === null;
    if (removed) {
      this.objects.splice(index, 1);
    } else {
      (obj as TextBox).text = text;
    }
    this.redraw();
    this.notifyTextBoxesChanged();
    // 2026-09-07：删除路径才需要通知对象计数变化, 文本写入不改变 type 分布
    if (removed) this.notifyObjectsChanged();
    return true;
  }

  /** 按下标删除文字框。 */
  deleteTextBox(index: number): boolean {
    return this.updateTextBox(index, null);
  }

  /** 拖动后修改文字框的锚点 (time, price)。 */
  moveTextBox(index: number, time: Time, price: number): boolean {
    const obj = this.objects[index];
    if (!obj || obj.type !== TOOL.TEXTBOX) return false;
    (obj as TextBox).t = time;
    (obj as TextBox).p = price;
    this.redraw();
    this.notifyTextBoxesChanged();
    return true;
  }

  /** 命中测试: 把屏幕坐标 (px) 转换为 (time, price)，再判断是否落在某个文字框的可见矩形内。返回下标或 null。 */
  hitTestTextBox(px: number, py: number, boxWidth = 120, boxHeight = 28): number | null {
    if (!this.chart || !this.series) return null;
    const ts = this.chart.timeScale();
    const coord = this.series.priceToCoordinate(0);
    void coord;
    for (let i = this.objects.length - 1; i >= 0; i--) {
      const o = this.objects[i];
      if (o.type !== TOOL.TEXTBOX) continue;
      // 2026-09-11：与 hitTestObject 一致 — 隐藏的文字框不可被点选（否则会弹出
      // 不可见的选中框与删除 FAB）。
      if (o.hidden) continue;
      const x = ts.timeToCoordinate(o.t);
      const y = this.series.priceToCoordinate(o.p);
      if (x === null || y === null) continue;
      // 文字框默认左上角对齐锚点，向右下扩展 boxWidth/boxHeight
      if (px >= (x as number) && px <= (x as number) + boxWidth
          && py >= (y as number) && py <= (y as number) + boxHeight) {
        return i;
      }
    }
    return null;
  }

  /**
   * 2026-09-02：暴露进行中的触屏定点（只读快照），用于 hook 层在 tap 后
   * 同步刷新步骤提示与"已完成"动画状态。
   */
  getPendingPoints(): ReadonlyArray<{ t: Time; p: number }> {
    return this.pendingPoints;
  }

  /**
   * 2026-08-05：返回当前所有文字框 (快照)，附 objects 数组下标。
   * 之前只返回过滤后的纯数组，与 addTextBox/updateTextBox/deleteTextBox/
   * moveTextBox 的 objects 下标入参是两套语义 — 文字框前存在画线等对象时
   * 编辑/删除/拖动会命中错误对象。统一以 objects 下标为准。
   */
  getTextBoxes(): Array<{ box: TextBox; index: number }> {
    const out: Array<{ box: TextBox; index: number }> = [];
    for (let i = 0; i < this.objects.length; i++) {
      const o = this.objects[i];
      if (o.type === TOOL.TEXTBOX) out.push({ box: o as TextBox, index: i });
    }
    return out;
  }

  /** 订阅文字框变更 (新增/编辑/删除)。 */
  subscribeTextBoxesChanged(fn: () => void): () => void {
    this.textBoxListeners.add(fn);
    return () => this.textBoxListeners.delete(fn);
  }

  private notifyTextBoxesChanged(): void {
    this.textBoxListeners.forEach((fn) => fn());
  }

  // 2026-09-07：通用对象变化订阅 — 任何 objects 数组突变后通知, UI 侧可据此重算每类计数。
  subscribeObjectsChanged(fn: () => void): () => void {
    this.objectListeners.add(fn);
    return () => this.objectListeners.delete(fn);
  }

  private notifyObjectsChanged(): void {
    this.objectListeners.forEach((fn) => fn());
  }

  getActiveTool(): number {
    return this.activeTool;
  }

  private reset(): void {
    this.clickStage = 0;
    this.pendingPoints = [];
    this.preview = null;
  }

  private redraw(): void {
    // 2026-09-02: 优先用 requestUpdate (v5 primitive 重绘标准入口),
    // chart 在下一帧会回调 updateAllViews()/draw()。旧 chart.applyOptions({})
    // 在 options 未变时不触发 primitive update, 是 50% 中线偶发缺失 / 拖拽变形
    // 的根因。requestUpdate 不可用时回退到 applyOptions 并一次性 console.warn,
    // 帮助开发者定位 attached() 未正确注入的异常路径。
    if (this.requestUpdateFn) {
      this.requestUpdateFn();
    } else {
      if (!this.fallbackWarned) {
        console.warn(
          '[DrawingManager] requestUpdate 不可用, 回退到 chart.applyOptions({}) — ' +
          'primitive 重绘可能不可靠。请检查 attached(param) 是否被 chart 调用。',
        );
        this.fallbackWarned = true;
      }
      this.chart?.applyOptions({});
    }
  }

  // ISeriesPrimitive 实现
  updateAllViews(): void {}
  paneViews(): readonly IPrimitivePaneView[] {
    return [this.paneView];
  }
  attached(param: any): void {
    this.chart = param.chart;
    this.series = param.series;
    // 2026-09-02: 保存 requestUpdate 用于可靠触发 redraw (替代 chart.applyOptions({}))
    this.requestUpdateFn = typeof param?.requestUpdate === 'function'
      ? param.requestUpdate
      : null;
  }
  detached(): void {
    this.chart = null;
    this.series = null;
    this.requestUpdateFn = null;
  }
}
