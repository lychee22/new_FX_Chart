import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Toolbar from './components/Toolbar';
import ChartPanel from './components/ChartPanel';
import MobileLayout from './mobile/MobileLayout';
import { useIsMobile } from './hooks/useIsMobile';
import { marketApi } from './api/client';
import { I18nContext, STRINGS, type Lang, type StringKey } from './i18n';
import type { Instrument } from './types';
import { INTERVAL } from './types';

export default function App() {
  // ---- 国际化 ----
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
  const [lower, setLower] = useState<number[]>([]); // 多选副图指标 (支持多个叠加)
  const [tool, setTool] = useState(0);

  /** 副图指标多选切换: 已选则移除, 未选则添加。 */
  const toggleLower = useCallback((tech: number) => {
    setLower((prev) => (prev.includes(tech) ? prev.filter((x) => x !== tech) : [...prev, tech]));
  }, []);
  const [titleText, setTitleText] = useState('');

  const exportRef = useRef<() => void>(() => {});

  // ---- 移动端判定 ----
  const isMobile = useIsMobile();

  // ---- 加载品种列表 ----
  useEffect(() => {
    marketApi.getInstruments().then(setInstruments).catch(console.error);
  }, []);

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
  const onZoomOut = useCallback(() => (window as any).__chartZoom?.zoomOut(), []);
  const onZoomIn = useCallback(() => (window as any).__chartZoom?.zoomIn(), []);
  const onShiftLeft = useCallback(() => (window as any).__chartZoom?.shiftLeft(), []);
  const onShiftRight = useCallback(() => (window as any).__chartZoom?.shiftRight(), []);
  const onExport = useCallback(() => exportRef.current(), []);
  const registerExport = useCallback((fn: () => void) => { exportRef.current = fn; }, []);

  return (
    <I18nContext.Provider value={i18nValue}>
      <div className="app">
        {isMobile ? (
          <MobileLayout
            instruments={instruments}
            code={code}
            interval={interval}
            chartType={chartType}
            upper={upper}
            lower={lower}
            tool={tool}
            decimals={decimals}
            titleText={titleText}
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
            registerExport={registerExport}
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
              onZoomOut={onZoomOut}
              onZoomIn={onZoomIn}
              onShiftLeft={onShiftLeft}
              onShiftRight={onShiftRight}
              registerExport={registerExport}
            />
          </>
        )}
      </div>
    </I18nContext.Provider>
  );
}
