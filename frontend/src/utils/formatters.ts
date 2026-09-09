import { LOWER_TECH } from '../types';
import type { IndicatorResult } from '../types';

/** 2026-07-29：把数值简写成 K / M / B 形式（如 1111800000 → 1.11B）
 *  2026-09-08：从 ChartPanel.tsx 抽到 utils/formatters.ts
 */
export function formatIndicatorValueShort(value: number, decimals: number): string {
  const abs = Math.abs(value);
  if (abs >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
  return value.toFixed(decimals);
}

/** 2026-07-29：从 IndicatorResult 取最后一个非 null 值并格式化。MACD 取主线 (series[0])
 *  2026-09-08：从 ChartPanel.tsx 抽到 utils/formatters.ts
 */
export function formatLastValue(result: IndicatorResult, decimals: number): string {
  // MACD 优先显示 series[0]（DIF），其他取 series[0]
  for (const series of result.series) {
    const pts = series.data;
    for (let j = pts.length - 1; j >= 0; j--) {
      const v = pts[j].value;
      if (v !== null && Number.isFinite(v)) return formatIndicatorValueShort(v as number, decimals);
    }
  }
  return '—';
}

/** 2026-08-04：移动端副图描述条数值 (需求2) — 成交量类指标(VOLUME/VOLP)显示整数千分位 + "手"
 *  (仿股票"成交量 XXX手"), 其余指标沿用 K/M/B 缩写。
 *  2026-09-08：从 ChartPanel.tsx 抽到 utils/formatters.ts
 */
export function formatLowerValueForMobile(
  tech: number,
  result: IndicatorResult | undefined,
  decimals: number,
): string {
  if (!result) return '—';
  for (const series of result.series) {
    const pts = series.data;
    for (let j = pts.length - 1; j >= 0; j--) {
      const v = pts[j].value;
      if (v === null || !Number.isFinite(v)) continue;
      const num = v as number;
      if (tech === LOWER_TECH.VOLUME || tech === LOWER_TECH.VOLP) {
        return `${Math.round(num).toLocaleString()}手`;
      }
      return formatIndicatorValueShort(num, decimals);
    }
  }
  return '—';
}

// 2026-07-30：指标数据兜底清洗 — 把脏数据(NaN/undefined/重复 time)处理成 Lightweight Charts 能吃的形态。
//  - value 为 null/undefined/NaN/Infinity → 丢弃（不传 null 给 setData，否则后续 update 会再次报错）
//  - time 必须为有限数字；非数字或缺时间字段 → 丢弃
//  - 同 time 多点 → 仅保留最后一个
//  - 必须严格升序排列
//  返回 { points, allEmpty }：allEmpty=true 表示该 series 没有任何可用数据点（用于显示"数据异常"提示）
// 2026-09-08：从 ChartPanel.tsx 抽到 utils/sanitize.ts
export function sanitizePoints(
  data: Array<{ time: number; value: number | null }>,
): { points: Array<{ time: number; value: number }>; allEmpty: boolean } {
  const filtered: Array<{ time: number; value: number }> = [];
  for (const d of data) {
    if (typeof d.time !== 'number' || !Number.isFinite(d.time)) continue;
    if (d.value === null || d.value === undefined) continue;
    if (!Number.isFinite(d.value as number)) continue;
    filtered.push({ time: d.time, value: d.value as number });
  }
  // 按 time 升序排序，同 time 仅保留最后一个（防御后端偶尔乱序/重复）
  filtered.sort((a, b) => a.time - b.time);
  const dedup: Array<{ time: number; value: number }> = [];
  for (let i = 0; i < filtered.length; i++) {
    if (i > 0 && filtered[i].time === filtered[i - 1].time) {
      dedup[dedup.length - 1] = filtered[i];
    } else {
      dedup.push(filtered[i]);
    }
  }
  return { points: dedup, allEmpty: filtered.length === 0 };
}
