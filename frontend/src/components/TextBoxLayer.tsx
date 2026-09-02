// 文字框渲染层: 把 DrawingManager 中的 TextBox 列表映射为 antd 样式的
// 绝对定位 <div>，叠加在图表 canvas 之上。位置随图表缩放/平移重算。
//
// - 默认态: 浅色虚线框，显示文字
// - 选中态: 蓝色实线边框（来自被上层 ChartPanel 选中）
// - 编辑态: 蓝色实线 + contentEditable 占位 + 自动聚焦
//
// 拖动: 鼠标按下后拖动改 anchor (time/price)，失焦或松开提交
// 删除: 选中态下上层键盘事件通知删除（不处理 Backspace 防止编辑时误删）

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import type { IChartApi, ISeriesApi, Time } from 'lightweight-charts';
import '../styles/TextBox.css';

export interface TextBoxData {
  type: number;        // TOOL.TEXTBOX
  t: Time;
  p: number;
  text: string;
}

/** 2026-08-05：文字框 + 其在 DrawingManager.objects 中的下标（统一以 objects 下标为准）。 */
export interface TextBoxEntry {
  box: TextBoxData;
  index: number;
}

interface Props {
  chart: IChartApi | null;
  series: ISeriesApi<any> | null;
  textBoxes: TextBoxEntry[];
  selectedIndex: number | null;        // 由上层控制
  editingIndex: number | null;          // 由上层控制
  onSelect: (index: number | null) => void;
  onRequestEdit: (index: number) => void;
  onCommit: (index: number, text: string) => void;
  onMove: (index: number, time: Time, price: number) => void;
  placeholder: string;
  /** 2026-09-01：移动端全局显隐开关。false 时整层 display:none（与 canvas 画线同步）。默认 true。 */
  visible?: boolean;
}

const DRAG_THRESHOLD = 3; // px

export default function TextBoxLayer(props: Props) {
  const {
    chart, series, textBoxes,
    selectedIndex, editingIndex,
    onSelect, onRequestEdit, onCommit, onMove,
    placeholder,
  } = props;

  // 记录每个文字框的 DOM ref（用于 contentEditable 直接操作）
  const contentRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  // 拖动状态：startClientX/Y 是按下时的 viewport 坐标；grabOffsetX/Y 是 anchor(viewport)
  // 与按下点的偏移，用于让文字框整体平移时不漂。
  const dragState = useRef<{
    index: number;
    startClientX: number;
    startClientY: number;
    grabOffsetX: number;
    grabOffsetY: number;
    moved: boolean;
  } | null>(null);
  // 跟踪位置版本号，缩放/平移时触发重算
  const [positionTick, setPositionTick] = useState(0);
  // 当前位置缓存 (key=index → { left, top })
  const [positions, setPositions] = useState<Map<number, { left: number; top: number; visible: boolean }>>(new Map());

  // 订阅图表缩放/平移，重算位置
  useEffect(() => {
    if (!chart) return;
    let raf = 0;
    const bump = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        setPositionTick((t) => (t + 1) | 0);
      });
    };
    // lightweight-charts v5 的 subscribe* 返回 void，整图销毁时会自动解绑
    chart.timeScale().subscribeVisibleTimeRangeChange(bump);
    chart.timeScale().subscribeVisibleLogicalRangeChange(bump);
    // 兜底: 任何重绘都触发一次
    const onResize = () => bump();
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [chart]);

  // 重算每个文字框的屏幕位置
  useEffect(() => {
    if (!chart || !series) {
      setPositions(new Map());
      return;
    }
    const ts = chart.timeScale();
    const next = new Map<number, { left: number; top: number; visible: boolean }>();
    textBoxes.forEach(({ box, index }) => {
      const x = ts.timeToCoordinate(box.t);
      const y = series.priceToCoordinate(box.p);
      if (x === null || y === null) {
        next.set(index, { left: 0, top: 0, visible: false });
      } else {
        next.set(index, { left: x as number, top: y as number, visible: true });
      }
    });
    setPositions(next);
  }, [chart, series, textBoxes, positionTick]);

  // 当某个文字框进入编辑态，确保 DOM 聚焦并把光标移到末尾
  useEffect(() => {
    if (editingIndex == null) return;
    const el = contentRefs.current.get(editingIndex);
    if (el && document.activeElement !== el) {
      el.focus();
      // 把光标移到最后
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  }, [editingIndex]);

  if (!chart || !series) return null;
  // 2026-09-01：移动端全局显隐 — 与 canvas 画线同步切换
  if (props.visible === false) return null;

  return (
    <div
      className="lw-textbox-layer"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',  // 让没字框区域穿透；子元素单独打开
        zIndex: 5,
      }}
    >
      {textBoxes.map(({ box, index }) => {
        const pos = positions.get(index);
        if (!pos || !pos.visible) return null;
        const isSelected = selectedIndex === index;
        const isEditing = editingIndex === index;
        const style: CSSProperties = {
          position: 'absolute',
          left: pos.left,
          top: pos.top,
          pointerEvents: 'auto',
        };
        return (
          <div
            key={index}
            className={
              'lw-textbox'
              + (isSelected ? ' lw-textbox--selected' : '')
              + (isEditing ? ' lw-textbox--editing' : '')
            }
            style={style}
            onPointerDown={(e) => {
              // 左键才处理
              if (e.button !== 0) return;
              e.stopPropagation();
              onSelect(index);
              // 2026-07-29：用 box 的 viewport 位置推算 grab offset，确保抓点不在
              // 左上角时整体拖动不会"漂"。box-sizing:border-box 下 anchor 就在
              // 外边框左上角，所以 boxRect.left/top 就是 anchor viewport x/y。
              const boxRect = e.currentTarget.getBoundingClientRect();
              dragState.current = {
                index,
                startClientX: e.clientX,
                startClientY: e.clientY,
                grabOffsetX: boxRect.left - e.clientX,
                grabOffsetY: boxRect.top  - e.clientY,
                moved: false,
              };
              const target = e.currentTarget;
              target.setPointerCapture(e.pointerId);
            }}
            onPointerMove={(e) => {
              const ds = dragState.current;
              if (!ds || ds.index !== index) return;
              // 阈值：viewport 距离
              if (!ds.moved
                  && Math.hypot(e.clientX - ds.startClientX, e.clientY - ds.startClientY) < DRAG_THRESHOLD) {
                return;
              }
              ds.moved = true;
              if (!chart || !series) return;
              const ts = chart.timeScale();
              // 2026-07-29：viewport → chart 局部坐标；去 +4 (anchor 已在 box 左上角)。
              // layer 与 chart-container 同样 position:absolute; inset:0，
              // 所以 parentElement.getBoundingClientRect() 与 chart-container 一致。
              const layerRect = e.currentTarget.parentElement!.getBoundingClientRect();
              const anchorViewportX = e.clientX + ds.grabOffsetX;
              const anchorViewportY = e.clientY + ds.grabOffsetY;
              const localX = anchorViewportX - layerRect.left;
              const localY = anchorViewportY - layerRect.top;
              const time = ts.coordinateToTime(localX) as Time | null;
              const price = series.coordinateToPrice(localY);
              if (time !== null && price !== null && Number.isFinite(price)) {
                onMove(index, time, price);
              }
            }}
            onPointerUp={(e) => {
              const ds = dragState.current;
              if (!ds || ds.index !== index) return;
              const target = e.currentTarget;
              try { target.releasePointerCapture(e.pointerId); } catch { /* ignore */ }
              const wasMoved = ds.moved;
              dragState.current = null;
              if (!wasMoved) {
                // 单击未拖动 → 进入编辑
                onRequestEdit(index);
              }
            }}
          >
            <div
              ref={(el) => {
                if (el) contentRefs.current.set(index, el);
                else contentRefs.current.delete(index);
              }}
              className="lw-textbox__content"
              contentEditable={isEditing}
              suppressContentEditableWarning
              spellCheck={false}
              onBlur={() => {
                const el = contentRefs.current.get(index);
                if (!el) return;
                onCommit(index, el.innerText.trim());
              }}
              onKeyDown={(e) => {
                // 编辑态禁用 Delete/Backspace 删除自身（由上层控制）
                if (isEditing) {
                  if (e.key === 'Escape') {
                    e.preventDefault();
                    const el = contentRefs.current.get(index);
                    if (el) {
                      el.innerText = box.text;
                      el.blur();
                    }
                    onSelect(null);
                  } else if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    (e.currentTarget as HTMLDivElement).blur();
                  }
                }
              }}
              onClick={(e) => e.stopPropagation()}
              onDoubleClick={(e) => e.stopPropagation()}
              data-placeholder={box.text ? undefined : placeholder}
            >
              {box.text}
            </div>
          </div>
        );
      })}
    </div>
  );
}
