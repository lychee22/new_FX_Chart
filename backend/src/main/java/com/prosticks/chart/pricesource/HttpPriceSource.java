package com.prosticks.chart.pricesource;

import com.prosticks.chart.model.Bar;
import com.prosticks.chart.model.ChartConstants;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

/**
 * HTTP REST 价源 —— 通过 HTTP API 拉取真实行情数据的示例实现。
 *
 * <p>当 yml 配置 {@code prosticks.price-source: http} 时启用。
 * 需同时配置 {@code prosticks.http.baseUrl} 和 {@code prosticks.http.apiKey}。
 *
 * <p><b>这是对接真实价源的模板。</b>实际使用时需要根据你的价源 API 文档调整:
 * <ol>
 *   <li>{@link #parseResponse}: 改成你价源的 JSON 字段名映射</li>
 *   <li>{@link #intervalToApiParam}: 改成你价源的周期参数格式</li>
 *   <li>{@link #buildUrl}: 改成你价源的 URL 格式</li>
 * </ol>
 */
@Component
@ConditionalOnProperty(prefix = "prosticks", name = "price-source", havingValue = "http")
public class HttpPriceSource implements PriceSource {

	private static final Logger log = LoggerFactory.getLogger(HttpPriceSource.class);

	private final PriceSourceProperties.HttpSourceConfig config;
	private final RestTemplate restTemplate;
	private final ObjectMapper objectMapper = new ObjectMapper();

	public HttpPriceSource(PriceSourceProperties props) {
		this.config = props.getHttp();
		this.restTemplate = new RestTemplate();
		if (config.getBaseUrl().isBlank()) {
			log.warn("HttpPriceSource 已启用但 baseUrl 为空! 请在 application.yml 配置 prosticks.http.baseUrl");
		} else {
			log.info("HttpPriceSource 已启用, baseUrl={}", config.getBaseUrl());
		}
	}

	@Override
	public List<Bar> getBars(String externalSymbol, int interval, int count) {
		if (config.getBaseUrl().isBlank()) {
			log.error("baseUrl 未配置, 无法拉取数据");
			return new ArrayList<>();
		}
		String url = buildUrl(externalSymbol, interval, count);
		log.debug("拉取 K线: {} (count={})", externalSymbol, count);
		try {
			ResponseEntity<String> resp = restTemplate.getForEntity(url, String.class);
			return parseResponse(resp.getBody());
		} catch (Exception e) {
			log.error("拉取 K线失败: {} - {}", externalSymbol, e.getMessage());
			return new ArrayList<>();
		}
	}

	@Override
	public String getName() {
		return "http (" + config.getBaseUrl() + ")";
	}

	/**
	 * 构建请求 URL —— 按你价源的 API 格式调整。
	 * 默认模板: {baseUrl}{barsPath} 中替换 {symbol}/{interval}/{count}。
	 */
	private String buildUrl(String symbol, int interval, int count) {
		String apiInterval = intervalToApiParam(interval);
		return config.getBaseUrl() + config.getBarsPath()
				.replace("{symbol}", symbol)
				.replace("{interval}", apiInterval)
				.replace("{count}", String.valueOf(count))
				+ (config.getApiKey().isBlank() ? "" : "&apikey=" + config.getApiKey());
	}

	/**
	 * 把内部周期常量转成价源 API 的周期参数。
	 * <p>这里给出常见映射示例, 实际需按你的价源文档调整。
	 */
	private String intervalToApiParam(int interval) {
		switch (interval) {
			case ChartConstants.INTERVAL_DAY:    return "1day";     // 或 "D", "1d" 等
			case ChartConstants.INTERVAL_WEEK:   return "1week";
			case ChartConstants.INTERVAL_MONTH:  return "1month";
			case ChartConstants.INTERVAL_MIN:    return "1min";
			case ChartConstants.INTERVAL_5MIN:   return "5min";
			case ChartConstants.INTERVAL_15MIN:  return "15min";
			case ChartConstants.INTERVAL_30MIN:  return "30min";
			case ChartConstants.INTERVAL_HOUR:   return "1h";
			case ChartConstants.INTERVAL_4HOUR:  return "4h";
			default: return "1day";
		}
	}

	/**
	 * 解析价源返回的 JSON —— 按你价源的响应格式调整字段映射。
	 * <p>假设响应格式为数组, 每个元素含 t/o/h/l/c/v 字段 (常见格式)。
	 * 实际使用时改成你价源的字段名。
	 */
	private List<Bar> parseResponse(String body) throws Exception {
		if (body == null || body.isBlank()) return new ArrayList<>();
		JsonNode root = objectMapper.readTree(body);
		// 常见格式: 直接是数组, 或包在 data/candles/results 里
		JsonNode array = root.isArray() ? root : root.path("data");
		if (!array.isArray()) array = root.path("candles");
		if (!array.isArray()) array = root.path("results");
		if (!array.isArray()) {
			log.warn("无法识别的响应格式, 顶层 keys: {}", root.fieldNames());
			return new ArrayList<>();
		}

		List<Bar> bars = new ArrayList<>(array.size());
		for (JsonNode node : array) {
			long time = node.path("t").asLong();           // 时间戳 (秒或毫秒)
			if (time == 0) time = node.path("time").asLong();
			if (time > 1_000_000_000_000L) time /= 1000;    // 毫秒→秒
			double o = node.path("o").asDouble();
			double h = node.path("h").asDouble();
			double l = node.path("l").asDouble();
			double c = node.path("c").asDouble();
			double v = node.path("v").asDouble();
			if (h <= 0) continue; // 跳过无效数据
			bars.add(BarBuilder.fromOhlcv(time, o, h, l, c, v));
		}
		BarBuilder.backfillPOpen(bars);
		return bars;
	}
}
