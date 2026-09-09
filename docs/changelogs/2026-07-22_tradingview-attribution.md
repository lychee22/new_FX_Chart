# TradingView 图表内标识处理记录

记录时间：2026-07-22 12:51:45

## 处理范围

仅处理新项目 `frontend`，旧项目 `chart` 和后端均不修改。

## 问题原因

当前使用的 `lightweight-charts` v5.2.0 默认将 `layout.attributionLogo` 设为 `true`，因此图表左下角会生成 TradingView Logo 和跳转链接。

## 修改方案

在 `frontend/src/components/ChartPanel.tsx` 创建图表时增加官方配置：

```ts
// 2026-07-22 12:51:45：iframe 图表不显示左下角 TradingView Logo 和跳转链接。
attributionLogo: false,
```

未使用 CSS 隐藏或 DOM 删除，避免依赖组件内部生成结构。

## 影响

- 图表左下角不再生成 TradingView Logo 和链接。
- K 线、指标、画线、移动端适配、HTTP API 和 WebSocket 实时更新均不受影响。
- `lightweight-charts` 的许可证仍要求产品提供归属说明和 TradingView 链接，应放在外层系统可访问的“关于”或“法律声明”页面。

## 部署

修改后需重新执行 `npm run build`，并将最新 `frontend/dist/` 覆盖到 Linux 部署目录后重启前端。

## 验证结果

- 2026-07-22 12:51:45：`npm run build` 成功，99 个模块完成转换。
- 新生产脚本：`frontend/dist/assets/index-CnW5duX3.js`。
- Linux 离线部署目录已同步最新源码和 `dist`。
