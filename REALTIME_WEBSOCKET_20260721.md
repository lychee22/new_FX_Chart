# WebSocket 实时行情改造记录

更新时间：2026-07-21 22:56:00（Asia/Shanghai）

## 本次目标

- 页面打开后自动建立一个 WebSocket 连接。
- 品种或周期变化时，先取消旧订阅，再使用同一连接订阅新组合。
- 逐笔价格进入当前自然周期时，只更新最后一根完整 K 线；越过周期边界才新增 K 线。
- 叠加指标、副图指标随最新 K 线同步变化。
- 当前没有真实价源，后端提供可关闭、可替换的模拟逐笔行情。
- 支持 iframe：前端按页面协议自动选择 `ws` 或 `wss`，不写死域名。

## 已实现行为

1. 后端按 `code + interval` 共享实时状态，不为每个浏览器单独生成一套行情。
2. 历史数据视为已完成柱，首次订阅在下一个自然边界建立实时柱。例如 5 分钟历史最后时间为 `20:59` 时，实时柱从 `21:00` 开始，时间不会倒退。
3. 模拟逐笔默认每 100ms 产生一次；K 线最多每 500ms 合并推送一次。没有新逐笔时不重复推相同 K 线。
4. 1 分钟、5 分钟、10 分钟等周期的最后一根柱都会持续更新，分别到 60、300、600 秒边界后才新增柱。
5. 指标默认每 1000ms 重新计算，但只发送各序列最后一个有效点：
   - 叠加指标通过 Lightweight Charts `series.update()` 更新；
   - 副图指标按已选择顺序更新各 pane；
   - 一日均衡图同时更新五条线和绿色云层 primitive。
6. 心跳默认 10000ms；浏览器回复 `PONG`。
7. 断线后按 1、2、4、8 秒递增重连，最大等待 30 秒。
8. 未新增 3 分钟周期，本次仍使用原有周期集合。

## 后端配置

配置位于 `backend/src/main/resources/application.yml`：

```yaml
prosticks:
  realtime:
    enabled: true
    tick-interval-ms: 100
    bar-push-interval-ms: 500
    indicator-push-interval-ms: 1000
    heartbeat-interval-ms: 10000
    history-count: 300
```

`bar-push-interval-ms` 是有新价格时的最大发送频率，不是强制定时重复发送。如果以后真实价源 2 秒或 10 秒才来一笔，前端也只会在那一笔到达后收到更新。

## WebSocket 协议

端点：`/ws/market`

订阅：

```json
{"type":"SUBSCRIBE","code":"JPY","interval":4,"upper":5,"lower":[2,3]}
```

取消：

```json
{"type":"UNSUBSCRIBE"}
```

服务端消息：

- `SUBSCRIBED`：当前品种、周期和服务端生效频率；
- `BAR`：最后一根完整 K 线；
- `INDICATORS`：叠加指标和多个副图指标的最后有效点；
- `HEARTBEAT`：连接保活；
- `ERROR`：协议或订阅参数错误。

## 真实价源接入边界

当前模拟器只负责生成逐笔价格，WebSocket 协议、K 线聚合、指标增量和前端更新已经独立。接真实价源时，应把真实 tick 输入 `RealtimeMarketService` 的聚合入口，并关闭模拟生成；前端和 iframe 接入方式无需改变。

## 验证结果

- `mvn test`：6 个测试全部通过，覆盖 Ichimoku 对齐、同周期更新、跨周期新增、无新 tick 不重复推送、指标增量提取。
- `npm run build`：TypeScript 检查和 Vite 生产构建通过。
- WebSocket 实际联调：
  - 收到 `SUBSCRIBED`、连续 `BAR`、`INDICATORS`；
  - JPY/5 分钟连续 Bar 时间单调不倒退；
  - 同一连接切换到 EUR/10 分钟后，没有旧 JPY 消息继续发送；
  - 一日均衡图类型 5 与 RSI、MACD 同时收到增量；
  - 仅选择副图、叠加指标为空时也能正常推送。

## 运行提示

代码更新后需要重启本机 23723 后端进程，并重启 23722 前端服务，以加载 `/api` 与 `/ws` 代理配置。
