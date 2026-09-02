// 移动端画线交互 hook
// 2026-09-01：
//   - 封装"tap 定点 / 选中已画对象 / 步骤提示 / 完成提示"全部状态与副作用
//   - 仅在 ChartPanel 内部使用，与 UI 渲染解耦（状态返回给调用者，调用者决定如何渲染）
//   - 不修改 DrawingManager 本身的工具切换逻辑（向 consumeToolTap 透传即可）
//
//   用法：
//     const drawApi = useChartDrawInteraction({
//       drawingMgrRef, chartRef, containerRef, paneRects, mobileDrawMode,
//       tool, onToolChange,
//     });
//     // 在 onChartPointerUp 中：
//     if (drawApi.handleDrawPointerUp(e, start)) return;
//
//   返回的 stepHint / selected 为 React state，传给 <MobileDrawOverlays/>。

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { IChartApi, ISeriesApi } from 'lightweight-charts';
import { TOOL } from '../drawing/tools';
import type { DrawingManager } from '../drawing/DrawingManager';

// 触屏 tap 位移阈值 (与现有 ChartPanel 触屏逻辑一致)
const TAP_MOVE_THRESHOLD = 8;

// 步骤提示 / "已完成" 自动消失时间 (ms)
const DONE_HINT_MS = 2000;

export interface ChartDrawInteractionDeps {
  drawingMgrRef: React.MutableRefObject<DrawingManager | null>;
  chartRef: React.MutableRefObject<IChartApi | null>;
  containerRef: React.MutableRefObject<HTMLDivElement | null>;
  mainSeriesRef: React.MutableRefObject<ISeriesApi<any> | null>;
  paneRects: Array<{ top: number; height: number }>;
  /** 抽屉是否打开 — 决定本 hook 是否激活 */
  mobileDrawMode: boolean;
  /** 当前工具 (来自 App 透传) */
  tool: number;
  /** 设置工具 (App 提供) */
  onToolChange: (tool: number) => void;
  /** "已达上限"提示回调（移动端用 message.warning） */
  onLimitReached?: () => void;
  /** "已完成"提示回调（移动端 2 秒后自动消失） */
  onDrawDone?: () => void;
  /** 设置删除按钮标签的回调（移动端顶部持续提示） */
  onStepHint?: (hint: string | null) => void;
}

export interface ChartDrawInteractionApi {
  /** 触屏 tap 处理（在 ChartPanel 的 onChartPointerUp 中调用）
   *  返回 true 表示本 hook 已消费该事件，调用方应直接 return。 */
  handleDrawPointerUp: (e: ReactPointerEvent<HTMLDivElement>, start: { x: number; y: number; pointerId: number } | null) => boolean;
  /** 选中态下标（驱动锚点 + 悬浮删除按钮） */
  selected: number | null;
  /** 删除选中对象 */
  deleteSelected: () => void;
  /** 主动清除选中（如抽屉关闭时） */
  clearSelection: () => void;
  /** 当前步骤提示文本（由 hook 内部状态机驱动） */
  stepHint: string | null;
}

export function useChartDrawInteraction(deps: ChartDrawInteractionDeps): ChartDrawInteractionApi {
  const {
    drawingMgrRef, chartRef, containerRef, mainSeriesRef, paneRects,
    mobileDrawMode, tool, onToolChange, onLimitReached, onDrawDone, onStepHint,
  } = deps;

  const [selected, setSelected] = useState<number | null>(null);
  const [stepHint, setStepHint] = useState<string | null>(null);

  // "已完成" 提示用定时器
  const doneTimerRef = useRef<number | null>(null);
  // 步骤提示上一次展示的"完成时刻"状态：避免 doneHint 抢占正常步骤提示
  const lastHintTextRef = useRef<string | null>(null);

  const cancelDoneTimer = useCallback(() => {
    if (doneTimerRef.current !== null) {
      window.clearTimeout(doneTimerRef.current);
      doneTimerRef.current = null;
    }
  }, []);

  const showDoneHint = useCallback(() => {
    cancelDoneTimer();
    setStepHint('done');
    doneTimerRef.current = window.setTimeout(() => {
      setStepHint((h) => (h === 'done' ? null : h));
      doneTimerRef.current = null;
    }, DONE_HINT_MS);
  }, [cancelDoneTimer]);

  // 把本地 hint 状态外传给上层（ChartPanel 渲染到 MobileDrawOverlays 上方）
  useEffect(() => {
    if (!onStepHint) return;
    onStepHint(stepHint);
    lastHintTextRef.current = stepHint;
  }, [stepHint, onStepHint]);

  // 主动清除选中（抽屉关闭时）
  const clearSelection = useCallback(() => {
    if (selected !== null) {
      drawingMgrRef.current?.selectObject(null);
      setSelected(null);
    }
  }, [selected, drawingMgrRef]);

  // 删除选中对象
  const deleteSelected = useCallback(() => {
    if (selected === null) return;
    drawingMgrRef.current?.deleteObject(selected);
    setSelected(null);
  }, [selected, drawingMgrRef]);

  // 工具切换 / 抽屉关闭 → 清选中、清提示
  useEffect(() => {
    if (!mobileDrawMode || tool === TOOL.NONE) {
      // 工具 NONE 时只清选中（步骤提示由进度驱动自然消解）
      if (selected !== null && tool === TOOL.NONE && !mobileDrawMode) {
        drawingMgrRef.current?.selectObject(null);
        setSelected(null);
      }
    }
    // 抽屉关闭时强制清
    if (!mobileDrawMode) {
      cancelDoneTimer();
      drawingMgrRef.current?.selectObject(null);
      setSelected(null);
      setStepHint(null);
    }
  }, [mobileDrawMode, tool, selected, drawingMgrRef, cancelDoneTimer]);

  // 工具激活 / 切换时根据 DrawingManager 进度刷新步骤提示
  useEffect(() => {
    if (!mobileDrawMode) return;
    const mgr = drawingMgrRef.current;
    if (!mgr) return;
    const p = mgr.getDrawProgress();
    if (!p) {
      // 没有进行中的画线，若不是 done 提示则清空
      setStepHint((h) => (h === 'done' ? h : null));
      return;
    }
    // 移动端支持的 3 种工具：TRENDLINE / PARALLEL_CHANNEL / FIBON_RET
    const next = formatStepHint(p.tool, p.placed, p.total);
    setStepHint(next);
  }, [tool, mobileDrawMode, drawingMgrRef]);

  // 卸载清理
  useEffect(() => () => cancelDoneTimer(), [cancelDoneTimer]);

  // ---- tap 处理 ----
  const handleDrawPointerUp = useCallback((
    e: ReactPointerEvent<HTMLDivElement>,
    start: { x: number; y: number; pointerId: number } | null,
  ): boolean => {
    if (!mobileDrawMode) return false;
    // 只处理触屏；PC 由库的 subscribeClick 接管
    if (e.pointerType === 'mouse') return false;
    // 必须有匹配的起点 (避免被 ChartPanel 其他 handler 处理过的伪事件)
    if (!start || start.pointerId !== e.pointerId) return false;
    // 位移超阈值 → 拖动，不算 tap
    if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > TAP_MOVE_THRESHOLD) return false;

    const mgr = drawingMgrRef.current;
    const chart = chartRef.current;
    const series = mainSeriesRef.current;
    const container = containerRef.current;
    if (!mgr || !chart || !series || !container) return false;

    const rect = container.getBoundingClientRect();
    const localX = e.clientX - rect.left;
    const localY = e.clientY - rect.top;
    // 仅在主图 pane 内响应 (与现有 clientToTimePrice 一致)
    const mainRect = paneRects[0];
    if (!mainRect || mainRect.height <= 0 ||
        localY < mainRect.top || localY > mainRect.top + mainRect.height) {
      return false;
    }

    const tp: { time: any; price: number } | null = (() => {
      const time = chart.timeScale().coordinateToTime(localX);
      const price = series.coordinateToPrice(localY);
      if (time === null || price === null || !Number.isFinite(price)) return null;
      return { time, price };
    })();
    if (!tp) return false;

    if (tool !== TOOL.NONE) {
      // --- 工具激活：tap 定点 ---
      const before = mgr.objects.length;
      const result = mgr.handleClick(tp.time, tp.price);
      const after = mgr.objects.length;

      // 文本框工具：DrawingManager 内部直接 push 对象并重置 tool，handleClick 返回 true
      // 非文本工具：handleClick 推进 pendingPoints，对象创建由 pointerup/pointerdown 闭环产生
      // 统一以"对象数变化"作为完成标志
      if (after > before) {
        // 完成一条 → 重置工具为 NONE + 弹"已完成"2s 提示
        showDoneHint();
        mgr.setTool(TOOL.NONE);
        onToolChange(TOOL.NONE);
      } else if (result === 'limit') {
        onLimitReached?.();
        mgr.setTool(TOOL.NONE);
        onToolChange(TOOL.NONE);
      }
      return true;
    } else {
      // --- tool=NONE：tap → 选中已画对象 / 取消选中 ---
      const idx = mgr.hitTestObject(localX, localY);
      if (idx === null) {
        // 点空白：取消选中
        if (mgr.selected !== null) {
          mgr.selectObject(null);
          setSelected(null);
        }
      } else {
        // 切换或新选中
        if (mgr.selected !== idx) {
          mgr.selectObject(idx);
        }
        setSelected(idx);
      }
      return true;
    }
  }, [
    mobileDrawMode, tool, drawingMgrRef, chartRef, mainSeriesRef, containerRef, paneRects,
    showDoneHint, onToolChange, onLimitReached,
  ]);

  return useMemo(() => ({
    handleDrawPointerUp,
    selected,
    deleteSelected,
    clearSelection,
    stepHint,
  }), [handleDrawPointerUp, selected, deleteSelected, clearSelection, stepHint]);
}

// 步骤提示文本生成器 — 根据工具类型 + 已定点数生成持续提示。
// 返回 null 时上层展示"已完成"或清空。
export function formatStepHint(tool: number, placed: number, total: number): string | null {
  if (tool === TOOL.TRENDLINE) {
    return placed === 0 ? `请放置起点 (0/${total})` : `请放置终点 (${placed}/${total})`;
  }
  if (tool === TOOL.PARALLEL_CHANNEL) {
    return placed === 0 ? `请点击放置起点 (0/${total})` :
           placed === 1 ? `点击确定第一条线的位置 (${placed}/${total})` :
           `点击确定通道线的宽度 (${placed}/${total})`;
  }
  if (tool === TOOL.FIBON_RET) {
    return placed === 0 ? `请放置起点 (0/${total})` : `点击确定回调终点 (${placed}/${total})`;
  }
  // 其他工具 (在移动端不暴露) 不展示步骤
  return null;
}