package com.prosticks.chart.service;

import com.prosticks.chart.model.Bar;
import com.prosticks.chart.model.ChartConstants;
import com.prosticks.chart.model.SupportResist;
import com.prosticks.chart.pricesource.PriceSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * 行情数据服务。
 *
 * <p>职责:
 * <ul>
 *   <li>通过 {@link PriceSource} 接口获取 K 线 (价源可替换, 不再硬依赖具体实现)。</li>
 *   <li>实现右端空白扩展 bar (旧系统 DEF_MAX_RIGHT_SHIFT=50)。</li>
 *   <li>计算 support/resist —— 有模态数据时用模态点, 无则降级为传统最高/最低价。</li>
 * </ul>
 */
@Service
public class MarketDataService {

	private static final Logger log = LoggerFactory.getLogger(MarketDataService.class);

	/** 旧系统 DEF_MAX_RIGHT_SHIFT: 右端预留 50 根空白 bar 供绘制扩展。 */
	private static final int MAX_RIGHT_SHIFT = 50;
	/** 默认返回的 K 线数量。 */
	private static final int DEFAULT_COUNT = 300;
	/** 支撑/阻力回看窗口 (传统方法用最近 N 根)。 */
	private static final int SR_LOOKBACK = 60;

	private final PriceSource priceSource;
	private final InstrumentService instrumentService;

	public MarketDataService(PriceSource priceSource, InstrumentService instrumentService) {
		this.priceSource = priceSource;
		this.instrumentService = instrumentService;
		log.info("MarketDataService 使用价源: {}", priceSource.getName());
	}

	/**
	 * 获取 K 线序列。
	 *
	 * @param code     内部品种代码 (如 "JPY")
	 * @param interval 时间周期
	 * @param count    返回的 K 线数量
	 * @param shift    是否在右端追加空白扩展 bar
	 */
	public List<Bar> getBars(String code, int interval, int count, boolean shift) {
		if (!instrumentService.exists(code)) {
			throw new IllegalArgumentException("Unknown instrument code: " + code);
		}
		int n = count <= 0 ? DEFAULT_COUNT : count;
		// 把内部 code 映射为价源 externalSymbol
		String externalSymbol = instrumentService.toExternalSymbol(code);
		List<Bar> bars = priceSource.getBars(externalSymbol, interval, n);
		if (shift) {
			bars = appendRightShiftBars(bars, interval);
		}
		return bars;
	}

	/** 在序列右端追加 MAX_RIGHT_SHIFT 根空白 bar (对齐旧系统 loadData 末尾循环)。 */
	private List<Bar> appendRightShiftBars(List<Bar> bars, int interval) {
		List<Bar> all = new ArrayList<>(bars);
		for (int i = 0; i < MAX_RIGHT_SHIFT; i++) {
			Bar empty = new Bar(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
			empty.localtime = "000000000000";
			empty.mclose = 0;
			empty.popen = 0;
			empty.pclose = 0;
			empty.impmp = false;
			if (!bars.isEmpty()) {
				empty.time = bars.get(bars.size() - 1).time + stepSeconds(interval) * (i + 1);
			}
			all.add(empty);
		}
		return all;
	}

	/** 每个周期对应的秒数, 用于右端空白 bar 时间递增。 */
	private long stepSeconds(int interval) {
		switch (interval) {
			case ChartConstants.INTERVAL_DAY:   return 86400L;
			case ChartConstants.INTERVAL_WEEK:  return 86400L * 7;
			case ChartConstants.INTERVAL_MONTH: return 86400L * 30;
			case ChartConstants.INTERVAL_MIN:   return 60L;
			case ChartConstants.INTERVAL_5MIN:  return 60L * 5;
			case ChartConstants.INTERVAL_10MIN: return 60L * 10;
			case ChartConstants.INTERVAL_15MIN: return 60L * 15;
			case ChartConstants.INTERVAL_30MIN: return 60L * 30;
			case ChartConstants.INTERVAL_HOUR:  return 3600L;
			case ChartConstants.INTERVAL_2HOUR: return 3600L * 2;
			case ChartConstants.INTERVAL_4HOUR: return 3600L * 4;
			default: return 86400L;
		}
	}

	/**
	 * 计算支撑/阻力。
	 *
	 * <p>降级策略:
	 * <ul>
	 *   <li>有模态数据 (mc>0): 用重要模态点 (mc超过均值的) 的最高/最低作阻力/支撑。</li>
	 *   <li>无模态数据 (mc全0, 如真实价源): 降级为最近 SR_LOOKBACK 根 bar 的最高/最低价。</li>
	 * </ul>
	 */
	public SupportResist getSupportResist(String code, int interval) {
		List<Bar> bars = getBars(code, interval, DEFAULT_COUNT, false);

		// 检测是否有模态数据
		long mpCount = bars.stream().filter(b -> b.mc > 0).count();
		boolean hasModal = mpCount > bars.size() / 4; // 超过1/4的bar有模态数据才算

		double supportMP, resistMP, latestMP;
		int averageMC, latestMC;

		if (hasModal) {
			// === 模态数据模式 (Prosticks) ===
			double sumMc = 0;
			int mcCount = 0;
			for (Bar b : bars) {
				if (b.mc > 0) { sumMc += b.mc; mcCount++; }
			}
			double avgMC = mcCount > 0 ? sumMc / mcCount : 0;

			List<Double> importantMPs = new ArrayList<>();
			for (Bar b : bars) {
				if (b.mc > avgMC && b.mp > 0) importantMPs.add(b.mp);
			}
			if (importantMPs.isEmpty()) {
				// 重要模态点为空, 退化为传统方法
				return traditionalSupportResist(bars);
			}
			importantMPs.sort(Comparator.naturalOrder());
			resistMP = importantMPs.get(importantMPs.size() - 1);
			supportMP = importantMPs.get(0);

			double lMP = 0; int lMC = 0;
			for (int i = bars.size() - 1; i >= 0; i--) {
				Bar b = bars.get(i);
				if (b.mp > 0 && b.mc > 0) { lMP = b.mp; lMC = b.mc; break; }
			}
			latestMP = lMP; averageMC = (int) Math.round(avgMC); latestMC = lMC;
		} else {
			// === 传统模式 (真实价源无模态数据) ===
			return traditionalSupportResist(bars);
		}

		return new SupportResist(round(supportMP), round(resistMP), round(latestMP), averageMC, latestMC);
	}

	/**
	 * 传统支撑/阻力: 用最近 SR_LOOKBACK 根 bar 的最高/最低价。
	 * latestMP 用最新收盘价, averageMC/latestMC 用成交量。
	 */
	private SupportResist traditionalSupportResist(List<Bar> bars) {
		int start = Math.max(0, bars.size() - SR_LOOKBACK);
		double high = -Double.MAX_VALUE, low = Double.MAX_VALUE;
		double volSum = 0;
		int volCount = 0;
		for (int i = start; i < bars.size(); i++) {
			Bar b = bars.get(i);
			if (b.h <= 0) continue;
			high = Math.max(high, b.h);
			low = Math.min(low, b.l);
			if (b.v > 0) { volSum += b.v; volCount++; }
		}
		// 最新收盘价作为 latestMP
		double latestClose = 0;
		for (int i = bars.size() - 1; i >= 0; i--) {
			if (bars.get(i).c > 0) { latestClose = bars.get(i).c; break; }
		}
		double avgVol = volCount > 0 ? volSum / volCount : 0;
		double latestVol = 0;
		for (int i = bars.size() - 1; i >= 0; i--) {
			if (bars.get(i).v > 0) { latestVol = bars.get(i).v; break; }
		}
		return new SupportResist(round(low), round(high), round(latestClose),
				(int) Math.round(avgVol), (int) Math.round(latestVol));
	}

	private static double round(double x) {
		return Math.round(x * 10000) / 10000.0;
	}
}
