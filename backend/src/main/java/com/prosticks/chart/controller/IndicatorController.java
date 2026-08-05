package com.prosticks.chart.controller;

import com.prosticks.chart.indicator.IndicatorEngine;
import com.prosticks.chart.indicator.IndicatorKeyResolver;
import com.prosticks.chart.model.Bar;
import com.prosticks.chart.model.ChartConstants;
import com.prosticks.chart.model.IndicatorResult;
import com.prosticks.chart.service.MarketDataService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 技术指标计算接口。
 *
 * <p>支持 8 种叠加指标 (UPPER_*) 与 16 种副图指标 (LOWER_*),
 * 返回多条带配色的序列及参考水平线, 供前端直接绘制。
 */
@RestController
@RequestMapping("/api")
@Tag(name = "指标 Indicators", description = "技术指标计算 (8 叠加 + 16 副图, 共 24 种)")
public class IndicatorController {

	private final IndicatorEngine engine;
	private final MarketDataService marketDataService;

	public IndicatorController(IndicatorEngine engine, MarketDataService marketDataService) {
		this.engine = engine;
		this.marketDataService = marketDataService;
	}

	@Operation(summary = "计算技术指标",
			description = "按指标 ID 计算并返回带配色的序列与参考水平线。\n\n"
					+ "<b>叠加指标 (pane=upper):</b> 1=SMA 2=Bollinger 3=EMA 4=SAR 5=Ichimoku 6=WMA 7=MAE 8=KC\n"
					+ "<b>副图指标 (pane=lower):</b> 1=Volume 2=RSI 3=MACD 4=Stochastic 5=Momentum 6=Williams%R "
					+ "7=OBV 8=ModalCount 9=ROC 10=ADX 11=MFI 12=Volatility 13=VolumePlus 14=VAO 15=CCI 16=ATR\n\n"
					+ "pane 必填, 用于消歧叠加/副图 ID 重叠。params 可选, 逗号分隔, 例如 SMA 的 \"10,20,50\"。不传则用默认参数。")
	@GetMapping("/indicators")
	public IndicatorResult indicators(
			@Parameter(description = "叠加(upper) 或 副图(lower)", example = "upper", required = true)
			@RequestParam String pane,
			@Parameter(description = "指标类型 ID (见上方说明)", example = "1", required = true)
			@RequestParam int type,
			@Parameter(description = "品种代码", example = "JPY", required = true)
			@RequestParam String code,
			@Parameter(description = "时间周期", example = "4")
			@RequestParam(defaultValue = "4") int interval,
			@Parameter(description = "可选参数, 逗号分隔 (如 10,20,50)", example = "14")
			@RequestParam(required = false) String params,
			@Parameter(description = "是否在右端追加空白扩展 bar (影响序列长度)", example = "false")
			@RequestParam(defaultValue = "false") boolean shift) {

		String key = IndicatorKeyResolver.resolve(pane, type);
		if (key == null) {
			return new IndicatorResult("NONE", "Unknown indicator: pane=" + pane + ", type=" + type,
					"none", java.util.Collections.emptyList(), null);
		}
		double[] p = parseParams(params);
		List<Bar> bars = marketDataService.getBars(code, interval, 300, shift);
		// 2026-07-21 17:24:22：把周期传入 Ichimoku，确保日/周/月与日内采用旧项目对应的计算字段。
		return engine.calculate(key, bars, p, interval);
	}

	private double[] parseParams(String params) {
		if (params == null || params.isBlank()) return null;
		try {
			String[] tokens = params.split(",");
			double[] r = new double[tokens.length];
			for (int i = 0; i < tokens.length; i++) r[i] = Double.parseDouble(tokens[i].trim());
			return r;
		} catch (NumberFormatException e) {
			return null;
		}
	}
}
