import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {
  findMatchesForCan,
  findMatchesForCo,
  saveMatches,
  createMatchBotComment,
  notifyMatchedIntents,
} from '@/lib/engine/matching';
import type { Intent } from '@/lib/engine/types';

// POST /api/matching/trigger — run matching for a specific intent
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { intent_id } = body;

    if (!intent_id) {
      return NextResponse.json({ error: 'intent_id required' }, { status: 400 });
    }

    const intentData = await prisma.intent.findUnique({
      where: { id: intent_id },
    });

    if (!intentData) {
      return NextResponse.json({ error: 'Intent not found' }, { status: 404 });
    }

    // Convert to Intent type for matching engine
    const typedIntent = {
      id: intentData.id,
      user_id: intentData.userId || '',
      type: intentData.type,
      raw_text: intentData.rawText,
      title: intentData.title,
      parsed_data: intentData.parsedData as Record<string, unknown>,
      category: intentData.category,
      price: intentData.price ? Number(intentData.price) : null,
      price_min: intentData.priceMin ? Number(intentData.priceMin) : null,
      price_max: intentData.priceMax ? Number(intentData.priceMax) : null,
      district: intentData.district,
      ward: intentData.ward,
      city: intentData.city,
      trust_score: intentData.trustScore,
      verification_level: intentData.verificationLevel,
      status: intentData.status,
      is_bot: intentData.isBot,
      bot_handle: intentData.botHandle,
    } as unknown as Intent;

    // Run matching
    const candidates = typedIntent.type === 'CAN'
      ? await findMatchesForCan(typedIntent)
      : await findMatchesForCo(typedIntent);

    // Save matches
    let newMatchCount = 0;
    for (const candidate of candidates) {
      const canId = typedIntent.type === 'CAN' ? typedIntent.id : candidate.intent.id;
      const coId = typedIntent.type === 'CO' ? typedIntent.id : candidate.intent.id;
      const match = await saveMatches(canId, coId, candidate.similarity, candidate.explanation);
      if (match) newMatchCount++;
    }

    // Update match_count on source intent
    await prisma.intent.update({
      where: { id: intent_id },
      data: { matchCount: candidates.length },
    });

    // Bot comment on source intent
    await createMatchBotComment(intent_id, typedIntent.type as 'CAN' | 'CO', candidates);

    // Notify matched intents (other side)
    await notifyMatchedIntents(typedIntent.type as 'CAN' | 'CO', candidates);

    // Create notification for intent owner about matches
    if (candidates.length > 0 && typedIntent.user_id) {
      await prisma.notification.create({
        data: {
          userId: typedIntent.user_id,
          type: 'match_found',
          title: `Tìm thấy ${candidates.length} match cho nhu cầu của bạn`,
          message: candidates[0].explanation,
          referenceId: intent_id,
          referenceType: 'intent',
          link: `/can-co/intents/${intent_id}`,
        },
      });
    }

    return NextResponse.json({
      matches_found: candidates.length,
      new_matches: newMatchCount,
    });
  } catch (err) {
    console.error('Matching trigger error:', err);
    return NextResponse.json({ error: 'Matching failed' }, { status: 500 });
  }
}
