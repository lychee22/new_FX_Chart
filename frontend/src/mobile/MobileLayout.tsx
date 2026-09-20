// 移动端主布局: 整合 TopBar / Tabs / 工具栏下拉 / 图表 / 设置面板 / 底部交易按钮
// PC / 移动端共用同一个 ChartPanel, 图表渲染区零差异
// 顶部导航与外围 UI 走 antd 组件

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Button } from 'antd';
import {
  ArrowsAltOutlined,
  EditOutlined,
  FullscreenExitOutlined,
  SettingOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import { useI18n } from '../i18n';
import { useLandscapeFullscreen } from '../hooks';
import type { MobileLayoutProps } from '../types';
import { INTERVAL, UPPER_TECH, LOWER_TECH } from '../types';
import { defaultParamsFor } from '../constants/indicatorParams';
import ChartPanel from '../components/ChartPanel';
import { MobileShell } from './MobileShell';
import { MobileTopBar } from './MobileTopBar';
import { MobileTabs, type MobileTabKey } from './MobileTabs';
import { MobileDropdownSheet, type DropdownOption } from './MobileDropdownSheet';
import {
  MobileSettingsPanel,
  type MobileSettingsValue,
  LOWER_OPTIONS,
} from './MobileSettingsPanel';
// 2026-09-01：移动端画线会话状态机 (抽屉/显隐/退出清理) + 抽屉
import { useMobileDrawingSession } from '../hooks';
import { MobileDrawingDrawer } from './MobileDrawingDrawer';
import { LOWER_CYCLE } from '../constants/chart';


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
  // 2026-09-01：移除 toolSheetOpen — 画线功能仅横屏全屏时通过右侧抽屉使用,
  // 竖屏工具栏不再提供画线下拉入口, 也不再有"选择工具"sheet。
  const [settingsOpen, setSettingsOpen] = useState(false);

  // 设置面板当前值 — 由 props 实时派生 (不再用 useState 快照):
  // 副图经点击循环切换 / 副图指标列表等外部入口改变后, 面板打开时下拉框与副图展示保持一致。
  // 2026-08-04：下层无副图时默认显示"關閉" (LOWER_TECH.NONE), 上层无叠加时显示"主圖" (UPPER_TECH.NONE);
  // 参数初始 = App 传入 (未传时按当前指标默认值)
  const settingsValue: MobileSettingsValue = useMemo(
    () => ({
      upper: props.upper || UPPER_TECH.NONE,
      upperParams: props.upperParams?.length
        ? [...props.upperParams]
        : defaultParamsFor('upper', props.upper || UPPER_TECH.NONE),
      lower: props.lower[0] ?? LOWER_TECH.NONE,
      lowerParams: props.lowerParams?.length
        ? [...props.lowerParams]
        : defaultParamsFor('lower', props.lower[0] ?? LOWER_TECH.NONE),
    }),
    [props.upper, props.upperParams, props.lower, props.lowerParams],
  );

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
      { value: 8, label: t('TypeMainVolume') },
    ],
    [t],
  );

  const currentIntervalLabel =
    intervalOptions.find((o) => o.value === props.interval)?.label ?? '';
  const currentTypeLabel =
    typeOptions.find((o) => o.value === props.chartType)?.label ?? '';
  const {
    wrapRef: chartWrapRef,
    isFullscreen: isChartFullscreen,
    exitLandscape,
    toggleFullscreen,
  } = useLandscapeFullscreen();

  // 2026-09-01：移动端画线会话 (抽屉开关 / 全局显隐 / 退出全屏清理)
  // 退出全屏（按钮或物理旋转）由 hook 内部 effect 自动 finishDrawing
  const drawSession = useMobileDrawingSession(
    isChartFullscreen,
    props.tool,
    props.onToolChange,
  );

  // 2026-09-04：画线进行中状态 — useChartDrawInteraction 通过 chart:drawing-in-progress
  // 事件广播 (true=有 pendingPoints 待定锚点, false=已完成/切到 NONE)。
  // 抽屉按钮根据此状态 disabled + 触发 "请先完成绘图" 提示。
  const [drawInProgress, setDrawInProgress] = useState(false);
  // 2026-09-07：每类工具对象数量 — 由 ChartPanel 通过 registerDrawingCounts 上报,
  // 用于移动端工具按钮 onClick 时提前检查上限 (已达 5 个则弹 LimitReached 不进入激活态)。
  const [drawingCounts, setDrawingCounts] = useState<Record<number, number>>({});
  const registerDrawingCounts = useCallback(
    (counts: Record<number, number>) => setDrawingCounts(counts),
    [],
  );
  useEffect(() => {
    const handler = (e: Event) => {
      const v = (e as CustomEvent<boolean>).detail;
      setDrawInProgress(v);
    };
    window.addEventListener('chart:drawing-in-progress', handler);
    return () => window.removeEventListener('chart:drawing-in-progress', handler);
  }, []);

  // 2026-08-05：图表内触屏切换副图入口的专用通道 — 设置 __mobileLowerTap 标志,
  // ChartPanel 据此区分入口: 触屏切换不重置主图缩放/不重绘叠加指标; 设置面板入口不受影响。
  const tapReplaceLower = useCallback((v: number) => {
    (window as any).__mobileLowerTap = Date.now();
    props.onLowerChange(v);
    props.onLowerParamsChange(defaultParamsFor('lower', v));
  }, [props.onLowerChange, props.onLowerParamsChange]);

  // 2026-08-04：点击副图循环切换副图指标 — 当前 lower[0]（无副图视为 NONE）→ 列表下一个 → replaceLower。
  // 移动端最多一个副图, 直接走 props.onLowerChange（App 的 replaceLower 替换语义）。
  // 循环切换视为未自定义参数 — 同步重置为该指标默认参数。
  const cycleLower = useCallback(() => {
    const current = props.lower[0] ?? LOWER_TECH.NONE;
    const idx = LOWER_CYCLE.indexOf(current);
    const next = LOWER_CYCLE[(idx + 1) % LOWER_CYCLE.length];
    tapReplaceLower(next);
  }, [props.lower, tapReplaceLower]);

  // 2026-08-04：点击副图描述条（指标名称条）→ 打开副图指标选择列表
  const [lowerSheetOpen, setLowerSheetOpen] = useState(false);
  useEffect(() => {
    const open = () => setLowerSheetOpen(true);
    window.addEventListener('chart:open-lower-select', open);
    return () => window.removeEventListener('chart:open-lower-select', open);
  }, []);
  // 选择列表选项 — 与设置面板 LOWER_OPTIONS 同一数据源 (含"關閉")
  const lowerSelectOptions: DropdownOption<number>[] = useMemo(
    () => LOWER_OPTIONS.map((o) => ({ value: o.value, label: o.label ?? t(o.labelKey as any) })),
    [t],
  );

  return (
    <MobileShell
      className={isChartFullscreen ? 'is-chart-fullscreen' : ''}
    >
      {!isChartFullscreen && (
        <MobileTopBar
          instrument={currentInstrument}
          onBack={() => window.history.back()}
          onSearch={() => setCodeSheetOpen(true)}
          onTitleClick={() => setCodeSheetOpen(true)}
          onRefresh={props.onRefresh}
          refreshing={props.refreshing}
        />
      )}

      <MobileTabs
        activeKey={tab}
        onChange={setTab}
        detailsContent={
          <>
            {/* 工具栏: 周期 / 类型 / 设置(仅非全屏时显示) — 2026-09-01 移除画线按钮, 画线仅横屏抽屉可用 */}
            {!isChartFullscreen && (
              <div className="mobile-toolbar">
                <Button onClick={() => setIntervalSheetOpen(true)}>
                  {currentIntervalLabel} <SwapOutlined />
                </Button>
                <Button onClick={() => setTypeSheetOpen(true)}>{currentTypeLabel}</Button>
                
                {/* 2026-08-27：三个圆形操作按钮归于同一组, 空间不足时整组换到下一行,
                    避免窄屏下单独圆按钮把工具栏撑出容器。 */}
                <div className="mobile-toolbar-actions">
                  <Button shape='circle' icon={<ArrowsAltOutlined />} onClick={() => toggleFullscreen()}/>
                  {/* 2026-09-10：撤销/清除圆形按钮 2026-09-01 起已注释停用, 随死 props (onUndo/canUndo)
                      一并清理; 如需恢复见 git 历史 (props 走 chart:undo / chart:clear-all 事件)。 */}
                  <Button
                    shape="circle"
                    icon={<SettingOutlined />}
                    onClick={() => setSettingsOpen(true)}
                  />
                </div>
              </div>
            )}

            {/* 图表区: 与 PC 共用, 全屏时被系统 requestFullscreen 接管。
                2026-09-04：轻点图表不再进入全屏, 进入全屏仅限工具栏全屏按钮。 */}
            <div className="mobile-chart-wrap" ref={chartWrapRef}>
              <ChartPanel
                code={props.code}
                interval={props.interval}
                chartType={props.chartType}
                upper={props.upper}
                upperParams={props.upperParams}
                lower={props.lower}
                lowerParams={props.lowerParams}
                tool={props.tool}
                decimals={props.decimals}
                palette={props.palette}
                mobile={props.mobile}
                onReorderLower={props.onReorderLower}
                onRemoveLower={props.onRemoveLower}
                registerExport={props.registerExport}
                registerRefresh={props.registerRefresh}
                onRefreshingChange={props.onRefreshingChange}
                onToolChange={props.onToolChange}
                fullscreen={isChartFullscreen}
                onCycleLower={cycleLower}
                // 2026-09-01：移动端画线交互 — 抽屉开关 + 全局显隐
                mobileDrawMode={drawSession.drawerOpen}
                drawingsVisible={drawSession.drawingsVisible}
                // 2026-09-07：每类工具对象数量变化上报 — 驱动工具按钮提前检查上限
                registerDrawingCounts={registerDrawingCounts}
              />
              {/* 2026-08-04：全屏悬浮工具栏 — 渲染在 chartWrap 内 (fullscreen 元素中),
                  包含:  周期 / 主图类型 */}
              {isChartFullscreen && (
                <div className="mobile-landscape-tools">
                  {/* 2026-09-01：画线按钮 — 打开/关闭右侧抽屉。
                      抽屉打开时本工具栏只显示这一项，避免与抽屉中的工具冲突。 */}
                  <Button
                    className={drawSession.drawerOpen ? 'mobile-tool-active' : ''}
                    icon={<EditOutlined />}
                    onClick={drawSession.toggleDrawer}
                    aria-label={t('DrawTools')}
                  >
                    {t('DrawTools')}
                  </Button>
                  {!drawSession.drawerOpen && (
                    <>
                      <Button onClick={() => setIntervalSheetOpen(true)}>
                        {currentIntervalLabel} <SwapOutlined />
                      </Button>
                      <Button onClick={() => setTypeSheetOpen(true)}>{currentTypeLabel}</Button>
                    </>
                  )}
                </div>
              )}
              {/* 2026-09-01：画线抽屉 — 覆盖图表约 30% 宽。纯展示组件, 全部事件由 props 回调上抛。
                  getContainer 指向 chartWrap, 全屏时与 chart 同层渲染可见。 */}
              {isChartFullscreen && (
                <MobileDrawingDrawer
                  open={drawSession.drawerOpen}
                  tool={props.tool}
                  canDeleteAll={props.canClear}
                  drawingsVisible={drawSession.drawingsVisible}
                  // 2026-09-04：画线进行中 → 抽屉按钮全部锁定, 点击弹 "请先完成绘图"
                  inProgress={drawInProgress}
                  // 2026-09-07：每类工具对象数量 — 用于点击工具按钮时提前检查上限
                  drawingCounts={drawingCounts}
                  onToolChange={drawSession.setTool}
                  onDeleteAll={props.onClearAll}
                  onToggleVisible={drawSession.toggleVisible}
                  onFinish={drawSession.finishDrawing}
                  // 2026-09-07：仅取消当前未完成的画线，保留画线工具
                  onCancelPending={drawSession.cancelPendingDrawing}
                />
              )}
              {/* 横屏观看退出按钮: 置于 fullscreen 元素内, TopBar 全屏时已隐藏 */}
              {isChartFullscreen && (
                <button
                  type="button"
                  className="mobile-landscape-exit"
                  aria-label={t('ExitFullscreen')}
                  title={t('ExitFullscreen')}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    void exitLandscape();
                  }}
                >
                  <FullscreenExitOutlined />
                </button>
              )}
              {/* 2026-08-05：横屏全屏状态提示 — 全屏期间常驻显示, 让用户明确当前是横屏模式
                  以及如何退出 (点击图表 / 点击此提示 / 点击退出按钮)。
                  即使 CSS 旋转兜底失败, 这条文字提示也是用户反馈的兜底。 */}
              {isChartFullscreen && (
                <div className="mobile-rotate-hint" role="status" aria-live="polite">
                  {t('RotateDeviceHint')}
                </div>
              )}
            </div>

            {/* 免责声明 (仅非全屏时显示) */}
            {!isChartFullscreen && (
              <div className="mobile-disclaimer"></div>
            )}
          </>
        }
      />

      {/* 各下拉 Sheet — 2026-08-04：getContainer 指向 chartWrap, 全屏时 Drawer 渲染在全屏元素内可见 */}
      <MobileDropdownSheet
        title="品種"
        open={codeSheetOpen}
        onClose={() => setCodeSheetOpen(false)}
        options={codeOptions}
        selected={props.code}
        onSelect={(v) => props.onCodeChange(v)}
        getContainer={() => chartWrapRef.current ?? document.body}
      />
      <MobileDropdownSheet
        title="週期"
        open={intervalSheetOpen}
        onClose={() => setIntervalSheetOpen(false)}
        options={intervalOptions}
        selected={props.interval}
        onSelect={(v) => props.onIntervalChange(v)}
        getContainer={() => chartWrapRef.current ?? document.body}
      />
      <MobileDropdownSheet
        title="圖表類型"
        open={typeSheetOpen}
        onClose={() => setTypeSheetOpen(false)}
        options={typeOptions}
        selected={props.chartType}
        onSelect={(v) => props.onChartTypeChange(v)}
        getContainer={() => chartWrapRef.current ?? document.body}
      />
      {/* 2026-09-01：移除"工具"sheet — 画线工具选择仅在横屏抽屉内进行 */}

      {/* 2026-08-04：副图指标选择列表 — 点击副图描述条(指标名称条)弹出, 点选即切换
          (2026-08-05：触屏入口走 tapReplaceLower, 不影响主图缩放/叠加指标) */}
      <MobileDropdownSheet
        title="副圖指標"
        open={lowerSheetOpen}
        onClose={() => setLowerSheetOpen(false)}
        options={lowerSelectOptions}
        selected={props.lower[0] ?? LOWER_TECH.NONE}
        onSelect={tapReplaceLower}
        getContainer={() => chartWrapRef.current ?? document.body}
      />

      {/* 设置面板 */}
      <MobileSettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        value={settingsValue}
        getContainer={() => chartWrapRef.current ?? document.body}
        onApply={(next) => {
          props.onUpperChange(next.upper);
          props.onUpperParamsChange(next.upperParams);
          props.onLowerChange(next.lower);
          props.onLowerParamsChange(next.lowerParams);
        }}
      />
    </MobileShell>
  );
}
