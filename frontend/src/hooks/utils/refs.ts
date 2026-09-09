// 通用 hook 工具 — 与具体业务 hook 平级，无副作用。
// 2026-09-08：从 ChartPanel 抽到此处，统一跨 hook 协作模式。
//
// 设计依据：
//   - useRealtimeData.liveSelectionRef (L69-72)
//   - useChartDrawInteraction.lastHintTextRef (L97-99)
//   两处都已采用 "useRef + 立刻同步" 模式，仅缺一个 useEffect 保证跨 SSR 安全。
//   统一抽象为 useLatestRef 后，整套跨 hook 协作可对齐。

import { useEffect, useRef, type DependencyList } from 'react';

/**
 * 把任意值镜像到 ref — 闭包内读 .current 始终拿到最新值。
 *
 * 与 "useRef + render 阶段赋值" 模式等价，但额外通过 useEffect 在 mount 后
 * 仍持续同步, 避免 SSR hydration 时 render 阶段未跑导致的陈旧值。
 *
 * 用法：
 *   const latestCb = useLatestRef(callback);
 *   someLongLivedSubscription(() => latestCb.current?.());
 */
export function useLatestRef<T>(value: T) {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  });
  return ref;
}

/**
 * 挂载期订阅一组 window 自定义事件，自动在卸载时解绑。
 *
 * @param bindings 事件名 → 处理函数的映射
 * @param deps 可选依赖数组；变化时重新订阅（处理函数内部用 useLatestRef 读最新值时通常传 []）
 */
export function useWindowEvents(
  bindings: Record<string, (e: Event) => void>,
  deps: DependencyList = [],
) {
  useEffect(() => {
    const entries = Object.entries(bindings);
    entries.forEach(([name, fn]) => window.addEventListener(name, fn as EventListener));
    return () => {
      entries.forEach(([name, fn]) => window.removeEventListener(name, fn as EventListener));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
