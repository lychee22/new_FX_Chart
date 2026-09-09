// Canvas 十字光标 hook
// 2026-09-08：从 ChartPanel.tsx 抽到 hooks/useCanvasCrosshair.ts
//
// 封装：
//   - 十字光标 OHLC 读数（updateInfoOverlay + getMousePrice + setInfo）
//   - 触屏长按 → 十字光标定位（4 个 ref 状态机）
//   - 3 秒自动隐藏（hideTimerRef + crosshairRafRef）
//   - 暴露 5 个 pointer handler（down/move/up/leave/cancel）
//
// 设计要点：
//   - 内部维护 4 个 ref（lastTouchPointRef / longPressTimerRef / longPressActiveRef /
//     lowerTapStartRef），全部封装在 hook 内部，从 ChartPanel 消失。
//   - 卸载时统一清理定时器 + rAF 帧。
//   - onMouseMoveToDraw 回调让 ChartPanel 触发 drawingMgr.handleMouseMove，
//     hook 不直接持有 drawingMgrRef 的调用（避免与 useChartDrawInteraction 冲突）。

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { type Coordinate, type MouseEventParams, type Time } from 'lightweight-charts';
import type { IChartApi, ISeriesApi } from 'lightweight-charts';
import { LONG_PRESS_MS, LOWER_TAP_THRESHOLD } from '../constants/chart';
import { useI18n } from '../i18n';
import type { Bar } from '../types';
import type { DrawingManager } from '../drawing/DrawingManager';

export interface UseCanvasCrosshairDeps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  chartRef: React.MutableRefObject<IChartApi | null>;
  mainSeriesRef: React.MutableRefObject<ISeriesApi<any> | null>;
  paneRects: Array<{ top: number; height: number }>;
  barsRef: React.MutableRefObject<Bar[]>;
  /** 透传给 onMouseMoveToDraw — hook 自身不直接调 mgr，避免与 useChartDrawInteraction 冲突。 */
  drawingMgrRef: React.MutableRefObject<DrawingManager | null>;
  mobile: boolean;
  decimals: number;
  /** 触屏移动时通知绘图管理器更新预览 */
  onMouseMoveToDraw?: (time: number, price: number) => void;
  /** 桥接 ref — hook 把 updateInfoOverlay 写入 ref.current，
   *  由 useChartInit 在 chart.subscribeCrosshairMove 内调用。
   *  可选：留空则 hook 不桥接。 */
  updateInfoOverlayRef?: React.MutableRefObject<((param: MouseEventParams<Time>) => void) | null>;
}

export interface UseCanvasCrosshairApi {
  /** 供 <InfoOverlay html={infoHtml} /> 渲染的 OHLC 读数 */
  infoHtml: string;
  /** 5 个 pointer handler — 绑到 chart-container 的 onPointer* */
  onPointerDown: (e: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerMove: (e: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerUp: (e: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerLeave: () => void;
  onPointerCancel: () => void;
  /** ChartPanel 内部消费 — 触屏离开/取消时同步清空 info 提示 */
  clearInfo: () => void;
}

const AUTO_HIDE_MS = 1300;

export function useCanvasCrosshair(deps: UseCanvasCrosshairDeps): UseCanvasCrosshairApi {
  const {
    containerRef, chartRef, mainSeriesRef, paneRects,
    barsRef, mobile, decimals,
    onMouseMoveToDraw,
  } = deps;
  const { t } = useI18n();

  // ===== 内部 state =====
  const [info, setInfo] = useState<string>('');

  // ===== 内部 ref =====
  // 3 秒自动隐藏定时器
  const hideTimerRef = useRef<number | null>(null);
  // 触屏十字光标 rAF id
  const crosshairRafRef = useRef<number | null>(null);
  // 触屏最后落点（rAF 回调内读取）
  const lastTouchPointRef = useRef<{ clientX: number; clientY: number } | null>(null);
  // 长按状态机
  const lowerTapStartRef = useRef<{ x: number; y: number; pointerId: number } | null>(null);
  const longPressTimerRef = useRef<number | null>(null);
  const longPressActiveRef = useRef(false);

  // ===== 工具：从鼠标事件参数中提取实际价格 =====
  const getMousePrice = useCallback((param: MouseEventParams<Time>): number | null => {
    if (!param.point || !mainSeriesRef.current) return null;
    let y = param.point.y;
    const paneIdx = param.paneIndex;
    if (paneIdx !== undefined && paneIdx !== 0 && paneRects[paneIdx]) {
      const mainTop = paneRects[0]?.top ?? 0;
      y = (param.point.y + paneRects[paneIdx].top - mainTop) as Coordinate;
    }
    const mainRect = paneRects[0];
    if (mainRect && mainRect.height > 0) {
      y = Math.min(Math.max(y, 0), mainRect.height - 1) as Coordinate;
    }
    const price = mainSeriesRef.current.coordinateToPrice(y);
    return price;
  }, [mainSeriesRef, paneRects]);

  // ===== 触屏 client 坐标 → (time, price) =====
  const clientToTimePrice = useCallback((clientX: number, clientY: number):
    { time: Time; price: number } | null => {
    const chart = chartRef.current;
    const series = mainSeriesRef.current;
    const el = containerRef.current;
    if (!chart || !series || !el) return null;
    const rect = el.getBoundingClientRect();
    const localX = clientX - rect.left;
    const localY = clientY - rect.top;
    const mainRect = paneRects[0];
    if (mainRect && mainRect.height > 0 &&
        (localY < mainRect.top || localY > mainRect.top + mainRect.height)) {
      return null;
    }
    const time = chart.timeScale().coordinateToTime(localX) as Time | null;
    const price = series.coordinateToPrice(localY);
    if (time === null || price === null || !Number.isFinite(price)) return null;
    return { time, price };
  }, [chartRef, mainSeriesRef, containerRef, paneRects]);

  // ===== 十字光标 OHLC 读数（由 useChartInit 通过 updateInfoOverlayRef 间接调用） =====
  // 暴露为 useChartInit 友好的接口：直接调用 setInfo，并通过 onMouseMoveToDraw 桥接
  // drawingMgr.handleMouseMove（hook 自身不持有 drawingMgrRef 调用）。
  const updateInfoOverlay = useCallback((param: MouseEventParams<Time>) => {
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
    const dp = decimals;
    const mpStr = bar.mp > 0
      ? `<span class="mp">${t('mp')}: ${bar.mp.toFixed(dp)} (${t('mc')}: ${bar.mc})</span>`
      : '';
    setInfo(
      `${ds}<br/>` +
      `<span class="${cls}">${t('o')}: ${bar.o.toFixed(dp)} ${t('h')}: ${bar.h.toFixed(dp)} ${t('l')}: ${bar.l.toFixed(dp)} ${t('c')}: ${bar.c.toFixed(dp)}</span><br/>` +
      mpStr,
    );

    // 桌面端鼠标移动时通知绘图管理器更新预览
    const mousePrice = getMousePrice(param);
    if (mousePrice !== null && !mobile) {
      onMouseMoveToDraw?.(param.time as number, mousePrice);
    }
  }, [barsRef, decimals, mobile, getMousePrice, onMouseMoveToDraw, t]);

  // ===== 暴露给 useChartInit 桥接 ref =====
  // 原始 ChartPanel 用 updateInfoOverlayRef 在 mount 时把 updateInfoOverlay 写入 ref，
  // 再由 useChartInit 的 chart.subscribeCrosshairMove 调 ref.current?.(param)。
  // 这里把 updateInfoOverlay 镜像到入参 ref，保持 useChartInit 接口不变。
  useEffect(() => {
    if (deps.updateInfoOverlayRef) {
      deps.updateInfoOverlayRef.current = updateInfoOverlay;
    }
  }, [updateInfoOverlay, deps.updateInfoOverlayRef]);

  // ===== 3 秒自动隐藏 =====
  const cancelHide = useCallback(() => {
    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const scheduleHide = useCallback(() => {
    cancelHide();
    hideTimerRef.current = window.setTimeout(() => {
      chartRef.current?.clearCrosshairPosition();
      setInfo('');
      hideTimerRef.current = null;
    }, AUTO_HIDE_MS);
  }, [cancelHide, chartRef]);

  // ===== 长按十字线渲染 =====
  const renderCrosshairFromLastPoint = useCallback(() => {
    crosshairRafRef.current = null;
    if (!longPressActiveRef.current) return;
    const pt = lastTouchPointRef.current;
    const chart = chartRef.current;
    const series = mainSeriesRef.current;
    const el = containerRef.current;
    if (!pt || !chart || !series || !el) return;
    const tp = clientToTimePrice(pt.clientX, pt.clientY);
    const mainRect = paneRects[0];
    const containerRect = el.getBoundingClientRect();
    const localY = pt.clientY - containerRect.top;
    const inMainPane = mainRect &&
      localY >= mainRect.top && localY <= mainRect.top + mainRect.height;
    if (tp && inMainPane) {
      chart.setCrosshairPosition(tp.price, tp.time, series);
    } else {
      chart.clearCrosshairPosition();
      setInfo('');
    }
  }, [chartRef, mainSeriesRef, containerRef, paneRects, clientToTimePrice]);

  const scheduleCrosshairUpdate = useCallback(() => {
    if (crosshairRafRef.current !== null) return;
    crosshairRafRef.current = window.requestAnimationFrame(renderCrosshairFromLastPoint);
  }, [renderCrosshairFromLastPoint]);

  const cancelCrosshairFrame = useCallback(() => {
    if (crosshairRafRef.current !== null) {
      window.cancelAnimationFrame(crosshairRafRef.current);
      crosshairRafRef.current = null;
    }
  }, []);

  const cancelLongPress = useCallback(() => {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  // ===== 5 个 pointer handler =====
  // 长按触屏手势是本 hook 唯一的副作用来源；hook 内部不知道
  // 当前是否在画线工具 (drawingMgr.activeTool !== TOOL.NONE)。
  // ChartPanel.onPointerDown 在本 hook 之前优先调 drawInteraction.handleDrawPointerDown，
  // 命中即返回 true，本 hook 不再进入长按分支。这与原 ChartPanel.onChartPointerDown 的逻辑一致。

  const onPointerDown = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    lowerTapStartRef.current = { x: e.clientX, y: e.clientY, pointerId: e.pointerId };
    lastTouchPointRef.current = null;
    longPressActiveRef.current = false;
    cancelLongPress();

    // PC 鼠标：不进入长按路径（保持原行为一致）
    if (e.pointerType === 'mouse') {
      return;
    }

    // 触屏：必须落在主图 pane 内
    const containerRect = containerRef.current?.getBoundingClientRect();
    const mainRect = paneRects[0];
    if (!containerRect || !mainRect) return;
    const localY = e.clientY - containerRect.top;
    const inMainPane = localY >= mainRect.top && localY <= mainRect.top + mainRect.height;
    if (!inMainPane) return;

    // 长按定时器
    const { clientX, clientY, pointerId } = e;
    longPressTimerRef.current = window.setTimeout(() => {
      const start = lowerTapStartRef.current;
      longPressTimerRef.current = null;
      if (!start || start.pointerId !== pointerId) return;
      longPressActiveRef.current = true;
      const latest = lastTouchPointRef.current;
      lastTouchPointRef.current = {
        clientX: latest?.clientX ?? clientX,
        clientY: latest?.clientY ?? clientY,
      };
      cancelHide();
      renderCrosshairFromLastPoint();
    }, LONG_PRESS_MS);
  }, [containerRef, paneRects, cancelLongPress, cancelHide, renderCrosshairFromLastPoint]);

  const onPointerMove = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse') return;
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
    if (!longPressActiveRef.current) return;
    cancelHide();
    scheduleCrosshairUpdate();
  }, [cancelLongPress, cancelHide, scheduleCrosshairUpdate]);

  const onPointerUp = useCallback((_e: ReactPointerEvent<HTMLDivElement>) => {
    cancelLongPress();
    longPressActiveRef.current = false;
    lastTouchPointRef.current = null;
    cancelCrosshairFrame();
    lowerTapStartRef.current = null;
  }, [cancelLongPress, cancelCrosshairFrame]);

  const onPointerLeave = useCallback(() => {
    cancelLongPress();
    longPressActiveRef.current = false;
    lastTouchPointRef.current = null;
    cancelCrosshairFrame();
    scheduleHide();
  }, [cancelLongPress, cancelCrosshairFrame, scheduleHide]);

  const onPointerCancel = useCallback(() => {
    cancelLongPress();
    longPressActiveRef.current = false;
    lastTouchPointRef.current = null;
    cancelCrosshairFrame();
    chartRef.current?.clearCrosshairPosition();
    setInfo('');
    cancelHide();
    lowerTapStartRef.current = null;
  }, [cancelLongPress, cancelCrosshairFrame, chartRef, cancelHide]);

  const clearInfo = useCallback(() => setInfo(''), []);

  // ===== 卸载清理 =====
  useEffect(() => () => {
    cancelHide();
    cancelCrosshairFrame();
  }, [cancelHide, cancelCrosshairFrame]);

  return {
    infoHtml: info,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerLeave,
    onPointerCancel,
    clearInfo,
  };
}

/** 暴露给 useChartInit：与原 ChartPanel 一样的 "OHLC 读数回调桥接 ref" */
export type UpdateInfoOverlayFn = (param: MouseEventParams<Time>) => void;
