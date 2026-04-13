// ═══════════════════════════════════════════════════════════════
// CHAT API — Phase 06 REWRITE
// Changes vs original:
//   + Auth-aware (getServerSession)
//   + DB persistence (AIChatMessage)
//   + Market context injection (context-builder)
//   + Daily quota enforcement (50 msg/user/day)
//   + System prompt from DB (Bot.handle = 'nha_ai')
//   + activeCategory context pass-through
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { chat } from '@/lib/ai/client';
import { prisma } from '@/lib/db';
import { buildChatContext, checkDailyQuota } from '@/lib/chat/context-builder';

export const maxDuration = 60;

// ─────────────────────────────────────────────────────────────
// FALLBACK SYSTEM PROMPT (if nha_ai bot not in DB yet)
// ─────────────────────────────────────────────────────────────

const FALLBACK_SYSTEM_PROMPT = `Bạn là NHA.AI - Trợ lý ảo môi giới BĐS thông minh của nền tảng CẦN & CÓ.
Nhiệm vụ: tư vấn về giá cả, xu hướng thị trường, cách dùng ứng dụng.
Quy tắc:
1. Luôn vui vẻ, lịch sự, dùng emoji tự nhiên.
2. Trả lời NGẮN GỌN (tối đa 4 câu).
3. Nếu hỏi ngoài lề → khéo léo lái về BĐS.
4. Khi có dữ liệu thị trường → trích dẫn số liệu cụ thể.
5. Nếu chưa có dữ liệu → nói rõ thay vì bịa.`;

// ─────────────────────────────────────────────────────────────
// LOAD BOT CONFIG FROM DB
// ─────────────────────────────────────────────────────────────

async function loadBotConfig(): Promise<{ systemPrompt: string; knowledgeText: string }> {
  try {
    const bot = await prisma.bot.findUnique({
      where: { handle: 'nha_ai' },
      select: { systemPrompt: true, knowledgeText: true },
    });

    return {
      systemPrompt: bot?.systemPrompt || FALLBACK_SYSTEM_PROMPT,
      knowledgeText: bot?.knowledgeText || '',
    };
  } catch {
    return { systemPrompt: FALLBACK_SYSTEM_PROMPT, knowledgeText: '' };
  }
}

// ─────────────────────────────────────────────────────────────
// POST /api/chat
// ─────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, activeCategory, sessionId } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { success: false, error: 'Invalid messages array' },
        { status: 400 }
      );
    }

    // 1. Auth check (optional — guest can still chat)
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id ?? null;

    // 2. Quota enforcement (logged-in users only)
    if (userId) {
      const quota = await checkDailyQuota(userId);
      if (!quota.allowed) {
        return NextResponse.json(
          {
            success: false,
            error: `Bạn đã đạt giới hạn ${quota.limit} tin nhắn hôm nay. Vui lòng thử lại vào ngày mai nhé! 😊`,
            quotaExceeded: true,
          },
          { status: 429 }
        );
      }
    }

    // 3. Load bot config from DB
    const botConfig = await loadBotConfig();

    // 4. Get latest user message
    const lastUserMsg = [...messages].reverse().find((m: any) => m.role === 'user');
    const latestText = lastUserMsg?.text || '';

    // 5. Build market context (Phase 05 integration)
    const ctx = await buildChatContext(latestText, {
      userId,
      category: activeCategory || 'real_estate',
    });

    // 6. Build complete system prompt
    const fullSystemPrompt = [
      botConfig.systemPrompt,
      botConfig.knowledgeText,
      ctx.systemContext,
    ]
      .filter(Boolean)
      .join('\n\n');

    // 7. Build conversation context (last 20 messages as string)
    const history = messages.slice(-20);
    let conversationContext = 'Lịch sử hội thoại:\n';
    history.forEach((msg: any) => {
      conversationContext += `${msg.role === 'user' ? 'Người dùng' : 'NHA.AI'}: ${msg.text}\n`;
    });
    conversationContext += '\nHãy trả lời tin nhắn cuối cùng của người dùng.';

    // 8. Call AI
    const responseText = await chat(fullSystemPrompt, conversationContext);

    // 9. Persist to DB (auth users only)
    if (userId && latestText) {
      try {
        const meta = {
          category: activeCategory || 'real_estate',
          sessionId: sessionId || null,
          hasMarketContext: ctx.hasMarketData,
          reportId: ctx.reportId || null,
        };

        await prisma.aIChatMessage.createMany({
          data: [
            { userId, role: 'user', content: latestText, metadata: meta as any },
            { userId, role: 'bot', content: responseText, metadata: meta as any },
          ],
        });
      } catch (persistErr) {
        // Log but don't fail the request — chat > persistence
        console.error('[Chat] DB persist error (non-fatal):', persistErr);
      }
    }

    // 10. Return response
    return NextResponse.json({
      success: true,
      data: {
        text: responseText,
        hasMarketContext: ctx.hasMarketData,
      },
    });
  } catch (error: any) {
    console.error('[Chat API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Xin lỗi, tổng đài AI đang bận. Bạn thử lại sau nhé! 😅' },
      { status: 500 }
    );
  }
}
