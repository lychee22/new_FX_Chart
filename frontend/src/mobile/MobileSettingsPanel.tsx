// 移动端设置面板: 全屏 Drawer, 上層/下層技術分析下拉 + 动态参数槽位 + 重設/套用
// 参考期望效果 -709069893.png 第 5 屏
// 2026-08-04：参数槽位接入后端计算 — 槽位数按指标动态 (0~3), 默认值 = 该指标后端默认参数,
// 切换指标时自动填充默认值; 支持小数 (SAR 0.02)。

import { Drawer, Select, InputNumber, Button, Divider } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { useState, useEffect, useRef } from 'react';
import { useI18n } from '../i18n';
import { UPPER_TECH, LOWER_TECH } from '../types';
import {
  UPPER_PARAM_COUNT,
  LOWER_PARAM_COUNT,
  defaultParamsFor,
} from '../constants/indicatorParams';

export interface MobileSettingsValue {
  upper: number;
  upperParams: number[];
  lower: number;
  lowerParams: number[];
}

interface MobileSettingsPanelProps {
  open: boolean;
  onClose: () => void;
  value: MobileSettingsValue;
  onApply: (next: MobileSettingsValue) => void;
  /** 2026-08-04：Drawer 渲染容器 — 全屏观看时传 chartWrap, 保证全屏元素内可见 */
  getContainer?: () => HTMLElement;
}

const UPPER_OPTIONS = [
  { value: UPPER_TECH.NONE, labelKey: 'Upper' as const },
  { value: UPPER_TECH.SMA, labelKey: 'SMA' as const },
  { value: UPPER_TECH.BOLL, labelKey: 'Boll' as const },
  { value: UPPER_TECH.EMA, labelKey: 'EMA' as const },
  { value: UPPER_TECH.SAR, labelKey: 'SAR' as const },
  { value: UPPER_TECH.IKH, labelKey: 'Ichimoku' as const },
  { value: UPPER_TECH.WMA, labelKey: 'WMA' as const },
  { value: UPPER_TECH.MAE, labelKey: 'MAE' as const },
  { value: UPPER_TECH.KC, labelKey: 'KC' as const },
];

// 2026-08-04：下层技术分析增加"關閉"选项 (LOWER_TECH.NONE) — 移动端最多一个副图, 可关闭。
// 2026-08-11："關閉"亦接入 i18n, 按当前语言渲染 (en: Off / tc: 關閉 / sc: 关闭)。
// 导出给 MobileLayout 复用 — 点击副图描述条弹出的指标选择列表与设置面板同一数据源。
export const LOWER_OPTIONS: Array<{ value: number; labelKey?: string; label?: string }> = [
  { value: LOWER_TECH.NONE, labelKey: 'Off' as const },
  { value: LOWER_TECH.VOLUME, labelKey: 'VOLUME' as const },
  { value: LOWER_TECH.RSI, labelKey: 'RSI' as const },
  { value: LOWER_TECH.MACD, labelKey: 'MACD' as const },
  { value: LOWER_TECH.STC, labelKey: 'STC' as const },
  { value: LOWER_TECH.MOM, labelKey: 'MOM' as const },
  { value: LOWER_TECH.PCTR, labelKey: 'PCTR' as const },
  { value: LOWER_TECH.OBV, labelKey: 'OBV' as const },
  { value: LOWER_TECH.MC, labelKey: 'MC' as const },
  { value: LOWER_TECH.ROC, labelKey: 'ROC' as const },
  { value: LOWER_TECH.ADX, labelKey: 'ADX' as const },
  { value: LOWER_TECH.MFI, labelKey: 'MFI' as const },
  { value: LOWER_TECH.VOLA, labelKey: 'VOLA' as const },
  { value: LOWER_TECH.CCI, labelKey: 'CCI' as const },
  { value: LOWER_TECH.ATR, labelKey: 'ATR' as const },
];

// 下層参数槽标签键: 3 参数指标 (MACD/STC) 用 Fast/Slow/Signal, 其余用 PeriodN
// 2026-08-11：键名固定, 实际文案在组件内通过 t() 按语言取 — 避免模块顶层依赖 hook。
const LOWER_SLOT_LABEL_KEYS = ['Fast', 'Slow', 'Signal'] as const;

export function MobileSettingsPanel({ open, onClose, value, onApply, getContainer }: MobileSettingsPanelProps) {
  const { t } = useI18n();
  const [draft, setDraft] = useState<MobileSettingsValue>(value);

  // 2026-08-06：每次打开面板时从当前已套用值重置草稿 — 副图经点击循环切换等外部入口
  // 改变后, 面板打开时下拉框与副图展示保持一致 (不再停留在首次挂载/上次会话的旧草稿)。
  const wasOpenRef = useRef(open);
  useEffect(() => {
    if (open && !wasOpenRef.current) setDraft(value);
    wasOpenRef.current = open;
  }, [open, value]);

  // 2026-08-04：重設 → 按当前选中的指标恢复其默认参数 (原固定 DEFAULT_VALUE 已废弃)
  const reset = () => {
    setDraft((d) => ({
      upper: d.upper,
      upperParams: defaultParamsFor('upper', d.upper),
      lower: d.lower,
      lowerParams: defaultParamsFor('lower', d.lower),
    }));
  };

  // 修改 draft 的辅助函数 — 切换指标时自动填充该指标默认参数
  const setUpper = (v: number) => setDraft((d) => ({ ...d, upper: v, upperParams: defaultParamsFor('upper', v) }));
  const setLower = (v: number) => setDraft((d) => ({ ...d, lower: v, lowerParams: defaultParamsFor('lower', v) }));
  const setUpperParam = (idx: number, v: number) =>
    setDraft((d) => {
      const next = [...d.upperParams];
      next[idx] = v;
      return { ...d, upperParams: next };
    });
  const setLowerParam = (idx: number, v: number) =>
    setDraft((d) => {
      const next = [...d.lowerParams];
      next[idx] = v;
      return { ...d, lowerParams: next };
    });

  // 2026-08-04：参数槽位数随指标动态 (0~3)
  const upperCount = UPPER_PARAM_COUNT[draft.upper] ?? 0;
  const lowerCount = LOWER_PARAM_COUNT[draft.lower] ?? 0;
  // 2026-08-11：3 参数指标用 快/慢/信號, 其余用 週期N — 文案按当前语言渲染
  const lowerLabels =
    lowerCount === 3
      ? LOWER_SLOT_LABEL_KEYS.map((k) => t(k as any))
      : Array.from({ length: lowerCount }, (_, i) => `${t('Period')}${i + 1}`);

  return (
    <Drawer
      title={t('Settings')}
      placement="bottom"
      height="100%"
      open={open}
      onClose={onClose}
      closeIcon={<CloseOutlined />}
      className="mobile-settings-panel"
      getContainer={getContainer}
      styles={{ body: { padding: 16 } }}
      extra={
        <Button type="link" onClick={reset}>
          {t('Reset')}
        </Button>
      }
    >
      <section className="mobile-settings-section">
        <div className="mobile-settings-label">{t('UpperLayerAnalysis')}</div>
        <Select
          value={draft.upper}
          onChange={setUpper}
          options={UPPER_OPTIONS.map((o) => ({ value: o.value, label: t(o.labelKey) }))}
          style={{ width: '100%' }}
        />
        {upperCount > 0 && (
          <div className="mobile-settings-params">
            {Array.from({ length: upperCount }, (_, i) => (
              <ParamSlot
                key={i}
                label={`${t('Param')}${i + 1}`}
                value={draft.upperParams[i]}
                onChange={(v) => setUpperParam(i, v)}
              />
            ))}
          </div>
        )}
      </section>

      <Divider />

      <section className="mobile-settings-section">
        <div className="mobile-settings-label">{t('LowerLayerAnalysis')}</div>
        <Select
          value={draft.lower}
          onChange={setLower}
          options={LOWER_OPTIONS.map((o) => ({ value: o.value, label: o.label ?? t(o.labelKey as any) }))}
          style={{ width: '100%' }}
        />
        {lowerCount > 0 && (
          <div className="mobile-settings-params">
            {Array.from({ length: lowerCount }, (_, i) => (
              <ParamSlot
                key={i}
                label={lowerLabels[i]}
                value={draft.lowerParams[i]}
                onChange={(v) => setLowerParam(i, v)}
              />
            ))}
          </div>
        )}
      </section>

      <div className="mobile-settings-footer">
        <Button block size="large" onClick={reset}>
          {t('Reset')}
        </Button>
        <Button
          block
          size="large"
          type="primary"
          onClick={() => {
            onApply(draft);
            onClose();
          }}
        >
          {t('Apply')}
        </Button>
      </div>
    </Drawer>
  );
}

interface ParamSlotProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
}

function ParamSlot({ label, value, onChange }: ParamSlotProps) {
  // 2026-08-04：支持小数参数 (SAR 默认 0.02) — 值 <1 时用 0.01 步进
  const isDecimal = value < 1;
  return (
    <div className="mobile-param-slot">
      <div className="mobile-param-label">{label}</div>
      <InputNumber
        value={value}
        onChange={(v) => onChange(Number(v ?? 0))}
        min={isDecimal ? 0 : 1}
        max={999}
        step={isDecimal ? 0.01 : 1}
      />
    </div>
  );
}
