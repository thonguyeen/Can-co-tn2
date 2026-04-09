// OpenClaw Adapter - Drop-in replacement for OpenAI client
// Maintains same interface as lib/ai/client.ts

import { getOpenClawClient } from './client';
import { getSessionManager } from './sessions';
import { ChatMessage } from './types';

// Feature flag - set via env or runtime
let useOpenClaw = process.env.USE_OPENCLAW === 'true';

// Current bot context (for session routing)
let currentBotHandle: string | null = null;

// ============================================
// Configuration
// ============================================

export function setUseOpenClaw(enabled: boolean): void {
  useOpenClaw = enabled;
}

export function isUsingOpenClaw(): boolean {
  return useOpenClaw;
}

export function setBotContext(handle: string | null): void {
  currentBotHandle = handle;
}

export function getBotContext(): string | null {
  return currentBotHandle;
}

// ============================================
// OpenClaw Chat Implementation
// ============================================

async function openclawChat(
  systemPrompt: string,
  userMessage: string,
  options?: {
    maxTokens?: number;
    temperature?: number;
    botHandle?: string;
  }
): Promise<string> {
  const client = getOpenClawClient();

  // Ensure connected
  if (!client.isConnected()) {
    await client.connect();
  }

  const botHandle = options?.botHandle || currentBotHandle;

  if (botHandle) {
    // Use bot session
    const sessionManager = getSessionManager();
    const fullPrompt = `${systemPrompt}\n\n---\n\n${userMessage}`;
    return sessionManager.chat(botHandle, fullPrompt);
  } else {
    // Create ad-hoc session for one-off requests
    const session = await client.createSession({
      name: `adhoc_${Date.now()}`,
      systemPrompt,
      model: 'anthropic/claude-sonnet-4-20250514',
    });

    const response = await client.sendMessage(session.id, userMessage);
    return response.content;
  }
}

async function openclawChatWithJSON<T>(
  systemPrompt: string,
  userMessage: string,
  options?: {
    maxTokens?: number;
    temperature?: number;
    botHandle?: string;
  }
): Promise<T> {
  // Add JSON instruction to prompt
  const jsonSystemPrompt = `${systemPrompt}

IMPORTANT: You must respond with valid JSON only. No markdown code blocks, no explanations - just the raw JSON object.`;

  const response = await openclawChat(jsonSystemPrompt, userMessage, options);

  // Extract JSON from response
  const jsonMatch =
    response.match(/```json\n?([\s\S]*?)\n?```/) ||
    response.match(/```\n?([\s\S]*?)\n?```/) ||
    response.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error('No JSON found in response');
  }

  const jsonStr = jsonMatch[1] || jsonMatch[0];
  return JSON.parse(jsonStr) as T;
}

// ============================================
// OpenAI Fallback Implementation
// ============================================

async function openaiChat(
  systemPrompt: string,
  userMessage: string,
  options?: {
    maxTokens?: number;
    temperature?: number;
  }
): Promise<string> {
  // Dynamic import to avoid loading if not needed
  const { chat } = await import('../ai/client');
  return chat(systemPrompt, userMessage, options);
}

async function openaiChatWithJSON<T>(
  systemPrompt: string,
  userMessage: string,
  options?: {
    maxTokens?: number;
    temperature?: number;
  }
): Promise<T> {
  const { chatWithJSON } = await import('../ai/client');
  return chatWithJSON<T>(systemPrompt, userMessage, options);
}

// ============================================
// Unified Interface (same as lib/ai/client.ts)
// ============================================

export async function chat(
  systemPrompt: string,
  userMessage: string,
  options?: {
    maxTokens?: number;
    temperature?: number;
    botHandle?: string;
  }
): Promise<string> {
  if (useOpenClaw) {
    try {
      return await openclawChat(systemPrompt, userMessage, options);
    } catch (error) {
      console.error('[OpenClaw Adapter] Error, falling back to OpenAI:', error);
      // Fallback to OpenAI on error
      return openaiChat(systemPrompt, userMessage, options);
    }
  }
  return openaiChat(systemPrompt, userMessage, options);
}

export async function chatWithJSON<T>(
  systemPrompt: string,
  userMessage: string,
  options?: {
    maxTokens?: number;
    temperature?: number;
    botHandle?: string;
  }
): Promise<T> {
  if (useOpenClaw) {
    try {
      return await openclawChatWithJSON<T>(systemPrompt, userMessage, options);
    } catch (error) {
      console.error('[OpenClaw Adapter] Error, falling back to OpenAI:', error);
      // Fallback to OpenAI on error
      return openaiChatWithJSON<T>(systemPrompt, userMessage, options);
    }
  }
  return openaiChatWithJSON<T>(systemPrompt, userMessage, options);
}

// ============================================
// Streaming Interface
// ============================================

export async function chatStream(
  systemPrompt: string,
  userMessage: string,
  onDelta: (delta: string) => void,
  options?: {
    maxTokens?: number;
    temperature?: number;
    botHandle?: string;
  }
): Promise<string> {
  if (!useOpenClaw) {
    // OpenAI streaming (simplified - full implementation would use stream API)
    const response = await openaiChat(systemPrompt, userMessage, options);
    onDelta(response);
    return response;
  }

  const client = getOpenClawClient();

  if (!client.isConnected()) {
    await client.connect();
  }

  const botHandle = options?.botHandle || currentBotHandle;

  if (botHandle) {
    const sessionManager = getSessionManager();
    const fullPrompt = `${systemPrompt}\n\n---\n\n${userMessage}`;
    return sessionManager.chatWithStream(botHandle, fullPrompt, onDelta);
  } else {
    // Create ad-hoc session
    const session = await client.createSession({
      name: `adhoc_stream_${Date.now()}`,
      systemPrompt,
      model: 'anthropic/claude-sonnet-4-20250514',
    });

    const response = await client.sendMessageStream(session.id, userMessage, onDelta);
    return response.content;
  }
}

// ============================================
// Bot-specific Chat
// ============================================

export async function chatAsBot(
  botHandle: string,
  userMessage: string,
  options?: {
    maxTokens?: number;
    temperature?: number;
  }
): Promise<string> {
  if (!useOpenClaw) {
    // Fallback: use OpenAI with bot persona prompt
    const { getBotPersonaPrompt } = await import('../ai/prompts/bot-personas');
    const systemPrompt = getBotPersonaPrompt(botHandle);
    return openaiChat(systemPrompt, userMessage, options);
  }

  const sessionManager = getSessionManager();
  return sessionManager.chat(botHandle, userMessage);
}

// ============================================
// Multi-turn Conversation
// ============================================

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function chatConversation(
  messages: ConversationMessage[],
  options?: {
    botHandle?: string;
    maxTokens?: number;
    temperature?: number;
  }
): Promise<string> {
  if (!useOpenClaw) {
    // OpenAI multi-turn
    const { getOpenAIClient } = await import('../ai/client');
    const openai = getOpenAIClient();

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      max_tokens: options?.maxTokens || 2048,
      temperature: options?.temperature || 0.3,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    return response.choices[0]?.message?.content || '';
  }

  // OpenClaw: send all messages as context
  const formattedMessages = messages
    .map((m) => `[${m.role.toUpperCase()}]: ${m.content}`)
    .join('\n\n');

  return chat(
    'Continue this conversation naturally.',
    formattedMessages,
    options
  );
}

// ============================================
// Health Check
// ============================================

export async function checkOpenClawConnection(): Promise<{
  connected: boolean;
  sessions: number;
  error?: string;
}> {
  try {
    const client = getOpenClawClient();

    if (!client.isConnected()) {
      await client.connect();
    }

    const sessions = await client.listSessions();

    return {
      connected: true,
      sessions: sessions.length,
    };
  } catch (error) {
    return {
      connected: false,
      sessions: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================
// Initialize All Bot Sessions
// ============================================

export async function initializeBotSessions(): Promise<void> {
  if (!useOpenClaw) {
    console.log('[OpenClaw Adapter] OpenClaw disabled, skipping initialization');
    return;
  }

  const client = getOpenClawClient();

  if (!client.isConnected()) {
    await client.connect();
  }

  const sessionManager = getSessionManager();
  await sessionManager.initializeAllBots();
}
