// Prosticks 自定义渲染 Primitive
// 在主图 K 线之上绘制 Prosticks 专属形态:
//   - 模态点 (Modal Point, mp): 红色实心圆
//   - 活跃区 (Active Region, vap/vam): 白/浅蓝填充矩形 + 上下影线
//   - 极端尾 (Extreme Tail, ut/lt): 蓝色粗线段
//
// 移植自旧系统 simplechart.js drawBar() 的 case DEF_PROSTICKS_CHART。
// 颜色对齐: mp=#FF0000, tail=#0000FF, down 填充=#B0D0F0

import type {
  IChartApi,
  ISeriesApi,
  ISeriesPrimitive,
  ISeriesPrimitiveBase,
  IPrimitivePaneView,
  IPrimitivePaneRenderer,
  SeriesAttachedParameter,
  Coordinate,
  Time,
} from 'lightweight-charts';
import type { Bar } from '../../types';

// Prosticks 颜色常量 (对齐旧系统)
const MP_COLOR = '#FF0000';        // 模态点
const IMPMP_COLOR = '#FF0080';     // 重要模态点
const TAIL_COLOR = '#0000FF';      // 极端尾
const DOWN_FILL = '#B0D0F0';       // 下跌柱活跃区填充
const UP_FILL = '#FFFFFF';         // 上涨柱活跃区填充

interface ProsticksPrimitiveOptions {
  enabled: boolean;       // 是否显示 Prosticks 形态 (仅当图表类型为 Prosticks/Bar&Modal 时)
  showActiveRegion: boolean;
  showExtremeTail: boolean;
  showModalPoint: boolean;
  decimals: number;
}

/**
 * Prosticks 形态渲染器 (实现 IPrimitivePaneRenderer)。
 * 每个 bar 在时间轴上的 X 坐标由 timeScale 给出, 价格 Y 坐标由 series.priceToCoordinate 给出。
 */
class ProsticksRenderer implements IPrimitivePaneRenderer {
  constructor(private primitive: ProsticksPrimitive) {}

  draw(target: any): void {
    const p = this.primitive;
    if (!p.data || p.data.length === 0 || !p.series || !p.chart) return;
    // 2026-07-30: chart 尚未完成首次布局时, priceToCoordinate 会把所有价格
    // 映射到画布几何中心(造成红点全在一条水平线)。等到 timeScale 有可见范围
    // 后再绘制,避免 stale draw。
    if (!p.chart.timeScale().getVisibleLogicalRange()) return;
    // 捕获非空引用, 供闭包内使用 (TS 无法跨闭包推断)
    const series = p.series;
    const chart = p.chart;

    const ts = chart.timeScale();
    const opts = p.options;
    if (!opts.enabled) return;

    // bar 宽度: 根据可见 bar 间距估算
    const barSpacing = ts.options().barSpacing ?? 6;
    const rectW = Math.max(2, barSpacing * 0.6);
    const mpRadius = Math.max(1.5, barSpacing * 0.18);

    target.useBitmapCoordinateSpace((space: any) => {
      const ctx = space.context;
      // 用 CSS 像素绘制 (fancy-canvas 的 useBitmapCoordinateSpace 会处理 DPR 缩放)
      ctx.save();
      ctx.scale(space.horizontalPixelRatio, space.verticalPixelRatio);

      for (const bar of p.data) {
        if (bar.h <= 0 || bar.l <= 0) continue; // 跳过空白扩展 bar
        const x = ts.timeToCoordinate(bar.time as Time);
        if (x === null || x === undefined) continue;
        const cx = x as number;

        const yH = series.priceToCoordinate(bar.h);
        const yL = series.priceToCoordinate(bar.l);
        const yC = series.priceToCoordinate(bar.c);
        const yO = series.priceToCoordinate(bar.o);
        if (yH === null || yL === null) continue;

        const isDown = bar.c < bar.o;
        const midX = cx;

        // --- 极端尾 (Extreme Tail): ut 在 high 下方 (价格 ut < high), lt 在 low 上方 (价格 lt > low) ---
        // 屏幕坐标 y 向下: 高价在上(y小), 低价在下(y大)
        if (opts.showExtremeTail && bar.ut > 0 && bar.ut < bar.h) {
          const yUt = series.priceToCoordinate(bar.ut);
          if (yUt !== null && yUt > (yH as number)) {
            ctx.strokeStyle = TAIL_COLOR;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(midX, yH as number);  // high 在上
            ctx.lineTo(midX, yUt);           // ut 在下 (更接近活跃区上沿)
            ctx.stroke();
          }
        }
        if (opts.showExtremeTail && bar.lt > 0 && bar.lt > bar.l) {
          const yLt = series.priceToCoordinate(bar.lt);
          if (yLt !== null && yLt < (yL as number)) {
            ctx.strokeStyle = TAIL_COLOR;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(midX, yLt);           // lt 在上 (更接近活跃区下沿)
            ctx.lineTo(midX, yL as number);  // low 在下
            ctx.stroke();
          }
        }

        // --- 活跃区 (Active Region): vap(上) 到 vam(下) 的矩形 ---
        if (opts.showActiveRegion && bar.vap > 0 && bar.vam > 0 && bar.vap > bar.vam) {
          const yVap = series.priceToCoordinate(bar.vap);
          const yVam = series.priceToCoordinate(bar.vam);
          if (yVap !== null && yVam !== null) {
            ctx.fillStyle = isDown ? DOWN_FILL : UP_FILL;
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 0.5;
            const left = midX - rectW / 2;
            const top = yVap as number;
            const h = (yVam as number) - top;
            ctx.fillRect(left, top, rectW, h);
            ctx.strokeRect(left, top, rectW, h);

            // 上下影线: 从活跃区到 high/low
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(midX, top);              // vap 到 high
            ctx.lineTo(midX, yH as number);
            ctx.moveTo(midX, (yVam as number)); // vam 到 low
            ctx.lineTo(midX, yL as number);
            ctx.stroke();
          }
        }

        // --- 开盘/收盘手 (左/右 tick) ---
        if (opts.showActiveRegion && yO !== null && yC !== null) {
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(midX - rectW / 2, yO as number);  // 左 tick = 开盘
          ctx.lineTo(midX, yO as number);
          ctx.moveTo(midX, yC as number);               // 右 tick = 收盘
          ctx.lineTo(midX + rectW / 2, yC as number);
          ctx.stroke();
        }

        // --- 模态点 (Modal Point): 红色实心圆 ---
        if (opts.showModalPoint && bar.mp > 0 && bar.mc > 0) {
          const yMp = series.priceToCoordinate(bar.mp);
          if (yMp !== null) {
            ctx.fillStyle = bar.impmp ? IMPMP_COLOR : MP_COLOR;
            ctx.beginPath();
            ctx.arc(midX, yMp as number, bar.impmp ? mpRadius * 1.6 : mpRadius, 0, 2 * Math.PI);
            ctx.fill();
          }
        }
      }

      ctx.restore();
    });
  }
}

/** Prosticks 视图 (实现 IPrimitivePaneView)。 */
class ProsticksPaneView implements IPrimitivePaneView {
  constructor(private primitive: ProsticksPrimitive) {}
  zOrder(): 'top' | 'normal' | 'bottom' {
    return 'top';
  }
  renderer(): IPrimitivePaneRenderer | null {
    return new ProsticksRenderer(this.primitive);
  }
}

/**
 * Prosticks Primitive 主类 (实现 ISeriesPrimitive)。
 * 使用方式: series.attachPrimitive(new ProsticksPrimitive(series, chart, options))
 */
export class ProsticksPrimitive implements ISeriesPrimitive<Time> {
  chart: IChartApi | null = null;
  series: ISeriesApi<any> | null = null;
  data: Bar[] = [];
  options: ProsticksPrimitiveOptions;
  // 2026-07-30: 缓存 lightweight-charts 注入的 requestUpdate 回调,
  // 用于在 setData / setOptions 后主动通知 chart 重绘本 primitive。
  private requestUpdate: (() => void) | null = null;
  private paneView = new ProsticksPaneView(this);

  constructor(chart: IChartApi, series: ISeriesApi<any>, options?: Partial<ProsticksPrimitiveOptions>) {
    this.chart = chart;
    this.series = series;
    this.options = {
      enabled: true,
      showActiveRegion: true,
      showExtremeTail: true,
      showModalPoint: true,
      decimals: 2,
      ...options,
    };
  }

  /** 更新数据并请求重绘。 */
  setData(data: Bar[]): void {
    this.data = data;
    this.updateAllViews();
    // 2026-07-30: 改用 requestUpdate() 主动通知 chart,
    // 避免 applyOptions({}) 被视为无变更而不触发 primitive 重绘。
    this.requestUpdate?.();
  }

  setOptions(options: Partial<ProsticksPrimitiveOptions>): void {
    this.options = { ...this.options, ...options };
    this.updateAllViews();
    this.requestUpdate?.();
  }

  // ISeriesPrimitive 接口实现
  updateAllViews(): void {
    // 视图内部直接引用 primitive, 无需额外缓存更新
  }

  paneViews(): readonly IPrimitivePaneView[] {
    return [this.paneView];
  }

  attached(param: SeriesAttachedParameter<Time>): void {
    this.chart = param.chart as IChartApi;
    this.series = param.series as ISeriesApi<any>;
    // 2026-07-30: 必须保存 requestUpdate, 否则 setData 后无法触发重绘。
    this.requestUpdate = param.requestUpdate;
  }

  detached(): void {
    this.chart = null;
    this.series = null;
    this.requestUpdate = null;
    // 2026-07-30: 清空 data 防止 stale draw(切换图表类型时
    // 渲染队列中残留的 draw 调用会用到旧 series 引用与旧 data)。
    this.data = [];
  }
}
