// 移动端主布局: 整合 TopBar / Tabs / 工具栏下拉 / 图表 / 设置面板 / 底部交易按钮
// PC / 移动端共用同一个 ChartPanel, 图表渲染区零差异
// 顶部导航与外围 UI 走 antd 组件

import { useState, useMemo, useCallback } from 'react';
import { Button, Tooltip } from 'antd';
import {
  FullscreenOutlined,
  SettingOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import { useI18n } from '../i18n';
import type { Instrument } from '../types';
import { INTERVAL, UPPER_TECH, LOWER_TECH } from '../types';
import ChartPanel from '../components/ChartPanel';
import { MobileShell } from './MobileShell';
import { MobileTopBar } from './MobileTopBar';
import { MobileTabs, type MobileTabKey } from './MobileTabs';
import { MobileDropdownSheet, type DropdownOption } from './MobileDropdownSheet';
import {
  MobileSettingsPanel,
  type MobileSettingsValue,
} from './MobileSettingsPanel';

interface MobileLayoutProps {
  instruments: Instrument[];
  code: string;
  interval: number;
  chartType: number;
  upper: number;
  lower: number[];
  tool: number;
  decimals: number;
  titleText: string;
  onCodeChange: (v: string) => void;
  onIntervalChange: (v: number) => void;
  onChartTypeChange: (v: number) => void;
  onUpperChange: (v: number) => void;
  onLowerChange: (v: number) => void;
  onToolChange: (v: number) => void;
  onZoomOut: () => void;
  onZoomIn: () => void;
  onShiftLeft: () => void;
  onShiftRight: () => void;
  registerExport: (fn: () => void) => void;
}

/** 移动端整体布局入口, 已在外部用 useIsMobile 隔离 */
export default function MobileLayout(props: MobileLayoutProps) {
  const { t } = useI18n();

  // 当前品种
  const currentInstrument = useMemo(
    () => props.instruments.find((i) => i.code === props.code),
    [props.instruments, props.code],
  );

  // Tab 状态
  const [tab, setTab] = useState<MobileTabKey>('details');

  // 各下拉 sheet 状态
  const [codeSheetOpen, setCodeSheetOpen] = useState(false);
  const [intervalSheetOpen, setIntervalSheetOpen] = useState(false);
  const [typeSheetOpen, setTypeSheetOpen] = useState(false);
  const [toolSheetOpen, setToolSheetOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // 设置面板草稿
  const [settingsValue, setSettingsValue] = useState<MobileSettingsValue>({
    upper: props.upper || UPPER_TECH.SMA,
    upperParams: [3, 5, 25],
    lower: props.lower[0] ?? LOWER_TECH.MACD,
    lowerParams: [12, 26, 9],
  });

  // 选项数据
  const codeOptions: DropdownOption<string>[] = useMemo(
    () => props.instruments.map((it) => ({ value: it.code, label: it.name })),
    [props.instruments],
  );

  const intervalOptions: DropdownOption<number>[] = useMemo(
    () => [
      { value: INTERVAL.MIN, label: t('Min1') },
      { value: INTERVAL.FIVE_MIN, label: t('Min5') },
      { value: INTERVAL.TEN_MIN, label: t('Min10') },
      { value: INTERVAL.FIFTEEN_MIN, label: t('Min15') },
      { value: INTERVAL.THIRTY_MIN, label: t('Min30') },
      { value: INTERVAL.HOUR, label: t('Hour1') },
      { value: INTERVAL.TWO_HOUR, label: t('Hour2') },
      { value: INTERVAL.FOUR_HOUR, label: t('Hour4') },
      { value: INTERVAL.DAY, label: t('Daily') },
      { value: INTERVAL.WEEK, label: t('Weekly') },
      { value: INTERVAL.MONTH, label: t('Monthly') },
    ],
    [t],
  );

  const typeOptions: DropdownOption<number>[] = useMemo(
    () => [
      { value: 0, label: t('TypeProsticks') },
      { value: 2, label: t('TypeBar') },
      { value: 3, label: t('TypeBarModal') },
      { value: 4, label: t('TypeCandle') },
      { value: 5, label: t('TypeModalLine') },
      { value: 6, label: t('TypeLine') },
      { value: 7, label: t('TypeArea') },
    ],
    [t],
  );

  // 工具栏 (画线 / 平行线 / 黄金比例 / 文字框 / 清除) 选项
  const toolOptions: DropdownOption<number>[] = useMemo(
    () => [
      { value: 0, label: t('Tools') },
      { value: -1, label: t('DrawLine') },
      { value: 1, label: t('DrawLine') + ' (Trend)' },
      { value: 2, label: t('ParallelLines') },
      { value: 5, label: t('FibRetracement') },
      { value: 6, label: t('FibProjection') },
      { value: 8, label: t('TextBox') },
    ],
    [t],
  );

  // 当前选中项的标签
  const currentCodeLabel = codeOptions.find((o) => o.value === props.code)?.label ?? props.code;
  const currentIntervalLabel =
    intervalOptions.find((o) => o.value === props.interval)?.label ?? '';
  const currentTypeLabel =
    typeOptions.find((o) => o.value === props.chartType)?.label ?? '';

  // 全屏切换
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }, []);

  return (
    <MobileShell>
      <MobileTopBar
        instrument={currentInstrument}
        onBack={() => window.history.back()}
        onFullscreen={toggleFullscreen}
        onSearch={() => setCodeSheetOpen(true)}
      />

      <MobileTabs
        activeKey={tab}
        onChange={setTab}
        detailsContent={
          <>
            {/* 工具栏: 周期 / 类型 / 设置齿轮 */}
            <div className="mobile-toolbar">
              <Button onClick={() => setIntervalSheetOpen(true)}>
                {currentIntervalLabel} <SwapOutlined />
              </Button>
              <Button onClick={() => setTypeSheetOpen(true)}>{currentTypeLabel}</Button>
              <Tooltip title="設置">
                <Button
                  shape="circle"
                  icon={<SettingOutlined />}
                  onClick={() => setSettingsOpen(true)}
                />
              </Tooltip>
            </div>

            {/* 图表区: 与 PC 共用 */}
            <div className="mobile-chart-wrap">
              <ChartPanel
                code={props.code}
                interval={props.interval}
                chartType={props.chartType}
                upper={props.upper}
                lower={props.lower}
                tool={props.tool}
                decimals={props.decimals}
                onZoomOut={props.onZoomOut}
                onZoomIn={props.onZoomIn}
                onShiftLeft={props.onShiftLeft}
                onShiftRight={props.onShiftRight}
                registerExport={props.registerExport}
              />
              <FullscreenOutlined className="mobile-chart-fs-hint" onClick={toggleFullscreen} />
            </div>

            {/* 免责声明 */}
            <div className="mobile-disclaimer">資訊由 Refinitiv 提供 · 重要資訊及免責聲明</div>
          </>
        }
      />

      {/* 各下拉 Sheet */}
      <MobileDropdownSheet
        title="品種"
        open={codeSheetOpen}
        onClose={() => setCodeSheetOpen(false)}
        options={codeOptions}
        selected={props.code}
        onSelect={(v) => props.onCodeChange(v)}
      />
      <MobileDropdownSheet
        title="週期"
        open={intervalSheetOpen}
        onClose={() => setIntervalSheetOpen(false)}
        options={intervalOptions}
        selected={props.interval}
        onSelect={(v) => props.onIntervalChange(v)}
      />
      <MobileDropdownSheet
        title="圖表類型"
        open={typeSheetOpen}
        onClose={() => setTypeSheetOpen(false)}
        options={typeOptions}
        selected={props.chartType}
        onSelect={(v) => props.onChartTypeChange(v)}
      />
      <MobileDropdownSheet
        title="工具"
        open={toolSheetOpen}
        onClose={() => setToolSheetOpen(false)}
        options={toolOptions}
        selected={props.tool}
        onSelect={(v) => props.onToolChange(v)}
      />

      {/* 设置面板 */}
      <MobileSettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        value={settingsValue}
        onApply={(next) => {
          setSettingsValue(next);
          props.onUpperChange(next.upper);
          props.onLowerChange(next.lower);
        }}
      />
    </MobileShell>
  );
}