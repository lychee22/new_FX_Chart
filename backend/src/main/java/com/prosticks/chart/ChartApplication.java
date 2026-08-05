package com.prosticks.chart;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableScheduling;
import com.prosticks.chart.pricesource.PriceSourceProperties;
import com.prosticks.chart.realtime.RealtimeProperties;

/**
 * Prosticks 图表后端入口。
 *
 * <p>启动后:
 * <ul>
 *   <li>REST 接口基础路径 {@code /api}</li>
 *   <li>Swagger UI 在线文档与在线调用: {@code http://127.0.0.1:23723/swagger-ui.html}</li>
 *   <li>OpenAPI JSON: {@code http://127.0.0.1:23723/v3/api-docs}</li>
 * </ul>
 */
@SpringBootApplication
@EnableScheduling
// 2026-07-21 22:36:02：启用后端可配置的实时模拟行情和分层推送频率。
@EnableConfigurationProperties({PriceSourceProperties.class, RealtimeProperties.class})
public class ChartApplication {

	public static void main(String[] args) {
		SpringApplication.run(ChartApplication.class, args);
	}
}
