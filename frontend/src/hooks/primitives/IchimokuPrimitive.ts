// 2026-07-21 17:25:36：补齐旧 chart 的 Ichimoku 云层网格和交叉信号箭头，保持五条线下方/上方的绘制层级。

import type {
  IChartApi,
  IPrimitivePaneRenderer,
  IPrimitivePaneView,
  ISeriesApi,
  ISeriesPrimitive,
  SeriesAttachedParameter,
  Time,
} from 'lightweight-charts';
import type { Bar, IndicatorPoint, IndicatorResult, IndicatorSeries } from '../../types';

const CLOUD_UP = '#C0F0C0';
const CLOUD_DOWN = '#80A080';
const SIGNAL_UP = '#FF0000';
const SIGNAL_DOWN = '#0000FF';

interface CloudPoint {
  time: number;
  spanA: number;
  spanB: number;
}

interface SignalPoint {
  time: number;
  anchor: number;
  direction: 'up' | 'down';
  strength: number;
}

function seriesValues(result: IndicatorResult, name: string): Map<number, number> {
  const data = result.series.find((series) => series.name === name)?.data ?? [];
  return new Map(
    data.filter((point) => point.value !== null)
      .map((point) => [point.time, point.value as number]),
  );
}

function buildCloud(result: IndicatorResult): CloudPoint[] {
  const spanA = seriesValues(result, 'Senkou A');
  const spanB = seriesValues(result, 'Senkou B');
  return [...spanA.entries()]
    .filter(([time]) => spanB.has(time))
    .map(([time, value]) => ({ time, spanA: value, spanB: spanB.get(time)! }));
}

function buildSignals(result: IndicatorResult, bars: Bar[], useModal: boolean): SignalPoint[] {
  const tenkan = seriesValues(result, 'Tenkan');
  const kijun = seriesValues(result, 'Kijun');
  const spanA = seriesValues(result, 'Senkou A');
  const spanB = seriesValues(result, 'Senkou B');
  const barMap = new Map(bars.map((bar) => [bar.time, bar]));
  const points = [...tenkan.entries()].filter(([time]) => kijun.has(time));
  const signals: SignalPoint[] = [];
  let previous: { diff: number; tenkan: number } | null = null;

  for (const [time, fast] of points) {
    const slow = kijun.get(time)!;
    const diff = fast - slow;
    if (diff === 0) continue;
    const direction = previous && previous.diff > 0 && diff < 0 && fast < previous.tenkan
      ? 'down'
      : previous && previous.diff < 0 && diff > 0 && fast > previous.tenkan ? 'up' : null;
    if (direction && spanA.has(time) && spanB.has(time) && barMap.has(time)) {
      const bar = barMap.get(time)!;
      const price = useModal && bar.mp > 0 ? bar.mp : bar.c;
      const upper = Math.max(spanA.get(time)!, spanB.get(time)!);
      const lower = Math.min(spanA.get(time)!, spanB.get(time)!);
      const strength = direction === 'up'
        ? (price > upper ? 3 : price < lower ? 1 : 2)
        : (price < lower ? 3 : price > upper ? 1 : 2);
      signals.push({ time, anchor: slow, direction, strength });
    }
    previous = { diff, tenkan: fast };
  }
  return signals;
}

class CloudRenderer implements IPrimitivePaneRenderer {
  constructor(private primitive: IchimokuPrimitive) {}

  draw(target: any): void {
    const { chart, series, cloud } = this.primitive;
    if (!chart || !series || cloud.length < 2) return;
    const timeScale = chart.timeScale();
    target.useBitmapCoordinateSpace((space: any) => {
      const ctx = space.context;
      ctx.save();
      ctx.scale(space.horizontalPixelRatio, space.verticalPixelRatio);
      for (let i = 1; i < cloud.length; i++) {
        const left = cloud[i - 1];
        const right = cloud[i];
        const x1 = timeScale.timeToCoordinate(left.time as Time);
        const x2 = timeScale.timeToCoordinate(right.time as Time);
        const yA1 = series.priceToCoordinate(left.spanA);
        const yA2 = series.priceToCoordinate(right.spanA);
        const yB1 = series.priceToCoordinate(left.spanB);
        const yB2 = series.priceToCoordinate(right.spanB);
        if ([x1, x2, yA1, yA2, yB1, yB2].some((value) => value === null)) continue;
        this.drawSegment(ctx, x1!, x2!, yA1!, yA2!, yB1!, yB2!, right.spanA >= right.spanB);
      }
      ctx.restore();
    });
  }

  private drawSegment(ctx: CanvasRenderingContext2D, x1: number, x2: number,
    yA1: number, yA2: number, yB1: number, yB2: number, rising: boolean): void {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x1, yA1);
    ctx.lineTo(x2, yA2);
    ctx.lineTo(x2, yB2);
    ctx.lineTo(x1, yB1);
    ctx.closePath();
    ctx.clip();
    ctx.strokeStyle = rising ? CLOUD_UP : CLOUD_DOWN;
    ctx.lineWidth = 5;
    ctx.setLineDash([5, 5]);
    const top = Math.min(yA1, yA2, yB1, yB2);
    const bottom = Math.max(yA1, yA2, yB1, yB2);
    for (let y = top; y <= bottom; y += 10) {
      ctx.beginPath();
      ctx.moveTo(Math.min(x1, x2) - 2, y);
      ctx.lineTo(Math.max(x1, x2) + 2, y);
      ctx.stroke();
    }
    ctx.restore();
  }
}

class SignalRenderer implements IPrimitivePaneRenderer {
  constructor(private primitive: IchimokuPrimitive) {}

  draw(target: any): void {
    const { chart, series, signals } = this.primitive;
    if (!chart || !series || signals.length === 0) return;
    const timeScale = chart.timeScale();
    target.useBitmapCoordinateSpace((space: any) => {
      const ctx = space.context;
      ctx.save();
      ctx.scale(space.horizontalPixelRatio, space.verticalPixelRatio);
      for (const signal of signals) {
        const x = timeScale.timeToCoordinate(signal.time as Time);
        const y = series.priceToCoordinate(signal.anchor);
        if (x === null || y === null) continue;
        for (let i = 0; i < signal.strength; i++) {
          const offset = signal.direction === 'up' ? 25 + i * 10 : -15 - i * 10;
          this.drawTriangle(ctx, x, y + offset, signal.direction);
        }
      }
      ctx.restore();
    });
  }

  private drawTriangle(ctx: CanvasRenderingContext2D, x: number, y: number,
    direction: 'up' | 'down'): void {
    const sign = direction === 'up' ? -1 : 1;
    ctx.fillStyle = direction === 'up' ? SIGNAL_UP : SIGNAL_DOWN;
    ctx.beginPath();
    ctx.moveTo(x, y + sign * 5);
    ctx.lineTo(x - 5, y - sign * 5);
    ctx.lineTo(x + 5, y - sign * 5);
    ctx.closePath();
    ctx.fill();
  }
}

class IchimokuPaneView implements IPrimitivePaneView {
  constructor(private rendererValue: IPrimitivePaneRenderer, private layer: 'bottom' | 'top') {}
  zOrder(): 'bottom' | 'top' { return this.layer; }
  renderer(): IPrimitivePaneRenderer { return this.rendererValue; }
}

export class IchimokuPrimitive implements ISeriesPrimitive<Time> {
  chart: IChartApi | null;
  series: ISeriesApi<any> | null;
  cloud: CloudPoint[] = [];
  signals: SignalPoint[] = [];
  private requestUpdate?: () => void;
  private views: IchimokuPaneView[];
  private result: IndicatorResult | null = null;

  constructor(chart: IChartApi, series: ISeriesApi<any>) {
    this.chart = chart;
    this.series = series;
    this.views = [
      new IchimokuPaneView(new CloudRenderer(this), 'bottom'),
      new IchimokuPaneView(new SignalRenderer(this), 'top'),
    ];
  }

  setData(result: IndicatorResult, bars: Bar[], useModal: boolean): void {
    this.result = result;
    this.cloud = buildCloud(result);
    this.signals = buildSignals(result, bars, useModal);
    this.requestUpdate?.();
  }

  // 2026-07-21 22:45:28：合并实时 Ichimoku 点后重建云层，保证最后一根柱变化时绿色云层同步变化。
  applyDelta(delta: IndicatorResult, bars: Bar[], useModal: boolean): void {
    if (!this.result) return;
    for (const deltaSeries of delta.series) {
      const current: IndicatorSeries | undefined = this.result.series.find(
        (item: IndicatorSeries) => item.name === deltaSeries.name,
      );
      if (!current) continue;
      for (const point of deltaSeries.data) {
        const index = current.data.findIndex((item: IndicatorPoint) => item.time === point.time);
        if (index >= 0) current.data[index] = point;
        else current.data.push(point);
      }
      current.data.sort((left: IndicatorPoint, right: IndicatorPoint) => left.time - right.time);
    }
    this.cloud = buildCloud(this.result);
    this.signals = buildSignals(this.result, bars, useModal);
    this.requestUpdate?.();
  }

  paneViews(): readonly IPrimitivePaneView[] { return this.views; }

  attached(param: SeriesAttachedParameter<Time>): void {
    this.chart = param.chart as IChartApi;
    this.series = param.series as ISeriesApi<any>;
    this.requestUpdate = param.requestUpdate;
  }

  detached(): void {
    this.chart = null;
    this.series = null;
    this.requestUpdate = undefined;
  }
}
