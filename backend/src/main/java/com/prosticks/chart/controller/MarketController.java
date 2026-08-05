package com.prosticks.chart.controller;

import com.prosticks.chart.model.Bar;
import com.prosticks.chart.model.SupportResist;
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
 * 行情数据接口 —— K 线 + Prosticks 模态字段 + 支撑阻力。
 */
@RestController
@RequestMapping("/api")
@Tag(name = "行情 Market", description = "K 线 (OHLC + Prosticks 模态字段) 与支撑/阻力数据")
public class MarketController {

	private final MarketDataService marketDataService;

	public MarketController(MarketDataService marketDataService) {
		this.marketDataService = marketDataService;
	}

	@Operation(summary = "获取 K 线序列",
			description = "返回 K 线数据 (从旧到新排列)。每根 bar 含标准 OHLCV 及 Prosticks 专属字段: "
					+ "mp(模态点)/mc(模态量)/vap,vam(活跃区上下沿)/ut,lt(上下活跃区阈值)/mclose/popen/pclose/impmp。"
					+ "数据为确定性模拟生成, 同一品种结果可复现。shift=true 时右端追加 50 根空白扩展 bar 供绘图。")
	@GetMapping("/bars")
	public List<Bar> bars(
			@Parameter(description = "品种代码, 例如 JPY(USD/JPY)、XAU(黄金)、EUR(EUR/USD)", example = "JPY", required = true)
			@RequestParam String code,
			@Parameter(description = "时间周期: 0=日 1=周 2=月 3=1分 4=5分 5=10分 6=15分 7=30分 8=1时 9=2时 10=4时", example = "4")
			@RequestParam(defaultValue = "4") int interval,
			@Parameter(description = "返回 K 线数量, 默认 300", example = "300")
			@RequestParam(defaultValue = "300") int count,
			@Parameter(description = "是否在右端追加 50 根空白扩展 bar", example = "true")
			@RequestParam(defaultValue = "true") boolean shift) {
		return marketDataService.getBars(code, interval, count, shift);
	}

	@Operation(summary = "获取支撑/阻力/模态点",
			description = "返回 supportMP(支撑)|resistMP(阻力)|latestMP(最新模态点)|averageMC(平均模态量)|latestMC(最新模态量)。"
					+ "移植自旧系统 supportresistnew.asp。")
	@GetMapping("/support-resist")
	public SupportResist supportResist(
			@Parameter(description = "品种代码", example = "JPY", required = true)
			@RequestParam String code,
			@Parameter(description = "时间周期", example = "4")
			@RequestParam(defaultValue = "4") int interval) {
		return marketDataService.getSupportResist(code, interval);
	}
}
