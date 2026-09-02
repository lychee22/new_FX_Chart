// 移动端横屏全屏画线抽屉（纯展示）
// 2026-09-01：
//   - 仅在横屏全屏 + 抽屉打开时渲染（由 MobileLayout 控制）
//   - 内部不持有任何业务状态，所有行为通过 props 回调驱动
//   - 容器内 onPointerDown stopPropagation 防止点击穿透触发图表 tap（定点/选中）
//   - 覆盖图表约 30% 宽（min-width 兜底），不压缩图表布局（absolute 浮层）
//
//   抽屉内工具列表只暴露移动端 3 种：TRENDLINE / PARALLEL_CHANNEL / FIBON_RET
//   与 requirements 对应：直线（趋势线）、通道线（平行通道）、黄金分割线（斐波那契回调）

import type { PointerEvent as ReactPointerEvent } from 'react';
import {
  DeleteOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  MinusOutlined,
  NodeIndexOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import { TOOL } from '../drawing/tools';
import { useI18n } from '../i18n';

interface MobileDrawingDrawerProps {
  /** 抽屉是否打开 */
  open: boolean;
  /** 当前激活的工具 */
  tool: number;
  /** 是否有可删除对象（按钮 disabled 用） */
  canDeleteAll: boolean;
  /** 全局显隐状态 — true=显示 / false=隐藏 */
  drawingsVisible: boolean;
  /** 选择工具回调（传入 TOOL.NONE 表示关闭当前工具） */
  onToolChange: (tool: number) => void;
  /** 全部删除回调 */
  onDeleteAll: () => void;
  /** 切换全局显隐 */
  onToggleVisible: () => void;
  /** 完成画线：抽屉关闭 + tool=NONE + 取消进行中绘制 */
  onFinish: () => void;
}

const TOOL_BUTTONS: Array<{ tool: number; Icon: React.ComponentType; labelKey:
  'StraightLine' | 'ChannelLine' | 'GoldenSection' }> = [
  { tool: TOOL.TRENDLINE, Icon: MinusOutlined, labelKey: 'StraightLine' },
  { tool: TOOL.PARALLEL_CHANNEL, Icon: NodeIndexOutlined, labelKey: 'ChannelLine' },
  { tool: TOOL.FIBON_RET, Icon: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <line x1="2" y1="14" x2="14" y2="2" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2"/>
      <line x1="2" y1="10" x2="14" y2="10" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2"/>
      <line x1="2" y1="6" x2="14" y2="6" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2"/>
      <line x1="2" y1="2" x2="14" y2="14" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2"/>
    </svg>
  ), labelKey: 'GoldenSection' },
];

export function MobileDrawingDrawer(props: MobileDrawingDrawerProps) {
  const { t } = useI18n();
  const { open, tool, canDeleteAll, drawingsVisible, onToolChange,
    onDeleteAll, onToggleVisible, onFinish } = props;

  if (!open) return null;

  // 容器内点击 / 落下停止冒泡，防止触发表格 tap（定点/选中）
  const stop = (e: ReactPointerEvent<HTMLDivElement>) => e.stopPropagation();

  return (
    <div
      className="mobile-drawing-drawer"
      role="dialog"
      aria-label={t('DrawTools')}
      onPointerDown={stop}
      onPointerUp={stop}
    >
      <div className="mobile-drawing-drawer-section">
        {TOOL_BUTTONS.map(({ tool: id, Icon, labelKey }) => {
          const active = tool === id;
          return (
            <button
              key={id}
              type="button"
              className={'mobile-drawing-tool-btn' + (active ? ' is-active' : '')}
              onClick={() => {
                // 再次点击同一工具 = 取消激活（与 TradingView 行为一致）
                onToolChange(active ? TOOL.NONE : id);
              }}
            >
              <span className="mobile-drawing-tool-icon"><Icon /></span>
              <span className="mobile-drawing-tool-label">{t(labelKey)}</span>
            </button>
          );
        })}
      </div>

      <div className="mobile-drawing-drawer-divider" />

      <div className="mobile-drawing-drawer-section">
        <button
          type="button"
          className="mobile-drawing-action-btn"
          disabled={!canDeleteAll}
          onClick={onDeleteAll}
          aria-label={t('DeleteAllDrawings')}
        >
          <span className="mobile-drawing-tool-icon"><DeleteOutlined /></span>
          <span className="mobile-drawing-tool-label">{t('DeleteAllDrawings')}</span>
        </button>
        <button
          type="button"
          className="mobile-drawing-action-btn"
          onClick={onToggleVisible}
          aria-label={drawingsVisible ? t('HideDrawings') : t('ShowDrawings')}
        >
          <span className="mobile-drawing-tool-icon">
            {drawingsVisible ? <EyeInvisibleOutlined /> : <EyeOutlined />}
          </span>
          <span className="mobile-drawing-tool-label">
            {drawingsVisible ? t('HideDrawings') : t('ShowDrawings')}
          </span>
        </button>
      </div>

      <button
        type="button"
        className="mobile-drawing-finish-btn"
        onClick={onFinish}
        aria-label={t('FinishDrawing')}
      >
        <CheckOutlined /> {t('FinishDrawing')}
      </button>
    </div>
  );
}