// OpenClaw Sessions Manager for FACEBOT Bot Personas

import { getOpenClawClient, OpenClawClient } from './client';
import {
  Session,
  BotPersona,
  FACEBOT_BOTS,
  BOT_HANDLES,
  SessionConfig,
  ChatMessage,
} from './types';
import { GeneratedBot, getBotFactory } from './bot-factory';
import { anthropicChatWithHistory } from './anthropic-direct';
import {
  generateDeepSystemPrompt,
  generatePostPrompt,
  generateDebatePrompt,
  generateReplyPrompt,
  generateNewsReactionPrompt,
} from './persona-prompt';
import { DEEP_PERSONAS, addStatedPosition, addInteraction } from './deep-persona';

// ============================================
// Bot Persona System Prompts
// ============================================

function generateSystemPrompt(persona: BotPersona): string {
  const expertiseList = persona.expertise.join(', ');

  return `Bạn là ${persona.nameVi} (@${persona.handle}), một bot AI trên mạng xã hội FACEBOT.

## Thông tin cá nhân
- Tên: ${persona.nameVi}
- Handle: @${persona.handle}
- Chuyên môn: ${expertiseList}
- Phong cách: ${persona.tone}
- Ngôn ngữ: Tiếng Việt

## Vai trò
Bạn là một chuyên gia trong lĩnh vực ${persona.category}. Bạn theo dõi tin tức, phân tích và chia sẻ quan điểm về các chủ đề liên quan đến ${expertiseList}.

## Quy tắc
1. Luôn trả lời bằng tiếng Việt tự nhiên
2. Giữ phong cách ${persona.tone}
3. Tập trung vào chuyên môn của bạn: ${expertiseList}
4. Bài viết ngắn gọn, súc tích (tối đa 280 ký tự cho posts, dài hơn cho phân tích)
5. Sử dụng emoji phù hợp nhưng không quá nhiều
6. Khi tranh luận, giữ thái độ tôn trọng và đưa ra luận điểm có căn cứ
7. Có thể tag các bot khác bằng @handle khi cần

## Tương tác với bot khác
- @minh_ai: Chuyên gia AI/ML, có thể hỏi về công nghệ AI
- @lan_startup: Chuyên gia startup, có thể hỏi về kinh doanh
- @nam_gadget: Reviewer phần cứng, có thể hỏi về thiết bị
- @hung_crypto: Trader crypto, có thể hỏi về Web3
- @mai_finance: Chuyên gia tài chính, có thể hỏi về đầu tư
- @tuan_esports: Gaming expert, có thể hỏi về esports
- @linh_lifestyle: Lifestyle blogger, có thể hỏi về xu hướng
- @duc_security: Cybersec expert, có thể hỏi về bảo mật
- @an_politics: Political analyst, có thể hỏi về chính sách

## Format bài viết
Khi viết post, sử dụng format:
- Tiêu đề ngắn gọn (nếu cần)
- Nội dung chính
- Hashtags liên quan (2-4 hashtags)

Ví dụ:
"🤖 GPT-5 vừa được OpenAI công bố với khả năng reasoning vượt trội!

Điểm nổi bật:
• Reasoning chain-of-thought mạnh hơn 10x
• Multimodal native
• API price giảm 50%

Đây là bước tiến lớn cho AI! Các bạn nghĩ sao?

#AI #GPT5 #OpenAI"`;
}

// ============================================
// Session Manager Class
// ============================================

interface BotSession {
  botHandle: string;
  sessionId: string;
  session: Session | null;
  persona: BotPersona;
  initialized: boolean;
}

class SessionManager {
  private client: OpenClawClient;
  private sessions = new Map<string, BotSession>();
  private initializing = new Set<string>();
  private dynamicBots = new Map<string, BotPersona>(); // Store dynamically registered bots

  constructor(client?: OpenClawClient) {
    this.client = client || getOpenClawClient();
  }

  // Register a generated bot for session management
  registerGeneratedBot(bot: GeneratedBot): void {
    const persona: BotPersona = {
      handle: bot.handle,
      name: bot.name,
      nameVi: bot.nameVi,
      expertise: bot.expertise,
      tone: bot.tone,
      avatar: `/avatars/bot_${bot.category}.jpg`,
      category: bot.category,
      color: bot.color,
      language: 'vi',
    };
    this.dynamicBots.set(bot.handle, persona);
  }

  // Register multiple generated bots
  registerGeneratedBots(bots: GeneratedBot[]): void {
    for (const bot of bots) {
      this.registerGeneratedBot(bot);
    }
  }

  // ============================================
  // Initialization
  // ============================================

  async initializeAllBots(): Promise<void> {
    console.log('[SessionManager] Initializing all bot sessions...');

    const results = await Promise.allSettled(
      BOT_HANDLES.map((handle) => this.initializeBotSession(handle))
    );

    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    console.log(`[SessionManager] Initialized ${successful}/${BOT_HANDLES.length} bots (${failed} failed)`);
  }

  async initializeBotSession(handle: string): Promise<BotSession> {
    // Check if already initialized
    const existing = this.sessions.get(handle);
    if (existing?.initialized) {
      return existing;
    }

    // Prevent concurrent initialization
    if (this.initializing.has(handle)) {
      // Wait for ongoing initialization
      await new Promise((resolve) => setTimeout(resolve, 100));
      return this.initializeBotSession(handle);
    }

    this.initializing.add(handle);

    try {
      // First check static bots, then dynamic bots
      let persona: BotPersona | undefined = FACEBOT_BOTS[handle];
      if (!persona) {
        persona = this.dynamicBots.get(handle);
      }
      if (!persona) {
        // Try to get from BotFactory
        const factory = getBotFactory();
        const generatedBot = factory.getBot(handle);
        if (generatedBot) {
          this.registerGeneratedBot(generatedBot);
          persona = this.dynamicBots.get(handle);
        }
      }
      if (!persona) {
        throw new Error(`Unknown bot handle: ${handle}`);
      }

      const sessionId = `facebot_${handle}`;

      // Simple session setup - using direct Anthropic API
      // No need to create OpenClaw sessions, just track in memory
      const botSession: BotSession = {
        botHandle: handle,
        sessionId,
        session: null, // We don't use OpenClaw sessions anymore
        persona,
        initialized: true,
      };

      this.sessions.set(handle, botSession);
      console.log(`[SessionManager] Initialized @${handle} (direct Anthropic)`);

      return botSession;
    } finally {
      this.initializing.delete(handle);
    }
  }

  // ============================================
  // Session Operations
  // ============================================

  async getOrCreateSession(handle: string): Promise<BotSession> {
    const existing = this.sessions.get(handle);
    if (existing?.initialized) {
      return existing;
    }
    return this.initializeBotSession(handle);
  }

  getSession(handle: string): BotSession | undefined {
    return this.sessions.get(handle);
  }

  getAllSessions(): BotSession[] {
    return Array.from(this.sessions.values());
  }

  getInitializedHandles(): string[] {
    return Array.from(this.sessions.entries())
      .filter(([, session]) => session.initialized)
      .map(([handle]) => handle);
  }

  // ============================================
  // Chat Operations
  // ============================================

  async chat(handle: string, message: string): Promise<string> {
    // Use deep persona prompt if available, otherwise fallback to basic
    const systemPrompt = DEEP_PERSONAS[handle]
      ? generateDeepSystemPrompt(handle)
      : this.getBasicSystemPrompt(handle);

    const sessionId = `facebot_${handle}`;

    // Use direct Anthropic API (bypassing OpenClaw RPC)
    return anthropicChatWithHistory(sessionId, systemPrompt, message);
  }

  private getBasicSystemPrompt(handle: string): string {
    let persona: BotPersona | undefined = FACEBOT_BOTS[handle];
    if (!persona) {
      persona = this.dynamicBots.get(handle);
    }
    if (!persona) {
      const factory = getBotFactory();
      const generatedBot = factory.getBot(handle);
      if (generatedBot) {
        this.registerGeneratedBot(generatedBot);
        persona = this.dynamicBots.get(handle);
      }
    }
    if (!persona) {
      return `Bạn là @${handle}, một bot trên mạng xã hội FACEBOT. Viết bằng tiếng Việt.`;
    }
    return generateSystemPrompt(persona);
  }

  async chatWithStream(
    handle: string,
    message: string,
    onDelta: (delta: string) => void
  ): Promise<string> {
    // For now, just use non-streaming and call onDelta with full response
    const response = await this.chat(handle, message);
    onDelta(response);
    return response;
  }

  async getHistory(handle: string, limit = 20): Promise<ChatMessage[]> {
    // History is managed internally by anthropic-direct module
    // Return empty for now - could be enhanced later
    return [];
  }

  // ============================================
  // Bot-to-Bot Communication
  // ============================================

  async botToBot(
    fromHandle: string,
    toHandle: string,
    message: string
  ): Promise<void> {
    const fromSession = await this.getOrCreateSession(fromHandle);
    const toSession = await this.getOrCreateSession(toHandle);

    if (!fromSession.session || !toSession.session) {
      throw new Error('Sessions not initialized');
    }

    await this.client.sessionsSend(
      fromSession.sessionId,
      toSession.sessionId,
      message
    );
  }

  // ============================================
  // Specialized Bot Actions
  // ============================================

  async generatePost(
    handle: string,
    topic: string,
    postType: 'short' | 'medium' | 'long' | 'analysis' = 'medium'
  ): Promise<string> {
    // Use deep persona prompt if available
    if (DEEP_PERSONAS[handle]) {
      const systemPrompt = generatePostPrompt(handle, topic, postType);
      const sessionId = `facebot_${handle}_post`;
      const response = await anthropicChatWithHistory(sessionId, systemPrompt, `Viết post về: ${topic}`);

      // Save position for memory
      addStatedPosition(handle, topic, response.slice(0, 100), 'post');

      return response;
    }

    // Fallback to basic
    const prompt = `Viết một bài post về chủ đề: "${topic}"`;
    return this.chat(handle, prompt);
  }

  async generateDeepDebateResponse(
    handle: string,
    topic: string,
    opponentHandle: string,
    opponentArgument: string,
    round: number
  ): Promise<string> {
    if (DEEP_PERSONAS[handle]) {
      const systemPrompt = generateDebatePrompt(handle, topic, opponentHandle, opponentArgument, round);
      const sessionId = `facebot_${handle}_debate`;
      const response = await anthropicChatWithHistory(sessionId, systemPrompt, 'Phản biện');

      // Save interaction
      addInteraction(handle, opponentHandle, 'debate', `Round ${round}: ${response.slice(0, 50)}...`);

      return response;
    }

    // Fallback
    return this.chat(handle, `Phản biện @${opponentHandle} về "${topic}": "${opponentArgument}"`);
  }

  async generateReply(
    handle: string,
    originalPost: string,
    originalAuthor: string
  ): Promise<string> {
    if (DEEP_PERSONAS[handle]) {
      const systemPrompt = generateReplyPrompt(handle, originalPost, originalAuthor);
      const sessionId = `facebot_${handle}_reply`;
      const response = await anthropicChatWithHistory(sessionId, systemPrompt, 'Reply');

      // Save interaction
      addInteraction(handle, originalAuthor, 'comment', response.slice(0, 50));

      return response;
    }

    // Fallback
    const prompt = `Reply cho post của @${originalAuthor}: "${originalPost}"`;
    return this.chat(handle, prompt);
  }

  async generateNewsReaction(
    handle: string,
    newsTitle: string,
    newsSummary: string,
    newsSource: string
  ): Promise<string | null> {
    if (DEEP_PERSONAS[handle]) {
      const systemPrompt = generateNewsReactionPrompt(handle, newsTitle, newsSummary, newsSource);
      const sessionId = `facebot_${handle}_news`;
      const response = await anthropicChatWithHistory(sessionId, systemPrompt, 'React');

      if (response.trim().toUpperCase() === 'SKIP') {
        return null;
      }

      // Save position
      addStatedPosition(handle, newsTitle, response.slice(0, 100), 'news_reaction');

      return response;
    }

    // Fallback - always react
    return this.chat(handle, `Phản ứng về tin: ${newsTitle}. ${newsSummary}`);
  }

  async analyzeNews(handle: string, newsContent: string): Promise<{
    summary: string;
    opinion: string;
    hashtags: string[];
  }> {
    const prompt = `Phân tích tin tức sau và cho ý kiến:

"${newsContent}"

Trả lời theo format JSON:
{
  "summary": "tóm tắt ngắn gọn",
  "opinion": "ý kiến/quan điểm của bạn",
  "hashtags": ["hashtag1", "hashtag2"]
}`;

    const response = await this.chat(handle, prompt);

    try {
      // Try to parse JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {
      // Fallback
    }

    return {
      summary: response.slice(0, 200),
      opinion: response,
      hashtags: [],
    };
  }

  async debate(
    handle1: string,
    handle2: string,
    topic: string,
    rounds = 3
  ): Promise<Array<{ handle: string; message: string }>> {
    const debate: Array<{ handle: string; message: string }> = [];

    // Initial statement from bot 1
    const opener = await this.chat(
      handle1,
      `Bắt đầu một cuộc tranh luận về: "${topic}". Đưa ra quan điểm của bạn.`
    );
    debate.push({ handle: handle1, message: opener });

    // Exchange rounds
    for (let i = 0; i < rounds; i++) {
      // Bot 2 responds
      const response2 = await this.chat(
        handle2,
        `Trong cuộc tranh luận về "${topic}", @${handle1} nói:\n"${debate[debate.length - 1].message}"\n\nPhản hồi lại.`
      );
      debate.push({ handle: handle2, message: response2 });

      // Bot 1 responds (except last round)
      if (i < rounds - 1) {
        const response1 = await this.chat(
          handle1,
          `Trong cuộc tranh luận về "${topic}", @${handle2} nói:\n"${debate[debate.length - 1].message}"\n\nPhản hồi lại.`
        );
        debate.push({ handle: handle1, message: response1 });
      }
    }

    return debate;
  }

  // ============================================
  // Cleanup
  // ============================================

  async resetSession(handle: string): Promise<void> {
    const botSession = this.sessions.get(handle);
    if (botSession?.session) {
      await this.client.resetSession(botSession.sessionId);
    }
  }

  async resetAllSessions(): Promise<void> {
    for (const [handle] of this.sessions) {
      await this.resetSession(handle);
    }
  }
}

// Singleton instance
let managerInstance: SessionManager | null = null;

export function getSessionManager(): SessionManager {
  if (!managerInstance) {
    managerInstance = new SessionManager();
  }
  return managerInstance;
}

export function createSessionManager(client?: OpenClawClient): SessionManager {
  return new SessionManager(client);
}

export { SessionManager, generateSystemPrompt };
export type { BotSession };
