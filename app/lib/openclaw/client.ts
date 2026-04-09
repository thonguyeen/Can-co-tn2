// OpenClaw Gateway WebSocket Client for FACEBOT

import { EventEmitter } from 'events';
import crypto from 'crypto';
import {
  GatewayConfig,
  ConnectionState,
  RPCRequest,
  RPCResponse,
  GatewayEvent,
  Session,
  Channel,
  ChatMessage,
  OpenClawChannel,
  OutgoingMessage,
  IncomingMessage,
  CanvasCard,
} from './types';

const DEFAULT_CONFIG: GatewayConfig = {
  url: process.env.OPENCLAW_GATEWAY_URL || 'ws://127.0.0.1:18789',
  reconnectInterval: 5000,
  maxReconnectAttempts: 10,
  pingInterval: 30000,
};

type EventMap = {
  connected: [];
  disconnected: [];
  reconnecting: [attempt: number];
  error: [error: Error];
  event: [event: GatewayEvent];
  message: [message: ChatMessage];
  'message:stream': [sessionId: string, delta: string];
};

class OpenClawClient extends EventEmitter {
  private ws: WebSocket | null = null;
  private config: GatewayConfig;
  private state: ConnectionState = 'disconnected';
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private pingTimer: NodeJS.Timeout | null = null;
  private pendingRequests = new Map<string, {
    resolve: (value: unknown) => void;
    reject: (error: Error) => void;
    timeout: NodeJS.Timeout;
  }>();
  private requestId = 0;

  constructor(config: Partial<GatewayConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // ============================================
  // Connection Management
  // ============================================

  async connect(): Promise<void> {
    if (this.state === 'connected' || this.state === 'connecting') {
      return;
    }

    this.state = 'connecting';

    return new Promise((resolve, reject) => {
      try {
        // Note: In Node.js, we need to use 'ws' package
        // In browser, native WebSocket works
        const WebSocketImpl = typeof window !== 'undefined'
          ? window.WebSocket
          : require('ws');

        this.ws = new WebSocketImpl(this.config.url);

        const ws = this.ws!;

        ws.onopen = () => {
          this.state = 'connected';
          this.reconnectAttempts = 0;
          this.startPingInterval();
          this.emit('connected');
          resolve();
        };

        ws.onclose = () => {
          this.handleDisconnect();
        };

        ws.onerror = () => {
          const error = new Error('WebSocket error');
          if (this.state === 'connecting') {
            reject(error);
          }
          this.emit('error', error);
        };

        ws.onmessage = (event: MessageEvent) => {
          this.handleMessage(event.data);
        };
      } catch (error) {
        this.state = 'error';
        reject(error);
      }
    });
  }

  disconnect(): void {
    this.stopPingInterval();
    this.stopReconnectTimer();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.state = 'disconnected';
    this.pendingRequests.forEach(({ reject, timeout }) => {
      clearTimeout(timeout);
      reject(new Error('Connection closed'));
    });
    this.pendingRequests.clear();
  }

  getState(): ConnectionState {
    return this.state;
  }

  isConnected(): boolean {
    return this.state === 'connected';
  }

  // ============================================
  // RPC Methods
  // ============================================

  private async rpc<T>(method: string, params?: Record<string, unknown>): Promise<T> {
    if (!this.isConnected()) {
      throw new Error('Not connected to OpenClaw Gateway');
    }

    const id = `req_${++this.requestId}_${Date.now()}`;
    const request: RPCRequest = {
      jsonrpc: '2.0',
      id,
      method,
      params,
    };

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`RPC timeout: ${method}`));
      }, 30000);

      this.pendingRequests.set(id, {
        resolve: resolve as (value: unknown) => void,
        reject,
        timeout,
      });

      this.ws?.send(JSON.stringify(request));
    });
  }

  // ============================================
  // Session Management
  // ============================================

  async createSession(config: {
    name: string;
    systemPrompt: string;
    model?: string;
    persona?: Record<string, unknown>;
  }): Promise<Session> {
    return this.rpc<Session>('sessions.create', {
      name: config.name,
      config: {
        model: config.model || 'anthropic/claude-sonnet-4-20250514',
        systemPrompt: config.systemPrompt,
        temperature: 0.7,
        maxTokens: 4096,
        thinkingLevel: 'medium',
      },
      persona: config.persona,
    });
  }

  async getSession(sessionId: string): Promise<Session | null> {
    try {
      return await this.rpc<Session>('sessions.get', { sessionId });
    } catch {
      return null;
    }
  }

  async listSessions(): Promise<Session[]> {
    return this.rpc<Session[]>('sessions.list', {});
  }

  async terminateSession(sessionId: string): Promise<void> {
    return this.rpc<void>('sessions.terminate', { sessionId });
  }

  async resetSession(sessionId: string): Promise<void> {
    return this.rpc<void>('sessions.reset', { sessionId });
  }

  // ============================================
  // Chat
  // ============================================

  async sendMessage(
    sessionId: string,
    content: string,
    options?: {
      attachments?: Array<{ type: string; url: string }>;
      replyToId?: string;
      stream?: boolean;
    }
  ): Promise<ChatMessage> {
    return this.rpc<ChatMessage>('chat.send', {
      sessionId,
      content,
      attachments: options?.attachments,
      replyToId: options?.replyToId,
      stream: options?.stream ?? false,
    });
  }

  async sendMessageStream(
    sessionId: string,
    content: string,
    onDelta: (delta: string) => void
  ): Promise<ChatMessage> {
    const streamId = `stream_${Date.now()}`;

    const deltaHandler = (event: GatewayEvent) => {
      if (event.type === 'message' && event.action === 'streaming') {
        if (event.message.sessionId === sessionId && event.streamDelta) {
          onDelta(event.streamDelta);
        }
      }
    };

    this.on('event', deltaHandler);

    try {
      const message = await this.rpc<ChatMessage>('chat.send', {
        sessionId,
        content,
        stream: true,
        streamId,
      });
      return message;
    } finally {
      this.off('event', deltaHandler);
    }
  }

  async getHistory(sessionId: string, limit = 50): Promise<ChatMessage[]> {
    return this.rpc<ChatMessage[]>('sessions.history', { sessionId, limit });
  }

  // ============================================
  // Channels
  // ============================================

  async listChannels(): Promise<Channel[]> {
    return this.rpc<Channel[]>('channels.list', {});
  }

  async getChannel(channelId: string): Promise<Channel | null> {
    try {
      return await this.rpc<Channel>('channels.get', { channelId });
    } catch {
      return null;
    }
  }

  async sendToChannel(
    channelType: string,
    targetId: string,
    content: string,
    options?: {
      attachments?: Array<{ type: string; url: string }>;
      parseMode?: 'text' | 'markdown' | 'html';
    }
  ): Promise<{ messageId: string; url?: string }> {
    return this.rpc('channels.send', {
      channelType,
      targetId,
      content,
      attachments: options?.attachments,
      parseMode: options?.parseMode || 'markdown',
    });
  }

  // ============================================
  // Cross-Session Communication
  // ============================================

  async sessionsSend(
    fromSessionId: string,
    toSessionId: string,
    message: string
  ): Promise<void> {
    return this.rpc<void>('sessions.send', {
      from: fromSessionId,
      to: toSessionId,
      message,
    });
  }

  // ============================================
  // Tools
  // ============================================

  async invokeTool(
    sessionId: string,
    toolName: string,
    input: Record<string, unknown>
  ): Promise<unknown> {
    return this.rpc('tools.invoke', {
      sessionId,
      tool: toolName,
      input,
    });
  }

  // ============================================
  // Multi-Channel Messaging (Phase 13)
  // ============================================

  private rateLimiter: Map<string, { count: number; resetAt: number }> = new Map();
  private webhookSecret: string = process.env.OPENCLAW_WEBHOOK_SECRET || '';

  async send(message: OutgoingMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
    // Rate limit check
    if (!this.checkMultiChannelRateLimit(message.recipient)) {
      return { success: false, error: 'Rate limit exceeded' };
    }

    try {
      const endpoint = this.getMultiChannelEndpoint(message.channel);

      const payload: Record<string, unknown> = {
        recipient: message.recipient,
        content: message.content,
      };

      if (message.replyTo) {
        payload.replyTo = message.replyTo;
      }

      if (message.format === 'canvas' && message.canvas) {
        payload.canvas = this.formatCanvas(message.canvas);
      }

      const gatewayUrl = this.config.url.replace('ws://', 'http://').replace('wss://', 'https://');

      const response = await fetch(`${gatewayUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENCLAW_API_TOKEN || ''}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.text();
        return { success: false, error };
      }

      const result = await response.json();
      return { success: true, messageId: result.messageId };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async broadcast(
    recipients: { channel: OpenClawChannel; recipient: string }[],
    content: string,
    canvas?: CanvasCard
  ): Promise<{ sent: number; failed: number; errors: string[] }> {
    const results = await Promise.allSettled(
      recipients.map(r => this.send({
        channel: r.channel,
        recipient: r.recipient,
        content,
        format: canvas ? 'canvas' : 'text',
        canvas,
      }))
    );

    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.success) {
        sent++;
      } else {
        failed++;
        const error = result.status === 'rejected'
          ? result.reason
          : result.value.error;
        errors.push(`${recipients[index].recipient}: ${error}`);
      }
    });

    return { sent, failed, errors };
  }

  verifyWebhook(payload: string, signature: string): boolean {
    if (!this.webhookSecret) {
      console.warn('[OpenClaw] Webhook secret not configured');
      return true; // Allow in development
    }

    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(payload)
      .digest('hex');

    try {
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
    } catch {
      return false;
    }
  }

  parseWebhookMessage(payload: Record<string, unknown>): IncomingMessage {
    return {
      id: (payload.id as string) || crypto.randomUUID(),
      channel: payload.channel as OpenClawChannel,
      sender: (payload.sender as string) || (payload.from as string) || '',
      senderName: (payload.senderName as string) || (payload.fromName as string),
      content: (payload.content as string) || (payload.text as string) || (payload.message as string) || '',
      timestamp: (payload.timestamp as string) || new Date().toISOString(),
      replyTo: payload.replyTo as string | undefined,
      metadata: payload.metadata as Record<string, unknown> | undefined,
    };
  }

  async getMultiChannelStatus(): Promise<Record<OpenClawChannel, boolean>> {
    try {
      const gatewayUrl = this.config.url.replace('ws://', 'http://').replace('wss://', 'https://');
      const response = await fetch(`${gatewayUrl}/api/status`, {
        headers: { 'Authorization': `Bearer ${process.env.OPENCLAW_API_TOKEN || ''}` },
      });

      if (!response.ok) {
        throw new Error('Failed to get status');
      }

      const status = await response.json();
      return {
        whatsapp: status.channels?.whatsapp?.connected || false,
        telegram: status.channels?.telegram?.connected || false,
        discord: status.channels?.discord?.connected || false,
        imessage: status.channels?.imessage?.connected || false,
      };
    } catch {
      return {
        whatsapp: false,
        telegram: false,
        discord: false,
        imessage: false,
      };
    }
  }

  private getMultiChannelEndpoint(channel: OpenClawChannel): string {
    const endpoints: Record<OpenClawChannel, string> = {
      whatsapp: '/api/whatsapp/send',
      telegram: '/api/telegram/send',
      discord: '/api/discord/send',
      imessage: '/api/imessage/send',
    };
    return endpoints[channel];
  }

  private formatCanvas(canvas: CanvasCard): Record<string, unknown> {
    return {
      type: canvas.type,
      title: canvas.title,
      subtitle: canvas.subtitle,
      image: canvas.imageUrl,
      body: canvas.body,
      buttons: canvas.actions?.map(a => ({
        type: a.type,
        text: a.label,
        action: a.action,
        style: a.style,
      })),
      meta: canvas.metadata,
    };
  }

  private checkMultiChannelRateLimit(recipient: string): boolean {
    const now = Date.now();
    const limit = this.rateLimiter.get(recipient);

    if (!limit || now > limit.resetAt) {
      this.rateLimiter.set(recipient, { count: 1, resetAt: now + 3600000 });
      return true;
    }

    if (limit.count >= 100) {
      return false;
    }

    limit.count++;
    return true;
  }

  // ============================================
  // Private Methods
  // ============================================

  private handleMessage(data: string): void {
    try {
      const parsed = JSON.parse(data);

      // Handle RPC response
      if (parsed.jsonrpc === '2.0' && parsed.id) {
        const pending = this.pendingRequests.get(parsed.id);
        if (pending) {
          clearTimeout(pending.timeout);
          this.pendingRequests.delete(parsed.id);

          if (parsed.error) {
            pending.reject(new Error(parsed.error.message));
          } else {
            pending.resolve(parsed.result);
          }
        }
        return;
      }

      // Handle event
      if (parsed.type === 'event') {
        this.emit('event', parsed.payload as GatewayEvent);

        if (parsed.payload?.type === 'message') {
          this.emit('message', parsed.payload.message);
          if (parsed.payload.action === 'streaming' && parsed.payload.streamDelta) {
            this.emit('message:stream', parsed.payload.message.sessionId, parsed.payload.streamDelta);
          }
        }
        return;
      }

      // Handle pong
      if (parsed.type === 'pong') {
        return;
      }
    } catch (error) {
      console.error('[OpenClaw] Failed to parse message:', error);
    }
  }

  private handleDisconnect(): void {
    this.stopPingInterval();
    this.state = 'disconnected';
    this.emit('disconnected');

    // Attempt reconnection
    if (this.reconnectAttempts < this.config.maxReconnectAttempts) {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    this.stopReconnectTimer();
    this.state = 'reconnecting';
    this.reconnectAttempts++;

    this.emit('reconnecting', this.reconnectAttempts);

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(() => {
        // Will retry via handleDisconnect
      });
    }, this.config.reconnectInterval * this.reconnectAttempts);
  }

  private stopReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private startPingInterval(): void {
    this.pingTimer = setInterval(() => {
      if (this.isConnected()) {
        this.ws?.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
      }
    }, this.config.pingInterval);
  }

  private stopPingInterval(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }
}

// Singleton instance
let clientInstance: OpenClawClient | null = null;

export function getOpenClawClient(): OpenClawClient {
  if (!clientInstance) {
    clientInstance = new OpenClawClient();
  }
  return clientInstance;
}

export function createOpenClawClient(config?: Partial<GatewayConfig>): OpenClawClient {
  return new OpenClawClient(config);
}

export { OpenClawClient };
export default OpenClawClient;
