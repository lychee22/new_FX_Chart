// 图表初始化 hook
// 2026-09-08：从 ChartPanel.tsx 抽到 hooks/useChartInit.ts
//
// 封装：
//   - applyPaneLayout (顶层纯函数)
//   - useEffect(() => { createChart ... }, []) 整段 — createChart/DrawingManager/十字线/click/contextmenu/resize/cleanup
//   - buildMainSeriesData / buildVolumeData — 主图数据映射工具
//   - renderMainSeries — 主图序列创建/重建（含 Prosticks primitive + 成交量 overlay）
//   - toMainSeriesPoint — 实时 bar 转 update 点
//   - fitTimeScaleDefault — 时间轴默认范围
//   - syncPaneLayout — pane 拉伸权重应用
//
// 返回 { renderMainSeries, fitTimeScaleDefault, syncPaneLayout } 供其他 hook 调用。

import { useCallback, useEffect, type Dispatch, type MutableRefObject, type SetStateAction } from 'react';
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
import type { Bar, NationPalette } from '../types';
import { TARGET_BAR_SPACING, MOBILE_MIN_VISIBLE_BARS, PC_MIN_VISIBLE_BARS } from '../constants/chart';
import { DrawingManager } from '../drawing/DrawingManager';
import { ProsticksPrimitive } from './primitives/ProsticksPrimitive';
import { TOOL } from '../drawing/tools';
import { TYPE } from '../utils/chartTypes';
import { buildHandleScroll } from '../utils/chartOptions';
import type { TextBoxEntry, TextBoxSel } from '../components/TextBoxLayer';

export interface UseChartInitDeps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  chartRef: MutableRefObject<IChartApi | null>;
  mainSeriesRef: MutableRefObject<ISeriesApi<any> | null>;
  oldMainSeriesRef: MutableRefObject<ISeriesApi<any> | null>;
  volumeSeriesRef: MutableRefObject<ISeriesApi<any> | null>;
  prosticksPrimRef: MutableRefObject<ProsticksPrimitive | null>;
  drawingMgrRef: MutableRefObject<DrawingManager | null>;
  paneSeriesMapRef: MutableRefObject<Map<number, ISeriesApi<any>[]>>;
  barsRef: MutableRefObject<Bar[]>;
  fullscreenRef: MutableRefObject<boolean>;
  mobileRef: MutableRefObject<boolean>;
  mobileDrawModeRef: MutableRefObject<boolean>;
  // 用于 setTool / 信息回调镜像
  updateInfoOverlayRef: MutableRefObject<((param: MouseEventParams<Time>) => void) | null>;
  handleChartClickRef: MutableRefObject<((param: MouseEventParams<Time>) => void) | null>;
  // props 影响初始配置与重渲染
  mobile: boolean;
  palette: NationPalette;
  // 文字框/绘图订阅的 setState
  // 2026-09-10：selected/editing 合并为单一 TextBoxSel（editing 必然隐含 selected，
  // 原两 state 所有写入点均成对 set）；drawingCounts state 已删除（真值源为
  // mgr.objects，组件侧按需直接计数，本 hook 仅保留 registerDrawingCounts 上报）。
  setTextBoxes: Dispatch<SetStateAction<TextBoxEntry[]>>;
  setTextBoxSel: Dispatch<SetStateAction<TextBoxSel | null>>;
  registerDrawingCounts?: (counts: Record<number, number>) => void;
  // 工具切换的 onToolChange (contextmenu 用)
  onToolChange: (tool: number) => void;
}

export interface UseChartInitApi {
  renderMainSeries: (bars: Bar[], chartType: number, decimals: number) => void;
  fitTimeScaleDefault: () => void;
  syncPaneLayout: () => void;
}

// 2026-07-21 18:28:13：集中维护手机与桌面的 pane 比例，避免 iframe 改变宽度后布局残留。
// 2026-08-04：判断标准由宽度改为设备类型 (mobile prop)。
// 2026-08-05：主图权重统一为 2 (PC/移动端一致) — 单副图时 2:1 (主图占 2/3), 多副图等分余下空间。
function applyPaneLayout(chart: IChartApi): void {
  const panes = chart.panes();
  if (panes.length === 0) return;
  panes[0].setStretchFactor(panes.length > 1 ? 2 : 1);
  for (let i = 1; i < panes.length; i++) panes[i].setStretchFactor(1);
}

export function useChartInit(deps: UseChartInitDeps): UseChartInitApi {
  const {
    containerRef, chartRef, mainSeriesRef, oldMainSeriesRef, volumeSeriesRef,
    prosticksPrimRef, drawingMgrRef, paneSeriesMapRef, barsRef,
    fullscreenRef, mobileRef, mobileDrawModeRef,
    updateInfoOverlayRef, handleChartClickRef,
    mobile, palette,
    setTextBoxes, setTextBoxSel,
    registerDrawingCounts,
    onToolChange,
  } = deps;

  // ---- 初始化图表 ----
  useEffect(() => {
    if (!containerRef.current) return;
    const wheelContainer = containerRef.current;
    // 2026-08-04：移动端轴坐标间距更小 (需求4) — 更小字号让价格轴刻度更密 (间距小, 便于读数),
    // barSpacing 5 (PC 7) 让蜡烛更紧凑, minBarSpacing 4 防止过度缩放导致蜡烛过小/过大。
    // 设备切换时 ChartPanel 整体重建, 无需运行时切换。
    const isMobileLayout = mobile;
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
    // 2026-08-05：删除对象后 objects 下标前移 — 失效保护: 选中/编辑下标不再指向
    // 任何现存文字框时置空 (函数式更新, 避免挂载 effect 闭包读到旧 state),
    // 防止 Delete 键按旧下标误删前移后的其他对象。
    const refreshTextBoxes = () => {
      const data = mgr.getTextBoxes();
      setTextBoxes(data);
      // 2026-09-10：合并后失效守卫 — idx 不再指向任何现存文字框时整体置空
      // (editing 必然隐含 selected, 单一对象无需分别判空)。
      setTextBoxSel((prev) => (prev === null || data.some((d) => d.index === prev.idx) ? prev : null));
    };
    refreshTextBoxes();
    const unsubscribeTextBoxes = mgr.subscribeTextBoxesChanged(refreshTextBoxes);

    // 2026-09-07：每类工具数量变化订阅 — 重算 Map<TOOL, count> 上报父组件
    // (MobileLayout → MobileDrawingDrawer), 让工具按钮能实时判断上限。
    // 2026-09-10：组件内部预检已改为直接数 mgr.objects, 不再镜像 React state。
    const refreshDrawingCounts = () => {
      const counts: Record<number, number> = {};
      mgr.objects.forEach((o) => { counts[o.type] = (counts[o.type] ?? 0) + 1; });
      registerDrawingCounts?.(counts);
    };
    refreshDrawingCounts();
    const unsubscribeObjects = mgr.subscribeObjectsChanged(refreshDrawingCounts);

    // 十字光标移动 → 更新 OHLC 读数
    chart.subscribeCrosshairMove((param: MouseEventParams<Time>) => {
      updateInfoOverlayRef.current?.(param);
    });

    // 点击 → 绘图工具交互
    chart.subscribeClick((param: MouseEventParams<Time>) => {
      handleChartClickRef.current?.(param);
    });

    // 2026-09-03：PC 右键 → 直接退出绘图工具（清空点击阶段/预览）。
    // 不保留当前工具，避免右键取消后继续处于可连续画线状态。
    // 移动触屏长按会派发 contextmenu。画线抽屉内长按是定点/拖拽手势的一部分，
    // 不能沿用 PC 右键语义清空 pendingPoints/preview。
    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      if (mobileDrawModeRef.current) return;
      const mgrLocal = drawingMgrRef.current;
      if (!mgrLocal) return;
      const activeTool = mgrLocal.getActiveTool();
      if (activeTool === TOOL.NONE) return;
      mgrLocal.setTool(TOOL.NONE);
      onToolChange(TOOL.NONE);
    };
    containerRef.current.addEventListener('contextmenu', onContextMenu);

    const resize = () => {
      if (!containerRef.current) return;
      // 2026-08-04：设备类型(pointer: coarse)判断手机布局, 与 iframe 宽度无关;
      // 横屏全屏时也按手机布局处理 (主图 2x 拉伸 + 触摸手势门控)。
      const isPhoneLayout = mobileRef.current || fullscreenRef.current;
      const toolActive = drawingMgrRef.current?.getActiveTool() !== TOOL.NONE;
      // 2026-09-10：handleScroll 公式收敛到 utils/chartOptions.buildHandleScroll —
      // 原此处的内联版缺 drawMode 判断, 与 ChartPanel.applyTouchPanOptions 语义漂移
      // (移动画线模式下工具激活时, 此处禁用横向拖动、工具切换路径允许)。统一后此处
      // 也感知 mobileDrawModeRef, 行为与工具切换路径一致。
      chart.applyOptions({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
        handleScroll: buildHandleScroll(isPhoneLayout, toolActive, mobileDrawModeRef.current),
      });
      // 2026-08-04：全屏时容器尺寸变化会触发本 resize, 若此处直接 applyPaneLayout
      // 会把副图 stretchFactor 重新设回 1, 覆盖全屏隐藏 — 统一走 syncPaneLayout。
      // 注：syncPaneLayout 在 hook 末位才定义，resize 闭包内只能调 applyPaneLayout（行为一致）。
      applyPaneLayout(chart);
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
        if (drawingMgrRef.current) mainSeriesRef.current.detachPrimitive(drawingMgrRef.current);
      }
      resizeObserver?.disconnect();
      window.removeEventListener('resize', resize);
      unsubscribeTextBoxes();
      unsubscribeObjects(); // 2026-09-07：drawingCounts 订阅解绑
      containerRef.current?.removeEventListener('contextmenu', onContextMenu);
      chart.remove();
      // 完整重置所有 ref — 避免悬挂指针泄漏到下次 mount
      chartRef.current = null;
      mainSeriesRef.current = null;
      oldMainSeriesRef.current = null;  // 2026-08-04：待移除旧主图 series，chart.remove() 时一并销毁
      volumeSeriesRef.current = null;  // 2026-07-31：成交量 overlay ref
      prosticksPrimRef.current = null;
      drawingMgrRef.current = null;
      paneSeriesMapRef.current = new Map();
      barsRef.current = [];
      setTextBoxes([]);
      setTextBoxSel(null);
      // 2026-08-05：清理触屏切换标志, 避免卸载残留污染下次挂载后的设置面板操作
      delete (window as any).__mobileLowerTap;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- 主图数据映射 (renderMainSeries 与刷新/重连重拉共用) ----
  // 2026-08-05：从 renderMainSeries 提取 — 刷新时对现有 series 就地 setData,
  // 不重建 series (保持时间轴缩放与绘图 primitive 引用), 故数据映射抽出来共用。
  const buildMainSeriesData = (bars: Bar[], chartType: number): any[] => {
    if (chartType === TYPE.LINE || chartType === TYPE.MODAL_LINE) {
      return bars
        .filter((b) => b.h > 0)
        .map((b) => ({
          time: b.time as Time,
          value: chartType === TYPE.MODAL_LINE ? b.mp : b.c,
        }))
        // 模态线跳过 mp=0 的点
        .filter((d) => chartType !== TYPE.MODAL_LINE || (d.value as number) > 0);
    }
    if (chartType === TYPE.AREA) {
      return bars.filter((b) => b.h > 0).map((b) => ({ time: b.time as Time, value: b.c }));
    }
    // BAR / BAR_MODAL / CANDLE / PROSTICKS / MAIN_VOLUME 均为 OHLC 数组
    return bars.filter((b) => b.h > 0).map((b) => ({
      time: b.time as Time, open: b.o, high: b.h, low: b.l, close: b.c,
    }));
  };

  /** MAIN_VOLUME 叠加成交量的数据映射 (renderMainSeries 与刷新共用) */
  const buildVolumeData = (bars: Bar[], pal: NationPalette): any[] =>
    bars.filter((b) => b.h > 0).map((b) => ({
      time: b.time as Time,
      value: b.v,
      color: b.c >= b.o ? pal.bar.upColor : pal.bar.downColor,
    }));

  // 2026-07-21 22:47:36：把完整实时 Bar 转为当前主图类型需要的 update 数据。
  const toMainSeriesPoint = (bar: Bar, chartType: number): any | null => {
    if (chartType === TYPE.LINE || chartType === TYPE.MODAL_LINE || chartType === TYPE.AREA) {
      const value = chartType === TYPE.MODAL_LINE ? bar.mp : bar.c;
      return value > 0 ? { time: bar.time as Time, value } : null;
    }
    return { time: bar.time as Time, open: bar.o, high: bar.h, low: bar.l, close: bar.c };
  };

  // 2026-08-04：默认放大程度 — 目标蜡烛宽度约 8px, 移动/PC 观感一致:
  // 移动端竖屏约 50 根/屏, PC 端按容器宽度自适应 (1280px 约 160 根, 比全量 300 根放大近一倍)。
  // 2026-09-08：常量化 (TARGET_BAR_SPACING / MOBILE_MIN_VISIBLE_BARS / PC_MIN_VISIBLE_BARS) 已抽到 constants/chart.ts

  // 2026-09-10：useCallback 稳定化 — 三个函数此前是裸声明, 每次 render 新引用,
  // 污染下游 useOverlayIndicator/useLowerPanes 的 useCallback 依赖链
  // (最终导致 ChartPanel 数据加载 effect 无限重跑)。函数体只读 refs
  // (render 期已由调用方同步最新值), 故依赖数组仅需 refs / palette。
  // 声明顺序: fitTimeScaleDefault 必须先于 renderMainSeries (后者 deps 引用它)。

  // 统一的时间轴默认范围入口 — 替换所有裸 fitContent 调用点 (主图/副图加载/删除后),
  // 避免副图加载后的 fitContent 覆盖主图已设置的默认放大范围。
  const fitTimeScaleDefault = useCallback(() => {
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
  }, [chartRef, mobileRef, barsRef, containerRef]);

  const syncPaneLayout = useCallback(() => {
    const chart = chartRef.current;
    if (!chart) return;
    // 2026-07-21 18:28:13：手机主图保持双倍权重，桌面继续使用原有等比例 pane 布局。
    // 2026-08-04：按设备类型判断手机布局 (横屏全屏也按手机布局处理)。
    // 2026-08-05：主图权重统一 2 (PC 2:1); 全屏隐藏副图由 hideLowerPanesForFullscreen
    // 移除 pane 实现 (库对 pane 高度有硬性 2px 下限, setStretchFactor(0) 只能压成细缝)。
    applyPaneLayout(chart);
  }, [chartRef]);

  // ---- 渲染主图序列 ----
  const renderMainSeries = useCallback((bars: Bar[], chartType: number, decimals: number) => {
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
      series.setData(buildMainSeriesData(bars, chartType));
    } else if (chartType === TYPE.AREA) {
      series = chart.addSeries(AreaSeries, {
        lineColor: '#1E90FF',
        topColor: 'rgba(96, 176, 255, 0.4)',
        bottomColor: 'rgba(96, 176, 255, 0.05)',
        lineWidth: 1,
        priceFormat,
      });
      series.setData(buildMainSeriesData(bars, chartType));
    } else if (chartType === TYPE.BAR || chartType === TYPE.BAR_MODAL) {
      series = chart.addSeries(BarSeries, {
        upColor: palette.bar.upColor,
        downColor: palette.bar.downColor,
        thinBars: false,
        priceFormat,
      });
      series.setData(buildMainSeriesData(bars, chartType));
    } else {
      // CANDLE (默认) + PROSTICKS 都用 candlestick 作为底
      series = chart.addSeries(CandlestickSeries, {
        upColor: palette.candle.upColor,
        downColor: palette.candle.downColor,
        borderUpColor: palette.candle.borderUpColor,
        borderDownColor: palette.candle.borderDownColor,
        wickUpColor: palette.candle.wickUpColor,
        wickDownColor: palette.candle.wickDownColor,
        priceFormat,
      });
      series.setData(buildMainSeriesData(bars, chartType));
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
            color: palette.bar.upColor,
          },
          0,
        );
        volSeries.setData(buildVolumeData(bars, palette));
        // 把成交量压到主图底部 15%，并隐藏独立 price scale 的刻度文字
        chart.priceScale(volumeScaleId).applyOptions({
          scaleMargins: { top: 0.85, bottom: 0 },
          visible: false,
        });
        volumeSeriesRef.current = volSeries;
      } catch (e) {
        console.warn('[useChartInit] 创建成交量 overlay 失败:', e);
      }
    }

    // 2026-07-30: fitContent 推迟到下一帧, 确保 price scale 已基于 setData
    // 数据完成首次 auto-scale 后再触发布局, 避免 primitive 在 priceToCoordinate
    // 返回画布几何中心时被绘制,造成"红点全在水平线"的视觉异常。
    requestAnimationFrame(fitTimeScaleDefault);
  }, [chartRef, mainSeriesRef, oldMainSeriesRef, volumeSeriesRef, prosticksPrimRef,
      drawingMgrRef, palette, fitTimeScaleDefault]);

  // 2026-07-21 22:47:36：toMainSeriesPoint 暴露给 useRealtimeData 使用
  // 2026-09-08：renderMainSeries 已包含实时逻辑，toMainSeriesPoint 仍需单独导出给 handleRealtimeBar
  void toMainSeriesPoint;

  return { renderMainSeries, fitTimeScaleDefault, syncPaneLayout };
}
