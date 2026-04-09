import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { toSnakeCase } from '@/lib/data/helpers';

// GET /api/intents/[id]/matches — get matches for a specific intent
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // Get intent type to know which FK to query
  const intent = await prisma.intent.findUnique({
    where: { id },
    select: { id: true, type: true },
  });

  if (!intent) {
    return NextResponse.json({ matches: [] });
  }

  // Fetch matches with the other side populated
  const matchField = intent.type === 'CAN' ? 'canIntentId' : 'coIntentId';

  const matches = await prisma.match.findMany({
    where: { [matchField]: id },
    include: {
      canIntent: {
        select: {
          id: true, title: true, rawText: true, type: true,
          price: true, priceMin: true, priceMax: true,
          district: true, trustScore: true, verificationLevel: true, userId: true,
        },
      },
      coIntent: {
        select: {
          id: true, title: true, rawText: true, type: true,
          price: true, priceMin: true, priceMax: true,
          district: true, trustScore: true, verificationLevel: true, userId: true,
        },
      },
    },
    orderBy: { similarity: 'desc' },
  });

  // Convert to snake_case and handle BigInt
  const response = matches.map((m) => {
    const match = toSnakeCase(m);
    // Convert BigInt price fields
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
