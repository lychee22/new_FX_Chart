import type { RealtimeBarMessage, RealtimeIndicatorsMessage } from '../types';

interface Subscription {
  code: string;
  interval: number;
  upper: number;
  lower: number[];
}

interface MarketSocketHandlers {
  onBar: (message: RealtimeBarMessage) => void;
  onIndicators: (message: RealtimeIndicatorsMessage) => void;
  /** 2026-08-05：断线重连成功时回调（初始连接不触发）— 上层据此重拉 REST 全量数据，
   *  补齐断线期间丢失的 K 线/指标（WS 只推送单点增量, 无法回溯断线空洞）。 */
  onReconnect?: () => void;
}

/** 单一 WebSocket 连接，负责订阅切换、心跳应答和指数退避重连。 */
export class MarketSocket {
  private socket: WebSocket | null = null;
  private subscription: Subscription | null = null;
  private reconnectTimer: number | null = null;
  private reconnectAttempt = 0;
  private disposed = false;

  constructor(private handlers: MarketSocketHandlers) {}

  // 2026-07-21 22:44:03：品种或周期变化时先取消旧组合，再在同一连接订阅新组合。
  subscribe(next: Subscription): void {
    const changedMarket = this.subscription !== null
      && (this.subscription.code !== next.code || this.subscription.interval !== next.interval);
    if (changedMarket) this.send({ type: 'UNSUBSCRIBE' });
    this.subscription = { ...next, lower: [...next.lower] };
    if (this.socket?.readyState === WebSocket.OPEN) this.sendSubscription();
    else this.connect();
  }

  dispose(): void {
    this.disposed = true;
    if (this.reconnectTimer !== null) window.clearTimeout(this.reconnectTimer);
    this.send({ type: 'UNSUBSCRIBE' });
    this.socket?.close(1000, 'chart disposed');
    this.socket = null;
  }

  private connect(): void {
    if (this.disposed || this.socket?.readyState === WebSocket.CONNECTING) return;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socket = new WebSocket(`${protocol}//${window.location.host}/ws/market`);
    this.socket = socket;
    socket.onopen = () => {
      // 2026-08-05：reconnectAttempt > 0 说明是断线重连（初始连接为 0）— 先置回,
      // 再通知上层重拉 REST 数据。重连期间错过的增量只能靠全量补齐。
      const isReconnect = this.reconnectAttempt > 0;
      if (this.reconnectTimer !== null) window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
      this.reconnectAttempt = 0;
      this.sendSubscription();
      if (isReconnect) this.handlers.onReconnect?.();
    };
    socket.onmessage = (event) => this.handleMessage(event.data);
    socket.onclose = () => {
      if (this.socket !== socket) return;
      this.socket = null;
      if (!this.disposed) this.scheduleReconnect();
    };
    socket.onerror = () => socket.close();
  }

  private handleMessage(raw: string): void {
    try {
      const message = JSON.parse(raw);
      if (message.type === 'BAR') this.handlers.onBar(message as RealtimeBarMessage);
      else if (message.type === 'INDICATORS') {
        this.handlers.onIndicators(message as RealtimeIndicatorsMessage);
      } else if (message.type === 'HEARTBEAT') {
        this.send({ type: 'PONG', serverTime: message.serverTime });
      }
    } catch (error) {
      console.error('实时行情消息解析失败', error);
    }
  }

  private sendSubscription(): void {
    if (this.subscription) this.send({ type: 'SUBSCRIBE', ...this.subscription });
  }

  private send(payload: object): void {
    if (this.socket?.readyState === WebSocket.OPEN) this.socket.send(JSON.stringify(payload));
  }

  private scheduleReconnect(): void {
    const delay = Math.min(1_000 * 2 ** this.reconnectAttempt, 30_000);
    this.reconnectAttempt += 1;
    this.reconnectTimer = window.setTimeout(() => this.connect(), delay);
  }
}
