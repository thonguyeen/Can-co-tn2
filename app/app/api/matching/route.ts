import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/data/get-user';
import { toSnakeCase } from '@/lib/data/helpers';

// GET /api/matching — get matches for current user
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if ('error' in auth) return auth.error;
  const { userId } = auth;

  // Get user's intents
  const userIntents = await prisma.intent.findMany({
    where: { userId, status: 'active' },
    select: { id: true, type: true },
  });

  if (userIntents.length === 0) {
    return NextResponse.json({ matches: [] });
  }

  const intentIds = userIntents.map((i) => i.id);

  // Get matches where user's intents are involved
  const matches = await prisma.match.findMany({
    where: {
      OR: [
        { canIntentId: { in: intentIds } },
        { coIntentId: { in: intentIds } },
      ],
    },
    include: {
      canIntent: true,
      coIntent: true,
    },
    orderBy: { similarity: 'desc' },
  });

  // Convert BigInt + snake_case for response
  const response = matches.map((m) => {
    const match = toSnakeCase(m);
    // Handle BigInt conversion
    if (match.can_intent) {
      match.can_intent.price = match.can_intent.price ? Number(match.can_intent.price) : null;
      match.can_intent.price_min = match.can_intent.price_min ? Number(match.can_intent.price_min) : null;
      match.can_intent.price_max = match.can_intent.price_max ? Number(match.can_intent.price_max) : null;
    }
    if (match.co_intent) {
      match.co_intent.price = match.co_intent.price ? Number(match.co_intent.price) : null;
      match.co_intent.price_min = match.co_intent.price_min ? Number(match.co_intent.price_min) : null;
      match.co_intent.price_max = match.co_intent.price_max ? Number(match.co_intent.price_max) : null;
    }
    return match;
  });

  return NextResponse.json({ matches: response });
}
