package com.prosticks.chart.realtime;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

/** 注册 iframe 前端使用的实时行情端点。 */
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

	private final MarketWebSocketHandler handler;

	public WebSocketConfig(MarketWebSocketHandler handler) {
		this.handler = handler;
	}

	@Override
	public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
		// 2026-07-21 22:39:12：允许开发代理和未来跨域 iframe 完成 WebSocket 握手。
		registry.addHandler(handler, "/ws/market").setAllowedOriginPatterns("*");
	}
}
