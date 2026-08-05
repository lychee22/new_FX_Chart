package com.prosticks.chart.model;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * 支撑/阻力/模态点数据, 对齐旧系统 supportresistnew.asp 的 5 字段返回。
 *
 * <p>旧系统格式: supportMP|resistMP|latestMP|averageMC|latestMC
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SupportResist {
	public double supportMP;     // 支撑位
	public double resistMP;      // 阻力位
	public double latestMP;      // 最新模态点
	public int averageMC;        // 平均模态量
	public int latestMC;         // 最新模态量

	public SupportResist() {}

	public SupportResist(double supportMP, double resistMP, double latestMP, int averageMC, int latestMC) {
		this.supportMP = supportMP;
		this.resistMP = resistMP;
		this.latestMP = latestMP;
		this.averageMC = averageMC;
		this.latestMC = latestMC;
	}
}
