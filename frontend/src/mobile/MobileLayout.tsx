// 移动端主布局: 整合 TopBar / Tabs / 工具栏下拉 / 图表 / 设置面板 / 底部交易按钮
// PC / 移动端共用同一个 ChartPanel, 图表渲染区零差异
// 顶部导航与外围 UI 走 antd 组件

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { Button, Tooltip } from 'antd';
import {
  FullscreenExitOutlined,
  FullscreenOutlined,
  SettingOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import { useI18n } from '../i18n';
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

// 全屏 / 横屏辅助: 兼容 webkit 前缀 (旧版 iOS/Android), 所有操作 best-effort + 静默降级
// iframe 内 screen.orientation.lock 会失败 → 优雅退化为竖屏全屏; iOS Safari 无 lock API → 可选链 no-op
type FsDoc = Document & {
  webkitExitFullscreen?: () => Promise<void>;
  webkitFullscreenElement?: Element | null;
};

const isFullscreenElement = (): boolean => {
  const d = document as FsDoc;
  return !!(document.fullscreenElement || d.webkitFullscreenElement);
};

const requestElementFullscreen = (el: HTMLElement): Promise<void> => {
  type FsEl = HTMLElement & {
    requestFullscreen?: () => Promise<void>;
    webkitRequestFullscreen?: () => Promise<void>;
  };
  const e = el as FsEl;
  const fn = e.requestFullscreen ?? e.webkitRequestFullscreen;
  if (fn) return Promise.resolve(fn.call(e));
  const docEl = document.documentElement as FsEl;
  const fn2 = docEl.requestFullscreen ?? docEl.webkitRequestFullscreen;
  if (fn2) return Promise.resolve(fn2.call(docEl));
  return Promise.resolve(); // 无全屏支持 → lock 尝试单独失败也无害
};

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
  const [toolSheetOpen, setToolSheetOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // 设置面板草稿
  // 2026-08-04：下层无副图时默认显示"關閉" (LOWER_TECH.NONE), 上层无叠加时显示"主圖" (UPPER_TECH.NONE);
  // 参数初始 = App 传入 (未传时按当前指标默认值)
  const [settingsValue, setSettingsValue] = useState<MobileSettingsValue>({
    upper: props.upper || UPPER_TECH.NONE,
    upperParams: props.upperParams?.length
      ? [...props.upperParams]
      : defaultParamsFor('upper', props.upper || UPPER_TECH.NONE),
    lower: props.lower[0] ?? LOWER_TECH.NONE,
    lowerParams: props.lowerParams?.length
      ? [...props.lowerParams]
      : defaultParamsFor('lower', props.lower[0] ?? LOWER_TECH.NONE),
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
      // 2026-07-31：主图叠加成交量直方图
      { value: 8, label: t('TypeMainVolume') },
    ],
    [t],
  );

  // 工具栏 (画线 / 平行线 / 黄金比例 / 文字框 / 清除) 选项
  // 2026-08-03：移除 value:-1 (DrawLine) 坏项 — TOOL.DRAWLINE 无实现, 选中无反应。
  // 保留真工具: 平行线 / 趋势线 / 平行通道 / 斐波那契 / 文本框。
  const toolOptions: DropdownOption<number>[] = useMemo(
    () => [
      { value: 0, label: t('Tools') },
      { value: 1, label: t('DrawLine') + ' (Trend)' },
      { value: 2, label: t('ParallelLines') },
      // { value: 11, label: t('ParallelChannel') },
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

  // 图表区横屏观看: 仅对 .mobile-chart-wrap 调用 requestFullscreen,
  // TopBar / Tabs / 工具栏 / 免责声明会通过 isChartFullscreen 状态隐藏。
  // fullscreenchange 是 isChartFullscreen 的唯一事实来源: 覆盖所有退出路径
  // (系统手势下滑 / Esc / iOS 浏览器 UI / 宿主程序退出)。
  const chartWrapRef = useRef<HTMLDivElement>(null);
  const [isChartFullscreen, setIsChartFullscreen] = useState(() => isFullscreenElement());

  useEffect(() => {
    const onChange = () => setIsChartFullscreen(isFullscreenElement());
    document.addEventListener('fullscreenchange', onChange);
    document.addEventListener('webkitfullscreenchange', onChange);
    return () => {
      document.removeEventListener('fullscreenchange', onChange);
      document.removeEventListener('webkitfullscreenchange', onChange);
    };
  }, []);

  // 2026-08-03：组件卸载时主动退出全屏 (导航离开 mid-fullscreen 时防残留)
  useEffect(() => {
    return () => {
      if (isFullscreenElement()) {
        const d = document as FsDoc;
        const fn = d.exitFullscreen ?? d.webkitExitFullscreen;
        void fn?.call(d);
      }
    };
  }, []);

  // 串行化进入流程, 防止 requestFullscreen 在途时重复进入
  const landscapeBusyRef = useRef(false);

  // 2026-08-05：CSS 旋转兜底状态 — 进入横屏时**无脑**启用, 给 .mobile-shell 加 .force-landscape,
  // 让 .mobile-chart-wrap 通过 transform 旋转 90° 在竖屏设备上铺出横屏区域。
  // 状态而非 ref: 触发 CSS className 重渲染, 类比 isChartFullscreen。
  const [forceLandscape, setForceLandscape] = useState(false);

  // 2026-08-05：进入横屏 — 不再等待 lock 结果, 直接启用 CSS 旋转兜底。
  // 真机调研 (vivo 原生 / 夸克 / 部分 WebView) 发现: lock 调用不抛错也不旋转,
  // 且 screen.orientation.type 不会更新, 200ms 探测无法判别成功, 兜底永远进不去。
  // 行业标准: lock 优先 + CSS rotate 兜底必须同时做。本实现把 CSS 旋转当作常态, lock 当作锦上添花。
  const enterLandscape = useCallback(async () => {
    if (landscapeBusyRef.current) return;
    const el = chartWrapRef.current;
    if (!el) return;
    landscapeBusyRef.current = true;
    console.log('[landscape-debug] enterLandscape called', {
      isFs: isFullscreenElement(),
      oriType: (screen as { orientation?: { type?: string } }).orientation?.type,
    });
    try {
      // 1) requestFullscreen — best effort, 失败也走 CSS 旋转
      if (!isFullscreenElement()) {
        try {
          await requestElementFullscreen(el);
          console.log('[landscape-debug] requestFullscreen resolved');
        } catch (e) {
          console.log('[landscape-debug] requestFullscreen rejected', e);
        }
      }
      // 2) orientation.lock — fire-and-forget, 静默失败
      try {
        const ori = (screen as { orientation?: { lock?: (o: string) => Promise<void>; type?: string } }).orientation;
        const p = ori?.lock?.('landscape');
        if (p && typeof (p as Promise<void>).then === 'function') {
          (p as Promise<void>).then(
            () => console.log('[landscape-debug] orientation.lock resolved, type=', ori?.type),
            (e: unknown) => console.log('[landscape-debug] orientation.lock rejected', e),
          );
        } else {
          console.log('[landscape-debug] orientation.lock API not available');
        }
      } catch (e) {
        console.log('[landscape-debug] orientation.lock threw', e);
      }
      // 3) 立即启用 CSS 旋转兜底 — 不等待 lock, 视觉横屏必须可见
      setForceLandscape(true);
      console.log('[landscape-debug] forceLandscape = true (CSS rotation enabled)');
    } finally {
      landscapeBusyRef.current = false;
    }
  }, []);

  const exitLandscape = useCallback(async () => {
    if (!isFullscreenElement()) return;
    try {
      const d = document as FsDoc;
      const fn = d.exitFullscreen ?? d.webkitExitFullscreen;
      await fn?.call(d);
    } catch { /* ignore */ }
    // 规范: 退出全屏时 lock 自动释放; 防御性调用 unlock (未锁定时为 no-op)
    try { (screen as { orientation?: { unlock?: () => void } }).orientation?.unlock?.(); } catch { /* ignore */ }
    // 退出全屏时同时清除 CSS 旋转兜底
    setForceLandscape(false);
    console.log('[landscape-debug] exitLandscape -> forceLandscape = false');
  }, []);

  // 顶部栏全屏按钮仍走此处
  const toggleFullscreen = useCallback(() => {
    if (isFullscreenElement()) void exitLandscape();
    else void enterLandscape();
  }, [enterLandscape, exitLandscape]);

  // 2026-08-03：物理旋转自动进入/退出横屏 — 手动旋转为横屏时自动 requestFullscreen,
  // 转回竖屏自动退出。跨源 iframe / iOS 无 orientation API 时不派发事件 → 静默降级为仅按钮+轻点入口。
  // 2026-08-05：若用户后续手动旋转到横屏使 native 成功, 关闭 CSS 旋转兜底, 避免双重旋转错位。
  useEffect(() => {
    const isLandscapeOrientation = () => {
      const ori = (screen as { orientation?: { type?: string } }).orientation?.type;
      if (!ori) return false;
      return ori.startsWith('landscape');
    };
    const onOrientationChange = () => {
      // 旋转为横屏且当前非全屏 → 进入; 旋转为竖屏且在全屏 → 退出
      if (isLandscapeOrientation()) {
        // 物理上已是横屏 → native lock 实际生效, 关闭 CSS 兜底避免视觉双重旋转
        setForceLandscape(false);
        console.log('[landscape-debug] physical landscape detected, forceLandscape = false');
        if (!isFullscreenElement()) void enterLandscape();
      } else {
        if (isFullscreenElement()) void exitLandscape();
      }
    };
    const ori = (screen as { orientation?: ScreenOrientation }).orientation;
    if (ori && typeof ori.addEventListener === 'function') {
      ori.addEventListener('change', onOrientationChange);
      window.addEventListener('orientationchange', onOrientationChange);
    }
    return () => {
      if (ori && typeof ori.removeEventListener === 'function') {
        ori.removeEventListener('change', onOrientationChange);
      }
      window.removeEventListener('orientationchange', onOrientationChange);
    };
  }, [enterLandscape, exitLandscape]);

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
    if (!start || start.pointerId !== e.pointerId) return;
    tapStartRef.current = null;

    // 位移超阈值 → 是拖动/平移 (图表左右滑动查看历史 K 线)
    if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > TAP_MOVE_THRESHOLD) return;

    // 松开时目标也做一次过滤 (手指可能滑到子元素上)
    const target = e.target as HTMLElement;
    const upHit = target.closest('.mobile-landscape-exit, button, a, .info-overlay, .tools-hint, .lw-textbox');
    if (upHit) return;

    // 2026-08-04：全屏时轻点即退出横屏 (需求: 点击进入全屏后, 再次点击退出)。
    // 位移超阈值(拖动/平移图表)已在上面拦截; 退出后下次轻点又会进入, 交替切换。
    if (isChartFullscreen) {
      void exitLandscape();
      return;
    }

    // 守卫: 绘图工具激活 / 有 sheet 打开时均不进入
    if (props.tool !== TOOL.NONE) return;
    if (codeSheetOpen || intervalSheetOpen || typeSheetOpen || toolSheetOpen || settingsOpen) return;

    void enterLandscape();
  };

  const onChartWrapPointerCancel = () => { tapStartRef.current = null; };

  return (
    <MobileShell
      className={[
        isChartFullscreen ? 'is-chart-fullscreen' : '',
        forceLandscape ? 'force-landscape' : '',
      ].filter(Boolean).join(' ')}
    >
      {!isChartFullscreen && (
        <MobileTopBar
          instrument={currentInstrument}
          onBack={() => window.history.back()}
          onFullscreen={toggleFullscreen}
          onSearch={() => setCodeSheetOpen(true)}
          onTitleClick={() => setCodeSheetOpen(true)}
          onRefresh={props.onRefresh}
        />
      )}

      <MobileTabs
        activeKey={tab}
        onChange={setTab}
        detailsContent={
          <>
            {/* 工具栏: 周期 / 类型 / 设置(仅非全屏时显示) */}
            {!isChartFullscreen && (
              <div className="mobile-toolbar">
                <Button onClick={() => setIntervalSheetOpen(true)}>
                  {currentIntervalLabel} <SwapOutlined />
                </Button>
                <Button onClick={() => setTypeSheetOpen(true)}>{currentTypeLabel}</Button>
                <Button
                  shape="circle"
                  icon={<SettingOutlined />}
                  onClick={() => setSettingsOpen(true)}
                />
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
                onUndo={props.onUndo}
                canUndo={props.canUndo}
                registerCanUndo={props.registerCanUndo}
                onToolChange={props.onToolChange}
                onClearAll={props.onClearAll}
                registerCanClear={props.registerCanClear}
                fullscreen={isChartFullscreen}
                onCycleLower={cycleLower}
              />
              {/* 2026-08-04：全屏悬浮工具栏 — 渲染在 chartWrap 内 (fullscreen 元素中),
                  包含:  周期 / 主图类型 */}
              {isChartFullscreen && (
                <div className="mobile-landscape-tools">
                  <Button onClick={() => setIntervalSheetOpen(true)}>
                    {currentIntervalLabel} <SwapOutlined />
                  </Button>
                  <Button onClick={() => setTypeSheetOpen(true)}>{currentTypeLabel}</Button>
                </div>
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
      <MobileDropdownSheet
        title="工具"
        open={toolSheetOpen}
        onClose={() => setToolSheetOpen(false)}
        options={toolOptions}
        selected={props.tool}
        onSelect={(v) => props.onToolChange(v)}
        getContainer={() => chartWrapRef.current ?? document.body}
      />

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
          setSettingsValue(next);
          props.onUpperChange(next.upper);
          props.onUpperParamsChange(next.upperParams);
          props.onLowerChange(next.lower);
          props.onLowerParamsChange(next.lowerParams);
        }}
      />
    </MobileShell>
  );
}