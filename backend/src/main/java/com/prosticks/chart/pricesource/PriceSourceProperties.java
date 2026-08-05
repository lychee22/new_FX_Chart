package com.prosticks.chart.pricesource;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.ArrayList;
import java.util.List;

/**
 * 价源配置属性, 绑定 application.yml 中 {@code prosticks.*} 前缀的配置。
 *
 * <pre>
 * prosticks:
 *   price-source: sample          # 价源选择: sample(模拟) / http(自定义HTTP)
 *   instruments:                  # 品种列表 (从配置加载, 不再硬编码)
 *     - code: JPY
 *       name: USD/JPY
 *       external-symbol: USDJPY
 *       decimals: 2
 * </pre>
 */
@ConfigurationProperties(prefix = "prosticks")
public class PriceSourceProperties {

	/** 当前使用的价源: sample / http / 自定义名称。 */
	private String priceSource = "sample";

	/** 品种列表 (从 yml 加载)。 */
	private List<InstrumentConfig> instruments = new ArrayList<>();

	/** HTTP 价源配置 (当 price-source=http 时生效)。 */
	private HttpSourceConfig http = new HttpSourceConfig();

	public String getPriceSource() { return priceSource; }
	public void setPriceSource(String priceSource) { this.priceSource = priceSource; }

	public List<InstrumentConfig> getInstruments() { return instruments; }
	public void setInstruments(List<InstrumentConfig> instruments) { this.instruments = instruments; }

	public HttpSourceConfig getHttp() { return http; }
	public void setHttp(HttpSourceConfig http) { this.http = http; }

	/** 单个品种配置。 */
	public static class InstrumentConfig {
		private String code;            // 内部代码 (如 "JPY")
		private String name;            // 显示名 (如 "USD/JPY")
		private String externalSymbol;  // 价源代码 (如 "USDJPY")
		private int decimals;           // 小数位

		// 以下仅模拟价源用, 真实价源可忽略
		private double refPrice = 100;
		private double annualVol = 0.08;

		public String getCode() { return code; }
		public void setCode(String code) { this.code = code; }
		public String getName() { return name; }
		public void setName(String name) { this.name = name; }
		public String getExternalSymbol() { return externalSymbol; }
		public void setExternalSymbol(String externalSymbol) { this.externalSymbol = externalSymbol; }
		public int getDecimals() { return decimals; }
		public void setDecimals(int decimals) { this.decimals = decimals; }
		public double getRefPrice() { return refPrice; }
		public void setRefPrice(double refPrice) { this.refPrice = refPrice; }
		public double getAnnualVol() { return annualVol; }
		public void setAnnualVol(double annualVol) { this.annualVol = annualVol; }
	}

	/** HTTP 价源连接配置。 */
	public static class HttpSourceConfig {
		/** 价源 API 基础 URL, 如 https://api.example.com/v1。 */
		private String baseUrl = "";
		/** API Key (认证用)。 */
		private String apiKey = "";
		/** K线路径模板, 占位符 {symbol}/{interval}/{count}。 */
		private String barsPath = "/candles/{symbol}?interval={interval}&count={count}";

		public String getBaseUrl() { return baseUrl; }
		public void setBaseUrl(String baseUrl) { this.baseUrl = baseUrl; }
		public String getApiKey() { return apiKey; }
		public void setApiKey(String apiKey) { this.apiKey = apiKey; }
		public String getBarsPath() { return barsPath; }
		public void setBarsPath(String barsPath) { this.barsPath = barsPath; }
	}
}
