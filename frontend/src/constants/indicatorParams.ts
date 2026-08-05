// 指标参数配置：与后端 IndicatorEngine 的参数语义对齐 (backend/src/main/java/com/prosticks/chart/indicator/IndicatorEngine.java)
// 2026-08-04：设置面板参数接入 — 让数值真实传给后端计算指标。
//
// 后端约束：
// - GET /api/indicators 的 params 为逗号分隔字符串（如 "12,26,9"），null/非法整体走默认参数
// - 不同指标参数个数不同；BOLL/SAR/IKH/MAE 传 1~2 个、MACD 传 1 个会数组越界 500，
//   前端必须按指标传足个数
// - SMA/EMA/WMA 参数是"整体替换"：传几个就画几条均线

import { UPPER_TECH, LOWER_TECH } from '../types';

/** 每个叠加指标要求的参数个数（0 = 无参数槽） */
export const UPPER_PARAM_COUNT: Record<number, number> = {
  [UPPER_TECH.SMA]: 3,
  [UPPER_TECH.BOLL]: 2,
  [UPPER_TECH.EMA]: 3,
  [UPPER_TECH.SAR]: 3,
  [UPPER_TECH.IKH]: 3,
  [UPPER_TECH.WMA]: 3,
  [UPPER_TECH.MAE]: 2,
  [UPPER_TECH.KC]: 1,
};

/** 每个副图指标要求的参数个数（0 = 无参数槽） */
export const LOWER_PARAM_COUNT: Record<number, number> = {
  [LOWER_TECH.VOLUME]: 0,
  [LOWER_TECH.RSI]: 1,
  [LOWER_TECH.MACD]: 3,
  [LOWER_TECH.STC]: 3,
  [LOWER_TECH.MOM]: 1,
  [LOWER_TECH.PCTR]: 1,
  [LOWER_TECH.OBV]: 0,
  [LOWER_TECH.MC]: 1,
  [LOWER_TECH.ROC]: 1,
  [LOWER_TECH.ADX]: 1,
  [LOWER_TECH.MFI]: 1,
  [LOWER_TECH.VOLA]: 1,
  [LOWER_TECH.VOLP]: 0,
  [LOWER_TECH.VAO]: 1,
  [LOWER_TECH.CCI]: 1,
  [LOWER_TECH.ATR]: 1,
};

/** 每个叠加指标的默认参数（与后端一致） */
export const UPPER_DEFAULT_PARAMS: Record<number, number[]> = {
  [UPPER_TECH.SMA]: [10, 20, 50],
  [UPPER_TECH.BOLL]: [20, 2],
  [UPPER_TECH.EMA]: [10, 20, 50],
  [UPPER_TECH.SAR]: [0.02, 0.02, 0.2],
  [UPPER_TECH.IKH]: [7, 22, 44],
  [UPPER_TECH.WMA]: [10, 20, 50],
  [UPPER_TECH.MAE]: [20, 5],
  [UPPER_TECH.KC]: [10],
};

/** 每个副图指标的默认参数（与后端一致） */
export const LOWER_DEFAULT_PARAMS: Record<number, number[]> = {
  [LOWER_TECH.VOLUME]: [],
  [LOWER_TECH.RSI]: [14],
  [LOWER_TECH.MACD]: [12, 26, 9],
  [LOWER_TECH.STC]: [14, 3, 3],
  [LOWER_TECH.MOM]: [10],
  [LOWER_TECH.PCTR]: [10],
  [LOWER_TECH.OBV]: [],
  [LOWER_TECH.MC]: [300],
  [LOWER_TECH.ROC]: [14],
  [LOWER_TECH.ADX]: [14],
  [LOWER_TECH.MFI]: [14],
  [LOWER_TECH.VOLA]: [10],
  [LOWER_TECH.VOLP]: [],
  [LOWER_TECH.VAO]: [10],
  [LOWER_TECH.CCI]: [5],
  [LOWER_TECH.ATR]: [14],
};

/**
 * 取某个指标的默认参数数组（无该指标配置时返回空数组）。
 */
export function defaultParamsFor(pane: 'upper' | 'lower', type: number): number[] {
  const table = pane === 'upper' ? UPPER_DEFAULT_PARAMS : LOWER_DEFAULT_PARAMS;
  return [...(table[type] ?? [])];
}

/**
 * 把参数数组格式化为后端要求的逗号分隔字符串。
 * 按指标要求个数截取（多余忽略）；params 为 null/空 → undefined（后端走默认参数）。
 * 注意：截取只保证"不超发"，调用方需保证传入的参数个数 ≥ 指标要求个数（不足会 500）。
 */
export function formatIndicatorParams(
  pane: 'upper' | 'lower',
  type: number,
  params?: number[] | null,
): string | undefined {
  if (!params || params.length === 0) return undefined;
  const count = (pane === 'upper' ? UPPER_PARAM_COUNT : LOWER_PARAM_COUNT)[type] ?? 0;
  const slice = count > 0 ? params.slice(0, count) : [];
  return slice.length > 0 ? slice.join(',') : undefined;
}

/**
 * 判断某指标当前参数是否等于默认值（用于 WS 增量兼容判断：
 * 非默认参数时 WS 的 INDICATORS 增量按默认参数推送，必须忽略）。
 */
export function isDefaultParams(pane: 'upper' | 'lower', type: number, params?: number[] | null): boolean {
  const defs = defaultParamsFor(pane, type);
  const p = params ?? [];
  if (defs.length !== p.length) return false;
  return defs.every((v, i) => v === p[i]);
}
