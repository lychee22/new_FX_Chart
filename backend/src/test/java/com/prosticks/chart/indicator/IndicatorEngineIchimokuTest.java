package com.prosticks.chart.indicator;

import com.prosticks.chart.model.Bar;
import com.prosticks.chart.model.IndicatorResult;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

// 2026-07-21 17:22:08：锁定旧 chart 的 Ichimoku 模态计算与 22 根前移行为，防止云层修复后再次错位。
class IndicatorEngineIchimokuTest {

	@Test
	void shouldShiftLegacyCloudAndBlueLineForwardByTwentyTwoBars() {
		List<Bar> bars = buildBars(80, 50);
		IndicatorResult result = new IndicatorEngine().calculate("IKH", bars, null);

		int source = 43;
		int target = source + 22;
		assertEquals(222.5, valueAt(result, "Senkou A", target), 0.0001);
		assertEquals(193.0, valueAt(result, "Senkou B", target), 0.0001);
		assertEquals(236.0, valueAt(result, "Chikou", target), 0.0001);
		assertEquals(178.5, valueAt(result, "Senkou A", source), 0.0001);

		int latestTarget = 79 + 22;
		assertEquals(294.5, valueAt(result, "Senkou A", latestTarget), 0.0001);
		assertEquals(265.0, valueAt(result, "Senkou B", latestTarget), 0.0001);
		assertEquals(308.0, valueAt(result, "Chikou", latestTarget), 0.0001);
	}

	@Test
	void shouldUseOhlcValuesForIntradayIchimoku() {
		List<Bar> bars = buildBars(80, 50);
		IndicatorResult result = new IndicatorEngine().calculate("IKH", bars, null, 4);

		int target = 43 + 22;
		assertEquals(986.25, valueAt(result, "Senkou A", target), 0.0001);
		assertEquals(971.5, valueAt(result, "Senkou B", target), 0.0001);
		assertEquals(993.0, valueAt(result, "Chikou", target), 0.0001);
	}

	private List<Bar> buildBars(int validCount, int futureCount) {
		List<Bar> bars = new ArrayList<>();
		long start = 1_700_000_000L;
		for (int i = 0; i < validCount; i++) {
			Bar bar = new Bar(202601010000L + i, 950 + i, 1000 + i, 900 + i,
					950 + i, 0, 200 + i * 2, 100 + i * 2, 150 + i * 2, 10, 0, 0);
			bar.time = start + i * 86_400L;
			bars.add(bar);
		}
		for (int i = 0; i < futureCount; i++) {
			Bar empty = new Bar();
			empty.time = start + (validCount + i) * 86_400L;
			bars.add(empty);
		}
		return bars;
	}

	private Double valueAt(IndicatorResult result, String name, int index) {
		return result.series.stream()
				.filter(series -> name.equals(series.name))
				.findFirst()
				.orElseThrow()
				.data.get(index).value;
	}
}
