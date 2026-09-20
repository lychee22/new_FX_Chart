// 副图指标编排 hook
// 2026-09-08：从 ChartPanel.tsx 抽到 hooks/useLowerPanes.ts
//
// 编排职责：
//   - 4 个 ref：lastLowerRef / lowerInitializedRef / lowerApplyVersionRef / failedLowerRef
//   - 4 个 React state：lowerLoadingStates / lowerErrorStates / lowerValues / pendingFadingOut
//   - [lower] effect（消费 tapSwitch flag → 重算 wsIndicatorsDisabled → diff added/removed → 单删单增走 replace / 精细 remove + 串行 add）
//   - [upperParams/lowerParams] effect（params 变化时 resetLowerPane + loadOverlayIndicator）
//   - 暴露 refreshLowerValues / removeLowerPaneImmediate / resetLowerPaneImmediate / moveLower / hide/restore 函数
//
// 5 个核心操作函数抽到 utils/lowerPaneOps.ts（buildPaneSeries / loadLowerIndicators / addLowerPane / replaceLowerPane / removeLowerPane / resetLowerPane）

import { useCallback, useEffect, useMemo, useRef, useState, type Dispatch, type MutableRefObject, type SetStateAction } from 'react';
import type { IChartApi, ISeriesApi } from 'lightweight-charts';
import type { Bar, IndicatorResult, NationPalette } from '../types';
import { UPPER_TECH } from '../types';
import { formatLastValue } from '../utils/formatters';
import { isDefaultParams } from '../constants/indicatorParams';
import {
  addLowerPane as addLowerPaneOp,
  loadLowerIndicators as loadLowerIndicatorsOp,
  removeLowerPane as removeLowerPaneOp,
  replaceLowerPane as replaceLowerPaneOp,
  resetLowerPane as resetLowerPaneOp,
  type LowerPaneOpsDeps,
} from '../utils/lowerPaneOps';

export interface UseLowerPanesDeps {
  chartRef: MutableRefObject<IChartApi | null>;
  paneSeriesMapRef: MutableRefObject<Map<number, ISeriesApi<any>[]>>;
  barsRef: MutableRefObject<Bar[]>;
  lowerResultsRef: MutableRefObject<Map<number, IndicatorResult>>;
  fullscreenRef: MutableRefObject<boolean>;
  // 跨 hook 协作
  fitTimeScaleDefault: () => void;
  syncPaneLayout: () => void;
  // 跨 hook 标志位 ref
  wsIndicatorsDisabledRef: MutableRefObject<boolean>;
  suppressUpperRef: MutableRefObject<boolean>;
  loadOverlayIndicator: (upper: number, code: string, interval: number, params?: number[]) => Promise<void>;
  // 上层 props
  palette: NationPalette;
  lower: number[];
  code: string;
  interval: number;
  lowerParams?: number[];
  upperParams?: number[];
  upper: number;
  decimals: number;
  // 回调
  onRemoveLower: (tech: number) => void;
  panesHiddenForFullscreenRef: MutableRefObject<boolean>;
}

export interface UseLowerPanesApi {
  lowerLoadingStates: Set<number>;
  lowerErrorStates: Set<number>;
  lowerValues: Map<number, string>;
  pendingFadingOut: Set<number>;
  refreshLowerValues: () => void;
  // 暴露给父级调用（如移动端删除按钮的 handleRemoveLower）
  removeLowerPaneImmediate: (tech: number) => void;
  resetLowerPaneImmediate: (tech: number) => void;
  moveLower: (tech: number, dir: -1 | 1) => void;
  // 全屏副图管理
  hideLowerPanesForFullscreen: () => void;
  restoreLowerPanesFromCache: () => Promise<void>;
  // 触发全量重建（由 loadMainData 调用）
  loadLowerIndicatorsFull: (code: string, interval: number) => Promise<void>;
}

export function useLowerPanes(deps: UseLowerPanesDeps): UseLowerPanesApi {
  const {
    chartRef, paneSeriesMapRef, barsRef, lowerResultsRef, fullscreenRef,
    fitTimeScaleDefault, syncPaneLayout,
    wsIndicatorsDisabledRef, suppressUpperRef, loadOverlayIndicator,
    palette, lower, code, interval, lowerParams, upperParams, upper,
    decimals, onRemoveLower, panesHiddenForFullscreenRef,
  } = deps;

  // ---- 4 个 ref ----
  // 2026-08-04：跟踪当前已加载到 chart 的副图指标数组（精细增/删路径用）
  const lastLowerRef = useRef<number[]>([]);
  // 2026-08-04：首次 loadLowerIndicators 完成前，[lower] effect 必须跳过精细增/删，
  // 避免与全量路径并发重复创建 pane / 报 priceScale index 错误。
  const lowerInitializedRef = useRef(false);
  // 2026-07-30：添加串行链版本锁 —— 每次 [lower] effect 递增，过期链放弃，
  // 保证任意时刻只有一条添加链在跑，杜绝并发链 paneIndex 撞车
  const lowerApplyVersionRef = useRef(0);
  // 2026-07-30：本轮全量重建中加载失败的 tech 集合，对账时排除，避免重复请求失败项
  const failedLowerRef = useRef<Set<number>>(new Set());

  // ---- 4 个 React state ----
  // 2026-07-31：副图加载/卸载骨架浮层 — 记录需要渲染骨架浮层的 paneIndex
  const [lowerLoadingStates, setLowerLoadingStates] = useState<Set<number>>(new Set());
  // 2026-07-31：副图淡出中（用户点击删除后 ~280ms 内显示淡出骨架）
  const [pendingFadingOut, setPendingFadingOut] = useState<Set<number>>(new Set());
  // 2026-07-30：副图数据异常 — sanitizePoints 后所有 series 都为空时标记，在浮层提示 message
  const [lowerErrorStates, setLowerErrorStates] = useState<Set<number>>(new Set());
  // 2026-07-29：副图实时 result (paneIndex → IndicatorResult)，浮层用其计算"当前值"
  const [lowerValues, setLowerValues] = useState<Map<number, string>>(new Map());

  // 2026-07-29：副图值格式化（响应 lowerResultsRef 变化；key=tech）
  const refreshLowerValues = useCallback(() => {
    const next = new Map<number, string>();
    lowerResultsRef.current.forEach((result, tech) => {
      next.set(tech, formatLastValue(result, decimals));
    });
    setLowerValues(next);
  }, [lowerResultsRef, decimals]);

  // 构造 lowerPaneOps 共用 deps（在闭包内每次重算，但传给 ops 函数后被同步消费）
  const buildOpsDeps = useCallback((): LowerPaneOpsDeps & { onFullReload: (code: string, interval: number) => void } => {
    const chart = chartRef.current;
    const paneMap = paneSeriesMapRef.current;
    return {
      chart: chart as IChartApi,
      paneMap: paneMap as Map<number, ISeriesApi<any>[]>,
      barsRef, lowerResultsRef, fullscreenRef,
      failedLowerRef, lastLowerRef, lowerApplyVersionRef,
      palette, lowerParams,
      setLowerLoadingStates, setLowerErrorStates, setLowerValues, setPendingFadingOut,
      decimals,
      fitTimeScaleDefault, syncPaneLayout,
      refreshLowerValues,
      onRemoveLower,
      // 反查失败兜底：触发全量重建
      onFullReload: (cd: string, iv: number) => {
        void loadLowerIndicatorsFullImpl(cd, iv);
      },
    };
  }, [chartRef, paneSeriesMapRef, barsRef, lowerResultsRef, fullscreenRef,
      failedLowerRef, lastLowerRef, lowerApplyVersionRef, palette, lowerParams,
      decimals, fitTimeScaleDefault, syncPaneLayout, refreshLowerValues, onRemoveLower]);

  // 全量重建实现（内部使用，loadLowerIndicatorsFull 暴露给 loadMainData）
  const loadLowerIndicatorsFullImpl = useCallback(async (cd: string, iv: number) => {
    const opsDeps = buildOpsDeps();
    lowerInitializedRef.current = false;
    await loadLowerIndicatorsOp(opsDeps, lower, cd, iv);
    lowerInitializedRef.current = true;
    // 对账（与原代码一致）
    const chart = chartRef.current;
    const liveLower = lower;
    const prevLower = lastLowerRef.current;
    if (!chart) return;
    const liveSet = new Set(liveLower);
    const prevSet = new Set(prevLower);
    const stillMissing = liveLower.filter((t) => !prevSet.has(t) && !failedLowerRef.current.has(t));
    const needRemove = prevLower.filter((t) => !liveSet.has(t));
    if (needRemove.length > 0) {
      lastLowerRef.current = [...liveLower];
      await loadLowerIndicatorsFullImpl(cd, iv);
      return;
    }
    if (stillMissing.length > 0) {
      lastLowerRef.current = [...liveLower];
      const opsDepsInner = buildOpsDeps();
      stillMissing.forEach((tech, i) =>
        addLowerPaneOp(opsDepsInner, tech, lastLowerRef.current.length - stillMissing.length + 1 + i, cd, iv),
      );
    }
    // 数量对账：移除幽灵 pane
    const extra = chart.panes().length - 1 - liveLower.length;
    if (extra > 0) {
      for (let k = 0; k < extra; k++) {
        const lastIdx = chart.panes().length - 1;
        if (lastIdx < 1) break;
        try {
          const orphans = chart.panes()[lastIdx].getSeries();
          for (const s of orphans) {
            try { chart.removeSeries(s); } catch (_) { /* ignore */ }
          }
        } catch (_) { /* ignore */ }
        try {
          chart.removePane(lastIdx);
        } catch (e) {
          console.warn(`[useLowerPanes] 对账移除幽灵 pane ${lastIdx} 失败:`, e);
        }
      }
      syncPaneLayout();
      refreshLowerValues();
    }
  }, [buildOpsDeps, lower, chartRef, syncPaneLayout, refreshLowerValues]);

  // 2026-07-29 原此处有 updatePaneTops（同步 pane 浮层定位）— 2026-09-10 移除：
  // 它只写本 hook 内部的 paneTops/paneRects state，从未被任何组件消费（死写入，
  // 还每次触发无意义 re-render），且内部依赖 (chart as any)._container 私有属性。
  // 真实浮层定位由 ChartPanel 顶层的 paneLayouts + ResizeObserver 路径负责。
  // lowerPaneOps 的 updatePaneTops 入参已改为可选（no-op），不再传入。

  // 2026-07-29：副图指标切换 (多选) ----
  // 2026-08-04：拆成两个 effect：
  //   - 数据加载大 effect [code, interval, chartType, decimals]：code/interval 变化时全量重建副图
  //   - [lower]：精细增/删（其他副图 series 保持原样，removeSeries+removePane / addSeries+setData）
  // 顺序变化由 handleMoveLower 走 panes.moveTo() 即时切换，不走这里。
  useEffect(() => {
    const curr = lower;

    // 2026-08-04：首次挂载 / code/interval 变化的全量重建还在 in-flight 时，[lower] effect 必须跳过。
    // 否则会和 loadLowerIndicators 并发重复创建同一个 pane（导致 priceScale index 错误）。
    if (!lowerInitializedRef.current) return;

    // 2026-08-05：消费触屏切换标志（一次性）— 图表内触屏切换副图入口 (MobileLayout.tapReplaceLower)
    // 会设置 __mobileLowerTap；设置面板入口不设置。触屏切换：不重置主图缩放、不重绘主图叠加指标。
    // 统一在这里消费（无论走替换/删除/新增哪条分支），避免标志残留污染后续设置面板操作。
    const isTapSwitch = (window as any).__mobileLowerTap !== undefined;
    if (isTapSwitch) delete (window as any).__mobileLowerTap;

    // 2026-08-05：触屏切换时 params effect 先以「旧 lower + 新参数」跑了一帧（App 对 lower 有
    // 16ms debounce），wsIndicatorsDisabledRef 可能被误置 true 且 params effect 不会重跑 —
    // 这里用新 lower 重算修正（默认参数 → false，WS 指标增量恢复）。
    wsIndicatorsDisabledRef.current =
      !isDefaultParams('upper', upper, upperParams) ||
      curr.some((t) => !isDefaultParams('lower', t, lowerParams));

    // 2026-08-05：触屏切换时本帧 WS 重订阅会触发后端重推全量 INDICATORS（含 upper）—
    // 在本 effect 执行时（WS 重订阅 effect 之前）同步武装一次性抑制标志，消除上一轮
    // "calculate 完成后才武装"的竞态（WS 推送先到导致抑制落空、叠加指标被历史首点拉回重绘）。
    if (isTapSwitch && upper !== UPPER_TECH.NONE) {
      suppressUpperRef.current = true;
    }

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
      const opsDeps = buildOpsDeps();
      void replaceLowerPaneOp(opsDeps, removed[0], added[0], code, interval, isTapSwitch);
      return;
    }

    // 2026-07-30：删除走**精细路径**（removeLowerPane 用 series 引用反查，只删目标 pane）。
    // 之前全量重建（清空→逐个重建）会造成"从 0 逐个长出 pane"的渐变动画；
    // 精细删除其他 pane 原样不动，无动画。
    removed.forEach((tech) => {
      const opsDeps = buildOpsDeps();
      removeLowerPaneOp(opsDeps, tech, lower, code, interval);
    });

    // 同步 lastLowerRef（删除已在 removeLowerPane 内 filter，这里覆盖为最终顺序）
    lastLowerRef.current = [...curr];

    if (removed.length > 0) {
      // 仅删除时同步刷新布局 (pane 数量变化, 拉伸权重需重新应用)
      syncPaneLayout();
      // 2026-08-05：触屏切换不重置主图时间轴缩放 (设置面板入口保持原行为)
      if (!isTapSwitch) requestAnimationFrame(fitTimeScaleDefault);
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
          const opsDeps = buildOpsDeps();
          await addLowerPaneOp(opsDeps, added[i], baseIdx + i, code, interval, isTapSwitch);
        }
      })().catch((e) => console.error('新增副图串行失败', e));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lower]);

  // ---- 2026-08-04：指标参数变化 (移动端设置面板接入) ----
  // upperParams/lowerParams 变化 → 用新参数重算对应指标：
  // - 叠加指标 loadOverlayIndicator (重建 series)
  // - 副图指标 resetLowerPane 精细重置 (pane 不动, 无闪烁)
  // 同时维护 wsIndicatorsDisabledRef：任一指标参数非默认 → 忽略 WS 指标增量。
  const paramsEffectInitializedRef = useRef(false);
  useEffect(() => {
    const disabled =
      !isDefaultParams('upper', upper, upperParams) ||
      lower.some((t) => !isDefaultParams('lower', t, lowerParams));
    wsIndicatorsDisabledRef.current = disabled;
    // 首次挂载由数据加载 effect 完成全量加载, 跳过重算
    if (!paramsEffectInitializedRef.current) {
      paramsEffectInitializedRef.current = true;
      return;
    }
    if (!chartRef.current) return;
    // 2026-08-05：触屏切换副图时 lowerParams 已切到新指标默认值，但 props.lower 仍是旧指标
    // (App 对 lower 有 16ms debounce) — 此时重算会误用「旧指标+新参数」重载旧 pane，
    // 并重建主图叠加指标（loadOverlayIndicator，IKH 还会重置缩放）。
    // 触屏切换必须跳过 (主图指标/缩放不受影响)；设置面板入口无标志，保持原行为。
    // 标志由 [lower] effect 统一消费，这里只读不删。
    if ((window as any).__mobileLowerTap !== undefined) return;
    if (upper !== UPPER_TECH.NONE) {
      void loadOverlayIndicator(upper, code, interval, upperParams);
    }
    lower.forEach((tech) => {
      const opsDeps = buildOpsDeps();
      void resetLowerPaneOp(opsDeps, tech, code, interval);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [upperParams, lowerParams]);

  // ---- 暴露给父级的函数 ----
  const removeLowerPaneImmediate = useCallback((tech: number) => {
    const opsDeps = buildOpsDeps();
    removeLowerPaneOp(opsDeps, tech, lower, code, interval);
  }, [buildOpsDeps, lower, code, interval]);

  const resetLowerPaneImmediate = useCallback((tech: number) => {
    const opsDeps = buildOpsDeps();
    void resetLowerPaneOp(opsDeps, tech, code, interval);
  }, [buildOpsDeps, code, interval]);

  // 2026-07-29：副图标题浮层按钮 handler
  // 2026-07-30 重写：pane.moveTo 已即时完成重排，series 不重建；只需同步 React state。
  // 2026-07-30 重构：paneMap/lowerResultsRef 的 key 是 tech（与位置无关），移动时**无需 swap**；
  // 但 lastLowerRef 是顺序基准，必须与 moveTo 同一时刻同步交换——否则 App 16ms pending
  // 未 flush 期间触发删除，会拿旧顺序推算 paneIndex 删错指标。
  const moveLower = useCallback((tech: number, dir: -1 | 1) => {
    const chart = chartRef.current;
    if (!chart) return;
    const panes = chart.panes();
    const lowerList = lower;
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
    // 上层 App 的 lower 数组同步由 ChartPanel.handleMoveLower 调 props.onReorderLower
    // 完成 (2026-09-10 删除 chart:reorder-lower 事件派发 — 全仓库无监听者的死代码)。
  }, [chartRef, lower]);

  // ---- 2026-08-05：横屏全屏真正隐藏副图 ----
  // 库对 pane 高度有硬性下限 (Math.max(计算值, 2)), setStretchFactor(0) 只能压成 2px 细缝,
  // CSS 也无法归零 — 唯一路径是移除 series → 空 pane 自动删除, 主图占满 100%。
  const hideLowerPanesForFullscreen = useCallback(() => {
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
        console.warn(`[useLowerPanes] 全屏隐藏副图 pane 失败:`, e);
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
  }, [chartRef, paneSeriesMapRef, syncPaneLayout, setLowerValues, setLowerLoadingStates, setPendingFadingOut, panesHiddenForFullscreenRef]);

  /** 退出全屏时从缓存恢复副图 — 按 props.lower 顺序重建 pane:
   *  命中 lowerResultsRef 缓存 → buildPaneSeries 直接重建 (零网络);
   *  缓存缺失 (全屏期间异步加载才完成) → addLowerPane 正常请求。 */
  const restoreLowerPanesFromCache = useCallback(async () => {
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
        console.warn(`[useLowerPanes] 全屏恢复前清空副图 pane 失败:`, e);
        break;
      }
    }
    paneMap.clear();
    // 2) 按 props.lower 顺序逐个重建
    let nextPane = 1;
    for (const tech of lower) {
      // 恢复期间又进了全屏 → 放弃, 由下一次 hide/restore 处理
      if (fullscreenRef.current) return;
      const cached = lowerResultsRef.current.get(tech);
      if (cached) {
        // 复用与 addLowerPane 相同的 paneIndex 兜底逻辑 (失败项不占位)
        const panesLenNow = chart.panes().length;
        const paneIndex = nextPane >= 1 && nextPane <= panesLenNow ? nextPane : panesLenNow;
        try {
          // 直接调用 buildPaneSeries（不通过 ops）
          const { buildPaneSeries } = await import('../utils/lowerPaneOps');
          const { seriesList } = buildPaneSeries(chart, tech, paneIndex, cached, palette);
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
          console.warn(`[useLowerPanes] 全屏恢复副图 ${tech} 失败:`, e);
        }
      } else {
        // 缓存缺失 → 走正常加载 (内部已有全屏守卫)
        const opsDeps = buildOpsDeps();
        await addLowerPaneOp(opsDeps, tech, nextPane, code, interval);
        nextPane++;
      }
    }
    refreshLowerValues();
    syncPaneLayout();
  }, [chartRef, paneSeriesMapRef, panesHiddenForFullscreenRef, lower,
      lowerResultsRef, fullscreenRef, palette, code, interval,
      setLowerErrorStates, setLowerLoadingStates,
      refreshLowerValues, syncPaneLayout, buildOpsDeps]);

  const loadLowerIndicatorsFull = useCallback(async (cd: string, iv: number) => {
    await loadLowerIndicatorsFullImpl(cd, iv);
  }, [loadLowerIndicatorsFullImpl]);

  return useMemo(() => ({
    lowerLoadingStates,
    lowerErrorStates,
    lowerValues,
    pendingFadingOut,
    refreshLowerValues,
    removeLowerPaneImmediate,
    resetLowerPaneImmediate,
    moveLower,
    hideLowerPanesForFullscreen,
    restoreLowerPanesFromCache,
    loadLowerIndicatorsFull,
  }), [
    lowerLoadingStates, lowerErrorStates, lowerValues, pendingFadingOut,
    refreshLowerValues, removeLowerPaneImmediate, resetLowerPaneImmediate,
    moveLower, hideLowerPanesForFullscreen, restoreLowerPanesFromCache, loadLowerIndicatorsFull,
  ]);
}
