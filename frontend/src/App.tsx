import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { message } from 'antd';
import Toolbar from './components/Toolbar';
import ChartPanel from './components/ChartPanel';
import MobileLayout from './mobile/MobileLayout';
import { useIsMobile } from './hooks';
import { marketApi } from './api/client';
import { I18nContext, STRINGS, type Lang, type StringKey } from './i18n';
import type { Instrument } from './types';
import { INTERVAL, LOWER_TECH,type Nation, type NationPalette, type PcSnapshot } from './types';
import { defaultParamsFor } from './constants/indicatorParams';
import { DEFAULT_NATION, NATION_PALETTES } from './constants/chart';

// 2026-08-04：移动端默认副图指标 = 成交量 (需求1: 移动端展示一个默认主图 + 一个默认副图)
const DEFAULT_MOBILE_LOWER = LOWER_TECH.VOLUME;

export default function App() {
  const isMobile = useIsMobile();
  const [lang, setLangState] = useState<Lang>('sc');
  const t = useCallback((key: StringKey) => STRINGS[lang][key] ?? STRINGS.en[key] ?? key, [lang]);
  const setLang = useCallback((l: Lang) => setLangState(l), []);
  const i18nValue = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  // ---- 状态 ----
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [code, setCode] = useState('JPY');
  const [interval, setInterval] = useState<number>(INTERVAL.FIVE_MIN);
  const [chartType, setChartType] = useState(4); // 默认 Candlesticks (与旧系统一致)
  const [upper, setUpper] = useState(0);
  // 2026-08-04：初始即移动端时默认展示成交量副图 (需求1)。
  // 惰性初始化同步完成, 避免"挂载后 effect 重置 + 全量加载"的 16ms 竞态导致默认副图丢失。
  const [lower, setLower] = useState<number[]>(() => (isMobile ? [DEFAULT_MOBILE_LOWER] : [])); // 多选副图指标 (支持多个叠加)
  const [tool, setTool] = useState(0);
  // 2026-08-04：指标参数 (移动端设置面板接入) — 由设置面板提交, 面板内切换指标自动填充默认值。
  // 初始与当前指标匹配 (upper=0 NONE / lower=VOLUME 均无参数)。
  const [upperParams, setUpperParams] = useState<number[]>(() => defaultParamsFor('upper', 0));
  const [lowerParams, setLowerParams] = useState<number[]>(() => defaultParamsFor('lower', DEFAULT_MOBILE_LOWER));
  // 2026-08-06：刷新进行中 — ChartPanel 经 onRefreshingChange 上报, 驱动工具栏/顶栏刷新按钮转圈
  const [refreshing, setRefreshing] = useState(false);
  // 2026-09-04：品种列表加载失败标记 — 触发 Toolbar 内联空状态徽标
  const [instrumentsError, setInstrumentsError] = useState(false);

  // 2026-07-31：把同一帧密集触发的多次 toggle 合并为一次 setLower，
  // 避免 ChartPanel.loadLowerIndicators 每次都「清空+重建」造成逐个 pane 闪现
  const pendingLowerRef = useRef<number[] | null>(null); // 本批待提交的最终数组
  const flushLowerTimerRef = useRef<number | null>(null);

  const flushLower = useCallback(() => {
    flushLowerTimerRef.current = null;
    const next = pendingLowerRef.current;
    pendingLowerRef.current = null;
    if (next !== null) setLower(next);
  }, []);

  /** 副图指标多选切换: 已选则移除, 未选则添加。 */
  const toggleLower = useCallback((tech: number) => {
    // 以 ref 中"上一批已确认"的 lower 为基准（首次为 useState 初值 []）
    const base = pendingLowerRef.current ?? lower;
    const next = base.includes(tech)
      ? base.filter((x) => x !== tech)
      : [...base, tech];
    pendingLowerRef.current = next;
    if (flushLowerTimerRef.current === null) {
      flushLowerTimerRef.current = window.setTimeout(flushLower, 16);
    }
  }, [lower, flushLower]);

  // 2026-08-04：移动端副图单选替换语义 (需求2) — 设置面板选择即替换当前副图,
  // 与 toggleLower 不同: 不会"选中同一项取消", 且移动端最多保留一个副图。
  // LOWER_TECH.NONE → 清空副图 (0 个 pane)。
  const replaceLower = useCallback((tech: number) => {
    pendingLowerRef.current = tech === LOWER_TECH.NONE ? [] : [tech];
    if (flushLowerTimerRef.current === null) {
      flushLowerTimerRef.current = window.setTimeout(flushLower, 16);
    }
  }, [flushLower]);

  // 组件卸载时确保 pending 提交不丢失
  useEffect(() => () => {
    if (flushLowerTimerRef.current !== null) {
      window.clearTimeout(flushLowerTimerRef.current);
      flushLower();
    }
  }, [flushLower]);
  // 2026-07-30：副图上下移动 (dir = -1 上移 / +1 下移)，仅重排 React state 不重建 series
  // 2026-07-30：与 toggleLower/removeLower 统一走 pending 合并通道，避免 16ms debounce 未 flush 时
  // 直接 setLower 与 pending 互相覆盖（例如勾选后立刻删除，flush 又把已删的加回来）
  const reorderLower = useCallback((tech: number, dir: -1 | 1) => {
    const base = pendingLowerRef.current ?? lower;
    const idx = base.indexOf(tech);
    const target = idx + dir;
    if (idx < 0 || target < 0 || target >= base.length) return;
    const arr = [...base];
    [arr[idx], arr[target]] = [arr[target], arr[idx]];
    pendingLowerRef.current = arr;
    if (flushLowerTimerRef.current === null) {
      flushLowerTimerRef.current = window.setTimeout(flushLower, 16);
    }
  }, [lower, flushLower]);
  // 2026-07-29：删除指定副图（2026-07-30：与 toggleLower 同一 pending 通道，消除竞态）
  const removeLower = useCallback((tech: number) => {
    const base = pendingLowerRef.current ?? lower;
    const next = base.filter((x) => x !== tech);
    pendingLowerRef.current = next;
    if (flushLowerTimerRef.current === null) {
      flushLowerTimerRef.current = window.setTimeout(flushLower, 16);
    }
  }, [lower, flushLower]);
  const [titleText, setTitleText] = useState('');

  const exportRef = useRef<() => void>(() => {});

  // 2026-08-05：刷新入口 — ChartPanel 挂载后注册 refreshAllData,
  // 工具栏(PC) / 顶栏(移动端)的刷新按钮统一调用
  const refreshRef = useRef<() => void>(() => {});

  // 2026-07-30：撤销 / 回滚 — 通知 ChartPanel 移除最后一个绘图对象
  // canUndo 状态由 useChartCommandBus 通过 'chart:can-undo-changed' 事件上报（见下方 useEffect 订阅）
  const [canUndo, setCanUndo] = useState(false);
  const onUndo = useCallback(() => {
    // 通过 CustomEvent 让 ChartPanel 监听 (轻量, 不引入额外 Ref forwarding)
    window.dispatchEvent(new CustomEvent('chart:undo'));
  }, []);

  // 2026-07-31：清除所有 — 通知 ChartPanel 清空所有已绘制对象
  // canClear 与 canUndo 状态来源相同 (mgr.canUndo() = objects.length > 0)，
  // 2026-09-09：统一由 'chart:can-undo-changed' 事件驱动（见上方 useEffect 订阅）
  const [canClear, setCanClear] = useState(false);

  // 2026-09-07：每类工具当前已绘数量 (key=TOOL.*, value=count) — 由 ChartPanel 通过
  // subscribeObjectsChanged 上报。Toolbar 用来在选择受限工具时做上限预检
  // (与移动端 MobileDrawingDrawer 的预检保持一致, 弹出 LimitReached)。
  const [drawingCounts, setDrawingCounts] = useState<Record<number, number>>({});
  const registerDrawingCounts = useCallback((c: Record<number, number>) => setDrawingCounts(c), []);
  const onClearAll = useCallback(() => {
    window.dispatchEvent(new CustomEvent('chart:clear-all'));
  }, []);

  // Ctrl+Z (Windows/Linux) / Cmd+Z (Mac) 全局快捷键
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMod = e.ctrlKey || e.metaKey;
      if (isMod && (e.key === 'z' || e.key === 'Z') && !e.shiftKey && !e.altKey) {
        // 避免在输入框 / textarea 中误触发
        const tgt = e.target as HTMLElement | null;
        const tag = tgt?.tagName?.toLowerCase();
        if (tag === 'input' || tag === 'textarea' || tgt?.isContentEditable) return;
        e.preventDefault();
        onUndo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onUndo]);

  // 2026-09-09：订阅 useChartCommandBus 派发的 canUndo/canClear 状态变化事件。
  // 替代原本 ChartPanel 通过 registerCanUndo/registerCanClear prop 上报的双向耦合。
  useEffect(() => {
    const onCanUndoChanged = (e: Event) => {
      const can = !!(e as CustomEvent<boolean>).detail;
      setCanUndo(can);
      setCanClear(can);
    };
    window.addEventListener('chart:can-undo-changed', onCanUndoChanged);
    return () => window.removeEventListener('chart:can-undo-changed', onCanUndoChanged);
  }, []);

  // ---- 移动端判定 (已上移至状态区前, 供 lower 初始值使用) ----
  // 2026-08-04：进入移动端时完全重置图表展示 (需求1):
  // 主图=蜡烛图、副图=默认成交量、叠加指标=关闭、绘图工具清空。
  // 首次挂载即移动端时 lower 已由 useState 惰性初始化, 无需再触发 flush (避免与全量加载竞态)。
  // 2026-08-05：进入移动端**强制**"主图 + 默认成交量副图" (PC 已选副图不再带入);
  // 从 PC 切来时先快照 PC 配置 (含 pending 未提交的副图变更), 切回 PC 时恢复。
  const pcSnapshotRef = useRef<PcSnapshot | null>(null);
  const prevIsMobileRef = useRef<boolean | null>(null);
  useEffect(() => {
    const prev = prevIsMobileRef.current;
    if (isMobile) {
      if (prev !== true) {
        // 进入移动端 (从 PC 切来, 或首次挂载即移动端 prev=null)
        if (prev === false) {
          // 从 PC 切来 → 快照当前 PC 配置, 切回时恢复
          pcSnapshotRef.current = {
            chartType,
            upper,
            upperParams,
            lower: pendingLowerRef.current ?? lower,
            lowerParams,
            tool,
          };
        }
        // 强制移动端默认展示 (替代旧的"lower 为空才补" — PC 已选副图不再带入移动端)
        setChartType(4); // 默认 Candlesticks
        setUpper(0);     // 默认无叠加指标
        setUpperParams(defaultParamsFor('upper', 0));
        pendingLowerRef.current = [DEFAULT_MOBILE_LOWER];
        flushLower();
        setLowerParams(defaultParamsFor('lower', DEFAULT_MOBILE_LOWER));
        setTool(0);      // 默认无绘图工具 (TOOL.NONE)
      }
    } else if (prev === true && pcSnapshotRef.current) {
      // 切回 PC → 恢复离开前的配置
      const s = pcSnapshotRef.current;
      pcSnapshotRef.current = null;
      setChartType(s.chartType);
      setUpper(s.upper);
      setUpperParams(s.upperParams);
      pendingLowerRef.current = s.lower;
      flushLower();
      setLowerParams(s.lowerParams);
      setTool(s.tool);
    }
    prevIsMobileRef.current = isMobile;
    // 快照需读取切换瞬间的 chartType/upper/lower 等最新值, 由 isMobile 翻转驱动, 无需逐个依赖
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile, flushLower]);

  // ---- 区域 (nation) 配置 ----
  // 后端未提供 nation 接口前, mock 默认 DEFAULT_NATION = 1 (黑白)
  // 接入后端时, 改为:
  //   useEffect(() => {
  //     fetch('/api/config').then(r => r.json()).then(d => setNation(d.nation as Nation));
  //   }, []);
  const [nation, setNation] = useState<Nation>(DEFAULT_NATION);
  const palette: NationPalette = NATION_PALETTES[nation];

  // ---- 加载品种列表 ----
  // 2026-09-04：抽成 loadInstruments 回调 — Toolbar 的"暂无品种"徽标可直接重试拉取
  const loadInstruments = useCallback(() => {
    setInstrumentsError(false);
    marketApi.getInstruments()
      .then((data) => {
        setInstruments(data);
        setInstrumentsError(false);
      })
      .catch((e) => {
        console.error('加载品种列表失败', e);
        // 2026-08-05：品种列表失败不再静默 (之前只回退 decimals=2, 下拉为空无任何提示)
        message.error(t('LoadFailed'));
        setInstrumentsError(true);
      });
  }, [t]);
  useEffect(() => { loadInstruments(); }, [loadInstruments]);

  // ---- 更新标题 ----
  useEffect(() => {
    const inst = instruments.find((i) => i.code === code);
    const name = inst ? inst.name : code;
    setTitleText(`${name}(${code})`);
  }, [code, instruments, t]);

  // ---- 当前品种的小数位 ----
  const decimals = useMemo(() => {
    const inst = instruments.find((i) => i.code === code);
    return inst?.decimals ?? 2;
  }, [code, instruments]);

  // ---- 工具栏回调 ----
  // 2026-09-10：缩放/平移改走 registerZoom 注册（原 window.__chartZoom 全局变量迁移）
  const zoomApiRef = useRef<{ zoomOut: () => void; zoomIn: () => void; shiftLeft: () => void; shiftRight: () => void }>({ zoomOut: () => {}, zoomIn: () => {}, shiftLeft: () => {}, shiftRight: () => {} });
  const registerZoom = useCallback((api: typeof zoomApiRef.current) => { zoomApiRef.current = api; }, []);
  const onZoomOut = useCallback(() => zoomApiRef.current.zoomOut(), []);
  const onZoomIn = useCallback(() => zoomApiRef.current.zoomIn(), []);
  const onShiftLeft = useCallback(() => zoomApiRef.current.shiftLeft(), []);
  const onShiftRight = useCallback(() => zoomApiRef.current.shiftRight(), []);
  const onExport = useCallback(() => exportRef.current(), []);
  const registerExport = useCallback((fn: () => void) => { exportRef.current = fn; }, []);
  const onRefresh = useCallback(() => refreshRef.current(), []);
  const registerRefresh = useCallback((fn: () => void) => { refreshRef.current = fn; }, []);

  return (
    <I18nContext.Provider value={i18nValue}>
      <div className="app">
        {isMobile ? (
          <MobileLayout
            mobile={isMobile}
            instruments={instruments}
            code={code}
            interval={interval}
            chartType={chartType}
            upper={upper}
            upperParams={upperParams}
            lower={lower}
            lowerParams={lowerParams}
            tool={tool}
            decimals={decimals}
            palette={palette}
            titleText={titleText}
            onCodeChange={setCode}
            onIntervalChange={setInterval}
            onChartTypeChange={setChartType}
            onUpperChange={setUpper}
            onUpperParamsChange={setUpperParams}
            onLowerChange={replaceLower}
            onLowerParamsChange={setLowerParams}
            onToolChange={setTool}
            onReorderLower={reorderLower}
            onRemoveLower={removeLower}
            registerExport={registerExport}
            onRefresh={onRefresh}
            refreshing={refreshing}
            onRefreshingChange={setRefreshing}
            registerRefresh={registerRefresh}
            onClearAll={onClearAll}
            canClear={canClear}
          />
        ) : (
          <>
          <Toolbar
            instruments={instruments}
            code={code}
            interval={interval}
            chartType={chartType}
            upper={upper}
            lower={lower}
            tool={tool}
            onCodeChange={setCode}
            onIntervalChange={setInterval}
            onChartTypeChange={setChartType}
            onUpperChange={setUpper}
            onLowerChange={toggleLower}
            onToolChange={setTool}
            onZoomOut={onZoomOut}
            onZoomIn={onZoomIn}
            onShiftLeft={onShiftLeft}
            onShiftRight={onShiftRight}
            onExport={onExport}
            onRefresh={onRefresh}
            refreshing={refreshing}
            onUndo={onUndo}
            canUndo={canUndo}
            canClear={canClear}
            onClearAll={onClearAll}
            instrumentsError={instrumentsError}
            onRetryInstruments={loadInstruments}
            drawingCounts={drawingCounts}
          />
          <div className="title-bar">{titleText} {t('chart')}</div>
            <ChartPanel
              code={code}
              interval={interval}
              chartType={chartType}
              upper={upper}
              lower={lower}
              tool={tool}
              decimals={decimals}
              palette={palette}
              mobile={isMobile}
              onReorderLower={reorderLower}
              onRemoveLower={removeLower}
              registerExport={registerExport}
              registerRefresh={registerRefresh}
              registerZoom={registerZoom}
              onRefreshingChange={setRefreshing}
              onToolChange={setTool}
              registerDrawingCounts={registerDrawingCounts}
            />
          </>
        )}
      </div>
    </I18nContext.Provider>
  );
}
