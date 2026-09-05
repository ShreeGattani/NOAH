// WebSocket telemetry abstraction for NOAH

export interface TelemetryPacket {
  type: 'READING_UPDATE' | 'ANOMALY_DETECTED' | 'HEALTH_CHANGE' | 'HEARTBEAT';
  stationId: string;
  data: any;
  timestamp: string;
}

export type MessageHandler = (packet: TelemetryPacket) => void;

class NoahWebSocketClient {
  private url: string;
  private ws: WebSocket | null = null;
  private listeners: Set<MessageHandler> = new Set();
  private isConnected: boolean = false;
  private reconnectInterval: number = 5000;
  private reconnectTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.url = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws/live';
  }

  public connect() {
    if (typeof window === 'undefined') return;
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA !== 'false') {
      // In mock mode, we do not attempt real socket connection
      this.isConnected = true;
      return;
    }

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('[NOAH WS] Connected to backend telemetry stream');
        this.isConnected = true;
      };

      this.ws.onmessage = (event) => {
        try {
          const packet: TelemetryPacket = JSON.parse(event.data);
          this.listeners.forEach((listener) => listener(packet));
        } catch (e) {
          console.error('[NOAH WS] Failed to parse message', e);
        }
      };

      this.ws.onclose = () => {
        console.warn('[NOAH WS] Disconnected. Reconnecting in 5s...');
        this.isConnected = false;
        this.scheduleReconnect();
      };

      this.ws.onerror = (err) => {
        console.error('[NOAH WS] Error:', err);
      };
    } catch (e) {
      console.warn('[NOAH WS] Connection initialization failed:', e);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, this.reconnectInterval);
  }

  public subscribe(handler: MessageHandler): () => void {
    this.listeners.add(handler);
    return () => {
      this.listeners.delete(handler);
    };
  }

  public getStatus(): boolean {
    return this.isConnected;
  }
}

export const wsClient = new NoahWebSocketClient();
