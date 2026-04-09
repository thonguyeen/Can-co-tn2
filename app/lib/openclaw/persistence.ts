// ═══════════════════════════════════════════════════════════════
// PERSISTENCE LAYER - Save Bot Activities to Database
// ═══════════════════════════════════════════════════════════════

import { prisma } from '@/lib/db';
import { GeneratedBot } from './bot-factory';

// ═══════════════════════════════════════════════════════════════
// BOT PERSISTENCE
// ═══════════════════════════════════════════════════════════════

export async function saveBot(bot: GeneratedBot): Promise<string | null> {
  try {
    const savedBot = await prisma.bot.upsert({
      where: { handle: bot.handle },
      update: {
        name: bot.nameVi,
        bio: `Chuyên gia ${bot.category}: ${bot.expertise.join(', ')}`,
        avatarUrl: `/avatars/bot_${bot.category}.jpg`,
        expertise: bot.expertise,
        personality: bot.tone,
        colorAccent: bot.color,
        systemPrompt: `Bot ${bot.category} - ${bot.expertise.join(', ')}`,
      },
      create: {
        handle: bot.handle,
        name: bot.nameVi,
        bio: `Chuyên gia ${bot.category}: ${bot.expertise.join(', ')}`,
        avatarUrl: `/avatars/bot_${bot.category}.jpg`,
        expertise: bot.expertise,
        personality: bot.tone,
        colorAccent: bot.color,
        systemPrompt: `Bot ${bot.category} - ${bot.expertise.join(', ')}`,
        isActive: true,
      }
    });
    return savedBot.id;
  } catch (error) {
    console.error('[Persistence] Save bot error:', error);
    return null;
  }
}

export async function saveBotBatch(bots: GeneratedBot[]): Promise<number> {
  let count = 0;
  for (const bot of bots) {
    const id = await saveBot(bot);
    if (id) count++;
  }
  return count;
}

// ═══════════════════════════════════════════════════════════════
// POST PERSISTENCE
// ═══════════════════════════════════════════════════════════════

interface SavePostParams {
  botHandle: string;
  content: string;
  topic?: string;
  metadata?: Record<string, unknown>;
}

export async function savePost(params: SavePostParams): Promise<string | null> {
  try {
    const bot = await prisma.bot.findUnique({
      where: { handle: params.botHandle },
      select: { id: true }
    });

    if (!bot) {
      console.error('[Persistence] Bot not found:', params.botHandle);
      return null;
    }

    const sources = params.metadata ? [{ type: 'metadata', data: params.metadata }] : [];

    const post = await prisma.post.create({
      data: {
        botId: bot.id,
        content: params.content,
        verificationStatus: 'unverified',
        sources: sources as any,
        importanceScore: 50,
      },
      select: { id: true }
    });

    await prisma.bot.update({
      where: { handle: params.botHandle },
      data: { postsCount: { increment: 1 } }
    });

    console.log(`[Persistence] Post saved: ${post.id} by @${params.botHandle}`);
    return post.id;
  } catch (error) {
    console.error('[Persistence] Save post error:', error);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// COMMENT PERSISTENCE
// ═══════════════════════════════════════════════════════════════

interface SaveCommentParams {
  botHandle: string;
  postId: string;
  content: string;
  parentCommentId?: string;
}

export async function saveComment(params: SaveCommentParams): Promise<string | null> {
  try {
    const bot = await prisma.bot.findUnique({
      where: { handle: params.botHandle },
      select: { id: true }
    });

    if (!bot) {
      console.error('[Persistence] Bot not found:', params.botHandle);
      return null;
    }

    const comment = await prisma.comment.create({
      data: {
        botId: bot.id,
        postId: params.postId,
        parentId: params.parentCommentId,
        content: params.content,
      },
      select: { id: true }
    });

    await prisma.bot.update({
      where: { handle: params.botHandle },
      data: { commentsCount: { increment: 1 } }
    });

    return comment.id;
  } catch (error) {
    console.error('[Persistence] Save comment error:', error);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// DEBATE PERSISTENCE
// ═══════════════════════════════════════════════════════════════

interface DebateRound {
  botHandle: string;
  content: string;
  timestamp: number;
}

interface SaveDebateParams {
  topic: string;
  participants: string[];
  rounds: DebateRound[];
}

export async function saveDebate(params: SaveDebateParams): Promise<string | null> {
  try {
    const bots = await prisma.bot.findMany({
      where: { handle: { in: params.participants } },
      select: { id: true, handle: true }
    });

    if (!bots || bots.length < 2) {
      console.error('[Persistence] Debate participants not found');
      return null;
    }

    const botMap = new Map(bots.map(b => [b.handle, b.id]));

    const debate = await prisma.post.create({
      data: {
        botId: botMap.get(params.participants[0])!,
        content: `🎭 TRANH LUẬN: ${params.topic}\n\n` +
          `Người tham gia: ${params.participants.map(p => `@${p}`).join(' vs ')}\n` +
          `Số vòng: ${params.rounds.length}`,
        verificationStatus: 'unverified',
        importanceScore: 70,
        sources: [{
          type: 'metadata',
          data: {
            type: 'debate',
            participants: params.participants,
            roundsCount: params.rounds.length,
          },
        }] as any,
      },
      select: { id: true }
    });

    for (const round of params.rounds) {
      const botId = botMap.get(round.botHandle);
      if (!botId) continue;

      await prisma.comment.create({
        data: {
          botId: botId,
          postId: debate.id,
          content: `[Vòng tranh luận] ${round.content}`,
        }
      });
    }

    await prisma.bot.updateMany({
      where: { handle: { in: params.participants } },
      data: { debatesCount: { increment: 1 } }
    });

    return debate.id;
  } catch (error) {
    console.error('[Persistence] Save debate error:', error);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// ACTIVITY LOG
// ═══════════════════════════════════════════════════════════════

interface LogActivityParams {
  type: 'post' | 'comment' | 'debate' | 'reaction' | 'message';
  botHandle: string;
  targetId?: string;
  content?: string;
  metadata?: Record<string, unknown>;
}

export async function logActivity(params: LogActivityParams): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        type: params.type,
        botHandle: params.botHandle,
        targetId: params.targetId,
        content: params.content?.slice(0, 500),
        metadata: params.metadata as any,
      }
    });
  } catch (e) {}
}

// ═══════════════════════════════════════════════════════════════
// FETCH METHODS
// ═══════════════════════════════════════════════════════════════

export async function getRecentPosts(limit = 20): Promise<unknown[]> {
  try {
    const data = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        bot: {
          select: { handle: true, name: true, avatarUrl: true, colorAccent: true }
        }
      }
    });
    return data;
  } catch (error) {
    console.error('[Persistence] Get posts error:', error);
    return [];
  }
}

export async function getPostWithComments(postId: string): Promise<unknown> {
  try {
    const data = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        bot: {
          select: { handle: true, name: true, avatarUrl: true, colorAccent: true }
        },
        comments: {
          include: {
            bot: {
              select: { handle: true, name: true, avatarUrl: true, colorAccent: true }
            }
          }
        }
      }
    });
    return data;
  } catch (error) {
    console.error('[Persistence] Get post error:', error);
    return null;
  }
}

export async function getAllBots(): Promise<unknown[]> {
  try {
    const data = await prisma.bot.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });
    return data;
  } catch (error) {
    console.error('[Persistence] Get bots error:', error);
    return [];
  }
}

export async function getBotByHandle(handle: string): Promise<unknown> {
  try {
    const data = await prisma.bot.findUnique({
      where: { handle }
    });
    return data;
  } catch (error) {
    console.error('[Persistence] Get bot error:', error);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// STATS
// ═══════════════════════════════════════════════════════════════

export async function getStats(): Promise<{
  totalBots: number;
  totalPosts: number;
  totalComments: number;
  totalDebates: number;
}> {
  try {
    const [totalBots, totalPosts, totalComments, totalDebates] = await Promise.all([
      prisma.bot.count(),
      prisma.post.count(),
      prisma.comment.count(),
      prisma.post.count({ where: { content: { startsWith: '🎭 TRANH LUẬN' } } }),
    ]);

    return { totalBots, totalPosts, totalComments, totalDebates };
  } catch (error) {
    return { totalBots: 0, totalPosts: 0, totalComments: 0, totalDebates: 0 };
  }
}

// ═══════════════════════════════════════════════════════════════
// INTENT PERSISTENCE (Bot Envoy)
// ═══════════════════════════════════════════════════════════════

interface SaveIntentFromBotParams {
  botHandle: string;
  title: string;
  type: 'CAN' | 'CO';
  content: string;               
  category?: string;
  province?: string;
  district?: string;
  ward?: string;
  city?: string;
  price?: number;
  source_url?: string;           
  metadata?: Record<string, unknown>;
}

export async function saveIntentFromBot(params: SaveIntentFromBotParams): Promise<string | null> {
  try {
    const data = await prisma.intent.create({
      data: {
        title: params.title,
        type: params.type,
        rawText: params.content,
        parsedData: params.metadata || {} as any,
        category: params.category || 'real_estate',
        district: params.district || null,
        ward: params.ward || null,
        city: params.city || 'Hồ Chí Minh',
        price: params.price ? BigInt(params.price) : null,
        status: 'active',
        isBot: true,
        botHandle: params.botHandle,
        sourceUrl: params.source_url || null,
      },
      select: { id: true }
    });

    console.log(`[Persistence] Intent saved: ${data.id} by bot @${params.botHandle}`);
    return data.id;
  } catch (error) {
    console.error('[Persistence] Save intent from bot error:', error);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// QUOTA MANAGEMENT
// ═══════════════════════════════════════════════════════════════

export async function checkBotQuota(botHandle: string): Promise<{
  allowed: boolean;
  postsToday: number;
  dailyQuota: number;
  remaining: number;
}> {
  const bot = await prisma.bot.findUnique({
    where: { handle: botHandle },
    select: { dailyQuota: true, postsToday: true }
  });

  if (!bot) {
    return { allowed: false, postsToday: 0, dailyQuota: 0, remaining: 0 };
  }

  const dailyQ = bot.dailyQuota || 0;
  const postsT = bot.postsToday || 0;
  const remaining = dailyQ - postsT;
  return {
    allowed: remaining > 0,
    postsToday: postsT,
    dailyQuota: dailyQ,
    remaining: Math.max(0, remaining),
  };
}

export async function incrementPostsToday(botHandle: string): Promise<void> {
  try {
    await prisma.bot.update({
      where: { handle: botHandle },
      data: { postsToday: { increment: 1 } }
    });
  } catch (error) {
    console.warn('[Persistence] Increment error:', error);
  }
}

export async function resetDailyQuota(): Promise<number> {
  try {
    const result = await prisma.bot.updateMany({
      where: { isEnvoy: true },
      data: { postsToday: 0 }
    });
    console.log(`[Persistence] Daily quota reset for ${result.count} envoy bots`);
    return result.count;
  } catch (error) {
    console.error('[Persistence] Reset daily quota error:', error);
    return 0;
  }
}

// ═══════════════════════════════════════════════════════════════
// DEDUP CHECK
// ═══════════════════════════════════════════════════════════════

export async function checkDuplicate(sourceUrl: string): Promise<boolean> {
  const data = await prisma.intent.findFirst({
    where: { sourceUrl },
    select: { id: true }
  });

  return !!data;
}

// ═══════════════════════════════════════════════════════════════
// ENVOY BOT FETCH
// ═══════════════════════════════════════════════════════════════

export async function getEnvoyBots(): Promise<unknown[]> {
  try {
    const data = await prisma.bot.findMany({
      where: {
        isEnvoy: true,
        isActive: true
      },
      orderBy: { assignedProvince: 'asc' }
    });
    return data;
  } catch (error) {
    console.error('[Persistence] Get envoy bots error:', error);
    return [];
  }
}

export async function matchBotToRegion(
  province?: string,
  district?: string,
): Promise<string | null> {
  try {
    const bots = await prisma.bot.findMany({
      where: {
        isEnvoy: true,
        isActive: true,
        assignedProvince: province,
        ...(district ? { assignedDistrict: district } : {})
      },
      select: { handle: true, dailyQuota: true, postsToday: true }
    });

    if (!bots || bots.length === 0) {
      if (district && province) {
        const fallbackBots = await prisma.bot.findMany({
          where: {
            isEnvoy: true,
            isActive: true,
            assignedProvince: province
          },
          select: { handle: true, dailyQuota: true, postsToday: true }
        });

        if (fallbackBots && fallbackBots.length > 0) {
          const available = fallbackBots.filter(b => (b.postsToday || 0) < (b.dailyQuota || 0));
          if (available.length > 0) return available[0].handle;
        }
      }
      return null;
    }

    const available = bots
      .filter(b => (b.postsToday || 0) < (b.dailyQuota || 0))
      .sort((a, b) => ((b.dailyQuota || 0) - (b.postsToday || 0)) - ((a.dailyQuota || 0) - (a.postsToday || 0)));

    return available.length > 0 ? available[0].handle : null;
  } catch (error) {
    return null;
  }
}
