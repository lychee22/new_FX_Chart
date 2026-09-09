import { Button } from 'antd';
import { RedoOutlined } from '@ant-design/icons';
import { useI18n } from '../../i18n';

// 2026-09-08：主图无数据/加载失败占位 — 复用全屏覆盖层模式，点击按钮直接重试 loadMainData。
// 抽取自 ChartPanel.tsx 的 chart-empty-overlay 内联 JSX (原 2735-2749 行)。
export interface EmptyOverlayProps {
  show: boolean;
  onRetry: () => void;
}

export function EmptyOverlay({ show, onRetry }: EmptyOverlayProps) {
  const { t } = useI18n();
  if (!show) return null;
  return (
    <div className="chart-empty-overlay" role="status" aria-live="polite">
      <div className="chart-empty-title">{t('NoData')}</div>
      <div className="chart-empty-subtitle">{t('NoDataRetryHint')}</div>
      <Button
        type="primary"
        icon={<RedoOutlined />}
        onClick={onRetry}
        aria-label={t('Refresh')}
      >
        {t('Refresh')}
      </Button>
    </div>
  );
}
