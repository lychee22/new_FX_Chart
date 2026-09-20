// 2026-09-10：memo 化 — ChartPanel 高频 state（info 等）变化时避免无关重渲染。
import { memo } from 'react';
import { useI18n } from '../../i18n';

// 2026-09-08：触屏画线工具提示浮层 — 淡黄色 box + 移动端"取消"按钮。
// 抽取自 ChartPanel.tsx 的 tools-hint 内联 JSX (原 2560-2579 行)。
// 2026-09-02：移动端画线抽屉打开时隐藏右上角淡黄色 box — 抽屉内有顶部居中步骤 pill 接管提示，
// 避免与 pill 同时出现造成双重提示。
export interface ToolsHintOverlayProps {
  /** 提示文案；空串 时不显示。 */
  hint: string;
  /** 是否触屏设备布局 (来自 props.mobile) */
  mobile: boolean;
  /** 移动端画线抽屉打开时为 true，强制隐藏提示避免与 pill 双重提示 */
  hidden?: boolean;
}

export const ToolsHintOverlay = memo(function ToolsHintOverlay({ hint, mobile, hidden }: ToolsHintOverlayProps) {
  const { t } = useI18n();
  if (hidden) return null;
  return (
    <div className={`tools-hint ${hint ? 'show' : ''}`}>
      {hint}
      {/* 2026-08-27：移动端无右键, 提供触摸友好的"取消"按钮 (PC 端仍走右键, 保持零变化) */}
      {hint && mobile && (
        <button
          type="button"
          className="tools-hint-cancel"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            window.dispatchEvent(new CustomEvent('chart:cancel-drawing'));
          }}
          aria-label={t('CancelDraw')}
        >
          {t('CancelDraw')}
        </button>
      )}
    </div>
  );
});
