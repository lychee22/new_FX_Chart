// 区域 (nation) 配置 —— 按后端返回的 nation 字段切换 K 线涨跌色
// 后端未提供前, 前端 mock 默认 DEFAULT_NATION = 1 (黑白, 继承自 simplechart.js)
// 接入后端时: useEffect 中 fetch /api/config 取 nation 后 setState 即可
//
// nation 取值:
//   1 = 黑白 (默认, 打印友好 / 高级质感)
//   2 = 绿涨红跌 (TradingView / Bloomberg / 西方惯例)
//   3 = 红涨绿跌 (同花顺 / 雪球 / 东方财富 / 大中华圈惯例)



