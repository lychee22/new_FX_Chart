package com.prosticks.chart.model;

/**
 * 交易品种元数据。对应旧系统 HTML 工具栏品种下拉的每一项。
 */
public class Instrument {

	/** 品种代码,例如 "JPY" (代表 USD/JPY)、"XAU" (代表 Gold) */
	public String code;
	/** 显示名称,例如 "USD/JPY"、"Gold" */
	public String name;
	/** 参考价 (用于生成确定性模拟数据的中枢) */
	public double refPrice;
	/** 年化波动率 (用于生成确定性模拟数据) */
	public double annualVol;
	/** 默认小数位 (USD/JPY=2, 黄金=2, 1 以下货币对=4 等) */
	public int decimals;
	/** 价源标准代码 (如 "USDJPY"), 用于调用 PriceSource。默认等于 code。 */
	public String externalSymbol;

	public Instrument() {}

	public Instrument(String code, String name, double refPrice, double annualVol, int decimals) {
		this.code = code;
		this.name = name;
		this.refPrice = refPrice;
		this.annualVol = annualVol;
		this.decimals = decimals;
		this.externalSymbol = code;
	}

	@Override
	public String toString() {
		return "Instrument{" + code + " (" + name + "), ref=" + refPrice + ", vol=" + annualVol + ", dp=" + decimals + '}';
	}
}
