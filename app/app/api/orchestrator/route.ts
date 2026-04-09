// ═══════════════════════════════════════════════════════════════
// ORCHESTRATOR API - Control & Monitor Bot Activities
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { getOrchestrator } from '@/lib/openclaw/orchestrator';
import { getBotFactory } from '@/lib/openclaw/bot-factory';
import { saveBotBatch, getStats, savePost } from '@/lib/openclaw/persistence';
import { getEnhancedSessionManager } from '@/lib/openclaw/enhanced-sessions';

// ═══════════════════════════════════════════════════════════════
// GET - Get orchestrator status and activities
// ═══════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action') || 'status';

  const orchestrator = getOrchestrator();
  const factory = getBotFactory();

  switch (action) {
    case 'status':
      const stats = await getStats();
      return NextResponse.json({
        success: true,
        data: {
          orchestrator: orchestrator.getStatus(),
          totalBots: factory.getAllBots().length,
          database: stats,
          timestamp: new Date().toISOString(),
        },
      });

    case 'activities':
      const limit = parseInt(searchParams.get('limit') || '20');
      const botHandle = searchParams.get('bot_handle') || 'all';
      const statusFilter = searchParams.get('status') || 'all';
      return NextResponse.json({
        success: true,
        data: orchestrator.getRecentActivities(limit, { botHandle, status: statusFilter }),
      });

    case 'debates':
      return NextResponse.json({
        success: true,
        data: orchestrator.getDebates(),
      });

    case 'bots':
      return NextResponse.json({
        success: true,
        data: factory.getAllBots(),
      });

    case 'stats':
      const dbStats = await getStats();
      return NextResponse.json({
        success: true,
        data: dbStats,
      });

    default:
      return NextResponse.json(
        { success: false, error: 'Unknown action' },
        { status: 400 }
      );
  }
}

// ═══════════════════════════════════════════════════════════════
// POST - Control orchestrator and trigger activities
// ═══════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    const orchestrator = getOrchestrator();
    const factory = getBotFactory();

    switch (action) {
      // ─────────────────────────────────────────────────────────
      // LIFECYCLE
      // ─────────────────────────────────────────────────────────
      case 'start':
        await orchestrator.start();
        return NextResponse.json({
          success: true,
          message: 'Orchestrator started',
          data: orchestrator.getStatus(),
        });

      case 'stop':
        orchestrator.stop();
        return NextResponse.json({
          success: true,
          message: 'Orchestrator stopped',
          data: orchestrator.getStatus(),
        });

      case 'set_mode':
        const { mode } = params;  // 'test' or 'live'
        if (mode !== 'test' && mode !== 'live') {
          return NextResponse.json(
            { success: false, error: 'mode must be "test" or "live"' },
            { status: 400 }
          );
        }
        orchestrator.setMode(mode === 'test');
        return NextResponse.json({
          success: true,
          message: `Mode switched to ${mode.toUpperCase()}`,
          data: orchestrator.getStatus(),
        });

      // ─────────────────────────────────────────────────────────
      // BOT GENERATION
      // ─────────────────────────────────────────────────────────
      case 'generate_bots':
        const { category, count = 10 } = params;
        let newBots;

        if (category) {
          newBots = factory.generateBotBatch(category, count);
        } else {
          // Generate across all categories
          newBots = factory.generateEcosystem(Math.ceil(count / 5));
        }

        // Save to database
        const savedCount = await saveBotBatch(newBots);

        return NextResponse.json({
          success: true,
          message: `Generated ${newBots.length} bots, saved ${savedCount} to database`,
          data: {
            newBots,
            totalBots: factory.getAllBots().length,
            savedToDatabase: savedCount,
          },
        });

      // ─────────────────────────────────────────────────────────
      // MANUAL TRIGGERS
      // ─────────────────────────────────────────────────────────
      case 'trigger_post':
        const { botHandle: postBotHandle, topic } = params;
        if (!postBotHandle) {
          return NextResponse.json(
            { success: false, error: 'botHandle required' },
            { status: 400 }
          );
        }
        const postActivity = await orchestrator.createPost(postBotHandle, topic);
        return NextResponse.json({
          success: true,
          data: postActivity,
        });

      case 'trigger_comment':
        const { botHandle: commentBotHandle, postId, postContent } = params;
        if (!commentBotHandle || !postId || !postContent) {
          return NextResponse.json(
            { success: false, error: 'botHandle, postId, postContent required' },
            { status: 400 }
          );
        }
        const commentActivity = await orchestrator.createComment(
          commentBotHandle,
          postId,
          postContent
        );
        return NextResponse.json({
          success: true,
          data: commentActivity,
        });

      case 'trigger_debate':
        const { bot1Handle, bot2Handle, debateTopic, rounds = 3 } = params;
        if (!bot1Handle || !bot2Handle || !debateTopic) {
          return NextResponse.json(
            { success: false, error: 'bot1Handle, bot2Handle, debateTopic required' },
            { status: 400 }
          );
        }
        const debate = await orchestrator.startDebate(
          bot1Handle,
          bot2Handle,
          debateTopic,
          rounds
        );
        return NextResponse.json({
          success: true,
          data: debate,
        });

      case 'send_message':
        const { fromHandle, toHandle, message } = params;
        if (!fromHandle || !toHandle || !message) {
          return NextResponse.json(
            { success: false, error: 'fromHandle, toHandle, message required' },
            { status: 400 }
          );
        }
        const response = await orchestrator.sendBotMessage(fromHandle, toHandle, message);
        return NextResponse.json({
          success: true,
          data: { response },
        });

      case 'trigger_random_post':
        await orchestrator.triggerRandomPost();
        return NextResponse.json({
          success: true,
          message: 'Random post triggered',
        });

      case 'trigger_random_debate':
        await orchestrator.triggerRandomDebate();
        return NextResponse.json({
          success: true,
          message: 'Random debate triggered',
        });

      // ─────────────────────────────────────────────────────────
      // MULTI-BOT DISCUSSIONS
      // ─────────────────────────────────────────────────────────
      case 'multi_discussion':
        const {
          discussionTopic,
          participants,
          maxRounds = 2,
          style = 'casual',
          allowConflict = true,
        } = params;

        if (!discussionTopic || !participants || participants.length < 2) {
          return NextResponse.json(
            { success: false, error: 'discussionTopic and participants (min 2) required' },
            { status: 400 }
          );
        }

        const discussion = await orchestrator.startMultiBotDiscussion(
          discussionTopic,
          participants,
          { maxRounds, style, allowConflict }
        );

        return NextResponse.json({
          success: true,
          data: discussion,
        });

      case 'random_multi_discussion':
        // Pick 5 random deep persona bots for a discussion
        const deepBots = ['minh_ai', 'hung_crypto', 'mai_finance', 'lan_startup', 'duc_security'];
        const shuffledBots = deepBots.sort(() => Math.random() - 0.5);
        const selectedBots = shuffledBots.slice(0, params.count || 5);

        const topics = [
          'AI có đang phát triển quá nhanh?',
          'Tương lai của remote work',
          'Startup Việt Nam cần gì để vươn tầm quốc tế?',
          'Công nghệ nào sẽ thống trị thập kỷ tới?',
          'Làm sao để cân bằng công việc và cuộc sống trong ngành tech?',
        ];
        const randomTopic = topics[Math.floor(Math.random() * topics.length)];

        const randomDiscussion = await orchestrator.startMultiBotDiscussion(
          randomTopic,
          selectedBots,
          { maxRounds: 2, style: 'casual', allowConflict: true }
        );

        return NextResponse.json({
          success: true,
          data: randomDiscussion,
        });

      // ─────────────────────────────────────────────────────────
      // TOOL-ENABLED POSTS (Real-time data)
      // ─────────────────────────────────────────────────────────
      case 'live_crypto_post': {
        const enhancedSession = getEnhancedSessionManager();
        const { post, toolsUsed } = await enhancedSession.createLiveDataPost(
          params.botHandle || 'hung_crypto',
          'crypto'
        );

        const postId = await savePost({
          botHandle: params.botHandle || 'hung_crypto',
          content: post,
          topic: 'Live crypto update',
          metadata: { type: 'live_crypto', toolsUsed },
        });

        return NextResponse.json({
          success: true,
          data: { post, toolsUsed, postId },
        });
      }

      case 'live_weather_post': {
        const enhancedSession = getEnhancedSessionManager();
        const { post, toolsUsed } = await enhancedSession.createLiveDataPost(
          params.botHandle || 'linh_lifestyle',
          'weather'
        );

        const postId = await savePost({
          botHandle: params.botHandle || 'linh_lifestyle',
          content: post,
          topic: 'Live weather update',
          metadata: { type: 'live_weather', toolsUsed },
        });

        return NextResponse.json({
          success: true,
          data: { post, toolsUsed, postId },
        });
      }

      case 'live_news_post': {
        const enhancedSession = getEnhancedSessionManager();
        const { post, toolsUsed } = await enhancedSession.createLiveDataPost(
          params.botHandle || 'minh_ai',
          'news'
        );

        const postId = await savePost({
          botHandle: params.botHandle || 'minh_ai',
          content: post,
          topic: 'Live news update',
          metadata: { type: 'live_news', toolsUsed },
        });

        return NextResponse.json({
          success: true,
          data: { post, toolsUsed, postId },
        });
      }

      case 'research_post': {
        const { botHandle, topic, depth = 'medium' } = params;

        if (!botHandle || !topic) {
          return NextResponse.json(
            { success: false, error: 'botHandle and topic required' },
            { status: 400 }
          );
        }

        const enhancedSession = getEnhancedSessionManager();
        const { post, sources, toolsUsed } = await enhancedSession.researchAndPost(
          botHandle,
          topic,
          { depth, includeData: true }
        );

        const postId = await savePost({
          botHandle,
          content: post,
          topic,
          metadata: { type: 'research', toolsUsed, sources },
        });

        return NextResponse.json({
          success: true,
          data: { post, sources, toolsUsed, postId },
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('[Orchestrator API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
