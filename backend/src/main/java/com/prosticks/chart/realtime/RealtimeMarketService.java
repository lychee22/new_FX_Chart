package com.prosticks.chart.realtime;

import com.prosticks.chart.model.Bar;
import com.prosticks.chart.model.Instrument;
import com.prosticks.chart.service.InstrumentService;
import com.prosticks.chart.service.MarketDataService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 维护按品种和周期共享的模拟实时状态；将来接真实逐笔源时只需替换 tick 输入。
 */
@Service
public class RealtimeMarketService {

	private final MarketDataService marketDataService;
	private final InstrumentService instrumentService;
	private final RealtimeBarAggregator aggregator;
	private final RealtimeProperties properties;
	private final Map<MarketKey, MarketState> states = new ConcurrentHashMap<>();

	public RealtimeMarketService(MarketDataService marketDataService,
			InstrumentService instrumentService, RealtimeBarAggregator aggregator,
			RealtimeProperties properties) {
		this.marketDataService = marketDataService;
		this.instrumentService = instrumentService;
		this.aggregator = aggregator;
		this.properties = properties;
	}

	// 2026-07-21 22:31:46：首次订阅从现有历史数据初始化，保证 REST 首屏和实时柱连续。
	public void subscribe(MarketKey key, long nowMillis) {
		MarketState state = states.computeIfAbsent(key, ignored -> createState(key, nowMillis));
		state.addSubscriber();
	}

	public void unsubscribe(MarketKey key) {
		MarketState state = states.get(key);
		if (state != null) state.removeSubscriber();
	}

	@Scheduled(fixedDelayString = "${prosticks.realtime.tick-interval-ms:100}")
	public void simulateTicks() {
		simulateTicks(System.currentTimeMillis());
	}

	void simulateTicks(long nowMillis) {
		if (!properties.isEnabled()) return;
		states.forEach((key, state) -> state.tick(nowMillis, key.interval(), aggregator));
	}

	public Map<MarketKey, Bar> drainDirtyBars() {
		Map<MarketKey, Bar> changed = new LinkedHashMap<>();
		states.forEach((key, state) -> {
			Bar bar = state.takeDirtyBar();
			if (bar != null) changed.put(key, bar);
		});
		return changed;
	}

	public List<Bar> snapshotBars(MarketKey key) {
		MarketState state = states.get(key);
		return state == null ? List.of() : state.snapshot();
	}

	private MarketState createState(MarketKey key, long nowMillis) {
		List<Bar> bars = marketDataService.getBars(
				key.code(), key.interval(), properties.getHistoryCount(), false);
		Instrument instrument = instrumentService.get(key.code());
		return new MarketState(bars, instrument, key.interval(), nowMillis,
				key.hashCode(), properties.getHistoryCount());
	}

	private static final class MarketState {
		private final List<Bar> bars;
		private final Instrument instrument;
		private final Random random;
		private final long startWallMillis;
		private final long startMarketSeconds;
		private final int historyCount;
		private int subscribers;
		private boolean dirty;

		private MarketState(List<Bar> source, Instrument instrument, int interval, long nowMillis,
				long seed, int historyCount) {
			this.bars = new ArrayList<>(source);
			this.instrument = instrument;
			this.random = new Random(seed);
			this.startWallMillis = nowMillis;
			this.historyCount = Math.max(1, historyCount);
			// 2026-07-21 22:52:21：历史最后柱视为已完成，在下一自然边界创建实时柱，杜绝时间倒退。
			this.startMarketSeconds = appendLiveBar(interval, nowMillis);
		}

		private synchronized void addSubscriber() { subscribers++; }
		private synchronized void removeSubscriber() { subscribers = Math.max(0, subscribers - 1); }

		private synchronized void tick(long nowMillis, int interval, RealtimeBarAggregator aggregator) {
			if (subscribers == 0 || bars.isEmpty()) return;
			Bar current = bars.get(bars.size() - 1);
			double price = nextPrice(current.c);
			long elapsedSeconds = Math.max(1, (nowMillis - startWallMillis) / 1_000);
			Bar updated = aggregator.onTick(current, startMarketSeconds + elapsedSeconds,
					price, 1 + random.nextInt(5), interval);
			if (updated != current) {
				bars.add(updated);
				if (bars.size() > historyCount) bars.remove(0);
			}
			dirty = true;
		}

		private double nextPrice(double current) {
			int decimals = instrument == null ? 4 : instrument.decimals;
			double annualVol = instrument == null || instrument.annualVol <= 0 ? 0.08 : instrument.annualVol;
			double pip = 1.0 / Math.pow(10, decimals);
			double move = random.nextGaussian() * Math.max(current * annualVol / 5_000.0, pip * 0.6);
			return Math.round(Math.max(pip, current + move) / pip) * pip;
		}

		private long appendLiveBar(int interval, long nowMillis) {
			long step = MarketInterval.seconds(interval);
			Bar previous = bars.isEmpty() ? null : bars.get(bars.size() - 1);
			long previousTime = previous == null ? nowMillis / 1_000 : previous.time;
			long liveTime = (previousTime / step + 1) * step;
			double price = previous == null
					? (instrument == null ? 100 : instrument.refPrice) : previous.c;
			Bar live = new Bar(0, price, price, price, price, 0,
					price, price, price, 0, price, price);
			live.time = liveTime;
			bars.add(live);
			if (bars.size() > historyCount) bars.remove(0);
			return liveTime;
		}

		private synchronized Bar takeDirtyBar() {
			if (!dirty || bars.isEmpty()) return null;
			dirty = false;
			return copy(bars.get(bars.size() - 1));
		}

		private synchronized List<Bar> snapshot() {
			return bars.stream().map(MarketState::copy).toList();
		}

		private static Bar copy(Bar source) {
			Bar target = new Bar(source.dt, source.o, source.h, source.l, source.c, source.v,
					source.vap, source.vam, source.mp, source.mc, source.ut, source.lt);
			target.time = source.time;
			target.localtime = source.localtime;
			target.popen = source.popen;
			target.impmp = source.impmp;
			return target;
		}
	}
}
