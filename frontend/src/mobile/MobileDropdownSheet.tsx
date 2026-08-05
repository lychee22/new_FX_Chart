// 移动端下拉选择器: 底部弹出 Sheet 列表, 替代原生 <select>
// 支持单选 / 多选, 选中项高亮

import { Drawer } from 'antd';
import { CheckOutlined } from '@ant-design/icons';

export interface DropdownOption<T extends string | number> {
  value: T;
  label: string;
}

interface MobileDropdownSheetProps<T extends string | number> {
  title: string;
  open: boolean;
  onClose: () => void;
  options: DropdownOption<T>[];
  selected?: T;
  multiSelected?: T[];
  onSelect: (value: T) => void;
  onConfirm?: () => void;
  /** 单选 / 多选 */
  mode?: 'single' | 'multi';
  /** 抽屉高度 (CSS 长度或数字, 数字默认按 vh 计) */
  height?: number | string;
  /** 2026-08-04：Drawer 渲染容器 — 全屏观看时传 chartWrap, 保证全屏元素内可见 */
  getContainer?: () => HTMLElement;
}

export function MobileDropdownSheet<T extends string | number>({
  title,
  open,
  onClose,
  options,
  selected,
  multiSelected,
  onSelect,
  onConfirm,
  mode = 'single',
  height = 55,
  getContainer,
}: MobileDropdownSheetProps<T>) {
  const handleItemClick = (value: T) => {
    onSelect(value);
    if (mode === 'single') onClose();
  };

  // 数字 → vh 字符串, 否则原样传入
  const heightValue = typeof height === 'number' ? `${height}vh` : height;

  return (
    <Drawer
      title={null}
      placement="bottom"
      height={heightValue}
      open={open}
      onClose={onClose}
      closable={false}
      className="mobile-dropdown-sheet-floating"
      rootClassName="mobile-dropdown-sheet-root"
      getContainer={getContainer}
      styles={{ header: { display: 'none' }, body: { padding: 0 } }}
    >
      <ul className="mobile-dropdown-list" role="listbox">
        {options.map((opt) => {
          const isActive =
            mode === 'multi'
              ? multiSelected?.includes(opt.value)
              : selected === opt.value;
          return (
            <li
              key={opt.value}
              role="option"
              aria-selected={!!isActive}
              className={`mobile-dropdown-item ${isActive ? 'active' : ''}`}
              onClick={() => handleItemClick(opt.value)}
            >
              <span>{opt.label}</span>
              {isActive && <CheckOutlined className="mobile-dropdown-check" />}
            </li>
          );
        })}
      </ul>
      {mode === 'multi' && onConfirm && (
        <div className="mobile-dropdown-footer">
          <button type="button" className="mobile-dropdown-confirm" onClick={onConfirm}>
            確定
          </button>
        </div>
      )}
    </Drawer>
  );
}