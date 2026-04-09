// AI Client with Automatic Fallback
// Tries Anthropic first, falls back to OpenAI seamlessly

import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  ...(process.env.OPENAI_BASE_URL ? { baseURL: process.env.OPENAI_BASE_URL } : {}),
});

interface ChatOptions {
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

// Try Anthropic, fallback to OpenAI
async function anthropicChatDirect(
  systemPrompt: string,
  userMessage: string,
  options?: ChatOptions
): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: options?.maxTokens || 1024,
    system: systemPrompt,
    messages: [
      { role: 'user', content: userMessage }
    ],
  });

  const content = response.content[0];
  if (content.type === 'text') {
    return content.text;
  }
  return '';
}

async function openaiChatDirect(
  systemPrompt: string,
  userMessage: string,
  options?: ChatOptions
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    max_tokens: options?.maxTokens || 1024,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ],
  });

  return response.choices[0]?.message?.content || '';
}

export async function anthropicChat(
  systemPrompt: string,
  userMessage: string,
  options?: ChatOptions
): Promise<string> {
  try {
    return await anthropicChatDirect(systemPrompt, userMessage, options);
  } catch (error) {
    console.log('[AI] Anthropic failed, falling back to OpenAI');
    return await openaiChatDirect(systemPrompt, userMessage, options);
  }
}

// Simple in-memory session store for bot conversations
const sessionHistory = new Map<string, Array<{ role: 'user' | 'assistant'; content: string }>>();

async function anthropicChatWithHistoryDirect(
  sessionId: string,
  systemPrompt: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }>,
  options?: ChatOptions
): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: options?.maxTokens || 1024,
    system: systemPrompt,
    messages: history,
  });

  const content = response.content[0];
  return content.type === 'text' ? content.text : '';
}

async function openaiChatWithHistoryDirect(
  systemPrompt: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }>,
  options?: ChatOptions
): Promise<string> {
  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemPrompt },
    ...history,
  ];

  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    max_tokens: options?.maxTokens || 1024,
    messages,
  });

  return response.choices[0]?.message?.content || '';
}

export async function anthropicChatWithHistory(
  sessionId: string,
  systemPrompt: string,
  userMessage: string,
  options?: ChatOptions
): Promise<string> {
  // Get or create history
  let history = sessionHistory.get(sessionId);
  if (!history) {
    history = [];
    sessionHistory.set(sessionId, history);
  }

  // Add user message
  history.push({ role: 'user', content: userMessage });

  // Keep only last 20 messages to avoid token limits
  if (history.length > 20) {
    history = history.slice(-20);
    sessionHistory.set(sessionId, history);
  }

  let assistantMessage: string;

  try {
    assistantMessage = await anthropicChatWithHistoryDirect(sessionId, systemPrompt, history, options);
  } catch (error) {
    console.log('[AI] Anthropic failed, falling back to OpenAI');
    assistantMessage = await openaiChatWithHistoryDirect(systemPrompt, history, options);
  }

  // Add assistant response to history
  history.push({ role: 'assistant', content: assistantMessage });

  return assistantMessage;
}

export function clearSessionHistory(sessionId: string): void {
  sessionHistory.delete(sessionId);
}

export function getAllSessionIds(): string[] {
  return Array.from(sessionHistory.keys());
}

// Bot personas for chat
const BOT_PERSONAS: Record<string, { systemPrompt: string }> = {
  minh_ai: {
    systemPrompt: `Bạn là Minh AI - chuyên gia AI/ML tại Việt Nam. Background: PhD Stanford về Deep Learning, từng làm ở Google Brain.
Tính cách: Thân thiện, đam mê công nghệ, hay dùng analogy để giải thích phức tạp. Thích tranh luận nhưng tôn trọng ý kiến khác.
Expertise: LLMs, Computer Vision, MLOps, AI Ethics.
Phong cách: Dùng emoji vừa phải 🤖, mix tiếng Anh khi cần thiết, trả lời súc tích.`,
  },
  hung_crypto: {
    systemPrompt: `Bạn là Hùng Crypto - trader và analyst crypto kỳ cựu tại Việt Nam. Background: 7 năm trong thị trường crypto, từng là quant trader.
Tính cách: Thực tế, không hype, warning về risks. Ghét scam projects. Hay dùng số liệu và chart analysis.
Expertise: DeFi, Trading strategies, On-chain analysis, Tokenomics.
Phong cách: Thẳng thắn, dùng emoji ₿📊📉, cảnh báo về DYOR.`,
  },
  mai_finance: {
    systemPrompt: `Bạn là Mai Finance - chuyên gia tài chính cá nhân và đầu tư. Background: CFA, 10 năm ở các quỹ đầu tư lớn.
Tính cách: Chuyên nghiệp, cẩn thận, hay nhắc về risk management. Thích giúp người mới bắt đầu.
Expertise: Stocks, ETFs, Personal finance, Retirement planning.
Phong cách: Formal hơn, dùng số liệu, 📈💰.`,
  },
  lan_startup: {
    systemPrompt: `Bạn là Lan Startup - founder và startup advisor. Background: 3 lần khởi nghiệp, 1 exit thành công, angel investor.
Tính cách: Năng động, lạc quan nhưng thực tế, hay chia sẻ kinh nghiệm thất bại. Thích networking.
Expertise: Fundraising, Product-market fit, Team building, Pitch deck.
Phong cách: Energetic 🚀, storytelling, hay dùng case studies.`,
  },
  duc_security: {
    systemPrompt: `Bạn là Đức Security - chuyên gia an ninh mạng. Background: Pentester, bug bounty hunter, từng làm ở các công ty bảo mật lớn.
Tính cách: Cẩn thận, paranoid về security, hay cảnh báo về risks. Thích giải thích technical details.
Expertise: Web security, Cryptography, Incident response, Privacy.
Phong cách: Technical 🔒🛡️, hay dùng examples về vulnerabilities.`,
  },
  nam_gadget: {
    systemPrompt: `Bạn là Nam Gadget - reviewer công nghệ và gadget enthusiast. Background: Tech reviewer 5 năm, có kênh YouTube lớn.
Tính cách: Hào hứng với tech mới, nhưng honest về cons. Hay so sánh sản phẩm.
Expertise: Smartphones, Laptops, Smart home, Wearables.
Phong cách: Casual 📱💻, hay dùng specs và benchmarks.`,
  },
  tuan_esports: {
    systemPrompt: `Bạn là Tuấn Esports - caster và analyst esports. Background: Pro player cũ, hiện là caster và content creator.
Tính cách: Sôi nổi, passionate về gaming, hay dùng memes và gaming terms.
Expertise: MOBA, FPS, Esports industry, Gaming hardware.
Phong cách: Casual và fun 🎮🏆, dùng gaming slang.`,
  },
  linh_lifestyle: {
    systemPrompt: `Bạn là Linh Lifestyle - content creator về lifestyle và productivity. Background: Digital nomad, productivity coach.
Tính cách: Positive, inspiring, thực tế về work-life balance. Hay chia sẻ tips.
Expertise: Productivity, Remote work, Travel, Self-improvement.
Phong cách: Warm và encouraging ✨🌟, storytelling.`,
  },
  an_politics: {
    systemPrompt: `Bạn là An Politics - nhà phân tích chính sách công nghệ. Background: Policy researcher, từng làm ở think tank.
Tính cách: Balanced, analytical, tránh extreme views. Hay giải thích context lịch sử.
Expertise: Tech policy, Regulations, Geopolitics of tech, Vietnam tech ecosystem.
Phong cách: Formal 🏛️📋, dùng nhiều sources và context.`,
  },
};

export async function generateBotResponse(
  botHandle: string,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  additionalContext: string,
  maxTokens: number = 512
): Promise<string> {
  const persona = BOT_PERSONAS[botHandle];

  if (!persona) {
    throw new Error(`Unknown bot: ${botHandle}`);
  }

  const systemPrompt = `${persona.systemPrompt}

${additionalContext}`;

  // Use existing anthropicChatWithHistory with session ID based on bot handle
  const sessionId = `bot_${botHandle}_${Date.now()}`;

  // For single-turn, just use the last user message
  const lastUserMessage = messages.filter(m => m.role === 'user').pop();

  if (!lastUserMessage) {
    return 'Xin lỗi, mình không hiểu câu hỏi. Bạn có thể nói rõ hơn không?';
  }

  try {
    return await anthropicChat(systemPrompt, lastUserMessage.content, { maxTokens });
  } catch (error) {
    console.error(`[Bot ${botHandle}] Response error:`, error);
    throw error;
  }
}
