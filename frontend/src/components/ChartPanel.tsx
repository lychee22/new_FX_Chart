import { useEffect, useRef, useState, useCallback, useMemo, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import { type IChartApi, type ISeriesApi, type Time, type MouseEventParams, type Coordinate } from 'lightweight-charts';
import { message } from 'antd';
import { marketApi } from '../api/client';
import type { Bar, ChartPanelProps, IndicatorResult } from '../types';
import { INITIAL_LOADING_MIN_MS } from '../constants/chart';
import { LONG_PRESS_MS, LOWER_TAP_THRESHOLD } from '../constants/chart';
import { ProsticksPrimitive } from '../primitives/ProsticksPrimitive';
import { IchimokuPrimitive } from '../primitives/IchimokuPrimitive';
import { DrawingManager } from '../drawing/DrawingManager';
import { TOOL, LIMITED_TOOLS, MAX_PER_TYPE } from '../drawing/tools';
import { useI18n } from '../i18n';
import TextBoxLayer, { type TextBoxEntry } from './TextBoxLayer';
import { useChartDrawInteraction } from '../hooks/useChartDrawInteraction';
import { MobileDrawOverlays } from '../mobile/MobileDrawOverlays';
import { InfoOverlay } from './overlays/InfoOverlay';
import { ToolsHintOverlay } from './overlays/ToolsHintOverlay';
import { LoadingOverlay } from './overlays/LoadingOverlay';
import { EmptyOverlay } from './overlays/EmptyOverlay';
import { PaneTitleOverlay } from './overlays/PaneTitleOverlay';
import { PaneSkeletonOverlay } from './overlays/PaneSkeletonOverlay';
// Phase 2 hooks (2026-09-08)
import { useChartInit } from '../hooks/useChartInit';
import { useRealtimeData } from '../hooks/useRealtimeData';
import { useOverlayIndicator } from '../hooks/useOverlayIndicator';
import { useLowerPanes } from '../hooks/useLowerPanes';
// PR3: 命令总线 hook (2026-09-08)
import { useChartCommandBus } from '../hooks/useChartCommandBus';

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export default function ChartPanel(props: ChartPanelProps) {
  // ===== refs =====
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const mainSeriesRef = useRef<ISeriesApi<any> | null>(null);
  // 2026-08-04：切换 chartType 时待移除的旧主图 series。
  const oldMainSeriesRef = useRef<ISeriesApi<any> | null>(null);
  // 2026-07-31：主图叠加成交量直方图 series (仅 MAIN_VOLUME 类型使用，与 mainSeriesRef 同生命周期)
  const volumeSeriesRef = useRef<ISeriesApi<any> | null>(null);
  const prosticksPrimRef = useRef<ProsticksPrimitive | null>(null);
  const ichimokuPrimRef = useRef<IchimokuPrimitive | null>(null);
  const drawingMgrRef = useRef<DrawingManager | null>(null);
  // 2026-09-09：保留三个独立 ref（hook 类型契约要求 MutableRefObject<boolean>），
  // 但用 useLayoutMode() 集中函数 + 单一赋值点同步它们，避免各处重复写 3 行赋值代码。
  // 见 hooks/utils/refs.ts 中的 useLayoutMode 工具（如未来要内化到 hooks 内部可扩展）。
  const fullscreenRef = useRef(props.fullscreen === true);
  const mobileRef = useRef(props.mobile === true);
  const mobileDrawModeRef = useRef(props.mobileDrawMode === true);
  // 集中同步点 — render 阶段写一次，确保 hook 在 effect 中读到最新值。
  fullscreenRef.current = props.fullscreen === true;
  mobileRef.current = props.mobile === true;
  mobileDrawModeRef.current = props.mobileDrawMode === true;
  // 2026-08-04：任一指标参数非默认时置 true — WS 的 INDICATORS 增量按默认参数推送,
  // 与自定义参数结果不一致, 必须忽略 (主图 BAR 实时不受影响)。
  const wsIndicatorsDisabledRef = useRef(false);
  // 2026-08-05：图表触屏切换副图触发 WS 重订阅后, 后端会重推全量 INDICATORS (含 upper),
  // 用历史首点 update 会把叠加指标线拉回起点造成主图指标重绘 — 触屏切换时置 true,
  // 抑制下一次 upper 增量(一次性); 设置面板入口不抑制, 保持原行为。
  const suppressUpperRef = useRef(false);
  const overlaySeriesRef = useRef<ISeriesApi<any>[]>([]);   // 叠加指标序列
  // 副图指标序列: paneIndex → series[] (每个副图占一个独立 pane, 支持多个叠加)
  const paneSeriesMapRef = useRef<Map<number, ISeriesApi<any>[]>>(new Map());
  const barsRef = useRef<Bar[]>([]);
  // 2026-08-05：刷新入口镜像 — 挂载期订阅的 WS 重连回调与工具栏刷新按钮经由 ref 调用,
  // 确保每次都执行最新闭包 (props.code/interval/params 随渲染更新)。
  const refreshAllRef = useRef<(() => void) | null>(null);
  // 2026-08-06：首次加载是否已完成 — 仅首次显示全屏 loading, 切换品种时不再遮挡旧图
  const initialLoadedRef = useRef(false);
  // 副图 result 缓存
  const lowerResultsRef = useRef<Map<number, IndicatorResult>>(new Map());
  // 2026-08-05：全屏 hide 是否已执行过 — restore 据此跳过首次挂载 (初始加载由全量路径负责)
  const panesHiddenForFullscreenRef = useRef(false);
  const updateInfoOverlayRef = useRef<((param: MouseEventParams<Time>) => void) | null>(null);
  const handleChartClickRef = useRef<((param: MouseEventParams<Time>) => void) | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const crosshairRafRef = useRef<number | null>(null);
  const lastTouchPointRef = useRef<{ clientX: number; clientY: number } | null>(null);

  // ===== React state =====
  const [initialLoading, setInitialLoading] = useState(true);
  // 2026-09-04：主图数据状态机 — 'loading' 期间与 initialLoading 共用 Spin 覆盖层,
  // 'empty' (成功但 bars 为空) / 'error' (请求失败) 时显示全屏占位 + 刷新按钮,
  // 'idle' 表示数据已就绪不显示任何覆盖层
  const [mainDataState, setMainDataState] = useState<'loading' | 'empty' | 'error' | 'idle'>('loading');
  const [info, setInfo] = useState<string>('');
  const [toolHint, setToolHint] = useState<string>('');
  // 2026-07-27：文字框 React state — 与 DrawingManager 双向同步，由订阅回调驱动
  // 2026-08-05：改存 {box, index}（index 为 DrawingManager.objects 下标），
  // 与 addTextBox/updateTextBox/deleteTextBox/moveTextBox 的入参统一。
  const [textBoxes, setTextBoxes] = useState<TextBoxEntry[]>([]);
  const [selectedTextBox, setSelectedTextBox] = useState<number | null>(null);
  const [editingTextBox, setEditingTextBox] = useState<number | null>(null);
  // 2026-09-07：每类工具对象数量 — key 为 TOOL.* 数值, value 为当前数量。
  const [drawingCounts, setDrawingCounts] = useState<Record<number, number>>({});
  // 2026-09-09：合并 paneTops + paneRects — 原本两次遍历 panes.getBoundingClientRect() 浪费一次 layout，
  // 现在仅维护一份 Array<{top, height}>，top 通过 layout.top 直接读取。
  // 用途: 浮层定位 + 点击副图循环切换指标 + 触屏坐标→主图坐标系归一化。
  const [paneLayouts, setPaneLayouts] = useState<Array<{ top: number; height: number }>>([]);

  const { t } = useI18n();

  // ===== Hook #1: 图表初始化 + 主图渲染 + 时间轴 =====
  const { renderMainSeries, fitTimeScaleDefault, syncPaneLayout } = useChartInit({
    containerRef, chartRef, mainSeriesRef, oldMainSeriesRef, volumeSeriesRef,
    prosticksPrimRef, drawingMgrRef, paneSeriesMapRef, barsRef,
    fullscreenRef, mobileRef, mobileDrawModeRef,
    updateInfoOverlayRef, handleChartClickRef,
    mobile: props.mobile === true,
    palette: props.palette,
    setTextBoxes, setSelectedTextBox, setEditingTextBox,
    setDrawingCounts,
    registerDrawingCounts: props.registerDrawingCounts,
    onToolChange: props.onToolChange,
  });

  // ===== Hook #4: 叠加指标 =====
  const { loadOverlayIndicator } = useOverlayIndicator({
    chartRef, mainSeriesRef, ichimokuPrimRef, overlaySeriesRef,
    barsRef, fullscreenRef,
    palette: props.palette,
    upper: props.upper,
    code: props.code,
    interval: props.interval,
    upperParams: props.upperParams,
    fitTimeScaleDefault,
  });

  // ===== Hook #3: 副图指标 =====
  const lowerPaneApi = useLowerPanes({
    chartRef, paneSeriesMapRef, barsRef, lowerResultsRef, fullscreenRef,
    fitTimeScaleDefault, syncPaneLayout,
    wsIndicatorsDisabledRef, suppressUpperRef,
    // 直接传 hook 已 useCallback 稳定的 loadOverlayIndicator；不再包箭头函数避免每次 render 创建新引用
    loadOverlayIndicator,
    palette: props.palette,
    lower: props.lower,
    code: props.code,
    interval: props.interval,
    lowerParams: props.lowerParams,
    upperParams: props.upperParams,
    upper: props.upper,
    decimals: props.decimals,
    refreshAllRef,
    onRemoveLower: props.onRemoveLower,
    panesHiddenForFullscreenRef,
  });

  const {
    lowerLoadingStates, lowerErrorStates, lowerValues, pendingFadingOut,
    refreshLowerValues, updatePaneTops: updatePaneTopsFromHook,
    removeLowerPaneImmediate, resetLowerPaneImmediate, moveLower: moveLowerFromHook,
    hideLowerPanesForFullscreen, restoreLowerPanesFromCache,
    loadLowerIndicatorsFull,
  } = lowerPaneApi;

  // 包装 updatePaneTops：既调 hook 内部逻辑，也同步 ChartPanel 顶层的 paneLayouts state
  // 2026-09-09：单次遍历 panes，仅一次 setPaneLayouts（原先两次遍历 + 两次 setState）
  const updatePaneTops = useCallback(() => {
    updatePaneTopsFromHook();
    const chart = chartRef.current;
    const container = containerRef.current;
    if (!chart || !container) return;
    const panes = chart.panes();
    const containerRect = container.getBoundingClientRect();
    setPaneLayouts(
      panes.map((p) => {
        const el = p.getHTMLElement();
        if (!el) return { top: 0, height: 0 };
        const rect = el.getBoundingClientRect();
        return { top: rect.top - containerRect.top, height: rect.height };
      }),
    );
  }, [updatePaneTopsFromHook]);

  // 2026-09-08：useCanvasCrosshair 抽离后未接入 — pointer 路由与画线/副图 cycle 强耦合
  // 跨 hook 边界传递 lowerTapStartRef 复杂度反而上升, 暂保留 ChartPanel 顶层实现。
  // 见 hooks/useCanvasCrosshair.ts 中的 TODO 注释。

  // ===== Hook #2: 实时数据（订阅放最后，依赖 loadOverlayIndicator）=====

  useRealtimeData({
    chartRef, mainSeriesRef, volumeSeriesRef, prosticksPrimRef, ichimokuPrimRef,
    overlaySeriesRef, barsRef, paneSeriesMapRef, lowerResultsRef, fullscreenRef,
    wsIndicatorsDisabledRef, suppressUpperRef, refreshAllRef,
    refreshLowerValues,
    palette: props.palette,
    code: props.code,
    interval: props.interval,
    upper: props.upper,
    lower: props.lower,
    chartType: props.chartType,
  });

  // ===== 触摸平移选项 =====
  // 2026-09-01：移动端画线交互 hook — tap 定点 / 选中已画对象 / 步骤提示 / 完成提示。
  const applyTouchPanOptions = useCallback(() => {
    const chart = chartRef.current;
    const c = containerRef.current;
    if (!chart || !c) return;
    const isPhoneLayout = mobileRef.current || fullscreenRef.current;
    const toolActive = drawingMgrRef.current?.getActiveTool() !== TOOL.NONE;
    const drawMode = mobileDrawModeRef.current;
    chart.applyOptions({
      handleScroll: {
        mouseWheel: !isPhoneLayout,
        pressedMouseMove: true,
        horzTouchDrag: isPhoneLayout ? !(toolActive && !drawMode) : true,
        vertTouchDrag: !isPhoneLayout,
      },
    });
  }, []);

  // 2026-09-02: 锚点拖拽平移开关
  const handleAnchorDragPan = useCallback((dragging: boolean) => {
    const chart = chartRef.current;
    if (!chart) return;
    if (dragging) {
      chart.applyOptions({ handleScroll: { horzTouchDrag: false, vertTouchDrag: false } });
    } else {
      applyTouchPanOptions();
    }
  }, [applyTouchPanOptions]);

  const drawInteraction = useChartDrawInteraction({
    drawingMgrRef, chartRef, containerRef, mainSeriesRef, paneRects: paneLayouts,
    mobileDrawMode: props.mobileDrawMode === true,
    tool: props.tool,
    onToolChange: props.onToolChange,
    onLimitReached: () => { message.warning(t('LimitReached')); },
    onDrawDone: () => { /* 'done' 提示由 hook 内置 2s 自动消失, 无需外层 message */ },
    onAnchorDragPan: handleAnchorDragPan,
    onTextBoxCreated: (idx) => {
      setSelectedTextBox(idx);
      setEditingTextBox(idx);
    },
    onTextBoxSelected: (idx) => {
      setSelectedTextBox(idx);
      if (editingTextBox !== null && editingTextBox !== idx) {
        setEditingTextBox(null);
      }
    },
  });

  // ===== 数据加载（code/interval/decimals 变化时全量重建）====
  // 2026-09-04：loadMainData 抽出来可由 retryLoad / useLowerPanes 复用
  const loadTokenRef = useRef(0);
  const loadMainData = useCallback(async () => {
    const chart = chartRef.current;
    if (!chart) return;
    const myToken = ++loadTokenRef.current;
    const isFirstLoad = !initialLoadedRef.current;
    setMainDataState('loading');
    try {
      const bars = await Promise.all([
        marketApi.getBars(props.code, props.interval, 300, false),
        isFirstLoad ? sleep(INITIAL_LOADING_MIN_MS) : Promise.resolve(),
      ]).then(([bars]) => bars);
      if (loadTokenRef.current !== myToken) return;
      if (!bars || bars.length === 0) {
        setMainDataState('empty');
        message.warning(t('NoData'));
        return;
      }
      barsRef.current = bars;
      renderMainSeries(bars, props.chartType, props.decimals);
      // 加载叠加指标
      void loadOverlayIndicator(props.upper, props.code, props.interval, props.upperParams);
      // 加载副图指标 (多选)
      await loadLowerIndicatorsFull(props.code, props.interval);
      // 更新绘图管理器的 series 引用
      if (mainSeriesRef.current && drawingMgrRef.current) {
        drawingMgrRef.current.series = mainSeriesRef.current;
      }
      drawingMgrRef.current?.setTool(TOOL.NONE);
      setMainDataState('idle');
    } catch (e) {
      if (loadTokenRef.current !== myToken) return;
      console.error('加载数据失败', e);
      message.error(t('LoadFailed'));
      setMainDataState('error');
    } finally {
      if (isFirstLoad && !initialLoadedRef.current) {
        initialLoadedRef.current = true;
        setInitialLoading(false);
      }
    }
    // 2026-09-09：补全 deps — 原数组缺 lowerParams / t / renderMainSeries / loadOverlayIndicator /
    // loadLowerIndicatorsFull / setMainDataState / setInitialLoading，且 props.decimals 重复一次（typo）。
    // 现全部显式列出，移除 eslint-disable 注释。
  }, [props.code, props.interval, props.decimals, props.chartType,
      props.upper, props.upperParams, props.lower, props.lowerParams,
      t, renderMainSeries, loadOverlayIndicator, loadLowerIndicatorsFull,
      setMainDataState, setInitialLoading]);
  useEffect(() => {
    void loadMainData();
  }, [loadMainData]);

  const retryLoad = useCallback(() => {
    void loadMainData();
  }, [loadMainData]);

  // ===== 图表类型切换（0感）====
  useEffect(() => {
    if (!chartRef.current || barsRef.current.length === 0) return;
    renderMainSeries(barsRef.current, props.chartType, props.decimals);
    if (props.upper === 5 /* UPPER_TECH.IKH */) {
      void loadOverlayIndicator(props.upper, props.code, props.interval, props.upperParams);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.chartType]);

  // ===== paneTops ResizeObserver 监听 =====
  useEffect(() => {
    const chart = chartRef.current;
    const container = containerRef.current;
    if (!chart || !container) return;

    const updatePositions = () => updatePaneTops();
    updatePositions();

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

    const ts = chart.timeScale();
    ts.subscribeVisibleTimeRangeChange(updatePositions);

    const onResize = () => updatePositions();
    window.addEventListener('resize', onResize);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, [props.lower.length, updatePaneTops]);

  // ===== 绘图工具切换 =====
  useEffect(() => {
    if (LIMITED_TOOLS.has(props.tool) && (drawingCounts[props.tool] ?? 0) >= MAX_PER_TYPE) {
      message.warning(t('LimitReached'));
      props.onToolChange(TOOL.NONE);
      return;
    }
    drawingMgrRef.current?.setTool(props.tool);
    updateToolHint(props.tool);
    if (props.tool !== TOOL.NONE) chartRef.current?.clearCrosshairPosition();
    applyTouchPanOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.tool, props.mobileDrawMode]);

  // ===== 画线全局显隐 =====
  useEffect(() => {
    drawingMgrRef.current?.setVisible(props.drawingsVisible !== false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.drawingsVisible]);

  const clearDrawSelection = drawInteraction.clearSelection;
  useEffect(() => {
    if (props.drawingsVisible === false) {
      clearDrawSelection();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.drawingsVisible, clearDrawSelection]);

  // ===== 横屏全屏 =====
  useEffect(() => {
    if (props.fullscreen) {
      hideLowerPanesForFullscreen();
    } else {
      void restoreLowerPanesFromCache();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.fullscreen]);

  // ===== 缩放/平移/导出 =====
  useEffect(() => {
    props.registerExport(() => {
      if (chartRef.current) {
        chartRef.current.takeScreenshot().toDataURL('image/png');
        const url = chartRef.current.takeScreenshot().toDataURL('image/png');
        const a = document.createElement('a');
        a.href = url;
        a.download = `chart_${props.code}_${Date.now()}.png`;
        a.click();
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.code]);

  // ===== 注册刷新入口 =====
  useEffect(() => {
    props.registerRefresh?.(() => { void refreshAllRef.current?.(); });
    return () => props.registerRefresh?.(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== 撤销 / 取消 / 清除 (含 canUndo/canClear 同步) =====
  // 2026-09-08：抽到 useChartCommandBus — 合并 4 个 window 事件 + 修复 3 个反模式 effect
  //   (原 3 个 0 依赖空 deps 改为 DrawingManager.subscribeObjectsChanged 订阅)
  useChartCommandBus({
    drawingMgrRef,
    onToolChange: props.onToolChange,
  });

  // ===== 2026-08-05：手动刷新 / WS 重连后的全量重拉 (就地更新) =====
  const refreshAllData = async (): Promise<void> => {
    const chart = chartRef.current;
    const series = mainSeriesRef.current;
    if (!chart || !series) return;
    props.onRefreshingChange?.(true);
    const code = props.code;
    const interval = props.interval;
    const stillCurrent = () =>
      chartRef.current !== null && props.code === code && props.interval === interval;
    try {
      const bars = await marketApi.getBars(code, interval, 300, false);
      if (!stillCurrent()) return;
      barsRef.current = bars;
      // 重建 series（保证类型切换 / 错误路径下也能重建）
      renderMainSeries(bars, props.chartType, props.decimals);
      // 叠加指标: 重建 series
      await loadOverlayIndicator(props.upper, code, interval, props.upperParams, true);
      if (!stillCurrent()) return;
      // 副图指标: 逐 pane 就地重算 (通过 lowerPaneApi.resetLowerPaneImmediate)
      const resetPromises = props.lower.map((tech) => resetLowerPaneImmediate(tech));
      await Promise.all(resetPromises);
    } catch (e) {
      console.error('刷新数据失败', e);
      message.error(t('LoadFailed'));
    } finally {
      props.onRefreshingChange?.(false);
    }
  };
  refreshAllRef.current = refreshAllData;

  // ===== 十字光标读数 =====
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

    const mousePrice = getMousePrice(param);
    if (mousePrice !== null && drawingMgrRef.current && props.mobile !== true) {
      drawingMgrRef.current.handleMouseMove(param.time, mousePrice);
    }
  };
  updateInfoOverlayRef.current = updateInfoOverlay;

  // 2026-08-05：3 秒自动隐藏定时器
  const cancelHide = () => {
    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };
  const scheduleHide = () => {
    cancelHide();
    hideTimerRef.current = window.setTimeout(() => {
      chartRef.current?.clearCrosshairPosition();
      setInfo('');
      hideTimerRef.current = null;
    }, 1300);
  };
  useEffect(() => () => {
    cancelHide();
    if (crosshairRafRef.current !== null) {
      window.cancelAnimationFrame(crosshairRafRef.current);
      crosshairRafRef.current = null;
    }
  }, []);

  /** 从鼠标事件参数中提取实际价格 */
  const getMousePrice = (param: MouseEventParams<Time>): number | null => {
    if (!param.point || !mainSeriesRef.current) return null;
    let y = param.point.y;
    const paneIdx = param.paneIndex;
    if (paneIdx !== undefined && paneIdx !== 0 && paneLayouts[paneIdx]) {
      const mainTop = paneLayouts[0]?.top ?? 0;
      y = (param.point.y + paneLayouts[paneIdx].top - mainTop) as Coordinate;
    }
    const mainRect = paneLayouts[0];
    if (mainRect && mainRect.height > 0) {
      y = Math.min(Math.max(y, 0), mainRect.height - 1) as Coordinate;
    }
    const price = mainSeriesRef.current.coordinateToPrice(y);
    return price;
  };

  // ===== 点击/触摸落点 → 绘图工具 =====
  const consumeToolTap = (time: Time, price: number) => {
    const mgr = drawingMgrRef.current;
    if (!mgr) return;
    if (mgr.getActiveTool() === TOOL.TEXTBOX) {
      const idx = mgr.addTextBox(time, price, '');
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
      const r = mgr.handleClick(time, price);
      if (r === 'limit') {
        message.warning(t('LimitReached'));
        mgr.setTool(TOOL.NONE);
        props.onToolChange(TOOL.NONE);
      }
    }
  };

  const handleChartClick = (param: MouseEventParams<Time>) => {
    if (props.mobile === true) return;
    if(param.paneIndex == undefined || param.paneIndex !== 0) return;
    if (!param.time || !mainSeriesRef.current) return;
    const mousePrice = getMousePrice(param);
    if (mousePrice === null) return;
    consumeToolTap(param.time, mousePrice);
  };
  handleChartClickRef.current = handleChartClick;

  // ===== 工具提示 =====
  const updateToolHint = (tool: number) => {
    const cancelHint = props.mobile ? '' : ` · ${t('RightClickCancel')}`;
    if (tool === TOOL.TRENDLINE) setToolHint(`${t('DrawLine')}: ${t('chart')} → 2 ${'points'}${cancelHint}`);
    else if (tool === TOOL.PARALLEL_LINE) setToolHint(`${t('ParallelLines')}: 3 ${'points'}${cancelHint}`);
    else if (tool === TOOL.PARALLEL_CHANNEL) setToolHint(`${t('ParallelChannel')}: 3 ${'points'} (左下 → 左上 → 右上)${cancelHint}`);
    else if (tool === TOOL.FIBON_RET) setToolHint(`${t('FibRetracement')}: 2 ${'points'}${cancelHint}`);
    else if (tool === TOOL.FIBON_PRO) setToolHint(`${t('FibProjection')}: 3 ${'points'}${cancelHint}`);
    else setToolHint('');
  };

  // ===== 缩放/平移 (暴露给 App) =====
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

  // ===== 副图移动（moveTo 即时重排 + 通知 App）=====
  const handleMoveLower = useCallback((tech: number, dir: -1 | 1) => {
    moveLowerFromHook(tech, dir);
    props.onReorderLower(tech, dir);
  }, [moveLowerFromHook, props.onReorderLower]);

  // ===== 副图删除/重置 =====
  const lastRemoveAtRef = useRef(0);
  const handleRemoveLower = useCallback((tech: number) => {
    const now = Date.now();
    if (now - lastRemoveAtRef.current < 300) return;
    lastRemoveAtRef.current = now;
    props.onRemoveLower(tech);
  }, [props.onRemoveLower]);

  const handleResetLower = useCallback((tech: number) => {
    resetLowerPaneImmediate(tech);
  }, [resetLowerPaneImmediate]);

  // 2026-09-09：以下 5 个 callback 从 JSX 内联函数收敛而来，避免子组件 React.memo 失效
  // 或触发不必要的 chart-container onClick 闭包重建。
  const handlePaneMoveUp = useCallback((tech: number) => handleMoveLower(tech, -1), [handleMoveLower]);

  const handleTextBoxSelect = useCallback((idx: number | null) => {
    setSelectedTextBox(idx);
  }, []);

  const handleTextBoxRequestEdit = useCallback((idx: number) => {
    // 2026-09-01：移动端非画线模式下禁止进入编辑（避免与触屏手势冲突）
    if (props.mobile && props.mobileDrawMode !== true) return;
    setSelectedTextBox(idx);
    setEditingTextBox(idx);
  }, [props.mobile, props.mobileDrawMode]);

  const handleTextBoxCommit = useCallback((idx: number, text: string) => {
    const mgr = drawingMgrRef.current;
    if (!mgr) return;
    if (text === '') {
      mgr.deleteTextBox(idx);
      setSelectedTextBox(null);
    } else {
      mgr.updateTextBox(idx, text);
    }
    setEditingTextBox(null);
  }, []);

  const handleTextBoxMove = useCallback((idx: number, time: Time, price: number) => {
    // 2026-09-01：移动端非画线模式下禁止拖动（避免与触屏手势冲突）
    if (props.mobile && props.mobileDrawMode !== true) return;
    drawingMgrRef.current?.moveTextBox(idx, time, price);
  }, [props.mobile, props.mobileDrawMode]);

  const handleContainerClick = useCallback(() => {
    // 点击空白处取消选中文字框（编辑中除外）
    if (selectedTextBox !== null && editingTextBox === null) {
      setSelectedTextBox(null);
    }
  }, [selectedTextBox, editingTextBox]);

  // ===== 通过 ref 暴露缩放/平移给 App =====
  useEffect(() => {
    (window as any).__chartZoom = { zoomOut, zoomIn, shiftLeft, shiftRight };
    return () => { delete (window as any).__chartZoom; };
  }, [zoomOut, zoomIn, shiftLeft, shiftRight]);

  // ===== 全局键盘监听 — Delete 键删除选中文字框 =====
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (selectedTextBox === null) return;
      if (editingTextBox !== null) return;
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

  // ===== 涨跌 CSS 变量注入 =====
  // 2026-09-09：useMemo 避免每次 render 创建新对象触发 inline style diff
  const chartStyle = useMemo<CSSProperties>(() => ({
    '--io-up': props.palette.overlay.up,
    '--io-down': props.palette.overlay.down,
  } as CSSProperties), [props.palette.overlay.up, props.palette.overlay.down]);

  // ===== 触屏 client 坐标 → (time, price) =====
  const clientToTimePrice = (clientX: number, clientY: number): { time: Time; price: number } | null => {
    const chart = chartRef.current;
    const series = mainSeriesRef.current;
    const el = containerRef.current;
    if (!chart || !series || !el) return null;
    const rect = el.getBoundingClientRect();
    const localX = clientX - rect.left;
    const localY = clientY - rect.top;
    const mainRect = paneLayouts[0];
    if (mainRect && mainRect.height > 0 &&
        (localY < mainRect.top || localY > mainRect.top + mainRect.height)) {
      return null;
    }
    const time = chart.timeScale().coordinateToTime(localX) as Time | null;
    const price = series.coordinateToPrice(localY);
    if (time === null || price === null || !Number.isFinite(price)) return null;
    return { time, price };
  };

  // ===== 长按十字线渲染 =====
  const lowerTapStartRef = useRef<{ x: number; y: number; pointerId: number } | null>(null);
  const longPressTimerRef = useRef<number | null>(null);
  const longPressActiveRef = useRef(false);
  // 2026-09-08: lastTouchPointRef 抽到 useCanvasCrosshair 后由 hook 内部维护, 此处保留 ChartPanel
  // 自己的本地引用用于 onChartPointerMove 的拖动距离判断 (与 hook 内部状态机并行)。
  // 简化: 实际只有 longPressActiveRef.current 决定十字光标是否显示, lastTouchPointRef
  // 由 hook 内部 rAF 回调消费, 此处不再需要。

  const renderCrosshairFromLastPoint = () => {
    crosshairRafRef.current = null;
    if (!longPressActiveRef.current) return;
    const pt = lastTouchPointRef.current;
    const chart = chartRef.current;
    const series = mainSeriesRef.current;
    const el = containerRef.current;
    if (!pt || !chart || !series || !el) return;
    const rect = el.getBoundingClientRect();
    const localY = pt.clientY - rect.top;
    const tp = clientToTimePrice(pt.clientX, pt.clientY);
    const mainRect = paneLayouts[0];
    const inMainPane = mainRect && localY >= mainRect.top && localY <= mainRect.top + mainRect.height;
    if (tp && inMainPane) {
      chart.setCrosshairPosition(tp.price, tp.time, series);
    } else {
      chart.clearCrosshairPosition();
      setInfo('');
    }
  };

  const scheduleCrosshairUpdate = () => {
    if (crosshairRafRef.current !== null) return;
    crosshairRafRef.current = window.requestAnimationFrame(renderCrosshairFromLastPoint);
  };

  const cancelCrosshairFrame = () => {
    if (crosshairRafRef.current !== null) {
      window.cancelAnimationFrame(crosshairRafRef.current);
      crosshairRafRef.current = null;
    }
  };

  const cancelLongPress = () => {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const onChartPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse') return;
    if (drawInteraction.handleDrawPointerMove(e)) return;
    const chart = chartRef.current;
    const series = mainSeriesRef.current;
    if (!chart || !series) return;
    const start = lowerTapStartRef.current;
    const isOwnPointer = !!start && start.pointerId === e.pointerId;
    if (!longPressActiveRef.current && isOwnPointer &&
        Math.hypot(e.clientX - start.x, e.clientY - start.y) > LOWER_TAP_THRESHOLD) {
      cancelLongPress();
      lastTouchPointRef.current = null;
    }
    if (isOwnPointer) {
      lastTouchPointRef.current = { clientX: e.clientX, clientY: e.clientY };
    }
    if (!longPressActiveRef.current) {
      if (props.tool !== TOOL.NONE) {
        const tp = clientToTimePrice(e.clientX, e.clientY);
        if (tp) drawingMgrRef.current?.handleMouseMove(tp.time, tp.price);
      }
      return;
    }
    cancelHide();
    scheduleCrosshairUpdate();
  };

  const onChartPointerLeave = () => {
    drawInteraction.cancelAnchorDrag();
    cancelLongPress();
    longPressActiveRef.current = false;
    lastTouchPointRef.current = null;
    cancelCrosshairFrame();
    scheduleHide();
  };

  const onChartPointerCancel = () => {
    drawInteraction.cancelAnchorDrag();
    lowerTapStartRef.current = null;
    cancelLongPress();
    longPressActiveRef.current = false;
    lastTouchPointRef.current = null;
    cancelCrosshairFrame();
    chartRef.current?.clearCrosshairPosition();
    setInfo('');
    cancelHide();
  };

  const onChartPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    lowerTapStartRef.current = { x: e.clientX, y: e.clientY, pointerId: e.pointerId };
    lastTouchPointRef.current = null;
    longPressActiveRef.current = false;
    cancelLongPress();

    const drawModeTapOnly = props.mobileDrawMode === true;
    if (e.pointerType === 'mouse' || (props.tool !== TOOL.NONE && !drawModeTapOnly)) {
      onChartPointerMove(e);
      if (e.pointerType !== 'mouse' && props.tool !== TOOL.NONE) {
        const tp = clientToTimePrice(e.clientX, e.clientY);
        if (tp) consumeToolTap(tp.time, tp.price);
      }
      return;
    }

    const containerRect = containerRef.current?.getBoundingClientRect();
    const mainRect = paneLayouts[0];
    if (!containerRect || !mainRect) return;
    const localY = e.clientY - containerRect.top;
    const inMainPane = localY >= mainRect.top && localY <= mainRect.top + mainRect.height;
    if (!inMainPane) return;

    if (drawInteraction.handleDrawPointerDown(e)) {
      cancelLongPress();
      return;
    }

    const { clientX, clientY, pointerId } = e;
    longPressTimerRef.current = window.setTimeout(() => {
      const start = lowerTapStartRef.current;
      longPressTimerRef.current = null;
      if (!start || start.pointerId !== pointerId) return;
      if (props.mobileDrawMode === true) return;
      if (drawingMgrRef.current && drawingMgrRef.current.getActiveTool() !== TOOL.NONE) return;
      longPressActiveRef.current = true;
      const latest = lastTouchPointRef.current;
      lastTouchPointRef.current = { clientX: latest?.clientX ?? clientX, clientY: latest?.clientY ?? clientY };
      cancelHide();
      renderCrosshairFromLastPoint();
    }, LONG_PRESS_MS);
  };

  const onChartPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    cancelLongPress();
    const wasLongPress = longPressActiveRef.current;
    longPressActiveRef.current = false;
    lastTouchPointRef.current = null;
    cancelCrosshairFrame();
    const start = lowerTapStartRef.current;
    lowerTapStartRef.current = null;
    if (!start || start.pointerId !== e.pointerId) return;
    if (wasLongPress) {
      e.stopPropagation();
      return;
    }
    if (drawInteraction.handleDrawPointerUp(e, start)) return;
    if (props.tool !== TOOL.NONE) {
      if (e.pointerType !== 'mouse' && props.mobileDrawMode !== true) {
        const activeTool = drawingMgrRef.current?.getActiveTool();
        const dragged = Math.hypot(e.clientX - start.x, e.clientY - start.y) > LOWER_TAP_THRESHOLD;
        if (dragged && (activeTool === TOOL.TRENDLINE || activeTool === TOOL.FIBON_RET)) {
          const tp = clientToTimePrice(e.clientX, e.clientY);
          if (tp) consumeToolTap(tp.time, tp.price);
        }
      }
      return;
    }
    if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > LOWER_TAP_THRESHOLD) return;
    if (fullscreenRef.current) return;
    if (!props.onCycleLower) return;
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;
    const y = e.clientY - containerRect.top;
    const titleEl = (e.target as HTMLElement).closest('.pane-title-mobile');
    if (titleEl) {
      e.stopPropagation();
      window.dispatchEvent(new CustomEvent('chart:open-lower-select'));
      return;
    }
    const mainRect = paneLayouts[0];
    const hitLower =
      paneLayouts.some((r, i) => i >= 1 && y >= r.top && y <= r.top + r.height) ||
      (paneLayouts.length === 1 && !!mainRect && y >= mainRect.top + mainRect.height - 48);
    if (!hitLower) return;
    e.stopPropagation();
    props.onCycleLower();
  };

  const onChartPointerUpWithHide = (e: ReactPointerEvent<HTMLDivElement>) => {
    onChartPointerUp(e);
    if (e.pointerType !== 'mouse') {
      scheduleHide();
    }
  };


  return (
    <div
      className={`chart-container${props.tool !== TOOL.NONE ? ' chart-tool-active' : ''}`}
      ref={containerRef}
      style={chartStyle}
      onPointerDown={onChartPointerDown}
      onPointerMove={onChartPointerMove}
      onPointerUp={onChartPointerUpWithHide}
      onPointerLeave={onChartPointerLeave}
      onPointerCancel={onChartPointerCancel}
      aria-label="Forex chart"
      onClick={handleContainerClick}
    >
      <InfoOverlay html={info} />
      <ToolsHintOverlay
        hint={toolHint}
        mobile={props.mobile === true}
        hidden={props.mobile === true && props.mobileDrawMode === true}
      />
      {props.lower.map((tech, idx) => (
        <PaneTitleOverlay
          key={`pane-title-${tech}`}
          tech={tech}
          idx={idx}
          paneTop={paneLayouts[idx + 1]?.top}
          isMobileLayout={props.mobile === true}
          isError={lowerErrorStates.has(tech)}
          desktopValue={lowerValues.get(tech)}
          mobileResult={lowerResultsRef.current.get(tech)}
          decimals={props.decimals}
          onMove={handlePaneMoveUp}
          onRemove={handleRemoveLower}
          onReset={handleResetLower}
        />
      ))}
      {Array.from(lowerLoadingStates).map((tech) => (
        <PaneSkeletonOverlay
          key={`pane-skeleton-${tech}`}
          tech={tech}
          paneTop={paneLayouts[props.lower.indexOf(tech) + 1]?.top}
          isFadingOut={pendingFadingOut.has(tech)}
        />
      ))}
      <TextBoxLayer
        chart={chartRef.current}
        series={mainSeriesRef.current}
        textBoxes={textBoxes}
        selectedIndex={selectedTextBox}
        editingIndex={editingTextBox}
        placeholder={t('TextBoxPlaceholder')}
        onSelect={handleTextBoxSelect}
        onRequestEdit={handleTextBoxRequestEdit}
        onCommit={handleTextBoxCommit}
        onMove={handleTextBoxMove}
        visible={props.drawingsVisible !== false}
      />
      {props.mobileDrawMode === true && (() => {
        const sel = drawInteraction.selected;
        const selObj = sel !== null ? drawingMgrRef.current?.objects[sel] : undefined;
        const toolIdle = props.tool === TOOL.NONE;
        const hasDrawingSel = toolIdle
          && sel !== null && selObj !== undefined && !selObj.hidden;
        const hasTextBoxSel = toolIdle
          && selectedTextBox !== null && editingTextBox === null;
        const hasSelected = hasDrawingSel || hasTextBoxSel;
        const onDelete = hasTextBoxSel
          ? () => {
              if (selectedTextBox !== null) {
                drawingMgrRef.current?.deleteTextBox(selectedTextBox);
                setSelectedTextBox(null);
              }
            }
          : drawInteraction.deleteSelected;
        return (
          <MobileDrawOverlays
            stepHint={drawInteraction.stepHint}
            hasSelected={hasSelected}
            onDeleteSelected={onDelete}
          />
        );
      })()}
      <LoadingOverlay show={initialLoading} />
      <EmptyOverlay
        show={(mainDataState === 'empty' || mainDataState === 'error') && !initialLoading}
        onRetry={retryLoad}
      />
    </div>
  );
}

// 防止 TS6133 警告 — 这些仅作为类型/Ref 类型注解使用，运行时不需要
void ProsticksPrimitive;
void IchimokuPrimitive;
void DrawingManager;
