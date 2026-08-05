package com.prosticks.chart.model;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.List;

/**
 * 单个技术指标的计算结果。
 *
 * <p>一个指标可输出多条序列 (例如 Bollinger 的上/中/下轨, MACD 的 DIF/DEA/柱),
 * 每条序列带配色。副图指标可携带参考水平线 (例如 RSI 的 30/50/70)。
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class IndicatorResult {

	/** 指标 ID (例如 "SMA", "RSI", "MACD") */
	public String id;
	/** 指标显示名 */
	public String name;
	/** overlay (叠加在主图) / pane (独立副图) */
	public String pane;
	/** 输出序列列表 */
	public List<Series> series;
	/** 参考水平线 (副图指标用, 如 RSI 的 30/50/70) */
	public List<LevelLine> levels;

	public IndicatorResult() {}

	public IndicatorResult(String id, String name, String pane, List<Series> series, List<LevelLine> levels) {
		this.id = id;
		this.name = name;
		this.pane = pane;
		this.series = series;
		this.levels = levels;
	}

	/** 一条输出序列。 */
	public static class Series {
		/** 序列名 (例如 "SMA(10)", "Upper", "DIF") */
		public String name;
		/** 颜色 hex (对齐旧系统配色) */
		public String color;
		/** 数据点 {time(unix秒), value} */
		public List<Point> data;

		public Series() {}
		public Series(String name, String color, List<Point> data) {
			this.name = name; this.color = color; this.data = data;
		}
	}

	/** 数据点: 价格序列。 */
	public static class Point {
		public long time;
		public Double value;  // null = 该点无值 (指标预热期)

		public Point() {}
		public Point(long time, Double value) { this.time = time; this.value = value; }
	}

	/** 参考水平线 (例如 RSI 70 超买线)。 */
	public static class LevelLine {
		public String label;
		public double value;
		public String color;

		public LevelLine() {}
		public LevelLine(String label, double value, String color) {
			this.label = label; this.value = value; this.color = color;
		}
	}
}
