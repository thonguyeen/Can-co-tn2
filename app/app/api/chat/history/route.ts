// ═══════════════════════════════════════════════════════════════
// CHAT HISTORY API — Phase 06
// GET /api/chat/history
// Auth required. Returns last 30 messages for logged-in user.
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    // Auth required
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Đăng nhập để xem lịch sử chat nhé!' },
        { status: 401 }
      );
    }

    // Parse query params
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '30'), 50); // Cap at 50
    const before = searchParams.get('before'); // ISO string for pagination

    // Build query
    const whereClause: any = { userId };
    if (before) {
      whereClause.createdAt = { lt: new Date(before) };
    }

    // Fetch messages sorted ascending (oldest first for chat display)
    const raw = await prisma.aIChatMessage.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }, // Get newest first for LIMIT
      take: limit,
      select: {
        id: true,
        role: true,
        content: true,
        createdAt: true,
        metadata: true,
      },
    });

    // Reverse so oldest is first (chronological for UI)
    const messages = raw.reverse().map((m) => ({
      id: m.id,
      role: m.role as 'user' | 'bot',
      text: m.content,
      createdAt: m.createdAt?.toISOString(),
      fromHistory: true,
      hasMarketContext: (m.metadata as any)?.hasMarketContext ?? false,
    }));

    // Check if there are more messages before the oldest returned
    const hasMore = raw.length === limit;

    return NextResponse.json({
      success: true,
      data: { messages, hasMore },
    });
  } catch (error: any) {
    console.error('[Chat History API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể tải lịch sử chat.' },
      { status: 500 }
    );
  }
}
