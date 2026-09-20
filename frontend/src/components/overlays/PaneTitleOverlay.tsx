// 2026-09-10：memo 化 — 十字线高频 setInfo 时避免每个副图标题重渲染；
// 函数 props (onMove/onRemove/onReset) 已由 ChartPanel useCallback 稳定。
import { memo } from 'react';
import { Button } from 'antd';
import { CaretUpOutlined, DeleteOutlined, RedoOutlined } from '@ant-design/icons';
import { useI18n } from '../../i18n';
import { LOWER_NAME_KEY } from '../../constants/chart';
import { formatLowerValueForMobile } from '../../utils/formatters';
import type { IndicatorResult } from '../../types';

// 2026-09-08：副图标题浮层 — 移动端由 CSS @media 隐藏。
// 抽取自 ChartPanel.tsx 的 pane-title-overlay 内联 map JSX (原 2581-2635 行)。
// 2026-07-31：浮层位置未就绪时不渲染，避免新增副图瞬间在 chart-container 顶部 4px 闪现
// 2026-08-04：移动端描述条贴紧副图 pane 顶部 (主/副图交界处), 桌面端保留 4px 内边距
export interface PaneTitleOverlayProps {
  /** 副图指标 id */
  tech: number;
  /** 副图在 props.lower 数组中的 index (用于上移按钮 disabled 判定) */
  idx: number;
  /** 实测的 pane 顶部位置 (来自 paneTops 数组)；undefined 表示未就绪 */
  paneTop: number | undefined;
  /** 是否触屏布局 (决定 CSS 类 + 按钮组显隐) */
  isMobileLayout: boolean;
  /** 该副图当前是否处于数据错误状态 */
  isError: boolean;
  /** 桌面端最近一次缓存的格式化值 (来自 lowerValues map) */
  desktopValue: string | null | undefined;
  /** 移动端实时查询的指标结果 (来自 lowerResultsRef.current.get(tech)) */
  mobileResult: IndicatorResult | undefined;
  decimals: number;
  onMove: (tech: number) => void;
  onRemove: (tech: number) => void;
  onReset: (tech: number) => void;
}

export const PaneTitleOverlay = memo(function PaneTitleOverlay({
  tech,
  idx,
  paneTop,
  isMobileLayout,
  isError,
  desktopValue,
  mobileResult,
  decimals,
  onMove,
  onRemove,
  onReset,
}: PaneTitleOverlayProps) {
  const { t } = useI18n();
  if (paneTop === undefined) return null;
  const nameKey = LOWER_NAME_KEY[tech] ?? 'Lower';
  const top = isMobileLayout ? paneTop : paneTop + 4;
  return (
    <div
      key={`pane-title-${tech}`}
      className={`pane-title-overlay${isError ? ' pane-title-error' : ''}${isMobileLayout ? ' pane-title-mobile' : ''}`}
      style={{ top }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <span className="pane-title-name">{t(nameKey as any)}</span>
      <span
        className="pane-title-value"
        style={isError ? { color: '#c0392b', fontStyle: 'italic' } : undefined}
      >
        {isError
          ? t('LowerDataError')
          : isMobileLayout
            ? formatLowerValueForMobile(tech, mobileResult, decimals)
            : (desktopValue ?? '—')}
      </span>
      {!isMobileLayout && (
        <span className="pane-title-actions">
          <Button
            icon={<CaretUpOutlined />}
            type="default"
            title={t('MoveUp')}
            aria-label={t('MoveUp')}
            disabled={idx === 0}
            onClick={(e) => { e.stopPropagation(); onMove(tech); }}
          />
          <Button
            icon={<DeleteOutlined />}
            type="default"
            title={t('Delete')}
            aria-label={t('Delete')}
            onClick={(e) => { e.stopPropagation(); onRemove(tech); }}
          />
          <Button
            icon={<RedoOutlined />}
            type="default"
            title={t('Reset')}
            aria-label={t('Reset')}
            onClick={(e) => { e.stopPropagation(); onReset(tech); }}
          />
          {/* <Button icon={<ShrinkOutlined />} />
          <Button icon={<ArrowsAltOutlined />}/> */}
        </span>
      )}
    </div>
  );
});
