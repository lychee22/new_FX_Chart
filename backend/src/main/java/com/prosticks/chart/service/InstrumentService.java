package com.prosticks.chart.service;

import com.prosticks.chart.model.Instrument;
import com.prosticks.chart.pricesource.PriceSourceProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 品种元数据服务 —— 从 application.yml 配置加载品种列表。
 *
 * <p>维护内部 code ↔ 价源 externalSymbol 的双向映射。
 * 换价源时只需改 yml 配置中的 external-symbol, 代码零改动。
 */
@Service
public class InstrumentService {

	private static final Logger log = LoggerFactory.getLogger(InstrumentService.class);

	/** 内部 code → 品种对象 (按配置顺序)。 */
	private final Map<String, Instrument> instruments = new LinkedHashMap<>();
	/** 内部 code → 价源 externalSymbol。 */
	private final Map<String, String> externalSymbolMap = new LinkedHashMap<>();

	public InstrumentService(PriceSourceProperties props) {
		int loaded = 0;
		for (PriceSourceProperties.InstrumentConfig cfg : props.getInstruments()) {
			if (cfg.getCode() == null || cfg.getCode().isBlank()) continue;
			// externalSymbol 默认等于 code (如果 yml 未配)
			String ext = cfg.getExternalSymbol() != null && !cfg.getExternalSymbol().isBlank()
					? cfg.getExternalSymbol() : cfg.getCode();
			Instrument inst = new Instrument(cfg.getCode(), cfg.getName(),
					cfg.getRefPrice(), cfg.getAnnualVol(), cfg.getDecimals());
			inst.externalSymbol = ext;  // 设置价源标准代码
			instruments.put(cfg.getCode(), inst);
			externalSymbolMap.put(cfg.getCode(), ext);
			loaded++;
		}
		log.info("InstrumentService 从配置加载了 {} 个品种", loaded);
	}

	/** 全部品种列表。 */
	public List<Instrument> list() {
		return new ArrayList<>(instruments.values());
	}

	public Instrument get(String code) {
		return instruments.get(code);
	}

	public boolean exists(String code) {
		return instruments.containsKey(code);
	}

	/** 内部 code → 价源 externalSymbol (如 "JPY" → "USDJPY")。 */
	public String toExternalSymbol(String code) {
		return externalSymbolMap.getOrDefault(code, code);
	}
}
