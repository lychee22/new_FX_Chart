package com.prosticks.chart.realtime;

import com.prosticks.chart.model.Bar;
import com.prosticks.chart.model.ChartConstants;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;

// 2026-07-21 22:25:27：锁定官方实时图表的核心行为，同一周期只更新最后一根完整 K 线。
class RealtimeBarAggregatorTest {

	@Test
	void shouldUpdateTheCurrentBarInsideTheSameFiveMinuteBucket() {
		RealtimeBarAggregator aggregator = new RealtimeBarAggregator();
		long tickTime = 1_700_000_120L;
		long bucketTime = tickTime - tickTime % 300;
		Bar current = bar(bucketTime, 100, 101, 99, 100.5, 10);

		Bar updated = aggregator.onTick(current, tickTime, 102, 3, ChartConstants.INTERVAL_5MIN);

		assertSame(current, updated);
		assertEquals(100, updated.o, 0.0001);
		assertEquals(102, updated.h, 0.0001);
		assertEquals(99, updated.l, 0.0001);
		assertEquals(102, updated.c, 0.0001);
		assertEquals(13, updated.v, 0.0001);
	}

	@Test
	void shouldCreateANewBarOnlyAfterCrossingTheFiveMinuteBoundary() {
		RealtimeBarAggregator aggregator = new RealtimeBarAggregator();
		long currentTime = 1_700_000_100L - 1_700_000_100L % 300;
		long tickTime = currentTime + 320;
		Bar current = bar(currentTime, 100, 101, 99, 100.5, 10);

		Bar next = aggregator.onTick(current, tickTime, 102, 3, ChartConstants.INTERVAL_5MIN);

		assertEquals(tickTime - tickTime % 300, next.time);
		assertEquals(102, next.o, 0.0001);
		assertEquals(102, next.h, 0.0001);
		assertEquals(102, next.l, 0.0001);
		assertEquals(102, next.c, 0.0001);
		assertEquals(3, next.v, 0.0001);
	}

	private Bar bar(long time, double open, double high, double low, double close, double volume) {
		Bar bar = new Bar(0, open, high, low, close, volume, close, close, close, 1, 0, 0);
		bar.time = time;
		return bar;
	}
}
