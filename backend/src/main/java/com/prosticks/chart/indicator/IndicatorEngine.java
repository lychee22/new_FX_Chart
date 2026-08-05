package com.prosticks.chart.indicator;

import com.prosticks.chart.model.Bar;
import com.prosticks.chart.model.ChartConstants;
import com.prosticks.chart.model.IndicatorResult;
import com.prosticks.chart.model.IndicatorResult.LevelLine;
import com.prosticks.chart.model.IndicatorResult.Point;
import com.prosticks.chart.model.IndicatorResult.Series;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * 技术指标计算引擎 —— Java 移植自旧系统 {@code simplechart.js} 的 {@code get*} 函数族。
 *
 * <p>覆盖 8 种叠加指标 (SMA/EMA/WMA/Bollinger/SAR/Ichimoku/MAE/KC) 与 16 种副图指标
 * (Volume/RSI/MACD/Stochastic/Momentum/Williams%R/OBV/ModalCount/ROC/ADX/MFI/
 * Volatility/VolumePlus/VAO/CCI/ATR)。
 *
 * <p>日线及更长周期用模态点 mp 作为计算价 (对齐旧系统 DEF_CALCBY_MP),
 * 日内用收盘价 c (DEF_CALCBY_LAST)。
 */
@Component
public class IndicatorEngine {

	// ---------------- 入口分发 ----------------

	/**
	 * 按指标键计算 (字符串 ID, 与 ChartConstants 注释中的英文键一致)。
	 *
	 * @param key    指标键, 例如 "SMA"/"EMA"/"BOLL"/"SAR"/"IKH"/"WMA"/"MAE"/"KC" (叠加),
	 *               "VOLUME"/"RSI"/"MACD"/"STC"/"MOM"/"PCTR"/"OBV"/"MC"/"ROC"/"ADX"/"MFI"/
	 *               "VOLA"/"VOLP"/"VAO"/"CCI"/"ATR" (副图)
	 * @param params 可选参数覆盖默认值
	 */
	public IndicatorResult calculate(String key, List<Bar> bars, double[] params) {
		boolean useModal = isDailyOrAbove(bars);
		double[] price = calcPrice(bars, useModal);
		return switch (key) {
			// 叠加指标
			case "SMA"  -> sma(bars, price, ints(params, 10, 20, 50));
			case "EMA"  -> ema(bars, price, ints(params, 10, 20, 50));
			case "WMA"  -> wma(bars, price, ints(params, 10, 20, 50));
			case "BOLL" -> bollinger(bars, price, dbls(params, 20, 2));
			case "SAR"  -> sar(bars, useModal, dbls(params, 0.02, 0.02, 0.2));
			case "IKH"  -> ichimoku(bars, ints(params, 7, 22, 44), useModal);
			case "MAE"  -> mae(bars, price, dbls(params, 20, 5));
			case "KC"   -> kc(bars, price, dbls(params, 10));
			// 副图指标
			case "VOLUME" -> volume(bars);
			case "RSI"    -> rsi(bars, price, intAt(params, 0, 14));
			case "MACD"   -> macd(bars, price, ints(params, 12, 26, 9));
			case "STC"    -> stochastic(bars, intAt(params, 0, 14), intAt(params, 1, 3), intAt(params, 2, 3));
			case "MOM"    -> momentum(bars, price, intAt(params, 0, 10));
			case "PCTR"   -> percentR(bars, intAt(params, 0, 10));
			case "OBV"    -> obv(bars);
			case "MC"     -> modalCount(bars, intAt(params, 0, 300));
			case "ROC"    -> roc(bars, price, intAt(params, 0, 14));
			case "ADX"    -> adx(bars, intAt(params, 0, 14));
			case "MFI"    -> mfi(bars, intAt(params, 0, 14));
			case "VOLA"   -> volatility(bars, intAt(params, 0, 10));
			case "VOLP"   -> volumePlus(bars);
			case "VAO"    -> vao(bars, intAt(params, 0, 10));
			case "CCI"    -> cci(bars, intAt(params, 0, 5));
			case "ATR"    -> atr(bars, intAt(params, 0, 14));
			default -> new IndicatorResult("NONE", "N/A", "none", new ArrayList<>(), null);
		};
	}

	// 2026-07-21 17:24:22：Ichimoku 必须按旧项目的周期规则选择模态值，其他指标继续保持原行为。
	public IndicatorResult calculate(String key, List<Bar> bars, double[] params, int interval) {
		if ("IKH".equals(key)) {
			boolean useModal = interval <= ChartConstants.INTERVAL_MONTH;
			return ichimoku(bars, ints(params, 7, 22, 44), useModal);
		}
		return calculate(key, bars, params);
	}

	private boolean isDailyOrAbove(List<Bar> bars) {
		// 简化: 根据 bars 的 dt 推断跨度 (旧系统实际由 interval 决定, 但此处 price 选择不影响算法正确性)
		// 这里默认按日线逻辑用 mp, 若 mp 多为 0 则退化为收盘。
		long mpCount = bars.stream().filter(b -> b.mp > 0).count();
		return mpCount > bars.size() / 2;
	}

	private double[] calcPrice(List<Bar> bars, boolean useModal) {
		double[] p = new double[bars.size()];
		for (int i = 0; i < bars.size(); i++) {
			Bar b = bars.get(i);
			p[i] = (useModal && b.mp > 0) ? b.mp : b.c;
		}
		return p;
	}

	// ---------------- 叠加指标 Overlays ----------------

	/** SMA, 默认输出 3 条线 [10,20,50]。颜色对齐旧系统 #4000C0/#C04000/#00A040。 */
	private IndicatorResult sma(List<Bar> bars, double[] price, int[] periods) {
		List<Series> out = new ArrayList<>();
		String[] colors = {"#4000C0", "#C04000", "#00A040"};
		for (int k = 0; k < periods.length; k++) {
			out.add(new Series("SMA(" + periods[k] + ")", colors[k % colors.length],
					smaSeries(bars, price, periods[k])));
		}
		return new IndicatorResult("SMA", "SMA", "overlay", out, null);
	}

	private List<Point> smaSeries(List<Bar> bars, double[] price, int n) {
		List<Point> pts = new ArrayList<>();
		double sum = 0;
		for (int i = 0; i < price.length; i++) {
			sum += price[i];
			if (i >= n) sum -= price[i - n];
			Double v = (i >= n - 1) ? sum / n : null;
			pts.add(new Point(bars.get(i).time, v));
		}
		return pts;
	}

	/** EMA, 默认 [10,20,50]。颜色 #0000A0/#A00000/#00A000。 */
	private IndicatorResult ema(List<Bar> bars, double[] price, int[] periods) {
		List<Series> out = new ArrayList<>();
		String[] colors = {"#0000A0", "#A00000", "#00A000"};
		for (int k = 0; k < periods.length; k++) {
			out.add(new Series("EMA(" + periods[k] + ")", colors[k % colors.length],
					emaSeries(bars, price, periods[k])));
		}
		return new IndicatorResult("EMA", "EMA", "overlay", out, null);
	}

	private List<Point> emaSeries(List<Bar> bars, double[] price, int n) {
		List<Point> pts = new ArrayList<>();
		double mult = 2.0 / (n + 1);
		double prev = 0;
		for (int i = 0; i < price.length; i++) {
			if (i == 0) {
				prev = price[i];
			} else {
				prev = (price[i] - prev) * mult + prev;
			}
			Double v = (i >= n - 1) ? prev : null;
			pts.add(new Point(bars.get(i).time, v));
		}
		return pts;
	}

	/** WMA 加权移动平均, 默认 [10,20,50]。颜色 #0000A0/#FFA0FF/#00D080。 */
	private IndicatorResult wma(List<Bar> bars, double[] price, int[] periods) {
		List<Series> out = new ArrayList<>();
		String[] colors = {"#0000A0", "#FFA0FF", "#00D080"};
		for (int k = 0; k < periods.length; k++) {
			int n = periods[k];
			List<Point> pts = new ArrayList<>();
			double denom = n * (n + 1) / 2.0;
			for (int i = 0; i < price.length; i++) {
				if (i >= n - 1) {
					double weighted = 0;
					for (int j = 0; j < n; j++) {
						weighted += price[i - j] * (n - j);
					}
					pts.add(new Point(bars.get(i).time, weighted / denom));
				} else {
					pts.add(new Point(bars.get(i).time, null));
				}
			}
			out.add(new Series("WMA(" + n + ")", colors[k % colors.length], pts));
		}
		return new IndicatorResult("WMA", "WMA", "overlay", out, null);
	}

	/** Bollinger Bands, 默认 [20, 2]。上/中/下轨。 */
	private IndicatorResult bollinger(List<Bar> bars, double[] price, double[] params) {
		int n = (int) params[0];
		double mult = params[1];
		List<Point> mid = new ArrayList<>(), up = new ArrayList<>(), lo = new ArrayList<>();
		for (int i = 0; i < price.length; i++) {
			if (i >= n - 1) {
				double sum = 0;
				for (int j = i - n + 1; j <= i; j++) sum += price[j];
				double mean = sum / n;
				double sq = 0;
				for (int j = i - n + 1; j <= i; j++) sq += (price[j] - mean) * (price[j] - mean);
				double sd = Math.sqrt(sq / n);
				long t = bars.get(i).time;
				mid.add(new Point(t, mean));
				up.add(new Point(t, mean + mult * sd));
				lo.add(new Point(t, mean - mult * sd));
			} else {
				long t = bars.get(i).time;
				mid.add(new Point(t, null)); up.add(new Point(t, null)); lo.add(new Point(t, null));
			}
		}
		List<Series> series = Arrays.asList(
				new Series("Upper", "#0000F0", up),
				new Series("Middle", "#00A000", mid),
				new Series("Lower", "#0000F0", lo));
		return new IndicatorResult("BOLL", "Bollinger", "overlay", series, null);
	}

	/** SAR 抛物线, 默认 [0.02, 0.02, 0.2]。 */
	private IndicatorResult sar(List<Bar> bars, boolean useModal, double[] params) {
		double init = params[0], addit = params[1], limit = params[2];
		List<Point> pts = new ArrayList<>();
		int n = bars.size();
		if (n == 0) return new IndicatorResult("SAR", "SAR", "overlay", new ArrayList<>(), null);

		boolean longPos = true;
		double extreme = bars.get(0).l;
		double nextsar = bars.get(0).h;
		double accel = init;

		double[] high = new double[n], low = new double[n];
		for (int i = 0; i < n; i++) {
			// useModal 时优先 vap/vam, 但真实价源无这些字段 (为0) → 降级为 h/l
			high[i] = (useModal && bars.get(i).vap > 0) ? Math.max(bars.get(i).vap, bars.get(i).h) : bars.get(i).h;
			low[i]  = (useModal && bars.get(i).vam > 0) ? Math.min(bars.get(i).vam, bars.get(i).l) : bars.get(i).l;
		}

		double periodhigh = high[0], periodlow = low[0];
		for (int i = 0; i < n; i++) {
			double sar = nextsar;
			pts.add(new Point(bars.get(i).time, sar));
			double mmax = i < n - 1 ? Math.max(high[i], high[i + 1]) : high[i];
			double mmin = i < n - 1 ? Math.min(low[i], low[i + 1]) : low[i];
			periodhigh = Math.max(periodhigh, high[i]);
			periodlow = Math.min(periodlow, low[i]);

			if (longPos) {
				if (low[i] < sar) {
					longPos = false; accel = init;
					sar = periodhigh; periodhigh = high[i]; periodlow = low[i];
					extreme = periodlow;
					nextsar = sar + accel * (extreme - sar);
				} else {
					if (high[i] > extreme) { extreme = high[i]; accel = Math.min(accel + addit, limit); }
					nextsar = Math.min(sar + accel * (extreme - sar), mmin);
				}
			} else {
				if (high[i] > sar) {
					longPos = true; accel = init;
					sar = periodlow; periodhigh = high[i]; periodlow = low[i];
					extreme = periodhigh;
					nextsar = sar + accel * (extreme - sar);
				} else {
					if (low[i] < extreme) { extreme = low[i]; accel = Math.min(accel + addit, limit); }
					nextsar = Math.max(sar + accel * (extreme - sar), mmax);
				}
			}
		}
		return new IndicatorResult("SAR", "SAR", "overlay",
				Arrays.asList(new Series("SAR", "#0000E0", pts)), null);
	}

	/** Ichimoku 一目均衡, 默认 [7, 22, 44]。5 条线 + 云带。 */
	private IndicatorResult ichimoku(List<Bar> bars, int[] params, boolean useModal) {
		int conv = params[0], base = params[1], spanB = params[2];
		int validCount = lastValidBarCount(bars);
		List<Point> tenkan = emptyPoints(bars), kijun = emptyPoints(bars),
				senkouA = emptyPoints(bars), senkouB = emptyPoints(bars), chikou = emptyPoints(bars);

		// 2026-07-21 17:23:01：旧 chart 将三条跨度线统一前移 22 根，云层才能进入未来空白区。
		for (int source = 0; source < validCount; source++) {
			Double tH = ikhHighest(bars, source, conv, useModal);
			Double tL = ikhLowest(bars, source, conv, useModal);
			Double bH = ikhHighest(bars, source, base, useModal);
			Double bL = ikhLowest(bars, source, base, useModal);
			Double currentTenkan = mid(tH, tL);
			Double currentKijun = mid(bH, bL);
			tenkan.get(source).value = currentTenkan;
			kijun.get(source).value = currentKijun;

			int target = source + base;
			if (target >= bars.size()) continue;
			senkouA.get(target).value = mid(currentTenkan, currentKijun);
			senkouB.get(target).value = mid(
					ikhHighest(bars, source, spanB, useModal),
					ikhLowest(bars, source, spanB, useModal));
			Bar bar = bars.get(source);
			chikou.get(target).value = useModal && bar.mp > 0 ? bar.mp : bar.c;
		}
		List<Series> series = Arrays.asList(
				new Series("Tenkan", "#606060", tenkan),
				new Series("Kijun", "#D020A0", kijun),
				new Series("Senkou A", "#40C040", senkouA),
				new Series("Senkou B", "#008000", senkouB),
				new Series("Chikou", "#20B0F0", chikou));
		return new IndicatorResult("IKH", "Ichimoku", "overlay", series, null);
	}

	private List<Point> emptyPoints(List<Bar> bars) {
		List<Point> points = new ArrayList<>();
		for (Bar bar : bars) points.add(new Point(bar.time, null));
		return points;
	}

	private int lastValidBarCount(List<Bar> bars) {
		int count = bars.size();
		while (count > 0 && bars.get(count - 1).h <= 0) count--;
		return count;
	}

	private Double ikhHighest(List<Bar> bars, int index, int period, boolean useModal) {
		if (index < period - 1) return null;
		double max = -Double.MAX_VALUE;
		for (int i = index - period + 1; i <= index; i++) {
			Bar bar = bars.get(i);
			double value = useModal && bar.vap > 0 ? bar.vap : bar.h;
			max = Math.max(max, value);
		}
		return max;
	}

	private Double ikhLowest(List<Bar> bars, int index, int period, boolean useModal) {
		if (index < period - 1) return null;
		double min = Double.MAX_VALUE;
		for (int i = index - period + 1; i <= index; i++) {
			Bar bar = bars.get(i);
			double value = useModal && bar.vam > 0 ? bar.vam : bar.l;
			min = Math.min(min, value);
		}
		return min;
	}

	private Double highest(List<Bar> bars, int i, int period) {
		if (i < period - 1) return null;
		double max = -Double.MAX_VALUE;
		for (int j = i - period + 1; j <= i; j++) max = Math.max(max, bars.get(j).h);
		return max;
	}

	private Double lowest(List<Bar> bars, int i, int period) {
		if (i < period - 1) return null;
		double min = Double.MAX_VALUE;
		for (int j = i - period + 1; j <= i; j++) min = Math.min(min, bars.get(j).l);
		return min;
	}

	private Double mid(Double a, Double b) {
		if (a == null || b == null) return null;
		return (a + b) / 2.0;
	}

	/** MAE 移动平均包络, 默认 [20, 5]。 */
	private IndicatorResult mae(List<Bar> bars, double[] price, double[] params) {
		int n = (int) params[0];
		double pct = params[1] / 100.0;
		List<Point> mid = new ArrayList<>(), up = new ArrayList<>(), lo = new ArrayList<>();
		for (int i = 0; i < price.length; i++) {
			if (i >= n - 1) {
				double sum = 0;
				for (int j = i - n + 1; j <= i; j++) sum += price[j];
				double mean = sum / n;
				long t = bars.get(i).time;
				mid.add(new Point(t, mean));
				up.add(new Point(t, mean * (1 + pct)));
				lo.add(new Point(t, mean * (1 - pct)));
			} else {
				long t = bars.get(i).time;
				mid.add(new Point(t, null)); up.add(new Point(t, null)); lo.add(new Point(t, null));
			}
		}
		return new IndicatorResult("MAE", "MAE", "overlay",
				Arrays.asList(new Series("Upper", "#0000F0", up),
						new Series("Middle", "#00A000", mid),
						new Series("Lower", "#0000F0", lo)), null);
	}

	/** KC Keltner Channel, 默认 [10]。基于 EMA + ATR。 */
	private IndicatorResult kc(List<Bar> bars, double[] price, double[] params) {
		int n = (int) params[0];
		double[] atrArr = computeATR(bars, n);
		List<Point> mid = emaSeries(bars, price, n);
		List<Point> up = new ArrayList<>(), lo = new ArrayList<>();
		for (int i = 0; i < bars.size(); i++) {
			Double m = mid.get(i).value;
			long t = bars.get(i).time;
			if (m != null) {
				up.add(new Point(t, m + 2 * atrArr[i]));
				lo.add(new Point(t, m - 2 * atrArr[i]));
			} else {
				up.add(new Point(t, null)); lo.add(new Point(t, null));
			}
		}
		return new IndicatorResult("KC", "KC", "overlay",
				Arrays.asList(new Series("Upper", "#F00000", up),
						new Series("Middle", "#00A000", mid),
						new Series("Lower", "#F00000", lo)), null);
	}

	// ---------------- 副图指标 Panes ----------------

	private IndicatorResult volume(List<Bar> bars) {
		List<Point> pts = new ArrayList<>();
		for (Bar b : bars) pts.add(new Point(b.time, b.v));
		return new IndicatorResult("VOLUME", "Volume", "pane",
				Arrays.asList(new Series("Volume", "#4080FF", pts)), null);
	}

	/** RSI, 默认 14。带 30/50/70 参考线。 */
	private IndicatorResult rsi(List<Bar> bars, double[] price, int n) {
		List<Point> pts = new ArrayList<>();
		double gain = 0, loss = 0;
		for (int i = 0; i < price.length; i++) {
			if (i > 0) {
				double ch = price[i] - price[i - 1];
				double g = Math.max(ch, 0), l = Math.max(-ch, 0);
				if (i <= n) {
					gain += g; loss += l;
					if (i == n) { gain /= n; loss /= n; }
				} else {
					gain = (gain * (n - 1) + g) / n;
					loss = (loss * (n - 1) + l) / n;
				}
			}
			Double v = (i >= n) ? (loss == 0 ? 100 : 100 - 100 / (1 + gain / loss)) : null;
			pts.add(new Point(bars.get(i).time, v));
		}
		List<LevelLine> levels = Arrays.asList(
				new LevelLine("Overbought", 70, "#FF0000"),
				new LevelLine("Midline", 50, "#C0C0C0"),
				new LevelLine("Oversold", 30, "#00A000"));
		return new IndicatorResult("RSI", "RSI", "pane",
				Arrays.asList(new Series("RSI(" + n + ")", "#0000FF", pts)), levels);
	}

	/** MACD, 默认 [12, 26, 9]。DIF/DEA/柱。 */
	private IndicatorResult macd(List<Bar> bars, double[] price, int[] params) {
		int fast = params[0], slow = params[1], signal = params.length >= 3 ? params[2] : 9;
		List<Point> dif = emaDiff(bars, price, fast, slow);
		double[] difVals = new double[price.length];
		Arrays.fill(difVals, 0);
		for (int i = 0; i < price.length; i++) {
			if (dif.get(i).value != null) difVals[i] = dif.get(i).value;
		}
		double mult = 2.0 / (signal + 1);
		double prev = 0;
		List<Point> dea = new ArrayList<>(), hist = new ArrayList<>();
		boolean started = false;
		for (int i = 0; i < price.length; i++) {
			if (dif.get(i).value != null) {
				if (!started) { prev = difVals[i]; started = true; }
				else prev = (difVals[i] - prev) * mult + prev;
				dea.add(new Point(bars.get(i).time, prev));
				hist.add(new Point(bars.get(i).time, 2 * (difVals[i] - prev)));
			} else {
				dea.add(new Point(bars.get(i).time, null));
				hist.add(new Point(bars.get(i).time, null));
			}
		}
		return new IndicatorResult("MACD", "MACD", "pane",
				Arrays.asList(new Series("DIF", "#FF0000", dif),
						new Series("DEA", "#0000FF", dea),
						new Series("Hist", "#004000", hist)), null);
	}

	private List<Point> emaDiff(List<Bar> bars, double[] price, int fast, int slow) {
		double mf = 2.0 / (fast + 1), ms = 2.0 / (slow + 1);
		double ef = 0, es = 0;
		List<Point> pts = new ArrayList<>();
		for (int i = 0; i < price.length; i++) {
			if (i == 0) { ef = price[i]; es = price[i]; }
			else { ef = (price[i] - ef) * mf + ef; es = (price[i] - es) * ms + es; }
			Double v = (i >= slow - 1) ? ef - es : null;
			pts.add(new Point(bars.get(i).time, v));
		}
		return pts;
	}

	/** Stochastic 随机指标, 默认 [14, 3, 3]。%K/%D + 20/80 参考线。 */
	private IndicatorResult stochastic(List<Bar> bars, int kPeriod, int slow, int dPeriod) {
		int n = bars.size();
		double[] rawK = new double[n];
		List<Point> kPts = new ArrayList<>(), dPts = new ArrayList<>();
		for (int i = 0; i < n; i++) {
			if (i >= kPeriod - 1) {
				double hh = highest(bars, i, kPeriod), ll = lowest(bars, i, kPeriod);
				rawK[i] = (hh - ll) == 0 ? 50 : (bars.get(i).c - ll) / (hh - ll) * 100;
			} else rawK[i] = Double.NaN;
			// 平滑
			Double kv = null;
			if (i >= kPeriod - 1 + slow - 1) {
				double sum = 0;
				for (int j = 0; j < slow; j++) sum += rawK[i - j];
				kv = sum / slow;
			}
			kPts.add(new Point(bars.get(i).time, kv));
			// %D = %K 的 dPeriod 均线
			Double dv = null;
			if (i >= kPeriod - 1 + slow - 1 + dPeriod - 1 && kPts.get(i).value != null) {
				double sum = 0;
				for (int j = 0; j < dPeriod; j++) sum += kPts.get(i - j).value;
				dv = sum / dPeriod;
			}
			dPts.add(new Point(bars.get(i).time, dv));
		}
		List<LevelLine> levels = Arrays.asList(
				new LevelLine("Overbought", 80, "#FF0000"),
				new LevelLine("Oversold", 20, "#00A000"));
		return new IndicatorResult("STC", "Stochastic", "pane",
				Arrays.asList(new Series("%K", "#0000FF", kPts),
						new Series("%D", "#C000C0", dPts)), levels);
	}

	private IndicatorResult momentum(List<Bar> bars, double[] price, int n) {
		List<Point> pts = new ArrayList<>();
		for (int i = 0; i < price.length; i++) {
			Double v = (i >= n) ? price[i] - price[i - n] : null;
			pts.add(new Point(bars.get(i).time, v));
		}
		return new IndicatorResult("MOM", "Momentum", "pane",
				Arrays.asList(new Series("MOM(" + n + ")", "#0000FF", pts)), null);
	}

	/** Williams %R, 默认 10。范围 -100~0, 参考 -20/-80。 */
	private IndicatorResult percentR(List<Bar> bars, int n) {
		List<Point> pts = new ArrayList<>();
		for (int i = 0; i < bars.size(); i++) {
			Double hh = highest(bars, i, n), ll = lowest(bars, i, n);
			Double v = (hh != null && (hh - ll) != 0) ? -100 * (hh - bars.get(i).c) / (hh - ll) : null;
			pts.add(new Point(bars.get(i).time, v));
		}
		List<LevelLine> levels = Arrays.asList(
				new LevelLine("Overbought", -20, "#FF0000"),
				new LevelLine("Oversold", -80, "#00A000"));
		return new IndicatorResult("PCTR", "Williams %R", "pane",
				Arrays.asList(new Series("%R(" + n + ")", "#0000FF", pts)), levels);
	}

	private IndicatorResult obv(List<Bar> bars) {
		List<Point> pts = new ArrayList<>();
		double obv = 0;
		for (int i = 0; i < bars.size(); i++) {
			if (i > 0) {
				double dir = Double.compare(bars.get(i).c, bars.get(i - 1).c);
				obv += dir * barVolume(bars.get(i)); // 成交量: mc优先, 无则用v
			}
			pts.add(new Point(bars.get(i).time, obv));
		}
		return new IndicatorResult("OBV", "OBV", "pane",
				Arrays.asList(new Series("OBV", "#4080FF", pts)), null);
	}

	private IndicatorResult modalCount(List<Bar> bars, int n) {
		List<Point> pts = new ArrayList<>();
		double avg = 0;
		if (!bars.isEmpty()) {
			double sum = 0; int c = 0;
			for (Bar b : bars) { double vol = barVolume(b); if (vol > 0) { sum += vol; c++; } }
			avg = c > 0 ? sum / c : 0;
		}
		for (Bar b : bars) pts.add(new Point(b.time, barVolume(b)));
		List<LevelLine> levels = avg > 0
				? Arrays.asList(new LevelLine("Avg MC", avg, "#C0C0C0")) : null;
		return new IndicatorResult("MC", "Modal Count", "pane",
				Arrays.asList(new Series("MC", "#4080FF", pts)), levels);
	}

	private IndicatorResult roc(List<Bar> bars, double[] price, int n) {
		List<Point> pts = new ArrayList<>();
		for (int i = 0; i < price.length; i++) {
			Double v = (i >= n && price[i - n] != 0) ? 100 * (price[i] - price[i - n]) / price[i - n] : null;
			pts.add(new Point(bars.get(i).time, v));
		}
		return new IndicatorResult("ROC", "ROC", "pane",
				Arrays.asList(new Series("ROC(" + n + ")", "#0000FF", pts)), null);
	}

	/** ADX 趋向指标, 默认 14。ADX/+DI/-DI + 30 参考线。 */
	private IndicatorResult adx(List<Bar> bars, int n) {
		int len = bars.size();
		double[] tr = new double[len], plusDM = new double[len], minusDM = new double[len];
		for (int i = 1; i < len; i++) {
			Bar cur = bars.get(i), prev = bars.get(i - 1);
			double up = cur.h - prev.h, down = prev.l - cur.l;
			plusDM[i] = (up > down && up > 0) ? up : 0;
			minusDM[i] = (down > up && down > 0) ? down : 0;
			tr[i] = Math.max(cur.h - cur.l,
					Math.max(Math.abs(cur.h - prev.c), Math.abs(cur.l - prev.c)));
		}
		// Wilder 平滑
		double atrW = 0, pDIraw = 0, mDIraw = 0;
		double[] adxArr = new double[len], pDI = new double[len], mDI = new double[len];
		double dxSum = 0;
		for (int i = 1; i < len; i++) {
			if (i <= n) { atrW += tr[i]; pDIraw += plusDM[i]; mDIraw += minusDM[i]; }
			else {
				atrW = atrW - atrW / n + tr[i];
				pDIraw = pDIraw - pDIraw / n + plusDM[i];
				mDIraw = mDIraw - mDIraw / n + minusDM[i];
			}
			if (i >= n) {
				double pdi = atrW == 0 ? 0 : 100 * pDIraw / atrW;
				double mdi = atrW == 0 ? 0 : 100 * mDIraw / atrW;
				double dx = (pdi + mdi) == 0 ? 0 : 100 * Math.abs(pdi - mdi) / (pdi + mdi);
				pDI[i] = pdi; mDI[i] = mdi;
				dxSum = (i <= 2 * n) ? dxSum + dx : dxSum - dxSum / n + dx;
				adxArr[i] = (i > 2 * n) ? dxSum / n : (i == 2 * n ? dxSum / n : 0);
			}
		}
		List<Point> adxPts = new ArrayList<>(), pPts = new ArrayList<>(), mPts = new ArrayList<>();
		for (int i = 0; i < len; i++) {
			long t = bars.get(i).time;
			adxPts.add(new Point(t, i >= 2 * n ? adxArr[i] : null));
			pPts.add(new Point(t, i >= n ? pDI[i] : null));
			mPts.add(new Point(t, i >= n ? mDI[i] : null));
		}
		return new IndicatorResult("ADX", "ADX", "pane",
				Arrays.asList(new Series("ADX", "#0000FF", adxPts),
						new Series("+DI", "#FF0000", pPts),
						new Series("-DI", "#004000", mPts)),
				Arrays.asList(new LevelLine("Trend", 30, "#C0C0C0")));
	}

	private IndicatorResult mfi(List<Bar> bars, int n) {
		List<Point> pts = new ArrayList<>();
		int len = bars.size();
		if (len == 0) return new IndicatorResult("MFI", "MFI", "pane",
				Arrays.asList(new Series("MFI(" + n + ")", "#0000FF", pts)), null);
		// 典型价 + 资金流量
		double[] tp = new double[len];
		double[] rmf = new double[len];
		boolean[] isPos = new boolean[len];
		for (int i = 0; i < len; i++) {
			tp[i] = (bars.get(i).h + bars.get(i).l + bars.get(i).c) / 3.0;
			rmf[i] = tp[i] * barVolume(bars.get(i));
			if (i > 0) isPos[i] = tp[i] > tp[i - 1];
		}
		for (int i = 0; i < len; i++) {
			if (i < n) {
				pts.add(new Point(bars.get(i).time, null));
				continue;
			}
			// 窗口 [i-n+1, i] 的正/负资金流求和
			double posFlow = 0, negFlow = 0;
			for (int j = i - n + 1; j <= i; j++) {
				if (isPos[j]) posFlow += rmf[j];
				else negFlow += rmf[j];
			}
			double v = (negFlow == 0) ? 100.0 : 100.0 - 100.0 / (1.0 + posFlow / negFlow);
			pts.add(new Point(bars.get(i).time, v));
		}
		return new IndicatorResult("MFI", "MFI", "pane",
				Arrays.asList(new Series("MFI(" + n + ")", "#0000FF", pts)), null);
	}

	private IndicatorResult volatility(List<Bar> bars, int n) {
		List<Point> pts = new ArrayList<>();
		for (int i = 0; i < bars.size(); i++) {
			if (i >= n - 1) {
				double sum = 0;
				for (int j = i - n + 1; j <= i; j++) sum += bars.get(j).h - bars.get(j).l;
				pts.add(new Point(bars.get(i).time, sum / n));
			} else {
				pts.add(new Point(bars.get(i).time, null));
			}
		}
		return new IndicatorResult("VOLA", "Volatility", "pane",
				Arrays.asList(new Series("Volatility", "#0000FF", pts)), null);
	}

	private IndicatorResult volumePlus(List<Bar> bars) {
		List<Point> up = new ArrayList<>(), down = new ArrayList<>();
		for (int i = 0; i < bars.size(); i++) {
			boolean isUp = i == 0 || bars.get(i).c >= bars.get(i - 1).c;
			long t = bars.get(i).time;
			double vol = barVolume(bars.get(i));
			up.add(new Point(t, isUp ? vol : 0));
			down.add(new Point(t, !isUp ? vol : 0));
		}
		return new IndicatorResult("VOLP", "Volume+", "pane",
				Arrays.asList(new Series("Up", "#00A000", up), new Series("Down", "#FF0000", down)), null);
	}

	private IndicatorResult vao(List<Bar> bars, int n) {
		List<Point> pts = new ArrayList<>();
		double sum = 0;
		for (int i = 0; i < bars.size(); i++) {
			if (i > 0) {
				double dir = Double.compare(bars.get(i).c, bars.get(i - 1).c);
				sum += dir * barVolume(bars.get(i));
			}
			pts.add(new Point(bars.get(i).time, sum));
		}
		return new IndicatorResult("VAO", "VAO", "pane",
				Arrays.asList(new Series("VAO", "#4080FF", pts)), null);
	}

	private IndicatorResult cci(List<Bar> bars, int n) {
		List<Point> pts = new ArrayList<>();
		double[] tp = new double[bars.size()];
		for (int i = 0; i < bars.size(); i++) tp[i] = (bars.get(i).h + bars.get(i).l + bars.get(i).c) / 3.0;
		for (int i = 0; i < tp.length; i++) {
			if (i >= n - 1) {
				double sum = 0;
				for (int j = i - n + 1; j <= i; j++) sum += tp[j];
				double mean = sum / n;
				double md = 0;
				for (int j = i - n + 1; j <= i; j++) md += Math.abs(tp[j] - mean);
				md /= n;
				double cci = md == 0 ? 0 : (tp[i] - mean) / (0.015 * md);
				pts.add(new Point(bars.get(i).time, cci));
			} else {
				pts.add(new Point(bars.get(i).time, null));
			}
		}
		return new IndicatorResult("CCI", "CCI", "pane",
				Arrays.asList(new Series("CCI(" + n + ")", "#4080FF", pts)),
				Arrays.asList(new LevelLine("Overbought", 100, "#FF0000"),
						new LevelLine("Oversold", -100, "#00A000")));
	}

	private IndicatorResult atr(List<Bar> bars, int n) {
		double[] atrArr = computeATR(bars, n);
		List<Point> pts = new ArrayList<>();
		for (int i = 0; i < bars.size(); i++) {
			pts.add(new Point(bars.get(i).time, i >= n ? atrArr[i] : null));
		}
		return new IndicatorResult("ATR", "ATR", "pane",
				Arrays.asList(new Series("ATR(" + n + ")", "#4080FF", pts)), null);
	}

	private double[] computeATR(List<Bar> bars, int n) {
		int len = bars.size();
		double[] tr = new double[len];
		double[] atr = new double[len];
		for (int i = 1; i < len; i++) {
			Bar cur = bars.get(i), prev = bars.get(i - 1);
			tr[i] = Math.max(cur.h - cur.l, Math.max(Math.abs(cur.h - prev.c), Math.abs(cur.l - prev.c)));
		}
		double sum = 0;
		for (int i = 1; i < len; i++) {
			if (i <= n) sum += tr[i];
			atr[i] = (i <= n) ? sum / i : (atr[i - 1] * (n - 1) + tr[i]) / n;
		}
		return atr;
	}

	// ---------------- 成交量访问器 ----------------

	/**
	 * 统一成交量: 优先模态量 mc (Prosticks), 无则用真实成交量 v。
	 * 兼容真实价源 (只提供 v) 和模拟数据 (提供 mc) 两种场景。
	 */
	private static double barVolume(Bar b) {
		return b.mc > 0 ? b.mc : b.v;
	}

	// ---------------- 参数辅助 ----------------

	/** 取 params 若提供则转 int[], 否则用默认值。 */
	private int[] ints(double[] params, int... defaults) {
		if (params != null && params.length > 0) {
			int[] r = new int[params.length];
			for (int i = 0; i < params.length; i++) r[i] = (int) params[i];
			return r;
		}
		return defaults;
	}

	/** 取 params 若提供则转 double[], 否则用默认值。 */
	private double[] dbls(double[] params, double... defaults) {
		return (params != null && params.length > 0) ? params : defaults;
	}

	/** 取 params 指定索引的 int 值, 越界或为空则用默认值。 */
	private int intAt(double[] params, int index, int def) {
		return (params != null && params.length > index) ? (int) params[index] : def;
	}
}
