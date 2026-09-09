# 前端代码分阶段阅读路线

> 适用对象：首次接触 FORFX_CHART 前端代码的开发者 / AI 助手。
> 阅读策略：**先骨架后细节**，每阶段都列出「读哪些文件、关注什么、读完后能回答什么问题」。
> 与 `frontend/knowledge/前端项目规范.md` 配合使用 —— 那个文件是行为准则，本文是地图。

---

## 项目一句话总结

基于 **React 18 + TypeScript + Vite + lightweight-charts** 的单页外汇图表应用，后端是 Spring Boot。
前端**没有**路由、状态管理库、CSS-in-JS —— 所有跨组件协调靠 **React Context (i18n)** + **window CustomEvent 命令总线** + **`useRef` 镜像**完成。
PC / Mobile 两套 UI 在 `App.tsx` 用 `useIsMobile()` 分流，但图表核心（`ChartPanel` + 所有 hooks）共享。

---

## 阶段 1：项目骨架（5 个文件，约 15 分钟）

读完即可知道「项目是怎么搭起来的、从哪里启动」。

| 文件 | 关注点 |
|---|---|
| `frontend/package.json` | 依赖清单（React 18.3、antd 5.29、lightweight-charts 5.0、axios 1.7）、npm scripts（dev / build / preview） |
| `frontend/vite.config.ts` | dev 端口 **23720**、preview **23722**、代理 `/api` 与 `/ws` → `127.0.0.1:23719`（后端 Spring Boot） |
| `frontend/index.html` | `lang="zh"`、`viewport-fit=cover`（为 iPhone 缺口设计，假定嵌入 iframe） |
| `frontend/src/main.tsx` | `ReactDOM.createRoot` + `StrictMode` + 引入 `styles/main.css` |
| `frontend/src/App.tsx` | **只看头部 ~100 行**：`isMobile` 判定、i18n Provider、全局状态声明（`code` / `interval` / `chartType` / `upper` / `lower[]` / `tool`） |

### 阶段 1 自检问题

1. PC 端开发时浏览器应填哪个端口？后端期望哪个端口？
2. 前端用什么打包工具？为什么没用 webpack？
3. PC 和 Mobile 的入口分别是什么？在哪里切换？
5. 全局状态放在哪里（Redux? Context? 本地 state?）

---

## 阶段 2：数据通道（4 个文件，约 20 分钟）

读完即可知道「前端怎么和后端对话、领域模型长什么样」。

| 文件 | 关注点 |
|---|---|
| `frontend/src/api/client.ts` | axios 实例 + 两个 API 命名空间：`marketApi`（`/api/meta/instruments`、`/api/bars`、`/api/support-resist`）和 `indicatorApi`（`/api/indicators`） |
| `frontend/src/realtime/MarketSocket.ts` | 单例 WebSocket 封装（`/ws/market`），指数退避重连（max 30s）、HEARTBEAT/PONG 心跳、SUBSCRIBE/UNSUBSCRIBE |
| `frontend/src/types/index.ts` | **协议枚举单一来源**：`CHART_TYPE`（0/4/8）、`INTERVAL`（0..10）、`UPPER_TECH`（0..8）、`LOWER_TECH`（0..16）；领域 POJO：`Bar`、`Instrument`、`IndicatorResult`、`RealtimeBarMessage` 等 |
| `frontend/src/constants/chart.ts` + `indicatorParams.ts` | i18n key 映射、bar spacing、长按阈值；每个指标的参数个数 + 默认值 + helpers（`defaultParamsFor` / `formatIndicatorParams` / `isDefaultParams`） |

### 阶段 2 自检问题

1. K 线 REST 接口路径是什么？参数有哪些？
2. 实时推送用 WebSocket 哪些消息类型？心跳机制怎么工作？
3. 后端 `IndicatorController` 的 `pane+type` 数字组合在前端对应哪里查表？
4. 改一个指标的默认参数（比如 SMA 周期从 14 改成 20）应该改哪个文件？

---

## 阶段 3：图表核心（5 个文件，约 30 分钟）

读完即可知道「K 线、上层副图、下层副图是怎么画出来的」。

| 文件 | 关注点 |
|---|---|
| `frontend/src/components/ChartPanel.tsx` | **总编排**：挂载 5 个 hook，渲染 6 个 overlay 组件，向上接 `App` 的全局状态 |
| `frontend/src/hooks/useChartInit.ts` | `createChart` + `mainSeries`（按 `chartType` 选 CandlestickSeries / 自定义 ProsticksPrimitive）+ 挂载 `DrawingManager` |
| `frontend/src/hooks/useOverlayIndicator.ts` | 上层副图加载：普通 → `LineSeries`，**Ichimoku（ID=8）→ 自定义 `IchimokuPrimitive` 画云** |
| `frontend/src/hooks/useLowerPanes.ts` | 下层副图编排：纯函数委托给 `utils/lowerPaneOps.ts`，管理 loading/error/paneTops 状态 |
| `frontend/src/utils/lowerPaneOps.ts` | 4 个纯函数：`loadLowerIndicators` / `addLowerPane` / `replaceLowerPane` / `removeLowerPane`（接收 `LowerPaneOpsDeps` 聚合依赖，便于复用） |

### 阶段 3 自检问题

1. `ChartPanel` 为什么把图表初始化逻辑全部外包给 hook？好在哪？
2. Prosticks 图表和普通 K 线图在渲染层有什么区别？
3. 一目均衡图的云层用什么方案实现？为什么不用 lightweight-charts 内置系列？
4. 下层副图加载的纯函数设计有什么好处？

---

## 阶段 4：交互层（按 PC / Mobile 二选一，约 25 分钟）

读完即可知道「UI 控件怎么改全局状态、怎么和图表交互」。

### PC 线（推荐先看）

| 文件 | 关注点 |
|---|---|
| `frontend/src/components/Toolbar.tsx` | 顶部 7 个下拉（品种/周期/图表类型/上层副图/下层副图/画线工具）+ 缩放/撤销/清空/导出/刷新/语言按钮 |
| `frontend/src/components/TextBoxLayer.tsx` | 文本框覆盖层：绝对定位 `<div>`、拖拽、编辑、删除 |
| `frontend/src/hooks/useCanvasCrosshair.ts` | 触屏长按十字线（1.3s 自动消失）+ OHLC info overlay |
| `frontend/src/hooks/useChartCommandBus.ts` | window 事件总线监听：`chart:undo` / `chart:clear-all` / `chart:cancel-drawing` / `chart:cancel-pending-drawing` |

### Mobile 线

| 文件 | 关注点 |
|---|---|
| `frontend/src/mobile/MobileLayout.tsx` | 顶层组合：TopBar + Tabs + Chart + 抽屉/底部表单 |
| `frontend/src/mobile/MobileShell.tsx` | antd `ConfigProvider`（CSS variable 主题）+ locale provider |
| `frontend/src/mobile/MobileTopBar.tsx` | 44px 头部：返回 + 品种名 + 语言 pills + 刷新 |
| `frontend/src/mobile/MobileTabs.tsx` | 三 Tab（详情/委托/预警）；后两个默认 disabled |
| `frontend/src/mobile/MobileDropdownSheet.tsx` | 底部抽屉选择器（antd Drawer） |
| `frontend/src/mobile/MobileSettingsPanel.tsx` | 指标参数设置：动态生成输入框 + Reset/Apply |
| `frontend/src/mobile/MobileDrawingDrawer.tsx` | 右侧抽屉：5 种画线工具 + 删除/隐藏/完成 |
| `frontend/src/mobile/MobileDrawOverlays.tsx` | 画线步骤提示气泡 + 删除 FAB |
| `frontend/src/hooks/useChartDrawInteraction.ts` | 触屏 tap/drag 锚点绘制：state machine + 步骤提示生成 |
| `frontend/src/hooks/useMobileDrawingSession.ts` | 抽屉/session 状态机（toggleDrawer / setTool / finishDrawing） |
| `frontend/src/hooks/useLandscapeFullscreen.ts` | 原生 Fullscreen API + `screen.orientation.lock('landscape')` |

### 阶段 4 自检问题

1. Toolbar 改了一个下拉选择，怎么把状态传到 ChartPanel？（提示：状态提升到 App.tsx）
2. 移动端切到 PC 时，原来 PC 的副图配置为什么没丢？（提示：PcSnapshot）
3. 触屏长按十字线是怎么实现的？为什么 PC 不需要？
4. antd 的语言包怎么跟前端自研 i18n 协同工作？

---

## 阶段 5：画线引擎（深入，约 40 分钟）

读完即可知道「画线工具、状态机、订阅 API 是怎么工作的」。

| 文件 | 关注点 |
|---|---|
| `frontend/src/drawing/tools.ts` | `TOOL` 枚举（0..11）、`TOOLS` 数组（下拉配置）、`FIB_RE_RATIOS` / `FIB_PR_RATIOS`、`MAX_PER_TYPE=5`、`COLORS` 调色板 |
| `frontend/src/drawing/DrawingManager.ts` | **约 1450 行** —— `ISeriesPrimitive<Time>` 实现。核心是 click-stage 状态机 + 渲染器 + hit-testing + 锚点拖拽 + 订阅 API |
| `frontend/src/components/TextBoxLayer.tsx` | 通过 `subscribeTextBoxesChanged()` 同步文本框 → React state（唯一一个订阅者） |

### 阶段 5 自检问题

1. 一条趋势线从开始画到结束的 click-stage 状态机有几个阶段？
2. 为什么 `DrawingManager` 要自己实现 hit-testing？lightweight-charts 不提供吗？
3. 撤销（undo）和清空（clear-all）的区别是什么？
4. 文本框为什么不放在 `DrawingManager` 内部渲染，而要 React 层订阅后覆盖一层 `<div>`？

---

## 全局地图（看完 5 阶段后回看）

```
┌──────────────────────────────────────────────────────────────┐
│ App.tsx  ─── 全局状态（code / interval / chartType / upper / │
│             lower[] / tool / params / lang）                  │
└──────┬──────────────────────────────────────────┬─────────────┘
       │ PC 分支                                  │ Mobile 分支
       ▼                                          ▼
┌──────────────────┐                    ┌────────────────────┐
│ Toolbar          │                    │ MobileLayout       │
│ ChartPanel ──────┼── hooks ──┐        │ ├─ MobileTopBar    │
│                  │           │        │ ├─ MobileTabs      │
└──────────────────┘           │        │ ├─ MobileDrawingDrawer│
                               │        │ └─ MobileSettingsPanel│
                               │        └─────────┬──────────┘
                                         hooks ────┤
                                                 ▼
                                ┌────────────────────────────┐
                                │ ChartPanel（共享）          │
                                │ ├─ useChartInit            │
                                │ ├─ useOverlayIndicator     │
                                │ ├─ useLowerPanes           │
                                │ ├─ useRealtimeData         │
                                │ ├─ useChartCommandBus      │
                                │ └─ useCanvasCrosshair      │
                                └─────────┬──────────────────┘
                                          ▼
                                ┌────────────────────────────┐
                                │ lightweight-charts          │
                                │ + ProsticksPrimitive       │
                                │ + IchimokuPrimitive        │
                                │ + DrawingManager           │
                                └────────────────────────────┘
```

---

## 推荐阅读顺序（实测）

| 顺序 | 文件 | 目的 |
|---|---|---|
| 1 | `package.json` → `vite.config.ts` | 知道怎么跑、端口是什么 |
| 2 | `App.tsx` 头部 100 行 | 知道全局状态、PC/Mobile 分流点 |
| 3 | `api/client.ts` + `types/index.ts` | 知道后端协议数字含义 |
| 4 | `components/ChartPanel.tsx` | 知道图表怎么挂在 hook 上 |
| 5 | `hooks/useChartInit.ts` → `useOverlayIndicator.ts` → `useLowerPanes.ts` | 知道图表怎么画、指标怎么挂 |
| 6 | PC：`Toolbar.tsx`；Mobile：`MobileLayout.tsx` → `MobileTopBar.tsx` | 知道 UI 怎么调状态 |
| 7 | `realtime/MarketSocket.ts` + `useRealtimeData.ts` | 知道实时推送怎么流转 |
| 8 | `drawing/tools.ts` → `drawing/DrawingManager.ts` | 画线引擎（按需深入） |

> **遇到算法改动先停**：SMA / EMA / Bollinger / SAR / Ichimoku 的算法禁止动 —— 见 `frontend/knowledge/前端项目规范.md`。

---

## 配套文档索引

- **后端导读**：`backend/BACKEND_GUIDE.md`
- **协议权威源**：`TECH.md`
- **变更日志**：`docs/changelogs/`
- **部署文档**：`docs/deployment/`
- **AI 行为规范**：`frontend/knowledge/前端项目规范.md`（**最高优先级**）