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
  t1: Time; p1: number;  // start
  t2: Time; p2: number;  // mid
  t3: Time; p3: number;  // end (投射起点)
}
interface TextBox extends BaseDraw {
  type: typeof TOOL.TEXTBOX;
  t: Time; p: number;
  text: string;
}
interface ParallelChannel extends BaseDraw {
  type: typeof TOOL.PARALLEL_CHANNEL;
  t1: Time; p1: number;  // 基线起点 (斜率由 t1→t2 决定)
  t2: Time; p2: number;  // 基线终点
  t3: Time; p3: number;  // 第二条线锚点 (相对 t1 的平移量作用于 t2)
}

type DrawObject = TrendLine | ParallelLine | FibRet | FibPro | TextBox | ParallelChannel;

// ---- 渲染器 ----

class DrawingRenderer implements IPrimitivePaneRenderer {
  constructor(private mgr: DrawingManager) {}

  draw(target: any): void {
    const m = this.mgr;
    if (!m.chart || !m.series) return;
    const ts = m.chart.timeScale();

    target.useBitmapCoordinateSpace((space: any) => {
      const ctx = space.context;
      ctx.save();
      ctx.scale(space.horizontalPixelRatio, space.verticalPixelRatio);

      const drawAll = (objects: DrawObject[]) => {
        for (const obj of objects) {
          this.drawObject(ctx, ts, obj);
        }
      };

      // 已提交对象
      drawAll(m.objects);

      // 预览中的对象 (鼠标拖动时)
      if (m.preview) this.drawObject(ctx, ts, m.preview);

      ctx.restore();
    });
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
      this.drawFib(ctx, ts, obj as FibRet, true);
    } else if (obj.type === TOOL.FIBON_PRO) {
      this.drawFib(ctx, ts, obj as FibPro, false);
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

  /** 斐波那契: 画水平线 + 价格标签。 */
  private drawFib(ctx: CanvasRenderingContext2D, ts: any, fib: FibRet | FibPro, isRet: boolean): void {
    const m = this.mgr;
    let start: number, end: number, ratios: number[], color: string, startX: Time;
    if (isRet) {
      const f = fib as FibRet;
      start = f.p1; end = f.p2;  // 100% → 0%
      ratios = FIB_RE_RATIOS;
      color = COLORS.FIB_RE;
      startX = f.t1;
    } else {
      const f = fib as FibPro;
      start = f.p2; end = f.p3;  // 从 mid 投射
      ratios = FIB_PR_RATIOS;
      color = COLORS.FIB_PR;
      startX = f.t2;
    }
    const sign = start > end ? 1 : -1;
    const diff = Math.abs(start - end);
    const xStart = ts.timeToCoordinate(startX);
    if (xStart === null) return;
    // 有限段: 从 xStart 到 p2 对应的 xEnd (即第二条端点的时间坐标)
    const endXTime = isRet ? (fib as FibRet).t2 : (fib as FibPro).t3;
    const xEnd = ts.timeToCoordinate(endXTime);
    if (xEnd === null) return;

    for (const ratio of ratios) {
      const price = sign * diff * ratio + end;
      const y = m.series!.priceToCoordinate(price);
      if (y === null) continue;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 2]);
      ctx.beginPath();
      ctx.moveTo(xStart as number, y as number);
      ctx.lineTo(xEnd as number, y as number);
      ctx.stroke();
      ctx.setLineDash([]);
      // 价格标签 (贴在右端点上方)
      ctx.fillStyle = color;
      ctx.font = '11px Arial';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`${price.toFixed(m.decimals)} (${ratio})`, (xEnd as number) - 80, (y as number) - 2);
    }
  }

  /**
   * 平行通道 (Parallel Channel):
   *   - t1/p1, t2/p2 定义基线 (决定斜率)
   *   - t3/p3 定义通道宽度: 取 t3 到基线在同一时刻的价格差作为固定价格偏移
   *   - 上下两根线端点在同一垂直线上 (t1/t2), 形成平行四边形
   *   - 视觉: 两条平行有限段 + 半透明填充 + 中线虚线 (不再延伸到右边缘)
   */
  private drawParallelChannel(
    ctx: CanvasRenderingContext2D, ts: any, ch: ParallelChannel,
  ): void {
    const m = this.mgr;
    const x1 = ts.timeToCoordinate(ch.t1);
    const x2 = ts.timeToCoordinate(ch.t2);
    const x3 = ts.timeToCoordinate(ch.t3);
    if (x1 === null || x2 === null || x3 === null) return;
    const y1 = m.series!.priceToCoordinate(ch.p1);
    const y2 = m.series!.priceToCoordinate(ch.p2);
    const y3 = m.series!.priceToCoordinate(ch.p3);
    if (y1 === null || y2 === null || y3 === null) return;

    const x1n = x1 as number, x2n = x2 as number;
    const y1n = y1 as number, y2n = y2 as number;

    // 固定价格偏移: 使第二条线与基线平行, 并在 t3 时刻经过 p3
    const t1n = ch.t1 as number;
    const t2n = ch.t2 as number;
    const t3n = ch.t3 as number;
    const dt = t2n - t1n;
    let ratio = 0;
    if (dt !== 0) {
      ratio = (t3n - t1n) / dt;
    }
    const baseP3 = ch.p1 + (ch.p2 - ch.p1) * ratio;
    const priceOffset = ch.p3 - baseP3;

    // 第二条线与基线在同一时间范围 (x1/x2), 端点在同一垂直线上
    const y1p = m.series!.priceToCoordinate(ch.p1 + priceOffset);
    const y2p = m.series!.priceToCoordinate(ch.p2 + priceOffset);
    if (y1p === null || y2p === null) return;
    const y1pn = y1p as number, y2pn = y2p as number;

    // 1. 半透明填充 (基线两端 + 平移后两端)
    ctx.fillStyle = COLORS.CHANNEL_FILL;
    ctx.beginPath();
    ctx.moveTo(x1n, y1n);
    ctx.lineTo(x2n, y2n);
    ctx.lineTo(x2n, y2pn);
    ctx.lineTo(x1n, y1pn);
    ctx.closePath();
    ctx.fill();

    // 2. 两条平行有限线段 (实线)
    ctx.strokeStyle = COLORS.CHANNEL_LINE;
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(x1n, y1n);
    ctx.lineTo(x2n, y2n);
    ctx.moveTo(x1n, y1pn);
    ctx.lineTo(x2n, y2pn);
    ctx.stroke();

    // 3. 中线虚线
    const y1Mid = m.series!.priceToCoordinate(ch.p1 + priceOffset / 2);
    const y2Mid = m.series!.priceToCoordinate(ch.p2 + priceOffset / 2);
    if (y1Mid !== null && y2Mid !== null) {
      ctx.setLineDash([4, 2]);
      ctx.beginPath();
      ctx.moveTo(x1n, y1Mid as number);
      ctx.lineTo(x2n, y2Mid as number);
      ctx.stroke();
      ctx.setLineDash([]);
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
  objects: DrawObject[] = [];
  preview: DrawObject | null = null;
  decimals = 2;

  // 交互状态机
  private activeTool: number = TOOL.NONE;
  private clickStage = 0;          // 当前点击阶段 (0/1/2)
  private pendingPoints: { t: Time; p: number }[] = [];
  private mouseTime: Time | null = null;
  private mousePrice = 0;

  // 2026-07-27：文字框变更订阅 — ChartPanel 用来把文字框同步到 React state
  private textBoxListeners: Set<() => void> = new Set();

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
    // 即时动作 (清除类)
    if (tool === TOOL.CLEAR_ONELINE) { this.objects.pop(); this.redraw(); }
    else if (tool === TOOL.CLEAR_ALLLINE) {
      this.objects = this.objects.filter(o =>
        o.type === TOOL.TEXTBOX
        || o.type === TOOL.FIBON_RET
        || o.type === TOOL.FIBON_PRO
        || o.type === TOOL.PARALLEL_CHANNEL,
      );
      this.redraw();
    }
    else if (tool === TOOL.CLEAR_FIBON) { this.objects = this.objects.filter(o => o.type !== TOOL.FIBON_RET && o.type !== TOOL.FIBON_PRO); this.redraw(); }
    else if (tool === TOOL.CLEAR_ONETEXT) { this.removeLastByType(TOOL.TEXTBOX); this.redraw(); }
    else if (tool === TOOL.CLEAR_ALLTEXT) { this.objects = this.objects.filter(o => o.type !== TOOL.TEXTBOX); this.redraw(); }
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
    this.redraw();
    if (hadTextBox) this.notifyTextBoxesChanged();
    return true;
  }

  /**
   * 2026-07-30：右键取消当前正在进行的画线操作。
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
        this.reset();
        this.redraw();
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
      this.reset();
      this.redraw();
    } else if (this.activeTool === TOOL.PARALLEL_CHANNEL) {
      if (this.pendingPoints.length === 3) {
        this.objects.push({
          type: TOOL.PARALLEL_CHANNEL,
          t1: this.pendingPoints[0].t, p1: this.pendingPoints[0].p,
          t2: this.pendingPoints[1].t, p2: this.pendingPoints[1].p,
          t3: this.pendingPoints[2].t, p3: this.pendingPoints[2].p,
        } as ParallelChannel);
        this.reset();
        this.redraw();
      }
    } else if (this.activeTool === TOOL.FIBON_RET) {
      if (this.pendingPoints.length === 2) {
        this.objects.push({
          type: TOOL.FIBON_RET,
          t1: this.pendingPoints[0].t, p1: this.pendingPoints[0].p,
          t2: this.pendingPoints[1].t, p2: this.pendingPoints[1].p,
        } as FibRet);
        this.reset();
        this.redraw();
      }
    } else if (this.activeTool === TOOL.FIBON_PRO) {
      if (this.pendingPoints.length === 3) {
        this.objects.push({
          type: TOOL.FIBON_PRO,
          t1: this.pendingPoints[0].t, p1: this.pendingPoints[0].p,
          t2: this.pendingPoints[1].t, p2: this.pendingPoints[1].p,
          t3: this.pendingPoints[2].t, p3: this.pendingPoints[2].p,
        } as FibPro);
        this.reset();
        this.redraw();
      }
    }
    return true;
  }

  private pendingParallelBase: { t1: Time; p1: number; t2: Time; p2: number } | null = null;

  /** 鼠标移动: 更新预览。 */
  handleMouseMove(time: Time | null, price: number | null): void {
    this.mouseTime = time;
    this.mousePrice = price ?? 0;
    if (this.activeTool === TOOL.NONE || !time || price === null) {
      if (this.preview) { this.preview = null; this.redraw(); }
      return;
    }
    // 生成预览对象
    if ((this.activeTool === TOOL.TRENDLINE) && this.pendingPoints.length === 1) {
      this.preview = {
        type: TOOL.TRENDLINE,
        t1: this.pendingPoints[0].t, p1: this.pendingPoints[0].p,
        t2: time, p2: price,
      } as TrendLine;
      this.redraw();
    } else if (this.activeTool === TOOL.FIBON_RET && this.pendingPoints.length === 1) {
      this.preview = {
        type: TOOL.FIBON_RET,
        t1: this.pendingPoints[0].t, p1: this.pendingPoints[0].p,
        t2: time, p2: price,
      } as FibRet;
      this.redraw();
    } else if (this.activeTool === TOOL.FIBON_PRO && this.pendingPoints.length >= 1 && this.pendingPoints.length < 3) {
      if (this.pendingPoints.length === 1) {
        this.preview = {
          type: TOOL.FIBON_PRO,
          t1: this.pendingPoints[0].t, p1: this.pendingPoints[0].p,
          t2: time, p2: price, t3: time, p3: price,
        } as FibPro;
      } else {
        this.preview = {
          type: TOOL.FIBON_PRO,
          t1: this.pendingPoints[0].t, p1: this.pendingPoints[0].p,
          t2: this.pendingPoints[1].t, p2: this.pendingPoints[1].p,
          t3: time, p3: price,
        } as FibPro;
      }
      this.redraw();
    } else if (this.activeTool === TOOL.PARALLEL_CHANNEL && this.pendingPoints.length >= 1 && this.pendingPoints.length < 3) {
      // 平行通道预览: 第1击后 p2/p3 跟随光标; 第2击后 p3 跟随光标
      if (this.pendingPoints.length === 1) {
        this.preview = {
          type: TOOL.PARALLEL_CHANNEL,
          t1: this.pendingPoints[0].t, p1: this.pendingPoints[0].p,
          t2: time, p2: price, t3: time, p3: price,
        } as ParallelChannel;
      } else {
        this.preview = {
          type: TOOL.PARALLEL_CHANNEL,
          t1: this.pendingPoints[0].t, p1: this.pendingPoints[0].p,
          t2: this.pendingPoints[1].t, p2: this.pendingPoints[1].p,
          t3: time, p3: price,
        } as ParallelChannel;
      }
      this.redraw();
    }
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
    return idx;
  }

  /** 更新文字框文本。传空字符串保留空白；传 null 表示删除空框。返回是否真的写入了。 */
  updateTextBox(index: number, text: string | null): boolean {
    const obj = this.objects[index];
    if (!obj || obj.type !== TOOL.TEXTBOX) return false;
    if (text === null) {
      this.objects.splice(index, 1);
    } else {
      (obj as TextBox).text = text;
    }
    this.redraw();
    this.notifyTextBoxesChanged();
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

  getActiveTool(): number {
    return this.activeTool;
  }

  private reset(): void {
    this.clickStage = 0;
    this.pendingPoints = [];
    this.preview = null;
  }

  private redraw(): void {
    this.updateAllViews();
    this.chart?.applyOptions({});
  }

  // ISeriesPrimitive 实现
  updateAllViews(): void {}
  paneViews(): readonly IPrimitivePaneView[] {
    return [this.paneView];
  }
  attached(param: any): void {
    this.chart = param.chart;
    this.series = param.series;
  }
  detached(): void {
    this.chart = null;
    this.series = null;
  }
}
