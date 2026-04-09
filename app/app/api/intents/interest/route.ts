import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/data/get-user';

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if ('error' in auth) return auth.error;
    const { userId } = auth;

    const { id, increment } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Missing intent ID' }, { status: 400 });
    }

    // Atomic increment/decrement using Prisma
    const data = await prisma.intent.update({
      where: { id },
      data: {
        matchCount: increment
          ? { increment: 1 }
          : { decrement: 1 },
      },
    });

    // Ensure match_count doesn't go below 0
    if (data.matchCount !== null && data.matchCount < 0) {
      await prisma.intent.update({
        where: { id },
        data: { matchCount: 0 },
      });
    }

    // Convert for JSON response 
    return NextResponse.json({
      id: data.id,
      match_count: Math.max(data.matchCount || 0, 0),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
