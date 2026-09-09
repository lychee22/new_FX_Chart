// 图表命令总线 hook
// 2026-09-08：从 ChartPanel.tsx 抽到 hooks/useChartCommandBus.ts
//
// 合并 6 个 window 事件监听 + 修复 3 个"0 依赖反模式 effect"：
//   L451-461  chart:undo               → mgr.undoLast() + 上报 can-undo-changed 事件
//   L463-476  chart:cancel-drawing     → mgr.cancelDrawing() / setTool(NONE)
//   L478-488  chart:cancel-pending-drawing → mgr.cancelPendingDrawing() + 派发 inProgress=false
//   L499-510  chart:clear-all          → mgr.clearAllDrawings() + 上报 can-undo-changed 事件
//   L490-496  (反模式: 0 依赖空 deps 同步 registerCanUndo)  → 改用 subscribeObjectsChanged
//   L512-517  (反模式: 0 依赖空 deps 同步 registerCanClear)  → 同上
//   L519-528  (反模式: 0 依赖空 deps 同时同步两者)             → 同上
//
// 关键修复：原 3 个反模式 effect 缺 deps 数组（应为 []）但被 ESLint disable 注释掩盖，
// 导致每次渲染都跑一遍 DrawingManager.canUndo()，是隐藏的性能浪费。
// 这里改为订阅 DrawingManager 的 subscribeObjectsChanged，仅在 objects 变化时同步。
//
// 2026-09-09：registerCanUndo / registerCanClear 从 props 改为派发
// 'chart:can-undo-changed' window CustomEvent（detail = boolean），由 App 订阅
// 并维护 canUndo / canClear state。这样 ChartPanel 不再持有这两个回调 prop，
// App 也不再需要 registerCanUndo / registerCanClear，命令总线单向解耦。

import { useEffect } from 'react';
import type { DrawingManager } from '../drawing/DrawingManager';
import { TOOL } from '../drawing/tools';
import { useWindowEvents } from './utils/refs';

export interface UseChartCommandBusDeps {
  drawingMgrRef: React.MutableRefObject<DrawingManager | null>;
  onToolChange: (tool: number) => void;
}

export function useChartCommandBus(deps: UseChartCommandBusDeps): void {
  const { drawingMgrRef, onToolChange } = deps;

  // 上报 canUndo/canClear 状态变化 — App 端订阅 'chart:can-undo-changed' 即可。
  // 因为 mgr.canUndo() 同时表达 canUndo 与 canClear 语义（objects 非空即可撤销/清空），
  // 共用一个事件，detail = boolean。
  const emitCanUndoChanged = (mgr: DrawingManager) => {
    const can = mgr.canUndo();
    window.dispatchEvent(new CustomEvent('chart:can-undo-changed', { detail: can }));
  };

  // ===== 1) 挂载期 window 事件总线 =====
  useWindowEvents({
    'chart:undo': () => {
      const mgr = drawingMgrRef.current;
      if (!mgr) return;
      mgr.undoLast();
      emitCanUndoChanged(mgr);
    },
    'chart:cancel-drawing': () => {
      const mgr = drawingMgrRef.current;
      if (!mgr) return;
      const cancelled = mgr.cancelDrawing();
      if (!cancelled && mgr.getActiveTool() !== TOOL.NONE) {
        mgr.setTool(TOOL.NONE);
        onToolChange(TOOL.NONE);
      }
    },
    'chart:cancel-pending-drawing': () => {
      const mgr = drawingMgrRef.current;
      if (!mgr) return;
      mgr.cancelPendingDrawing();
      window.dispatchEvent(new CustomEvent('chart:drawing-in-progress', { detail: false }));
    },
    'chart:clear-all': () => {
      const mgr = drawingMgrRef.current;
      if (!mgr) return;
      mgr.clearAllDrawings();
      emitCanUndoChanged(mgr);
    },
  }, [drawingMgrRef, onToolChange]);

  // ===== 2) 修复反模式: canUndo / canClear 状态同步 =====
  // 原 3 个 effect 缺 deps 数组 (实际是空依赖) + 被 ESLint disable 掩盖,
  // 每次渲染都跑 canUndo()，且状态更新与 DrawingManager.objects 变化无精确关联。
  // 改为订阅 DrawingManager 的 subscribeObjectsChanged:
  //   - mount 时立即同步一次 (旧 effect 行为)
  //   - 任何 objects 变化时同步 (新行为, 替代 3 个反模式 effect)
  useEffect(() => {
    const mgr = drawingMgrRef.current;
    if (!mgr) return;
    const update = () => emitCanUndoChanged(mgr);
    update();
    return mgr.subscribeObjectsChanged(update);
  }, [drawingMgrRef]);
}
