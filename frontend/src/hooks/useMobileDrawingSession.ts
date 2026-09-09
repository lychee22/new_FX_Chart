// 移动端横屏全屏画线会话状态机
// 2026-09-01：
//   封装"抽屉开关 / 全局显隐 / 退出全屏清理"等会话级状态与副作用。
//   MobileLayout 只接线，不直接持有状态。
//   - 退出全屏（按钮或物理旋转）→ 自动 finishDrawing
//   - 抽屉开启时刻强制 tool=NONE（防止旧的 PC 工具残留）
//   - 切换 onToolChange 时自动派发 chart:cancel-drawing 让 ChartPanel 同步 DrawingManager

import { useCallback, useEffect, useRef, useState } from 'react';
import { TOOL } from '../drawing/tools';

export interface MobileDrawingSessionApi {
  /** 抽屉是否打开（与 isFullscreen 解耦，由各自控制） */
  drawerOpen: boolean;
  /** 已画线条全局显隐 */
  drawingsVisible: boolean;
  /** 切换抽屉开关（首次打开强制 tool=NONE） */
  toggleDrawer: () => void;
  /** 关闭抽屉：tool=NONE + 派发 cancel-drawing；isFullscreen 不变 */
  closeDrawer: () => void;
  /** 切换显隐 */
  toggleVisible: () => void;
  /** 完成画线 = 关闭抽屉 + tool=NONE + 取消进行中绘制 */
  finishDrawing: () => void;
  /** 抽屉打开时强制设置 tool，传给 ChartPanel；NONE 时派发 cancel-drawing */
  setTool: (tool: number) => void;
  /**
   * 2026-09-07：仅取消当前未完成的画线（清 pending/preview/stage/parallel 中间态），
   * 保留当前画线工具与抽屉状态 — 移动端用户在画到一半想重新落第一个点时使用。
   * 不走 chart:cancel-drawing（旧事件在无 pending 时会兜底 setTool(NONE)，
   * 与"保留工具"的语义不符），改为派发 chart:cancel-pending-drawing。
   */
  cancelPendingDrawing: () => void;
}

/**
 * @param isFullscreen 横屏全屏状态（由 useLandscapeFullscreen 提供）
 * @param currentTool  App 的当前 tool（用于在抽屉打开时感知外部变化）
 * @param onToolChange 父组件的 setTool（App 提供）
 */
export function useMobileDrawingSession(
  isFullscreen: boolean,
  currentTool: number,
  onToolChange: (tool: number) => void,
): MobileDrawingSessionApi {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawingsVisible, setDrawingsVisible] = useState(true);

  // 抽屉打开过的标记：仅在"曾经打开→关闭"时触发取消进行中绘制，避免首次挂载误取消。
  const drawerOpenedRef = useRef(false);

  const cancelDrawing = useCallback(() => {
    window.dispatchEvent(new CustomEvent('chart:cancel-drawing'));
  }, []);

  // 2026-09-07：仅清 pending，保留 activeTool — 独立事件以避开 chart:cancel-drawing
  // 在无 pending 时兜底退工具的副作用。
  const cancelPendingDrawing = useCallback(() => {
    window.dispatchEvent(new CustomEvent('chart:cancel-pending-drawing'));
  }, []);

  const setTool: MobileDrawingSessionApi['setTool'] = useCallback((tool) => {
    onToolChange(tool);
    if (tool === TOOL.NONE) cancelDrawing();
  }, [onToolChange, cancelDrawing]);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    drawerOpenedRef.current = true;
    // 关闭抽屉即重置工具与进行中点（用户可能在中途切换了工具）
    if (currentTool !== TOOL.NONE) onToolChange(TOOL.NONE);
    cancelDrawing();
  }, [currentTool, onToolChange, cancelDrawing]);

  const finishDrawing = useCallback(() => {
    // 关闭抽屉 + 重置工具与进行中点（用户可能在中途切换了工具 / 留下半成品线）
    closeDrawer();
    // 注意：不清 drawingsVisible。隐藏状态由用户明确决定，"完成画线"按钮只负责
    // 退出画线会话，不应擅自改变画线可见性 (之前 setDrawingsVisible(true) 会把
    // 已隐藏的画线重新显示出来)。
  }, [closeDrawer]);

  const toggleDrawer = useCallback(() => {
    if (drawerOpen) {
      closeDrawer();
    } else {
      setDrawerOpen(true);
      drawerOpenedRef.current = true;
      // 首次打开抽屉时，强制重置工具为 NONE（防 PC 残留 tool 或上次关闭时的中间态）
      if (currentTool !== TOOL.NONE) onToolChange(TOOL.NONE);
      cancelDrawing();
    }
  }, [drawerOpen, closeDrawer, currentTool, onToolChange, cancelDrawing]);

  const toggleVisible = useCallback(() => {
    setDrawingsVisible((v) => !v);
  }, []);

  // 退出全屏（按钮退出或物理旋转退出）→ 自动收抽屉
  useEffect(() => {
    if (!isFullscreen) {
      // 仅在抽屉曾经打开过的情况下触发，避免挂载时的初始 false 误触
      if (drawerOpenedRef.current && drawerOpen) {
        closeDrawer();
      }
      // 退出全屏时同步重置显隐标志为默认值），不影响下次打开
    }
    // 抽屉打开中切到非全屏（罕见，可能是物理旋转）：必须收抽屉
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFullscreen]);

  return {
    drawerOpen,
    drawingsVisible,
    toggleDrawer,
    closeDrawer,
    toggleVisible,
    finishDrawing,
    setTool,
    cancelPendingDrawing,
  };
}
