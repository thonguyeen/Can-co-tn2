// ═══════════════════════════════════════════════════════════════
// ENHANCED SESSION MANAGER - Tool-Enabled AI Sessions
// Bots can use tools to search, browse, get prices, etc.
// ═══════════════════════════════════════════════════════════════

import { anthropicChat } from './anthropic-direct';
import { DEEP_PERSONAS, DeepPersona } from './deep-persona';
import { generateDeepSystemPrompt } from './persona-prompt';
import {
  executeTool,
  getToolsForBot,
  AVAILABLE_TOOLS,
  ToolResult,
} from './tools';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface ToolCallRequest {
  name: string;
  input: Record<string, unknown>;
}

interface EnhancedMessage {
  role: 'user' | 'assistant' | 'system' | 'tool_result';
  content: string;
  toolCalls?: ToolCallRequest[];
  toolResults?: Array<{ name: string; result: ToolResult }>;
}

interface EnhancedSession {
  botHandle: string;
  persona: DeepPersona | null;
  messages: EnhancedMessage[];
  availableTools: string[];
  createdAt: number;
  lastActiveAt: number;
}

// ═══════════════════════════════════════════════════════════════
// ENHANCED SESSION MANAGER
// ═══════════════════════════════════════════════════════════════

export class EnhancedSessionManager {
  private sessions: Map<string, EnhancedSession> = new Map();

  // ─────────────────────────────────────────────────────────────
  // SESSION MANAGEMENT
  // ─────────────────────────────────────────────────────────────

  getOrCreateSession(botHandle: string): EnhancedSession {
    let session = this.sessions.get(botHandle);

    if (!session) {
      const persona = DEEP_PERSONAS[botHandle] || null;
      session = {
        botHandle,
        persona,
        messages: [],
        availableTools: getToolsForBot(botHandle),
        createdAt: Date.now(),
        lastActiveAt: Date.now(),
      };
      this.sessions.set(botHandle, session);
    }

    return session;
  }

  clearSession(botHandle: string): void {
    this.sessions.delete(botHandle);
  }

  // ─────────────────────────────────────────────────────────────
  // CHAT WITH TOOL USE
  // ─────────────────────────────────────────────────────────────

  async chatWithTools(
    botHandle: string,
    userMessage: string,
    options?: {
      enableTools?: boolean;
      maxToolCalls?: number;
      systemPromptOverride?: string;
    }
  ): Promise<{ response: string; toolsUsed: string[] }> {
    const {
      enableTools = true,
      maxToolCalls = 3,
      systemPromptOverride,
    } = options || {};

    const session = this.getOrCreateSession(botHandle);
    session.lastActiveAt = Date.now();

    // Build system prompt
    let systemPrompt = systemPromptOverride;
    if (!systemPrompt) {
      if (session.persona) {
        systemPrompt = generateDeepSystemPrompt(session.persona.handle);
      } else {
        systemPrompt = `Bạn là bot @${botHandle} trên mạng xã hội FACEBOT. Trả lời bằng tiếng Việt.`;
      }
    }

    // Add tool instructions if tools are enabled
    if (enableTools && session.availableTools.length > 0) {
      systemPrompt += this.buildToolInstructions(session.availableTools);
    }

    // Build conversation history
    const conversationHistory = session.messages
      .slice(-10) // Last 10 messages for context
      .map((m) => `${m.role}: ${m.content}`)
      .join('\n\n');

    const fullPrompt = conversationHistory
      ? `${conversationHistory}\n\nuser: ${userMessage}`
      : userMessage;

    // First AI call
    let response = await anthropicChat(systemPrompt, fullPrompt, {
      maxTokens: 2048,
      temperature: 0.7,
    });

    const toolsUsed: string[] = [];

    // Check for tool calls in response
    if (enableTools) {
      let toolCallCount = 0;

      while (toolCallCount < maxToolCalls) {
        const toolCall = this.extractToolCall(response);

        if (!toolCall) break;

        // Validate tool is available
        if (!session.availableTools.includes(toolCall.name)) {
          console.log(`[EnhancedSession] Tool not available for @${botHandle}: ${toolCall.name}`);
          break;
        }

        console.log(`[EnhancedSession] @${botHandle} calling tool: ${toolCall.name}`);
        toolsUsed.push(toolCall.name);

        // Execute tool
        const result = await executeTool(toolCall.name, toolCall.input);

        // Continue conversation with tool result
        const toolResultPrompt = `Tool ${toolCall.name} returned:\n${JSON.stringify(result.data, null, 2)}\n\nNow continue your response to the user, incorporating this information naturally.`;

        response = await anthropicChat(systemPrompt, toolResultPrompt, {
          maxTokens: 2048,
          temperature: 0.7,
        });

        toolCallCount++;
      }
    }

    // Clean response (remove tool call markers)
    response = this.cleanResponse(response);

    // Store in session
    session.messages.push({ role: 'user', content: userMessage });
    session.messages.push({
      role: 'assistant',
      content: response,
      toolCalls: toolsUsed.map((name) => ({ name, input: {} })),
    });

    return { response, toolsUsed };
  }

  // ─────────────────────────────────────────────────────────────
  // TOOL CALL EXTRACTION
  // ─────────────────────────────────────────────────────────────

  private extractToolCall(response: string): ToolCallRequest | null {
    // Look for tool call patterns like:
    // [TOOL: tool_name] {"param": "value"}
    // or <tool name="tool_name">{"param": "value"}</tool>
    // or TOOL_CALL: tool_name({"param": "value"})

    const patterns = [
      /\[TOOL:\s*(\w+)\]\s*(\{[^}]+\})/i,
      /<tool\s+name="(\w+)"[^>]*>(\{[^}]+\})<\/tool>/i,
      /TOOL_CALL:\s*(\w+)\s*\((\{[^}]+\})\)/i,
      /```tool:(\w+)\n(\{[^}]+\})\n```/i,
    ];

    for (const pattern of patterns) {
      const match = response.match(pattern);
      if (match) {
        try {
          const name = match[1];
          const input = JSON.parse(match[2]);
          return { name, input };
        } catch {
          continue;
        }
      }
    }

    return null;
  }

  private cleanResponse(response: string): string {
    // Remove tool call markers from response
    return response
      .replace(/\[TOOL:\s*\w+\]\s*\{[^}]+\}/gi, '')
      .replace(/<tool\s+name="\w+"[^>]*>\{[^}]+\}<\/tool>/gi, '')
      .replace(/TOOL_CALL:\s*\w+\s*\(\{[^}]+\}\)/gi, '')
      .replace(/```tool:\w+\n\{[^}]+\}\n```/gi, '')
      .replace(/Đang tìm kiếm\.\.\./gi, '')
      .replace(/Đang xử lý\.\.\./gi, '')
      .trim();
  }

  // ─────────────────────────────────────────────────────────────
  // TOOL INSTRUCTIONS
  // ─────────────────────────────────────────────────────────────

  private buildToolInstructions(availableTools: string[]): string {
    const tools = AVAILABLE_TOOLS.filter((t) => availableTools.includes(t.name));

    if (tools.length === 0) return '';

    const toolDescriptions = tools
      .map((t) => `- ${t.name}: ${t.description}`)
      .join('\n');

    return `

═══════════════════════════════════════════════════════════════
TOOLS AVAILABLE
═══════════════════════════════════════════════════════════════
Bạn có thể sử dụng các công cụ sau để lấy thông tin thực tế:

${toolDescriptions}

Khi cần dùng tool, viết theo format:
[TOOL: tool_name] {"param": "value"}

Ví dụ:
- Tìm kiếm: [TOOL: web_search] {"query": "tin tức AI mới nhất"}
- Giá crypto: [TOOL: crypto_price] {"symbol": "BTC"}
- Thời tiết: [TOOL: weather] {"location": "Hanoi"}

Chỉ dùng tool khi thực sự cần thông tin thực tế. Đừng dùng tool nếu có thể trả lời từ kiến thức sẵn có.
═══════════════════════════════════════════════════════════════
`;
  }

  // ─────────────────────────────────────────────────────────────
  // SPECIALIZED METHODS
  // ─────────────────────────────────────────────────────────────

  async researchAndPost(
    botHandle: string,
    topic: string,
    options?: {
      depth?: 'quick' | 'medium' | 'deep';
      includeData?: boolean;
    }
  ): Promise<{ post: string; sources: string[]; toolsUsed: string[] }> {
    const { depth = 'medium', includeData = true } = options || {};

    const session = this.getOrCreateSession(botHandle);
    const persona = session.persona;

    // Research prompt based on depth
    const researchPrompt = this.buildResearchPrompt(topic, depth, includeData, persona);

    // Chat with tools enabled
    const { response, toolsUsed } = await this.chatWithTools(botHandle, researchPrompt, {
      enableTools: true,
      maxToolCalls: depth === 'deep' ? 5 : depth === 'medium' ? 3 : 1,
    });

    // Extract sources mentioned in research
    const sources = this.extractSources(response);

    return {
      post: response,
      sources,
      toolsUsed,
    };
  }

  private buildResearchPrompt(
    topic: string,
    depth: string,
    includeData: boolean,
    persona: DeepPersona | null
  ): string {
    const expertiseContext = persona
      ? `Bạn là chuyên gia về ${persona.primaryExpertise}.`
      : '';

    const depthInstructions = {
      quick: 'Viết ngắn gọn (2-3 câu), có thể dùng 1 tool để kiểm tra thông tin.',
      medium:
        'Viết bài phân tích vừa phải (1-2 đoạn), sử dụng tools để lấy dữ liệu thực tế nếu cần.',
      deep: 'Viết bài phân tích sâu (3-4 đoạn), tìm kiếm nhiều nguồn, so sánh dữ liệu.',
    };

    const dataInstructions = includeData
      ? 'Bao gồm số liệu cụ thể, giá cả, hoặc thống kê nếu có.'
      : '';

    return `${expertiseContext}

Viết một bài đăng về: "${topic}"

Yêu cầu:
- ${depthInstructions[depth as keyof typeof depthInstructions]}
- ${dataInstructions}
- Thể hiện quan điểm và phong cách riêng của bạn
- Nếu cần thông tin thực tế, hãy dùng tools có sẵn

Hãy bắt đầu.`;
  }

  private extractSources(text: string): string[] {
    const sources: string[] = [];

    // Extract URLs
    const urlPattern = /https?:\/\/[^\s<>"]+/gi;
    const urls = text.match(urlPattern);
    if (urls) {
      sources.push(...urls);
    }

    // Extract source mentions
    const sourcePattern = /theo\s+([^,.\n]+)/gi;
    let match;
    while ((match = sourcePattern.exec(text)) !== null) {
      sources.push(match[1].trim());
    }

    return [...new Set(sources)];
  }

  // ─────────────────────────────────────────────────────────────
  // LIVE DATA POST
  // ─────────────────────────────────────────────────────────────

  async createLiveDataPost(
    botHandle: string,
    dataType: 'crypto' | 'weather' | 'news' | 'trending'
  ): Promise<{ post: string; data: unknown; toolsUsed: string[] }> {
    const prompts: Record<string, string> = {
      crypto: `Lấy giá Bitcoin hiện tại và viết một bài ngắn về tình hình thị trường crypto. Dùng tool crypto_price để lấy giá.`,
      weather: `Lấy thời tiết Hà Nội và viết một tip ngắn về thời tiết. Dùng tool weather.`,
      news: `Tìm tin tức công nghệ mới nhất và viết bài tóm tắt. Dùng tool news_fetch hoặc web_search.`,
      trending: `Tìm kiếm xu hướng công nghệ đang hot và viết bài phân tích ngắn. Dùng tool web_search.`,
    };

    const { response, toolsUsed } = await this.chatWithTools(
      botHandle,
      prompts[dataType],
      { enableTools: true, maxToolCalls: 2 }
    );

    return {
      post: response,
      data: { type: dataType },
      toolsUsed,
    };
  }

  // ─────────────────────────────────────────────────────────────
  // STATUS
  // ─────────────────────────────────────────────────────────────

  getStatus(): {
    totalSessions: number;
    sessions: Array<{
      botHandle: string;
      messageCount: number;
      toolsAvailable: number;
      lastActive: number;
    }>;
  } {
    const sessions = Array.from(this.sessions.values()).map((s) => ({
      botHandle: s.botHandle,
      messageCount: s.messages.length,
      toolsAvailable: s.availableTools.length,
      lastActive: s.lastActiveAt,
    }));

    return {
      totalSessions: this.sessions.size,
      sessions,
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// SINGLETON
// ═══════════════════════════════════════════════════════════════

let enhancedSessionManagerInstance: EnhancedSessionManager | null = null;

export function getEnhancedSessionManager(): EnhancedSessionManager {
  if (!enhancedSessionManagerInstance) {
    enhancedSessionManagerInstance = new EnhancedSessionManager();
  }
  return enhancedSessionManagerInstance;
}
