// ═══════════════════════════════════════════════════════════════
// BOT CONVERSATION HANDLER
// ═══════════════════════════════════════════════════════════════
//
// Handles direct conversations with FACEBOT bots via chat
//

import { prisma } from '@/lib/db';
import { CommandContext, CommandResult } from './message-handler';
import { CanvasCard, FACEBOT_BOTS, BotPersona } from './types';
import { generateBotResponse } from './anthropic-direct';

// Conversation history (in-memory cache)
const conversationHistory: Map<string, { botHandle: string; messages: ConversationMessage[] }[]> = new Map();

interface ConversationMessage {
  userMessage: string;
  botResponse: string;
  timestamp: number;
}

const MAX_HISTORY = 10;

// ═══════════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════

export async function handleBotConversation(
  args: string[],
  context: CommandContext
): Promise<CommandResult> {
  const content = args.join(' ');
  const { botHandle, message } = parseBotMention(content);

  if (!botHandle) {
    return listAvailableBots(context);
  }

  const bot = FACEBOT_BOTS[botHandle];
  if (!bot) {
    return {
      response: context.language === 'vi'
        ? `❌ Không tìm thấy bot @${botHandle}. Gõ "@" để xem danh sách bots.`
        : `❌ Bot @${botHandle} not found. Type "@" to see available bots.`,
    };
  }

  if (!message) {
    return getBotProfile(bot, context);
  }

  // Generate response
  const response = await generateChatResponse(bot, message, context);

  // Save to conversation history
  saveToHistory(context.channelId, botHandle, message, response);

  // Award points if user is linked
  if (context.userId) {
    await awardBotInteractionPoints(context.userId, botHandle);
  }

  const avatar = getBotEmoji(bot.handle);

  return {
    response: `${avatar} *@${bot.handle}*:\n\n${response}`,
    canvas: createBotResponseCanvas(bot, response),
  };
}

// ═══════════════════════════════════════════════════════════════
// BOT RESPONSE GENERATION
// ═══════════════════════════════════════════════════════════════

async function generateChatResponse(
  bot: BotPersona,
  message: string,
  context: CommandContext
): Promise<string> {
  // Get conversation history
  const history = getHistory(context.channelId, bot.handle);

  // Build context-aware prompt
  const chatContext = `
## CONTEXT
- Đang chat qua ${context.channel}
- User ${context.isLinked ? 'đã liên kết tài khoản FACEBOT' : 'chưa liên kết'}
- Ngôn ngữ: ${context.language === 'vi' ? 'Tiếng Việt' : 'English'}

## QUY TẮC CHAT
- Trả lời ngắn gọn (2-4 câu) trừ khi cần giải thích chi tiết
- Thân thiện, conversational
- Có thể dùng emoji phù hợp với personality
- Nếu không biết, nói thẳng và suggest hỏi bot khác
- KHÔNG mention "AI" hay "chatbot" - hành xử như một chuyên gia thực thụ
`;

  // Build messages with history
  const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];

  history.slice(-5).forEach(h => {
    messages.push({ role: 'user', content: h.userMessage });
    messages.push({ role: 'assistant', content: h.botResponse });
  });

  messages.push({ role: 'user', content: message });

  try {
    const response = await generateBotResponse(
      bot.handle,
      messages,
      chatContext,
      512 // Max tokens for chat
    );

    return response;
  } catch (error) {
    console.error('Bot response error:', error);
    return context.language === 'vi'
      ? 'Xin lỗi, mình đang bận. Thử lại sau nhé!'
      : "Sorry, I'm busy right now. Try again later!";
  }
}

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function parseBotMention(content: string): { botHandle: string | null; message: string } {
  const match = content.match(/^@(\w+)\s*([\s\S]*)/);

  if (match) {
    return {
      botHandle: match[1].toLowerCase(),
      message: match[2].trim(),
    };
  }

  return { botHandle: null, message: content };
}

function listAvailableBots(context: CommandContext): CommandResult {
  const bots = Object.values(FACEBOT_BOTS)
    .map(b => `${getBotEmoji(b.handle)} @${b.handle} - ${b.name} (${b.expertise.slice(0, 2).join(', ')})`)
    .join('\n');

  return {
    response: context.language === 'vi'
      ? `🤖 *Bots có sẵn:*\n\n${bots}\n\nDùng: \`@<handle> <câu hỏi>\``
      : `🤖 *Available bots:*\n\n${bots}\n\nUse: \`@<handle> <question>\``,
  };
}

function getBotProfile(
  bot: BotPersona,
  context: CommandContext
): CommandResult {
  const emoji = getBotEmoji(bot.handle);

  const profile = context.language === 'vi'
    ? `${emoji} *${bot.name}* (@${bot.handle})

📊 Chuyên môn: ${bot.expertise.join(', ')}
🎭 Tính cách: ${bot.tone}
🏷️ Danh mục: ${bot.category}

💬 Hỏi: \`@${bot.handle} <câu hỏi của bạn>\``
    : `${emoji} *${bot.name}* (@${bot.handle})

📊 Expertise: ${bot.expertise.join(', ')}
🎭 Personality: ${bot.tone}
🏷️ Category: ${bot.category}

💬 Ask: \`@${bot.handle} <your question>\``;

  return {
    response: profile,
    canvas: {
      type: 'bot_profile',
      title: bot.name,
      subtitle: `@${bot.handle}`,
      imageUrl: bot.avatar,
      body: bot.expertise.join(', '),
      metadata: { expertise: bot.expertise },
    },
  };
}

function createBotResponseCanvas(
  bot: BotPersona,
  response: string
): CanvasCard {
  return {
    type: 'bot_profile',
    title: bot.name,
    subtitle: `@${bot.handle}`,
    imageUrl: bot.avatar,
    body: response.slice(0, 200) + (response.length > 200 ? '...' : ''),
    actions: [
      { type: 'button', label: 'Xem profile', action: `@${bot.handle}`, style: 'secondary' },
    ],
  };
}

function getBotEmoji(handle: string): string {
  const emojis: Record<string, string> = {
    minh_ai: '🤖',
    hung_crypto: '₿',
    mai_finance: '📈',
    lan_startup: '🚀',
    duc_security: '🔒',
    nam_gadget: '📱',
    tuan_esports: '🎮',
    linh_lifestyle: '✨',
    an_politics: '🏛️',
  };
  return emojis[handle] || '🤖';
}

// ═══════════════════════════════════════════════════════════════
// CONVERSATION HISTORY
// ═══════════════════════════════════════════════════════════════

function getHistory(channelId: string, botHandle: string): ConversationMessage[] {
  const userHistory = conversationHistory.get(channelId) || [];
  const botHistory = userHistory.find(h => h.botHandle === botHandle);
  return botHistory?.messages || [];
}

function saveToHistory(
  channelId: string,
  botHandle: string,
  userMessage: string,
  botResponse: string
): void {
  let userHistory = conversationHistory.get(channelId);

  if (!userHistory) {
    userHistory = [];
    conversationHistory.set(channelId, userHistory);
  }

  let botHistory = userHistory.find(h => h.botHandle === botHandle);

  if (!botHistory) {
    botHistory = { botHandle, messages: [] };
    userHistory.push(botHistory);
  }

  botHistory.messages.push({
    userMessage,
    botResponse,
    timestamp: Date.now()
  });

  // Keep only last N messages
  if (botHistory.messages.length > MAX_HISTORY) {
    botHistory.messages = botHistory.messages.slice(-MAX_HISTORY);
  }
}

// ═══════════════════════════════════════════════════════════════
// POINTS
// ═══════════════════════════════════════════════════════════════

async function awardBotInteractionPoints(userId: string, botHandle: string): Promise<void> {
  try {
    await prisma.pointTransaction.create({
      data: {
        userId: userId,
        amount: 2,
        reason: `bot_chat:${botHandle}`,
      }
    });
  } catch (error) {
    console.error('Failed to award points:', error);
  }
}
