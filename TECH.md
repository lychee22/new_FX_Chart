# FOREX_CHART 技术接手手册

> 最后核对：2026-07-23 14:51:41 +08:00  
> 适用范围：新项目 `backend/`、`frontend/` 及固定 Linux 部署包 `offline-packages/FOREX_CHART/`。  
> 旧项目 `chart/` 只作为业务行为和显示效果的参考，不参与新项目启动。  
> 当前状态：历史行情和实时逐笔均为模拟数据；尚未接入正式报价源、数据库或外部行情 WebSocket。

## 1. 先看结论

新项目是一个前后端分离的外汇图表系统：

- 前端使用 React、TypeScript 和 Lightweight Charts，负责图表渲染、工具栏、指标副图、绘图工具、手机竖屏和 iframe 交互。
- 后端使用 Spring Boot，负责品种配置、历史 K 线、技术指标计算、支撑阻力以及 WebSocket 实时推送。
- 浏览器只访问前端端口 `23722`；前端服务器将 `/api` 和 `/ws` 代理到同机后端 `127.0.0.1:23723`。
- 页面打开后会自动建立一条 WebSocket；切换品种或周期时，在同一连接中取消旧订阅并订阅新组合。
- 1 分钟、5 分钟、10 分钟等周期都采用相同规则：周期未结束时持续更新最后一根柱，越过自然周期边界后才新增下一根柱。
- “一目均衡图”对应旧项目 Ichimoku，已实现五条线、前移 22 根、绿色网格云层和红蓝交叉信号。
- 当前可演示完整实时效果，但模拟器不是正式报价源。正式上线前必须完成第 10 节的数据源改造和安全加固。

常用入口：

| 用途 | 地址或命令 |
|---|---|
| Windows 前端页面 | `http://127.0.0.1:23722/` |
| Linux 外部访问 | `http://Linux服务器IP:23722/` |
| Swagger UI | `http://127.0.0.1:23723/swagger-ui.html` |
| OpenAPI JSON | `http://127.0.0.1:23723/v3/api-docs` |
| 实时 WebSocket | `ws://当前前端主机/ws/market`，HTTPS 页面自动使用 `wss://` |
| Linux 一键重启 | `cd /chart/FOREX_CHART && ./scripts/restart-all.sh` |

## 2. 项目边界与目录

```text
D:\projects\FOREX_CHART\
├─ backend/                         新后端 Spring Boot 工程
│  ├─ pom.xml
│  ├─ src/main/java/com/prosticks/chart/
│  ├─ src/main/resources/application.yml
│  └─ target/chart-backend-1.0.0.jar
├─ frontend/                        新前端 React/Vite 工程
│  ├─ src/
│  ├─ vite.config.ts
│  ├─ package.json
│  └─ dist/
├─ chart/                           旧 ASP/JavaScript 图表，仅供比对
├─ offline-packages/FOREX_CHART/    Linux 固定目录部署包内容
├─ README.md                        项目概览
├─ ICHIMOKU_ALIGNMENT_20260721.md   一目均衡图对齐记录
├─ MOBILE_IFRAME_ADAPTATION_20260721.md
├─ REALTIME_WEBSOCKET_20260721.md
├─ FIXED_LINUX_DEPLOYMENT_20260722.md
└─ TECH.md                          本文档
```

接手时不要混淆三个边界：

1. `chart/` 是旧项目，不能作为新项目的运行依赖。
2. `backend/`、`frontend/` 是日常开发源码。
3. `offline-packages/FOREX_CHART/` 是已经整理好的 Linux 离线部署目录。修改源码后必须重新构建并重新生成部署包，服务器不会自动获得源码变化。

## 3. 总体架构

```mermaid
flowchart LR
    U["浏览器或父系统 iframe"] -->|"HTTP/WS :23722"| V["Vite 前端服务"]
    V -->|"/api 反向代理"| R["Spring Boot REST :23723"]
    V -->|"/ws 反向代理"| W["Spring WebSocket :23723"]
    R --> M["MarketDataService"]
    R --> I["IndicatorEngine"]
    M --> P{"PriceSource"}
    P --> S["SamplePriceSource 当前启用"]
    P --> H["HttpPriceSource 对接模板"]
    W --> RT["RealtimeMarketService"]
    RT --> A["RealtimeBarAggregator"]
    W --> I
    S -.->|"确定性历史模拟"| M
    RT -.->|"100ms 模拟逐笔"| A
```

重要现实边界：

- `PriceSource` 当前只定义“获取历史 K 线”的 `getBars(...)`，没有定义实时逐笔订阅。
- `RealtimeMarketService` 当前直接生成模拟逐笔，没有经过 `PriceSource`。
- 因此，把 `prosticks.price-source` 改成 `http` 只能替换历史 K 线来源，不会自动把实时数据切换成正式行情。

## 4. 后端技术说明

### 4.1 技术栈与启动入口

| 项目 | 当前配置 |
|---|---|
| Spring Boot | 3.2.5 |
| Java 编译级别 | 17 |
| 推荐运行时 | Java 21；最低 Java 17 |
| REST | `spring-boot-starter-web` |
| WebSocket | `spring-boot-starter-websocket` |
| 参数校验依赖 | `spring-boot-starter-validation`，但控制器当前未系统使用 Bean Validation |
| API 文档 | springdoc OpenAPI 2.3.0 |
| 测试 | JUnit 5 / Spring Boot Test |
| 主类 | `com.prosticks.chart.ChartApplication` |

`ChartApplication` 同时启用：

- Spring Boot 自动配置；
- `@EnableScheduling` 定时任务；
- `PriceSourceProperties` 和 `RealtimeProperties` 配置绑定。

### 4.2 后端包职责

| 包 | 核心类 | 职责 |
|---|---|---|
| `controller` | `MetaController`、`MarketController`、`IndicatorController` | 对外 REST 接口 |
| `service` | `InstrumentService`、`MarketDataService` | 品种校验、代码映射、历史 K 线、支撑阻力 |
| `pricesource` | `PriceSource`、`SamplePriceSource`、`HttpPriceSource` | 历史行情来源抽象及实现 |
| `indicator` | `IndicatorEngine`、`IndicatorKeyResolver` | 24 类指标计算和前端数字 ID 映射 |
| `realtime` | `MarketWebSocketHandler`、`RealtimeMarketService`、`RealtimeBarAggregator` | 订阅、模拟逐笔、K 线聚合、指标增量和心跳 |
| `model` | `Bar`、`Instrument`、`IndicatorResult`、`SupportResist` | REST 和 WebSocket 的共享数据模型 |
| `generator` | `SampleDataGenerator` | 生成可复现的模拟历史数据 |
| `config` | `CorsConfig`、`OpenApiConfig` | REST 跨域和 Swagger 元数据 |

### 4.3 历史 K 线调用链

```mermaid
sequenceDiagram
    participant F as 前端
    participant C as MarketController
    participant M as MarketDataService
    participant I as InstrumentService
    participant P as PriceSource

    F->>C: GET /api/bars?code=JPY&interval=4&count=300&shift=false
    C->>M: getBars(...)
    M->>I: 校验内部 code 并映射 externalSymbol
    I-->>M: JPY -> USDJPY
    M->>P: getBars(USDJPY, 4, 300)
    P-->>M: 从旧到新的 Bar 列表
    opt shift=true
        M->>M: 追加 50 个未来空白 Bar
    end
    M-->>F: JSON Bar[]
```

前端主图实际使用 `shift=false`。只有一目均衡图的指标请求使用 `shift=true`，用于给前移线和未来云层提供时间坐标。

### 4.4 Bar 数据结构

`Bar` 同时兼容普通 OHLCV 和 Prosticks 模态数据：

| 字段 | 类型 | 说明 |
|---|---|---|
| `time` | long | Unix 秒；Lightweight Charts 的主时间字段 |
| `dt` | long | `YYYYMMDDHHMM` 数字格式；模拟历史数据保留旧系统格式 |
| `localtime` | string | 旧系统兼容字段 |
| `o/h/l/c/v` | double | 开、高、低、收、成交量 |
| `mp` | double | Modal Point，模态点/聚焦点 |
| `mc` | int | Modal Count，模态量/聚焦量 |
| `vap/vam` | double | 成交密集区域上沿/下沿 |
| `ut/lt` | double | 上下活跃区阈值/极端尾部阈值 |
| `mclose` | double | `(o+h+l+c)/4` |
| `popen/pclose` | double | Prosticks 衍生值 |
| `impmp` | boolean | 是否为重要模态点 |

正式价源如果只提供 OHLCV，`BarBuilder` 会把 `mp/mc/vap/vam/ut/lt` 置为 `0`。普通蜡烛、均线等仍可显示，但 Prosticks 形态、模态量和基于模态点的能力会退化。

实时新柱当前主要依赖 `time` 和 OHLCV；它的 `dt/localtime` 尚未按真实时间完整回填。前端目前用 `time` 绘图，所以演示不受影响，但正式保存或下游消费前应补齐。

### 4.5 品种配置

品种定义集中在 `backend/src/main/resources/application.yml`：

```yaml
prosticks:
  price-source: sample
  instruments:
    - code: JPY
      name: USD/JPY
      external-symbol: USDJPY
      decimals: 2
      ref-price: 108.5
      annual-vol: 0.08
```

字段含义：

| 字段 | 必需 | 作用 |
|---|---|---|
| `code` | 是 | 系统内部代码，也是 REST/WS 的 `code` |
| `name` | 是 | 工具栏显示名 |
| `external-symbol` | 建议 | 外部报价源代码；未配置时退回 `code` |
| `decimals` | 是 | 前端价格精度和模拟器最小跳动 |
| `ref-price` | sample 使用 | 模拟价格中枢 |
| `annual-vol` | sample 使用 | 模拟波动率 |

当前配置实际有 **35 个**品种。部分旧注释仍写“34 个”，接手时以 YAML 实际条目和 `/api/meta/instruments` 返回为准。

### 4.6 历史价源实现

#### SamplePriceSource

- `prosticks.price-source: sample` 时启用，也是默认值。
- 使用品种和周期生成确定性历史数据，同一输入可复现。
- 历史数据的固定终点是 `2020-05-29 20:59 UTC`；模拟实时行情从该历史末端的下一自然周期继续推进，并不代表当前真实市场时间。
- 不依赖数据库或外部网络，适合开发、演示和回归测试。

#### HttpPriceSource

- `prosticks.price-source: http` 时启用。
- 当前只是通用模板，不是已验证的正式行情适配器。
- 默认识别直接数组，或 `data`、`candles`、`results` 数组。
- 每条数据默认字段为 `t/time`、`o`、`h`、`l`、`c`、`v`；时间支持秒和毫秒。
- API Key 当前通过 URL 查询参数 `apikey` 拼接，没有实现 Header、OAuth、签名或密钥轮换。
- 拉取失败时记录日志并返回空列表，不会把上游错误原样返回给前端。

已知缺口：内部 `10分钟(5)` 和 `2小时(9)` 在 `intervalToApiParam` 中没有显式映射，当前会错误退回 `1day`。正式启用 HTTP 价源前必须按供应商文档补齐全部周期和响应校验。

### 4.7 支撑/阻力

`GET /api/support-resist` 内部读取最近 300 根：

1. 如果超过四分之一的 Bar 有 `mc > 0`，使用模态模式。
2. 模态模式把 `mc` 高于均值的 `mp` 视为重要模态点，最低值为支撑、最高值为阻力。
3. 没有足够模态数据时，退化为最近 60 根有效 Bar 的最低价/最高价。
4. 传统模式下 `latestMP` 实际返回最新收盘价，`averageMC/latestMC` 实际使用成交量。

如果真实价源失败并返回空列表，当前传统算法没有完整的空数据保护。正式接入时应增加明确的上游异常、空数据和 HTTP 状态处理。

### 4.8 指标计算

指标接口用 `pane + type` 消除叠加指标与副图指标的数字 ID 重叠。`params` 是逗号分隔数字；解析失败时不报错，而是回退到默认参数。

叠加指标：

| `type` | 指标 | 默认参数 |
|---:|---|---|
| 0 | 无 | - |
| 1 | SMA | `10,20,50` |
| 2 | Bollinger | `20,2` |
| 3 | EMA | `10,20,50` |
| 4 | SAR | `0.02,0.02,0.2` |
| 5 | Ichimoku / 一目均衡图 | `7,22,44` |
| 6 | WMA | `10,20,50` |
| 7 | MAE | `20,5` |
| 8 | KC | `10` |

副图指标：

| `type` | 指标 | 默认参数 | 当前工具栏可选 |
|---:|---|---|:---:|
| 1 | Volume | - | 是 |
| 2 | RSI | `14` | 是 |
| 3 | MACD | `12,26,9` | 是 |
| 4 | Stochastic | `14,3,3` | 是 |
| 5 | Momentum | `10` | 是 |
| 6 | Williams %R | `10` | 是 |
| 7 | OBV | - | 否 |
| 8 | Modal Count | `300` | 是 |
| 9 | ROC | `14` | 是 |
| 10 | ADX | `14` | 是 |
| 11 | MFI | `14` | 是 |
| 12 | Volatility | `10` | 是 |
| 13 | Volume+ | - | 否 |
| 14 | VAO | `10`，当前算法未实际使用该周期值 | 否 |
| 15 | CCI | `5` | 是 |
| 16 | ATR | `14` | 是 |

后端会返回 RSI、Stochastic、Williams %R、Modal Count、ADX、CCI 等指标的 `levels` 参考水平线；前端当前尚未绘制这些水平线。

只有一目均衡图显式使用 `interval` 决定“日/周/月使用模态值、日内使用 OHLC”。其他价格型指标当前通过数据中 `mp` 的占比推断计算价；模拟数据各周期通常都有 `mp`，因此它们不一定严格遵循旧项目的日内/日线切换口径。若后续要求所有指标逐项与旧系统一致，需要分别核对并改成明确的周期规则。

#### 一目均衡图的旧图对齐规则

- 默认参数固定为 `[7,22,44]`。
- 日、周、月使用模态值；日内周期使用 OHLC/收盘价格逻辑。
- 输出 `Tenkan`、`Kijun`、`Senkou A`、`Senkou B`、`Chikou` 五条序列。
- 按旧项目行为，`Senkou A`、`Senkou B` 和蓝色 `Chikou` 都前移 `22` 根。
- REST 指标请求使用 `shift=true`，后端追加 50 个未来空白时间点。
- 实时计算只为一目均衡图补 22 个未来时间点。
- 前端 `IchimokuPrimitive` 在 `Senkou A/B` 之间绘制浅绿/深绿虚线网格云层，并在 Tenkan/Kijun 交叉处绘制红色向上或蓝色向下信号。
- 实时 `INDICATORS` 消息到达后，五条线和云层会合并最新点并重新绘制。

完整对齐说明见 `ICHIMOKU_ALIGNMENT_20260721.md`。

### 4.9 REST API

所有业务接口都以 `/api` 开头：

| 方法与路径 | 参数 | 返回 |
|---|---|---|
| `GET /api/meta/instruments` | 无 | `Instrument[]` |
| `GET /api/bars` | `code` 必填；`interval=4`；`count=300`；`shift=true` | `Bar[]`，从旧到新 |
| `GET /api/support-resist` | `code` 必填；`interval=4` | `SupportResist` |
| `GET /api/indicators` | `pane`、`type`、`code` 必填；`interval=4`；`params` 可选；`shift=false` | `IndicatorResult` |

示例：

```text
GET http://127.0.0.1:23723/api/bars?code=JPY&interval=4&count=300&shift=false
GET http://127.0.0.1:23723/api/indicators?pane=upper&type=5&code=JPY&interval=0&shift=true
GET http://127.0.0.1:23723/api/indicators?pane=lower&type=3&code=JPY&interval=4&params=12,26,9
```

`IndicatorResult` 结构：

```json
{
  "id": "RSI",
  "name": "RSI",
  "pane": "pane",
  "series": [
    {
      "name": "RSI(14)",
      "color": "#4080FF",
      "data": [{ "time": 1700000000, "value": 51.2 }]
    }
  ],
  "levels": [{ "label": "Overbought", "value": 70, "color": "#FF0000" }]
}
```

当前没有全局异常响应模型。未知品种由 `IllegalArgumentException` 抛出，可能表现为通用 HTTP 500；正式 API 应增加统一异常处理并返回明确的 4xx 错误体。

### 4.10 WebSocket 实时链路

端点：`/ws/market`。

一条浏览器连接在任一时刻维护一个品种/周期订阅，但该订阅可以同时包含一个叠加指标和多个副图指标。服务端按 `MarketKey(code, interval)` 共享行情状态，多个浏览器订阅同一组合时不会重复生成行情。

客户端订阅：

```json
{
  "type": "SUBSCRIBE",
  "code": "JPY",
  "interval": 4,
  "upper": 5,
  "lower": [2, 3]
}
```

客户端还会发送：

```json
{ "type": "UNSUBSCRIBE" }
```

```json
{ "type": "PONG", "serverTime": 1784780000000 }
```

服务端消息：

| `type` | 作用 | 关键字段 |
|---|---|---|
| `SUBSCRIBED` | 确认订阅并告知生效频率 | `code`、`interval`、`config` |
| `BAR` | 更新最后一根或新增一根 K 线 | `code`、`interval`、`bar` |
| `INDICATORS` | 叠加/副图指标增量 | `upper`、`lower[]` |
| `HEARTBEAT` | 服务端心跳 | `serverTime` |
| `ERROR` | 协议或参数错误 | `message` |

`SUBSCRIBED.config` 当前包含：

```json
{
  "tickIntervalMs": 100,
  "barPushIntervalMs": 500,
  "indicatorPushIntervalMs": 1000,
  "heartbeatIntervalMs": 10000
}
```

实时处理规则：

1. 页面建立连接并发送当前 `code/interval/upper/lower`。
2. 服务端首次创建组合状态时读取 300 根历史 K 线，并把历史最后一根视为已完成。
3. 服务端在历史最后时间的下一个自然周期边界创建实时柱。
4. 模拟器每 100ms 产生一次价格；同一周期更新当前柱的高低收和量。
5. 只有发生新逐笔后，BAR 定时任务才会消费一次 dirty 状态；最长每 500ms 推一次，不会无变化重复发送。
6. 越过周期边界才新增柱。因此 5 分钟图的最后一根在这 5 分钟内持续变化，不是等待 300 秒后才第一次显示。
7. 指标最多每 1000ms 重新计算一次；每条序列只推最后一个非空点，避免重复发送整段历史。
8. 每 10 秒发心跳，前端回 `PONG`。

上述频率是最大检查/推送频率，不会凭空制造真实上游报价。如果未来上游 10 秒才来一个 Tick，即使 `bar-push-interval-ms=300`，前端也只会在有新 Tick 后收到变化。

服务端 WebSocket 握手当前允许任意 Origin；这是为了开发代理和 iframe 验证，正式外网环境应收紧到可信父系统域名。

## 5. 前端技术说明

### 5.1 技术栈

| 项目 | 声明版本 | 当前锁定版本 |
|---|---:|---:|
| React | `^18.3.1` | 18.3.1 |
| React DOM | `^18.3.1` | 18.3.1 |
| Lightweight Charts | `^5.0.0` | 5.2.0 |
| Axios | `^1.7.2` | 1.18.1 |
| TypeScript | `^5.5.3` | 5.9.3 |
| Vite | `^5.3.3` | 5.4.21 |

入口是 `src/main.tsx`，使用 React `StrictMode` 渲染 `App`。

### 5.2 前端模块职责

| 文件 | 职责 |
|---|---|
| `src/App.tsx` | 保存品种、周期、图形、指标、工具和语言状态 |
| `src/components/Toolbar.tsx` | 单行工具栏、副图多选、缩放、平移、导出和语言切换 |
| `src/components/ChartPanel.tsx` | 创建图表、请求历史数据、渲染主图/副图、接收实时增量 |
| `src/api/client.ts` | Axios REST 客户端，统一相对路径 `/api` |
| `src/realtime/MarketSocket.ts` | 单 WebSocket、订阅切换、PONG 和指数退避重连 |
| `src/primitives/ProsticksPrimitive.ts` | Prosticks 模态区、尾部和模态点绘制 |
| `src/primitives/IchimokuPrimitive.ts` | 一目均衡图绿色云层和红蓝信号绘制 |
| `src/drawing/DrawingManager.ts` | 趋势线、平行线、斐波那契和文字框 |
| `src/types/index.ts` | 与后端模型及数字常量对应的 TypeScript 类型 |
| `src/i18n/index.ts` | 英文、繁体中文、简体中文 |
| `src/styles/main.css` | 桌面、手机竖屏和 iframe 样式 |

### 5.3 默认状态

| 状态 | 默认值 |
|---|---|
| 品种 | `JPY`，显示 USD/JPY |
| 周期 | `4`，5 分钟 |
| 图表类型 | `4`，蜡烛图 |
| 叠加指标 | `0`，无 |
| 副图指标 | 空数组，可多选 |
| 绘图工具 | `0`，无 |
| 语言 | `sc`，简体中文 |

### 5.4 页面加载和切换流程

```mermaid
sequenceDiagram
    participant A as App
    participant C as ChartPanel
    participant API as REST API
    participant WS as MarketSocket

    A->>API: 获取品种列表
    C->>API: 获取 300 根历史 Bar
    C->>API: 获取当前叠加指标和各副图完整历史
    C->>WS: 页面打开即连接并 SUBSCRIBE
    WS-->>C: BAR 增量
    WS-->>C: INDICATORS 增量
    A->>C: 用户切换品种/周期/指标
    C->>API: 重新加载对应完整历史
    C->>WS: 同连接更新订阅
```

前端会过滤与当前 `code/interval` 不匹配的迟到消息，避免切换后旧组合污染新图。

WebSocket 断线后使用 `1、2、4、8……30` 秒指数退避重连；重新打开后自动发送最新订阅。浏览器协议为 HTTPS 时自动选择 `wss:`，否则使用 `ws:`。

### 5.5 图表类型参数

| 值 | 类型 | 说明 |
|---:|---|---|
| 0 | Prosticks | 蜡烛底图 + Prosticks 自定义形态 |
| 2 | Bar | OHLC 柱状图 |
| 3 | Bar & Modal | OHLC 柱状图 + 模态点/活跃区 |
| 4 | Candlesticks | 默认蜡烛图 |
| 5 | Modal Lines | 使用 `mp` 的线图 |
| 6 | Line | 使用收盘价的线图 |
| 7 | Area | 使用收盘价的面积图 |

后端还保留 `TYPE_PROSTICKS_VOL=1` 常量，但前端类型和工具栏没有提供该选项。

### 5.6 周期参数

| 值 | 周期 | 自然桶秒数 |
|---:|---|---:|
| 0 | 日 | 86400 |
| 1 | 周 | 604800 |
| 2 | 月 | 2592000，当前按 30 天处理 |
| 3 | 1 分钟 | 60 |
| 4 | 5 分钟 | 300 |
| 5 | 10 分钟 | 600 |
| 6 | 15 分钟 | 900 |
| 7 | 30 分钟 | 1800 |
| 8 | 1 小时 | 3600 |
| 9 | 2 小时 | 7200 |
| 10 | 4 小时 | 14400 |

当前没有 3 分钟周期。

### 5.7 绘图工具参数

| 值 | 工具 |
|---:|---|
| 0 | 无/工具菜单标题 |
| 1 | 趋势线 |
| 2 | 平行线 |
| 3 | 清除最后一条线 |
| 4 | 清除全部线 |
| 5 | 斐波那契回调 |
| 6 | 斐波那契投射 |
| 7 | 清除斐波那契 |
| 8 | 文字框 |
| 9 | 清除最后一个文字框 |
| 10 | 清除全部文字框 |

绘图对象只保存在当前页面内存，切换品种或刷新页面不会持久化。

### 5.8 手机竖屏和 iframe

断点为 `768px`。当前设计目标是“工具栏尽量一行，选择什么就显示什么，页面可上下滚动查看主图和副图”。

手机/窄 iframe 行为：

- 工具栏不换行，允许横向滑动；控件高度 44px，便于 Android/iPhone 点击。
- 页面自身允许纵向滚动；图表保留横向拖动。
- 图表触摸设置在手机宽度下关闭垂直图表拖动，纵向手势交给页面滚动。
- 主图最低 420px，基础高度为 `max(420px, 62vh/62dvh)`。
- 每选择一个副图，总高度增加 220px；用户向下滚动逐个查看。
- 手机有副图时主图 stretch factor 为 2，副图各为 1。
- 使用 `ResizeObserver` 适配 iframe 区域尺寸变化。
- 使用 `env(safe-area-inset-*)` 适配刘海屏和底部安全区。
- 副图多选菜单在手机上使用 fixed 浮层，最高 `min(70dvh, 480px)`，菜单内部可滚动。

iframe 接入方式：

```html
<iframe
  src="http://Linux服务器IP:23722/"
  title="FOREX Chart"
  style="width:100%;height:700px;border:0"
></iframe>
```

当前没有通过 `postMessage` 向父页面自动上报内容高度。父系统需要自己决定 iframe 占满页面还是占某个区域，并给 iframe 一个实际高度。若父页面同时禁止 iframe 滚动又把高度设得过小，子页面的副图会被裁掉。

### 5.9 前端代理和跨域

`vite.config.ts` 的开发与 preview 配置相同：

```text
0.0.0.0:23722/api/*  -> http://127.0.0.1:23723/api/*
0.0.0.0:23722/ws/*   -> ws://127.0.0.1:23723/ws/*
```

前端代码只使用相对地址，所以浏览器不需要直接访问 `23723`，也不会把服务器本机的 `127.0.0.1` 暴露给浏览器。

REST CORS 当前只允许任意主机的 `23722` HTTP/HTTPS Origin；WebSocket 当前允许任意 Origin。正常通过同源前端代理访问时，不依赖浏览器跨域请求。

### 5.10 Lightweight Charts 归属说明

图表内部已通过 `layout.attributionLogo=false` 隐藏左下角 TradingView attribution Logo。依赖许可证要求的归属说明仍应放在外层系统“关于”或“法律声明”页面。不要把隐藏 Logo 等同于免除许可证义务。

## 6. 后端配置参数

主配置文件：`backend/src/main/resources/application.yml`。

| 参数 | 当前值 | 说明 |
|---|---:|---|
| `server.address` | `127.0.0.1` | 后端仅允许同机访问 |
| `server.port` | `23723` | 后端端口 |
| `prosticks.price-source` | `sample` | `sample` 或 `http` |
| `prosticks.realtime.enabled` | `true` | 是否运行模拟 Tick；不是总 WebSocket 开关 |
| `prosticks.realtime.tick-interval-ms` | `100` | 模拟器尝试生成 Tick 的间隔 |
| `prosticks.realtime.bar-push-interval-ms` | `500` | dirty Bar 的最大发送频率 |
| `prosticks.realtime.indicator-push-interval-ms` | `1000` | 指标增量计算/发送频率 |
| `prosticks.realtime.heartbeat-interval-ms` | `10000` | 心跳频率 |
| `prosticks.realtime.history-count` | `300` | 每个实时组合内存中保留的 Bar 数 |
| `prosticks.http.base-url` | 空 | HTTP 价源根地址 |
| `prosticks.http.api-key` | 空 | 当前模板的查询参数密钥 |
| `prosticks.http.bars-path` | `/candles/{symbol}?interval={interval}&count={count}` | 历史 K 线路径模板 |

定时任务使用 `fixedDelay`。例如把 Bar 推送改为 300ms：

```yaml
prosticks:
  realtime:
    bar-push-interval-ms: 300
```

修改后必须重启后端。前端无须同步写死该值，订阅确认消息会返回服务端生效配置。

## 7. Windows 开发、构建与运行

### 7.1 环境

- Java 17 或更高；当前已使用 Java 21 验证。
- Maven 3.9.x。
- Node.js 和 npm。当前 Windows 环境为 Node.js v24.13.0、npm 11.6.2；项目部署包使用兼容 RHEL 7.5 的 Node.js v22.23.1。

### 7.2 启动后端源码

```powershell
Set-Location D:\projects\FOREX_CHART\backend
mvn spring-boot:run
```

### 7.3 构建并启动后端 JAR

```powershell
Set-Location D:\projects\FOREX_CHART\backend
mvn clean package
java -jar .\target\chart-backend-1.0.0.jar
```

如果 JAR 已经存在，可直接执行第二条命令。指定某个 Java 21：

```powershell
& 'D:\Java\jdk21\bin\java.exe' -jar 'D:\projects\FOREX_CHART\backend\target\chart-backend-1.0.0.jar'
```

临时覆盖端口：

```powershell
java -jar .\target\chart-backend-1.0.0.jar --server.port=23723 --server.address=127.0.0.1
```

### 7.4 启动前端开发服务

```powershell
Set-Location D:\projects\FOREX_CHART\frontend
npm install
npm run dev
```

访问 `http://127.0.0.1:23722/`。

### 7.5 构建和预览前端

```powershell
Set-Location D:\projects\FOREX_CHART\frontend
npm run build
npm run preview
```

改变端口时至少同步检查：

1. `backend/src/main/resources/application.yml` 的后端监听地址和端口；
2. `frontend/vite.config.ts` 的 `server.port`、`preview.port`、`/api target` 和 `/ws target`；
3. `backend/.../CorsConfig.java` 的允许前端端口；
4. Linux 启停和状态脚本中的 `23722/23723`；
5. 防火墙、安全组和 iframe URL。

## 8. Linux 固定目录部署

### 8.1 固定路径

```text
应用目录：/chart/FOREX_CHART/
部署包：  /chart/FOREX_CHART.tar.gz
校验文件：/chart/FOREX_CHART.tar.gz.sha256
外部 JDK：/chart/openlogic-openjdk-21.0.11+10-linux-x64/
```

JDK 独立放在 `/chart/`，替换整个应用目录不会删除 JDK。

目标环境是 RHEL 7.5 x86_64、glibc 2.17。部署包内含兼容该环境的 Node.js v22.23.1 离线运行时、前端 Linux 依赖、前端 `dist` 和后端 JAR。

### 8.2 全新部署

```bash
cd /chart
sha256sum -c FOREX_CHART.tar.gz.sha256
tar -xzf FOREX_CHART.tar.gz
cd /chart/FOREX_CHART
chmod +x scripts/*.sh
./scripts/check-environment.sh
sha256sum -c MANIFEST.sha256
./scripts/start-all.sh
```

外部只需开放 TCP `23722`。不要开放只监听本机的 `23723`。

### 8.3 日常命令

```bash
cd /chart/FOREX_CHART
./scripts/status.sh
./scripts/restart-all.sh
./scripts/stop-all.sh
./scripts/start-all.sh
```

日志：

```bash
tail -f /chart/FOREX_CHART/run/backend.log
tail -f /chart/FOREX_CHART/run/frontend.log
```

`start-backend.sh` 最多等待 30 秒确认 `23723` 监听，`start-frontend.sh` 最多等待 20 秒确认 `23722` 监听。Java 进程存在但端口尚未监听时，等待期间的 `status.sh` 可能暂时显示“进程运行中、端口未监听”。

### 8.4 上传完整新包后的替换流程

```bash
cd /chart/FOREX_CHART
./scripts/stop-all.sh

cd /chart
BACKUP_DIR="FOREX_CHART.backup.$(date +%Y%m%d%H%M%S)"
mv FOREX_CHART "${BACKUP_DIR}"
tar -xzf FOREX_CHART.tar.gz
chmod +x FOREX_CHART/scripts/*.sh
FOREX_CHART/scripts/check-environment.sh
cd FOREX_CHART
sha256sum -c MANIFEST.sha256
./scripts/start-all.sh
```

验证新版本正常后再删除备份目录。启动失败时，可以移走新目录并把备份目录改回 `FOREX_CHART`。

### 8.5 当前 Linux 前端服务定位

当前使用 `vite preview` 是为了在无 Nginx 的服务器上快速看效果和验证 WebSocket，不是面向高并发、TLS、缓存和安全加固的长期生产 Web Server。正式发布建议在后续引入 Nginx、Apache 或企业网关，并继续保持 `/api`、`/ws` 同源代理。

## 9. 测试与当前验证状态

2026-07-23 14:51 本文档编写前执行：

```text
backend: mvn test
结果：6 tests，0 failures，0 errors，BUILD SUCCESS

frontend: npm exec tsc -- --project tsconfig.json --noEmit --pretty false
结果：通过，无 TypeScript 错误
```

后端测试当前覆盖：

- 一目均衡图旧项目 22 根前移和日内 OHLC 计算；
- 5 分钟同周期更新最后柱和跨周期新增柱；
- 有 Tick 才产生 dirty Bar，消费后不重复推送；
- 指标实时消息只保留各序列最后有效点。

尚未形成自动化覆盖的重点：

- Controller REST 集成测试和统一错误响应；
- WebSocket 订阅协议的 Java 端到端测试；
- 前端组件/浏览器自动化测试；
- 真机 Android/iPhone 兼容矩阵；
- 真实价源断线、乱序、重复 Tick、延迟和补数场景；
- Linux 部署包在每次源码修改后的自动重建校验。

## 10. 正式报价源接入方案

正式数据源应拆成“历史”和“实时”两条链路，不要误以为一个 HTTP 历史接口就能让最后一根柱实时跳动。

### 10.1 历史链路

可以选择：

1. 完成 `HttpPriceSource`，按供应商格式实现鉴权、周期映射、分页、时区、限流和响应校验；或
2. 新建 `DatabasePriceSource implements PriceSource`，从企业数据库读取已落地的 OHLCV/Prosticks 数据；或
3. 新建供应商专用 `XxxPriceSource`，不要把大量供应商分支堆入通用模板。

输出必须满足：

- Bar 按 `time` 从旧到新排序；
- 时间统一为 Unix 秒；
- OHLC 价格合法，`high >= open/close/low`，`low <= open/close/high`；
- 重复时间去重；
- 明确未完成历史柱是否返回；
- 供应商代码通过 `external-symbol` 映射，不把外部代码散落在业务层。

### 10.2 实时链路

当前项目还没有实时价源接口。建议增加一个职责单一的实时输入抽象，例如：

```text
RealtimeTickSource
  subscribe(externalSymbol, onTick)
  unsubscribe(externalSymbol)
  connectionStatus()

Tick
  symbol
  eventTimeSeconds
  price
  volume
  sequenceId（如果供应商提供）
```

然后把真实 Tick 送入现有 `RealtimeBarAggregator`，继续复用当前的周期桶、BAR 节流、指标计算和浏览器订阅协议。需要新增：

- 上游连接管理、鉴权和自动重连；
- 外部 symbol 到内部 code 的反向映射；
- Tick 去重、乱序容忍和迟到策略；
- 交易时段、周末和市场关闭处理；
- 断线补数以及历史/实时接缝；
- 多实例部署时的共享行情总线或固定路由；
- 监控：最后 Tick 时间、重连次数、订阅数、推送延迟和丢弃数。

浏览器侧协议可以保持不变，所以真正的改造重点在后端上游，不需要为每个供应商重写前端。

### 10.3 Prosticks 专属字段

必须向旧系统负责人或数据提供方确认：

- `mp/mc/vap/vam/ut/lt` 是行情源直接提供、数据库预计算，还是后端二次计算；
- 日/周/月和日内数据的聚合口径；
- 旧系统使用的表、存储过程、批处理以及更新频率；
- 历史修订、缺口回补和时区；
- `impmp/popen/pclose/mclose` 的权威计算规则。

如果拿不到这些规则，新系统只能保证普通 OHLCV 图表和传统指标，不应宣称 Prosticks 模态结果与旧生产系统完全一致。

## 11. 已知限制与上线前检查

| 级别 | 当前限制 | 影响/处理建议 |
|---|---|---|
| 高 | 历史和实时数据仍是模拟数据 | 不能用于真实交易判断；按第 10 节接正式源 |
| 高 | 实时模拟器不经过 `PriceSource` | 切 HTTP 历史源后实时仍是模拟价格；需新增实时输入抽象 |
| 高 | 无鉴权，WebSocket Origin 为 `*` | 外网正式部署前接入认证、授权和可信 Origin |
| 高 | `HttpPriceSource` 缺 10 分钟、2 小时映射 | 正式启用前按供应商文档补齐并测试 |
| 中 | HTTP 拉取失败返回空列表 | 增加重试、熔断、明确错误响应和空数据保护 |
| 中 | 无数据库和持久化 | 服务重启后实时状态和绘图对象消失 |
| 中 | Vite preview 不是正式生产服务器 | 效果验证可用，正式发布引入网关/Web Server |
| 中 | 前端未绘制指标 `levels` | RSI 等参考线暂不显示，需要专门实现 |
| 低 | 后端支持 OBV、Volume+、VAO，但工具栏未列出 | 如业务需要，在 `LOWER_OPTIONS` 增加选项 |
| 低 | 除 Ichimoku 外的价格型指标按 `mp` 占比推断计算价 | 要求旧图严格一致时，逐项改成明确的周期口径 |
| 低 | 部分注释写 34 个品种，实际是 35 个 | 以 YAML 和接口返回为准，后续清理旧注释 |
| 低 | TypeScript `Instrument` 未声明 `externalSymbol` | JSON 多余字段不会影响运行；使用该字段前补类型 |
| 低 | 月周期按固定 30 天聚合 | 如需自然月，改为日历时区边界 |

## 12. 常见排障

### 12.1 页面打不开

Linux：

```bash
cd /chart/FOREX_CHART
./scripts/status.sh
ss -lntp | grep -E ':(23722|23723)[[:space:]]'
tail -n 100 run/frontend.log
tail -n 100 run/backend.log
```

外部只访问 `http://服务器IP:23722/`，不是 `23723`。

### 12.2 页面能开，但 API 500

依次确认：

1. `23723` 已真正监听；
2. `curl http://127.0.0.1:23723/api/meta/instruments`；
3. `curl http://127.0.0.1:23722/api/meta/instruments`；
4. 查看 `run/backend.log` 和 `run/frontend.log`；
5. 确认 JAR 与前端包来自同一版本。

### 12.3 图表不跳动

- 浏览器开发者工具 Network 中检查 `/ws/market` 是否为 `101 Switching Protocols`。
- 检查是否持续收到 `HEARTBEAT`、`BAR`。
- 确认 Vite `/ws` 代理仍指向 `ws://127.0.0.1:23723`。
- 确认 `prosticks.realtime.enabled=true`。
- 如果已经改成真实上游，确认最后 Tick 时间，而不是只看 500ms 定时参数。

### 12.4 一目均衡图有线但没有云层

- 工具栏叠加指标必须选择 `type=5`。
- REST 请求必须使用 `shift=true`，否则未来时间坐标不足。
- 响应中必须同时有同一时间的 `Senkou A` 和 `Senkou B` 非空点。
- 检查 `IchimokuPrimitive` 是否已附加到主序列。
- 切换图表类型后会重建主序列，随后应重新加载叠加指标。

### 12.5 手机副图被裁掉

- 父页面必须给 iframe 实际高度。
- 不要同时设置过小高度和 `scrolling=no`。
- 子页面会按每个副图增加 220px，并依靠 iframe 内纵向滚动查看。
- 检查父页面是否对 iframe 容器使用了 `overflow:hidden`。

### 12.6 端口占用

Windows：

```powershell
Get-NetTCPConnection -State Listen -LocalPort 23722,23723 |
  Select-Object LocalAddress,LocalPort,OwningProcess
```

Linux：

```bash
ss -lntp | grep -E ':(23722|23723)[[:space:]]'
```

优先使用项目启停脚本停止由 PID 文件记录的进程，不要只按模糊进程名批量杀进程。

## 13. 建议阅读顺序

新接手人员可按以下顺序阅读：

1. 本文档第 1～3 节，理解边界和总架构。
2. `backend/src/main/resources/application.yml`，确认端口、价源、实时频率和品种。
3. `backend/.../controller` 和 `frontend/src/api/client.ts`，理解 REST 契约。
4. `MarketWebSocketHandler.java` 和 `MarketSocket.ts`，理解实时协议。
5. `MarketDataService.java`、`RealtimeMarketService.java`、`RealtimeBarAggregator.java`，理解历史与实时接缝。
6. `IndicatorEngine.java`、`ChartPanel.tsx` 和两个 primitive，理解指标与绘图。
7. `FIXED_LINUX_DEPLOYMENT_20260722.md`，理解服务器发布流程。
8. 准备接正式报价源时再读第 10～11 节，并向旧系统负责人补齐权威数据规则。

## 14. 文档维护规则

涉及以下变化时应同步更新本文件：

- 新增或修改 REST/WS 消息字段；
- 改端口、代理、部署目录、JDK 或 Node 版本；
- 新增周期、品种、图表类型、指标或绘图工具；
- 切换历史/实时价源；
- 改变 iframe 高度、滚动或手机断点；
- 修复“已知限制”中的项目；
- 重新生成 Linux 完整部署包。

本文件描述的是当前代码事实。旧项目行为、业务口径和正式数据源规则如果尚未得到负责人确认，应继续标记为待确认，不能凭推测写成生产规则。
