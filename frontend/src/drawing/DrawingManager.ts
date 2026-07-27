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
import { TOOL, FIB_RE_RATIOS, FIB_PR_RATIOS, COLORS } from './tools';

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
  // 第二条线由中点平移产生 (交互时第三点定义偏移)
  offset: { dt: number; dp: number };  // 时间偏移(逻辑bar数)、价格偏移
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

type DrawObject = TrendLine | ParallelLine | FibRet | FibPro | TextBox;

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
      // 平行线: 整体平移 offset
      const x1 = ts.timeToCoordinate(o.t1);
      const x2 = ts.timeToCoordinate(o.t2);
      if (x1 !== null && x2 !== null) {
        const y1 = m.series!.priceToCoordinate(o.p1);
        const y2 = m.series!.priceToCoordinate(o.p2);
        if (y1 !== null && y2 !== null) {
          ctx.strokeStyle = COLORS.LINE;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo((x1 as number) + o.offset.dt, y1 as number + o.offset.dp);
          ctx.lineTo((x2 as number) + o.offset.dt, y2 as number + o.offset.dp);
          ctx.stroke();
        }
      }
    } else if (obj.type === TOOL.FIBON_RET) {
      this.drawFib(ctx, ts, obj as FibRet, true);
    } else if (obj.type === TOOL.FIBON_PRO) {
      this.drawFib(ctx, ts, obj as FibPro, false);
    } else if (obj.type === TOOL.TEXTBOX) {
      const o = obj as TextBox;
      const x = ts.timeToCoordinate(o.t);
      const y = m.series!.priceToCoordinate(o.p);
      if (x !== null && y !== null) {
        ctx.fillStyle = COLORS.TEXT;
        ctx.font = '12px Arial';
        ctx.textBaseline = 'top';
        ctx.fillText(o.text, (x as number) + 4, (y as number) + 4);
      }
    }
  }

  /** 趋势射线: 从 p1 延伸到右边缘。 */
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

    // 延伸到可见区右边缘
    const rightEdge = ts.width();
    const slope = ((y2 as number) - (y1 as number)) / ((x2 as number) - (x1 as number));
    const endY = (y1 as number) + slope * (rightEdge - (x1 as number));

    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x1 as number, y1 as number);
    ctx.lineTo(rightEdge, endY);
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
    const rightEdge = ts.width();
    if (xStart === null) return;

    for (const ratio of ratios) {
      const price = sign * diff * ratio + end;
      const y = m.series!.priceToCoordinate(price);
      if (y === null) continue;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 2]);
      ctx.beginPath();
      ctx.moveTo(xStart as number, y as number);
      ctx.lineTo(rightEdge, y as number);
      ctx.stroke();
      ctx.setLineDash([]);
      // 价格标签
      ctx.fillStyle = color;
      ctx.font = '11px Arial';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`${price.toFixed(m.decimals)} (${ratio})`, rightEdge - 80, (y as number) - 2);
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
    else if (tool === TOOL.CLEAR_ALLLINE) { this.objects = this.objects.filter(o => o.type === TOOL.TEXTBOX || o.type === TOOL.FIBON_RET || o.type === TOOL.FIBON_PRO); this.redraw(); }
    else if (tool === TOOL.CLEAR_FIBON) { this.objects = this.objects.filter(o => o.type !== TOOL.FIBON_RET && o.type !== TOOL.FIBON_PRO); this.redraw(); }
    else if (tool === TOOL.CLEAR_ONETEXT) { this.removeLastByType(TOOL.TEXTBOX); this.redraw(); }
    else if (tool === TOOL.CLEAR_ALLTEXT) { this.objects = this.objects.filter(o => o.type !== TOOL.TEXTBOX); this.redraw(); }
  }

  private removeLastByType(type: number): void {
    for (let i = this.objects.length - 1; i >= 0; i--) {
      if (this.objects[i].type === type) { this.objects.splice(i, 1); return; }
    }
  }

  /** 处理点击事件。返回 true 表示该事件被绘图工具消费 (阻止默认行为)。 */
  handleClick(time: Time | null, price: number | null): boolean {
    if (this.activeTool === TOOL.NONE || time === null || price === null) return false;
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
      // 第三点定义平行偏移
      const base = this.pendingParallelBase;
      const midT = base.t1; // 简化: 用起点的中点近似
      const midP = (base.p1 + base.p2) / 2;
      const ts = this.chart!.timeScale();
      const xBase = ts.timeToCoordinate(midT);
      const xNew = ts.timeToCoordinate(this.pendingPoints[2]?.t ?? time);
      const obj: ParallelLine = {
        type: TOOL.PARALLEL_LINE,
        t1: base.t1, p1: base.p1, t2: base.t2, p2: base.p2,
        offset: {
          dt: (xNew as number) - (xBase as number),
          dp: price - midP,
        },
      };
      this.objects.push(obj);
      this.pendingParallelBase = null;
      this.reset();
      this.redraw();
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
    }
  }

  /** 文本框: 由 ChartPanel 弹出输入框后调用。 */
  addTextBox(time: Time, price: number, text: string): void {
    this.objects.push({ type: TOOL.TEXTBOX, t: time, p: price, text });
    this.redraw();
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
