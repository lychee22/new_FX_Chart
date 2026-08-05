package com.prosticks.chart.realtime;

import com.prosticks.chart.model.IndicatorResult;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

// 2026-07-21 22:34:11：指标实时消息只携带各序列最后一个有效点，避免每秒重复发送整段历史。
class IndicatorDeltaFactoryTest {

	@Test
	void shouldKeepTheLatestNonNullPointForEachSeries() {
		IndicatorResult source = new IndicatorResult("RSI", "RSI", "pane", List.of(
				new IndicatorResult.Series("RSI", "#00f", List.of(
						new IndicatorResult.Point(10, 45.0),
						new IndicatorResult.Point(20, 51.0),
						new IndicatorResult.Point(30, null)))), null);

		IndicatorResult delta = IndicatorDeltaFactory.latest(source);

		assertEquals(1, delta.series.get(0).data.size());
		assertEquals(20, delta.series.get(0).data.get(0).time);
		assertEquals(51.0, delta.series.get(0).data.get(0).value);
	}
}
