package com.prosticks.chart.realtime;

import com.prosticks.chart.model.Bar;
import com.prosticks.chart.pricesource.PriceSource;
import com.prosticks.chart.pricesource.PriceSourceProperties;
import com.prosticks.chart.service.InstrumentService;
import com.prosticks.chart.service.MarketDataService;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

// 2026-07-21 22:32:18：锁定“有新逐笔才推送、一次消费后不重复推送”的节流语义。
class RealtimeMarketServiceTest {

	@Test
	void shouldDrainOnlyBarsChangedByANewTick() {
		RealtimeMarketService service = serviceWithOneBar();
		MarketKey key = new MarketKey("JPY", 4);
		service.subscribe(key, 1_000L);

		service.simulateTicks(1_100L);

		assertFalse(service.drainDirtyBars().isEmpty());
		assertTrue(service.drainDirtyBars().isEmpty());
		assertEquals(2, service.snapshotBars(key).size());
		assertEquals(1_700_000_400L, service.snapshotBars(key).get(1).time);
	}

	private RealtimeMarketService serviceWithOneBar() {
		PriceSourceProperties sourceProps = new PriceSourceProperties();
		PriceSourceProperties.InstrumentConfig instrument = new PriceSourceProperties.InstrumentConfig();
		instrument.setCode("JPY");
		instrument.setExternalSymbol("USDJPY");
		instrument.setDecimals(2);
		instrument.setAnnualVol(0.08);
		sourceProps.setInstruments(List.of(instrument));
		InstrumentService instruments = new InstrumentService(sourceProps);
		PriceSource source = new PriceSource() {
			@Override public List<Bar> getBars(String symbol, int interval, int count) {
				Bar bar = new Bar(0, 100, 101, 99, 100, 10, 100, 100, 100, 1, 99, 101);
				bar.time = 1_700_000_100L - 1_700_000_100L % 300;
				return List.of(bar);
			}
			@Override public String getName() { return "test"; }
		};
		MarketDataService marketData = new MarketDataService(source, instruments);
		return new RealtimeMarketService(marketData, instruments, new RealtimeBarAggregator(), new RealtimeProperties());
	}
}
