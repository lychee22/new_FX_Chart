package com.prosticks.chart.generator;

import com.prosticks.chart.model.Bar;
import com.prosticks.chart.model.Instrument;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 确定性模拟行情数据生成器 —— Java 移植自旧系统 {@code simplechart.js#getSampleData(sym)}。
 *
 * <p>核心设计:
 * <ul>
 *   <li>每个 code 固定一个种子,生成的序列确定且可复现 (刷新结果一致)。</li>
 *   <li>几何随机游走生成 ~300 根 K 线; 派生 mp/mc/vap/vam/ut/lt 保证 Prosticks 内部一致性。</li>
 *   <li>时间戳从固定终点 (2020-05-29 20:59 UTC) 倒推, 跳过周末。</li>
 * </ul>
 */
@Component
public class SampleDataGenerator {

	/** 34 个品种的 [参考价, 年化波动率] 表, 完整对齐旧系统 specs。 */
	private static final Map<String, double[]> SPECS = new HashMap<>();

	static {
		// 从旧系统 getSampleData specs 字典移植
		SPECS.put("JPY",     new double[]{108.5,  0.08});
		SPECS.put("AUD",     new double[]{0.700,  0.09});
		SPECS.put("EUR",     new double[]{1.115,  0.07});
		SPECS.put("GBP",     new double[]{1.270,  0.09});
		SPECS.put("CAD",     new double[]{1.330,  0.07});
		SPECS.put("CHF",     new double[]{0.990,  0.07});
		SPECS.put("NZD",     new double[]{0.660,  0.10});
		SPECS.put("XAU",     new double[]{1420,   0.14});
		SPECS.put("XAG",     new double[]{16.5,   0.22});
		SPECS.put("CNY",     new double[]{6.90,   0.04});
		SPECS.put("CNH",     new double[]{6.95,   0.05});
		SPECS.put("HKD",     new double[]{7.83,   0.02});
		SPECS.put("SGD",     new double[]{1.365,  0.05});
		SPECS.put("EURAUD",  new double[]{1.620,  0.08});
		SPECS.put("EURCAD",  new double[]{1.485,  0.07});
		SPECS.put("EURCHF",  new double[]{1.105,  0.05});
		SPECS.put("EURGBP",  new double[]{0.880,  0.06});
		SPECS.put("EURJPY",  new double[]{121.0,  0.09});
		SPECS.put("EURNZD",  new double[]{1.690,  0.09});
		SPECS.put("GBPAUD",  new double[]{1.815,  0.10});
		SPECS.put("GBPCAD",  new double[]{1.690,  0.09});
		SPECS.put("GBPCHF",  new double[]{1.258,  0.08});
		SPECS.put("GBPJPY",  new double[]{137.8,  0.11});
		SPECS.put("GBPNZD",  new double[]{1.925,  0.11});
		SPECS.put("AUDCAD",  new double[]{0.930,  0.07});
		SPECS.put("AUDCHF",  new double[]{0.693,  0.08});
		SPECS.put("AUDJPY",  new double[]{76.0,   0.11});
		SPECS.put("AUDNZD",  new double[]{1.060,  0.07});
		SPECS.put("CADCHF",  new double[]{0.745,  0.06});
		SPECS.put("CADJPY",  new double[]{81.5,   0.10});
		SPECS.put("CHFJPY",  new double[]{109.5,  0.10});
		SPECS.put("NZDCAD",  new double[]{0.875,  0.08});
		SPECS.put("NZDCHF",  new double[]{0.654,  0.09});
		SPECS.put("NZDJPY",  new double[]{71.5,   0.12});
		SPECS.put("SGDJPY",  new double[]{79.5,   0.08});
	}

	/** 小数位规则 (对齐旧系统 setChartParam): >=100 用 2, 否则 4。 */
	public static int decimalsFor(double refPrice) {
		return (refPrice >= 100) ? 2 : 4;
	}

	/**
	 * 为指定品种生成 numBars 根确定性 K 线 (从最旧 → 最新排列)。
	 *
	 * <p>时间戳和波动率均按 interval 缩放: 小时线每根间隔对应小时,
	 * 日线间隔1个交易日, 周线间隔1周, 月线间隔1月。波动率按每年周期数折算。
	 *
	 * @param sym      品种代码
	 * @param interval 时间周期 (ChartConstants.INTERVAL_*)
	 * @param numBars  K 线数量
	 */
	public List<Bar> generate(String sym, int interval, int numBars) {
		double[] spec = SPECS.getOrDefault(sym, new double[]{100, 0.08});
		double basePrice = spec[0];
		double annVol = spec[1];

		int decimals = decimalsFor(basePrice);
		double mul = Math.pow(10, decimals); // 用于四舍五入的倍数

		SeededRng rng = new SeededRng(seedFromString(sym) * 31 + interval);

		// 每年的 bar 数: 用于把年化波动率折算成 per-bar 波动率
		int periodsPerYear = periodsPerYear(interval);
		double sigma = annVol / Math.sqrt(periodsPerYear);
		double drift = 0.0;

		double price = round(basePrice * (1 - 0.04 * gauss(rng)), mul);
		List<Bar> bars = new ArrayList<>(numBars);

		// 新日期终点: 2020-05-29 20:59 UTC (与旧系统一致)
		LocalDateTime endLdt = LocalDateTime.of(2020, 5, 29, 20, 59);

		for (int i = 0; i < numBars; i++) {
			double ret = drift + sigma * gauss(rng);
			double o = price;
			double c = round(o * Math.exp(ret), mul);

			double range = Math.abs(o) * sigma * (0.6 + 1.2 * rng.next());
			double hi = round(Math.max(o, c) + range * rng.next(), mul);
			double lo = round(Math.min(o, c) - range * rng.next(), mul);

			double body = hi - lo;
			double mp = round(lo + body * (0.35 + 0.30 * rng.next()), mul);
			int mc = 40 + (int) Math.floor(180 * rng.next());
			double vam = round(mp + (rng.next() - 0.5) * body * 0.5, mul);
			double vap = round((mp * 0.6) + ((o + hi + lo + c) / 4.0) * 0.4, mul);

			double ut = (rng.next() < 0.45) ? round(hi - body * (0.05 + 0.15 * rng.next()), mul) : 0;
			double lt = (rng.next() < 0.45) ? round(lo + body * (0.05 + 0.15 * rng.next()), mul) : 0;

			// 时间: 从终点倒推, 按 interval 步进
			LocalDateTime barLdt = shiftBackward(endLdt, interval, numBars - 1 - i);
			long barMs = barLdt.toEpochSecond(ZoneOffset.UTC) * 1000L;
			long dtInt = parseDtToInt(barLdt);

			Bar bar = new Bar(dtInt, o, hi, lo, c, 0, vap, vam, mp, mc, ut, lt);
			bar.time = barMs / 1000;
			bars.add(bar);

			price = c;
		}

		// 二次填充 popen (依赖下一根 pclose, 旧系统从最新往最旧算)
		for (int i = bars.size() - 1; i >= 0; i--) {
			Bar b = bars.get(i);
			if (i == bars.size() - 1) {
				b.popen = b.pclose;
			} else {
				Bar prev = bars.get(i + 1);
				b.popen = (prev.popen + prev.pclose) / 2.0;
			}
		}

		return bars;
	}

	private static long parseDtToInt(LocalDateTime ldt) {
		// 组成 YYYYMMDDHHMM 整数 (字符串拼接, 避免数值溢出)
		String s = String.format("%04d%02d%02d%02d%02d",
				ldt.getYear(), ldt.getMonthValue(), ldt.getDayOfMonth(),
				ldt.getHour(), ldt.getMinute());
		return Long.parseLong(s);
	}

	/** 按周期返回每年的 bar 数 (用于波动率折算)。 */
	private static int periodsPerYear(int interval) {
		switch (interval) {
			case 0:  return 252;          // 日线: ~252 交易日/年
			case 1:  return 52;           // 周线
			case 2:  return 12;           // 月线
			case 3:  return 252 * 1440;   // 1分钟
			case 4:  return 252 * 288;    // 5分钟
			case 5:  return 252 * 144;    // 10分钟
			case 6:  return 252 * 96;     // 15分钟
			case 7:  return 252 * 48;     // 30分钟
			case 8:  return 252 * 24;     // 1小时
			case 9:  return 252 * 12;     // 2小时
			case 10: return 252 * 6;      // 4小时
			default: return 252;
		}
	}

	/** 从基准时间向过去倒推 steps 个周期, 跳过周末 (仅日线及以上)。 */
	private static LocalDateTime shiftBackward(LocalDateTime base, int interval, int steps) {
		LocalDateTime t = base;
		int count = 0;
		while (count < steps) {
			switch (interval) {
				case 2:  t = t.minusMonths(1); count++; break;   // 月线
				case 1:  t = t.minusWeeks(1); count++; break;    // 周线
				case 0:                                          // 日线: 跳周末
					t = t.minusDays(1);
					if (t.getDayOfWeek().getValue() <= 5) count++; // 周一到周五才算
					break;
				case 3:  t = t.minusMinutes(1); count++; break;  // 1分钟
				case 4:  t = t.minusMinutes(5); count++; break;  // 5分钟
				case 5:  t = t.minusMinutes(10); count++; break; // 10分钟
				case 6:  t = t.minusMinutes(15); count++; break; // 15分钟
				case 7:  t = t.minusMinutes(30); count++; break; // 30分钟
				case 8:  t = t.minusHours(1); count++; break;    // 1小时
				case 9:  t = t.minusHours(2); count++; break;    // 2小时
				case 10: t = t.minusHours(4); count++; break;    // 4小时
				default: t = t.minusDays(1); count++; break;
			}
		}
		return t;
	}

	private static double round(double x, double mul) {
		return Math.round(x * mul) / mul;
	}

	/** Box-Muller 高斯采样, 与旧系统一致。 */
	private static double gauss(SeededRng rng) {
		double u = Math.sqrt(-2 * Math.log(rng.next() + 1e-12));
		double v = 2 * Math.PI * rng.next();
		return u * Math.cos(v);
	}

	/** 把字符串哈希成 32 位种子, 移植自旧系统 _chartSeed(str)。 */
	private static int seedFromString(String str) {
		int hash = 0;
		for (int i = 0; i < str.length(); i++) {
			hash = ((hash << 5) - hash) + str.charAt(i);
			hash |= 0; // 转 32 位整数
		}
		return hash;
	}

	/**
	 * 确定性线性同余 PRNG, 移植自旧系统 _chartRand(seed)。
	 * 返回 [0,1) 的 double。
	 */
	private static final class SeededRng {
		private long state;

		SeededRng(int seed) {
			this.state = seed & 0xFFFFFFFFL;
			if (this.state == 0) this.state = 0x1;
		}

		double next() {
			// 经典 LCG 参数 (glibc)
			state = (state * 1103515245L + 12345L) & 0x7FFFFFFFL;
			return state / (double) 0x7FFFFFFFL;
		}
	}
}
