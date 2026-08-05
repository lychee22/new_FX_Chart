package com.prosticks.chart.realtime;

import com.prosticks.chart.model.ChartConstants;

/** 周期编号与自然周期秒数的统一映射。 */
public final class MarketInterval {

	private MarketInterval() {}

	// 2026-07-21 22:36:44：聚合器和 Ichimoku 未来时间轴共享同一周期规则。
	public static long seconds(int interval) {
		return switch (interval) {
			case ChartConstants.INTERVAL_MIN -> 60L;
			case ChartConstants.INTERVAL_5MIN -> 300L;
			case ChartConstants.INTERVAL_10MIN -> 600L;
			case ChartConstants.INTERVAL_15MIN -> 900L;
			case ChartConstants.INTERVAL_30MIN -> 1_800L;
			case ChartConstants.INTERVAL_HOUR -> 3_600L;
			case ChartConstants.INTERVAL_2HOUR -> 7_200L;
			case ChartConstants.INTERVAL_4HOUR -> 14_400L;
			case ChartConstants.INTERVAL_DAY -> 86_400L;
			case ChartConstants.INTERVAL_WEEK -> 604_800L;
			default -> 2_592_000L;
		};
	}
}
