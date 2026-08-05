# 改动记录 — 2026-08-05

> 本文档记录 **实际** 改动的文件、原因、验证方式。
> SVN 仓库的 commit message 应保持简短，详细内容以本文档为准。

---

## 提交一：移动端迭代 — 全屏真正隐藏副图 / PC 主图 2:1 / PC↔移动端快照恢复

### 改了什么

| 文件 | 改动 | 行号（约） |
|------|------|------------|
| `src/components/ChartPanel.tsx` | 全屏隐藏副图改为**移除 pane**（`hideLowerPanesForFullscreen`/`restoreLowerPanesFromCache`），取代 `setStretchFactor(0)` 的 2px 压缩；退出全屏从 `lowerResultsRef` 缓存重建（零网络请求、无闪烁）；4 个异步副图路径（`loadLowerIndicators`/`addLowerPane`/`replaceLowerPane`/`resetLowerPane`）加"全屏中只缓存不建 series"守卫；`loadLowerIndicators` 空数组分支不再提前 return（对账兜底挂载期 lower 竞态）；`applyPaneLayout` 主图权重统一为 2 | 176-181, 197-200, 604-613, 1076-1084, 1186-1197, 1204-1214, 1316-1334, 1399-1410, 1536-1547, 1573-1691 |
| `src/App.tsx` | 进入移动端**强制**"主图 + 默认成交量副图"（PC 已选副图不再带入）；从 PC 切来时快照 chartType/upper/upperParams/lower/lowerParams/tool，切回 PC 恢复 | 16-25, 158-207 |

### 为什么改

移动端迭代 4 项需求（`FXCOR Chart功能需求.md` 2026-08-05 迭代）：

1. **全屏收纳副图不应压成 2px，应真正隐藏**。查证 lightweight-charts v5 源码：pane 高度有硬性下限 `Math.max(计算值, 2)`，`setStretchFactor(0)` 必然残留 2px 细缝，`setHeight(0)` 也会被 clamp，CSS `display:none` 只隐藏元素不回收布局（主图不会撑满）。唯一路径是移除 series → 空 pane 自动删除。缓存 `lowerResultsRef` 保留 `IndicatorResult`，退出全屏直接重建，无需重新请求后端。
2. **PC 主图:副图 1:1 调整为 2:1**（与移动端一致，单副图时主图占 2/3）。
3. **PC 切移动端只保留主图 + 一个默认副图**：旧逻辑只在 lower 为空时补 VOLUME，PC 已选副图会原样带入移动端（F12 下表现为"PC 显示什么移动端就显示什么"——真实行为，非调试假象）。现改为强制重置；切回 PC 时恢复离开前的配置（快照），PC 用户的设置不因临时切换丢失。
4. **刷新后参数重置**：查证无任何持久化（参数仅存 React 内存 state），刷新必然回默认 —— 已满足，无需改动。

### 附带修复：挂载期 lower 竞态

进入移动端时 App 同步提交 `lower=[VOLUME]`，而新挂载的 ChartPanel 大 effect 用**挂载时闭包的旧 lower** 调 `loadLowerIndicators`，变化落在 `lowerInitializedRef=false` 窗口被 `[lower]` effect 吞掉，副图永不加载。修复：`loadLowerIndicators` 空数组分支不再提前 return，走到末尾对账逻辑按 `liveSelectionRef.current.lower` 补 `addLowerPane`。

### 怎么验证

1. `npm run build`（`tsc -b && vite build`）：通过。
2. Headless Chrome + CDP 自动化（`.zcode/tmp/cdp-verify.mjs`，9/9 通过）：
   - PC 选 MACD 副图 → 主图:副图 = 470:235 = **2.00**。
   - 切移动端（touch emulation，`pointer: coarse`）→ 只剩主图 + 成交量副图（469:234 = 2.00）。
   - 切回 PC → **MACD 副图恢复**（快照生效）。
   - 移动端设置面板选 MACD + 套用 → 副图变 MACD；**刷新后重置为默认成交量**。
3. 全屏 hide/restore：headless 拒绝 `requestFullscreen`（Permissions check failed），**需真机/F12 验证**：
   - 移动端横屏/点图表进入全屏 → 副图 pane 完全消失（无 2px 细缝），主图占满 100%；
   - 退出全屏 → 副图从缓存无损恢复（无 loading、无闪烁）。

### 仓库 commit message（短）

```
FEATURE: 移动端迭代 — 全屏真正隐藏副图 / PC 主图 2:1 / PC↔移动端快照恢复
```
