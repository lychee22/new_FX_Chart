package com.prosticks.chart.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * 跨域配置：允许从 Linux 前端入口 23722 访问后端 API。
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

	@Override
	public void addCorsMappings(CorsRegistry registry) {
		// 2026-07-22 11:59:52：统一允许经 23722 前端入口访问，兼容 Linux IP、域名和本地验证。
		registry.addMapping("/api/**")
				.allowedOriginPatterns("http://*:[23722]", "https://*:[23722]")
				.allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
				.allowedHeaders("*")
				.allowCredentials(true)
				.maxAge(3600);
	}
}
