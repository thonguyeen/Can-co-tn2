// ═══════════════════════════════════════════════════════════════
// MESSAGE HANDLER
// ═══════════════════════════════════════════════════════════════
//
// Processes incoming messages and routes to appropriate handlers
//

import { IncomingMessage, CanvasCard, OpenClawChannel } from './types';
import { getOpenClawClient } from './client';
import { getUserByChannelId, verifyChannelLink, updateSubscriptions, unlinkChannel, getUserChannels, updateChannelPreferences, ChannelPreferences } from './channel-manager';
import { sanitizeInput, isValidVerificationCode } from './security';

export interface CommandContext {
  userId: string | null;
  isLinked: boolean;
  channel: OpenClawChannel;
  channelId: string;
  language: 'vi' | 'en';
}

export interface CommandResult {
  response: string;
  canvas?: CanvasCard;
  followUp?: string;
}

// ═══════════════════════════════════════════════════════════════
// COMMAND DEFINITIONS
// ═══════════════════════════════════════════════════════════════

const COMMANDS: Record<string, string[]> = {
  // Help
  help: ['help', 'trợ giúp', '?'],

  // News
  news: ['news', 'tin', 'tin tức'],
  breaking: ['breaking', 'nóng', 'tin nóng'],
  digest: ['digest', 'tóm tắt'],

  // Bot conversations
  bot: ['@'],

  // Predictions
  predict: ['predict', 'dự đoán', 'vote'],
  predictions: ['predictions', 'pd'],

  // Gamification
  stats: ['stats', 'thống kê', 'điểm'],
  leaderboard: ['leaderboard', 'xếp hạng', 'top'],
  achievements: ['achievements', 'thành tích', 'badges'],
  streak: ['streak', 'chuỗi'],

  // Subscription
  subscribe: ['subscribe', 'đăng ký', 'sub'],
  unsubscribe: ['unsubscribe', 'hủy', 'unsub'],

  // Settings
  settings: ['settings', 'cài đặt', 'config'],
  language: ['language', 'ngôn ngữ', 'lang'],

  // Account
  link: ['link', 'liên kết'],
  unlink: ['unlink', 'hủy liên kết'],

  // Voice
  voice: ['voice', 'đọc', 'read'],
};

// ═══════════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════

export async function handleIncomingMessage(
  message: IncomingMessage
): Promise<CommandResult> {
  // Sanitize input
  const content = sanitizeInput(message.content);
  if (!content) {
    return { response: '' };
  }

  // Get user context
  const userInfo = await getUserByChannelId(message.channel, message.sender);
  const context: CommandContext = {
    userId: userInfo?.userId || null,
    isLinked: !!userInfo,
    channel: message.channel,
    channelId: message.sender,
    language: userInfo?.preferences.language || 'vi',
  };

  // Check if verification code
  if (isValidVerificationCode(content)) {
    return handleVerificationCode(content, context);
  }

  // Parse command
  const { command, args } = parseCommand(content);

  // Route to appropriate handler
  switch (command) {
    case 'help':
      return getHelpMessage(context);

    case 'news':
      return handleNewsCommand(args, context);

    case 'breaking':
      return handleNewsCommand(['breaking'], context);

    case 'digest':
      return handleNewsCommand(['digest'], context);

    case 'bot':
      return handleBotConversation(args, context);

    case 'predict':
    case 'predictions':
      return handlePredictionCommand(args, context);

    case 'stats':
    case 'leaderboard':
    case 'achievements':
    case 'streak':
      return handleGamificationCommand(command, args, context);

    case 'subscribe':
      return handleSubscribe(args, context);

    case 'unsubscribe':
      return handleUnsubscribe(args, context);

    case 'settings':
      return handleSettings(args, context);

    case 'link':
      return handleLinkAccount(context);

    case 'unlink':
      return handleUnlinkAccount(context);

    case 'voice':
      return handleVoiceCommand(args, context);

    default:
      // Check if it's a bot mention
      if (content.startsWith('@')) {
        return handleBotConversation([content], context);
      }

      // Natural language - try to understand intent
      return handleNaturalLanguage(content, context);
  }
}

// ═══════════════════════════════════════════════════════════════
// COMMAND PARSER
// ═══════════════════════════════════════════════════════════════

function parseCommand(content: string): { command: string; args: string[] } {
  const words = content.toLowerCase().trim().split(/\s+/);
  const firstWord = words[0];

  for (const [cmd, patterns] of Object.entries(COMMANDS)) {
    if (patterns.some(p => firstWord.startsWith(p))) {
      return {
        command: cmd,
        args: words.slice(1),
      };
    }
  }

  return { command: 'unknown', args: words };
}

// ═══════════════════════════════════════════════════════════════
// HELP MESSAGE
// ═══════════════════════════════════════════════════════════════

function getHelpMessage(context: CommandContext): CommandResult {
  const isVi = context.language === 'vi';

  const helpText = isVi ? `
🤖 *FACEBOT Commands*

📰 *Tin tức*
• \`news\` - Tin mới nhất
• \`news ai\` - Tin AI/Tech
• \`news crypto\` - Tin Crypto
• \`breaking\` - Tin nóng
• \`digest\` - Tóm tắt ngày

💬 *Chat với Bot*
• \`@minh_ai <câu hỏi>\` - Hỏi Minh AI
• \`@hung_crypto <câu hỏi>\` - Hỏi Hùng Crypto
• \`@nam_gadget <câu hỏi>\` - Hỏi Nam Gadget

🎯 *Dự đoán*
• \`predictions\` - Xem dự đoán
• \`predict <id> yes/no\` - Vote

🏆 *Gamification*
• \`stats\` - Điểm của bạn
• \`leaderboard\` - Bảng xếp hạng
• \`achievements\` - Thành tích
• \`streak\` - Chuỗi ngày

⚙️ *Cài đặt*
• \`subscribe ai\` - Đăng ký tin AI
• \`settings\` - Xem cài đặt
• \`unlink\` - Hủy liên kết

🔊 *Voice*
• \`voice <tin>\` - Đọc tin bằng giọng nói
` : `
🤖 *FACEBOT Commands*

📰 *News*
• \`news\` - Latest news
• \`news ai\` - AI/Tech news
• \`news crypto\` - Crypto news
• \`breaking\` - Breaking news
• \`digest\` - Daily digest

💬 *Chat with Bots*
• \`@minh_ai <question>\` - Ask Minh AI
• \`@hung_crypto <question>\` - Ask Hung Crypto

🎯 *Predictions*
• \`predictions\` - View predictions
• \`predict <id> yes/no\` - Vote

🏆 *Gamification*
• \`stats\` - Your stats
• \`leaderboard\` - Rankings
• \`achievements\` - Badges

⚙️ *Settings*
• \`subscribe ai\` - Subscribe to AI news
• \`settings\` - View settings
`;

  return { response: helpText };
}

// ═══════════════════════════════════════════════════════════════
// VERIFICATION HANDLER
// ═══════════════════════════════════════════════════════════════

async function handleVerificationCode(
  code: string,
  context: CommandContext
): Promise<CommandResult> {
  if (context.isLinked) {
    return {
      response: context.language === 'vi'
        ? '✅ Tài khoản của bạn đã được liên kết rồi.'
        : '✅ Your account is already linked.',
    };
  }

  const result = await verifyChannelLink(context.channel, context.channelId, code);

  if (result.success) {
    return {
      response: context.language === 'vi'
        ? `✅ Liên kết thành công! Chào mừng đến với FACEBOT.\n\nGõ "help" để xem hướng dẫn.`
        : `✅ Successfully linked! Welcome to FACEBOT.\n\nType "help" for instructions.`,
    };
  }

  return {
    response: context.language === 'vi'
      ? `❌ Mã không hợp lệ hoặc đã hết hạn. Vui lòng lấy mã mới từ FACEBOT web.`
      : `❌ Invalid or expired code. Please get a new code from FACEBOT web.`,
  };
}

// ═══════════════════════════════════════════════════════════════
// NEWS COMMANDS (Simplified - full implementation in news-commands.ts)
// ═══════════════════════════════════════════════════════════════

async function handleNewsCommand(
  args: string[],
  context: CommandContext
): Promise<CommandResult> {
  // Dynamic import to avoid circular dependencies
  try {
    const { handleNewsCommand: newsHandler } = await import('./news-commands');
    return newsHandler(args, context);
  } catch {
    return {
      response: context.language === 'vi'
        ? '📰 Tính năng tin tức đang được cập nhật. Vui lòng thử lại sau.'
        : '📰 News feature is being updated. Please try again later.',
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// BOT CONVERSATION (Simplified - full implementation in bot-conversation.ts)
// ═══════════════════════════════════════════════════════════════

async function handleBotConversation(
  args: string[],
  context: CommandContext
): Promise<CommandResult> {
  try {
    const { handleBotConversation: botHandler } = await import('./bot-conversation');
    return botHandler(args, context);
  } catch {
    return {
      response: context.language === 'vi'
        ? '🤖 Tính năng chat với bot đang được cập nhật.'
        : '🤖 Bot chat feature is being updated.',
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// PREDICTION COMMANDS (Simplified)
// ═══════════════════════════════════════════════════════════════

async function handlePredictionCommand(
  args: string[],
  context: CommandContext
): Promise<CommandResult> {
  if (!context.isLinked) {
    return requireLink(context);
  }

  try {
    const { handlePredictionCommand: predHandler } = await import('./prediction-commands');
    return predHandler(args, context);
  } catch {
    return {
      response: context.language === 'vi'
        ? '🎯 Tính năng dự đoán đang được cập nhật.'
        : '🎯 Prediction feature is being updated.',
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// GAMIFICATION COMMANDS (Simplified)
// ═══════════════════════════════════════════════════════════════

async function handleGamificationCommand(
  command: string,
  args: string[],
  context: CommandContext
): Promise<CommandResult> {
  if (!context.isLinked) {
    return requireLink(context);
  }

  try {
    const { handleGamificationCommand: gamHandler } = await import('./gamification-commands');
    return gamHandler(command, args, context);
  } catch {
    return {
      response: context.language === 'vi'
        ? '🏆 Tính năng gamification đang được cập nhật.'
        : '🏆 Gamification feature is being updated.',
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// SUBSCRIPTION HANDLERS
// ═══════════════════════════════════════════════════════════════

async function handleSubscribe(
  args: string[],
  context: CommandContext
): Promise<CommandResult> {
  if (!context.isLinked) {
    return requireLink(context);
  }

  const categories = args.length > 0 ? args : ['all'];
  const validCategories = ['all', 'ai', 'crypto', 'startup', 'gadget', 'finance', 'gaming', 'security'];

  const validInput = categories.filter(c => validCategories.includes(c));
  if (validInput.length === 0) {
    return {
      response: context.language === 'vi'
        ? `Danh mục không hợp lệ. Chọn: ${validCategories.join(', ')}`
        : `Invalid category. Choose: ${validCategories.join(', ')}`,
    };
  }

  await updateSubscriptions(context.userId!, context.channel, validInput);

  return {
    response: context.language === 'vi'
      ? `✅ Đã đăng ký: ${validInput.join(', ')}`
      : `✅ Subscribed to: ${validInput.join(', ')}`,
  };
}

async function handleUnsubscribe(
  args: string[],
  context: CommandContext
): Promise<CommandResult> {
  if (!context.isLinked) {
    return requireLink(context);
  }

  if (args[0] === 'all') {
    await updateSubscriptions(context.userId!, context.channel, []);

    return {
      response: context.language === 'vi'
        ? '✅ Đã hủy tất cả đăng ký.'
        : '✅ Unsubscribed from all.',
    };
  }

  return {
    response: context.language === 'vi'
      ? 'Dùng "unsubscribe all" để hủy tất cả.'
      : 'Use "unsubscribe all" to unsubscribe from everything.',
  };
}

// ═══════════════════════════════════════════════════════════════
// SETTINGS HANDLERS
// ═══════════════════════════════════════════════════════════════

async function handleSettings(
  args: string[],
  context: CommandContext
): Promise<CommandResult> {
  if (!context.isLinked) {
    return requireLink(context);
  }

  // If args provided, update setting
  if (args.length >= 2) {
    const [setting, value] = args;
    const updates: Partial<ChannelPreferences> = {};

    switch (setting.toLowerCase()) {
      case 'breaking':
        updates.breakingNews = value.toLowerCase() !== 'off';
        break;
      case 'digest':
        if (/^\d{2}:\d{2}$/.test(value)) {
          updates.digestTime = value;
        } else {
          updates.dailyDigest = value.toLowerCase() !== 'off';
        }
        break;
      case 'language':
      case 'lang':
        updates.language = value.toLowerCase() === 'en' ? 'en' : 'vi';
        break;
      default:
        return {
          response: context.language === 'vi'
            ? 'Cài đặt không hợp lệ. Dùng: breaking, digest, language'
            : 'Invalid setting. Use: breaking, digest, language',
        };
    }

    await updateChannelPreferences(context.userId!, context.channel, updates);
    return {
      response: context.language === 'vi'
        ? `✅ Đã cập nhật cài đặt ${setting}`
        : `✅ Updated ${setting} setting`,
    };
  }

  // Show current settings
  const channels = await getUserChannels(context.userId!);
  const current = channels.find(c => c.channel === context.channel);

  if (!current) {
    return { response: 'Error loading settings.' };
  }

  const prefs = current.preferences;

  return {
    response: context.language === 'vi' ? `
⚙️ *Cài đặt của bạn*

📢 Breaking News: ${prefs.breakingNews ? '✅' : '❌'}
📰 Daily Digest: ${prefs.dailyDigest ? '✅' : '❌'} (${prefs.digestTime})
🏆 Achievements: ${prefs.achievements ? '✅' : '❌'}
🎯 Predictions: ${prefs.predictions ? '✅' : '❌'}
🤖 Bot Replies: ${prefs.botReplies ? '✅' : '❌'}
🌐 Language: ${prefs.language.toUpperCase()}

📋 Subscriptions: ${current.subscriptions.join(', ')}

Thay đổi: \`settings breaking off\`
` : `
⚙️ *Your Settings*

📢 Breaking News: ${prefs.breakingNews ? '✅' : '❌'}
📰 Daily Digest: ${prefs.dailyDigest ? '✅' : '❌'} (${prefs.digestTime})
🏆 Achievements: ${prefs.achievements ? '✅' : '❌'}
🎯 Predictions: ${prefs.predictions ? '✅' : '❌'}
🤖 Bot Replies: ${prefs.botReplies ? '✅' : '❌'}
🌐 Language: ${prefs.language.toUpperCase()}

📋 Subscriptions: ${current.subscriptions.join(', ')}
`,
  };
}

async function handleLinkAccount(context: CommandContext): Promise<CommandResult> {
  if (context.isLinked) {
    return {
      response: context.language === 'vi'
        ? '✅ Tài khoản đã được liên kết.'
        : '✅ Account already linked.',
    };
  }

  return {
    response: context.language === 'vi'
      ? `🔗 Để liên kết tài khoản:
1. Đăng nhập FACEBOT web
2. Vào Settings > Channels
3. Chọn "${context.channel}"
4. Nhập mã 6 số vào đây`
      : `🔗 To link your account:
1. Login to FACEBOT web
2. Go to Settings > Channels
3. Select "${context.channel}"
4. Enter the 6-digit code here`,
  };
}

async function handleUnlinkAccount(context: CommandContext): Promise<CommandResult> {
  if (!context.isLinked) {
    return {
      response: context.language === 'vi'
        ? 'Bạn chưa liên kết tài khoản.'
        : 'Your account is not linked.',
    };
  }

  await unlinkChannel(context.userId!, context.channel);

  return {
    response: context.language === 'vi'
      ? '✅ Đã hủy liên kết. Tạm biệt! 👋'
      : '✅ Account unlinked. Goodbye! 👋',
  };
}

// ═══════════════════════════════════════════════════════════════
// VOICE HANDLER
// ═══════════════════════════════════════════════════════════════

async function handleVoiceCommand(
  args: string[],
  context: CommandContext
): Promise<CommandResult> {
  if (args.length === 0) {
    return {
      response: context.language === 'vi'
        ? 'Dùng: `voice news` để nghe tin mới nhất'
        : 'Use: `voice news` for latest news audio',
    };
  }

  // Get news for voice
  const newsResult = await handleNewsCommand(args, context);

  // Add voice marker for OpenClaw TTS
  return {
    response: `🔊 ${newsResult.response}`,
  };
}

// ═══════════════════════════════════════════════════════════════
// NATURAL LANGUAGE HANDLER
// ═══════════════════════════════════════════════════════════════

async function handleNaturalLanguage(
  content: string,
  context: CommandContext
): Promise<CommandResult> {
  const lower = content.toLowerCase();

  // Detect intent
  if (lower.includes('tin') || lower.includes('news') || lower.includes('mới')) {
    return handleNewsCommand([], context);
  }

  if (lower.includes('điểm') || lower.includes('point') || lower.includes('score')) {
    return handleGamificationCommand('stats', [], context);
  }

  if (lower.includes('dự đoán') || lower.includes('predict')) {
    return handlePredictionCommand([], context);
  }

  if (lower.includes('help') || lower.includes('giúp') || lower.includes('hướng dẫn')) {
    return getHelpMessage(context);
  }

  // Default: treat as question to default bot
  return handleBotConversation([`@minh_ai ${content}`], context);
}

// ═══════════════════════════════════════════════════════════════
// HELPER
// ═══════════════════════════════════════════════════════════════

function requireLink(context: CommandContext): CommandResult {
  return {
    response: context.language === 'vi'
      ? '🔗 Vui lòng liên kết tài khoản trước. Gõ "link" để xem hướng dẫn.'
      : '🔗 Please link your account first. Type "link" for instructions.',
  };
}
