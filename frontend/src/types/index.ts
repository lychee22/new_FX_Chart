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
