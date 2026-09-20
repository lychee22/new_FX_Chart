// 副图指标纯函数化（2026-09-08：从 ChartPanel.tsx 抽到 utils/lowerPaneOps.ts）
//
// 包含：
//   - buildPaneSeries    — 给定 result，为指定 paneIndex 创建 series + 写入数据
//   - loadLowerIndicators — 全量加载副图（仅在 code/interval 变化时调用，先清空再重建）
//   - addLowerPane       — 精细新增（仅 addSeries + setData 一个新 pane）
//   - replaceLowerPane   — 副图原地替换（移动端点击副图循环切换 / PC 单删单增）
//   - removeLowerPane    — 精细删除（仅 removeSeries + removePane 一个 pane）
//   - resetLowerPane     — 精细重置（仅对指定 pane 的 series 调用 setData）
//
// 所有函数接收 LowerPaneOpsDeps 作为共享依赖，便于在 hook 与 refreshAllData 等
// 场景中复用同一套执行路径。

import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import type { IChartApi, ISeriesApi, Time } from 'lightweight-charts';
import type { Bar, IndicatorResult, NationPalette } from '../types';
import { LOWER_TECH } from '../types';
import { formatIndicatorParams } from '../constants/indicatorParams';
import { sanitizePoints, formatLastValue } from '../utils/formatters';
import { HistogramSeries, LineSeries } from 'lightweight-charts';
// 2026-09-10：修复预存构建错误 — 原从 constants/nation 导入 NationPalette，但该文件
// 是无导出的空壳（只有注释），真实定义在 types/index.ts。
import { indicatorApi } from '../api/client';

/** 共享依赖入参 — 把现在依赖的 ref/state 聚合成 deps 对象 */
export interface LowerPaneOpsDeps {
  chart: IChartApi;
  paneMap: Map<number, ISeriesApi<any>[]>;
  barsRef: MutableRefObject<Bar[]>;
  lowerResultsRef: MutableRefObject<Map<number, IndicatorResult>>;
  fullscreenRef: MutableRefObject<boolean>;
  failedLowerRef: MutableRefObject<Set<number>>;
  lastLowerRef: MutableRefObject<number[]>;
  lowerApplyVersionRef: MutableRefObject<number>;
  palette: NationPalette;
  lowerParams?: number[];
  // React state setters — 用 setState action 包装避免 hook 化
  setLowerLoadingStates: Dispatch<SetStateAction<Set<number>>>;
  setLowerErrorStates: Dispatch<SetStateAction<Set<number>>>;
  setLowerValues: Dispatch<SetStateAction<Map<number, string>>>;
  setPendingFadingOut?: Dispatch<SetStateAction<Set<number>>>;
  // 浮层格式化
  decimals: number;
  // 工具函数
  fitTimeScaleDefault: () => void;
  syncPaneLayout: () => void;
  // 2026-09-10：改为可选 — 原实现只写 useLowerPanes 内部的死 state（从未被消费），
  // 真实浮层定位由 ChartPanel 顶层 ResizeObserver + paneLayouts 负责，hook 侧已删除。
  updatePaneTops?: () => void;
  refreshLowerValues: () => void;
  // 回调（用于通知父组件）
  onRemoveLower: (tech: number) => void;
}

/** 给定 result，为指定 paneIndex 创建 series + 写入数据
 *  2026-07-30：所有 setData 走 sanitizePoints，脏数据(NaN/重复 time/乱序)被丢弃，不再让 setData 抛 Assertion。
 *  2026-07-30：返回 { seriesList, allEmpty }：所有 series 都空 → 浮层显示 message 而非空白。
 *  2026-07-30：每个 addSeries/setData 单独 try/catch，单 series 失败不影响后续 series 写入。
 *  2026-09-08：抽到 utils/lowerPaneOps.ts */
export function buildPaneSeries(
  chart: IChartApi,
  lower: number,
  paneIndex: number,
  result: IndicatorResult,
  palette: NationPalette,
): { seriesList: ISeriesApi<any>[]; allEmpty: boolean } {
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
            color: d.value >= 0 ? palette.overlay.up : palette.overlay.down,
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
      console.warn(`[lowerPaneOps] buildPaneSeries 第 ${i} 条 series 失败 (已跳过):`, e);
    }
  }
  try {
    chart.priceScale('right', paneIndex).applyOptions({ scaleMargins: { top: 0.1, bottom: 0.1 } });
  } catch (e) {
    console.warn('[lowerPaneOps] priceScale applyOptions 失败:', e);
  }
  return { seriesList, allEmpty: totalPoints === 0 };
}

/** 全量加载副图（仅在 code/interval 变化时调用，先清空再重建所有副图）。 */
export async function loadLowerIndicators(
  deps: LowerPaneOpsDeps,
  selected: number[],
  code: string,
  interval: number,
): Promise<void> {
  const { chart, paneMap, lowerResultsRef, fullscreenRef, failedLowerRef, lastLowerRef,
    palette, lowerParams, decimals, setLowerLoadingStates, setLowerErrorStates,
    setLowerValues, setPendingFadingOut, fitTimeScaleDefault, syncPaneLayout,
    refreshLowerValues, onRemoveLower } = deps;
  if (!chart || !paneMap) return;
  // 2026-08-04：先**同步**设置 lastLowerRef，[lower] effect 看到 prev === curr 就不会重复 add。
  // 等价于把"占位"先放好 — 即使后续 addSeries 还没回来，[lower] effect 也不会重复触发。
  lastLowerRef.current = [...selected];
  // 2026-08-04：code/interval 变化触发全量重建期间，[lower] effect 必须跳过精细增/删。
  // （lowerInitializedRef 由 useLowerPanes hook 维护，此处用本函数闭包外的标志位协调）
  // 标志位由调用方（useLowerPanes）管理，本函数不直接读写
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
    setLowerErrorStates((prev) => {
      if (prev.size === 0) return prev;
      return new Set();
    });
    // 2026-07-30：removePane(1) 循环 —— 每次删第一个副图，直到只剩主图；
    // 每个单独 try/catch，一旦失败立即中止（避免死循环），剩余 pane 由数量对账兜底
    let guard = 0;
    while (chart.panes().length > 1 && guard++ < 50) {
      try {
        chart.removePane(1);
      } catch (e) {
        console.warn(`[lowerPaneOps] 清空副图 pane 失败:`, e);
        break;
      }
    }
    // 2026-07-31：removePane 已把所有 pane 干掉，"待淡出"骨架没必要继续显示
    if (setPendingFadingOut) {
      setPendingFadingOut((prev) => {
        if (prev.size === 0) return prev;
        return new Set();
      });
    }
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
        const result = await indicatorApi.calculate('lower', lower, code, interval, formatIndicatorParams('lower', lower, lowerParams));
        // 2026-08-05：全屏中只缓存不建 series (退出全屏由 restore 统一补建, 不占 paneIndex)
        lowerResultsRef.current.set(lower, result);
        if (fullscreenRef.current) continue;
        const { seriesList, allEmpty } = buildPaneSeries(chart, lower, paneIndex, result, palette);
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
        onRemoveLower(lower);
      }
    }
    refreshLowerValues();
    syncPaneLayout();
    // 2026-07-30: 副图指标异步加载完成后再 fitContent,
    // 避免主图被空 pane 挤压造成副图"挤在画布中间"的视觉异常。
    requestAnimationFrame(fitTimeScaleDefault);
  } catch (e) {
    console.error('[lowerPaneOps] loadLowerIndicators 异常（已恢复标志）:', e);
  } finally {
    // 2026-07-30：无论成功/异常，必须恢复标志 —— 否则 [lower] effect 永久跳过，
    // 所有删除/添加操作全部失效（勾选与 pane 不一致的偶发根因）
    // lowerInitializedRef 由 useLowerPanes hook 维护，调用方负责 finally 内置 true
  }
  // 2026-07-30：对账 — 重建 in-flight 期间用户可能增删过副图，
  // 用 liveSelectionRef.current.lower 与 lastLowerRef 做 diff，补齐差异避免 pane 残留/缺失
  // liveLower 由调用方传入，因为本函数不能直接读 useLowerPanes hook 内部的 liveSelectionRef
  // 实际上调用方（useLowerPanes）应当传入 liveLower 来完成对账；此处省略此段以避免重复执行
  // （loadLowerIndicators 由 [lower] effect 与 loadMainData 双重调用，对账逻辑仅在 [lower] effect 内执行）
  // 注：原代码此处会通过 props.lower 对账，但函数化后 liveLower 由外部传入更清晰
}

/** 精细新增：仅 addSeries + setData 一个新 pane，其他副图完全不动。
 *  2026-07-30：兜底 — paneIndex 用 chart.panes().length 现场取值，避免外部传入的索引与真实 pane 错位。
 *  2026-07-30：失败回滚 — 用 chart 当前真实状态清理半创建的 pane/series，并通知父组件回滚 props.lower，
 *  防止后续 paneIndex 计算再次错位导致连锁失败。
 *  2026-09-08：抽到 utils/lowerPaneOps.ts */
export async function addLowerPane(
  deps: LowerPaneOpsDeps,
  tech: number,
  hintPaneIndex: number,
  code: string,
  interval: number,
  // 2026-08-05：触屏切换副图 (关闭→指标) — 跳过主图时间轴缩放重置; 设置面板/全量重建保持原行为。
  skipZoomReset = false,
): Promise<void> {
  const { chart, paneMap, lowerResultsRef, fullscreenRef, failedLowerRef, lastLowerRef,
    palette, lowerParams, setLowerLoadingStates, setLowerErrorStates,
    fitTimeScaleDefault, syncPaneLayout, refreshLowerValues, onRemoveLower } = deps;
  if (!chart || !paneMap) return;
  // 执行时的真实目标 paneIndex = 当前 pane 总数（新建会被追加到末尾）
  // 仅在 hintPaneIndex 落在合法范围时复用 hint（如 addSeries 显式传 index 场景的兼容性）
  const panesLenNow = chart.panes().length;
  const paneIndex = hintPaneIndex >= 1 && hintPaneIndex <= panesLenNow
    ? hintPaneIndex
    : panesLenNow;
  try {
    const result = await indicatorApi.calculate('lower', tech, code, interval, formatIndicatorParams('lower', tech, lowerParams));
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
    const { seriesList, allEmpty } = buildPaneSeries(chart, tech, paneIndex, result, palette);
    paneMap.set(tech, seriesList);
    setLowerLoadingStates((prev) => {
      const next = new Set(prev);
      next.delete(tech);
      return next;
    });
    if (allEmpty) setLowerErrorStates((prev) => new Set(prev).add(tech));
    failedLowerRef.current.delete(tech);
    refreshLowerValues();
    // pane 数量变化, 拉伸权重需重新应用 (触屏切换也保留)
    syncPaneLayout();
    // 2026-08-05：触屏切换 (关闭→指标) 不重置主图时间轴缩放
    if (!skipZoomReset) requestAnimationFrame(fitTimeScaleDefault);
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
    onRemoveLower(tech);
    failedLowerRef.current.add(tech);
    setLowerLoadingStates((prev) => {
      const next = new Set(prev);
      next.delete(tech);
      return next;
    });
    setLowerErrorStates((prev) => new Set(prev).add(tech));
  }
}

/** 2026-08-04：副图原地替换（移动端点击副图循环切换 / PC 单删单增）——
 *  复用同一 pane, 切换过程中副图空间固定、无过渡动画。
 *  先异步加载新指标（旧指标继续显示）→ 数据就绪后同一帧内
 *  addSeries 新 series（pane 非空, 不会被自动移除）→ removeSeries 旧 series。
 *  2026-09-08：抽到 utils/lowerPaneOps.ts */
export async function replaceLowerPane(
  deps: LowerPaneOpsDeps & LowerPaneOpsExtraCallbacks,
  oldTech: number,
  newTech: number,
  code: string,
  interval: number,
  // 2026-08-05：触屏切换判定由 [lower] effect 统一消费标志后传入 —
  // 触屏切换不重置主图缩放、不触发主图/叠加指标重绘; 设置面板入口保持原行为。
  isTapSwitch = false,
): Promise<void> {
  const { chart, paneMap, lowerResultsRef, fullscreenRef, failedLowerRef,
    palette, setLowerErrorStates, syncPaneLayout, fitTimeScaleDefault,
    updatePaneTops, refreshLowerValues, onRemoveLower } = deps;
  if (!chart || !paneMap) return;
  // 反查旧指标所在 pane（series 引用反查, 与 removeLowerPane 一致）
  const oldSeriesList = paneMap.get(oldTech) ?? [];
  const paneIndex = chart.panes().findIndex((p) =>
    oldSeriesList.some((s) => p.getSeries().includes(s)),
  );
  if (paneIndex < 1) {
    // 旧 pane 找不到（状态异常）→ 走原精细增/删路径兜底
    removeLowerPane(deps, oldTech, [], code, interval);
    void addLowerPane(deps, newTech, 1, code, interval, isTapSwitch);
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
    const { seriesList, allEmpty } = buildPaneSeries(chart, newTech, paneIndex, result, palette);
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
    if (isTapSwitch) {
      // 2026-08-05：触屏切换副图 — 不重置主图时间轴缩放、不重排 pane 布局
      // (pane 数量不变, 拉伸权重无需重新应用)。WS 重订阅触发的 upper 全量重推
      // 已由 [lower] effect 同步武装的 suppressUpperRef 抑制, 叠加指标不被拉回起点重绘。
    } else {
      // 设置面板入口 — 保持原行为: 同步 pane 布局并重置默认时间轴范围。
      syncPaneLayout();
      requestAnimationFrame(fitTimeScaleDefault);
    }
    updatePaneTops?.();
  } catch (e) {
    console.error(`替换副图指标 ${oldTech} → ${newTech} 失败`, e);
    // 失败回滚: 通知父组件取消新指标（旧指标仍显示, 由全量重建兜底收敛状态）
    onRemoveLower(newTech);
    failedLowerRef.current.add(newTech);
    setLowerErrorStates((prev) => new Set(prev).add(newTech));
  }
}

/** 精细删除：仅 removeSeries + removePane 一个 pane，其余副图完全不动。
 *  2026-07-30 重写（彻底废弃位置推算）：
 *   - 唯一可靠依据 = series 对象引用反查（chart.panes().findIndex(p => p.getSeries().includes(series))），
 *     无论 pane 怎么移动/重排，反查到的必是持有该 series 的 pane
 *   - 反查失败 → 不推算、不硬删，直接触发**全量重建兜底**（以 props.lower 为唯一事实来源），
 *     任何状态错位/残留都会被重建清掉，绝不会产生错误删除
 *  2026-09-08：抽到 utils/lowerPaneOps.ts
 *  liveLower 在反查失败时需要调用全量重建兜底；由于 props 在原 ChartPanel 中可见，此处由调用方注入。
 *  由于不持有 props，此处把 onFullReload 回调注入到 deps 中：
 *  onFullReload?: (code, interval) => void  —— 反查失败兜底用 */
export interface LowerPaneOpsExtraCallbacks {
  /** 反查失败兜底：触发全量重建（由 useLowerPanes hook 内部实现） */
  onFullReload: (code: string, interval: number) => void;
}

export function removeLowerPane(
  deps: LowerPaneOpsDeps & LowerPaneOpsExtraCallbacks,
  tech: number,
  liveLower: number[],
  code: string,
  interval: number,
): void {
  const { chart, paneMap, lowerResultsRef, lastLowerRef, decimals,
    setLowerValues, setLowerErrorStates, setLowerLoadingStates,
    updatePaneTops, onFullReload } = deps;
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
    console.warn(`[lowerPaneOps] 删除 ${tech} 反查 pane 失败，触发全量重建兜底`);
    paneMap.delete(tech);
    lowerResultsRef.current.delete(tech);
    lastLowerRef.current = lastLowerRef.current.filter((t) => t !== tech);
    onFullReload(code, interval);
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
        console.warn(`[lowerPaneOps] removeSeries 跳过 (可能重复):`, e);
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
      console.warn(`[lowerPaneOps] removePane 失败:`, e);
    }
  }

  // 5) 清理 React state（key=tech）
  lastLowerRef.current = lastLowerRef.current.filter((t) => t !== tech);
  setLowerValues(() => {
    const next = new Map<number, string>();
    lowerResultsRef.current.forEach((result, k) => {
      next.set(k, formatLastValue(result, decimals));
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
  updatePaneTops?.();
  // 注：liveLower 入参保留以备将来扩展（例如把 liveLower 与 lastLowerRef 做一致性校验），
  // 当前实现中反查失败已通过 onFullReload 兜底，无需进一步校验。
  void liveLower;
}

/** 精细重置：仅对指定 pane 的 series 调用 setData(newData)，其他副图完全不动。
 *  2026-09-08：抽到 utils/lowerPaneOps.ts */
export async function resetLowerPane(
  deps: LowerPaneOpsDeps,
  tech: number,
  code: string,
  interval: number,
): Promise<void> {
  const { chart, paneMap, lowerResultsRef, fullscreenRef, palette, lowerParams,
    setLowerLoadingStates, refreshLowerValues } = deps;
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
    const result = await indicatorApi.calculate('lower', tech, code, interval, formatIndicatorParams('lower', tech, lowerParams));
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
            color: d.value >= 0 ? palette.overlay.up : palette.overlay.down,
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
}
