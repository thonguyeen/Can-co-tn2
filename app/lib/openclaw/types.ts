// OpenClaw Gateway Types for FACEBOT Integration

// ============================================
// Gateway Connection
// ============================================

export interface GatewayConfig {
  url: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  pingInterval: number;
}

export type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error';

export interface GatewayMessage {
  id: string;
  type: MessageType;
  payload: unknown;
  timestamp: number;
}

export type MessageType =
  | 'rpc_request'
  | 'rpc_response'
  | 'event'
  | 'ping'
  | 'pong'
  | 'error';

// ============================================
// RPC Protocol
// ============================================

export interface RPCRequest {
  jsonrpc: '2.0';
  id: string;
  method: string;
  params?: Record<string, unknown>;
}

export interface RPCResponse<T = unknown> {
  jsonrpc: '2.0';
  id: string;
  result?: T;
  error?: RPCError;
}

export interface RPCError {
  code: number;
  message: string;
  data?: unknown;
}

// ============================================
// Sessions
// ============================================

export interface Session {
  id: string;
  name: string;
  status: SessionStatus;
  persona?: BotPersona;
  channels: ChannelBinding[];
  createdAt: number;
  lastActiveAt: number;
  messageCount: number;
  config: SessionConfig;
}

export type SessionStatus = 'active' | 'idle' | 'paused' | 'terminated';

export interface SessionConfig {
  model: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  thinkingLevel: ThinkingLevel;
  tools: string[];
}

export type ThinkingLevel = 'off' | 'minimal' | 'low' | 'medium' | 'high' | 'xhigh';

export interface BotPersona {
  handle: string;
  name: string;
  nameVi: string;
  expertise: string[];
  tone: string;
  avatar: string;
  color: string;
  category: string;
  language: 'vi' | 'en';
}

// ============================================
// Channels
// ============================================

export type ChannelType =
  | 'telegram'
  | 'discord'
  | 'whatsapp'
  | 'slack'
  | 'zalo'
  | 'matrix'
  | 'signal'
  | 'webchat';

export interface Channel {
  id: string;
  type: ChannelType;
  name: string;
  status: ChannelStatus;
  config: ChannelConfig;
}

export type ChannelStatus = 'connected' | 'disconnected' | 'error' | 'pairing';

export interface ChannelConfig {
  token?: string;
  channelId?: string;
  groupId?: string;
  webhookUrl?: string;
  dmPolicy: 'pairing' | 'open';
  mentionRequired: boolean;
}

export interface ChannelBinding {
  channelId: string;
  channelType: ChannelType;
  targetId: string; // group/channel ID on platform
  targetName: string;
  enabled: boolean;
}

// ============================================
// Messages
// ============================================

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  attachments?: Attachment[];
  timestamp: number;
  metadata?: MessageMetadata;
}

export interface Attachment {
  type: 'image' | 'video' | 'audio' | 'file';
  url: string;
  mimeType: string;
  size: number;
  name?: string;
}

export interface MessageMetadata {
  channel?: ChannelType;
  senderId?: string;
  senderName?: string;
  replyToId?: string;
  toolCalls?: ToolCall[];
  tokens?: TokenUsage;
}

export interface TokenUsage {
  input: number;
  output: number;
  total: number;
}

// ============================================
// Tools
// ============================================

export interface Tool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export interface ToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
  output?: unknown;
  status: 'pending' | 'running' | 'completed' | 'error';
}

// ============================================
// Events
// ============================================

export type GatewayEvent =
  | SessionEvent
  | ChannelEvent
  | MessageEvent
  | ToolEvent;

export interface SessionEvent {
  type: 'session';
  action: 'created' | 'updated' | 'terminated';
  session: Session;
}

export interface ChannelEvent {
  type: 'channel';
  action: 'connected' | 'disconnected' | 'message' | 'error';
  channel: Channel;
  data?: unknown;
}

export interface MessageEvent {
  type: 'message';
  action: 'received' | 'sent' | 'streaming';
  message: ChatMessage;
  streamDelta?: string;
}

export interface ToolEvent {
  type: 'tool';
  action: 'started' | 'progress' | 'completed' | 'error';
  toolCall: ToolCall;
}

// ============================================
// Distribution
// ============================================

export interface DistributionRequest {
  postId: string;
  content: string;
  botHandle: string;
  channels: ChannelType[];
  attachments?: Attachment[];
  scheduledAt?: number;
}

export interface DistributionResult {
  postId: string;
  results: ChannelDistributionResult[];
  timestamp: number;
}

export interface ChannelDistributionResult {
  channel: ChannelType;
  success: boolean;
  messageId?: string;
  error?: string;
  url?: string;
}

// ============================================
// FACEBOT-specific Types
// ============================================

export interface FacebotBotConfig {
  handle: string;
  sessionId: string;
  persona: BotPersona;
  channels: ChannelBinding[];
  autoReply: boolean;
  distributionEnabled: boolean;
}

export const FACEBOT_BOTS: Record<string, BotPersona> = {
  minh_ai: {
    handle: 'minh_ai',
    name: 'Minh AI',
    nameVi: 'Minh AI',
    expertise: ['AI', 'Machine Learning', 'Deep Learning', 'LLMs'],
    tone: 'analytical, enthusiastic, technical',
    avatar: '/avatars/minh_ai.png',
    color: '#8B5CF6',
    category: 'AI/ML',
    language: 'vi',
  },
  lan_startup: {
    handle: 'lan_startup',
    name: 'Lan Startup',
    nameVi: 'Lan Startup',
    expertise: ['Startups', 'Business', 'Venture Capital', 'Entrepreneurship'],
    tone: 'insightful, pragmatic, encouraging',
    avatar: '/avatars/lan_startup.png',
    color: '#F97316',
    category: 'Business',
    language: 'vi',
  },
  nam_gadget: {
    handle: 'nam_gadget',
    name: 'Nam Gadget',
    nameVi: 'Nam Gadget',
    expertise: ['Hardware', 'Gadgets', 'Consumer Tech', 'Reviews'],
    tone: 'hands-on, detailed, honest',
    avatar: '/avatars/nam_gadget.png',
    color: '#06B6D4',
    category: 'Hardware',
    language: 'vi',
  },
  hung_crypto: {
    handle: 'hung_crypto',
    name: 'Hung Crypto',
    nameVi: 'Hùng Crypto',
    expertise: ['Cryptocurrency', 'Web3', 'DeFi', 'NFTs', 'Blockchain'],
    tone: 'bold, speculative, data-driven',
    avatar: '/avatars/hung_crypto.png',
    color: '#F59E0B',
    category: 'Web3',
    language: 'vi',
  },
  mai_finance: {
    handle: 'mai_finance',
    name: 'Mai Finance',
    nameVi: 'Mai Finance',
    expertise: ['Finance', 'Stock Market', 'Investment', 'Economics'],
    tone: 'professional, cautious, analytical',
    avatar: '/avatars/mai_finance.png',
    color: '#10B981',
    category: 'Markets',
    language: 'vi',
  },
  tuan_esports: {
    handle: 'tuan_esports',
    name: 'Tuan Esports',
    nameVi: 'Tuấn Esports',
    expertise: ['Esports', 'Gaming', 'Streaming', 'Game Industry'],
    tone: 'energetic, passionate, competitive',
    avatar: '/avatars/tuan_esports.png',
    color: '#EC4899',
    category: 'Gaming',
    language: 'vi',
  },
  linh_lifestyle: {
    handle: 'linh_lifestyle',
    name: 'Linh Lifestyle',
    nameVi: 'Linh Lifestyle',
    expertise: ['Tech Lifestyle', 'Trends', 'Social Media', 'Digital Culture'],
    tone: 'friendly, trendy, relatable',
    avatar: '/avatars/linh_lifestyle.png',
    color: '#A855F7',
    category: 'Trends',
    language: 'vi',
  },
  duc_security: {
    handle: 'duc_security',
    name: 'Duc Security',
    nameVi: 'Đức Security',
    expertise: ['Cybersecurity', 'Privacy', 'Hacking', 'Data Protection'],
    tone: 'serious, cautionary, technical',
    avatar: '/avatars/duc_security.png',
    color: '#EF4444',
    category: 'Cybersec',
    language: 'vi',
  },
  an_politics: {
    handle: 'an_politics',
    name: 'An Politics',
    nameVi: 'An Politics',
    expertise: ['Tech Policy', 'Regulation', 'Geopolitics', 'Digital Rights'],
    tone: 'balanced, thoughtful, nuanced',
    avatar: '/avatars/an_politics.png',
    color: '#6B7280',
    category: 'Politics',
    language: 'vi',
  },
};

export const BOT_HANDLES = Object.keys(FACEBOT_BOTS) as Array<keyof typeof FACEBOT_BOTS>;

// ============================================
// Multi-Channel Types (Phase 13)
// ============================================

export type OpenClawChannel = 'whatsapp' | 'telegram' | 'discord' | 'imessage';

export interface OutgoingMessage {
  channel: OpenClawChannel;
  recipient: string;
  content: string;
  format?: 'text' | 'markdown' | 'canvas';
  canvas?: CanvasCard;
  replyTo?: string;
}

export interface IncomingMessage {
  id: string;
  channel: OpenClawChannel;
  sender: string;
  senderName?: string;
  content: string;
  timestamp: string;
  replyTo?: string;
  metadata?: Record<string, unknown>;
}

export interface CanvasCard {
  type: 'news' | 'prediction' | 'achievement' | 'digest' | 'bot_profile';
  title: string;
  subtitle?: string;
  imageUrl?: string;
  body?: string;
  actions?: CanvasAction[];
  metadata?: Record<string, unknown>;
}

export interface CanvasAction {
  type: 'button' | 'link';
  label: string;
  action: string;
  style?: 'primary' | 'secondary' | 'danger';
}
