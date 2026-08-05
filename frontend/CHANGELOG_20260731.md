# 改动记录 — 2026-07-31

> 本文档记录 **实际** 改动的文件、原因、验证方式。
> SVN 仓库的 commit message 应保持简短，详细内容以本文档为准。

---

## 提交一：FIX HMR 后主图空白 + 副图误触发绘图

### 改了什么

| 文件 | 改动 | 行号（约） |
|------|------|------------|
| `src/components/ChartPanel.tsx` | init useEffect cleanup 补全：显式 detach 三个 primitive + 重置所有遗漏 ref | 230-258 |
| `src/components/ChartPanel.tsx` | renderMainSeries 顶部改为显式 `detachPrimitive` 后再 `removeSeries` | 411-434 |
| `src/components/ChartPanel.tsx` | `__chartZoom` effect 加 cleanup | 902-905 |
| `src/components/ChartPanel.tsx` | `handleChartClick` 顶部加 `param.paneIndex !== 0` 早返 | 795 |

### 为什么改

**问题 1：HMR 后主图空白但副图正常**
- 现象：编辑保存 `ChartPanel.tsx` 后主图区域空白，副图正常显示。
- 根因：`init useEffect(..., [])` 的 cleanup 函数不完整——只 `chart.remove()` + 重置 `drawingMgrRef` / `chartRef`，漏掉了 `mainSeriesRef` / `prosticksPrimRef` / `ichimokuPrimRef` / `paneSeriesMapRef` / `barsRef` / `lowerResultsRef` / `overlaySeriesRef`。
- 后果：HMR 重新挂载后 `mainSeriesRef.current` 仍指向已被 `chart.remove()` 销毁的旧 series 悬挂指针 → `renderMainSeries` 调 `chart.removeSeries(悬挂指针)` 抛错 → 后续 `addSeries` / `setData` 全部跳过 → 主图无 series 即空白。
- 副图未受影响：`paneSeriesMapRef.current = new Map()` 在 init effect 重跑时被重置，`loadLowerIndicators` 走新 Map 清理路径不报错。
- 修复：cleanup 中先从 main series 显式 `detachPrimitive` 三个 primitive（prosticks / ichimoku / drawingMgr），`chart.remove()` 之后完整重置所有 ref + `delete window.__chartZoom`。

**问题 2：副图点击触发主图绘图的"鬼线"**
- 现象：开启副图后选绘图工具，在副图区域点击会同步主图展开"鬼线"。
- 根因：`handleChartClick` 未读 `MouseEventParams.paneIndex`。副图点击时 `param.time` 仍正确（time scale 全 chart 共享），但 `getMousePrice` 用 `mainSeriesRef.current.coordinateToPrice(param.point.y)` 把副图**绝对 Y 坐标**按主图 series 价格轴映射成**错误价格** → 时间对、价格错 → 主图画出鬼线。
- 修复：在 `handleChartClick` 顶部加 `if (param.paneIndex === undefined || param.paneIndex !== 0) return;`，严格按 TradingView 规范——绘图工具只绑定主图。

### 怎么验证

1. 启动 `npm run dev`，初始页面主图 + 副图正常显示。
2. 修改 `ChartPanel.tsx` 加一行注释保存 → HMR 触发 → 主图**保持显示**。
3. 修改 `ChartPanel.tsx` 加一个 `useState` 保存 → Fast Refresh 强制重挂载 → 主图**保持显示**。
4. 选 trendline 工具，**在副图任意点击** → 鼠标保持空闲，无 ghost point。
5. **在主图点击两次** → 仍正常画出 trendline。
6. 切 chartType / 重排副图后再测 3-4。

### 仓库 commit message（短）

```
FIX: 修复 HMR 后主图空白 + 副图点击触发主图鬼线
```

---

## 提交二：REFACTOR 工具下拉框瘦身 + 独立"清除所有"按钮

### 改了什么

| 文件 | 改动 |
|------|------|
| `src/drawing/tools.ts` | TOOLS 数组移除 5 个 `CLEAR_*` 项；TOOL.* 常量本身保留 |
| `src/drawing/DrawingManager.ts` | 新增 `clearAllDrawings(): boolean` — 清空 objects + 重置 pending 状态 + 通知 TextBox 订阅者 |
| `src/components/ChartPanel.tsx` | 新增 `chart:clear-all` CustomEvent 监听 + 初始 `registerCanClear(false)` + 状态同步 effect；props 新增 `onClearAll` / `registerCanClear` |
| `src/components/Toolbar.tsx` | 工具下拉框旁新增 🧹 按钮；props 新增 `canClear` / `onClearAll`；复用现有 i18n key `ClearAll` |
| `src/App.tsx` | 新增 `canClear` state + `registerCanClear` + `onClearAll` callback（dispatch CustomEvent）；透传给 Toolbar / ChartPanel / MobileLayout |
| `src/mobile/MobileLayout.tsx` | MobileLayoutProps 新增三个字段 + 透传到内部 ChartPanel（移动端 toolOptions 之前就手写硬编码无 CLEAR_*，无需改） |
| `src/styles/main.css` | 新增 `.icon-btn:disabled` 样式（灰色 0.4 透明度 + not-allowed cursor） |

### 为什么改

- 原工具下拉框塞了 12 项，5 个绘制工具 + 5 个"清除…"子项 + NONE + 1 个平行通道——清除动作混在工具下拉里不符合常规 UX。
- 改为：下拉框只剩 5 个绘制工具；清除动作独立成工具栏旁的 🧹 "清除所有" 按钮，无对象时 `disabled`，避免误点。
- 状态同步走 `chart:clear-all` CustomEvent 解耦 App/Toolbar 与 ChartPanel（与现有 `chart:undo` 模式一致）。
- `canClear` 与 `canUndo` 共享 `mgr.canUndo()` 来源（`objects.length > 0`）。

### 怎么验证

1. 启动 `npm run dev` → 工具下拉只剩 7 项（"工具" + 6 个绘制工具），无 "Clear Last Line" 等。
2. 不画任何对象 → 🧹 按钮 disabled（灰色 0.4 透明度，鼠标 not-allowed）。
3. 画 1 个 trendline → 🧹 按钮 enabled。
4. 点击 🧹 → 所有对象清空，按钮重新 disabled。
5. 画 3 个对象 → 只能通过 Ctrl+Z 单步撤销 3 次回到空状态。
6. 移动端：props 透传不影响行为（移动端 UI 上 🧹 按钮 v1 不渲染）。
7. `npx tsc -b` exit 0。

### 仓库 commit message（短）

```
REFACTOR: 工具下拉框瘦身 + 独立清除所有按钮
```

---

## 不改的部分

- `ProsticksPrimitive.ts` / `IchimokuPrimitive.ts` — 之前 HMR 修复把它们列为"不改"，但 init cleanup 改动后 detached 路径已完整。
- `vite.config.ts`、构建配置。
- 现有 `Ctrl+Z` 撤销 / 文字框 Delete 删除 / 副图操作按钮行为完全保留。
- 移动端布局：MobileLayout 自身 toolOptions 之前就手写硬编码（不含 CLEAR_*），无需改 UI。

## 暂未实现（后续 v2）

- 单击已绘制对象出现 × 关闭按钮删除
- "清除选中"按钮
- 画线细分（水平线 / 画笔等）
- 画线对象拖动调整锚点
- 自动吸附

## 涉及文件清单（本次会话累计）

```
src/drawing/tools.ts
src/drawing/DrawingManager.ts
src/components/ChartPanel.tsx
src/components/Toolbar.tsx
src/App.tsx
src/mobile/MobileLayout.tsx
src/styles/main.css
```

仅前端 7 个文件，无后端 / 协议 / 配置文件变更。
