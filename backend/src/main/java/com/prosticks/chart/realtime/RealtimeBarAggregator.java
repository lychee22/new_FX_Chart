package com.prosticks.chart.realtime;

import com.prosticks.chart.model.Bar;
import org.springframework.stereotype.Component;

/**
 * 将逐笔价格聚合为当前周期的完整 K 线。
 */
@Component
public class RealtimeBarAggregator {

	// 2026-07-21 22:28:09：同一自然周期内只更新最后一根 K 线，避免产生重复柱。
	public Bar onTick(Bar current, long tickTime, double price, double volume, int interval) {
		long bucketTime = tickTime - tickTime % MarketInterval.seconds(interval);
		if (current.time != bucketTime) {
			Bar next = new Bar(0, price, price, price, price, volume,
					price, price, price, 1, price, price);
			next.time = bucketTime;
			return next;
		}
		current.h = Math.max(current.h, price);
		current.l = Math.min(current.l, price);
		current.c = price;
		current.v += volume;
		current.mp = price;
		current.mc += 1;
		current.vap = Math.max(current.vap, price);
		current.vam = Math.min(current.vam, price);
		current.mclose = (current.o + current.h + current.l + current.c) / 4.0;
		current.pclose = (current.mp + current.h + current.l) / 3.0;
		return current;
	}

}
