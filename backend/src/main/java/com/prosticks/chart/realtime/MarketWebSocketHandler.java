package com.prosticks.chart.realtime;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.prosticks.chart.indicator.IndicatorEngine;
import com.prosticks.chart.indicator.IndicatorKeyResolver;
import com.prosticks.chart.model.Bar;
import com.prosticks.chart.model.ChartConstants;
import com.prosticks.chart.model.IndicatorResult;
import com.prosticks.chart.service.InstrumentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.ConcurrentWebSocketSessionDecorator;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/** 一个连接承载品种/周期订阅、K 线、叠加指标、副图指标及心跳。 */
@Component
public class MarketWebSocketHandler extends TextWebSocketHandler {

	private static final Logger log = LoggerFactory.getLogger(MarketWebSocketHandler.class);
	private final ObjectMapper objectMapper;
	private final RealtimeMarketService marketService;
	private final InstrumentService instrumentService;
	private final IndicatorEngine indicatorEngine;
	private final RealtimeProperties properties;
	private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
	private final Map<String, Subscription> subscriptions = new ConcurrentHashMap<>();

	public MarketWebSocketHandler(ObjectMapper objectMapper, RealtimeMarketService marketService,
			InstrumentService instrumentService, IndicatorEngine indicatorEngine,
			RealtimeProperties properties) {
		this.objectMapper = objectMapper;
		this.marketService = marketService;
		this.instrumentService = instrumentService;
		this.indicatorEngine = indicatorEngine;
		this.properties = properties;
	}

	@Override
	public void afterConnectionEstablished(WebSocketSession session) {
		// 2026-07-21 22:39:12：装饰会话以串行化多个定时任务的发送，避免并发写 WebSocket。
		sessions.put(session.getId(), new ConcurrentWebSocketSessionDecorator(session, 5_000, 1_048_576));
	}

	@Override
	protected void handleTextMessage(WebSocketSession session, TextMessage message) {
		try {
			ClientMessage request = objectMapper.readValue(message.getPayload(), ClientMessage.class);
			if ("SUBSCRIBE".equalsIgnoreCase(request.type)) subscribe(session.getId(), request);
			else if ("UNSUBSCRIBE".equalsIgnoreCase(request.type)) unsubscribe(session.getId());
			else if (!"PONG".equalsIgnoreCase(request.type)) sendError(session.getId(), "Unsupported message type");
		} catch (Exception ex) {
			sendError(session.getId(), "Invalid realtime request");
		}
	}

	@Override
	public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
		removeSession(session.getId());
	}

	@Override
	public void handleTransportError(WebSocketSession session, Throwable exception) {
		log.debug("Realtime transport error: {}", exception.getMessage());
		removeSession(session.getId());
	}

	@Scheduled(fixedDelayString = "${prosticks.realtime.bar-push-interval-ms:500}")
	public void broadcastBars() {
		marketService.drainDirtyBars().forEach((key, bar) -> subscriptions.forEach((sessionId, sub) -> {
			if (sub.key().equals(key)) send(sessionId, Map.of(
					"type", "BAR", "code", key.code(), "interval", key.interval(), "bar", bar));
		}));
	}

	@Scheduled(fixedDelayString = "${prosticks.realtime.indicator-push-interval-ms:1000}")
	public void broadcastIndicators() {
		subscriptions.forEach((sessionId, sub) -> {
			List<Bar> bars = marketService.snapshotBars(sub.key());
			if (bars.isEmpty() || (sub.upper == 0 && sub.lower.isEmpty())) return;
			IndicatorUpdate upper = calculate("upper", sub.upper, sub, bars);
			List<IndicatorUpdate> lower = sub.lower.stream()
					.map(type -> calculate("lower", type, sub, bars)).toList();
			Map<String, Object> payload = new LinkedHashMap<>();
			payload.put("type", "INDICATORS");
			payload.put("code", sub.code);
			payload.put("interval", sub.interval);
			payload.put("upper", upper);
			payload.put("lower", lower);
			send(sessionId, payload);
		});
	}

	@Scheduled(fixedDelayString = "${prosticks.realtime.heartbeat-interval-ms:10000}")
	public void heartbeat() {
		sessions.keySet().forEach(id -> send(id, Map.of(
				"type", "HEARTBEAT", "serverTime", System.currentTimeMillis())));
	}

	private void subscribe(String sessionId, ClientMessage request) {
		if (!instrumentService.exists(request.code) || request.interval < 0 || request.interval > 10) {
			sendError(sessionId, "Unknown code or interval");
			return;
		}
		Subscription next = new Subscription(request.code, request.interval,
				Math.max(0, Math.min(8, request.upper)), sanitizeLower(request.lower));
		Subscription previous = subscriptions.put(sessionId, next);
		if (previous == null || !previous.key().equals(next.key())) {
			if (previous != null) marketService.unsubscribe(previous.key());
			marketService.subscribe(next.key(), System.currentTimeMillis());
		}
		Map<String, Integer> config = Map.of(
				"barPushIntervalMs", properties.getBarPushIntervalMs(),
				"indicatorPushIntervalMs", properties.getIndicatorPushIntervalMs(),
				"heartbeatIntervalMs", properties.getHeartbeatIntervalMs(),
				"tickIntervalMs", properties.getTickIntervalMs());
		send(sessionId, Map.of("type", "SUBSCRIBED", "code", next.code,
				"interval", next.interval, "config", config));
		List<Bar> bars = marketService.snapshotBars(next.key());
		if (!bars.isEmpty()) send(sessionId, Map.of("type", "BAR", "code", next.code,
				"interval", next.interval, "bar", bars.get(bars.size() - 1)));
	}

	private IndicatorUpdate calculate(String pane, int type, Subscription sub, List<Bar> bars) {
		if (type == 0) return null;
		String key = IndicatorKeyResolver.resolve(pane, type);
		if (key == null) return null;
		List<Bar> calculationBars = "IKH".equals(key) ? withFutureBars(bars, sub.interval) : bars;
		IndicatorResult full = indicatorEngine.calculate(key, calculationBars, null, sub.interval);
		return new IndicatorUpdate(type, IndicatorDeltaFactory.latest(full));
	}

	private List<Bar> withFutureBars(List<Bar> bars, int interval) {
		List<Bar> shifted = new ArrayList<>(bars);
		long lastTime = bars.get(bars.size() - 1).time;
		long step = MarketInterval.seconds(interval);
		for (int i = 1; i <= 22; i++) {
			Bar empty = new Bar();
			empty.time = lastTime + step * i;
			shifted.add(empty);
		}
		return shifted;
	}

	private List<Integer> sanitizeLower(List<Integer> requested) {
		if (requested == null) return List.of();
		return requested.stream().filter(value -> value != null && value >= 1 && value <= 16)
				.distinct().toList();
	}

	private void unsubscribe(String sessionId) {
		Subscription previous = subscriptions.remove(sessionId);
		if (previous != null) marketService.unsubscribe(previous.key());
	}

	private void removeSession(String sessionId) {
		unsubscribe(sessionId);
		sessions.remove(sessionId);
	}

	private void sendError(String sessionId, String message) {
		send(sessionId, Map.of("type", "ERROR", "message", message));
	}

	private void send(String sessionId, Object payload) {
		WebSocketSession session = sessions.get(sessionId);
		if (session == null || !session.isOpen()) return;
		try {
			session.sendMessage(new TextMessage(objectMapper.writeValueAsString(payload)));
		} catch (IOException ex) {
			log.debug("Realtime send failed: {}", ex.getMessage());
			removeSession(sessionId);
		}
	}

	private record Subscription(String code, int interval, int upper, List<Integer> lower) {
		private MarketKey key() { return new MarketKey(code, interval); }
	}

	private record IndicatorUpdate(int type, IndicatorResult result) {}

	private static class ClientMessage {
		public String type;
		public String code;
		public int interval;
		public int upper;
		public List<Integer> lower;
	}
}
