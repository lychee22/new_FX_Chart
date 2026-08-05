package com.prosticks.chart.pricesource;

import com.prosticks.chart.model.Bar;

import java.util.List;

/**
 * 统一价源接口 —— 所有行情数据来源 (模拟 / HTTP API / WebSocket / 文件) 都实现此接口。
 *
 * <p>设计原则:
 * <ul>
 *   <li>接口只管"取数据", 不管品种校验、右端扩展、支撑阻力计算 (这些留在 MarketDataService)。</li>
 *   <li>输入用 {@code externalSymbol} (价源标准代码, 如 "USDJPY"), 由 InstrumentService 负责内部 code ↔ 外部 symbol 映射。</li>
 *   <li>输出是标准 {@link Bar}, OHLCV 必填; Prosticks 专属字段 (mp/mc/vap/vam/ut/lt) 无数据时置 0。</li>
 * </ul>
 *
 * <p>将来对接真实价源: 新建 {@code XxxPriceSource implements PriceSource}, 在 yml 配置
 * {@code prosticks.price-source: xxx} 即可切换, 上层代码零改动。
 */
public interface PriceSource {

	/**
	 * 获取历史 K 线。
	 *
	 * @param externalSymbol 价源标准代码 (如 "USDJPY"、"XAUUSD")
	 * @param interval       时间周期 ({@link com.prosticks.chart.model.ChartConstants#INTERVAL_DAY} 等)
	 * @param count          K 线数量
	 * @return 标准 Bar 列表 (从最旧到最新), OHLCV 必填
	 */
	List<Bar> getBars(String externalSymbol, int interval, int count);

	/** 价源名称 (用于日志和 Swagger 文档标识)。 */
	String getName();
}
