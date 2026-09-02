// 移动端画线浮层（纯展示）
// 2026-09-01：渲染两件事：
//   1. 顶部持续步骤提示条（仅在移动端画线模式 + 有步骤提示时显示）
//   2. 中下方悬浮删除按钮（仅在选中态出现，<code>点已画线条 → 显示锚点 + 此按钮</code>）
//
//  步骤提示字符串由调用方传入（来自 useChartDrawInteraction 的 stepHint 状态）。
//  该字符串已是"已本地化"的中文（移动端仅 sc/tc 提示），en 时降级到画线工具通用提示。

import { DeleteOutlined } from '@ant-design/icons';
import { useI18n } from '../i18n';

interface MobileDrawOverlaysProps {
  /** 步骤提示：null=无提示；'done'="已完成"；其他=进行中步骤 */
  stepHint: string | null;
  /** 是否有选中对象（驱动悬浮删除按钮显示） */
  hasSelected: boolean;
  /** 删除当前选中对象 */
  onDeleteSelected: () => void;
}

export function MobileDrawOverlays(props: MobileDrawOverlaysProps) {
  const { t } = useI18n();
  const { stepHint, hasSelected, onDeleteSelected } = props;

  // stepHint 已包含中文化文本；'done' 是 sentinel — 翻译为"已完成"
  const stepText = stepHint === null ? null :
    stepHint === 'done' ? '已完成' : stepHint;

  return (
    <>
      {stepText !== null && (
        <div className="mobile-drawing-step-hint" role="status" aria-live="polite">
          {stepText}
        </div>
      )}
      {hasSelected && (
        <button
          type="button"
          className="mobile-drawing-delete-fab"
          onClick={onDeleteSelected}
          aria-label={t('Delete')}
        >
          <DeleteOutlined /> {t('Delete')}
        </button>
      )}
    </>
  );
}