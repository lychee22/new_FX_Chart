import type { DeepPartial, ChartOptions } from 'lightweight-charts';

/**
 * 触摸平移开关公式 — 2026-09-10 统一收敛。
 * 原先 ChartPanel.applyTouchPanOptions 与 useChartInit.resize 各自实现一份且语义漂移
 * (resize 版缺 drawMode 判断: 移动画线模式下工具激活时, 一处禁用横向拖动、一处允许)。
 * 现统一为 drawMode 感知版:
 * - 手机布局 (mobile/横屏全屏): 纵向手势交页面滚动, 仅保留横向拖动;
 *   工具激活且非画线模式时禁用横向拖动 (手指拖动用于绘图预览而非平移);
 *   画线模式 (tap 定点) 下工具激活仍允许横向拖动。
 * - 桌面布局: 全部开启。
 */
export function buildHandleScroll(
  isPhoneLayout: boolean,
  toolActive: boolean,
  drawMode: boolean,
): DeepPartial<ChartOptions>['handleScroll'] {
  return {
    mouseWheel: !isPhoneLayout,
    pressedMouseMove: true,
    horzTouchDrag: isPhoneLayout ? !(toolActive && !drawMode) : true,
    vertTouchDrag: !isPhoneLayout,
  };
}
