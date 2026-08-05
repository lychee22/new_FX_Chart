// 区域 (nation) 配置 —— 按后端返回的 nation 字段切换 K 线涨跌色
// 后端未提供前, 前端 mock 默认 DEFAULT_NATION = 1 (黑白, 继承自 simplechart.js)
// 接入后端时: useEffect 中 fetch /api/config 取 nation 后 setState 即可
//
// nation 取值:
//   1 = 黑白 (默认, 打印友好 / 高级质感)
//   2 = 绿涨红跌 (TradingView / Bloomberg / 西方惯例)
//   3 = 红涨绿跌 (同花顺 / 雪球 / 东方财富 / 大中华圈惯例)

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