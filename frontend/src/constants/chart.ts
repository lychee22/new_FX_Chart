import { LOWER_TECH, Nation, NationPalette } from '../types';

/** 2026-07-29：副图 ID → i18n 文案 key 的映射 (用于浮层显示副图名称)
 *  2026-09-08：从 ChartPanel.tsx 抽到 constants/chart.ts
 */
export const LOWER_NAME_KEY: Record<number, keyof typeof import('../i18n').STRINGS['en']> = {
  [LOWER_TECH.VOLUME]: 'VOLUME',
  [LOWER_TECH.RSI]: 'RSI',
  [LOWER_TECH.MACD]: 'MACD',
  [LOWER_TECH.STC]: 'STC',
  [LOWER_TECH.MOM]: 'MOM',
  [LOWER_TECH.PCTR]: 'PCTR',
  [LOWER_TECH.OBV]: 'OBV',
  [LOWER_TECH.MC]: 'MC',
  [LOWER_TECH.ROC]: 'ROC',
  [LOWER_TECH.ADX]: 'ADX',
  [LOWER_TECH.MFI]: 'MFI',
  [LOWER_TECH.VOLA]: 'VOLA',
  [LOWER_TECH.VOLP]: 'VOLP',
  [LOWER_TECH.VAO]: 'VAO',
  [LOWER_TECH.CCI]: 'CCI',
  [LOWER_TECH.ATR]: 'ATR',
};

/** 首次加载最小等待时长（毫秒）。0 = 不延迟立即结束 loading 状态
 *  2026-09-08：从 ChartPanel.tsx 抽到 constants/chart.ts
 */
export const INITIAL_LOADING_MIN_MS = 0;

/** 默认目标蜡烛宽度 (像素)，用于 fitTimeScaleDefault 计算可见 bar 数
 *  2026-09-08：从 ChartPanel.tsx 抽到 constants/chart.ts（原闭包常量）
 */
export const TARGET_BAR_SPACING = 8;

/** 移动端最小可见 bar 数
 *  2026-09-08：从 ChartPanel.tsx 抽到 constants/chart.ts（原闭包常量）
 */
export const MOBILE_MIN_VISIBLE_BARS = 20;

/** 桌面端最小可见 bar 数
 *  2026-09-08：从 ChartPanel.tsx 抽到 constants/chart.ts（原闭包常量）
 */
export const PC_MIN_VISIBLE_BARS = 60;

/** 长按激活十字线的等待时长 (ms)
 *  2026-09-08：从 ChartPanel.tsx 抽到 constants/chart.ts（原闭包常量）
 */
export const LONG_PRESS_MS = 600;

/** 副图轻点 / 拖动区分阈值 (像素)
 *  2026-09-08：从 ChartPanel.tsx 抽到 constants/chart.ts（原闭包常量）
 */
export const LOWER_TAP_THRESHOLD = 8;

// 点击副图循环切换的指标顺序 (与 MobileSettingsPanel 的 LOWER_OPTIONS 一致,
// 末尾 NONE = 关闭副图, 循环回到开头)
export const LOWER_CYCLE: number[] = [
  LOWER_TECH.VOLUME, LOWER_TECH.RSI, LOWER_TECH.MACD, LOWER_TECH.STC, LOWER_TECH.MOM,
  LOWER_TECH.PCTR, LOWER_TECH.OBV, LOWER_TECH.MC, LOWER_TECH.ROC, LOWER_TECH.ADX,
  LOWER_TECH.MFI, LOWER_TECH.VOLA, LOWER_TECH.CCI, LOWER_TECH.ATR, LOWER_TECH.NONE,
];

export const NATION_PALETTES: Record<Nation, NationPalette> = {
  1: {
    // 黑白 —— 继承自 aspdata/js/simplechart.js
    // 实体填充: 涨 #000000 / 跌 #FFFFFF; 边框与影线统一黑
    candle: {
      upColor: '#000000',
      downColor: '#FFFFFF',
      borderUpColor: '#000000',
      borderDownColor: '#000000',
      wickUpColor: '#000000',
      wickDownColor: '#000000',
    },
    bar: {
      upColor: '#000000',
      downColor: '#000000',
    },
    overlay: {
      up: '#000000',
      down: '#000000',
    },
    label: 'Monochrome (legacy)',
  },
  2: {
    // 绿涨红跌 —— TradingView / Bloomberg / Yahoo Finance
    candle: {
      upColor: '#26A69A',
      downColor: '#EF5350',
      borderUpColor: '#26A69A',
      borderDownColor: '#EF5350',
      wickUpColor: '#26A69A',
      wickDownColor: '#EF5350',
    },
    bar: {
      upColor: '#26A69A',
      downColor: '#EF5350',
    },
    overlay: {
      up: '#26A69A',
      down: '#EF5350',
    },
    label: 'International (green-up / red-down)',
  },
  3: {
    // 红涨绿跌 —— 同花顺 / 雪球 / 富途 / 大中华圈惯例
    candle: {
      upColor: '#E5322D',
      downColor: '#00A050',
      borderUpColor: '#E5322D',
      borderDownColor: '#00A050',
      wickUpColor: '#E5322D',
      wickDownColor: '#00A050',
    },
    bar: {
      upColor: '#E5322D',
      downColor: '#00A050',
    },
    overlay: {
      up: '#E5322D',
      down: '#00A050',
    },
    label: 'CN/HK/TW (red-up / green-down)',
  },
};

/** 后端未提供时, 前端默认 nation = 1 (黑白) */
export const DEFAULT_NATION: Nation = 1;