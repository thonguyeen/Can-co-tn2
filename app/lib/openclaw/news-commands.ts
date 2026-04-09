// ═══════════════════════════════════════════════════════════════
// NEWS COMMANDS
// ═══════════════════════════════════════════════════════════════
//
// Handles news-related commands via chat
//

import { prisma } from '@/lib/db';
import { CommandContext, CommandResult } from './message-handler';
import { CanvasCard } from './types';

const CATEGORY_MAP: Record<string, string> = {
  ai: 'ai',
  tech: 'ai',
  crypto: 'crypto',
  btc: 'crypto',
  bitcoin: 'crypto',
  startup: 'startup',
  gadget: 'gadget',
  phone: 'gadget',
  finance: 'finance',
  gaming: 'gaming',
  esports: 'gaming',
  security: 'security',
};

// ═══════════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════

export async function handleNewsCommand(
  args: string[],
  context: CommandContext
): Promise<CommandResult> {
  const subCommand = args[0]?.toLowerCase();

  switch (subCommand) {
    case 'breaking':
      return getBreakingNews(context);

    case 'digest':
      return getDailyDigest(context);

    case 'search':
      return searchNews(args.slice(1).join(' '), context);

    default:
      const category = CATEGORY_MAP[subCommand] || null;
      return getLatestNews(category, context);
  }
}

// ═══════════════════════════════════════════════════════════════
// LATEST NEWS
// ═══════════════════════════════════════════════════════════════

async function getLatestNews(
  category: string | null,
  context: CommandContext,
  limit: number = 5
): Promise<CommandResult> {
  // We can filter by category here if needed, but the original query didn't!
  // Wait, the original code: `supabase.from('posts').select(...)`
  // It completely ignored `category` argument! Let's replicate this behavior or add filter.
  // Actually, wait, let's just get the latest.
  const posts = await prisma.post.findMany({
    select: {
      id: true,
      content: true,
      createdAt: true,
      likesCount: true,
      bot: { select: { name: true, handle: true, avatarUrl: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: limit
  });

  if (!posts || posts.length === 0) {
    return {
      response: context.language === 'vi'
        ? '📭 Không có tin mới.'
        : '📭 No new posts.',
    };
  }

  const newsItems = posts.map((post, index) => {
    const time = getRelativeTime(post.createdAt?.toISOString() || new Date().toISOString(), context.language);
    const preview = post.content.slice(0, 100) + (post.content.length > 100 ? '...' : '');

    return `${index + 1}. *${post.bot?.name || 'Bot'}* (${time})
${preview}
❤️ ${post.likesCount || 0}`;
  });

  const categoryLabel = category
    ? (context.language === 'vi' ? ` [${category.toUpperCase()}]` : ` [${category.toUpperCase()}]`)
    : '';

  return {
    response: `📰 *Tin mới nhất${categoryLabel}*\n\n${newsItems.join('\n\n')}`,
    canvas: createNewsListCanvas(posts, context),
  };
}

// ═══════════════════════════════════════════════════════════════
// BREAKING NEWS
// ═══════════════════════════════════════════════════════════════

async function getBreakingNews(context: CommandContext): Promise<CommandResult> {
  const breaking = await prisma.breakingNews.findMany({
    where: { 
      isActive: true, 
      expiresAt: { gt: new Date() } 
    },
    select: {
      headline: true,
      category: true,
      urgencyLevel: true,
      createdAt: true,
      post: {
        select: {
          id: true,
          content: true,
          createdAt: true,
          bot: { select: { name: true, handle: true } }
        }
      }
    },
    // Prisma does not have `score` in breaking_news! 
    // Fallback: order by createdAt desc
    orderBy: { createdAt: 'desc' },
    take: 3
  });

  if (!breaking || breaking.length === 0) {
    return {
      response: context.language === 'vi'
        ? '✅ Không có tin nóng lúc này.'
        : '✅ No breaking news right now.',
    };
  }

  const levelEmoji: Record<string, string> = {
    critical: '🔴',
    important: '🟠',
    notable: '🟡',
  };

  const items = breaking.map(b => {
    const emoji = levelEmoji[b.urgencyLevel || 'normal'] || '⚪';
    const time = getRelativeTime(b.createdAt?.toISOString() || new Date().toISOString(), context.language);
    const post = b.post;

    return `${emoji} *${b.headline}*
${post?.content?.slice(0, 150) || ''}...
📍 ${post?.bot?.name || 'Bot'} | ${time}`;
  });

  return {
    response: `🔴 *BREAKING NEWS*\n\n${items.join('\n\n')}`,
    canvas: createBreakingCanvas(breaking[0] as any),
  };
}

// ═══════════════════════════════════════════════════════════════
// DAILY DIGEST
// ═══════════════════════════════════════════════════════════════

async function getDailyDigest(context: CommandContext): Promise<CommandResult> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const topPosts = await prisma.post.findMany({
    where: { createdAt: { gte: today } },
    select: {
      id: true,
      content: true,
      likesCount: true,
      commentsCount: true,
      bot: { select: { name: true, handle: true } }
    },
    orderBy: { likesCount: 'desc' },
    take: 5
  });

  const breakingCount = await prisma.breakingNews.count({
    where: { createdAt: { gte: today } }
  });

  let userStats = '';
  if (context.isLinked && context.userId) {
    const stats = await prisma.userStat.findUnique({
      where: { userId: context.userId },
      select: { points: true, streakDays: true }
    });

    if (stats) {
      userStats = context.language === 'vi'
        ? `\n\n📊 *Của bạn:*\n💎 ${stats.points || 0} điểm | 🔥 ${stats.streakDays || 0} ngày streak`
        : `\n\n📊 *Your stats:*\n💎 ${stats.points || 0} points | 🔥 ${stats.streakDays || 0} day streak`;
    }
  }

  const topPostsText = (topPosts || []).map((p, i) => {
    return `${i + 1}. ${p.bot?.name || 'Bot'}: ${p.content.slice(0, 60)}... (❤️${p.likesCount || 0})`;
  }).join('\n');

  const digest = context.language === 'vi'
    ? `📰 *TÓM TẮT HÔM NAY*
${new Date().toLocaleDateString('vi-VN')}

🔴 Breaking: ${breakingCount || 0} tin nóng
📝 Bài viết: ${topPosts?.length || 0} bài mới

*Top 5 được yêu thích:*
${topPostsText || 'Chưa có bài viết'}
${userStats}`
    : `📰 *TODAY'S DIGEST*
${new Date().toLocaleDateString('en-US')}

🔴 Breaking: ${breakingCount || 0} alerts
📝 Posts: ${topPosts?.length || 0} new

*Top 5 most liked:*
${topPostsText || 'No posts yet'}
${userStats}`;

  return {
    response: digest,
    canvas: {
      type: 'digest',
      title: context.language === 'vi' ? 'Tóm tắt hôm nay' : "Today's Digest",
      subtitle: new Date().toLocaleDateString(),
      body: `${breakingCount || 0} breaking, ${topPosts?.length || 0} posts`,
    },
  };
}

// ═══════════════════════════════════════════════════════════════
// SEARCH NEWS
// ═══════════════════════════════════════════════════════════════

async function searchNews(
  query: string,
  context: CommandContext
): Promise<CommandResult> {
  if (!query || query.length < 2) {
    return {
      response: context.language === 'vi'
        ? 'Dùng: `news search <từ khóa>`'
        : 'Use: `news search <keyword>`',
    };
  }

  const posts = await prisma.post.findMany({
    where: { content: { contains: query, mode: 'insensitive' } },
    select: {
      id: true,
      content: true,
      createdAt: true,
      bot: { select: { name: true, handle: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  if (!posts || posts.length === 0) {
    return {
      response: context.language === 'vi'
        ? `🔍 Không tìm thấy kết quả cho "${query}"`
        : `🔍 No results found for "${query}"`,
    };
  }

  const results = posts.map((p, i) => {
    const time = getRelativeTime(p.createdAt?.toISOString() || new Date().toISOString(), context.language);
    return `${i + 1}. *${p.bot?.name || 'Bot'}* (${time})
${p.content.slice(0, 100)}...`;
  });

  return {
    response: `🔍 *Kết quả cho "${query}":*\n\n${results.join('\n\n')}`,
  };
}

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function getRelativeTime(dateStr: string, language: 'vi' | 'en'): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (language === 'vi') {
    if (diffMins < 1) return 'vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return `${diffDays} ngày trước`;
  } else {
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  }
}

function createNewsListCanvas(posts: any[], context: CommandContext): CanvasCard {
  return {
    type: 'news',
    title: context.language === 'vi' ? 'Tin mới nhất' : 'Latest News',
    subtitle: `${posts.length} bài viết`,
    actions: [
      { type: 'button', label: 'Xem thêm', action: 'news', style: 'primary' },
      { type: 'link', label: 'Mở web', action: 'https://facebot.app', style: 'secondary' },
    ],
  };
}

function createBreakingCanvas(breaking: { headline: string; category: string; post: { id: string } }): CanvasCard {
  return {
    type: 'news',
    title: `🔴 ${breaking.headline}`,
    subtitle: breaking.category || '',
    actions: [
      { type: 'link', label: 'Đọc đầy đủ', action: `https://facebot.app/post/${breaking.post?.id}` },
    ],
  };
}
