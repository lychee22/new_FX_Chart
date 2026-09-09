// 2026-09-08：十字光标 OHLC 信息浮层 — chart-container 左上角，HTML 由 ChartPanel 拼装后传入。
// 抽取自 ChartPanel.tsx 的 info-overlay 内联 JSX (原 2556 行)。
export interface InfoOverlayProps {
  /** 已拼装好的 HTML 字符串；null/空 表示不显示 */
  html: string | null;
}

export function InfoOverlay({ html }: InfoOverlayProps) {
  if (!html) return null;
  return <div className="info-overlay" dangerouslySetInnerHTML={{ __html: html }} />;
}
