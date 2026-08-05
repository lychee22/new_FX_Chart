package com.prosticks.chart.realtime;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * 实时行情的后端统一配置，前端只读取服务端返回的生效值。
 */
@ConfigurationProperties(prefix = "prosticks.realtime")
public class RealtimeProperties {

	// 2026-07-21 22:31:46：把模拟逐笔、K 线、指标和心跳频率集中到后端配置。
	private boolean enabled = true;
	private int tickIntervalMs = 100;
	private int barPushIntervalMs = 500;
	private int indicatorPushIntervalMs = 1_000;
	private int heartbeatIntervalMs = 10_000;
	private int historyCount = 300;

	public boolean isEnabled() { return enabled; }
	public void setEnabled(boolean enabled) { this.enabled = enabled; }
	public int getTickIntervalMs() { return tickIntervalMs; }
	public void setTickIntervalMs(int value) { this.tickIntervalMs = value; }
	public int getBarPushIntervalMs() { return barPushIntervalMs; }
	public void setBarPushIntervalMs(int value) { this.barPushIntervalMs = value; }
	public int getIndicatorPushIntervalMs() { return indicatorPushIntervalMs; }
	public void setIndicatorPushIntervalMs(int value) { this.indicatorPushIntervalMs = value; }
	public int getHeartbeatIntervalMs() { return heartbeatIntervalMs; }
	public void setHeartbeatIntervalMs(int value) { this.heartbeatIntervalMs = value; }
	public int getHistoryCount() { return historyCount; }
	public void setHistoryCount(int value) { this.historyCount = value; }
}
