package com.prosticks.chart.realtime;

/** 2026-07-21 22:31:46：品种和周期共同标识一条共享的实时行情流。 */
public record MarketKey(String code, int interval) {
}
