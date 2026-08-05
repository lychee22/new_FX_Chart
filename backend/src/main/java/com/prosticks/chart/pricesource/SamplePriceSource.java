package com.prosticks.chart.pricesource;

import com.prosticks.chart.generator.SampleDataGenerator;
import com.prosticks.chart.model.Bar;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 模拟价源 —— 默认的 {@link PriceSource} 实现, 复用现有 {@link SampleDataGenerator}。
 *
 * <p>当 yml 配置 {@code prosticks.price-source: sample} (或未配置) 时启用。
 * 生成确定性模拟数据, 开箱即用, 不依赖外部服务。
 *
 * <p>注意: SampleDataGenerator 内部用内部代码 (如 "JPY") 查 SPECS 表,
 * 这里做了一层映射: externalSymbol (如 "USDJPY") → 内部规格查找。
 */
@Component
@ConditionalOnProperty(prefix = "prosticks", name = "price-source", havingValue = "sample", matchIfMissing = true)
public class SamplePriceSource implements PriceSource {

	private static final Logger log = LoggerFactory.getLogger(SamplePriceSource.class);

	private final SampleDataGenerator generator;
	/** externalSymbol → 内部代码 (用于查 SampleDataGenerator 的 SPECS)。 */
	private final Map<String, String> symbolMap;

	public SamplePriceSource(SampleDataGenerator generator, PriceSourceProperties props) {
		this.generator = generator;
		// 建立 externalSymbol → code 映射 (模拟价源仍用内部 code 查规格表)
		this.symbolMap = props.getInstruments().stream()
				.collect(Collectors.toMap(
						PriceSourceProperties.InstrumentConfig::getExternalSymbol,
						PriceSourceProperties.InstrumentConfig::getCode,
						(a, b) -> a));
		log.info("SamplePriceSource 已启用 (模拟数据), 已注册 {} 个品种映射", symbolMap.size());
	}

	@Override
	public List<Bar> getBars(String externalSymbol, int interval, int count) {
		// 把 externalSymbol 映射回内部 code 供 generator 使用
		String internalCode = symbolMap.getOrDefault(externalSymbol, externalSymbol);
		return generator.generate(internalCode, interval, count);
	}

	@Override
	public String getName() {
		return "sample (确定性模拟数据)";
	}
}
