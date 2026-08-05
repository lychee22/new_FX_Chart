// 绘图工具定义 (对齐旧系统 DEF_TOOL_* 常量与 charttest5.html 工具下拉)
// 2026-07-31：工具下拉框瘦身 — 只保留绘制工具。
// 清除动作改由下拉框旁的"清除所有"按钮提供, 不再占用下拉项。
// 旧 CLEAR_* 常量保留, 仅是不再出现在 TOOLS 数组中。

import type { StringKey } from '../i18n';

export const TOOL = {
  NONE: 0,
  DRAWLINE: -1,      // 旧系统 DEF_TOOL_DRAWLINE
  TRENDLINE: 1,      // DEF_TOOL_TRENDLINE
  PARALLEL_LINE: 2,  // DEF_TOOL_PARALLEL_LINE
  CLEAR_ONELINE: 3,
  CLEAR_ALLLINE: 4,
  FIBON_RET: 5,
  FIBON_PRO: 6,
  CLEAR_FIBON: 7,
  TEXTBOX: 8,
  CLEAR_ONETEXT: 9,
  CLEAR_ALLTEXT: 10,
  PARALLEL_CHANNEL: 11,  // 平行通道 (TradingView 风格三锚点)
} as const;

export interface ToolDef {
  id: number;
  labelKey: StringKey;
  /** 是否为即时动作 (选择后执行一次并重置) */
  instant?: boolean;
}

export const TOOLS: ToolDef[] = [
  { id: TOOL.NONE, labelKey: 'Tools' },
  { id: TOOL.TRENDLINE, labelKey: 'DrawLine' },
  // { id: TOOL.PARALLEL_LINE, labelKey: 'ParallelLines' },
  { id: TOOL.PARALLEL_CHANNEL, labelKey: 'ParallelChannel' },
  { id: TOOL.FIBON_RET, labelKey: 'FibRetracement' },
  { id: TOOL.FIBON_PRO, labelKey: 'FibProjection' },
  { id: TOOL.TEXTBOX, labelKey: 'TextBox' },
];

// 斐波那契比例 (对齐旧系统 fibReRatio / fibPrRatio)
export const FIB_RE_RATIOS = [0.382, 0.5, 0.618, 1.618, 2];
export const FIB_PR_RATIOS = [0.618, 1, 1.618];

// 2026-07-31：各类工具最大数量上限。
// TRENDLINE (画线) 不限；其余五类各最多 5 个 (超出后拒绝创建并提示用户)。
export const MAX_PER_TYPE = 5;
// 受限类型集合 — TRENDLINE 不在内, 走无限分支。
export const LIMITED_TOOLS: ReadonlySet<number> = new Set([
  TOOL.PARALLEL_LINE,
  TOOL.PARALLEL_CHANNEL,
  TOOL.FIBON_RET,
  TOOL.FIBON_PRO,
  TOOL.TEXTBOX,
]);

// 颜色 (对齐旧系统 simplechart.js 颜色常量)
export const COLORS = {
  LINE: '#FF0080',           // DEF_LINE_COLOR 画线
  TEMPLINE: '#C0C0C0',       // DEF_TEMPLINE_COLOR 预览线
  FIB_RE: '#6090F0',         // DEF_FIBRE_COLOR
  FIB_PR: '#9060F0',         // DEF_FIBPR_COLOR
  TEXT: '#0000FF',           // DEF_TEXT_COLOR
  CHANNEL_LINE: '#2196F3',   // 平行通道主线 (TradingView 蓝)
  CHANNEL_FILL: 'rgba(33,150,243,0.15)', // 平行通道半透明填充
};
