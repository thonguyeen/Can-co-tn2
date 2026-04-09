// ═══════════════════════════════════════════════════════════════
// NEWS API - Fetch news and trigger bot reactions
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { getNewsCrawler, NEWS_SOURCES } from '@/lib/openclaw/news-crawler';
import { getNewsReactor } from '@/lib/openclaw/news-reactor';

// ═══════════════════════════════════════════════════════════════
// GET - Fetch news
// ═══════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action') || 'trending';
  const category = searchParams.get('category');
  const botHandle = searchParams.get('bot');
  const limit = parseInt(searchParams.get('limit') || '10');

  const crawler = getNewsCrawler();
  const reactor = getNewsReactor();

  try {
    switch (action) {
      case 'trending':
        const trending = await crawler.getTrendingNews(limit);
        return NextResponse.json({
          success: true,
          data: trending,
          count: trending.length,
        });

      case 'all':
        const allNews = await crawler.fetchAllNews();
        return NextResponse.json({
          success: true,
          data: allNews.slice(0, limit),
          count: allNews.length,
        });

      case 'category':
        if (!category) {
          return NextResponse.json(
            { success: false, error: 'category parameter required' },
            { status: 400 }
          );
        }
        const categoryNews = await crawler.fetchByCategory(category);
        return NextResponse.json({
          success: true,
          data: categoryNews.slice(0, limit),
          count: categoryNews.length,
        });

      case 'for_bot':
        if (!botHandle) {
          return NextResponse.json(
            { success: false, error: 'bot parameter required' },
            { status: 400 }
          );
        }
        const botNews = await crawler.fetchForBot(botHandle);
        return NextResponse.json({
          success: true,
          data: botNews.slice(0, limit),
          count: botNews.length,
        });

      case 'sources':
        return NextResponse.json({
          success: true,
          data: NEWS_SOURCES,
        });

      case 'reactions':
        return NextResponse.json({
          success: true,
          data: reactor.getReactions(),
        });

      case 'status':
        return NextResponse.json({
          success: true,
          data: reactor.getStatus(),
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Unknown action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('[News API] Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// POST - Control news reactor and trigger reactions
// ═══════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    const reactor = getNewsReactor();

    switch (action) {
      // ─────────────────────────────────────────────────────────
      // REACTOR CONTROL
      // ─────────────────────────────────────────────────────────
      case 'start':
        reactor.start();
        return NextResponse.json({
          success: true,
          message: 'News reactor started',
          data: reactor.getStatus(),
        });

      case 'stop':
        reactor.stop();
        return NextResponse.json({
          success: true,
          message: 'News reactor stopped',
          data: reactor.getStatus(),
        });

      // ─────────────────────────────────────────────────────────
      // MANUAL TRIGGERS
      // ─────────────────────────────────────────────────────────
      case 'check':
        const reactions = await reactor.checkAndReact();
        return NextResponse.json({
          success: true,
          message: `Generated ${reactions.length} reactions`,
          data: reactions,
        });

      case 'react_to_news':
        const { newsId, botHandle } = params;
        if (!newsId) {
          return NextResponse.json(
            { success: false, error: 'newsId required' },
            { status: 400 }
          );
        }
        const reaction = await reactor.triggerReactionToNews(newsId, botHandle);
        return NextResponse.json({
          success: !!reaction,
          data: reaction,
        });

      case 'bot_react':
        const { bot } = params;
        if (!bot) {
          return NextResponse.json(
            { success: false, error: 'bot parameter required' },
            { status: 400 }
          );
        }
        const botReaction = await reactor.triggerBotReactionToLatestNews(bot);
        return NextResponse.json({
          success: !!botReaction,
          data: botReaction,
        });

      case 'multi_bot_discussion':
        const { newsId: discussionNewsId } = params;
        if (!discussionNewsId) {
          return NextResponse.json(
            { success: false, error: 'newsId required' },
            { status: 400 }
          );
        }
        const discussion = await reactor.generateMultiBotDiscussion(discussionNewsId);
        return NextResponse.json({
          success: true,
          message: `Generated ${discussion.length} reactions`,
          data: discussion,
        });

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('[News API] Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
