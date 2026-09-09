// 移动端横屏全屏画线抽屉（纯展示）
// 2026-09-01：
//   - 仅在横屏全屏 + 抽屉打开时渲染（由 MobileLayout 控制）
//   - 内部不持有任何业务状态，所有行为通过 props 回调驱动
//   - 容器内 onPointerDown stopPropagation 防止点击穿透触发图表 tap（定点/选中）
//   - 覆盖图表约 30% 宽（min-width 兜底），不压缩图表布局（absolute 浮层）
//
//   抽屉内工具列表只暴露移动端 5 种：TRENDLINE / PARALLEL_CHANNEL / FIBON_RET / FIBON_PRO / TEXTBOX
//   与 requirements 对应：直线（趋势线）、通道线（平行通道）、黄金分割线（斐波那契回调/投射）、文字框
//   2026-09-07：新增 FIBON_PRO（斐波那契投射）与 TEXTBOX（文字框）入口。

import type { PointerEvent as ReactPointerEvent } from 'react';
import { message } from 'antd';
import {
  CloseOutlined,
  DeleteOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  FontSizeOutlined,
  MinusOutlined,
  NodeIndexOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import { TOOL, LIMITED_TOOLS, MAX_PER_TYPE } from '../drawing/tools';
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
  /** 2026-09-04：是否有进行中的画线 (pendingPoints 非空) — true 时抽屉按钮全部锁定 */
  inProgress: boolean;
  // 2026-09-07：每类工具对象当前数量 (key=TOOL.*, value=count)。受限工具 (LIMITED_TOOLS 内)
  // 点击时若计数 >= MAX_PER_TYPE, 弹 LimitReached 并阻断进入激活态。
  drawingCounts?: Record<number, number>;
  /** 选择工具回调（传入 TOOL.NONE 表示关闭当前工具） */
  onToolChange: (tool: number) => void;
  /** 全部删除回调 */
  onDeleteAll: () => void;
  /** 切换全局显隐 */
  onToggleVisible: () => void;
  /** 完成画线：抽屉关闭 + tool=NONE + 取消进行中绘制 */
  onFinish: () => void;
  /**
   * 2026-09-07：仅取消当前未完成的画线（清 pending/preview/stage 中间态），
   * 保留当前画线工具激活态 — 按钮仅在 inProgress=true 时渲染并可点。
   */
  onCancelPending?: () => void;
}

const TOOL_BUTTONS: Array<{ tool: number; Icon: React.ComponentType; labelKey:
  'StraightLine' | 'ChannelLine' | 'GoldenSection' | 'FibProjection' | 'TextBox' }> = [
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
  // 2026-09-07：斐波那契投射 — 与回调视觉相似但向右上方延伸:
  //   P1→P2 实线基准段（左下→右下） + P2→P3 虚线（折向右上） + 2 条向右上方延伸的虚线投射线
  { tool: TOOL.FIBON_PRO, Icon: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <line x1="2" y1="13" x2="11" y2="13" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2"/>
      <line x1="11" y1="13" x2="14" y2="3" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2"/>
      <line x1="2" y1="9" x2="14" y2="9" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2"/>
      <line x1="2" y1="5" x2="14" y2="5" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2"/>
    </svg>
  ), labelKey: 'FibProjection' },
  { tool: TOOL.TEXTBOX, Icon: FontSizeOutlined, labelKey: 'TextBox' },
];

export function MobileDrawingDrawer(props: MobileDrawingDrawerProps) {
  const { t } = useI18n();
  const { open, tool, canDeleteAll, drawingsVisible, inProgress, drawingCounts,
    onToolChange, onDeleteAll, onToggleVisible, onFinish, onCancelPending } = props;

  if (!open) return null;

  // 容器内点击 / 落下停止冒泡，防止触发表格 tap（定点/选中）
  const stop = (e: ReactPointerEvent<HTMLDivElement>) => e.stopPropagation();

  // 2026-09-04：进行中守卫 — 画图未完成时点击任何抽屉按钮都拦截, 弹 "请先完成绘图"。
  // 浏览器 / antd 的 disabled 按钮默认仍会触发 click, 这里兜底统一拦截。
  const guard = <T extends (...args: any[]) => void>(fn: T) => ((...args: Parameters<T>) => {
    if (inProgress) {
      message.warning(t('FinishDrawingFirst'));
      return;
    }
    fn(...args);
  });

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
          // 2026-09-04：当前激活的工具按钮排除禁用 — 用户需要能再次点击同一按钮来
          // 取消激活（TradingView 行为一致）。其它未激活按钮在画线过程中禁用。
          const lockThis = inProgress && !active;
          return (
            <button
              key={id}
              type="button"
              className={'mobile-drawing-tool-btn' + (active ? ' is-active' : '')}
              disabled={lockThis}
              onClick={() => {
                if (lockThis) {
                  message.warning(t('FinishDrawingFirst'));
                  return;
                }
                // 2026-09-07：移动端点击工具按钮时提前检查该类工具的上限 —
                // 受限工具 (LIMITED_TOOLS: PARALLEL_LINE/CHANNEL/FIBON_RET/FIBON_PRO/TEXTBOX)
                // 已有 5 个时直接弹 LimitReached 并 return, 不进入激活态。
                // 画线 (TRENDLINE) 不受限, 跳过检查。再次点击同一已激活按钮 (=取消激活)
                // 也跳过检查, 避免误阻断用户取消工具。
                if (!active && LIMITED_TOOLS.has(id)) {
                  const count = drawingCounts?.[id] ?? 0;
                  if (count >= MAX_PER_TYPE) {
                    message.warning(t('LimitReached'));
                    return;
                  }
                }
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

      {/* 2026-09-07：删除全部 + 显隐 — 仅在非进行中显示。
          画线进行中这两个操作既无意义（inProgress 时只能"完成/取消"），也容易被 guard
          拦截误弹"请先完成绘图"。直接隐藏更干净。 */}
      {!inProgress && (
        <div className="mobile-drawing-drawer-section">
          <button
            type="button"
            className="mobile-drawing-action-btn"
            disabled={!canDeleteAll}
            onClick={guard(onDeleteAll)}
            aria-label={t('DeleteAllDrawings')}
          >
            <span className="mobile-drawing-tool-icon"><DeleteOutlined /></span>
            <span className="mobile-drawing-tool-label">{t('DeleteAllDrawings')}</span>
          </button>
          <button
            type="button"
            className="mobile-drawing-action-btn"
            onClick={guard(onToggleVisible)}
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
      )}

      {/* 2026-09-07：取消画线（仅清 pending，保留画线工具）— 仅在进行中显示
          作为"次要破坏性操作"放在 Finish 按钮上方，让用户画到一半想重画第一点时一键回到 0/N 步。 */}
      {inProgress && onCancelPending && (
        <button
          type="button"
          className="mobile-drawing-cancel-pending-btn"
          onClick={onCancelPending}
          aria-label={t('CancelDraw')}
        >
          <CloseOutlined /> {t('CancelDraw')}
        </button>
      )}

      <button
        type="button"
        className="mobile-drawing-finish-btn"
        // 2026-09-04：inProgress=true 时禁用完成按钮 — 用户必须先完成绘图。
        // 完成瞬间 pendingPoints 已清空 → inProgress=false → 按钮自动可点。
        disabled={inProgress}
        onClick={guard(onFinish)}
        aria-label={t('FinishDrawing')}
      >
        <CheckOutlined /> {t('FinishDrawing')}
      </button>
    </div>
  );
}