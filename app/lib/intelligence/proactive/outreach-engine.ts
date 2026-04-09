// ═══════════════════════════════════════════════════════════════
// PROACTIVE OUTREACH ENGINE
// ═══════════════════════════════════════════════════════════════
//
// AI-powered system for bots to proactively reach out to users
//

import { prisma } from '@/lib/db';
import Anthropic from '@anthropic-ai/sdk';
import { getTopInterests } from '../interests/interest-tracker';
import { queryMemories } from '../memory/persistent-memory';
import { shouldNotifyUser } from './notification-timing';
import { getOpenClawClient } from '@/lib/openclaw/client';
import { FACEBOT_BOTS } from '@/lib/openclaw/types';

const anthropic = new Anthropic();

export type OutreachType =
  | 'news_alert'           // Relevant news for user
  | 'follow_up'            // Follow up on previous topic
  | 'recommendation'       // Content recommendation
  | 'insight'              // Insight about their interests
  | 'reminder'             // Reminder about something
  | 'check_in'             // General check-in
  | 'event_alert'          // Event they might care about
  | 'prediction_result'    // Prediction they participated in
  | 'milestone';           // Achievement/milestone

export interface OutreachCandidate {
  userId: string;
  type: OutreachType;
  botHandle: string;
  content: string;
  reason: string;
  priority: number;        // 1-10
  relevantMemories: string[];
  metadata: Record<string, unknown>;
}

export interface OutreachResult {
  success: boolean;
  userId: string;
  type: OutreachType;
  messageId?: string;
  channel?: string;
  error?: string;
}

// ═══════════════════════════════════════════════════════════════
// OUTREACH CANDIDATE GENERATION
// ═══════════════════════════════════════════════════════════════

export async function generateOutreachCandidates(
  maxCandidates: number = 50
): Promise<OutreachCandidate[]> {
  const candidates: OutreachCandidate[] = [];

  const activeUsers = await prisma.$queryRaw<any[]>`
    SELECT user_id FROM user_channels 
    WHERE is_verified = true 
      AND last_active_at >= NOW() - INTERVAL '7 days'
  `;

  const userIds = [...new Set((activeUsers || []).map(u => u.user_id))];

  for (const userId of userIds.slice(0, maxCandidates)) {
    const userCandidates = await generateUserOutreachCandidates(userId);
    candidates.push(...userCandidates);
  }

  // Sort by priority
  return candidates.sort((a, b) => b.priority - a.priority);
}

async function generateUserOutreachCandidates(userId: string): Promise<OutreachCandidate[]> {
  const candidates: OutreachCandidate[] = [];

  // Get user context
  const [interests, memories] = await Promise.all([
    getTopInterests(userId, 5),
    queryMemories({ userId, limit: 20 }),
  ]);

  if (interests.length === 0) return candidates;

  // 1. Check for relevant news
  const newsCandidate = await checkForRelevantNews(userId, interests);
  if (newsCandidate) candidates.push(newsCandidate);

  // 2. Check for follow-up opportunities
  const followUpCandidate = await checkForFollowUp(userId, memories);
  if (followUpCandidate) candidates.push(followUpCandidate);

  // 3. Check for insights to share
  const insightCandidate = await checkForInsights(userId, interests);
  if (insightCandidate) candidates.push(insightCandidate);

  // 4. Check for predictions results
  const predictionCandidate = await checkForPredictionResults(userId);
  if (predictionCandidate) candidates.push(predictionCandidate);

  return candidates;
}

// ═══════════════════════════════════════════════════════════════
// CANDIDATE CHECKERS
// ═══════════════════════════════════════════════════════════════

async function checkForRelevantNews(
  userId: string,
  interests: { topic: string }[]
): Promise<OutreachCandidate | null> {
  const interestTopics = interests.map(i => i.topic);

  // Find recent posts matching interests
  const relevantPosts = await prisma.post.findMany({
    where: {
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    },
    select: { id: true, content: true, createdAt: true, botId: true },
    orderBy: { likesCount: 'desc' },
    take: 20
  });

  if (!relevantPosts || relevantPosts.length === 0) return null;

  // Find post matching user interests
  for (const post of relevantPosts) {
    const contentLower = post.content.toLowerCase();
    const matchedInterest = interestTopics.find(topic =>
      contentLower.includes(topic.toLowerCase())
    );

    if (matchedInterest) {
      // Check if user already saw this
      const interaction = await prisma.$queryRaw<any[]>`
        SELECT id FROM user_post_interactions 
        WHERE user_id = ${userId} AND post_id = ${post.id} 
        LIMIT 1
      `;

      if (interaction.length === 0) {
        return {
          userId,
          type: 'news_alert',
          botHandle: post.botId || 'minh_ai',
          content: `Có tin mới về ${matchedInterest} mà mình nghĩ bạn sẽ quan tâm!`,
          reason: `User interested in ${matchedInterest}, new post available`,
          priority: 7,
          relevantMemories: [],
          metadata: { postId: post.id, interest: matchedInterest },
        };
      }
    }
  }

  return null;
}

async function checkForFollowUp(
  userId: string,
  memories: { id: string; type: string; content: string; createdAt: string; metadata?: Record<string, unknown> }[]
): Promise<OutreachCandidate | null> {
  // Find memories marked for follow-up
  const followUpMemories = memories.filter(m =>
    (m.metadata as Record<string, unknown>)?.needsFollowUp ||
    m.type === 'goal' ||
    (m.type === 'context' && m.content.includes('?'))
  );

  if (followUpMemories.length === 0) return null;

  // Check if enough time has passed
  const memory = followUpMemories[0];
  const daysSinceMemory = (Date.now() - new Date(memory.createdAt).getTime()) / (1000 * 60 * 60 * 24);

  if (daysSinceMemory < 2) return null; // Wait at least 2 days

  // Select appropriate bot
  const botHandle = selectBotForTopic(memory.content);

  return {
    userId,
    type: 'follow_up',
    botHandle,
    content: `Mình nhớ trước đó bạn có hỏi về "${memory.content.slice(0, 50)}...". Có update gì không?`,
    reason: `Following up on previous conversation topic`,
    priority: 6,
    relevantMemories: [memory.id],
    metadata: { memoryId: memory.id, daysSince: daysSinceMemory },
  };
}

async function checkForInsights(
  userId: string,
  interests: { topic: string; trend: string }[]
): Promise<OutreachCandidate | null> {
  // Generate insight about user's interests
  const risingInterests = interests.filter(i => i.trend === 'rising');

  if (risingInterests.length === 0) return null;

  const topRising = risingInterests[0];

  // Check if we've shared insight recently
  const recentOutreach = await prisma.$queryRaw<any[]>`
    SELECT id FROM outreach_log 
    WHERE user_id = ${userId} AND type = 'insight' 
      AND created_at >= NOW() - INTERVAL '7 days' 
    LIMIT 1
  `;

  if (recentOutreach.length > 0) return null;

  const botHandle = selectBotForTopic(topRising.topic);

  return {
    userId,
    type: 'insight',
    botHandle,
    content: `Mình thấy bạn đang quan tâm nhiều đến ${topRising.topic} gần đây! Có một số insights thú vị mình muốn share...`,
    reason: `Rising interest in ${topRising.topic}`,
    priority: 5,
    relevantMemories: [],
    metadata: { interest: topRising.topic, trend: 'rising' },
  };
}

async function checkForPredictionResults(
  userId: string
): Promise<OutreachCandidate | null> {
  // Find resolved predictions user participated in (not yet notified)
  const predictions = await prisma.$queryRaw<any[]>`
    SELECT up.*, p.status as p_status, p.correct_option as p_correct, p.question as p_question, p.created_by as p_created_by
    FROM user_predictions up
    JOIN predictions p ON up.prediction_id = p.id
    WHERE up.user_id = ${userId} AND up.notified = false
  `;

  if (!predictions || predictions.length === 0) return null;

  // Find one with resolved prediction
  const resolvedPrediction = predictions.find(p => p.p_status === 'resolved');

  if (!resolvedPrediction) return null;

  const isCorrect = resolvedPrediction.selected_option === resolvedPrediction.p_correct;

  return {
    userId,
    type: 'prediction_result',
    botHandle: resolvedPrediction.p_created_by || 'minh_ai',
    content: isCorrect
      ? `Dự đoán của bạn về "${resolvedPrediction.p_question}" đã đúng! +${resolvedPrediction.points_earned || 50} points!`
      : `Kết quả dự đoán "${resolvedPrediction.p_question}" đã có. Lần sau may mắn hơn nhé!`,
    reason: `Prediction result available`,
    priority: 8,
    relevantMemories: [],
    metadata: {
      predictionId: resolvedPrediction.prediction_id,
      isCorrect,
      points: resolvedPrediction.points_earned,
    },
  };
}

// ═══════════════════════════════════════════════════════════════
// OUTREACH EXECUTION
// ═══════════════════════════════════════════════════════════════

export async function executeOutreach(
  candidate: OutreachCandidate
): Promise<OutreachResult> {
  // Check if user should be notified now
  const shouldNotify = await shouldNotifyUser(candidate.userId);
  if (!shouldNotify.canNotify) {
    return {
      success: false,
      userId: candidate.userId,
      type: candidate.type,
      error: shouldNotify.reason,
    };
  }

  // Get user's preferred channel
  const channels = await prisma.$queryRaw<any[]>`
    SELECT channel, channel_id, preferences FROM user_channels 
    WHERE user_id = ${candidate.userId} AND is_primary = true 
    LIMIT 1
  `;
  const channel = channels[0];

  if (!channel) {
    return {
      success: false,
      userId: candidate.userId,
      type: candidate.type,
      error: 'No linked channel',
    };
  }

  // Check user preferences for this type of outreach
  const prefs = channel.preferences || {};
  if (!isOutreachTypeEnabled(candidate.type, prefs)) {
    return {
      success: false,
      userId: candidate.userId,
      type: candidate.type,
      error: 'User disabled this notification type',
    };
  }

  // Generate personalized message
  const bot = FACEBOT_BOTS[candidate.botHandle];
  const personalizedMessage = await generatePersonalizedMessage(
    candidate,
    bot,
    prefs.language || 'vi'
  );

  // Send via OpenClaw
  try {
    const client = getOpenClawClient();
    const result = await client.send({
      channel: channel.channel,
      recipient: channel.channel_id,
      content: personalizedMessage,
    });

    // Log outreach
    await prisma.$executeRaw`
      INSERT INTO outreach_log (user_id, type, bot_handle, content, channel, success, metadata)
      VALUES (${candidate.userId}, ${candidate.type}, ${candidate.botHandle}, ${personalizedMessage}, ${channel.channel}, ${result.success}, ${JSON.stringify(candidate.metadata)}::jsonb)
    `;

    return {
      success: result.success,
      userId: candidate.userId,
      type: candidate.type,
      messageId: result.messageId,
      channel: channel.channel,
    };
  } catch (error) {
    return {
      success: false,
      userId: candidate.userId,
      type: candidate.type,
      error: error instanceof Error ? error.message : 'Send failed',
    };
  }
}

async function generatePersonalizedMessage(
  candidate: OutreachCandidate,
  bot: { name: string; handle: string; tone: string; avatar?: string } | undefined,
  language: string
): Promise<string> {
  if (!bot) {
    return candidate.content;
  }

  const prompt = `You are ${bot.name} (@${bot.handle}), a FACEBOT bot.
Personality: ${bot.tone}

Generate a proactive message to a user. Be natural, friendly, not salesy.
Type: ${candidate.type}
Base content: ${candidate.content}
Reason: ${candidate.reason}
Language: ${language === 'vi' ? 'Vietnamese' : 'English'}

Keep it SHORT (2-3 sentences max). Include your personality.
Start with a greeting or emoji that fits your character.

Message:`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 256,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const emoji = getBotEmoji(bot.handle);
    return `${emoji} *@${bot.handle}*:\n\n${text.trim()}`;

  } catch {
    const emoji = getBotEmoji(bot.handle);
    return `${emoji} *@${bot.handle}*:\n\n${candidate.content}`;
  }
}

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function selectBotForTopic(topic: string): string {
  const topicLower = topic.toLowerCase();

  const botMapping: Record<string, string> = {
    ai: 'minh_ai',
    gpt: 'minh_ai',
    llm: 'minh_ai',
    crypto: 'hung_crypto',
    bitcoin: 'hung_crypto',
    startup: 'lan_startup',
    funding: 'lan_startup',
    iphone: 'nam_gadget',
    phone: 'nam_gadget',
    stock: 'mai_finance',
    market: 'mai_finance',
    game: 'tuan_esports',
    esports: 'tuan_esports',
    security: 'duc_security',
    hack: 'duc_security',
  };

  for (const [keyword, bot] of Object.entries(botMapping)) {
    if (topicLower.includes(keyword)) {
      return bot;
    }
  }

  return 'minh_ai'; // Default
}

function isOutreachTypeEnabled(type: OutreachType, prefs: Record<string, unknown>): boolean {
  const typeMapping: Record<OutreachType, string> = {
    news_alert: 'breakingNews',
    follow_up: 'botReplies',
    recommendation: 'dailyDigest',
    insight: 'dailyDigest',
    reminder: 'achievements',
    check_in: 'botReplies',
    event_alert: 'breakingNews',
    prediction_result: 'predictions',
    milestone: 'achievements',
  };

  const prefKey = typeMapping[type];
  return prefs[prefKey] !== false;
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
