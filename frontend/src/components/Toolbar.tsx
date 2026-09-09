import { useState, useRef, useEffect } from 'react';
import { message } from 'antd';
import { useI18n } from '../i18n';
import type { StringKey } from '../i18n';
import { INTERVAL, UPPER_TECH, LOWER_TECH } from '../types';
import type { Instrument as Inst } from '../types';

// 工具栏选项配置 (对齐旧系统 charttest5.html 的下拉)
import { TOOLS, LIMITED_TOOLS, MAX_PER_TYPE } from '../drawing/tools';

interface ToolbarProps {
  instruments: Inst[];
  code: string;
  interval: number;
  chartType: number;
  upper: number;
  lower: number[];              // 多选副图指标
  tool: number;
  onCodeChange: (v: string) => void;
  onIntervalChange: (v: number) => void;
  onChartTypeChange: (v: number) => void;
  onUpperChange: (v: number) => void;
  onLowerChange: (v: number) => void;   // 切换某个副图的勾选状态
  onToolChange: (v: number) => void;
  onZoomOut: () => void;
  onZoomIn: () => void;
  onShiftLeft: () => void;
  onShiftRight: () => void;
  onExport: () => void;
  /** 2026-08-05：手动刷新 — 重拉 K 线 + 指标全量数据 (断线补数据/数据异常重试) */
  onRefresh: () => void;
  /** 2026-08-06：刷新进行中 — 刷新按钮旋转转圈 (不影响界面展示) */
  refreshing: boolean;
  onUndo: () => void;
  canUndo: boolean;
  /** 2026-07-31：清除所有已绘制对象 */
  onClearAll: () => void;
  /** 2026-07-31：是否有可清除对象 (扫帚按钮 disabled 状态) */
  canClear: boolean;
  /** 2026-09-04：品种列表加载失败标记 — 触发品种下拉旁的"暂无品种"徽标 */
  instrumentsError: boolean;
  /** 2026-09-04：重试拉取品种列表 — 独立于 onRefresh (后者只重拉图表数据) */
  onRetryInstruments: () => void;
  // 2026-09-07：每类工具当前已绘数量 (key=TOOL.*, value=count) — 受限工具 (LIMITED_TOOLS
  // 内除 TRENDLINE 外) 已有 5 个时, 选中对应工具立即弹 LimitReached 并阻断进入激活态。
  // 与移动端 MobileDrawingDrawer 的预检保持一致行为。
  drawingCounts?: Record<number, number>;
}

// 副图指标选项 (勾选式)
const LOWER_OPTIONS: { id: number; labelKey: StringKey }[] = [
  { id: LOWER_TECH.VOLUME, labelKey: 'VOLUME' },
  { id: LOWER_TECH.RSI, labelKey: 'RSI' },
  { id: LOWER_TECH.MACD, labelKey: 'MACD' },
  { id: LOWER_TECH.STC, labelKey: 'STC' },
  { id: LOWER_TECH.MOM, labelKey: 'MOM' },
  { id: LOWER_TECH.PCTR, labelKey: 'PCTR' },
  { id: LOWER_TECH.MC, labelKey: 'MC' },
  { id: LOWER_TECH.ROC, labelKey: 'ROC' },
  { id: LOWER_TECH.ADX, labelKey: 'ADX' },
  { id: LOWER_TECH.MFI, labelKey: 'MFI' },
  { id: LOWER_TECH.VOLA, labelKey: 'VOLA' },
  { id: LOWER_TECH.CCI, labelKey: 'CCI' },
  { id: LOWER_TECH.ATR, labelKey: 'ATR' },
];

/** 多选勾选下拉组件 (副图指标) — 精致自定义复选框。 */
function MultiSelectDropdown({ selected, options, onChange }: {
  selected: number[];
  options: { id: number; labelKey: StringKey }[];
  onChange: (id: number) => void;
  onClearAll?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { t } = useI18n();
  const menuId = 'lower-indicator-menu';
  useEffect(() => {
    // 2026-07-21 18:28:13：使用 Pointer Event，让 iOS/Android 点击浮层外部时都能可靠关闭菜单。
    const onPointerDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  const count = selected.length;
  const label = count === 0 ? t('Lower') : `${t('Lower')} (${count})`;

  return (
    <div className="multi-select" ref={ref}>
      <button
        type="button"
        className={`ms-trigger ${count > 0 ? 'ms-has-selected' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="listbox"
      >
        {label}
        <span className="ms-caret">▼</span>
      </button>
      {open && (
        <div className="ms-menu" id={menuId} role="listbox" aria-multiselectable="true">
          {options.map((opt) => {
            const checked = selected.includes(opt.id);
            return (
              <label
                key={opt.id}
                className={`ms-option ${checked ? 'ms-checked' : ''}`}
                onClick={(e) => {
                  // 阻止 label 默认行为, 用 onChange 控制状态
                  e.preventDefault();
                  onChange(opt.id);
                }}
              >
                <input type="checkbox" checked={checked} readOnly />
                <span className="ms-box" />
                <span>{t(opt.labelKey)}</span>
              </label>
            );
          })}
          {count > 0 && (
            <div className="ms-footer">
              <button type="button" onClick={() => selected.forEach((id) => onChange(id))}>
                {t('ClearAll')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Toolbar(props: ToolbarProps) {
  const { t, lang, setLang } = useI18n();
  const p = props;

  // 2026-09-07：受限工具 (LIMITED_TOOLS 内除 TRENDLINE 外) 上限预检 — 已有 5 个时
  // 弹 LimitReached 并阻止 setTool 进入激活态, 避免用户在画线下拉里"选中了却点不动"。
  // 与移动端 MobileDrawingDrawer.tsx:125-131 的预检保持一致。
  const handleToolSelect = (toolId: number) => {
    if (LIMITED_TOOLS.has(toolId)) {
      const count = p.drawingCounts?.[toolId] ?? 0;
      if (count >= MAX_PER_TYPE) {
        message.warning(t('LimitReached'));
        return;
      }
    }
    p.onToolChange(toolId);
  };

  return (
    <div className="toolbar" role="toolbar" aria-label="Chart controls">
      {/* 品种 — 2026-09-04：外层包 div 并排显示"暂无品种"重试徽标 (失败时显示) */}
      <div className="toolbar-instrument-group">
        <select
          value={p.code}
          onChange={(e) => p.onCodeChange(e.target.value)}
          title={t('chart')}
          aria-label={t('chart')}
          disabled={p.instruments.length === 0}
        >
          {p.instruments.map((it) => (
            <option key={it.code} value={it.code}>
              {it.name}
            </option>
          ))}
        </select>
        {p.instrumentsError && (
          <button
            type="button"
            className="toolbar-instrument-retry"
            onClick={p.onRetryInstruments}
            title={t('NoInstruments')}
            aria-label={t('NoInstruments')}
          >
            ⚠ {t('NoInstruments')} ⟳
          </button>
        )}
      </div>

      {/* 周期 */}
      <select value={p.interval} onChange={(e) => p.onIntervalChange(Number(e.target.value))} aria-label={t('Daily')}>
        <option value={INTERVAL.MIN}>{t('Min1')}</option>
        <option value={INTERVAL.FIVE_MIN}>{t('Min5')}</option>
        <option value={INTERVAL.TEN_MIN}>{t('Min10')}</option>
        <option value={INTERVAL.FIFTEEN_MIN}>{t('Min15')}</option>
        <option value={INTERVAL.THIRTY_MIN}>{t('Min30')}</option>
        <option value={INTERVAL.HOUR}>{t('Hour1')}</option>
        <option value={INTERVAL.TWO_HOUR}>{t('Hour2')}</option>
        <option value={INTERVAL.FOUR_HOUR}>{t('Hour4')}</option>
        <option value={INTERVAL.DAY}>{t('Daily')}</option>
        <option value={INTERVAL.WEEK}>{t('Weekly')}</option>
        <option value={INTERVAL.MONTH}>{t('Monthly')}</option>
      </select>

      {/* 图表类型 */}
      <select value={p.chartType} onChange={(e) => p.onChartTypeChange(Number(e.target.value))} aria-label={t('TypeCandle')}>
        <option value={0}>{t('TypeProsticks')}</option>
        <option value={1}>{t('BasicBar')}</option>
        <option value={2}>{t('TypeBar')}</option>
        <option value={3}>{t('TypeBarModal')}</option>
        <option value={4}>{t('TypeCandle')}</option>
        <option value={5}>{t('TypeModalLine')}</option>
        <option value={6}>{t('TypeLine')}</option>
        <option value={7}>{t('TypeArea')}</option>
        <option value={8}>{t('TypeMainVolume')}</option>
      </select>

      {/* 叠加指标 */}
      <select value={p.upper} onChange={(e) => p.onUpperChange(Number(e.target.value))} aria-label={t('Upper')}>
        <option value={UPPER_TECH.NONE}>{t('Upper')}</option>
        <option value={UPPER_TECH.SMA}>{t('SMA')}</option>
        <option value={UPPER_TECH.BOLL}>{t('Boll')}</option>
        <option value={UPPER_TECH.EMA}>{t('EMA')}</option>
        <option value={UPPER_TECH.SAR}>{t('SAR')}</option>
        <option value={UPPER_TECH.IKH}>{t('Ichimoku')}</option>
        <option value={UPPER_TECH.WMA}>{t('WMA')}</option>
        <option value={UPPER_TECH.MAE}>{t('MAE')}</option>
        <option value={UPPER_TECH.KC}>{t('KC')}</option>
      </select>

      {/* 副图指标 (多选勾选, 支持多个叠加) */}
      <MultiSelectDropdown selected={p.lower} options={LOWER_OPTIONS} onChange={p.onLowerChange} />

      {/* 绘图工具 */}
      <select value={p.tool} onChange={(e) => handleToolSelect(Number(e.target.value))} aria-label={t('Tools')}>
        {TOOLS.map((tool) => (
          <option key={tool.id} value={tool.id}>
            {t(tool.labelKey)}
          </option>
        ))}
      </select>

      {/* 缩放/平移/导出按钮 */}
      <button type="button" className="icon-btn" onClick={p.onZoomOut} title="Zoom Out" aria-label="Zoom Out">−</button>
      <button type="button" className="icon-btn" onClick={p.onZoomIn} title="Zoom In" aria-label="Zoom In">+</button>
      <button type="button" className="icon-btn" onClick={p.onShiftLeft} title="Shift Left" aria-label="Shift Left">◀</button>
      <button type="button" className="icon-btn" onClick={p.onShiftRight} title="Shift Right" aria-label="Shift Right">▶</button>
      <button
        type="button"
        className="icon-btn"
        onClick={p.onUndo}
        disabled={!p.canUndo}
        title={`${t('Undo')} (Ctrl+Z)`}
        aria-label={t('Undo')}
      >↶</button>
      {/* 2026-07-31：清除所有 — 把"清除"动作从工具下拉框挪到独立按钮。
          无对象时 disabled，避免误点。title 复用现有 i18n key "ClearAll"。 */}
      <button
        type="button"
        className="icon-btn"
        onClick={p.onClearAll}
        disabled={!p.canClear}
        title={t('ClearAll')}
        aria-label={t('ClearAll')}
      >🧹</button>
      <button type="button" className="icon-btn" onClick={p.onExport} title="Export" aria-label="Export">⤓</button>
      {/* 2026-08-05：手动刷新 — 断线补数据 / 加载失败重试; 2026-08-06：刷新期间按钮旋转转圈 */}
      <button
        type="button"
        className={`icon-btn${p.refreshing ? ' spinning' : ''}`}
        onClick={p.onRefresh}
        title={t('Refresh')}
        aria-label={t('Refresh')}
      >⟳</button>

      {/* 语言切换 */}
      <div className="lang-group" aria-label="Language">
        <button type="button" className={`lang-btn ${lang === 'en' ? 'active' : ''}`} onClick={() => setLang('en')}>EN</button>
        <button type="button" className={`lang-btn ${lang === 'tc' ? 'active' : ''}`} onClick={() => setLang('tc')}>繁</button>
        <button type="button" className={`lang-btn ${lang === 'sc' ? 'active' : ''}`} onClick={() => setLang('sc')}>简</button>
      </div>
    </div>
  );
}
