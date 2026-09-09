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

  // stepHint 已包含 i18n 文案 (来自 useChartDrawInteraction 的 formatStepHint)；
  // 'done' 是 sentinel — 走 i18n key DrawStepDone
  const stepText = stepHint === null ? null :
    stepHint === 'done' ? t('DrawStepDone') : stepHint;

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
          // 2026-09-02：本按钮渲染在图表容器内部，指针事件会冒泡到容器的
          // onPointerDown/onPointerUp，被 useChartDrawInteraction 当成「点击空白」
          // 先行取消选中 → React 立即卸载本按钮 → click 永远到不了 → 删除失效
          // (表现为「只是把点展示取消了」)。在冒泡源头阻断，保证 tap 只触发删除。
          onPointerDown={(e) => e.stopPropagation()}
          onPointerUp={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onDeleteSelected();
          }}
          aria-label={t('Delete')}
        >
          <DeleteOutlined /> {t('Delete')}
        </button>
      )}
    </>
  );
}