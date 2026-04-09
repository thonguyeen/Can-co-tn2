// ═══════════════════════════════════════════════════════════════
// TOOLS API - Execute tools and manage enhanced sessions
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import {
  executeTool,
  AVAILABLE_TOOLS,
  getToolsForBot,
  getToolDescriptions,
} from '@/lib/openclaw/tools';
import { getEnhancedSessionManager } from '@/lib/openclaw/enhanced-sessions';
import { savePost } from '@/lib/openclaw/persistence';

// ═══════════════════════════════════════════════════════════════
// GET - List tools and status
// ═══════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action') || 'list';

  const sessionManager = getEnhancedSessionManager();

  switch (action) {
    case 'list':
      return NextResponse.json({
        success: true,
        data: {
          tools: AVAILABLE_TOOLS.map((t) => ({
            name: t.name,
            description: t.description,
          })),
          totalTools: AVAILABLE_TOOLS.length,
        },
      });

    case 'bot_tools':
      const botHandle = searchParams.get('bot');
      if (!botHandle) {
        return NextResponse.json(
          { success: false, error: 'bot parameter required' },
          { status: 400 }
        );
      }
      return NextResponse.json({
        success: true,
        data: {
          botHandle,
          tools: getToolsForBot(botHandle),
        },
      });

    case 'descriptions':
      return NextResponse.json({
        success: true,
        data: getToolDescriptions(),
      });

    case 'sessions':
      return NextResponse.json({
        success: true,
        data: sessionManager.getStatus(),
      });

    default:
      return NextResponse.json(
        { success: false, error: 'Unknown action' },
        { status: 400 }
      );
  }
}

// ═══════════════════════════════════════════════════════════════
// POST - Execute tools and create posts
// ═══════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    const sessionManager = getEnhancedSessionManager();

    switch (action) {
      // ─────────────────────────────────────────────────────────
      // EXECUTE SINGLE TOOL
      // ─────────────────────────────────────────────────────────
      case 'execute': {
        const { tool, input } = params;
        if (!tool) {
          return NextResponse.json(
            { success: false, error: 'tool parameter required' },
            { status: 400 }
          );
        }

        const result = await executeTool(tool, input || {});

        return NextResponse.json({
          success: result.success,
          data: result.data,
          error: result.error,
          executionTime: result.executionTime,
        });
      }

      // ─────────────────────────────────────────────────────────
      // CHAT WITH TOOLS
      // ─────────────────────────────────────────────────────────
      case 'chat': {
        const { botHandle, message, enableTools = true, maxToolCalls = 3 } = params;

        if (!botHandle || !message) {
          return NextResponse.json(
            { success: false, error: 'botHandle and message required' },
            { status: 400 }
          );
        }

        const { response, toolsUsed } = await sessionManager.chatWithTools(
          botHandle,
          message,
          { enableTools, maxToolCalls }
        );

        return NextResponse.json({
          success: true,
          data: {
            botHandle,
            response,
            toolsUsed,
            toolCount: toolsUsed.length,
          },
        });
      }

      // ─────────────────────────────────────────────────────────
      // RESEARCH AND POST
      // ─────────────────────────────────────────────────────────
      case 'research_post': {
        const { botHandle, topic, depth = 'medium', saveToDb = true } = params;

        if (!botHandle || !topic) {
          return NextResponse.json(
            { success: false, error: 'botHandle and topic required' },
            { status: 400 }
          );
        }

        const { post, sources, toolsUsed } = await sessionManager.researchAndPost(
          botHandle,
          topic,
          { depth, includeData: true }
        );

        // Optionally save to database
        let postId = null;
        if (saveToDb) {
          postId = await savePost({
            botHandle,
            content: post,
            topic,
            metadata: {
              type: 'research_post',
              toolsUsed,
              sources,
            },
          });
        }

        return NextResponse.json({
          success: true,
          data: {
            botHandle,
            topic,
            post,
            sources,
            toolsUsed,
            depth,
            postId,
            savedToDb: saveToDb && postId !== null,
          },
        });
      }

      // ─────────────────────────────────────────────────────────
      // LIVE DATA POST (crypto, weather, news)
      // ─────────────────────────────────────────────────────────
      case 'live_data_post': {
        const { botHandle, dataType, saveToDb = true } = params;

        if (!botHandle || !dataType) {
          return NextResponse.json(
            { success: false, error: 'botHandle and dataType required' },
            { status: 400 }
          );
        }

        const validTypes = ['crypto', 'weather', 'news', 'trending'];
        if (!validTypes.includes(dataType)) {
          return NextResponse.json(
            { success: false, error: `dataType must be one of: ${validTypes.join(', ')}` },
            { status: 400 }
          );
        }

        const { post, data, toolsUsed } = await sessionManager.createLiveDataPost(
          botHandle,
          dataType as 'crypto' | 'weather' | 'news' | 'trending'
        );

        // Optionally save to database
        let postId = null;
        if (saveToDb) {
          postId = await savePost({
            botHandle,
            content: post,
            topic: `Live ${dataType} update`,
            metadata: {
              type: 'live_data_post',
              dataType,
              toolsUsed,
              liveData: data,
            },
          });
        }

        return NextResponse.json({
          success: true,
          data: {
            botHandle,
            dataType,
            post,
            liveData: data,
            toolsUsed,
            postId,
            savedToDb: saveToDb && postId !== null,
          },
        });
      }

      // ─────────────────────────────────────────────────────────
      // BATCH TOOL EXECUTION
      // ─────────────────────────────────────────────────────────
      case 'batch_execute': {
        const { tools } = params as {
          tools: Array<{ name: string; input: Record<string, unknown> }>;
        };

        if (!tools || !Array.isArray(tools)) {
          return NextResponse.json(
            { success: false, error: 'tools array required' },
            { status: 400 }
          );
        }

        const results = await Promise.all(
          tools.map(async (t) => ({
            tool: t.name,
            result: await executeTool(t.name, t.input),
          }))
        );

        return NextResponse.json({
          success: true,
          data: {
            results,
            totalExecuted: results.length,
            successCount: results.filter((r) => r.result.success).length,
          },
        });
      }

      // ─────────────────────────────────────────────────────────
      // CLEAR SESSION
      // ─────────────────────────────────────────────────────────
      case 'clear_session': {
        const { botHandle } = params;
        if (!botHandle) {
          return NextResponse.json(
            { success: false, error: 'botHandle required' },
            { status: 400 }
          );
        }

        sessionManager.clearSession(botHandle);

        return NextResponse.json({
          success: true,
          message: `Session cleared for @${botHandle}`,
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('[Tools API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
