import { useEffect, useRef, useState, useCallback, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
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
import { Button, message } from 'antd';
import { ShrinkOutlined, ArrowsAltOutlined, RedoOutlined, DeleteOutlined, CaretUpOutlined} from '@ant-design/icons';
import { marketApi, indicatorApi } from '../api/client';
import type {
  Bar,
  IndicatorResult,
  RealtimeBarMessage,
  RealtimeIndicatorsMessage,
} from '../types';
import { UPPER_TECH, LOWER_TECH } from '../types';
import { formatIndicatorParams, isDefaultParams } from '../constants/indicatorParams';

// 2026-07-29：副图 ID → i18n 文案 key 的映射 (用于浮层显示副图名称)
const LOWER_NAME_KEY: Record<number, keyof typeof import('../i18n').STRINGS['en']> = {
  [LOWER_TECH.VOLUME]: 'VOLUME',
  [LOWER_TECH.RSI]: 'RSI',
  [LOWER_TECH.MACD]: 'MACD',
  [LOWER_TECH.STC]: 'STC',
  [LOWER_TECH.MOM]: 'MOM',
  [LOWER_TECH.PCTR]: 'PCTR',
  [LOWER_TECH.OBV]: 'OBV',
  [LOWER_TECH.MC]: 'MC',
  [LOWER_TECH.ROC]: 'ROC',
  [LOWER_TECH.ADX]: 'ADX',
  [LOWER_TECH.MFI]: 'MFI',
  [LOWER_TECH.VOLA]: 'VOLA',
  [LOWER_TECH.VOLP]: 'VOLP',
  [LOWER_TECH.VAO]: 'VAO',
  [LOWER_TECH.CCI]: 'CCI',
  [LOWER_TECH.ATR]: 'ATR',
};

/** 2026-07-29：把数值简写成 K / M / B 形式（如 1111800000 → 1.11B） */
function formatIndicatorValueShort(value: number, decimals: number): string {
  const abs = Math.abs(value);
  if (abs >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
  return value.toFixed(decimals);
}

/** 2026-07-29：从 IndicatorResult 取最后一个非 null 值并格式化。MACD 取主线 (series[0]) */
function formatLastValue(result: IndicatorResult, decimals: number): string {
  // MACD 优先显示 series[0]（DIF），其他取 series[0]
  for (const series of result.series) {
    const pts = series.data;
    for (let j = pts.length - 1; j >= 0; j--) {
      const v = pts[j].value;
      if (v !== null && Number.isFinite(v)) return formatIndicatorValueShort(v as number, decimals);
    }
  }
  return '—';
}

/** 2026-08-04：移动端副图描述条数值 (需求2) — 成交量类指标(VOLUME/VOLP)显示整数千分位 + "手"
 *  (仿股票"成交量 XXX手"), 其余指标沿用 K/M/B 缩写。 */
function formatLowerValueForMobile(tech: number, result: IndicatorResult | undefined, decimals: number): string {
  if (!result) return '—';
  for (const series of result.series) {
    const pts = series.data;
    for (let j = pts.length - 1; j >= 0; j--) {
      const v = pts[j].value;
      if (v === null || !Number.isFinite(v)) continue;
      const num = v as number;
      if (tech === LOWER_TECH.VOLUME || tech === LOWER_TECH.VOLP) {
        return `${Math.round(num).toLocaleString()}手`;
      }
      return formatIndicatorValueShort(num, decimals);
    }
  }
  return '—';
}

/** 2026-07-30：指标数据兜底清洗 — 把脏数据(NaN/undefined/重复 time)处理成 Lightweight Charts 能吃的形态。
 *  - value 为 null/undefined/NaN/Infinity → 丢弃（不传 null 给 setData，否则后续 update 会再次报错）
 *  - time 必须为有限数字；非数字或缺时间字段 → 丢弃
 *  - 同 time 多点 → 仅保留最后一个
 *  - 必须严格升序排列
 *  返回 { points, allEmpty }：allEmpty=true 表示该 series 没有任何可用数据点（用于显示"数据异常"提示）
 */
function sanitizePoints(
  data: Array<{ time: number; value: number | null }>,
): { points: Array<{ time: number; value: number }>; allEmpty: boolean } {
  const filtered: Array<{ time: number; value: number }> = [];
  for (const d of data) {
    if (typeof d.time !== 'number' || !Number.isFinite(d.time)) continue;
    if (d.value === null || d.value === undefined) continue;
    if (!Number.isFinite(d.value as number)) continue;
    filtered.push({ time: d.time, value: d.value as number });
  }
  // 按 time 升序排序，同 time 仅保留最后一个（防御后端偶尔乱序/重复）
  filtered.sort((a, b) => a.time - b.time);
  const dedup: Array<{ time: number; value: number }> = [];
  for (let i = 0; i < filtered.length; i++) {
    if (i > 0 && filtered[i].time === filtered[i - 1].time) {
      dedup[dedup.length - 1] = filtered[i];
    } else {
      dedup.push(filtered[i]);
    }
  }
  return { points: dedup, allEmpty: filtered.length === 0 };
}
import type { NationPalette } from '../constants/nation';
import { MarketSocket } from '../realtime/MarketSocket';
import { ProsticksPrimitive } from '../primitives/ProsticksPrimitive';
import { IchimokuPrimitive } from '../primitives/IchimokuPrimitive';
import { DrawingManager } from '../drawing/DrawingManager';
import { TOOL } from '../drawing/tools';
import { useI18n } from '../i18n';
import TextBoxLayer, { type TextBoxData } from './TextBoxLayer';

interface ChartPanelProps {
  code: string;
  interval: number;
  chartType: number;
  upper: number;
  /** 2026-08-04：叠加指标参数 (移动端设置面板接入, 真实传给后端) */
  upperParams?: number[];
  lower: number[];          // 多选副图指标 (支持多个叠加)
  /** 2026-08-04：副图指标参数 (移动端设置面板接入, 真实传给后端) */
  lowerParams?: number[];
  tool: number;
  decimals: number;
  /** 区域配色 (按后端 nation 字段切换, 见 src/constants/nation.ts) */
  palette: NationPalette;
  onZoomOut: () => void;
  onZoomIn: () => void;
  onShiftLeft: () => void;
  onShiftRight: () => void;
  /** 2026-07-29：副图上下移动 (dir = -1 上移 / +1 下移)，仅重排不重建 series */
  onReorderLower: (tech: number, dir: -1 | 1) => void;
  /** 2026-07-29：删除指定副图 */
  onRemoveLower: (tech: number) => void;
  registerExport: (fn: () => void) => void;
  /** 2026-07-30：撤销最后一个绘图对象 */
  onUndo: () => void;
  /** 2026-07-30：当前是否存在可撤销对象 (用于按钮 disabled) */
  canUndo: boolean;
  /** 2026-07-30：通知父组件刷新 canUndo (在 DrawingManager.objects 变化时调用) */
  registerCanUndo: (can: boolean) => void;
  /** 2026-07-31：文字框创建后/右键退出时重置绘图工具 */
  onToolChange: (tool: number) => void;
  /** 2026-07-31：清除所有已绘制对象 (由工具栏"清除所有"按钮触发) */
  onClearAll: () => void;
  /** 2026-07-31：通知父组件刷新"清除所有"按钮的 disabled 状态 */
  registerCanClear: (can: boolean) => void;
  /** 2026-08-03：移动端横屏全屏状态 — 全屏时即使宽度>768px 也按手机布局处理 (主图 2x 拉伸 + 触摸平移门控) */
  fullscreen?: boolean;
  /** 2026-08-04：设备类型 — 触摸屏设备(pointer: coarse)为 true, 按手机布局处理 (pane 拉伸/手势门控/轴密度) */
  mobile?: boolean;
  /** 2026-08-04：移动端点击副图 pane → 循环切换副图指标 (由 MobileLayout 提供实现) */
  onCycleLower?: () => void;
}

// 图表类型常量 (与 types/index.ts 的 CHART_TYPE 对齐)
// 2026-07-31：新增 MAIN_VOLUME = 8，主图叠加成交量直方图 (Candle + Volume)
const TYPE = { PROSTICKS: 0, BAR: 2, BAR_MODAL: 3, CANDLE: 4, MODAL_LINE: 5, LINE: 6, AREA: 7, MAIN_VOLUME: 8 };

// 2026-07-21 18:28:13：集中维护手机与桌面的 pane 比例，避免 iframe 改变宽度后布局残留。
// 2026-08-04：判断标准由宽度改为设备类型 (mobile prop)。
// 2026-08-05：主图权重统一为 2 (PC/移动端一致) — 单副图时 2:1 (主图占 2/3), 多副图等分余下空间。
function applyPaneLayout(chart: IChartApi): void {
  const panes = chart.panes();
  if (panes.length === 0) return;
  panes[0].setStretchFactor(panes.length > 1 ? 2 : 1);
  for (let i = 1; i < panes.length; i++) panes[i].setStretchFactor(1);
}

export default function ChartPanel(props: ChartPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const mainSeriesRef = useRef<ISeriesApi<any> | null>(null);
  // 2026-08-04：切换 chartType 时待移除的旧主图 series。
  // 先创建新 series 再 removeSeries 旧 series —— v5 在 pane 变空时自动移除该 pane，
  // 若先移除主图 series，副图 pane（原 index 1）会被重编号为 0，新主图与副图 series 挤进同一 pane。
  const oldMainSeriesRef = useRef<ISeriesApi<any> | null>(null);
  // 2026-07-31：主图叠加成交量直方图 series (仅 MAIN_VOLUME 类型使用，与 mainSeriesRef 同生命周期)
  const volumeSeriesRef = useRef<ISeriesApi<any> | null>(null);
  const prosticksPrimRef = useRef<ProsticksPrimitive | null>(null);
  const ichimokuPrimRef = useRef<IchimokuPrimitive | null>(null);
  const drawingMgrRef = useRef<DrawingManager | null>(null);
  // 2026-08-03：镜像 props.fullscreen (横屏全屏), 供初始 effect 内的 resize() 闭包读取最新值
  const fullscreenRef = useRef(props.fullscreen === true);
  fullscreenRef.current = props.fullscreen === true;
  // 2026-08-05：全屏 hide 是否已执行过 — restore 据此跳过首次挂载 (初始加载由全量路径负责)
  const panesHiddenForFullscreenRef = useRef(false);
  // 2026-08-04：镜像 props.mobile (设备类型), 供 resize() 等闭包读取最新值
  const mobileRef = useRef(props.mobile === true);
  mobileRef.current = props.mobile === true;
  // 2026-08-04：任一指标参数非默认时置 true — WS 的 INDICATORS 增量按默认参数推送,
  // 与自定义参数结果不一致, 必须忽略 (主图 BAR 实时不受影响)。
  const wsIndicatorsDisabledRef = useRef(false);
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
  // 2026-07-27：文字框 React state — 与 DrawingManager 双向同步，由订阅回调驱动
  const [textBoxes, setTextBoxes] = useState<TextBoxData[]>([]);
  const [selectedTextBox, setSelectedTextBox] = useState<number | null>(null);
  const [editingTextBox, setEditingTextBox] = useState<number | null>(null);
  // 2026-07-29：副图标题浮层 — 每个 pane 相对容器顶部的像素偏移（用于浮层定位）
  const [paneTops, setPaneTops] = useState<number[]>([]);
  // 2026-08-04：pane 的 top+height（点击副图循环切换指标用, 由 updatePaneTops 同步维护）
  const [paneRects, setPaneRects] = useState<Array<{ top: number; height: number }>>([]);
  // 2026-07-29：副图实时 result (paneIndex → IndicatorResult)，浮层用其计算"当前值"
  const lowerResultsRef = useRef<Map<number, IndicatorResult>>(new Map());
  const [lowerValues, setLowerValues] = useState<Map<number, string>>(new Map());
  // 2026-07-31：副图加载/卸载骨架浮层 — 记录需要渲染骨架浮层的 paneIndex
  const [lowerLoadingStates, setLowerLoadingStates] = useState<Set<number>>(new Set());
  // 2026-07-31：副图淡出中（用户点击删除后 ~280ms 内显示淡出骨架）
  const [pendingFadingOut, setPendingFadingOut] = useState<Set<number>>(new Set());
  // 2026-07-30：副图数据异常 — sanitizePoints 后所有 series 都为空时标记，在浮层提示 message
  const [lowerErrorStates, setLowerErrorStates] = useState<Set<number>>(new Set());
  // 2026-07-30：本轮全量重建中加载失败的 tech 集合，对账时排除，避免重复请求失败项
  const failedLowerRef = useRef<Set<number>>(new Set());
  // 2026-08-04：跟踪当前已加载到 chart 的副图指标数组（精细增/删路径用）
  const lastLowerRef = useRef<number[]>([]);
  // 2026-08-04：首次 loadLowerIndicators 完成前，[lower] effect 必须跳过精细增/删，
  // 避免与全量路径并发重复创建 pane / 报 priceScale index 错误。
  const lowerInitializedRef = useRef(false);
  // 2026-07-30：删除按钮防连点时间锁（双击会误删前移上来的下一个 pane）
  const lastRemoveAtRef = useRef(0);
  // 2026-07-30：添加串行链版本锁 —— 每次 [lower] effect 递增，过期链放弃，
  // 保证任意时刻只有一条添加链在跑，杜绝并发链 paneIndex 撞车
  const lowerApplyVersionRef = useRef(0);
  const { t } = useI18n();

  // ---- 初始化图表 ----
  useEffect(() => {
    if (!containerRef.current) return;
    const wheelContainer = containerRef.current;
    // 2026-08-04：移动端轴坐标间距更小 (需求4) — 更小字号让价格轴刻度更密 (间距小, 便于读数),
    // barSpacing 5 (PC 7) 让蜡烛更紧凑, minBarSpacing 4 防止过度缩放导致蜡烛过小/过大。
    // 设备切换时 ChartPanel 整体重建, 无需运行时切换。
    const isMobileLayout = props.mobile === true;
    const chart = createChart(containerRef.current, {
      layout: {
        // 2026-07-22 12:51:45：iframe 图表不显示左下角 TradingView Logo 和跳转链接。
        attributionLogo: false,
        background: { type: ColorType.Solid, color: '#ffffff' },
        textColor: '#202020',
        fontSize: isMobileLayout ? 10 : 11,
        // 2026-07-29：每个 pane 上下边界的水平分隔线（颜色与右侧价格轴、底部时间轴一致）
        panes: {
          enableResize: true,
          separatorColor: '#c0c0c0',
          separatorHoverColor: 'rgba(74, 144, 217, 0.2)',
        },
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
        barSpacing: isMobileLayout ? 5 : 7,
        minBarSpacing: isMobileLayout ? 4 : undefined,
      },
    });
    chartRef.current = chart;
    const mgr = new DrawingManager(chart, null as any);
    drawingMgrRef.current = mgr;
    paneSeriesMapRef.current = new Map();

    // 2026-07-27：把文字框变更同步到 React state
    const refreshTextBoxes = () => setTextBoxes(mgr.getTextBoxes());
    refreshTextBoxes();
    const unsubscribeTextBoxes = mgr.subscribeTextBoxesChanged(refreshTextBoxes);

    // 十字光标移动 → 更新 OHLC 读数
    chart.subscribeCrosshairMove((param: MouseEventParams<Time>) => {
      updateInfoOverlay(param);
    });

    // 点击 → 绘图工具交互
    chart.subscribeClick((param: MouseEventParams<Time>) => {
      handleChartClick(param);
    });

    // 2026-07-30：右键 → 取消当前正在进行的画线 (清空点击阶段/预览, 工具保持选中)
    // 2026-07-31：文字框工具下右键 → 退出文字框工具，回到 NONE
    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      const mgr = drawingMgrRef.current;
      if (!mgr) return;
      if (mgr.getActiveTool() === TOOL.TEXTBOX) {
        mgr.setTool(TOOL.NONE);
        props.onToolChange(TOOL.NONE);
      } else {
        mgr.cancelDrawing();
      }
    };
    containerRef.current.addEventListener('contextmenu', onContextMenu);

    const resize = () => {
      if (!containerRef.current) return;
      // 2026-08-04：设备类型(pointer: coarse)判断手机布局, 与 iframe 宽度无关;
      // 横屏全屏时也按手机布局处理 (主图 2x 拉伸 + 触摸手势门控)。
      const isPhoneLayout = mobileRef.current || fullscreenRef.current;
      const toolActive = drawingMgrRef.current?.getActiveTool() !== TOOL.NONE;
      // 2026-07-21 18:28:13：手机 iframe 中纵向手势交给页面滚动，图表继续处理横向拖动。
      // 2026-08-03：工具激活时禁用触摸平移 (horzTouchDrag=false), 否则手指拖动会平移图表而非绘图。
      chart.applyOptions({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
        handleScroll: {
          mouseWheel: !isPhoneLayout,
          pressedMouseMove: true,
          horzTouchDrag: isPhoneLayout ? !toolActive : true,
          vertTouchDrag: !isPhoneLayout,
        },
      });
      // 2026-08-04：全屏时容器尺寸变化会触发本 resize, 若此处直接 applyPaneLayout
      // 会把副图 stretchFactor 重新设回 1, 覆盖全屏隐藏 — 统一走 syncPaneLayout。
      syncPaneLayout();
    };
    const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(resize);
    resizeObserver?.observe(containerRef.current);
    window.addEventListener('resize', resize);
    resize();

    return () => {
      // 2026-07-31：HMR 修复 — 先显式 detach 所有 primitive
      // 防止 HMR 重挂载后 mainSeriesRef 仍指向旧 chart 已销毁的 series,
      // 导致 renderMainSeries 调 chart.removeSeries(悬挂指针) 抛错、主图空白。
      if (mainSeriesRef.current) {
        if (prosticksPrimRef.current) mainSeriesRef.current.detachPrimitive(prosticksPrimRef.current);
        if (ichimokuPrimRef.current) mainSeriesRef.current.detachPrimitive(ichimokuPrimRef.current);
        if (drawingMgrRef.current) mainSeriesRef.current.detachPrimitive(drawingMgrRef.current);
      }
      resizeObserver?.disconnect();
      window.removeEventListener('resize', resize);
      unsubscribeTextBoxes();
      containerRef.current?.removeEventListener('contextmenu', onContextMenu);
      chart.remove();
      // 完整重置所有 ref — 避免悬挂指针泄漏到下次 mount
      chartRef.current = null;
      mainSeriesRef.current = null;
      oldMainSeriesRef.current = null;  // 2026-08-04：待移除旧主图 series，chart.remove() 时一并销毁
      volumeSeriesRef.current = null;  // 2026-07-31：成交量 overlay ref
      prosticksPrimRef.current = null;
      ichimokuPrimRef.current = null;
      drawingMgrRef.current = null;
      overlaySeriesRef.current = [];
      paneSeriesMapRef.current = new Map();
      barsRef.current = [];
      lowerResultsRef.current.clear();
      setTextBoxes([]);
      setSelectedTextBox(null);
      setEditingTextBox(null);
      delete (window as any).__chartZoom;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- 数据加载（code/interval/decimals 变化时全量重建）----
  // 2026-08-04（0感切换优化）：chartType 不再触发本 effect —— 切换图表类型时数据未变，
  // 重新拉 bars + 全量重建副图 pane（removePane→重建）会造成"pane 从 1 到 2"的闪烁；
  // 类型切换走下方独立的 [chartType] effect（用缓存 bars 同步重建主图，副图 pane 不动）。
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
        loadOverlayIndicator(props.upper, props.code, props.interval, props.upperParams);
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
  }, [props.code, props.interval, props.decimals]);

  // ---- 图表类型切换（0感）----
  // 2026-08-04：数据未变，仅用缓存 bars 同步重建主图 series（renderMainSeries 内部
  // 先建新 series 再移除旧 series，pane 结构不变），副图 pane / 叠加 series 完全不动。
  // 唯一例外：Ichimoku 的 primitive 挂在主图 series 上，随旧 series 销毁需重建（其余叠加指标
  // 是独立 series 保留即可）。
  useEffect(() => {
    if (!chartRef.current || barsRef.current.length === 0) return;
    renderMainSeries(barsRef.current, props.chartType, props.decimals);
    if (props.upper === UPPER_TECH.IKH) {
      loadOverlayIndicator(props.upper, props.code, props.interval, props.upperParams);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.chartType]);

  // ---- 叠加指标切换 ----
  useEffect(() => {
    loadOverlayIndicator(props.upper, props.code, props.interval, props.upperParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.upper]);

  // ---- 副图指标切换 (多选) ----
  // 2026-08-04：拆成两个 effect：
  //   - 数据加载大 effect [code, interval, chartType, decimals]：code/interval 变化时全量重建副图
  //     （2026-08-04 删除冗余的 [code, interval] 独立 effect —— 它与大 effect 重复调用
  //     loadLowerIndicators 造成初始加载并发竞态：两个全量重建交错执行，panesLen 出现 0/1/2 抖动，
  //     是切换类型残留 series 的诱因之一；大 effect 已覆盖全部变化场景）
  //   - [lower]：精细增/删（其他副图 series 保持原样，removeSeries+removePane / addSeries+setData）
  // 顺序变化由 handleMoveLower 走 panes.moveTo() 即时切换，不走这里。
  useEffect(() => {
    const curr = props.lower;

    // 2026-08-04：首次挂载 / code/interval 变化的全量重建还在 in-flight 时，[lower] effect 必须跳过。
    // 否则会和 loadLowerIndicators 并发重复创建同一个 pane（导致 priceScale index 错误）。
    if (!lowerInitializedRef.current) return;

    const prev = lastLowerRef.current;
    const prevSet = new Set(prev);
    const currSet = new Set(curr);

    // 找新增 / 删除
    const added = curr.filter((t) => !prevSet.has(t));
    const removed = prev.filter((t) => !currSet.has(t));

    // 2026-08-04：单删单增 → 原地替换（移动端点击副图循环切换）——
    // 复用同一 pane（空间固定、无过渡动画）: 先异步加载新指标（旧指标继续显示）,
    // 就绪后同一帧 addSeries 新 + removeSeries 旧, pane 始终非空不被自动移除。
    // 不再走"删除 pane → 骨架淡出 → 重建 pane"的路径, 副图高度全程不变。
    if (removed.length === 1 && added.length === 1) {
      lastLowerRef.current = [...curr];
      replaceLowerPane(removed[0], added[0], props.code, props.interval);
      return;
    }

    // 2026-07-30：删除走**精细路径**（removeLowerPane 用 series 引用反查，只删目标 pane）。
    // 之前全量重建（清空→逐个重建）会造成"从 0 逐个长出 pane"的渐变动画；
    // 精细删除其他 pane 原样不动，无动画。
    removed.forEach((tech) => removeLowerPane(tech));

    // 同步 lastLowerRef（删除已在 removeLowerPane 内 filter，这里覆盖为最终顺序）
    lastLowerRef.current = [...curr];

    if (removed.length > 0) {
      // 仅删除时同步刷新布局
      syncPaneLayout();
      requestAnimationFrame(fitTimeScaleDefault);
    }

    // 异步新增：先标记 loading，再逐个串行 addSeries（不闪烁，保持精细路径）
    // 2026-07-30：必须串行！addLowerPane 内部用 chart.panes().length 作为真实 paneIndex，
    // 并发时多个任务读到相同 length，后加的指标会挤进同一个 pane 导致 series 互相覆盖
    if (added.length > 0) {
      // 2026-07-30：版本锁 —— 本轮独占，props.lower 再次变化时新 effect 递增版本，
      // 本轮循环检测到过期立即放弃，由新 effect 重新计算 diff，避免两条链交错
      const version = ++lowerApplyVersionRef.current;
      // 新 paneIndex 取决于：删除后剩余的 lastLowerRef + 1
      const baseIdx = lastLowerRef.current.length + 1;
      setLowerLoadingStates((p) => {
        const next = new Set(p);
        added.forEach((t) => next.add(t));
        return next;
      });
      (async () => {
        for (let i = 0; i < added.length; i++) {
          if (lowerApplyVersionRef.current !== version) return; // 过期链放弃，由新 effect 处理
          await addLowerPane(added[i], baseIdx + i, props.code, props.interval);
        }
      })().catch((e) => console.error('新增副图串行失败', e));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.lower]);

  // 2026-07-29：同步每个 pane 相对 chart-container 顶部的像素偏移，用于副图标题浮层定位
  // 2026-07-30：提取为可复用函数 —— 精细删除后立即调用，避免浮层在 pane 重排后位置错乱/丢失
  const updatePaneTops = useCallback(() => {
    const chart = chartRef.current;
    const container = containerRef.current;
    if (!chart || !container) return;
    const panes = chart.panes();
    const containerRect = container.getBoundingClientRect();
    const tops = panes.map((p) => {
      const el = p.getHTMLElement();
      if (!el) return 0;
      return el.getBoundingClientRect().top - containerRect.top;
    });
    setPaneTops(tops);
    // 2026-08-04：同步记录每个 pane 的 top+height（点击副图切换指标用）
    setPaneRects(
      panes.map((p) => {
        const el = p.getHTMLElement();
        const rect = el ? el.getBoundingClientRect() : null;
        return rect ? { top: rect.top - containerRect.top, height: rect.height } : { top: 0, height: 0 };
      }),
    );
  }, []);

  useEffect(() => {
    const chart = chartRef.current;
    const container = containerRef.current;
    if (!chart || !container) return;

    const updatePositions = () => updatePaneTops();

    updatePositions();

    // 用 ResizeObserver 监听每个 pane DOM 元素的变化（重排、缩放副图时）
    const ro = new ResizeObserver(updatePositions);
    const panes = chart.panes();
    const observed: Element[] = [];
    panes.forEach((p) => {
      const el = p.getHTMLElement();
      if (el) {
        ro.observe(el);
        observed.push(el);
      }
    });

    // 横向滚动/缩放不改变 pane top（pane 上下不变），但 separator 拖拽会改变 pane 高度
    // subscribeVisibleTimeRangeChange 也会触发（保守起见）
    const ts = chart.timeScale();
    ts.subscribeVisibleTimeRangeChange(updatePositions);

    // 容器尺寸变化
    const onResize = () => updatePositions();
    window.addEventListener('resize', onResize);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', onResize);
      // unsubscribeVisibleTimeRangeChange 不需要 — chart.remove() 时自动解绑
    };
  }, [props.lower.length]); // 副图数量变化时重挂

  // 2026-07-29：副图值格式化（响应 lowerResultsRef 变化；key=tech）
  const refreshLowerValues = useCallback(() => {
    const next = new Map<number, string>();
    lowerResultsRef.current.forEach((result, tech) => {
      next.set(tech, formatLastValue(result, props.decimals));
    });
    setLowerValues(next);
  }, [props.decimals]);

  // ---- 绘图工具切换 ----
  useEffect(() => {
    drawingMgrRef.current?.setTool(props.tool);
    updateToolHint(props.tool);
    // 2026-08-03：工具激活时立即禁用触摸平移 (horzTouchDrag=false),
    // 无需等 resize —— 否则选中工具后手指拖动仍会平移图表而非绘图预览。
    const chart = chartRef.current;
    const c = containerRef.current;
    if (chart && c) {
      const isPhoneLayout = mobileRef.current || fullscreenRef.current;
      const toolActive = drawingMgrRef.current?.getActiveTool() !== TOOL.NONE;
      chart.applyOptions({
        handleScroll: {
          mouseWheel: !isPhoneLayout,
          pressedMouseMove: true,
          horzTouchDrag: isPhoneLayout ? !toolActive : true,
          vertTouchDrag: !isPhoneLayout,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.tool]);

  // ---- 横屏全屏: 只显示主图 ----
  // 2026-08-04：进入/退出全屏即时重排 pane, 不依赖 resize。
  // 2026-08-05：改为真正隐藏/恢复副图 — 移除 series → 空 pane 自动删除 (主图占满 100%,
  // 无 2px 细缝); 退出全屏从 lowerResultsRef 缓存重建, 零网络请求、无闪烁。
  useEffect(() => {
    if (props.fullscreen) {
      hideLowerPanesForFullscreen();
    } else {
      void restoreLowerPanesFromCache();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.fullscreen]);

  // ---- 指标参数变化 (移动端设置面板接入) ----
  // 2026-08-04：upperParams/lowerParams 变化 → 用新参数重算对应指标：
  // - 叠加指标 loadOverlayIndicator (重建 series)
  // - 副图指标 resetLowerPane 精细重置 (pane 不动, 无闪烁)
  // 同时维护 wsIndicatorsDisabledRef：任一指标参数非默认 → 忽略 WS 指标增量。
  const paramsEffectInitializedRef = useRef(false);
  useEffect(() => {
    const disabled =
      !isDefaultParams('upper', props.upper, props.upperParams) ||
      props.lower.some((t) => !isDefaultParams('lower', t, props.lowerParams));
    wsIndicatorsDisabledRef.current = disabled;
    // 首次挂载由数据加载 effect 完成全量加载, 跳过重算
    if (!paramsEffectInitializedRef.current) {
      paramsEffectInitializedRef.current = true;
      return;
    }
    if (!chartRef.current) return;
    if (props.upper !== UPPER_TECH.NONE) {
      loadOverlayIndicator(props.upper, props.code, props.interval, props.upperParams);
    }
    props.lower.forEach((tech) => {
      void resetLowerPane(tech, props.code, props.interval);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.upperParams, props.lowerParams]);

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

  // ---- 2026-07-30：撤销 / 回滚 ----
  // 1) 监听来自 App 的撤销事件 (Ctrl+Z / toolbar / 移动按钮)
  useEffect(() => {
    const handler = () => {
      const mgr = drawingMgrRef.current;
      if (!mgr) return;
      mgr.undoLast();
      props.registerCanUndo(mgr.canUndo());
    };
    window.addEventListener('chart:undo', handler);
    return () => window.removeEventListener('chart:undo', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- 2026-08-03：取消当前绘制 (移动端"取消"按钮 / 触摸端右键替代) ----
  useEffect(() => {
    const handler = () => {
      const mgr = drawingMgrRef.current;
      if (!mgr) return;
      mgr.cancelDrawing();
    };
    window.addEventListener('chart:cancel-drawing', handler);
    return () => window.removeEventListener('chart:cancel-drawing', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2) 当 props.canUndo 与 mgr 实际状态不一致时, 主动同步 (防止 React state 滞后)
  useEffect(() => {
    const mgr = drawingMgrRef.current;
    if (!mgr) return;
    const real = mgr.canUndo();
    if (real !== props.canUndo) props.registerCanUndo(real);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  });

  // ---- 2026-07-31：清除所有 ----
  // 1) 监听来自 App 的"清除所有"事件 (Toolbar 扫帚按钮触发)
  useEffect(() => {
    const handler = () => {
      const mgr = drawingMgrRef.current;
      if (!mgr) return;
      mgr.clearAllDrawings();
      // 同步通知父组件两个按钮的可用态
      props.registerCanUndo(mgr.canUndo());
      props.registerCanClear(mgr.canUndo());
    };
    window.addEventListener('chart:clear-all', handler);
    return () => window.removeEventListener('chart:clear-all', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2) 初始化时主动把 canClear = canUndo 同步给 App (mgr 刚 new 出来, objects 为空 → false)
  useEffect(() => {
    const mgr = drawingMgrRef.current;
    if (!mgr) return;
    props.registerCanClear(mgr.canUndo());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 3) 任何时候 mgr.canUndo() 与 props.canUndo 不一致时, 同步两个状态 (避免 React 滞后)
  useEffect(() => {
    const mgr = drawingMgrRef.current;
    if (!mgr) return;
    const real = mgr.canUndo();
    if (real !== props.canUndo) {
      props.registerCanUndo(real);
      props.registerCanClear(real);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  });

  // ---- 渲染主图序列 ----
  const renderMainSeries = (bars: Bar[], chartType: number, decimals: number) => {
    const chart = chartRef.current!;
    // 2026-07-31：先清理上一轮可能存在的 volume overlay series（HMR / 切换 chartType 路径）
    if (volumeSeriesRef.current) {
      try { chart.removeSeries(volumeSeriesRef.current); } catch (_) { /* ignore */ }
      volumeSeriesRef.current = null;
    }
    // 移除旧的主序列与 primitive
    if (mainSeriesRef.current) {
      // 2026-07-31：先显式 detach 旧 primitive，再 removeSeries。
      // 旧代码只置 null ref、没从 series 上 detach primitive，切换 chartType 时
      // 旧 primitive 仍短暂挂在旧 series 上，且 dispose 时机依赖 lightweight-charts 内部，
      // HMR 路径下可能不一致。显式 detach 让状态更可预测。
      if (prosticksPrimRef.current) {
        mainSeriesRef.current.detachPrimitive(prosticksPrimRef.current);
        prosticksPrimRef.current = null;
      }
      if (ichimokuPrimRef.current) {
        mainSeriesRef.current.detachPrimitive(ichimokuPrimRef.current);
        ichimokuPrimRef.current = null;
      }
      if (drawingMgrRef.current) {
        mainSeriesRef.current.detachPrimitive(drawingMgrRef.current);
        // 注意：drawingMgrRef 是单例，不置 null — 后续会重新 attach 到新 series
      }
      // 2026-08-04（修复切换类型平线）：不在此 removeSeries —— 延后到新 series 创建后再移除。
      // 原因：v5 在 pane 变空时自动移除该 pane；若先移除主图 series，且当前存在副图 pane 时，
      // 副图 pane（原 index 1）会被重编号为 0，随后创建的新主图 series 将与副图 series
      // 挤进同一 pane（移动端默认带副图 → 切换类型后主图被成交量柱撑爆价格刻度 → 平线/点）。
      oldMainSeriesRef.current = mainSeriesRef.current;
      mainSeriesRef.current = null;
    } else {
      // mainSeriesRef 已被 cleanup 重置（正常路径），但 ref 还可能指向旧 prim
      if (prosticksPrimRef.current) prosticksPrimRef.current = null;
      if (ichimokuPrimRef.current) ichimokuPrimRef.current = null;
    }

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
        upColor: props.palette.bar.upColor,
        downColor: props.palette.bar.downColor,
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
        upColor: props.palette.candle.upColor,
        downColor: props.palette.candle.downColor,
        borderUpColor: props.palette.candle.borderUpColor,
        borderDownColor: props.palette.candle.borderDownColor,
        wickUpColor: props.palette.candle.wickUpColor,
        wickDownColor: props.palette.candle.wickDownColor,
        priceFormat,
      });
      series.setData(
        bars.filter((b) => b.h > 0).map((b) => ({
          time: b.time as Time, open: b.o, high: b.h, low: b.l, close: b.c,
        })),
      );
    }
    mainSeriesRef.current = series;

    // 2026-08-04（修复切换类型平线）：新主图 series 已挂到 pane 0，此刻移除旧 series
    // 不会触发"pane 变空自动移除"（pane 0 仍有新 series），副图 pane 索引保持不变。
    if (oldMainSeriesRef.current) {
      try {
        chart.removeSeries(oldMainSeriesRef.current);
      } catch (_) { /* ignore */ }
      oldMainSeriesRef.current = null;
    }

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

    // 2026-07-31：主图叠加成交量直方图（仅 MAIN_VOLUME 类型）
    // 挂在主图 pane（paneIndex 0）的独立 price scale，占主图底部 ~15% 高度，不显示坐标轴
    if (chartType === TYPE.MAIN_VOLUME) {
      try {
        const volumeScaleId = 'volume_overlay';
        const volSeries = chart.addSeries(
          HistogramSeries,
          {
            priceFormat: { type: 'volume' },
            priceScaleId: volumeScaleId,
            color: props.palette.bar.upColor,
          },
          0,
        );
        const validBars = bars.filter((b) => b.h > 0);
        volSeries.setData(
          validBars.map((b) => ({
            time: b.time as Time,
            value: b.v,
            color: b.c >= b.o ? props.palette.bar.upColor : props.palette.bar.downColor,
          })),
        );
        // 把成交量压到主图底部 15%，并隐藏独立 price scale 的刻度文字
        chart.priceScale(volumeScaleId).applyOptions({
          scaleMargins: { top: 0.85, bottom: 0 },
          visible: false,
        });
        volumeSeriesRef.current = volSeries;
      } catch (e) {
        console.warn('[ChartPanel] 创建成交量 overlay 失败:', e);
      }
    }

    // 2026-07-30: fitContent 推迟到下一帧, 确保 price scale 已基于 setData
    // 数据完成首次 auto-scale 后再触发布局, 避免 primitive 在 priceToCoordinate
    // 返回画布几何中心时被绘制,造成"红点全在水平线"的视觉异常。
    requestAnimationFrame(fitTimeScaleDefault);
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
    // 2026-07-31：主图叠加成交量 — 实时增量同步更新最末点高度与颜色
    if (volumeSeriesRef.current && message.bar.v > 0) {
      volumeSeriesRef.current.update({
        time: message.bar.time as Time,
        value: message.bar.v,
        color: message.bar.c >= message.bar.o
          ? props.palette.bar.upColor
          : props.palette.bar.downColor,
      });
    }
    prosticksPrimRef.current?.setData(bars);
  };

  const applyIndicatorDelta = (
    seriesList: ISeriesApi<any>[], result: IndicatorResult, indicatorType?: number, tech?: number,
  ): void => {
    result.series.forEach((item, index) => {
      const point = item.data[0];
      const series = seriesList[index];
      if (!series || !point || point.value === null) return;
      const update: any = { time: point.time as Time, value: point.value };
      if (indicatorType === LOWER_TECH.MACD && index === 2) {
        update.color = point.value >= 0 ? props.palette.overlay.up : props.palette.overlay.down;
      }
      series.update(update);
    });
    // 2026-07-29：副图增量数据时更新缓存与浮层值（key=tech）
    if (tech !== undefined) {
      lowerResultsRef.current.set(tech, result);
      refreshLowerValues();
    }
  };

  const handleRealtimeIndicators = (message: RealtimeIndicatorsMessage): void => {
    const selected = liveSelectionRef.current;
    if (message.code !== selected.code || message.interval !== selected.interval) return;
    // 2026-08-04：自定义参数时 WS 的 INDICATORS 增量按默认参数推送, 与展示结果不一致 — 忽略
    // (主图 BAR 实时更新不受影响)。
    if (wsIndicatorsDisabledRef.current) return;
    if (message.upper?.type === selected.upper) {
      applyIndicatorDelta(overlaySeriesRef.current, message.upper.result);
      if (selected.upper === UPPER_TECH.IKH) {
        ichimokuPrimRef.current?.applyDelta(
          message.upper.result, barsRef.current, selected.interval <= 2,
        );
      }
    }
    message.lower.forEach((update) => {
      // 2026-07-30：key=tech 直接取，不再 indexOf 推算 paneIndex（位置无关）
      const seriesList = paneSeriesMapRef.current?.get(update.type) ?? [];
      applyIndicatorDelta(seriesList, update.result, update.type, update.type);
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

  const loadOverlayIndicator = async (upper: number, code: string, interval: number, params?: number[]) => {
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
      // 2026-08-04：参数接入 — 按指标个数格式化后传给后端 (null 走默认)。
      const result = await indicatorApi.calculate(
        'upper', upper, code, interval, formatIndicatorParams('upper', upper, params), upper === UPPER_TECH.IKH,
      );
      if (requestId !== overlayRequestRef.current || chartRef.current !== chart || !mainSeriesRef.current) return;
      for (const s of result.series) {
        const series = chart.addSeries(LineSeries, {
          color: s.color,
          lineWidth: 1,
          priceScaleId: 'right',
          lastValueVisible: true,
        });
        // 2026-07-30：兜底 — sanitizePoints 丢弃 NaN/undefined/重复 time，避免 setData 抛 Assertion 导致主图加载失败
        const { points } = sanitizePoints(s.data);
        series.setData(points.map((d) => ({ time: d.time as Time, value: d.value })));
        overlaySeriesRef.current.push(series);
      }
      if (upper === UPPER_TECH.IKH && result.id === 'IKH') {
        const primitive = new IchimokuPrimitive(chart, mainSeriesRef.current);
        primitive.setData(result, barsRef.current, interval <= 2);
        mainSeriesRef.current.attachPrimitive(primitive);
        ichimokuPrimRef.current = primitive;
        fitTimeScaleDefault();
      }
    } catch (e) {
      console.error('加载叠加指标失败', e);
    }
  };

  // 2026-08-04：默认放大程度 — 目标蜡烛宽度约 8px, 移动/PC 观感一致:
  // 移动端竖屏约 50 根/屏, PC 端按容器宽度自适应 (1280px 约 160 根, 比全量 300 根放大近一倍)。
  const TARGET_BAR_SPACING = 8;
  const MOBILE_MIN_VISIBLE_BARS = 20;
  const PC_MIN_VISIBLE_BARS = 60;

  // 统一的时间轴默认范围入口 — 替换所有裸 fitContent 调用点 (主图/副图加载/删除后),
  // 避免副图加载后的 fitContent 覆盖主图已设置的默认放大范围。
  const fitTimeScaleDefault = () => {
    const chart = chartRef.current;
    if (!chart) return;
    const ts = chart.timeScale();
    const minBars = mobileRef.current ? MOBILE_MIN_VISIBLE_BARS : PC_MIN_VISIBLE_BARS;
    const bars = barsRef.current;
    const width = containerRef.current?.clientWidth ?? 0;
    const count = Math.max(minBars, Math.round(width / TARGET_BAR_SPACING));
    ts.setVisibleLogicalRange({
      from: Math.max(0, bars.length - count),
      to: bars.length + 2,
    });
  };

  const syncPaneLayout = () => {
    const chart = chartRef.current;
    if (!chart) return;
    // 2026-07-21 18:28:13：手机主图保持双倍权重，桌面继续使用原有等比例 pane 布局。
    // 2026-08-04：按设备类型判断手机布局 (横屏全屏也按手机布局处理)。
    // 2026-08-05：主图权重统一 2 (PC 2:1); 全屏隐藏副图由 hideLowerPanesForFullscreen
    // 移除 pane 实现 (库对 pane 高度有硬性 2px 下限, setStretchFactor(0) 只能压成细缝)。
    applyPaneLayout(chart);
  };

  // ---- 加载副图指标 (多选, 每个指标占一个独立 pane) ----
  // 2026-08-04：拆成 4 个精细路径 + 1 个全量路径。
  //   - 全量路径：仅在 code/interval 变化时使用（数据源整体换了）
  //   - addLowerPane / removeLowerPane / resetLowerPane：精细化增/删/重置单副图，其他副图不动
  //
  // 给定 result，为指定 paneIndex 创建 series + 写入数据（addLowerPane 与全量路径共用这段循环）。
  // 2026-07-30：所有 setData 走 sanitizePoints，脏数据(NaN/重复 time/乱序)被丢弃，不再让 setData 抛 Assertion。
  // 2026-07-30：返回 { seriesList, allEmpty }：所有 series 都空 → 浮层显示 message 而非空白。
  // 2026-07-30：每个 addSeries/setData 单独 try/catch，单 series 失败不影响后续 series 写入。
  const buildPaneSeries = (
    chart: IChartApi,
    lower: number,
    paneIndex: number,
    result: IndicatorResult,
  ): { seriesList: ISeriesApi<any>[]; allEmpty: boolean } => {
    const seriesList: ISeriesApi<any>[] = [];
    const isHistogram = lower === LOWER_TECH.VOLUME || lower === LOWER_TECH.VOLP;
    let totalPoints = 0;
    for (let i = 0; i < result.series.length; i++) {
      const s = result.series[i];
      const { points } = sanitizePoints(s.data);
      totalPoints += points.length;
      try {
        let series: ISeriesApi<any>;
        if (lower === LOWER_TECH.MACD && i === 2) {
          // MACD 柱状图 (第 3 条), 涨跌不同色
          series = chart.addSeries(HistogramSeries, {}, paneIndex);
          series.setData(
            points.map((d) => ({
              time: d.time as Time,
              value: d.value,
              color: d.value >= 0 ? props.palette.overlay.up : props.palette.overlay.down,
            })),
          );
        } else if (isHistogram && i === 0) {
          // Volume / VolumePlus 柱状图
          series = chart.addSeries(HistogramSeries, { color: s.color }, paneIndex);
          series.setData(points.map((d) => ({ time: d.time as Time, value: d.value })));
        } else {
          series = chart.addSeries(LineSeries, { color: s.color, lineWidth: 1 }, paneIndex);
          series.setData(points.map((d) => ({ time: d.time as Time, value: d.value })));
        }
        seriesList.push(series);
      } catch (e) {
        console.warn(`[ChartPanel] buildPaneSeries 第 ${i} 条 series 失败 (已跳过):`, e);
      }
    }
    try {
      chart.priceScale('right', paneIndex).applyOptions({ scaleMargins: { top: 0.1, bottom: 0.1 } });
    } catch (e) {
      console.warn('[ChartPanel] priceScale applyOptions 失败:', e);
    }
    return { seriesList, allEmpty: totalPoints === 0 };
  };

  /** 全量加载副图（仅在 code/interval 变化时调用，先清空再重建所有副图）。 */
  const loadLowerIndicators = async (selected: number[], code: string, interval: number) => {
    const chart = chartRef.current;
    const paneMap = paneSeriesMapRef.current;
    if (!chart || !paneMap) return;
    // 2026-08-04：先**同步**设置 lastLowerRef，[lower] effect 看到 prev === curr 就不会重复 add。
    // 等价于把"占位"先放好 — 即使后续 addSeries 还没回来，[lower] effect 也不会重复触发。
    lastLowerRef.current = [...selected];
    // 2026-08-04：code/interval 变化触发全量重建期间，[lower] effect 必须跳过精细增/删。
    lowerInitializedRef.current = false;
    try {
      // 清除所有旧副图序列 + 重置浮层值缓存
      // 2026-07-30 重写：全量、索引无关、无残留。
      // v5 的 removePane 只 splice 布局数组（不删除 pane 内 series），且 index 越界会 assert 抛错。
      // 因此必须：① 先通过 pane.getSeries() 清掉**所有**副图 series（含 paneMap 未记录的孤儿）；
      // ② 再固定 removePane(1)（永远删第一个副图）循环删到只剩主图，索引永不越界。
      const allPanes = chart.panes();
      for (let pi = 1; pi < allPanes.length; pi++) {
        // 2026-07-30：removeSeries 在 pane 变空时自动移除 pane，快照里的 pane 可能已失效，
        // getSeries() 也必须 try/catch，否则中断清空
        try {
          for (const s of allPanes[pi].getSeries()) {
            if (!s) continue;
            try {
              chart.removeSeries(s);
            } catch (_) { /* ignore */ }
          }
        } catch (_) { /* ignore */ }
      }
      paneMap.clear();
      lowerResultsRef.current.clear();
      setLowerValues(new Map());
      // 2026-07-30：清空"数据异常"标记，等待重新加载
      if (lowerErrorStates.size > 0) setLowerErrorStates(new Set());
      // 2026-07-30：removePane(1) 循环 —— 每次删第一个副图，直到只剩主图；
      // 每个单独 try/catch，一旦失败立即中止（避免死循环），剩余 pane 由数量对账兜底
      let guard = 0;
      while (chart.panes().length > 1 && guard++ < 50) {
        try {
          chart.removePane(1);
        } catch (e) {
          console.warn(`[ChartPanel] 清空副图 pane 失败:`, e);
          break;
        }
      }
      // 2026-07-31：removePane 已把所有 pane 干掉，"待淡出"骨架没必要继续显示
      if (pendingFadingOut.size > 0) setPendingFadingOut(new Set());
      if (selected.length === 0) {
        setLowerLoadingStates(new Set());
        syncPaneLayout();
        // 2026-08-05：不再提前 return —— 让下方对账逻辑兜底"挂载期 lower 已变化但
        // [lower] effect 因 lowerInitializedRef=false 被跳过"的竞态:
        // 进入移动端时 App 同步提交默认副图, 而本 effect 闭包捕获的是挂载时的旧 lower,
        // 变化会被 [lower] effect 吞掉; 走到对账后按 liveSelectionRef 补 addLowerPane。
      }

      // 2026-07-31：标记 N 个副图为"加载中"，骨架浮层立即淡入（key=tech）
      setLowerLoadingStates(new Set(selected));

      // 每个副图指标分配一个独立 pane（从 1 开始, 0 是主图）
      // 2026-07-30：nextPane 只对成功项递增 —— 失败项不占 paneIndex，
      // 避免后续项跳过失败位导致空 pane / addSeries 越界 / paneMap 与 chart 错位
      let nextPane = 1;
      for (let idx = 0; idx < selected.length; idx++) {
        const lower = selected[idx];
        const paneIndex = nextPane;
        try {
          const result = await indicatorApi.calculate('lower', lower, code, interval, formatIndicatorParams('lower', lower, props.lowerParams));
          // 2026-08-05：全屏中只缓存不建 series (退出全屏由 restore 统一补建, 不占 paneIndex)
          lowerResultsRef.current.set(lower, result);
          if (fullscreenRef.current) continue;
          const { seriesList, allEmpty } = buildPaneSeries(chart, lower, paneIndex, result);
          paneMap.set(lower, seriesList);
          // 2026-07-31：数据就绪 → 从 loading 集合移除，对应骨架淡出
          setLowerLoadingStates((prev) => {
            const next = new Set(prev);
            next.delete(lower);
            return next;
          });
          // 2026-07-30：兜底 — 全部数据被 sanitize 丢弃时，标记该 pane 为 error，浮层显示 message
          if (allEmpty) {
            setLowerErrorStates((prev) => new Set(prev).add(lower));
          }
          nextPane++;
          failedLowerRef.current.delete(lower);
        } catch (e) {
          console.error(`加载副图指标 ${lower} 失败`, e);
          // 加载失败同样标记为 error（API 返回了非预期响应）
          setLowerErrorStates((prev) => new Set(prev).add(lower));
          // 2026-07-30：失败回滚 — 该指标不占 pane，从 lastLowerRef 移除 + 通知父组件取消勾选，
          // 否则 props.lower 里的失败占位会让后续删除操作 indexOf 推算错位删错指标
          failedLowerRef.current.add(lower);
          lastLowerRef.current = lastLowerRef.current.filter((t) => t !== lower);
          props.onRemoveLower(lower);
        }
      }
      refreshLowerValues();
      syncPaneLayout();
      // 2026-07-30: 副图指标异步加载完成后再 fitContent,
      // 避免主图被空 pane 挤压造成副图"挤在画布中间"的视觉异常。
      requestAnimationFrame(fitTimeScaleDefault);
    } catch (e) {
      console.error('[ChartPanel] loadLowerIndicators 异常（已恢复标志）:', e);
    } finally {
      // 2026-07-30：无论成功/异常，必须恢复标志 —— 否则 [lower] effect 永久跳过，
      // 所有删除/添加操作全部失效（勾选与 pane 不一致的偶发根因）
      lowerInitializedRef.current = true;
    }
    // 2026-07-30：对账 — 重建 in-flight 期间用户可能增删过副图，
    // 用 liveSelectionRef.current.lower 与 lastLowerRef 做 diff，补齐差异避免 pane 残留/缺失
    const liveLower = liveSelectionRef.current.lower;
    const prevLower = lastLowerRef.current;
    const liveSet = new Set(liveLower);
    const prevSet = new Set(prevLower);
    // 2026-07-30：stillMissing 排除本轮失败项 —— props.onRemoveLower 走 App 16ms pending 通道，
    // 对账执行时 liveSelectionRef 可能还是旧值（含刚失败的指标），排除后可避免重复请求失败项
    const stillMissing = liveLower.filter((t) => !prevSet.has(t) && !failedLowerRef.current.has(t));
    const needRemove = prevLower.filter((t) => !liveSet.has(t));
    if (needRemove.length > 0) {
      // 2026-07-30：重建 in-flight 期间发生了删除 → 统一走全量重建（以最新 liveLower 为准），
      // 不再精细 removeLowerPane，避免删除后浮层/paneTops 状态残留
      lastLowerRef.current = [...liveLower];
      void loadLowerIndicators(liveLower, code, interval);
      return;
    }
    if (stillMissing.length > 0) {
      // 重建期间新增的指标 → 精细补充（不闪烁）
      lastLowerRef.current = [...liveLower];
      stillMissing.forEach((tech, i) =>
        addLowerPane(tech, lastLowerRef.current.length - stillMissing.length + 1 + i, code, interval),
      );
    }
    // 2026-07-30：数量对账 — 重建/对账后 chart 副图 pane 数与 liveLower 数必须一致。
    // 若仍不一致（历史遗留的幽灵 pane：series 挂在 chart 但 paneMap/lastLowerRef 均无记录），
    // 从末尾逐个移除多余 pane，保证下拉勾选数与 pane 数严格一致。
    const extra = chart.panes().length - 1 - liveLower.length;
    if (extra > 0) {
      for (let k = 0; k < extra; k++) {
        const lastIdx = chart.panes().length - 1;
        if (lastIdx < 1) break;
        try {
          // 幽灵 series 不在 paneMap 里，通过 pane.getSeries() 兜底移除
          const orphans = chart.panes()[lastIdx].getSeries();
          for (const s of orphans) {
            try { chart.removeSeries(s); } catch (_) { /* ignore */ }
          }
        } catch (_) { /* ignore */ }
        try {
          chart.removePane(lastIdx);
        } catch (e) {
          console.warn(`[ChartPanel] 对账移除幽灵 pane ${lastIdx} 失败:`, e);
        }
      }
      syncPaneLayout();
      refreshLowerValues();
    }
  };

  /** 精细新增：仅 addSeries + setData 一个新 pane，其他副图完全不动。
   *  2026-07-30：兜底 — paneIndex 用 chart.panes().length 现场取值，避免外部传入的索引与真实 pane 错位。
   *  2026-07-30：失败回滚 — 用 chart 当前真实状态清理半创建的 pane/series，并通知父组件回滚 props.lower，
   *  防止后续 paneIndex 计算再次错位导致连锁失败。
   */
  const addLowerPane = async (
    tech: number,
    hintPaneIndex: number,
    code: string,
    interval: number,
  ) => {
    const chart = chartRef.current;
    const paneMap = paneSeriesMapRef.current;
    if (!chart || !paneMap) return;
    // 执行时的真实目标 paneIndex = 当前 pane 总数（新建会被追加到末尾）
    // 仅在 hintPaneIndex 落在合法范围时复用 hint（如 addSeries 显式传 index 场景的兼容性）
    const panesLenNow = chart.panes().length;
    const paneIndex = hintPaneIndex >= 1 && hintPaneIndex <= panesLenNow
      ? hintPaneIndex
      : panesLenNow;
    try {
      const result = await indicatorApi.calculate('lower', tech, code, interval, formatIndicatorParams('lower', tech, props.lowerParams));
      // 2026-08-05：全屏中只缓存不建 series (副图 pane 已被 hide 移除, 退出全屏由 restore 统一补建)
      lowerResultsRef.current.set(tech, result);
      if (fullscreenRef.current) {
        setLowerLoadingStates((prev) => {
          const next = new Set(prev);
          next.delete(tech);
          return next;
        });
        failedLowerRef.current.delete(tech);
        return;
      }
      const { seriesList, allEmpty } = buildPaneSeries(chart, tech, paneIndex, result);
      paneMap.set(tech, seriesList);
      setLowerLoadingStates((prev) => {
        const next = new Set(prev);
        next.delete(tech);
        return next;
      });
      if (allEmpty) setLowerErrorStates((prev) => new Set(prev).add(tech));
      failedLowerRef.current.delete(tech);
      refreshLowerValues();
      syncPaneLayout();
      requestAnimationFrame(fitTimeScaleDefault);
    } catch (e) {
      // 抓全 error（含 axios response/cause），方便排查 USD/CAD 等特定品种失败原因
      console.error(`新增副图指标 ${tech} 失败`, e);
      // 失败回滚：**仅当本次确实 addSeries 过（buildPaneSeries 半创建）才清理对应 pane。**
      // 2026-07-30：API 失败（calculate 抛错）时还没 addSeries 任何东西，
      // 之前无条件 removePane 会误删「最后一个已有 pane」→ props.lower 与图表错位 → 删错指标！
      const leftovers = paneMap.get(tech);
      if (leftovers && leftovers.length > 0) {
        for (const s of leftovers) {
          if (!s) continue;
          try { chart.removeSeries(s); } catch (_) { /* ignore */ }
        }
        paneMap.delete(tech);
        lowerResultsRef.current.delete(tech);
        // 半创建的 pane 才移除（addSeries 成功即创建了 pane）
        const curLen = chart.panes().length;
        if (paneIndex >= 1 && paneIndex < curLen) {
          try { chart.removePane(paneIndex); } catch (_) { /* ignore */ }
        }
      }
      // 把失败 tech 从 lastLowerRef 移除，避免后续 indexOf 推算越界
      lastLowerRef.current = lastLowerRef.current.filter((t) => t !== tech);
      // 通知父组件把失败指标从选中数组移除，保证 props.lower 与真实 pane 始终对齐
      props.onRemoveLower(tech);
      failedLowerRef.current.add(tech);
      setLowerLoadingStates((prev) => {
        const next = new Set(prev);
        next.delete(tech);
        return next;
      });
      setLowerErrorStates((prev) => new Set(prev).add(tech));
    }
  };

  /** 2026-08-04：副图原地替换（移动端点击副图循环切换 / PC 单删单增）——
   *  复用同一 pane, 切换过程中副图空间固定、无过渡动画。
   *  先异步加载新指标（旧指标继续显示）→ 数据就绪后同一帧内
   *  addSeries 新 series（pane 非空, 不会被自动移除）→ removeSeries 旧 series。 */
  const replaceLowerPane = async (
    oldTech: number,
    newTech: number,
    code: string,
    interval: number,
  ) => {
    const chart = chartRef.current;
    const paneMap = paneSeriesMapRef.current;
    if (!chart || !paneMap) return;
    // 反查旧指标所在 pane（series 引用反查, 与 removeLowerPane 一致）
    const oldSeriesList = paneMap.get(oldTech) ?? [];
    const paneIndex = chart.panes().findIndex((p) =>
      oldSeriesList.some((s) => p.getSeries().includes(s)),
    );
    if (paneIndex < 1) {
      // 旧 pane 找不到（状态异常）→ 走原精细增/删路径兜底
      removeLowerPane(oldTech);
      addLowerPane(newTech, 1, code, interval);
      return;
    }
    try {
      const result = await indicatorApi.calculate('lower', newTech, code, interval);
      // 2026-08-05：全屏中只缓存不建 series (旧 series 已被 hide 移除, 由退出全屏的 restore 重建)
      if (fullscreenRef.current) {
        lowerResultsRef.current.set(newTech, result);
        lowerResultsRef.current.delete(oldTech);
        paneMap.delete(oldTech);
        failedLowerRef.current.delete(newTech);
        return;
      }
      // 数据就绪后原地替换: 先 addSeries 新（pane 非空, 不会被自动移除）→ 再 removeSeries 旧
      const { seriesList, allEmpty } = buildPaneSeries(chart, newTech, paneIndex, result);
      for (const s of oldSeriesList) {
        if (!s) continue;
        try { chart.removeSeries(s); } catch (_) { /* ignore */ }
      }
      paneMap.delete(oldTech);
      paneMap.set(newTech, seriesList);
      lowerResultsRef.current.delete(oldTech);
      lowerResultsRef.current.set(newTech, result);
      if (allEmpty) setLowerErrorStates((prev) => new Set(prev).add(newTech));
      setLowerErrorStates((prev) => { const n = new Set(prev); n.delete(oldTech); return n; });
      failedLowerRef.current.delete(newTech);
      refreshLowerValues();
      syncPaneLayout();
      updatePaneTops(); // 2026-08-04：pane 结构变化后同步 rects（副图点击区域判断用）
      requestAnimationFrame(fitTimeScaleDefault);
    } catch (e) {
      console.error(`替换副图指标 ${oldTech} → ${newTech} 失败`, e);
      // 失败回滚: 通知父组件取消新指标（旧指标仍显示, 由全量重建兜底收敛状态）
      props.onRemoveLower(newTech);
      failedLowerRef.current.add(newTech);
      setLowerErrorStates((prev) => new Set(prev).add(newTech));
    }
  };

  /** 精细删除：仅 removeSeries + removePane 一个 pane，其余副图完全不动。
   *  2026-07-30 重写（彻底废弃位置推算）：
   *  - 唯一可靠依据 = series 对象引用反查（chart.panes().findIndex(p => p.getSeries().includes(series))），
   *    无论 pane 怎么移动/重排，反查到的必是持有该 series 的 pane
   *  - 反查失败 → 不推算、不硬删，直接触发**全量重建兜底**（以 props.lower 为唯一事实来源），
   *    任何状态错位/残留都会被重建清掉，绝不会产生错误删除
   */
  const removeLowerPane = (tech: number) => {
    const chart = chartRef.current;
    const paneMap = paneSeriesMapRef.current;
    if (!chart || !paneMap) return;

    const seriesList = paneMap.get(tech);

    // 1) series 引用反查真实 pane（对象身份稳定，不受移动/重排影响）
    let paneIndex = -1;
    if (seriesList && seriesList.length > 0 && seriesList[0]) {
      const panes = chart.panes();
      paneIndex = panes.findIndex((p) => p.getSeries().includes(seriesList[0] as ISeriesApi<any>));
    }

    // 2) 反查失败（series 已不在 chart / 从未创建成功）→ 清引用 + 全量重建兜底
    if (paneIndex < 1) {
      console.warn(`[ChartPanel] 删除 ${tech} 反查 pane 失败，触发全量重建兜底`);
      paneMap.delete(tech);
      lowerResultsRef.current.delete(tech);
      lastLowerRef.current = lastLowerRef.current.filter((t) => t !== tech);
      void loadLowerIndicators(liveSelectionRef.current.lower, props.code, props.interval);
      return;
    }

    // 3) removeSeries —— 目标 pane 内的**全部** series（含 paneMap 未记录的孤儿）。
    //    ⚠️ v5 行为：removeSeries 在 pane 变空时会**自动移除该 pane**（_cleanupIfPaneIsEmpty）！
    //    因此 removeSeries 完成后目标 pane 通常已自动消失，**绝不能再按旧 paneIndex 调 removePane**，
    //    否则会误删"前移上来"的下一个 pane（删 A 却连 B 一起消失的根因）。
    const targetPane = chart.panes()[paneIndex];
    if (targetPane) {
      for (const s of targetPane.getSeries()) {
        if (!s) continue;
        try {
          chart.removeSeries(s);
        } catch (e) {
          console.warn(`[ChartPanel] removeSeries 跳过 (可能重复):`, e);
        }
      }
    }
    paneMap.delete(tech);
    lowerResultsRef.current.delete(tech);

    // 4) 目标 pane 若未被 removeSeries 自动移除（极端情况：残留无法移除的 series）→
    //    用 pane 对象引用定位真实位置兜底删除（不依赖旧 index）
    if (chart.panes().includes(targetPane)) {
      const realIdx = chart.panes().indexOf(targetPane);
      try {
        chart.removePane(realIdx);
      } catch (e) {
        console.warn(`[ChartPanel] removePane 失败:`, e);
      }
    }

    // 5) 清理 React state（key=tech）
    lastLowerRef.current = lastLowerRef.current.filter((t) => t !== tech);
    setLowerValues(() => {
      const next = new Map<number, string>();
      lowerResultsRef.current.forEach((result, k) => {
        next.set(k, formatLastValue(result, props.decimals));
      });
      return next;
    });
    setLowerErrorStates((prev) => {
      if (!prev.has(tech)) return prev;
      const next = new Set(prev);
      next.delete(tech);
      return next;
    });
    setLowerLoadingStates((prev) => {
      if (!prev.has(tech)) return prev;
      const next = new Set(prev);
      next.delete(tech);
      return next;
    });
    // 6) 删除后立即重算浮层定位 —— pane 重排后 ResizeObserver 异步触发有窗口期，
    // 主动刷新避免剩余 pane 的浮层位置错乱/丢失
    updatePaneTops();
  };

  /** 精细重置：仅对指定 pane 的 series 调用 setData(newData)，其他副图完全不动。 */
  const resetLowerPane = async (tech: number, code: string, interval: number) => {
    const chart = chartRef.current;
    const paneMap = paneSeriesMapRef.current;
    if (!chart || !paneMap) return;
    const seriesList = paneMap.get(tech);
    if (!seriesList || seriesList.length === 0) return;

    // 该 pane 标记为 loading（仅此一个浮层淡入）— key=tech
    setLowerLoadingStates((prev) => {
      const next = new Set(prev);
      next.add(tech);
      return next;
    });

    try {
      const result = await indicatorApi.calculate('lower', tech, code, interval, formatIndicatorParams('lower', tech, props.lowerParams));
      // 2026-08-05：全屏中只缓存不建 series (series 已被 hide 移除, 由退出全屏的 restore 重建)
      if (fullscreenRef.current) {
        lowerResultsRef.current.set(tech, result);
        return;
      }
      const isHistogram = tech === LOWER_TECH.VOLUME || tech === LOWER_TECH.VOLP;
      seriesList.forEach((series, i) => {
        const s = result.series[i];
        if (!s) return;
        const { points } = sanitizePoints(s.data);
        if (tech === LOWER_TECH.MACD && i === 2) {
          series.setData(
            points.map((d) => ({
              time: d.time as Time,
              value: d.value,
              color: d.value >= 0 ? props.palette.overlay.up : props.palette.overlay.down,
            })),
          );
        } else if (isHistogram && i === 0) {
          series.setData(points.map((d) => ({ time: d.time as Time, value: d.value })));
        } else {
          series.setData(points.map((d) => ({ time: d.time as Time, value: d.value })));
        }
      });
      lowerResultsRef.current.set(tech, result);
      refreshLowerValues();
    } catch (e) {
      console.error(`重置副图指标 ${tech} 失败`, e);
    } finally {
      setLowerLoadingStates((prev) => {
        const next = new Set(prev);
        next.delete(tech);
        return next;
      });
    }
  };

  // ---- 2026-08-05：横屏全屏真正隐藏副图 ----
  // 库对 pane 高度有硬性下限 (Math.max(计算值, 2)), setStretchFactor(0) 只能压成 2px 细缝,
  // CSS 也无法归零 — 唯一路径是移除 series → 空 pane 自动删除, 主图占满 100%。
  // hide 只移除 series/pane, 保留 lowerResultsRef 缓存, 退出全屏从缓存重建, 零网络请求、无闪烁。
  const hideLowerPanesForFullscreen = () => {
    const chart = chartRef.current;
    const paneMap = paneSeriesMapRef.current;
    if (!chart || !paneMap) return;
    panesHiddenForFullscreenRef.current = true;
    // 1) 移除所有副图 series (pane 变空自动移除), 防御式 try/catch 与全量清空一致
    const allPanes = chart.panes();
    for (let pi = 1; pi < allPanes.length; pi++) {
      try {
        for (const s of allPanes[pi].getSeries()) {
          if (!s) continue;
          try {
            chart.removeSeries(s);
          } catch (_) { /* ignore */ }
        }
      } catch (_) { /* ignore */ }
    }
    // 2) 兜底: 未被自动移除的 pane 逐个删除 (固定删 index 1, 永不越界)
    let guard = 0;
    while (chart.panes().length > 1 && guard++ < 50) {
      try {
        chart.removePane(1);
      } catch (e) {
        console.warn(`[ChartPanel] 全屏隐藏副图 pane 失败:`, e);
        break;
      }
    }
    // 3) 清理引用与浮层状态, 保留 lowerResultsRef 缓存 (恢复时重建用)
    paneMap.clear();
    setLowerValues(new Map());
    setLowerLoadingStates(new Set());
    setPendingFadingOut(new Set());
    // 4) 只剩主图自动占满, 同步浮层定位
    syncPaneLayout();
    updatePaneTops();
  };

  /** 退出全屏时从缓存恢复副图 — 按 props.lower 顺序重建 pane:
   *  命中 lowerResultsRef 缓存 → buildPaneSeries 直接重建 (零网络);
   *  缓存缺失 (全屏期间异步加载才完成) → addLowerPane 正常请求。 */
  const restoreLowerPanesFromCache = async () => {
    const chart = chartRef.current;
    const paneMap = paneSeriesMapRef.current;
    if (!chart || !paneMap) return;
    // hide 未执行过 (首次挂载) → 初始加载由全量路径负责, 不掺和
    if (!panesHiddenForFullscreenRef.current) return;
    panesHiddenForFullscreenRef.current = false;
    // 1) 防御性清空 (防全屏期间漏网的 pane), 与 hide 同一逻辑
    const allPanes = chart.panes();
    for (let pi = 1; pi < allPanes.length; pi++) {
      try {
        for (const s of allPanes[pi].getSeries()) {
          if (!s) continue;
          try {
            chart.removeSeries(s);
          } catch (_) { /* ignore */ }
        }
      } catch (_) { /* ignore */ }
    }
    let guard = 0;
    while (chart.panes().length > 1 && guard++ < 50) {
      try {
        chart.removePane(1);
      } catch (e) {
        console.warn(`[ChartPanel] 全屏恢复前清空副图 pane 失败:`, e);
        break;
      }
    }
    paneMap.clear();
    // 2) 按 props.lower 顺序逐个重建
    let nextPane = 1;
    for (const tech of props.lower) {
      // 恢复期间又进了全屏 → 放弃, 由下一次 hide/restore 处理
      if (fullscreenRef.current) return;
      const cached = lowerResultsRef.current.get(tech);
      if (cached) {
        // 复用与 addLowerPane 相同的 paneIndex 兜底逻辑 (失败项不占位)
        const panesLenNow = chart.panes().length;
        const paneIndex = nextPane >= 1 && nextPane <= panesLenNow ? nextPane : panesLenNow;
        try {
          const { seriesList } = buildPaneSeries(chart, tech, paneIndex, cached);
          paneMap.set(tech, seriesList);
          setLowerErrorStates((prev) => {
            if (!prev.has(tech)) return prev;
            const next = new Set(prev);
            next.delete(tech);
            return next;
          });
          setLowerLoadingStates((prev) => {
            if (!prev.has(tech)) return prev;
            const next = new Set(prev);
            next.delete(tech);
            return next;
          });
          nextPane++;
        } catch (e) {
          console.warn(`[ChartPanel] 全屏恢复副图 ${tech} 失败:`, e);
        }
      } else {
        // 缓存缺失 → 走正常加载 (内部已有全屏守卫)
        await addLowerPane(tech, nextPane, props.code, props.interval);
        nextPane++;
      }
    }
    refreshLowerValues();
    syncPaneLayout();
    updatePaneTops();
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
    // 2026-07-31：副图点击不消费 — 绘图工具只工作在主图 (paneIndex === 0)。
    // 旧代码没读 param.paneIndex，副图点击会通过 mainSeriesRef.current.coordinateToPrice
    // 把副图 Y 坐标错误映射到主图价格轴，导致在主图上画出"鬼线"。
    // TradingView 规范：绘图工具绑定主图，副图事件应直接 return。
    if(param.paneIndex == undefined || param.paneIndex !== 0) return;
    if (!param.time || !mainSeriesRef.current) return;
    const mousePrice = getMousePrice(param);
    if (mousePrice === null) return;

    const mgr = drawingMgrRef.current!;
    if (mgr.getActiveTool() === TOOL.TEXTBOX) {
      // 2026-07-27：直接创建一个空文字框并进入编辑态，不再弹 prompt
      // 2026-07-31：创建后退出文字框工具，每次新增需重新选择 工具→文本框
      // 2026-07-31：addTextBox 返回 -1 表示 TEXTBOX 已达上限 (5)
      const idx = mgr.addTextBox(param.time, mousePrice, '');
      if (idx < 0) {
        message.warning(t('LimitReached'));
        mgr.setTool(TOOL.NONE);
        props.onToolChange(TOOL.NONE);
        return;
      }
      setSelectedTextBox(idx);
      setEditingTextBox(idx);
      mgr.setTool(TOOL.NONE);
      props.onToolChange(TOOL.NONE);
    } else {
      // 2026-07-31：handleClick 返回 'limit' 表示该类已达上限 — 提示并切回 NONE
      const r = mgr.handleClick(param.time, mousePrice);
      if (r === 'limit') {
        message.warning(t('LimitReached'));
        mgr.setTool(TOOL.NONE);
        props.onToolChange(TOOL.NONE);
      }
    }
  };

  // ---- 工具提示 ----
  const updateToolHint = (tool: number) => {
    const cancelHint = ` · ${t('RightClickCancel')}`;
    if (tool === TOOL.TRENDLINE) setToolHint(`${t('DrawLine')}: ${t('chart')} → 2 ${'points'}${cancelHint}`);
    else if (tool === TOOL.PARALLEL_LINE) setToolHint(`${t('ParallelLines')}: 3 ${'points'}${cancelHint}`);
    // else if (tool === TOOL.PARALLEL_CHANNEL) setToolHint(`${t('ParallelChannel')}: 3 ${'points'}${cancelHint}`);
    else if (tool === TOOL.FIBON_RET) setToolHint(`${t('FibRetracement')}: 2 ${'points'}${cancelHint}`);
    else if (tool === TOOL.FIBON_PRO) setToolHint(`${t('FibProjection')}: 3 ${'points'}${cancelHint}`);
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

  // 2026-07-29：副图标题浮层按钮 handler
  // 2026-07-30 重写：pane.moveTo 已即时完成重排，series 不重建；只需同步 React state。
  // 2026-07-30 重构：paneMap/lowerResultsRef 的 key 是 tech（与位置无关），移动时**无需 swap**；
  // 但 lastLowerRef 是顺序基准，必须与 moveTo 同一时刻同步交换——否则 App 16ms pending
  // 未 flush 期间触发删除，会拿旧顺序推算 paneIndex 删错指标。
  const handleMoveLower = useCallback((tech: number, dir: -1 | 1) => {
    const chart = chartRef.current;
    if (!chart) return;
    const panes = chart.panes();
    const lowerList = props.lower;
    const arrIdx = lowerList.indexOf(tech);
    if (arrIdx < 0) return;
    const oldPaneIdx = arrIdx + 1;
    const newPaneIdx = oldPaneIdx + dir;
    if (newPaneIdx < 1 || newPaneIdx >= panes.length) return;

    // 1) 即时 pane 重排 (lightweight-charts 内部完成视觉切换)
    panes[oldPaneIdx].moveTo(newPaneIdx);

    // 2) 同步 lastLowerRef（与 moveTo 同一时刻，相邻交换，dir ∈ {-1, 1}）
    const lr = [...lastLowerRef.current];
    if (lr.length > 0) {
      [lr[oldPaneIdx - 1], lr[newPaneIdx - 1]] = [lr[newPaneIdx - 1], lr[oldPaneIdx - 1]];
      lastLowerRef.current = lr;
    }

    // 3) 同步 React state (让浮层按钮顺序跟着变，但不触发 reload)
    props.onReorderLower(tech, dir);
  }, [props.lower, props.onReorderLower]);

  // 2026-08-04：删除走精细路径 — 仅 removeSeries + removePane 该 pane，其他副图保持原样。
  // 之前是调 props.onRemoveLower → props.lower 变化 → useEffect → loadLowerIndicators → 全清全建 → 闪烁
  // 现在 useEffect 检测到数组变化后会调用 removeLowerPane(tech)，无需手动干预。
  // 2026-07-30：防连点 — 双击/快速连点时第二次点击会落在"前移上来"的下一个 pane 的删除按钮上，
  // 导致一次误删多个 pane。加 300ms 时间锁，同一时刻只接受一次删除请求。
  const handleRemoveLower = useCallback((tech: number) => {
    const now = Date.now();
    if (now - lastRemoveAtRef.current < 300) return;
    lastRemoveAtRef.current = now;
    props.onRemoveLower(tech);
  }, [props.onRemoveLower]);

  // 2026-08-04：重置走精细路径 — 仅 setData(newData) 该 pane 的所有 series，其他副图保持原样。
  // 之前是直接 loadLowerIndicators() → 全清全建 → 所有副图一起闪烁。
  const handleResetLower = useCallback((tech: number) => {
    void resetLowerPane(tech, props.code, props.interval);
  }, [props.code, props.interval]);

  // 通过 ref 暴露
  useEffect(() => {
    (window as any).__chartZoom = { zoomOut, zoomIn, shiftLeft, shiftRight };
    // 2026-07-31：HMR 修复 — 加 cleanup，避免旧 chart 的 zoom callback 残留在 window 上
    return () => { delete (window as any).__chartZoom; };
  }, [zoomOut, zoomIn, shiftLeft, shiftRight]);

  // 2026-07-27：全局键盘监听 — 选中态下按 Delete/Backspace 删除当前文字框
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (selectedTextBox === null) return;
      if (editingTextBox !== null) return; // 编辑态不拦截
      // 用户正在输入框里打字时也不要拦截
      const ae = document.activeElement as HTMLElement | null;
      if (ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || ae.isContentEditable)) return;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        drawingMgrRef.current?.deleteTextBox(selectedTextBox);
        setSelectedTextBox(null);
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedTextBox, editingTextBox]);

  // 2026-07-24：注入涨跌 CSS 变量, .info-overlay 的 .up / .down 类直接消费
  // 2026-08-04：移除 --mobile-lower-height (原用于按副图数增加容器高度),
  // 移动端图表高度改为撑满容器剩余空间, 不再产生纵向滚动。
  const chartStyle = {
    '--io-up': props.palette.overlay.up,
    '--io-down': props.palette.overlay.down,
  } as CSSProperties;

  // ---- 2026-08-03：触摸绘图输入路径 (REQ-MOBILE-003) ----
  // 轻量图表 v5 的十字光标在触摸拖动时不更新 (拖动被当作平移消费), 所以拖动预览
  // 必须由这里自己转换 client 坐标 → time/price 驱动 DrawingManager。
  // 鼠标路径不走这里 (e.pointerType === 'mouse' 直接忽略), 桌面行为零变化。
  // 坐标转换复用 TextBoxLayer 的 getBoundingClientRect 模式 (TextBoxLayer.tsx:189-196)。
  const clientToTimePrice = (clientX: number, clientY: number): { time: Time; price: number } | null => {
    const chart = chartRef.current;
    const series = mainSeriesRef.current;
    const el = containerRef.current;
    if (!chart || !series || !el) return null;
    const rect = el.getBoundingClientRect();
    const localX = clientX - rect.left;
    const localY = clientY - rect.top;
    const time = chart.timeScale().coordinateToTime(localX) as Time | null;
    const price = series.coordinateToPrice(localY);
    if (time === null || price === null || !Number.isFinite(price)) return null;
    return { time, price };
  };

  // 工具激活时, 触摸按下/移动驱动绘图预览 (轻点落点仍由库的 subscribeClick 完成)
  const onChartPointerMoveForDraw = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (props.tool === TOOL.NONE) return;
    if (e.pointerType === 'mouse') return;
    const tp = clientToTimePrice(e.clientX, e.clientY);
    if (tp) drawingMgrRef.current?.handleMouseMove(tp.time, tp.price);
  };

  // ---- 2026-08-04：点击副图循环切换指标 (需求: 正常状态下点副图按顺序切换) ----
  // 记录 pointer 起点, pointerup 时区分"轻点 / 拖动"；命中副图 pane 区域且无绘图工具激活时,
  // stopPropagation 阻止 MobileLayout 的"轻点进入全屏", 并触发 onCycleLower。
  const lowerTapStartRef = useRef<{ x: number; y: number; pointerId: number } | null>(null);
  const LOWER_TAP_THRESHOLD = 8;

  const onChartPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    onChartPointerMoveForDraw(e);
    lowerTapStartRef.current = { x: e.clientX, y: e.clientY, pointerId: e.pointerId };
  };

  const onChartPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const start = lowerTapStartRef.current;
    lowerTapStartRef.current = null;
    if (!start || start.pointerId !== e.pointerId) return;
    // 位移超阈值 = 拖动/平移, 不切换
    if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > LOWER_TAP_THRESHOLD) return;
    // 绘图工具激活时不切换 (画线交互优先)
    if (props.tool !== TOOL.NONE) return;
    // 2026-08-05：全屏时副图 pane 已被隐藏 (无副图可点), 点击应走"单击退出全屏"
    if (fullscreenRef.current) return;
    if (!props.onCycleLower) return;
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;
    const y = e.clientY - containerRect.top;
    // 2026-08-04：点击副图描述条（指标名称条）→ 打开副图指标选择列表（不进全屏、不循环切换）
    const titleEl = (e.target as HTMLElement).closest('.pane-title-mobile');
    if (titleEl) {
      e.stopPropagation();
      window.dispatchEvent(new CustomEvent('chart:open-lower-select'));
      return;
    }
    // 命中副图 pane 区域 (index >= 1)；无副图（关闭态）时主图底部 48px 作为"副图热区",
    // 让循环切换可从关闭态点回 VOLUME。
    const mainRect = paneRects[0];
    const hitLower =
      paneRects.some((r, i) => i >= 1 && y >= r.top && y <= r.top + r.height) ||
      (paneRects.length === 1 && !!mainRect && y >= mainRect.top + mainRect.height - 48);
    if (!hitLower) return;
    e.stopPropagation(); // 阻止 MobileLayout 轻点进入全屏
    props.onCycleLower();
  };

  return (
    <div
      className="chart-container"
      ref={containerRef}
      style={chartStyle}
      onPointerDown={onChartPointerDown}
      onPointerMove={onChartPointerMoveForDraw}
      onPointerUp={onChartPointerUp}
      aria-label="Forex chart"
      onClick={() => {
        // 2026-07-27：图表空白处点击 → 取消选中文字框
        if (selectedTextBox !== null && editingTextBox === null) {
          setSelectedTextBox(null);
        }
      }}
    >
      {info && <div className="info-overlay" dangerouslySetInnerHTML={{ __html: info}} />}
      <div className={`tools-hint ${toolHint ? 'show' : ''}`}>{toolHint}</div>
      {/* 2026-07-29：副图标题浮层 — 移动端由 CSS @media 隐藏 */}
      {props.lower.map((tech, idx) => {
        const paneIdx = idx + 1;
        const nameKey = LOWER_NAME_KEY[tech] ?? 'Lower';
        const measuredTop = paneTops[paneIdx];
        // 2026-07-31：浮层位置未就绪时不渲染，避免新增副图瞬间在 chart-container 顶部 4px 闪现
        if (measuredTop === undefined) return null;
        // 2026-08-04：移动端描述条贴紧副图 pane 顶部 (主/副图交界处), 桌面端保留 4px 内边距
        const isMobileLayout = props.mobile === true;
        const top = isMobileLayout ? measuredTop : measuredTop + 4;
        // 2026-07-30：error/值 state 的 key 是 tech（与位置无关）
        const isError = lowerErrorStates.has(tech);
        return (
          <div
            key={`pane-title-${tech}`}
            className={`pane-title-overlay${isError ? ' pane-title-error' : ''}${isMobileLayout ? ' pane-title-mobile' : ''}`}
            style={{ top }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <span className="pane-title-name">{t(nameKey as any)}</span>
            <span className="pane-title-value" style={isError ? { color: '#c0392b', fontStyle: 'italic' } : undefined}>
              {isError ? '数据异常，已隐藏' : (isMobileLayout
                ? formatLowerValueForMobile(tech, lowerResultsRef.current.get(tech), props.decimals)
                : (lowerValues.get(tech) ?? '—'))}
            </span>
            {!isMobileLayout && (
            <span className="pane-title-actions">
              <Button
                icon={<CaretUpOutlined />}
                type="default"
                title={t('MoveUp')}
                aria-label={t('MoveUp')}
                disabled={idx === 0}
                onClick={(e) => { e.stopPropagation(); handleMoveLower(tech, -1); }}
              />
              <Button
                icon={<DeleteOutlined />}
                type="default"
                title={t('Delete')}
                aria-label={t('Delete')}
                onClick={(e) => { e.stopPropagation(); handleRemoveLower(tech); }}
              />
              <Button
                icon={<RedoOutlined />}
                type="default"
                title={t('Reset')}
                aria-label={t('Reset')}
                onClick={(e) => { e.stopPropagation(); handleResetLower(tech); }}
              />
              {/* <Button icon={<ShrinkOutlined />} />
              <Button icon={<ArrowsAltOutlined />}/> */}
            </span>
            )}
          </div>
        );
      })}
      {/* 2026-07-31：副图加载/卸载骨架浮层 — loading + fading-out 两种状态（key=tech，位置用 indexOf 换算） */}
      {Array.from(lowerLoadingStates).map((tech) => {
        const paneIdx = props.lower.indexOf(tech) + 1;
        const measuredTop = paneTops[paneIdx];
        if (measuredTop === undefined) return null;
        const top = measuredTop + 4;
        const isFadingOut = pendingFadingOut.has(tech);
        return (
          <div
            key={`pane-skeleton-${tech}`}
            className={`pane-skeleton-overlay${isFadingOut ? ' fading-out' : ''}`}
            style={{ top }}
          >
            <span className="skeleton-bar skeleton-name" />
            <span className="skeleton-bar skeleton-value" />
            <span className="skeleton-bar skeleton-btn" />
            <span className="skeleton-bar skeleton-btn" />
            <span className="skeleton-bar skeleton-btn" />
            <span className="skeleton-bar skeleton-btn" />
          </div>
        );
      })}
      <TextBoxLayer
        chart={chartRef.current}
        series={mainSeriesRef.current}
        textBoxes={textBoxes}
        selectedIndex={selectedTextBox}
        editingIndex={editingTextBox}
        placeholder={t('TextBoxPlaceholder')}
        onSelect={(idx) => setSelectedTextBox(idx)}
        onRequestEdit={(idx) => {
          setSelectedTextBox(idx);
          setEditingTextBox(idx);
        }}
        onCommit={(idx, text) => {
          const mgr = drawingMgrRef.current;
          if (!mgr) return;
          if (text === '') {
            // 空文字直接删除
            mgr.deleteTextBox(idx);
            setSelectedTextBox(null);
          } else {
            mgr.updateTextBox(idx, text);
          }
          setEditingTextBox(null);
        }}
        onMove={(idx, time, price) => {
          drawingMgrRef.current?.moveTextBox(idx, time, price);
        }}
      />
    </div>
  );
}
