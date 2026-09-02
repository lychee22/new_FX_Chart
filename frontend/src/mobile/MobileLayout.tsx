// 移动端主布局: 整合 TopBar / Tabs / 工具栏下拉 / 图表 / 设置面板 / 底部交易按钮
// PC / 移动端共用同一个 ChartPanel, 图表渲染区零差异
// 顶部导航与外围 UI 走 antd 组件

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { Button, Tooltip } from 'antd';
import {
  ClearOutlined,
  EditOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined,
  SettingOutlined,
  SwapOutlined,
  UndoOutlined,
} from '@ant-design/icons';
import { useI18n } from '../i18n';
import { useLandscapeFullscreen } from '../hooks/useLandscapeFullscreen';
import type { Instrument } from '../types';
import { INTERVAL, UPPER_TECH, LOWER_TECH } from '../types';
import type { NationPalette } from '../constants/nation';
import { defaultParamsFor } from '../constants/indicatorParams';
import { TOOL } from '../drawing/tools';
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
import { useMobileDrawingSession } from './useMobileDrawingSession';
import { MobileDrawingDrawer } from './MobileDrawingDrawer';

// 轻点判定: pointer 位移小于该值视为轻点, 否则视为拖动/平移
const TAP_MOVE_THRESHOLD = 8;

// 2026-08-04：点击副图循环切换的指标顺序 (与 MobileSettingsPanel 的 LOWER_OPTIONS 一致,
// 末尾 NONE = 关闭副图, 循环回到开头)
const LOWER_CYCLE: number[] = [
  LOWER_TECH.VOLUME, LOWER_TECH.RSI, LOWER_TECH.MACD, LOWER_TECH.STC, LOWER_TECH.MOM,
  LOWER_TECH.PCTR, LOWER_TECH.OBV, LOWER_TECH.MC, LOWER_TECH.ROC, LOWER_TECH.ADX,
  LOWER_TECH.MFI, LOWER_TECH.VOLA, LOWER_TECH.CCI, LOWER_TECH.ATR, LOWER_TECH.NONE,
];

interface MobileLayoutProps {
  /** 2026-08-04：设备类型 — 触摸屏设备(pointer: coarse)为 true, 透传给 ChartPanel */
  mobile?: boolean;
  instruments: Instrument[];
  code: string;
  interval: number;
  chartType: number;
  upper: number;
  /** 2026-08-04：叠加指标参数 (设置面板接入, 真实传给后端) */
  upperParams: number[];
  lower: number[];
  /** 2026-08-04：副图指标参数 (设置面板接入, 真实传给后端) */
  lowerParams: number[];
  tool: number;
  decimals: number;
  /** 区域配色 (按后端 nation 字段切换) */
  palette: NationPalette;
  titleText: string;
  onCodeChange: (v: string) => void;
  onIntervalChange: (v: number) => void;
  onChartTypeChange: (v: number) => void;
  onUpperChange: (v: number) => void;
  /** 2026-08-04：叠加指标参数变化 (设置面板套用) */
  onUpperParamsChange: (p: number[]) => void;
  onLowerChange: (v: number) => void;
  /** 2026-08-04：副图指标参数变化 (设置面板套用) */
  onLowerParamsChange: (p: number[]) => void;
  onToolChange: (v: number) => void;
  onZoomOut: () => void;
  onZoomIn: () => void;
  onShiftLeft: () => void;
  onShiftRight: () => void;
  /** 2026-07-29：副图上下移动 (桌面端浮层用, 移动端保留接口占位) */
  onReorderLower: (tech: number, dir: -1 | 1) => void;
  /** 2026-07-29：删除指定副图 */
  onRemoveLower: (tech: number) => void;
  registerExport: (fn: () => void) => void;
  /** 2026-08-05：手动刷新入口 (顶栏刷新按钮) */
  onRefresh: () => void;
  /** 2026-08-06：刷新进行中 — 顶栏刷新图标旋转转圈 (不影响界面展示) */
  refreshing: boolean;
  /** 2026-08-06：ChartPanel 刷新状态上报 — 转发给内部 ChartPanel, 由 App 驱动按钮转圈 */
  onRefreshingChange?: (refreshing: boolean) => void;
  /** 2026-08-05：注册 ChartPanel 的 refreshAllData (刷新按钮与 WS 重连重拉共用) */
  registerRefresh: (fn: () => void) => void;
  /** 2026-07-30：撤销最后一个绘图 */
  onUndo: () => void;
  /** 2026-07-30：是否有可撤销对象 */
  canUndo: boolean;
  /** 2026-07-30：通知父组件 canUndo 变化 */
  registerCanUndo: (can: boolean) => void;
  /** 2026-07-31：清除所有已绘制对象 */
  onClearAll: () => void;
  /** 2026-07-31：是否有可清除对象 */
  canClear: boolean;
  /** 2026-07-31：通知父组件 canClear 变化 */
  registerCanClear: (can: boolean) => void;
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
      // 2026-07-31：主图叠加成交量直方图
      { value: 8, label: t('TypeMainVolume') },
    ],
    [t],
  );

  // 2026-09-01：移除 toolOptions (竖屏工具栏不再提供画线下拉入口, 移动端画线仅横屏抽屉)

  // 当前选中项的标签
  const currentCodeLabel = codeOptions.find((o) => o.value === props.code)?.label ?? props.code;
  const currentIntervalLabel =
    intervalOptions.find((o) => o.value === props.interval)?.label ?? '';
  const currentTypeLabel =
    typeOptions.find((o) => o.value === props.chartType)?.label ?? '';
  // 2026-09-01：currentToolLabel 不再需要 (工具栏按钮已被抽屉替代)

  // 图表区横屏观看 — 逻辑封装在 useLandscapeFullscreen (iOS Safari / Quark / WebView 兼容),
  // 经重命名别名保持下方引用不变。
  const {
    wrapRef: chartWrapRef,
    isFullscreen: isChartFullscreen,
    enterLandscape,
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

  // 图表区域轻点 → 进入横屏观看 (pointer 位移阈值区分轻点/拖动, 避免平移图表误触发)
  const tapStartRef = useRef<{ x: number; y: number; pointerId: number } | null>(null);

  const onChartWrapPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const target = e.target as HTMLElement;
    // 忽略落在交互子元素 / 浮层 / 退出按钮上的按下
    const hit = target.closest(
      '.info-overlay, .tools-hint, .pane-title-overlay, .pane-skeleton-overlay, ' +
      '.lw-textbox, .lw-textbox__content, .mobile-landscape-exit, button, a, input, [role="option"], ' +
      '.ant-drawer-mask',  // 2026-08-04：点击 Drawer 遮罩关闭时误触轻点进入全屏
    );
    if (hit) return;
    tapStartRef.current = { x: e.clientX, y: e.clientY, pointerId: e.pointerId };
  };

  const onChartWrapPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const start = tapStartRef.current;
    tapStartRef.current = null;
    if (!start || start.pointerId !== e.pointerId) return;

    // 位移超阈值 → 是拖动/平移 (图表左右滑动查看历史 K 线)
    if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > TAP_MOVE_THRESHOLD) return;

    // 松开时目标也做一次过滤 (手指可能滑到子元素上)
    const target = e.target as HTMLElement;
    const upHit = target.closest('.mobile-landscape-exit, button, a, .info-overlay, .tools-hint, .lw-textbox');
    if (upHit) return;

    // 2026-09-01：全屏状态下单击屏幕不再退出全屏 (避免触屏画线时误触退出) —
    // 退出全屏仅靠右上角退出按钮。点空白处也只是 no-op。
    if (isChartFullscreen) return;

    // 守卫: 绘图工具激活 / 有 sheet 打开时均不进入
    if (props.tool !== TOOL.NONE) return;
    if (codeSheetOpen || intervalSheetOpen || typeSheetOpen || settingsOpen) return;

    void enterLandscape();
  };

  const onChartWrapPointerCancel = () => { tapStartRef.current = null; };

  return (
    <MobileShell
      className={isChartFullscreen ? 'is-chart-fullscreen' : ''}
    >
      {!isChartFullscreen && (
        <MobileTopBar
          instrument={currentInstrument}
          onBack={() => window.history.back()}
          onFullscreen={toggleFullscreen}
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
                  <Button
                    shape="circle"
                    icon={<UndoOutlined />}
                    disabled={!props.canUndo}
                    onClick={props.onUndo}
                    aria-label={t('Undo')}
                  />
                  <Button
                    shape="circle"
                    icon={<ClearOutlined />}
                    disabled={!props.canClear}
                    onClick={props.onClearAll}
                    aria-label={t('ClearAll')}
                  />
                  <Button
                    shape="circle"
                    icon={<SettingOutlined />}
                    onClick={() => setSettingsOpen(true)}
                  />
                </div>
              </div>
            )}

            {/* 图表区: 与 PC 共用, 全屏时被系统 requestFullscreen 接管;
                轻点图表空白处进入横屏观看 (pointer 位移阈值 + 工具/浮层守卫) */}
            <div
              className="mobile-chart-wrap"
              ref={chartWrapRef}
              onPointerDown={onChartWrapPointerDown}
              onPointerUp={onChartWrapPointerUp}
              onPointerCancel={onChartWrapPointerCancel}
            >
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
                onZoomOut={props.onZoomOut}
                onZoomIn={props.onZoomIn}
                onShiftLeft={props.onShiftLeft}
                onShiftRight={props.onShiftRight}
                onReorderLower={props.onReorderLower}
                onRemoveLower={props.onRemoveLower}
                registerExport={props.registerExport}
                registerRefresh={props.registerRefresh}
                onRefreshingChange={props.onRefreshingChange}
                onUndo={props.onUndo}
                canUndo={props.canUndo}
                registerCanUndo={props.registerCanUndo}
                onToolChange={props.onToolChange}
                onClearAll={props.onClearAll}
                registerCanClear={props.registerCanClear}
                fullscreen={isChartFullscreen}
                onCycleLower={cycleLower}
                // 2026-09-01：移动端画线交互 — 抽屉开关 + 全局显隐
                mobileDrawMode={drawSession.drawerOpen}
                drawingsVisible={drawSession.drawingsVisible}
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
                      <Button
                        shape="circle"
                        icon={<UndoOutlined />}
                        disabled={!props.canUndo}
                        onClick={props.onUndo}
                        aria-label={t('Undo')}
                      />
                      <Button
                        shape="circle"
                        icon={<ClearOutlined />}
                        disabled={!props.canClear}
                        onClick={props.onClearAll}
                        aria-label={t('ClearAll')}
                      />
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
                  onToolChange={drawSession.setTool}
                  onDeleteAll={props.onClearAll}
                  onToggleVisible={drawSession.toggleVisible}
                  onFinish={drawSession.finishDrawing}
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
