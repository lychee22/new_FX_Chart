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
import type { IChartApi, ISeriesApi, Time } from 'lightweight-charts';
import { TOOL } from '../drawing/tools';
import type { DrawingManager } from '../drawing/DrawingManager';
import { useI18n } from '../i18n';

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
  /** 2026-09-02: 锚点拖拽平移开关 — true=拖拽开始禁用图表平移, false=恢复 */
  onAnchorDragPan?: (dragging: boolean) => void;
  /** 2026-09-07: 移动端 TEXTBOX 创建后通知上层进入编辑态 (ChartPanel 设 selectedTextBox + editingTextBox) */
  onTextBoxCreated?: (index: number) => void;
  /** 2026-09-07: tool=NONE 时点击已有文字框 → 通知上层设置选中态 */
  onTextBoxSelected?: (index: number | null) => void;
}

export interface ChartDrawInteractionApi {
  /** 触屏 tap 处理（在 ChartPanel 的 onChartPointerUp 中调用）
   *  返回 true 表示本 hook 已消费该事件，调用方应直接 return。 */
  handleDrawPointerUp: (e: ReactPointerEvent<HTMLDivElement>, start: { x: number; y: number; pointerId: number } | null) => boolean;
  /** 2026-09-02: 锚点拖拽闭环 — down/move 命中锚点时返回 true; cancel 供 pointercancel/leave 清理 */
  handleDrawPointerDown: (e: ReactPointerEvent<HTMLDivElement>) => boolean;
  handleDrawPointerMove: (e: ReactPointerEvent<HTMLDivElement>) => boolean;
  cancelAnchorDrag: () => void;
  /** 选中态下标（驱动锚点 + 悬浮删除按钮） */
  selected: number | null;
  /** 删除选中对象 */
  deleteSelected: () => void;
  /** 主动清除选中（如抽屉关闭时） */
  clearSelection: () => void;
  /** 当前步骤提示文本（由 hook 内部状态机驱动） */
  stepHint: string | null;
  /**
   * 2026-09-07：是否处于画线进行中（已有 ≥1 个 pendingPoints 待定锚点）。
   * 用于 ChartPanel 在 FAB 渲染处短路：画线进行中一律隐藏悬浮删除按钮（"失焦"语义）。
   * 单一入口 dispatchInProgress 同时维护本地 state + 派发 chart:drawing-in-progress 事件，
   * 避免与 MobileLayout 的 React 状态漂移。
   */
  inProgress: boolean;
}

export function useChartDrawInteraction(deps: ChartDrawInteractionDeps): ChartDrawInteractionApi {
  const {
    drawingMgrRef, chartRef, containerRef, mainSeriesRef, paneRects,
    mobileDrawMode, tool, onToolChange, onLimitReached, onDrawDone, onStepHint, onAnchorDragPan,
    onTextBoxCreated, onTextBoxSelected,
  } = deps;
  // 2026-09-02：步骤提示走 i18n — 让 en/tc/sc 三语各自显示对应步骤文案
  const { t } = useI18n();

  const [selected, setSelected] = useState<number | null>(null);
  const [stepHint, setStepHint] = useState<string | null>(null);
  // 2026-09-07：画线进行中 (pendingPoints 非空) — 单一入口 dispatchInProgress
  // 同时维护本地 state 与 chart:drawing-in-progress 事件总线，避免与 MobileLayout 状态漂移。
  const [inProgress, setInProgress] = useState<boolean>(false);

  // "已完成" 提示用定时器
  const doneTimerRef = useRef<number | null>(null);
  // 步骤提示上一次展示的"完成时刻"状态：避免 doneHint 抢占正常步骤提示
  const lastHintTextRef = useRef<string | null>(null);

  // 2026-09-02: 拖拽状态 (三种 kind: selected/pending 锚点, body 主体整体平移)
  const anchorDragRef = useRef<{
    pointerId: number;
    kind: 'selected' | 'pending' | 'body';
    objIndex: number;
    anchorIdx: number;
    startX: number;
    startY: number;
    moved: boolean;
    // body 拖拽: 起始数据坐标 (用于计算 dt / dPrice 整体平移)
    startTime: Time | null;
    startPrice: number;
  } | null>(null);

  // 2026-09-02: 工具激活时的「按下-拖动-松开」画线拖拽 — 拖动期间实时更新预览,
  // 松手落点 (与 tap 行为一致); 移动端纯 tap 定点缺少两点之间的过渡视觉反馈。
  const lineDragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    moved: boolean;
  } | null>(null);

  // 容器局部坐标 → (time, price); 主图 pane 外返回 null
  const clientToLocalTimePrice = useCallback((clientX: number, clientY: number):
    { localX: number; localY: number; time: number; price: number } | null => {
    const chart = chartRef.current;
    const series = mainSeriesRef.current;
    const container = containerRef.current;
    if (!chart || !series || !container) return null;
    const rect = container.getBoundingClientRect();
    const localX = clientX - rect.left;
    const localY = clientY - rect.top;
    const mainRect = paneRects[0];
    if (!mainRect || mainRect.height <= 0 ||
        localY < mainRect.top || localY > mainRect.top + mainRect.height) return null;
    // 2026-09-02：coordinateToTime 在 lightweight-charts v5 中返回 Time (UTCTimestamp |
    // BusinessDay | string), 某些时间尺度/缩放下可能返回 BusinessDay 对象。落到
    // ParallelChannel 的 t1/t2/t3 后强转 number 会得 NaN, 导致中线 / 通道整体不可
    // 绘制 (表现为 50% 中线偶发不显示 / 拖拽平行通道时图像变形)。源头拒绝非 number
    // 时间戳, 后续所有依赖 tp.time 的路径自然安全 (返回类型也缩窄为 number)。
    const time = chart.timeScale().coordinateToTime(localX);
    const price = series.coordinateToPrice(localY);
    if (time === null || price === null ||
        !Number.isFinite(price) || typeof time !== 'number') return null;
    return { localX, localY, time, price };
  }, [chartRef, mainSeriesRef, containerRef, paneRects]);

  // 2026-09-02: 取消拖拽 (pointercancel/leave/抽屉关闭时调用, 恢复图表平移)
  // 同时清 lineDragRef — 抽屉关闭时若残留画线拖拽会导致平移永久禁用
  const cancelAnchorDrag = useCallback(() => {
    if (anchorDragRef.current) {
      anchorDragRef.current = null;
      onAnchorDragPan?.(false);
    }
    if (lineDragRef.current) {
      lineDragRef.current = null;
      onAnchorDragPan?.(false);
      // 工具激活中途取消 → 清空 pendingPoints + preview, 保留 activeTool 让用户重画
      drawingMgrRef.current?.cancelPendingDrawing();
    }
  }, [onAnchorDragPan, drawingMgrRef]);

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

  // 2026-09-04：进行中状态广播 — 抽屉按钮 (切工具 / 删除全部 / 隐藏 / 完成)
  // 在 pendingPoints 非空时锁定, 由 MobileLayout 订阅 chart:drawing-in-progress 事件驱动。
  // 2026-09-07：同时维护本地 inProgress state，ChartPanel FAB 渲染处直接消费；
  // 单一入口确保本地 state 与事件总线永不一致。
  const dispatchInProgress = useCallback((v: boolean) => {
    setInProgress(v);
    window.dispatchEvent(new CustomEvent('chart:drawing-in-progress', { detail: v }));
  }, []);

  // 把本地 hint 状态外传给上层（ChartPanel 渲染到 MobileDrawOverlays 上方）
  useEffect(() => {
    if (!onStepHint) return;
    onStepHint(stepHint);
    lastHintTextRef.current = stepHint;
  }, [stepHint, onStepHint]);

  // 主动清除选中（抽屉关闭时）
  // 2026-09-04：依赖收敛 — 直接调 setSelected(null) 与 selectObject(null),
  // 不再闭包外部 selected,使 clearSelection 引用在整个组件生命周期内稳定,
  // 避免 ChartPanel 中依赖 drawInteraction.clearSelection 的 effect 误重跑。
  const clearSelection = useCallback(() => {
    drawingMgrRef.current?.selectObject(null);
    setSelected(null);
  }, [drawingMgrRef]);

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
      cancelAnchorDrag();
      cancelDoneTimer();
      drawingMgrRef.current?.selectObject(null);
      setSelected(null);
      setStepHint(null);
      // 抽屉关闭 → 必定无进行中画线
      dispatchInProgress(false);
    }
  }, [mobileDrawMode, tool, selected, drawingMgrRef, cancelDoneTimer, cancelAnchorDrag, dispatchInProgress]);

  // 工具激活 / 切换时根据 DrawingManager 进度刷新步骤提示 + 广播 inProgress 状态。
  // 2026-09-04：stepHint 驱动的同时把 inProgress 同步上抛, 让 MobileLayout 锁定抽屉按钮。
  useEffect(() => {
    if (!mobileDrawMode) return;
    const mgr = drawingMgrRef.current;
    if (!mgr) return;
    // 2026-09-02: 传入 React 侧的 tool — 本 effect 先于 ChartPanel 的 setTool effect 执行,
    // 直接读 manager 内部 activeTool 会拿到旧工具, 导致通道提示显示 0/2 而非 0/3
    const p = mgr.getDrawProgress(tool);
    if (!p) {
      // 没有进行中的画线，若不是 done 提示则清空
      setStepHint((h) => (h === 'done' ? h : null));
      dispatchInProgress(false);
      return;
    }
    // 移动端支持的 3 种工具：TRENDLINE / PARALLEL_CHANNEL / FIBON_RET
    const next = formatStepHint(t, p.tool, p.placed, p.total);
    setStepHint(next);
    dispatchInProgress(true);
  }, [tool, mobileDrawMode, drawingMgrRef, t, dispatchInProgress]);

  // 卸载清理
  useEffect(() => () => cancelDoneTimer(), [cancelDoneTimer]);

  // 2026-09-07：订阅 chart:cancel-pending-drawing (移动端"取消画线"按钮触发) —
  // 清掉进行中步骤提示 pill + 把 inProgress 同步置 false (经 dispatchInProgress 单一入口)，
  // 避免 pill 仍显示旧进度（如 "放置终点 (1/2)"）造成误导，FAB 也能随之重新显示。
  // DrawingManager 的 cancelDrawing 已由 ChartPanel 监听器同步执行；本 hook 只负责
  // 同步本地 React state。
  useEffect(() => {
    const handler = () => {
      cancelDoneTimer();
      setStepHint(null);
      dispatchInProgress(false);
    };
    window.addEventListener('chart:cancel-pending-drawing', handler);
    return () => window.removeEventListener('chart:cancel-pending-drawing', handler);
  }, [cancelDoneTimer, dispatchInProgress]);

  // ---- 2026-09-02: 锚点拖拽 (调整点位改变线) + 主体拖拽 (整体平移通道/线条) ----
  // pointerdown 命中锚点进入拖拽; 命中已选对象主体进入整体平移; move 实时更新;
  // pointerup 收尾。拖拽期间经 onAnchorDragPan 禁用图表触摸平移, 避免漂移。
  const handleDrawPointerDown = useCallback((e: ReactPointerEvent<HTMLDivElement>): boolean => {
    if (!mobileDrawMode) return false;
    if (e.pointerType === 'mouse') return false;
    const mgr = drawingMgrRef.current;
    if (!mgr) return false;
    const tp = clientToLocalTimePrice(e.clientX, e.clientY);
    if (!tp) return false;

    // 工具激活时：未命中已落锚点即进入「按下-拖动-松开」画线拖拽, 让两点之间
    // 实时显示预览连线 (与 PC 鼠标 hover 同样的视觉反馈)。松手时落点 = tap 行为。
    if (tool !== TOOL.NONE) {
      const ai = mgr.hitTestPendingAnchor(tp.localX, tp.localY);
      if (ai !== null) {
        // 命中蓝色待定锚点 → 锚点拖拽 (沿用锚点逻辑)
        anchorDragRef.current = {
          pointerId: e.pointerId, kind: 'pending',
          objIndex: -1, anchorIdx: ai,
          startX: e.clientX, startY: e.clientY, moved: false,
          startTime: null, startPrice: 0,
        };
        onAnchorDragPan?.(true);
        return true;
      }
      // 未命中锚点：按下进入画线拖拽, move 时驱动预览
      lineDragRef.current = {
        pointerId: e.pointerId,
        startX: e.clientX, startY: e.clientY, moved: false,
      };
      onAnchorDragPan?.(true);
      // 进入时给一次预览, 即第一击的初始点, 让预览立即出现
      mgr.handleMouseMove(tp.time as Time, tp.price);
      return true;
    }

    // tool=NONE: 优先命中选中锚点 → 锚点拖拽; 未命中但命中对象主体 → 整体平移
    if (selected !== null) {
      const ai = mgr.hitTestSelectedAnchor(tp.localX, tp.localY);
      if (ai !== null) {
        anchorDragRef.current = {
          pointerId: e.pointerId, kind: 'selected',
          objIndex: selected, anchorIdx: ai,
          startX: e.clientX, startY: e.clientY, moved: false,
          startTime: null, startPrice: 0,
        };
        onAnchorDragPan?.(true);
        return true;
      }
      // 命中对象主体（边线/填充区）→ 整体平移
      if (mgr.hitTestObject(tp.localX, tp.localY) === selected) {
        anchorDragRef.current = {
          pointerId: e.pointerId, kind: 'body',
          objIndex: selected, anchorIdx: -1,
          startX: e.clientX, startY: e.clientY, moved: false,
          // 2026-09-02：tp.time 已通过客户端守卫保证是 number (UTCTimestamp),
          // 存到 startTime (Time | null) 时 cast 一次以匹配 nominal 类型。
          startTime: tp.time as Time, startPrice: tp.price,
        };
        onAnchorDragPan?.(true);
        return true;
      }
    }
    return false;
  }, [mobileDrawMode, tool, selected, drawingMgrRef, clientToLocalTimePrice, onAnchorDragPan]);

  const handleDrawPointerMove = useCallback((e: ReactPointerEvent<HTMLDivElement>): boolean => {
    const st = anchorDragRef.current;
    if (st && st.pointerId === e.pointerId) {
      if (e.pointerType === 'mouse') return false;
      if (!st.moved &&
          Math.hypot(e.clientX - st.startX, e.clientY - st.startY) > TAP_MOVE_THRESHOLD) {
        st.moved = true;
      }
      if (!st.moved) return true;
      const mgr = drawingMgrRef.current;
      const tp = clientToLocalTimePrice(e.clientX, e.clientY);
      if (mgr && tp) {
        if (st.kind === 'selected') {
          mgr.moveObjectAnchor(st.objIndex, st.anchorIdx, tp.time as Time, tp.price);
        } else if (st.kind === 'body') {
          // 整体平移: dt / dPrice 用数据坐标增量, 避免像素→数据来回换算的抖动
          // 2026-09-02：tp.time 在 lightweight-charts v5 中类型为 Time (UTCTimestamp | BusinessDay | string)。
          // coordinateToTime 在某些时间尺度/缩放下可能返回 BusinessDay 对象, 强转 number 得 NaN,
          // 污染通道的 t1/t2/t3 导致整条 channel 不可绘制 (表现为拖拽平行通道时图像变形)。
          // 仅当 time 为 number (UTCTimestamp) 且 startTime 也是 number 时才计算 delta。
          if (
            st.startTime !== null &&
            typeof tp.time === 'number' &&
            typeof st.startTime === 'number'
          ) {
            const dt = (tp.time as number) - (st.startTime as number);
            const dPrice = tp.price - st.startPrice;
            if (Number.isFinite(dt) && Number.isFinite(dPrice)) {
              mgr.moveObject(st.objIndex, dt, dPrice);
              st.startTime = tp.time as Time;
              st.startPrice = tp.price;
            }
          }
        } else {
          mgr.movePendingAnchor(st.anchorIdx, tp.time as Time, tp.price);
          // 同步预览光标: 预览段 (最后点→光标) 随锚点实时跟随; 松手后预览自动恢复
          mgr.handleMouseMove(tp.time as Time, tp.price);
        }
      }
      return true;
    }

    // 画线拖拽 (lineDrag): move 时实时更新预览 (通道: P1→光标 或 完整四边形; 趋势线/斐波同理)
    const ld = lineDragRef.current;
    if (ld && ld.pointerId === e.pointerId) {
      if (e.pointerType === 'mouse') return false;
      if (!ld.moved &&
          Math.hypot(e.clientX - ld.startX, e.clientY - ld.startY) > TAP_MOVE_THRESHOLD) {
        ld.moved = true;
      }
      const mgr = drawingMgrRef.current;
      const tp = clientToLocalTimePrice(e.clientX, e.clientY);
      if (mgr && tp) mgr.handleMouseMove(tp.time as Time, tp.price);
      return true;
    }
    return false;
  }, [drawingMgrRef, clientToLocalTimePrice]);

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

    // 2026-09-02: 画线拖拽收尾 — 拖动期间预览已实时更新, 松手 = 落点 (与 tap 同行为)
    const ld = lineDragRef.current;
    if (ld && ld.pointerId === e.pointerId) {
      lineDragRef.current = null;
      onAnchorDragPan?.(false);
      const tp = clientToLocalTimePrice(e.clientX, e.clientY);
      const mgr = drawingMgrRef.current;
      if (!tp || !mgr) return true;
      e.stopPropagation();
      // 2026-09-07 修复：TEXTBOX 走独立的 addTextBox 路径，不进 handleClick。
      // 此前 lineDrag 收尾分支无条件调 handleClick, 而 handleClick 没有 TEXTBOX 分支,
      // 导致 mobile 端点文字框工具后任何触摸都不会创建文字框 (该分支提前 return 短路了
      // 下方 if (tool === TOOL.TEXTBOX) 的 addTextBox 路径)。
      if (tool === TOOL.TEXTBOX) {
        const idx = mgr.addTextBox(tp.time as Time, tp.price, '');
        if (idx < 0) {
          onLimitReached?.();
          mgr.setTool(TOOL.NONE);
          onToolChange(TOOL.NONE);
          return true;
        }
        onTextBoxCreated?.(idx);
        mgr.setTool(TOOL.NONE);
        onToolChange(TOOL.NONE);
        return true;
      }
      const before = mgr.objects.length;
      const result = mgr.handleClick(tp.time as Time, tp.price);
      const after = mgr.objects.length;
      // 完成后点位留存 — DrawingManager 已设 mgr.selected, 同步 React state 以渲染删除按钮
      if (after > before) {
        const newSel = mgr.selected;
        if (newSel !== null) setSelected(newSel);
        showDoneHint();
        mgr.setTool(TOOL.NONE);
        onToolChange(TOOL.NONE);
      } else if (result === 'limit') {
        onLimitReached?.();
        mgr.setTool(TOOL.NONE);
        onToolChange(TOOL.NONE);
      } else {
        const p = mgr.getDrawProgress(tool);
        if (p) {
          setStepHint(formatStepHint(t, p.tool, p.placed, p.total));
          // 2026-09-04：lineDrag 推进后同样立即上抛 inProgress (见 tap 分支注释)
          dispatchInProgress(true);
        } else {
          dispatchInProgress(false);
        }
      }
      return true;
    }

    // 2026-09-02: 锚点/主体拖拽收尾 — 真实拖动消费松手事件 (不再落点/不切换选中)
    const dragSt = anchorDragRef.current;
    if (dragSt && dragSt.pointerId === e.pointerId) {
      anchorDragRef.current = null;
      onAnchorDragPan?.(false);
      const dragged = dragSt.moved ||
        Math.hypot(e.clientX - dragSt.startX, e.clientY - dragSt.startY) > TAP_MOVE_THRESHOLD;
      if (dragged) {
        e.stopPropagation(); // 阻止拖动松手被上层当 tap (如 MobileLayout 轻点全屏)
        return true;
      }
      // 按住锚点未移动 → 继续走下方正常 tap 逻辑
    }
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

    // 2026-09-02：与 clientToLocalTimePrice 同样的 typeof === 'number' 守卫, 避免
    // BusinessDay 时间戳流入 DrawingManager.handleClick 污染 ParallelChannel.t1/t2/t3。
    const tp: { time: number; price: number } | null = (() => {
      const time = chart.timeScale().coordinateToTime(localX);
      const price = series.coordinateToPrice(localY);
      if (time === null || price === null ||
          !Number.isFinite(price) || typeof time !== 'number') return null;
      return { time, price };
    })();
    if (!tp) return false;

    if (tool !== TOOL.NONE) {
      // 2026-09-07：TEXTBOX 在 DrawingManager 中走独立 addTextBox 路径（非 handleClick），
      // 直接 push 对象并返回下标，-1 表示已达上限。这里拦截后走 addTextBox 并通知上层
      // 进入编辑态，与桌面端 consumeToolTap 一致。
      if (tool === TOOL.TEXTBOX) {
        const idx = mgr.addTextBox(tp.time as Time, tp.price, '');
        if (idx < 0) {
          onLimitReached?.();
          mgr.setTool(TOOL.NONE);
          onToolChange(TOOL.NONE);
          return true;
        }
        // 通知 ChartPanel 设置 selectedTextBox + editingTextBox → contentEditable 自动聚焦
        onTextBoxCreated?.(idx);
        mgr.setTool(TOOL.NONE);
        onToolChange(TOOL.NONE);
        return true;
      }

      // --- 工具激活：tap 定点 ---
      const before = mgr.objects.length;
      const result = mgr.handleClick(tp.time as Time, tp.price);
      const after = mgr.objects.length;

      // 文本框工具：DrawingManager 内部直接 push 对象并重置 tool，handleClick 返回 true
      // 非文本工具：handleClick 推进 pendingPoints，对象创建由 pointerup/pointerdown 闭环产生
      // 统一以"对象数变化"作为完成标志
      if (after > before) {
        // 2026-09-02: 点位留存 — 完成后同步 React selected, 让锚点 + 删除按钮持续显示
        const newSel = mgr.selected;
        if (newSel !== null) setSelected(newSel);
        // 完成一条 → 重置工具为 NONE + 弹"已完成"2s 提示
        showDoneHint();
        mgr.setTool(TOOL.NONE);
        onToolChange(TOOL.NONE);
      } else if (result === 'limit') {
        onLimitReached?.();
        mgr.setTool(TOOL.NONE);
        onToolChange(TOOL.NONE);
      } else {
        // 2026-09-02：tap 之后立即同步刷新步骤提示，避免等 useEffect 异步刷新导致一帧延迟
        // (placed 0/3 → 1/3 等"步进"必须在本帧立即反映在 pill 上)。
        const p = mgr.getDrawProgress(tool);
        if (p) {
          setStepHint(formatStepHint(t, p.tool, p.placed, p.total));
          // 2026-09-04：tap 推进 pendingPoints 后立刻上抛 inProgress=true,
          // 让抽屉按钮在本帧内锁定 (无需等 setTool → useEffect 异步链路)。
          dispatchInProgress(true);
        } else {
          dispatchInProgress(false);
        }
      }
      return true;
    } else {
      // --- tool=NONE：tap → 选中已画对象 / 取消选中 ---
      // 2026-09-07：优先命中文字框（TextBoxLayer 自身也有命中，但走 React pointer 事件；
      // 这里在 chart 容器 tap 路径里命中后通知上层选中，FAB 删除走统一路径）。
      const textBoxIdx = mgr.hitTestTextBox(localX, localY);
      if (textBoxIdx !== null) {
        onTextBoxSelected?.(textBoxIdx);
        // 同时清掉画线选中态，避免视觉混淆
        if (mgr.selected !== null) {
          mgr.selectObject(null);
          setSelected(null);
        }
        return true;
      }
      const idx = mgr.hitTestObject(localX, localY);
      if (idx === null) {
        // 点空白：取消选中
        if (mgr.selected !== null) {
          mgr.selectObject(null);
          setSelected(null);
        }
        onTextBoxSelected?.(null);
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
    showDoneHint, onToolChange, onLimitReached, t, dispatchInProgress,
    onTextBoxCreated, onTextBoxSelected,
  ]);

  return useMemo(() => ({
    handleDrawPointerUp,
    handleDrawPointerDown,
    handleDrawPointerMove,
    cancelAnchorDrag,
    selected,
    deleteSelected,
    clearSelection,
    stepHint,
    inProgress,
  }), [handleDrawPointerUp, handleDrawPointerDown, handleDrawPointerMove, cancelAnchorDrag, selected, deleteSelected, clearSelection, stepHint, inProgress]);
}

// 步骤提示文本生成器 — 根据工具类型 + 已定点数生成持续提示。
// 返回 null 时上层展示"已完成"或清空。
// 2026-09-02：文案走 i18n — 接收 t() 函数，progress 后缀 (placed/total) 由调用方拼接。
export function formatStepHint(
  t: (key: any) => string,
  tool: number,
  placed: number,
  total: number,
): string | null {
  if (tool === TOOL.TRENDLINE) {
    const key = placed === 0 ? 'DrawStepTrendlineStart' : 'DrawStepTrendlineEnd';
    return `${t(key as any)} (${placed}/${total})`;
  }
  if (tool === TOOL.PARALLEL_CHANNEL) {
    // 三点顺序: 左下角 → 左上角 → 右上角 (右下角自动推算)
    const key =
      placed === 0 ? 'DrawStepChannelStart' :
      placed === 1 ? 'DrawStepChannelTopLeft' :
      'DrawStepChannelTopRight';
    return `${t(key as any)} (${placed}/${total})`;
  }
  if (tool === TOOL.FIBON_RET) {
    const key = placed === 0 ? 'DrawStepFibRetStart' : 'DrawStepFibRetEnd';
    return `${t(key as any)} (${placed}/${total})`;
  }
  // 2026-09-07：斐波那契投射 — 三步走 (基准段起点 P1 / 基准段终点 P2 / 投射起点 P3)
  if (tool === TOOL.FIBON_PRO) {
    const key =
      placed === 0 ? 'DrawStepFibProStart' :
      placed === 1 ? 'DrawStepFibProBaseEnd' :
      'DrawStepFibProProject';
    return `${t(key as any)} (${placed}/${total})`;
  }
  // 其他工具 (在移动端不暴露) 不展示步骤
  return null;
}