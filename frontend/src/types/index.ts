// 后端返回的数据模型类型定义, 与 Java model 一一对应

/** K 线数据 (含 Prosticks 模态字段) */
export interface Bar {
  dt: number;
  localtime: string;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
  vap: number; // 成交密集点上沿
  vam: number; // 成交密集点下沿
  mp: number;  // 模态点 Modal Point
  mc: number;  // 模态量 Modal Count
  ut: number;  // 上活跃区阈值
  lt: number;  // 下活跃区阈值
  mclose: number;
  popen: number;
  pclose: number;
  impmp: boolean;
  time: number; // Unix 秒
}

/** 交易品种 */
export interface Instrument {
  code: string;
  name: string;
  refPrice: number;
  annualVol: number;
  decimals: number;
}

/** 支撑/阻力数据 */
export interface SupportResist {
  supportMP: number;
  resistMP: number;
  latestMP: number;
  averageMC: number;
  latestMC: number;
}

/** 指标数据点 */
export interface IndicatorPoint {
  time: number;
  value: number | null;
}

/** 指标输出序列 */
export interface IndicatorSeries {
  name: string;
  color: string;
  data: IndicatorPoint[];
}

/** 参考水平线 */
export interface LevelLine {
  label: string;
  value: number;
  color: string;
}

/** 指标计算结果 */
export interface IndicatorResult {
  id: string;
  name: string;
  pane: 'overlay' | 'pane' | 'none';
  series: IndicatorSeries[];
  levels?: LevelLine[];
}

/** 2026-07-21 22:44:03：WebSocket 指标消息按“指标类型 + 最后有效点”增量传输。 */
export interface RealtimeIndicatorUpdate {
  type: number;
  result: IndicatorResult;
}

export interface RealtimeBarMessage {
  type: 'BAR';
  code: string;
  interval: number;
  bar: Bar;
}

export interface RealtimeIndicatorsMessage {
  type: 'INDICATORS';
  code: string;
  interval: number;
  upper: RealtimeIndicatorUpdate | null;
  lower: RealtimeIndicatorUpdate[];
}

export type Nation = 1 | 2 | 3;

export interface NationPalette {
  /** 蜡烛图 (CandlestickSeries) 6 个颜色 */
  candle: {
    upColor: string;
    downColor: string;
    borderUpColor: string;
    borderDownColor: string;
    wickUpColor: string;
    wickDownColor: string;
  };
  /** 柱状图 (BarSeries) 涨跌色 */
  bar: {
    upColor: string;
    downColor: string;
  };
  /** MACD 柱状 + 信息浮层文字颜色 */
  overlay: {
    up: string;
    down: string;
  };
  /** 控制台 / 调试用 */
  label: string;
}

// 2026-08-05：PC 配置快照 — 从 PC 切到移动端时暂存, 切回 PC 时恢复
// (PC 用户的图表配置不因临时切换移动端而丢失)
export interface PcSnapshot {
  chartType: number;
  upper: number;
  upperParams: number[];
  lower: number[];
  lowerParams: number[];
  tool: number;
}

export interface ChartPanelProps {
  code: string;
  interval: number;
  chartType: number;
  upper: number;
  /** 2026-08-04：叠加指标参数 (移动端设置面板接入, 真实传给后端) */
  upperParams?: number[];
  lower: number[];          // 多选副图指标 (支持多个叠加)
  /** 2026-08-04：副图指标参数 (移动端设置面板接入, 真实传给后端) */
  lowerParams?: number[];
  tool: number;
  decimals: number;
  /** 区域配色 (按后端 nation 字段切换, 见 src/constants/nation.ts) */
  palette: NationPalette;
  /** 2026-07-29：副图上下移动 (dir = -1 上移 / +1 下移)，仅重排不重建 series */
  onReorderLower: (tech: number, dir: -1 | 1) => void;
  /** 2026-07-29：删除指定副图 */
  onRemoveLower: (tech: number) => void;
  registerExport: (fn: () => void) => void;
  /** 2026-08-05：注册"手动刷新/断线重连重拉"入口 — 工具栏刷新按钮与 WS 重连回调共用 */
  registerRefresh?: (fn: () => void) => void;
  /** 2026-09-10：注册缩放/平移命令入口（原 window.__chartZoom 全局变量迁移为注册模式,
   *  与 registerExport/registerRefresh 同风格）。App 侧存 ref, 工具栏缩放按钮调用。 */
  registerZoom?: (api: {
    zoomOut: () => void; zoomIn: () => void;
    shiftLeft: () => void; shiftRight: () => void;
  }) => void;
  /** 2026-07-31：文字框创建后/右键退出时重置绘图工具 */
  onToolChange: (tool: number) => void;
  // 2026-09-07：每类工具对象数量变化时上报 (key=TOOL.*, value=count),
  // 移动端工具按钮需要据此判断点击时是否已达上限。
  registerDrawingCounts?: (counts: Record<number, number>) => void;
  // 2026-09-10：以下 prop 已迁移走 window.CustomEvent / 命令总线 / registerZoom，ChartPanel 不再需要：
  //   onZoomOut / onZoomIn / onShiftLeft / onShiftRight — 由 App 通过 registerZoom 注册的 api 触发
  //   onUndo / canUndo / registerCanUndo — 由 useChartCommandBus 监听 'chart:undo' CustomEvent
  //   onClearAll / registerCanClear — 由 useChartCommandBus 监听 'chart:clear-all' CustomEvent
  // 见 hooks/useChartCommandBus.ts。
  /** 2026-08-03：移动端横屏全屏状态 — 全屏时即使宽度>768px 也按手机布局处理 (主图 2x 拉伸 + 触摸平移门控) */
  fullscreen?: boolean;
  /** 2026-08-04：设备类型 — 触摸屏设备(pointer: coarse)为 true, 按手机布局处理 (pane 拉伸/手势门控/轴密度) */
  mobile?: boolean;
  /** 2026-08-04：移动端点击副图 pane → 循环切换副图指标 (由 MobileLayout 提供实现) */
  onCycleLower?: () => void;
  /** 2026-08-06：刷新进行状态上报 (手动刷新/WS 重连重拉期间 true) — 驱动工具栏/顶栏刷新按钮转圈 */
  onRefreshingChange?: (refreshing: boolean) => void;
  /** 2026-09-01：移动端横屏画线模式 (抽屉是否打开)。true 时启用 tap 定点/选中交互 */
  mobileDrawMode?: boolean;
  /** 2026-09-01：已画线条全局显隐 (来自抽屉的"隐藏/显示画线"开关) */
  drawingsVisible?: boolean;
}

export interface MobileLayoutProps {
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
  // 2026-09-10：移除死 props onZoomOut/onZoomIn/onShiftLeft/onShiftRight — MobileLayout
  // 从未消费（缩放/平移走 registerZoom 注册），onUndo/canUndo — 对应按钮已注释停用。
  // onClearAll/canClear 保留 — MobileDrawingDrawer 的"删除全部"仍在使用。
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
  /** 2026-07-31：清除所有已绘制对象 */
  onClearAll: () => void;
  /** 2026-07-31：是否有可清除对象 */
  canClear: boolean;
  // 2026-09-07：每类工具对象数量变化时由 ChartPanel 上报, 驱动工具按钮提前检查上限。
  registerDrawingCounts?: (counts: Record<number, number>) => void;
}

// ---------------- 图表常量 (与后端 ChartConstants 对齐) ----------------

export const CHART_TYPE = {
  PROSTICKS: 0,
  BAR: 2,
  BAR_MODAL: 3,
  CANDLE: 4,
  MODAL_LINE: 5,
  LINE: 6,
  AREA: 7,
  /** 2026-07-31：主图叠加成交量直方图 (Candle + Volume)，数据来源 Bar.v,纯前端 */
  MAIN_VOLUME: 8,
} as const;

export const INTERVAL = {
  DAY: 0,
  WEEK: 1,
  MONTH: 2,
  MIN: 3,
  FIVE_MIN: 4,
  TEN_MIN: 5,
  FIFTEEN_MIN: 6,
  THIRTY_MIN: 7,
  HOUR: 8,
  TWO_HOUR: 9,
  FOUR_HOUR: 10,
} as const;

// 叠加指标 ID (对齐 ChartConstants.UPPER_*)
export const UPPER_TECH = {
  NONE: 0, SMA: 1, BOLL: 2, EMA: 3, SAR: 4, IKH: 5, WMA: 6, MAE: 7, KC: 8,
} as const;

// 副图指标 ID (对齐 ChartConstants.LOWER_*)
export const LOWER_TECH = {
  NONE: 0, VOLUME: 1, RSI: 2, MACD: 3, STC: 4, MOM: 5, PCTR: 6, OBV: 7,
  MC: 8, ROC: 9, ADX: 10, MFI: 11, VOLA: 12, VOLP: 13, VAO: 14, CCI: 15, ATR: 16,
} as const;
