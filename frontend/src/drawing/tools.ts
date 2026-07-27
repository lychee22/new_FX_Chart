// 绘图工具定义 (对齐旧系统 DEF_TOOL_* 常量与 charttest5.html 工具下拉)
// 注意: 旧系统的 "Clear Last Line"=3 是即时动作, 选择后立即执行并重置为 NONE

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
  { id: TOOL.PARALLEL_LINE, labelKey: 'ParallelLines' },
  { id: TOOL.CLEAR_ONELINE, labelKey: 'ClearLastLine', instant: true },
  { id: TOOL.CLEAR_ALLLINE, labelKey: 'ClearAllLines', instant: true },
  { id: TOOL.FIBON_RET, labelKey: 'FibRetracement' },
  { id: TOOL.FIBON_PRO, labelKey: 'FibProjection' },
  { id: TOOL.CLEAR_FIBON, labelKey: 'ClearFibonacci', instant: true },
  { id: TOOL.TEXTBOX, labelKey: 'TextBox' },
  { id: TOOL.CLEAR_ONETEXT, labelKey: 'ClearLastText', instant: true },
  { id: TOOL.CLEAR_ALLTEXT, labelKey: 'ClearAllText', instant: true },
];

// 斐波那契比例 (对齐旧系统 fibReRatio / fibPrRatio)
export const FIB_RE_RATIOS = [0.382, 0.5, 0.618, 1.618, 2];
export const FIB_PR_RATIOS = [0.618, 1, 1.618];

// 颜色 (对齐旧系统 simplechart.js 颜色常量)
export const COLORS = {
  LINE: '#FF0080',           // DEF_LINE_COLOR 画线
  TEMPLINE: '#C0C0C0',       // DEF_TEMPLINE_COLOR 预览线
  FIB_RE: '#6090F0',         // DEF_FIBRE_COLOR
  FIB_PR: '#9060F0',         // DEF_FIBPR_COLOR
  TEXT: '#0000FF',           // DEF_TEXT_COLOR
};
