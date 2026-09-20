// 2026-09-10：memo 化 — show=false 期间完全跳过渲染。
import { memo } from 'react';
import { Spin } from 'antd';
import { useI18n } from '../../i18n';

// 2026-09-08：首次加载覆盖层 — 全屏 Spin + Loading 文案。
// 抽取自 ChartPanel.tsx 的 chart-loading-overlay 内联 JSX (原 2728-2733 行)。
export interface LoadingOverlayProps {
  show: boolean;
}

export const LoadingOverlay = memo(function LoadingOverlay({ show }: LoadingOverlayProps) {
  const { t } = useI18n();
  if (!show) return null;
  return (
    <div className="chart-loading-overlay">
      <Spin size="large" />
      <span className="chart-loading-text">{t('Loading')}…</span>
    </div>
  );
});
