package com.prosticks.chart.controller;

import com.prosticks.chart.model.Instrument;
import com.prosticks.chart.service.InstrumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 元数据接口 —— 品种列表 + 图表/指标枚举, 供前端下拉初始化。
 */
@RestController
@RequestMapping("/api/meta")
@Tag(name = "元数据 Meta", description = "品种列表、图表类型/周期/指标枚举, 用于初始化前端工具栏")
public class MetaController {

	private final InstrumentService instrumentService;

	public MetaController(InstrumentService instrumentService) {
		this.instrumentService = instrumentService;
	}

	@Operation(summary = "获取全部交易品种", description = "返回 34 个外汇/贵金属品种, 包含代码/显示名/参考价/波动率/小数位。顺序与旧系统下拉一致。")
	@GetMapping("/instruments")
	public List<Instrument> instruments() {
		return instrumentService.list();
	}
}
