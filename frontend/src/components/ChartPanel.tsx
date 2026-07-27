import { useEffect, useRef, useState, useCallback, type CSSProperties } from 'react';
import {
  createChart,
  CandlestickSeries,
  BarSeries,
  LineSeries,
  AreaSeries,
  HistogramSeries,
  ColorType,
  CrosshairMode,
  type IChartApi,
  type ISeriesApi,
  type Time,
  type MouseEventParams,
} from 'lightweight-charts';
import { marketApi, indicatorApi } from '../api/client';
import type {
  Bar,
  IndicatorResult,
  RealtimeBarMessage,
  RealtimeIndicatorsMessage,
} from '../types';
import { UPPER_TECH, LOWER_TECH } from '../types';
import { MarketSocket } from '../realtime/MarketSocket';
import { ProsticksPrimitive } from '../primitives/ProsticksPrimitive';
import { IchimokuPrimitive } from '../primitives/IchimokuPrimitive';
import { DrawingManager } from '../drawing/DrawingManager';
import { TOOL } from '../drawing/tools';
import { useI18n } from '../i18n';

interface ChartPanelProps {
  code: string;
  interval: number;
  chartType: number;
  upper: number;
  lower: number[];          // 多选副图指标 (支持多个叠加)
  tool: number;
  decimals: number;
  onZoomOut: () => void;
  onZoomIn: () => void;
  onShiftLeft: () => void;
  onShiftRight: () => void;
  registerExport: (fn: () => void) => void;
}

// 图表类型常量
const TYPE = { PROSTICKS: 0, BAR: 2, BAR_MODAL: 3, CANDLE: 4, MODAL_LINE: 5, LINE: 6, AREA: 7 };

// 2026-07-21 18:28:13：集中维护手机与桌面的 pane 比例，避免 iframe 改变宽度后布局残留。
function applyPaneLayout(chart: IChartApi, isPhoneWidth: boolean): void {
  const panes = chart.panes();
  if (panes.length === 0) return;
  panes[0].setStretchFactor(isPhoneWidth && panes.length > 1 ? 2 : 1);
  for (let i = 1; i < panes.length; i++) panes[i].setStretchFactor(1);
}

export default function ChartPanel(props: ChartPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const mainSeriesRef = useRef<ISeriesApi<any> | null>(null);
  const prosticksPrimRef = useRef<ProsticksPrimitive | null>(null);
  const ichimokuPrimRef = useRef<IchimokuPrimitive | null>(null);
  const drawingMgrRef = useRef<DrawingManager | null>(null);
  const overlaySeriesRef = useRef<ISeriesApi<any>[]>([]);   // 叠加指标序列
  const overlayRequestRef = useRef(0);
  // 副图指标序列: paneIndex → series[] (每个副图占一个独立 pane, 支持多个叠加)
  const paneSeriesMapRef = useRef<Map<number, ISeriesApi<any>[]>>();
  const barsRef = useRef<Bar[]>([]);
  const socketRef = useRef<MarketSocket | null>(null);
  const liveSelectionRef = useRef({
    code: props.code, interval: props.interval, upper: props.upper, lower: props.lower,
    chartType: props.chartType,
  });
  liveSelectionRef.current = {
    code: props.code, interval: props.interval, upper: props.upper, lower: props.lower,
    chartType: props.chartType,
  };
  const [info, setInfo] = useState<string>('');
  const [toolHint, setToolHint] = useState<string>('');
  const { t } = useI18n();

  // ---- 初始化图表 ----
  useEffect(() => {
    if (!containerRef.current) return;
    const chart = createChart(containerRef.current, {
      layout: {
        // 2026-07-22 12:51:45：iframe 图表不显示左下角 TradingView Logo 和跳转链接。
        attributionLogo: false,
        background: { type: ColorType.Solid, color: '#ffffff' },
        textColor: '#202020',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: '#f0f0f0' },
        horzLines: { color: '#f0f0f0' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: '#888', labelBackgroundColor: '#003366' },
        horzLine: { color: '#888', labelBackgroundColor: '#003366' },
      },
      rightPriceScale: { borderColor: '#c0c0c0' },
      timeScale: {
        borderColor: '#c0c0c0',
        timeVisible: true,
        secondsVisible: false,
        barSpacing: 7,
      },
    });
    chartRef.current = chart;
    drawingMgrRef.current = new DrawingManager(chart, null as any);
    paneSeriesMapRef.current = new Map();

    // 十字光标移动 → 更新 OHLC 读数
    chart.subscribeCrosshairMove((param: MouseEventParams<Time>) => {
      updateInfoOverlay(param);
    });

    // 点击 → 绘图工具交互
    chart.subscribeClick((param: MouseEventParams<Time>) => {
      handleChartClick(param);
    });

    const resize = () => {
      if (!containerRef.current) return;
      const isPhoneWidth = containerRef.current.clientWidth <= 768;
      // 2026-07-21 18:28:13：手机 iframe 中纵向手势交给页面滚动，图表继续处理横向拖动。
      chart.applyOptions({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
        handleScroll: {
          mouseWheel: !isPhoneWidth,
          pressedMouseMove: true,
          horzTouchDrag: true,
          vertTouchDrag: !isPhoneWidth,
        },
      });
      applyPaneLayout(chart, isPhoneWidth);
    };
    const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(resize);
    resizeObserver?.observe(containerRef.current);
    window.addEventListener('resize', resize);
    resize();

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', resize);
      chart.remove();
      chartRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- 数据加载 + 图表类型切换 ----
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!chartRef.current) return;
      try {
        const bars = await marketApi.getBars(props.code, props.interval, 300, false);
        if (cancelled) return;
        barsRef.current = bars;
        renderMainSeries(bars, props.chartType, props.decimals);
        // 加载叠加指标
        loadOverlayIndicator(props.upper, props.code, props.interval);
        // 加载副图指标 (多选)
        loadLowerIndicators(props.lower, props.code, props.interval);
        // 更新绘图管理器的 series 引用
        if (mainSeriesRef.current && drawingMgrRef.current) {
          drawingMgrRef.current.series = mainSeriesRef.current;
        }
        // 重置绘图状态 (切换品种时清空, 避免错位)
        drawingMgrRef.current?.setTool(TOOL.NONE);
      } catch (e) {
        console.error('加载数据失败', e);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.code, props.interval, props.chartType, props.decimals]);

  // ---- 叠加指标切换 ----
  useEffect(() => {
    loadOverlayIndicator(props.upper, props.code, props.interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.upper]);

  // ---- 副图指标切换 (多选) ----
  useEffect(() => {
    loadLowerIndicators(props.lower, props.code, props.interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.lower]);

  // ---- 绘图工具切换 ----
  useEffect(() => {
    drawingMgrRef.current?.setTool(props.tool);
    updateToolHint(props.tool);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.tool]);

  // ---- 缩放/平移/导出 ----
  useEffect(() => {
    props.registerExport(() => {
      if (chartRef.current) {
        chartRef.current.takeScreenshot().toDataURL('image/png');
        // 触发下载
        const url = chartRef.current.takeScreenshot().toDataURL('image/png');
        const a = document.createElement('a');
        a.href = url;
        a.download = `chart_${props.code}_${Date.now()}.png`;
        a.click();
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.code]);

  // ---- 渲染主图序列 ----
  const renderMainSeries = (bars: Bar[], chartType: number, decimals: number) => {
    const chart = chartRef.current!;
    // 移除旧的主序列与 primitive
    if (mainSeriesRef.current) {
      chart.removeSeries(mainSeriesRef.current);
      mainSeriesRef.current = null;
    }
    if (prosticksPrimRef.current) {
      prosticksPrimRef.current = null;
    }
    ichimokuPrimRef.current = null;

    const priceFormat = {
      type: 'price' as const,
      precision: decimals,
      minMove: 1 / Math.pow(10, decimals),
    };

    // 判断是否需要 Prosticks 形态
    const isProsticks = chartType === TYPE.PROSTICKS || chartType === TYPE.BAR_MODAL || chartType === TYPE.MODAL_LINE;

    // 根据图表类型创建序列
    let series: ISeriesApi<any>;
    if (chartType === TYPE.LINE || chartType === TYPE.MODAL_LINE) {
      series = chart.addSeries(LineSeries, {
        color: chartType === TYPE.MODAL_LINE ? '#FF0000' : '#1E90FF',
        lineWidth: 1,
        priceFormat,
      });
      const data = bars
        .filter((b) => b.h > 0)
        .map((b) => ({
          time: b.time as Time,
          value: chartType === TYPE.MODAL_LINE ? b.mp : b.c,
        }))
        // 模态线跳过 mp=0 的点
        .filter((d) => chartType !== TYPE.MODAL_LINE || (d.value as number) > 0);
      series.setData(data);
    } else if (chartType === TYPE.AREA) {
      series = chart.addSeries(AreaSeries, {
        lineColor: '#1E90FF',
        topColor: 'rgba(96, 176, 255, 0.4)',
        bottomColor: 'rgba(96, 176, 255, 0.05)',
        lineWidth: 1,
        priceFormat,
      });
      series.setData(bars.filter((b) => b.h > 0).map((b) => ({ time: b.time as Time, value: b.c })));
    } else if (chartType === TYPE.BAR || chartType === TYPE.BAR_MODAL) {
      series = chart.addSeries(BarSeries, {
        upColor: '#000000',
        downColor: '#000000',
        thinBars: false,
        priceFormat,
      });
      series.setData(
        bars.filter((b) => b.h > 0).map((b) => ({
          time: b.time as Time, open: b.o, high: b.h, low: b.l, close: b.c,
        })),
      );
    } else {
      // CANDLE (默认) + PROSTICKS 都用 candlestick 作为底
      series = chart.addSeries(CandlestickSeries, {
        upColor: '#000000',
        downColor: '#ffffff',
        borderUpColor: '#000000',
        borderDownColor: '#000000',
        wickUpColor: '#000000',
        wickDownColor: '#000000',
        priceFormat,
      });
      series.setData(
        bars.filter((b) => b.h > 0).map((b) => ({
          time: b.time as Time, open: b.o, high: b.h, low: b.l, close: b.c,
        })),
      );
    }
    mainSeriesRef.current = series;

    // Prosticks 形态: 附加自定义 primitive (透明 K 线 + 形态叠加)
    if (isProsticks) {
      const prim = new ProsticksPrimitive(chart, series, {
        enabled: true,
        showActiveRegion: chartType === TYPE.PROSTICKS || chartType === TYPE.BAR_MODAL,
        showExtremeTail: chartType === TYPE.PROSTICKS,
        showModalPoint: chartType === TYPE.PROSTICKS || chartType === TYPE.BAR_MODAL || chartType === TYPE.MODAL_LINE,
        decimals,
      });
      prim.setData(bars);
      series.attachPrimitive(prim);
      prosticksPrimRef.current = prim;
    }

    // 绘图管理器: 重新附加到新序列 (旧序列已 removeSeries 会自动解绑)
    if (drawingMgrRef.current) {
      drawingMgrRef.current.series = series;
      drawingMgrRef.current.decimals = decimals;
      // 关键: 必须把 DrawingManager 作为 primitive 附加到序列, 否则 draw() 不会被调用
      series.attachPrimitive(drawingMgrRef.current);
    }

    chart.timeScale().fitContent();
  };

  // 2026-07-21 22:47:36：把完整实时 Bar 转为当前主图类型需要的 update 数据。
  const toMainSeriesPoint = (bar: Bar, chartType: number): any | null => {
    if (chartType === TYPE.LINE || chartType === TYPE.MODAL_LINE || chartType === TYPE.AREA) {
      const value = chartType === TYPE.MODAL_LINE ? bar.mp : bar.c;
      return value > 0 ? { time: bar.time as Time, value } : null;
    }
    return { time: bar.time as Time, open: bar.o, high: bar.h, low: bar.l, close: bar.c };
  };

  const handleRealtimeBar = (message: RealtimeBarMessage): void => {
    const selected = liveSelectionRef.current;
    if (message.code !== selected.code || message.interval !== selected.interval) return;
    const bars = barsRef.current;
    const last = bars[bars.length - 1];
    if (!last || message.bar.time > last.time) {
      bars.push(message.bar);
      if (bars.length > 300) bars.shift();
    } else if (message.bar.time === last.time) {
      bars[bars.length - 1] = message.bar;
    } else {
      return;
    }
    const point = toMainSeriesPoint(message.bar, selected.chartType);
    if (point && mainSeriesRef.current) mainSeriesRef.current.update(point);
    prosticksPrimRef.current?.setData(bars);
  };

  const applyIndicatorDelta = (
    seriesList: ISeriesApi<any>[], result: IndicatorResult, indicatorType?: number,
  ): void => {
    result.series.forEach((item, index) => {
      const point = item.data[0];
      const series = seriesList[index];
      if (!series || !point || point.value === null) return;
      const update: any = { time: point.time as Time, value: point.value };
      if (indicatorType === LOWER_TECH.MACD && index === 2) {
        update.color = point.value >= 0 ? '#00A000' : '#FF0000';
      }
      series.update(update);
    });
  };

  const handleRealtimeIndicators = (message: RealtimeIndicatorsMessage): void => {
    const selected = liveSelectionRef.current;
    if (message.code !== selected.code || message.interval !== selected.interval) return;
    if (message.upper?.type === selected.upper) {
      applyIndicatorDelta(overlaySeriesRef.current, message.upper.result);
      if (selected.upper === UPPER_TECH.IKH) {
        ichimokuPrimRef.current?.applyDelta(
          message.upper.result, barsRef.current, selected.interval <= 2,
        );
      }
    }
    message.lower.forEach((update) => {
      const selectedIndex = selected.lower.indexOf(update.type);
      if (selectedIndex < 0) return;
      const seriesList = paneSeriesMapRef.current?.get(selectedIndex + 1) ?? [];
      applyIndicatorDelta(seriesList, update.result, update.type);
    });
  };

  // ---- 加载叠加指标 ----
  useEffect(() => {
    // 2026-07-21 22:49:10：页面打开即建立单一连接，卸载 iframe 时主动取消订阅并关闭。
    const client = new MarketSocket({
      onBar: handleRealtimeBar,
      onIndicators: handleRealtimeIndicators,
    });
    socketRef.current = client;
    client.subscribe({
      code: props.code, interval: props.interval, upper: props.upper, lower: props.lower,
    });
    return () => {
      client.dispose();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    socketRef.current?.subscribe({
      code: props.code, interval: props.interval, upper: props.upper, lower: props.lower,
    });
  }, [props.code, props.interval, props.upper, props.lower]);

  const loadOverlayIndicator = async (upper: number, code: string, interval: number) => {
    const chart = chartRef.current;
    if (!chart || !mainSeriesRef.current) return;
    const requestId = ++overlayRequestRef.current;
    // 清除旧叠加序列
    overlaySeriesRef.current.forEach((s) => chart.removeSeries(s));
    overlaySeriesRef.current = [];
    if (ichimokuPrimRef.current) {
      mainSeriesRef.current.detachPrimitive(ichimokuPrimRef.current);
      ichimokuPrimRef.current = null;
    }
    if (upper === UPPER_TECH.NONE) return;

    try {
      // 2026-07-21 17:26:43：仅 Ichimoku 请求未来时间点并启用专用云层，避免影响其他叠加指标。
      const result = await indicatorApi.calculate(
        'upper', upper, code, interval, undefined, upper === UPPER_TECH.IKH,
      );
      if (requestId !== overlayRequestRef.current || chartRef.current !== chart || !mainSeriesRef.current) return;
      for (const s of result.series) {
        const series = chart.addSeries(LineSeries, {
          color: s.color,
          lineWidth: 1,
          priceScaleId: 'right',
          lastValueVisible: true,
        });
        series.setData(
          s.data.filter((d) => d.value !== null).map((d) => ({ time: d.time as Time, value: d.value as number })),
        );
        overlaySeriesRef.current.push(series);
      }
      if (upper === UPPER_TECH.IKH && result.id === 'IKH') {
        const primitive = new IchimokuPrimitive(chart, mainSeriesRef.current);
        primitive.setData(result, barsRef.current, interval <= 2);
        mainSeriesRef.current.attachPrimitive(primitive);
        ichimokuPrimRef.current = primitive;
        chart.timeScale().fitContent();
      }
    } catch (e) {
      console.error('加载叠加指标失败', e);
    }
  };

  const syncPaneLayout = () => {
    const chart = chartRef.current;
    if (!chart) return;
    const isPhoneWidth = (containerRef.current?.clientWidth ?? 769) <= 768;
    // 2026-07-21 18:28:13：手机主图保持双倍权重，桌面继续使用原有等比例 pane 布局。
    applyPaneLayout(chart, isPhoneWidth);
  };

  // ---- 加载副图指标 (多选, 每个指标占一个独立 pane) ----
  const loadLowerIndicators = async (selected: number[], code: string, interval: number) => {
    const chart = chartRef.current;
    const paneMap = paneSeriesMapRef.current;
    if (!chart || !paneMap) return;

    // 清除所有旧副图序列
    for (const seriesList of paneMap.values()) {
      seriesList.forEach((s) => chart.removeSeries(s));
    }
    paneMap.clear();
    if (selected.length === 0) {
      syncPaneLayout();
      return;
    }

    // 每个副图指标分配一个独立 paneIndex (从 1 开始, 0 是主图)
    for (let idx = 0; idx < selected.length; idx++) {
      const lower = selected[idx];
      const paneIndex = idx + 1;
      try {
        const result = await indicatorApi.calculate('lower', lower, code, interval);
        const seriesList: ISeriesApi<any>[] = [];
        const isHistogram = lower === LOWER_TECH.VOLUME || lower === LOWER_TECH.VOLP;
        for (let i = 0; i < result.series.length; i++) {
          const s = result.series[i];
          let series: ISeriesApi<any>;
          if (lower === LOWER_TECH.MACD && i === 2) {
            // MACD 柱状图 (第 3 条), 涨跌不同色
            series = chart.addSeries(HistogramSeries, {}, paneIndex);
            series.setData(
              s.data.filter((d) => d.value !== null).map((d) => ({
                time: d.time as Time,
                value: d.value as number,
                color: (d.value as number) >= 0 ? '#00A000' : '#FF0000',
              })),
            );
          } else if (isHistogram && i === 0) {
            // Volume / VolumePlus 柱状图
            series = chart.addSeries(HistogramSeries, { color: s.color }, paneIndex);
            series.setData(
              s.data.filter((d) => d.value !== null).map((d) => ({ time: d.time as Time, value: d.value as number })),
            );
          } else {
            series = chart.addSeries(LineSeries, { color: s.color, lineWidth: 1 }, paneIndex);
            series.setData(
              s.data.filter((d) => d.value !== null).map((d) => ({ time: d.time as Time, value: d.value as number })),
            );
          }
          seriesList.push(series);
        }
        paneMap.set(paneIndex, seriesList);
        // 副图比例自适应
        chart.priceScale('right', paneIndex).applyOptions({ scaleMargins: { top: 0.1, bottom: 0.1 } });
      } catch (e) {
        console.error(`加载副图指标 ${lower} 失败`, e);
      }
    }
    syncPaneLayout();
  };

  // ---- 十字光标读数 ----
  const updateInfoOverlay = (param: MouseEventParams<Time>) => {
    if (!param.time || !param.seriesData) {
      setInfo('');
      return;
    }
    const bar = barsRef.current.find((b) => b.time === (param.time as number));
    if (!bar || bar.h <= 0) {
      setInfo('');
      return;
    }
    const date = new Date((param.time as number) * 1000);
    const ds = date.toISOString().slice(0, 16).replace('T', ' ');
    const isUp = bar.c >= bar.o;
    const cls = isUp ? 'up' : 'down';
    const dp = props.decimals;
    const mpStr = bar.mp > 0
      ? `<span class="mp">${t('mp')}: ${bar.mp.toFixed(dp)} (${t('mc')}: ${bar.mc})</span>`
      : '';
    setInfo(
      `${ds}<br/>` +
      `<span class="${cls}">${t('o')}: ${bar.o.toFixed(dp)} ${t('h')}: ${bar.h.toFixed(dp)} ${t('l')}: ${bar.l.toFixed(dp)} ${t('c')}: ${bar.c.toFixed(dp)}</span><br/>` +
      mpStr,
    );

    // 同时更新绘图预览 (用鼠标实际价格, 而非 bar 收盘价)
    const mousePrice = getMousePrice(param);
    if (mousePrice !== null && drawingMgrRef.current) {
      drawingMgrRef.current.handleMouseMove(param.time, mousePrice);
    }
  };

  /** 从鼠标事件参数中提取实际价格 (基于鼠标 Y 坐标, 而非 bar 收盘价)。 */
  const getMousePrice = (param: MouseEventParams<Time>): number | null => {
    if (!param.point || !mainSeriesRef.current) return null;
    const price = mainSeriesRef.current.coordinateToPrice(param.point.y);
    return price;
  };

  // ---- 点击 → 绘图工具 ----
  const handleChartClick = (param: MouseEventParams<Time>) => {
    if (!param.time || !mainSeriesRef.current) return;
    const mousePrice = getMousePrice(param);
    if (mousePrice === null) return;

    const mgr = drawingMgrRef.current!;
    if (mgr.getActiveTool() === TOOL.TEXTBOX) {
      // 文本框: 弹出输入
      const text = window.prompt(t('TextBox') + ':', '');
      if (text) mgr.addTextBox(param.time, mousePrice, text);
      mgr.setTool(TOOL.NONE);
    } else {
      mgr.handleClick(param.time, mousePrice);
    }
  };

  // ---- 工具提示 ----
  const updateToolHint = (tool: number) => {
    if (tool === TOOL.TRENDLINE) setToolHint(`${t('DrawLine')}: ${t('chart')} → 2 ${'points'}`);
    else if (tool === TOOL.PARALLEL_LINE) setToolHint(`${t('ParallelLines')}: 3 ${'points'}`);
    else if (tool === TOOL.FIBON_RET) setToolHint(`${t('FibRetracement')}: 2 ${'points'}`);
    else if (tool === TOOL.FIBON_PRO) setToolHint(`${t('FibProjection')}: 3 ${'points'}`);
    else setToolHint('');
  };

  // 暴露缩放/平移给 App
  const zoomOut = useCallback(() => {
    const ts = chartRef.current?.timeScale();
    if (!ts) return;
    const opts = ts.options();
    ts.applyOptions({ barSpacing: Math.max(1, (opts.barSpacing ?? 7) * 0.8) });
  }, []);
  const zoomIn = useCallback(() => {
    const ts = chartRef.current?.timeScale();
    if (!ts) return;
    const opts = ts.options();
    ts.applyOptions({ barSpacing: (opts.barSpacing ?? 7) * 1.25 });
  }, []);
  const shiftLeft = useCallback(() => {
    const ts = chartRef.current?.timeScale();
    if (!ts) return;
    const range = ts.getVisibleLogicalRange();
    if (range) ts.setVisibleLogicalRange({ from: range.from - 30, to: range.to - 30 });
  }, []);
  const shiftRight = useCallback(() => {
    const ts = chartRef.current?.timeScale();
    if (!ts) return;
    const range = ts.getVisibleLogicalRange();
    if (range) ts.setVisibleLogicalRange({ from: range.from + 30, to: range.to + 30 });
  }, []);

  // 通过 ref 暴露
  useEffect(() => {
    (window as any).__chartZoom = { zoomOut, zoomIn, shiftLeft, shiftRight };
  }, [zoomOut, zoomIn, shiftLeft, shiftRight]);

  // 2026-07-21 18:28:13：手机端按副图数量增加总高度，使 iframe 内可通过纵向滚动逐个查看。
  const mobileLowerHeight = `${props.lower.length * 220}px`;
  const chartStyle = { '--mobile-lower-height': mobileLowerHeight } as CSSProperties;

  return (
    <div className="chart-container" ref={containerRef} style={chartStyle} aria-label="Forex chart">
      <div className="info-overlay" dangerouslySetInnerHTML={{ __html: info || '' }} />
      <div className={`tools-hint ${toolHint ? 'show' : ''}`}>{toolHint}</div>
    </div>
  );
}
