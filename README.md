# Prosticks 外汇图表系统 (前后端分离重构版)

重构自旧版静态 Prosticks 外汇图表 (`chart/` 目录),升级为 **Java 后端 + React 前端** 的前后端分离架构。
完整对标旧系统的全部图表功能,并新增在线 API 文档与在线调用能力。

> 旧系统保留在 `chart/` 目录作为参考,新版代码在 `backend/` 与 `frontend/`。

---

## 一、技术栈 (全部开源免费)

| 层 | 技术 | 版本 | 许可证 | 用途 |
|---|---|---|---|---|
| **后端** | Spring Boot | 3.2.5 / Java 17+ | Apache-2.0 | REST API 服务 |
| **API 文档** | springdoc-openapi (Swagger UI) | 2.3.0 | Apache-2.0 | 在线接口文档 + 在线调用 |
| **前端框架** | React + ReactDOM | 18.3.1 | MIT | SPA 单页应用 |
| **构建工具** | Vite + `@vitejs/plugin-react` + TypeScript | 5.3.3 / 4.3.1 / 5.5.3 | MIT | 前端构建 (strict mode) |
| **图表引擎** | TradingView Lightweight Charts | 5.0.0 | Apache-2.0 | 金融 K 线图表 + 自定义 Primitive |
| **移动端 UI** | antd + `@ant-design/icons` | 5.29.3 / 5.6.1 | MIT | 移动端外壳 / 抽屉 / 底部栏 |
| **HTTP** | axios | 1.7.2 | MIT | 前后端 REST 通信 |
| **实时通道** | 原生 WebSocket | - | - | /ws/market 行情与指标推送 |

---

## 二、快速启动

### 前置要求
- Java 17+ (推荐 21)
- Maven 3.6+
- Node.js 18+

### 1. 启动后端 (仅本机 127.0.0.1:23723)

```bash
cd backend
mvn spring-boot:run
```

启动后访问:
- **Swagger UI (在线文档 + 在线调用):** http://127.0.0.1:23723/swagger-ui.html
- OpenAPI JSON: http://127.0.0.1:23723/v3/api-docs

### 2. 启动前端 (对外端口 23722)

```bash
cd frontend
npm install      # 首次需要
npm run dev
```

启动后访问: http://localhost:23722

> Vite 已配置代理，自动把 `/api` 和 `/ws` 转发到本机后端 23723，外部只需访问 23722。
> dev/preview 端口已锁定为 23722（`strictPort: true`），被占用时会立即报错，保证 Linux 部署行为一致。

---

## 三、对标旧系统功能清单 (全部覆盖)

| 功能 | 旧系统 | 新系统实现 |
|---|---|---|
| 品种 | 34 个外汇/贵金属 | ✅ 后端 `GET /api/meta/instruments` |
| 时间周期 | 11 种 (1分~月) | ✅ 工具栏下拉 |
| 图表类型 | 6 种 | ✅ Candlestick / Bar / Line / Area 原生 + Prosticks/Bar&Modal/ModalLine 自定义 Primitive |
| **Prosticks 模态点** | 红色圆点 | ✅ `ProsticksPrimitive` |
| **Prosticks 活跃区** | vap/vam 矩形 | ✅ `ProsticksPrimitive` |
| **Prosticks 极端尾** | ut/lt 蓝色粗线 | ✅ `ProsticksPrimitive` |
| 叠加指标 | 8 种 | ✅ SMA/EMA/WMA/Bollinger/SAR/Ichimoku/MAE/KC |
| 副图指标 | 16 种 | ✅ Volume/RSI/MACD/Stochastic/Momentum/%R/OBV/MC/ROC/ADX/MFI/Vola/Volume+/VAO/CCI/ATR |
| 十字光标 | 实时 OHLC 读数 | ✅ Lightweight Charts 内置 + 信息浮层 |
| 缩放/平移 | 按钮 + 鼠标 | ✅ 工具栏按钮 + 滚轮/拖拽 |
| 导出图片 | PNG 导出 | ✅ `chart.takeScreenshot()` |
| 绘图工具 | 11 项 | ✅ 趋势线/平行线/斐波那契回调/斐波那契投影/文本框 + 各类清除 |
| 国际化 | en/tc/sc 三语 | ✅ React Context + 语言切换 |
| 支撑/阻力 | supportresistnew.asp | ✅ `GET /api/support-resist` |
| **响应式移动端** | 无 | ✅ `src/mobile/` 完整布局 + `useIsMobile` 768px 断点 (antd 5) |
| **实时 WebSocket 推送** | 无 | ✅ `src/realtime/MarketSocket.ts` 单连接 + 心跳 + 指数退避重连 |
| **可配置区域配色** | 写死黑/白 | ✅ `src/constants/nation.ts` 3 套 (单色 / 国际绿涨 / 港台红涨) |
| **文本框注释图层** | 原生 Canvas | ✅ `TextBoxLayer.tsx` React 叠加层 (拖拽 / 选中 / 键盘删除) |

---

## 四、后端 API 接口文档

所有接口均可在 **Swagger UI** (http://127.0.0.1:23723/swagger-ui.html) 在线查看与调用测试。

### 4.1 元数据

| 方法 | 路径 | 参数 | 说明 |
|---|---|---|---|
| GET | `/api/meta/instruments` | - | 34 个品种列表 (代码/名称/小数位/参考价/波动率) |

### 4.2 行情数据

| 方法 | 路径 | 参数 | 说明 |
|---|---|---|---|
| GET | `/api/bars` | `code`(必), `interval`, `count`, `shift` | K 线序列 (OHLC + Prosticks 模态字段) |
| GET | `/api/support-resist` | `code`(必), `interval` | 支撑/阻力/最新模态点/模态量 |

**K 线字段说明:**
```json
{
  "dt": 202005292059,       // YYYYMMDDHHMM 时间戳
  "o/h/l/c/v": 99.8/.../0,  // 标准 OHLCV
  "mp": 99.41, "mc": 109,   // Prosticks 模态点/模态量
  "vap": 99.37, "vam": 99.02, // 活跃区上下沿
  "ut": 99.88, "lt": 0,     // 上下活跃区阈值 (极端尾)
  "time": 1590771540        // Unix 秒 (Lightweight Charts 用)
}
```

### 4.3 技术指标

| 方法 | 路径 | 参数 | 说明 |
|---|---|---|---|
| GET | `/api/indicators` | `pane`(upper/lower), `type`, `code`, `interval`, `params` | 计算指标, 返回带配色的序列 |

**叠加指标 (`pane=upper`):**
| type | 指标 | 默认参数 |
|---|---|---|
| 1 | SMA | 10, 20, 50 |
| 2 | Bollinger Bands | 20, 2 |
| 3 | EMA | 10, 20, 50 |
| 4 | SAR 抛物线 | 0.02, 0.02, 0.2 |
| 5 | Ichimoku 一目均衡 | 7, 22, 44 |
| 6 | WMA | 10, 20, 50 |
| 7 | MAE 移动平均包络 | 20, 5 |
| 8 | KC Keltner Channel | 10 |

**副图指标 (`pane=lower`):**
| type | 指标 | 默认参数 | 参考线 |
|---|---|---|---|
| 1 | Volume | - | - |
| 2 | RSI | 14 | 30/50/70 |
| 3 | MACD | 12, 26, 9 | - |
| 4 | Stochastic | 14, 3, 3 | 20/80 |
| 5 | Momentum | 10 | - |
| 6 | Williams %R | 10 | -20/-80 |
| 7 | OBV | - | - |
| 8 | Modal Count | 300 | Avg |
| 9 | ROC | 14 | - |
| 10 | ADX | 14 | 30 |
| 11 | MFI | 14 | - |
| 12 | Volatility | 10 | - |
| 13 | Volume+ | - | - |
| 14 | VAO | 10 | - |
| 15 | CCI | 5 | ±100 |
| 16 | ATR | 14 | - |

**返回示例 (RSI):**
```json
{
  "id": "RSI",
  "name": "RSI",
  "pane": "pane",
  "series": [
    { "name": "RSI(14)", "color": "#0000FF",
      "data": [{"time": 1554618900, "value": null}, {"time": 1555828500, "value": 58.69}] }
  ],
  "levels": [
    {"label": "Overbought", "value": 70, "color": "#FF0000"},
    {"label": "Oversold", "value": 30, "color": "#00A000"}
  ]
}
```

### 4.4 实时行情 WebSocket

| 端点 | 协议 | 说明 |
|---|---|---|
| `/ws/market` | WebSocket | 单连接推送 BAR / INDICATORS 增量与心跳 |

**客户端订阅消息:**
```json
{ "op": "SUBSCRIBE",   "code": "EURUSD", "interval": "M5" }
{ "op": "UNSUBSCRIBE", "code": "EURUSD", "interval": "M5" }
```

**服务端推送消息类型:**
| type | 类型 | 说明 |
|---|---|---|
| `BAR` | 行情 | 最新 K 线 (含 Prosticks 模态字段) 增量推送 |
| `INDICATORS` | 指标 | `(指标类型 + 最后一个有效点)` 增量, 减少重复计算 |
| `HEARTBEAT` | 心跳 | 服务端定时发送, 客户端需回 `PONG` 保持连接 |
| `PONG` | 心跳 | 客户端对心跳的响应 |

> 前端 `src/realtime/MarketSocket.ts` 实现单连接复用、自动重订阅、断线指数退避 (上限 30s)。

---

## 五、架构说明

### 5.1 后端结构

```
backend/src/main/java/com/prosticks/chart/
├── ChartApplication.java          # Spring Boot 入口
├── config/
│   ├── OpenApiConfig.java         # Swagger 文档元信息
│   └── CorsConfig.java            # 跨域配置 (允许前端端口 23722)
├── controller/
│   ├── MetaController.java        # /api/meta/* 元数据
│   ├── MarketController.java      # /api/bars, /api/support-resist
│   └── IndicatorController.java   # /api/indicators
├── service/
│   ├── MarketDataService.java     # 行情数据 + 支撑阻力计算
│   └── InstrumentService.java     # 34 个品种注册表
├── indicator/
│   ├── IndicatorEngine.java       # 24 种指标算法 (Java 移植)
│   └── IndicatorKeyResolver.java  # 指标 ID → 键 消歧
├── model/
│   ├── Bar.java                   # K 线 (含 Prosticks 字段)
│   ├── Instrument.java            # 品种
│   ├── SupportResist.java         # 支撑阻力
│   ├── IndicatorResult.java       # 指标结果
│   └── ChartConstants.java        # 常量 (对齐旧系统)
└── generator/
    └── SampleDataGenerator.java   # 确定性模拟数据生成器
```

**模拟数据生成器** (`SampleDataGenerator`): Java 移植自旧系统 `getSampleData()`。
- 内置 34 个品种的 `[参考价, 年化波动率]` 表
- 每个品种用**固定种子** (品种代码哈希) 做几何随机游走
- 派生 mp/mc/vap/vam/ut/lt 保证 Prosticks 内部一致性
- 同一品种每次生成结果**完全一致** (可复现)

### 5.2 前端结构

```
frontend/src/
├── App.tsx                        # 根组件 (状态 + i18n + 桌面/移动端分支)
├── main.tsx                       # React 18 createRoot 入口
├── api/
│   └── client.ts                  # axios 实例 + marketApi / indicatorApi 封装
├── components/
│   ├── Toolbar.tsx                # 桌面端工具栏 (品种/周期/类型/指标/工具下拉)
│   ├── ChartPanel.tsx             # 图表主面板 (图表生命周期 + 实时更新 + Primitive)
│   ├── TextBoxLayer.tsx           # 文本框注释 React 叠加层
│   └── TextBox.css                # 文本框样式
├── primitives/
│   ├── ProsticksPrimitive.ts      # Prosticks 形态自定义渲染 (模态点/活跃区/极端尾)
│   └── IchimokuPrimitive.ts       # 一目均衡云 + 交叉信号箭头
├── drawing/
│   ├── DrawingManager.ts          # 绘图工具管理 + 渲染 (TrendLine/Parallel/Fib/TextBox)
│   └── tools.ts                   # 工具定义 + 颜色 + 斐波那契比率
├── realtime/
│   └── MarketSocket.ts            # 单连接 WebSocket 客户端 (订阅/心跳/重连)
├── mobile/
│   ├── MobileLayout.tsx           # 移动端整体布局 (顶部栏 + 标签 + 图表 + 交易栏)
│   ├── MobileShell.tsx, MobileTopBar.tsx, MobileTabs.tsx
│   ├── MobileSettingsPanel.tsx, MobileDropdownSheet.tsx, MobileTradeBar.tsx
├── hooks/
│   └── useIsMobile.ts             # matchMedia 768px 响应式断点
├── constants/
│   └── nation.ts                  # 3 套区域配色 (单色 / 国际绿涨 / 港台红涨)
├── theme/
│   └── antdTheme.ts               # antd 主题 tokens + locale 解析
├── i18n/
│   └── index.ts                   # en/tc/sc 三语表 + I18nContext
├── types/
│   └── index.ts                   # TypeScript 类型 (Bar / Instrument / Indicator* 枚举)
└── styles/
    └── main.css                   # 全局样式 + 768px 移动断点
```

### 5.3 Prosticks 专属渲染

Prosticks 是旧系统的核心专有形态。新系统通过 Lightweight Charts v5 的
`ISeriesPrimitive` 接口实现自定义渲染 (`ProsticksPrimitive.ts`):

- **模态点 (Modal Point, mp)**: 最常成交价, 红色 `#FF0000` 实心圆, 重要模态点用紫红 `#FF0080` 放大
- **活跃区 (Active Region)**: vap(上沿) 到 vam(下沿) 的矩形, 上涨柱白色填充, 下跌柱浅蓝 `#B0D0F0`
- **极端尾 (Extreme Tail)**: 高于 ut / 低于 lt 的部分用蓝色 `#0000FF` 粗线表示活跃区外溢

### 5.4 绘图工具

`DrawingManager` 实现完整绘图工具集,所有图形锚定 bar 时间+价格,缩放平移后自动跟随:

- **趋势线**: 两点确定, 射线延伸到右边缘
- **平行线**: 三点定义 (前两点为基线, 第三点为偏移)
- **斐波那契回调**: 两点, 按 `[0.382, 0.5, 0.618, 1.618, 2]` 画水平线 + 价格标签
- **斐波那契投射**: 三点, 按 `[0.618, 1, 1.618]` 投射
- **文本框**: 点击位置弹出输入框, 内容由 `TextBoxLayer` React 叠加层渲染, 支持拖拽 / 选中 / 键盘删除, 与 `DrawingManager` 双向同步
- **清除**: 单个/全部 线/斐波那契/文本框

---

## 六、生产部署

### 后端打包
```bash
cd backend
mvn clean package
java -jar target/forex-chart.jar
```

### 前端打包
```bash
cd frontend
npm run build      # 输出到 dist/
# 用任意静态服务器托管 dist/, 或由后端/ nginx 托管
```

> 正式部署可把前端 `dist/` 交给 Nginx/Caddy 托管，并把 `/api`、`/ws` 反向代理到本机 23723。当前无 Nginx 时可按 `docs/deployment/2026-07-22_linux-deployment.md` 使用 Vite preview 验证效果。
> 修改 `frontend/src/api/client.ts` 的 `baseURL` 为生产后端地址。

---

## 七、与旧系统的差异说明

| 方面 | 旧系统 | 新系统 |
|---|---|---|
| 架构 | 纯静态 HTML + 8000 行单文件 JS | 前后端分离, 模块化 |
| 数据来源 | 内嵌写死 JSON / 注释掉的 AJAX | Java 后端确定性生成, REST API |
| 指标计算 | 前端 JS 实时计算 | 后端 Java 计算, API 返回 |
| 图表引擎 | 自研 Canvas 8000 行 | Lightweight Charts v5 + 自定义 Primitive |
| 实时推送 | 轮询 / 无 | 单连接 WebSocket (`/ws/market`) + 心跳 + 指数退避 |
| 移动端 | 无响应式 | antd 5 完整移动布局 + 768px 断点 + safe-area viewport |
| 字体配色 | 写死 | 3 套区域配色 (constants/nation.ts) 可按地区切换 |
| 文本注释 | 原生 Canvas | `TextBoxLayer` React 叠加层, 与绘图状态双向同步 |
| API 文档 | 无 | Swagger UI 在线文档 + 在线调用 |
| 构建 | 无 (直接打开 HTML) | Vite 构建 + Maven 打包 |

## 许可证

本项目仅包含开源免费依赖。代码本身未指定许可证,可自由使用。
