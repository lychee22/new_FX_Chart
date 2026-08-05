package com.prosticks.chart.pricesource;

import com.prosticks.chart.model.Bar;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

/**
 * Bar 构建工具 —— 把价源返回的原始 OHLCV 数据标准化为 {@link Bar}。
 *
 * <p>核心职责: Prosticks 专属字段降级填充。真实价源只提供 OHLCV,
 * 不提供 mp/mc/vap/vam/ut/lt, 这些字段在此统一置默认值并派生必要的衍生字段。
 */
public final class BarBuilder {

	private BarBuilder() {}

	/**
	 * 从原始 OHLCV 构建标准 Bar (Prosticks 字段全部置 0, 衍生字段自动计算)。
	 *
	 * <p>供真实价源使用: 只需提供 time(秒) + OHLCV, Prosticks 字段自动降级。
	 *
	 * @param timeSeconds Unix 时间戳 (秒)
	 * @param open        开盘价
	 * @param high        最高价
	 * @param low         最低价
	 * @param close       收盘价
	 * @param volume      成交量
	 */
	public static Bar fromOhlcv(long timeSeconds, double open, double high, double low, double close, double volume) {
		LocalDateTime ldt = LocalDateTime.ofEpochSecond(timeSeconds, 0, ZoneOffset.UTC);
		long dtInt = parseDtToInt(ldt);

		// Prosticks 字段置 0 (真实价源不提供)
		Bar bar = new Bar(dtInt, open, high, low, close, volume,
				0, 0, 0, 0, 0, 0);
		bar.time = timeSeconds;
		// 衍生字段: 构造器已自动算 mclose; mp=0 时 pclose=(h+l)/2 (Bar 构造器已处理)
		// popen 需在序列层面回填 (依赖下一根), 此处置默认
		bar.popen = bar.pclose;
		bar.impmp = false;
		return bar;
	}

	/** LocalDateTime → YYYYMMDDHHMM 整数。 */
	public static long parseDtToInt(LocalDateTime ldt) {
		String s = String.format("%04d%02d%02d%02d%02d",
				ldt.getYear(), ldt.getMonthValue(), ldt.getDayOfMonth(),
				ldt.getHour(), ldt.getMinute());
		return Long.parseLong(s);
	}

	/**
	 * 批量回填 popen 字段 (依赖序列顺序, 从最新往最旧算)。
	 * 对齐旧系统 loadData 的循环: popen[i] = (popen[i+1] + pclose[i+1]) / 2。
	 */
	public static void backfillPOpen(Iterable<Bar> bars) {
		// 收集到列表方便按索引访问
		java.util.List<Bar> list = new java.util.ArrayList<>();
		bars.forEach(list::add);
		for (int i = list.size() - 1; i >= 0; i--) {
			Bar b = list.get(i);
			if (i == list.size() - 1) {
				b.popen = b.pclose;
			} else {
				Bar prev = list.get(i + 1);
				b.popen = (prev.popen + prev.pclose) / 2.0;
			}
		}
	}
}
