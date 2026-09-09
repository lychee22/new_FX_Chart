// 图表类型常量 (与 types/index.ts 的 CHART_TYPE 数值对齐)
// 2026-07-31：新增 MAIN_VOLUME = 8，主图叠加成交量直方图 (Candle + Volume)
// 2026-09-08：从 ChartPanel.tsx 抽到 utils/chartTypes.ts
export const TYPE = {
  PROSTICKS: 0,
  BAR: 2,
  BAR_MODAL: 3,
  CANDLE: 4,
  MODAL_LINE: 5,
  LINE: 6,
  AREA: 7,
  MAIN_VOLUME: 8,
} as const;

export type ChartTypeValue = (typeof TYPE)[keyof typeof TYPE];

import type { Bar } from '../types';
import type { Time } from 'lightweight-charts';

/**
 * 把完整实时 Bar 转为当前主图类型需要的 update 数据。
 * 2026-09-08：从 ChartPanel.tsx 抽到 utils/chartTypes.ts（与 toMainSeriesPoint 同源）
 */
export function toMainSeriesPoint(bar: Bar, chartType: number): { time: Time; [k: string]: any } | null {
  if (chartType === TYPE.LINE || chartType === TYPE.MODAL_LINE || chartType === TYPE.AREA) {
    const value = chartType === TYPE.MODAL_LINE ? bar.mp : bar.c;
    return value > 0 ? { time: bar.time as Time, value } : null;
  }
  return { time: bar.time as Time, open: bar.o, high: bar.h, low: bar.l, close: bar.c };
}
