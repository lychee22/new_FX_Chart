package com.prosticks.chart.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI / Swagger 文档元信息配置。
 * Swagger UI 地址: /swagger-ui.html  (可直接在线调用所有接口)
 */
@Configuration
public class OpenApiConfig {

	@Bean
	public OpenAPI prosticksOpenAPI() {
		return new OpenAPI()
				.info(new Info()
						.title("Prosticks 外汇图表 REST API")
						.description("重构自旧版静态图表系统。提供外汇/贵金属行情数据(K线+Prosticks模态数据)、"
								+ "技术指标计算(叠加+副图共24种)、元数据接口。所有接口均可在 Swagger UI 在线调用测试。")
						.version("1.0.0")
						.contact(new Contact().name("Prosticks Chart").url("https://github.com/prosticks"))
						.license(new License().name("Apache 2.0").url("https://www.apache.org/licenses/LICENSE-2.0")));
	}
}
