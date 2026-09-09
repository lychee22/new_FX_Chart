// 2026-09-08：副图加载/卸载骨架浮层 — loading + fading-out 两种状态 (key=tech，位置用 indexOf 换算)。
// 抽取自 ChartPanel.tsx 的 pane-skeleton-overlay 内联 map JSX (原 2637-2657 行)。
export interface PaneSkeletonOverlayProps {
  /** 副图指标 id */
  tech: number;
  /** 实测的 pane 顶部位置 (来自 paneTops 数组)；undefined 表示未就绪 */
  paneTop: number | undefined;
  /** 是否处于 fading-out 动画阶段 (来自 pendingFadingOut set) */
  isFadingOut: boolean;
}

export function PaneSkeletonOverlay({ tech, paneTop, isFadingOut }: PaneSkeletonOverlayProps) {
  if (paneTop === undefined) return null;
  const top = paneTop + 4;
  return (
    <div
      key={`pane-skeleton-${tech}`}
      className={`pane-skeleton-overlay${isFadingOut ? ' fading-out' : ''}`}
      style={{ top }}
    >
      <span className="skeleton-bar skeleton-name" />
      <span className="skeleton-bar skeleton-value" />
      <span className="skeleton-bar skeleton-btn" />
      <span className="skeleton-bar skeleton-btn" />
      <span className="skeleton-bar skeleton-btn" />
      <span className="skeleton-bar skeleton-btn" />
    </div>
  );
}
