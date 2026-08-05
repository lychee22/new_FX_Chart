# 改动记录 — 2026-08-04

> 本文档记录 **实际** 改动的文件、原因、验证方式。
> SVN 仓库的 commit message 应保持简短，详细内容以本文档为准。

---

## 提交一：FEATURE 移动端点击进入横屏观看模式

### 改了什么

| 文件 | 改动 | 行号（约） |
|------|------|------------|
| `src/mobile/MobileLayout.tsx` | 新增全屏/横屏辅助（webkit 前缀回退 + `isFullscreenElement`）；`enterLandscape`/`exitLandscape`/`toggleFullscreen`；`fullscreenchange`+`webkitfullscreenchange` 双监听；图表区轻点进入横屏（pointer 位移阈值 + 工具/浮层/sheet 守卫）；全屏时浮动退出按钮 | 29-56, 185-276, 336-410 |
| `src/styles/main.css` | `.mobile-landscape-exit` 浮动退出按钮样式 + 全屏时 `.tools-hint` 右移 | 648-681 |
| `src/i18n/index.ts` | 新增 `ExitFullscreen` key（en/tc/sc） | 47, 79, 111 |

### 为什么改

需求文档 `FXCOR Chart功能需求.md` 2026-08-03~08-07 里程碑：**支持点击进入横屏观看模式**。

- 原有顶部栏全屏按钮仅调用 `requestFullscreen`，无方向处理、无"点击图表进入"。
- 本改动：轻点图表空白处进入全屏 + 尽力 `screen.orientation.lock('landscape')`。
- 关键约束：应用运行在宿主 iframe 内，`screen.orientation.lock` 在 iframe/iOS Safari 中不可用 → **尽力而为、优雅降级**为竖屏全屏。
- 全屏时 TopBar/工具栏/免责声明隐藏，提供浮动退出按钮 + 系统手势（下滑/Esc）退出。

### 怎么验证

1. `npm run build`（`tsc -b && vite build`）：通过。
2. Headless Chrome (390x844, CDP 驱动)：
   - 轻点图表主体 → `requestFullscreen` 被调用（探测确认；headless 下系统拒绝 "Permissions check failed"，代码 catch 静默降级，符合设计）。
   - 150px 横向拖动（平移 K 线）→ 不进入全屏（8px 阈值生效）。
   - 打开周期 sheet 后轻点图表 → 不进入全屏；关闭 sheet 后轻点 → 正常进入。
   - 初始化种子 `isFullscreenElement()` + 双监听无异常。
3. 真机 Android Chrome：轻点 → 全屏 + 设备旋转横屏（顶层 lock）；iOS Safari：轻点 → 全屏（无 lock，手动旋转）。系统退出后布局复位（fullscreenchange 驱动）。

### 仓库 commit message（短）

```
FEATURE: 移动端点击进入横屏观看模式
```
