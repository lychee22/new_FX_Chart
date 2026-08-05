package com.prosticks.chart.realtime;

import com.prosticks.chart.model.IndicatorResult;

import java.util.ArrayList;
import java.util.List;

/** 将完整指标结果压缩为实时增量。 */
public final class IndicatorDeltaFactory {

	private IndicatorDeltaFactory() {}

	// 2026-07-21 22:34:49：每条序列仅推最后一个有效点，降低 iframe 长连接消息体积。
	public static IndicatorResult latest(IndicatorResult source) {
		List<IndicatorResult.Series> series = new ArrayList<>();
		for (IndicatorResult.Series item : source.series) {
			IndicatorResult.Point point = latestPoint(item.data);
			List<IndicatorResult.Point> data = point == null ? List.of() : List.of(point);
			series.add(new IndicatorResult.Series(item.name, item.color, data));
		}
		return new IndicatorResult(source.id, source.name, source.pane, series, source.levels);
	}

	private static IndicatorResult.Point latestPoint(List<IndicatorResult.Point> points) {
		for (int i = points.size() - 1; i >= 0; i--) {
			IndicatorResult.Point point = points.get(i);
			if (point.value != null) return new IndicatorResult.Point(point.time, point.value);
		}
		return null;
	}
}
