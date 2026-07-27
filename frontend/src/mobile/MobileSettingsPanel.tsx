// 移动端设置面板: 全屏 Drawer, 上層/下層技術分析下拉 + 3 个参数槽位 + 重設/套用
// 参考期望效果 -709069893.png 第 5 屏

import { Drawer, Select, InputNumber, Button, Divider } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useI18n } from '../i18n';
import { UPPER_TECH, LOWER_TECH, INTERVAL } from '../types';

export interface MobileSettingsValue {
  upper: number;
  upperParams: [number, number, number];
  lower: number;
  lowerParams: [number, number, number];
}

interface MobileSettingsPanelProps {
  open: boolean;
  onClose: () => void;
  value: MobileSettingsValue;
  onApply: (next: MobileSettingsValue) => void;
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

const LOWER_OPTIONS = [
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

const DEFAULT_VALUE: MobileSettingsValue = {
  upper: UPPER_TECH.SMA,
  upperParams: [3, 5, 25],
  lower: LOWER_TECH.MACD,
  lowerParams: [12, 26, 9],
};

export function MobileSettingsPanel({ open, onClose, value, onApply }: MobileSettingsPanelProps) {
  const { t } = useI18n();
  const [draft, setDraft] = useState<MobileSettingsValue>(value);

  const reset = () => setDraft(DEFAULT_VALUE);

  // 修改 draft 的辅助函数
  const setUpper = (v: number) => setDraft((d) => ({ ...d, upper: v }));
  const setLower = (v: number) => setDraft((d) => ({ ...d, lower: v }));
  const setUpperParam = (idx: number, v: number) =>
    setDraft((d) => {
      const next: [number, number, number] = [...d.upperParams];
      next[idx] = v;
      return { ...d, upperParams: next };
    });
  const setLowerParam = (idx: number, v: number) =>
    setDraft((d) => {
      const next: [number, number, number] = [...d.lowerParams];
      next[idx] = v;
      return { ...d, lowerParams: next };
    });

  return (
    <Drawer
      title="設定"
      placement="bottom"
      height="100%"
      open={open}
      onClose={onClose}
      closeIcon={<CloseOutlined />}
      className="mobile-settings-panel"
      styles={{ body: { padding: 16 } }}
      extra={
        <Button type="link" onClick={reset}>
          重設
        </Button>
      }
    >
      <section className="mobile-settings-section">
        <div className="mobile-settings-label">上層技術分析</div>
        <Select
          value={draft.upper}
          onChange={setUpper}
          options={UPPER_OPTIONS.map((o) => ({ value: o.value, label: t(o.labelKey) }))}
          style={{ width: '100%' }}
        />
        <div className="mobile-settings-params">
          <ParamSlot label="時間槽1" value={draft.upperParams[0]} onChange={(v) => setUpperParam(0, v)} />
          <ParamSlot label="時間槽2" value={draft.upperParams[1]} onChange={(v) => setUpperParam(1, v)} />
          <ParamSlot label="時間槽3" value={draft.upperParams[2]} onChange={(v) => setUpperParam(2, v)} />
        </div>
      </section>

      <Divider />

      <section className="mobile-settings-section">
        <div className="mobile-settings-label">下層技術分析</div>
        <Select
          value={draft.lower}
          onChange={setLower}
          options={LOWER_OPTIONS.map((o) => ({ value: o.value, label: t(o.labelKey) }))}
          style={{ width: '100%' }}
        />
        <div className="mobile-settings-params">
          <ParamSlot label="快" value={draft.lowerParams[0]} onChange={(v) => setLowerParam(0, v)} />
          <ParamSlot label="慢" value={draft.lowerParams[1]} onChange={(v) => setLowerParam(1, v)} />
          <ParamSlot label="訊號" value={draft.lowerParams[2]} onChange={(v) => setLowerParam(2, v)} />
        </div>
      </section>

      <div className="mobile-settings-footer">
        <Button block size="large" onClick={reset}>
          重設
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
          套用
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
  return (
    <div className="mobile-param-slot">
      <div className="mobile-param-label">{label}</div>
      <InputNumber value={value} onChange={(v) => onChange(Number(v ?? 0))} min={1} max={999} />
    </div>
  );
}