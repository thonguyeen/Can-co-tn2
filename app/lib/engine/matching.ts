// ═══════════════════════════════════════════════════════
// CẦN & CÓ — Matching Engine (Prisma-based)
// Matches CẦN intents with CÓ intents + bot comments
// ═══════════════════════════════════════════════════════

import { prisma } from '@/lib/db';
import { generateEmbedding, isConfigured } from './openai';
import type { Intent, Match } from './types';

export interface MatchResult {
  intent: Intent;
  similarity: number;
  explanation: string;
  matched_criteria: string[];
}

/**
 * Format price in VND to Vietnamese display
 */
function formatPrice(price: number): string {
  if (price >= 1_000_000_000) {
    const ty = price / 1_000_000_000;
    return `${ty % 1 === 0 ? ty : ty.toFixed(1)} tỷ`;
  }
  return `${Math.round(price / 1_000_000)} triệu`;
}

/**
 * Build text representation of an intent for embedding
 */
export function buildIntentText(intent: Intent): string {
  const parts = [
    intent.type === 'CAN' ? 'Cần tìm:' : 'Đang có:',
    intent.title || intent.raw_text,
    intent.district ? `Khu vực: ${intent.district}, ${intent.ward || ''}, ${intent.city}` : '',
    intent.price ? `Giá: ${formatPrice(intent.price)}` : '',
    intent.price_min && intent.price_max
      ? `Ngân sách: ${formatPrice(intent.price_min)} - ${formatPrice(intent.price_max)}`
      : '',
  ];

  const pd = intent.parsed_data as Record<string, unknown>;
  if (pd.bedrooms) parts.push(`${pd.bedrooms} phòng ngủ`);
  if (pd.area) parts.push(`${pd.area}m²`);
  if (pd.project_name) parts.push(`Dự án: ${pd.project_name}`);

  return parts.filter(Boolean).join('. ').slice(0, 2000);
}

/**
 * Generate and store embedding for an intent
 */
export async function generateIntentEmbedding(intent: Intent): Promise<void> {
  if (!isConfigured()) return;

  try {
    const text = buildIntentText(intent);
    const embedding = await generateEmbedding(text);

    // Use raw query for vector column (pgvector)
    await prisma.$executeRaw`
      INSERT INTO intent_embeddings (id, intent_id, embedding, text_input, created_at)
      VALUES (gen_random_uuid(), ${intent.id}, ${embedding}::vector, ${text}, NOW())
      ON CONFLICT (intent_id) DO UPDATE SET embedding = ${embedding}::vector, text_input = ${text}
    `;
  } catch {
    // Non-critical
  }
}

// ═══════════════════════════════════════════════════════
// Scoring + Explanation
// ═══════════════════════════════════════════════════════

function calculateMatchScore(source: Intent, target: Intent): { score: number; criteria: string[] } {
  let score = 0.5;
  const criteria: string[] = [];

  // District match: +0.2
  if (source.district && target.district && source.district === target.district) {
    score += 0.2;
    criteria.push('district');
  }

  // Price overlap: +0.2 (exact) or +0.1 (fuzzy 20%)
  const canPriceMin = source.type === 'CAN' ? source.price_min : target.price_min;
  const canPriceMax = source.type === 'CAN' ? source.price_max : target.price_max;
  const coPrice = source.type === 'CO' ? source.price : target.price;

  if (coPrice && canPriceMin && canPriceMax) {
    if (coPrice >= canPriceMin && coPrice <= canPriceMax) {
      score += 0.2;
      criteria.push('price');
    } else if (coPrice >= canPriceMin * 0.8 && coPrice <= canPriceMax * 1.2) {
      score += 0.1;
      criteria.push('price_fuzzy');
    }
  }

  // Bedrooms match: +0.1
  const srcBedrooms = (source.parsed_data as Record<string, unknown>)?.bedrooms;
  const tgtBedrooms = (target.parsed_data as Record<string, unknown>)?.bedrooms;
  if (srcBedrooms && tgtBedrooms && srcBedrooms === tgtBedrooms) {
    score += 0.1;
    criteria.push('bedrooms');
  }

  // Trust boost
  const coVerification = source.type === 'CO' ? source.verification_level : target.verification_level;
  if (coVerification === 'verified') {
    score += 0.05;
    criteria.push('verified');
  } else if (coVerification === 'kyc') {
    score += 0.02;
  }

  return { score: Math.min(score, 1.0), criteria };
}

function generateMatchExplanation(can: Intent, co: Intent, criteria: string[]): string {
  const parts: string[] = [];

  if (criteria.includes('district')) {
    parts.push(`cùng khu vực ${co.district}`);
  }
  if (criteria.includes('bedrooms')) {
    const bd = (co.parsed_data as Record<string, unknown>)?.bedrooms;
    if (bd) parts.push(`${bd} phòng ngủ`);
  }
  if (criteria.includes('price') || criteria.includes('price_fuzzy')) {
    if (co.price) {
      parts.push(`giá ${formatPrice(co.price)}${can.price_min && can.price_max ? ` trong budget ${formatPrice(can.price_min)}-${formatPrice(can.price_max)}` : ''}`);
    }
  }
  if (criteria.includes('verified')) {
    parts.push('chủ đã xác thực');
  }

  return parts.length > 0
    ? `Phù hợp vì: ${parts.join(', ')}`
    : 'Cùng danh mục và khu vực';
}

// ═══════════════════════════════════════════════════════
// Core Matching Functions
// ═══════════════════════════════════════════════════════

/**
 * Find CÓ intents matching a CẦN intent
 */
export async function findMatchesForCan(
  canIntent: Intent,
  limit = 10,
): Promise<MatchResult[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    type: 'CO',
    status: 'active',
    category: canIntent.category,
    userId: { not: canIntent.user_id },
  };

  if (canIntent.district) {
    where.district = canIntent.district;
  }
  if (canIntent.price_min) {
    where.price = { ...(where.price || {}), gte: BigInt(Math.round(canIntent.price_min * 0.8)) };
  }
  if (canIntent.price_max) {
    where.price = { ...(where.price || {}), lte: BigInt(Math.round(canIntent.price_max * 1.2)) };
  }

  const coIntents = await prisma.intent.findMany({
    where,
    include: { images: true },
    orderBy: { trustScore: 'desc' },
    take: limit,
  });

  if (coIntents.length === 0) return [];

  return coIntents
    .map((co) => {
      // Convert Prisma result to Intent type for scoring
      const typedCo = toIntentType(co);
      const { score, criteria } = calculateMatchScore(canIntent, typedCo);
      return {
        intent: typedCo,
        similarity: score,
        explanation: generateMatchExplanation(canIntent, typedCo, criteria),
        matched_criteria: criteria,
      };
    })
    .sort((a, b) => b.similarity - a.similarity);
}

/**
 * Find CẦN intents matching a CÓ intent
 */
export async function findMatchesForCo(
  coIntent: Intent,
  limit = 10,
): Promise<MatchResult[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    type: 'CAN',
    status: 'active',
    category: coIntent.category,
    userId: { not: coIntent.user_id },
  };

  if (coIntent.district) {
    where.district = coIntent.district;
  }
  if (coIntent.price) {
    where.priceMin = { lte: BigInt(Math.round(Number(coIntent.price) * 1.2)) };
    where.priceMax = { gte: BigInt(Math.round(Number(coIntent.price) * 0.8)) };
  }

  const canIntents = await prisma.intent.findMany({
    where,
    include: { images: true },
    orderBy: { trustScore: 'desc' },
    take: limit,
  });

  if (canIntents.length === 0) return [];

  return canIntents
    .map((can) => {
      const typedCan = toIntentType(can);
      const { score, criteria } = calculateMatchScore(coIntent, typedCan);
      return {
        intent: typedCan,
        similarity: score,
        explanation: generateMatchExplanation(typedCan, coIntent, criteria),
        matched_criteria: criteria,
      };
    })
    .sort((a, b) => b.similarity - a.similarity);
}

// ═══════════════════════════════════════════════════════
// Match Persistence
// ═══════════════════════════════════════════════════════

export async function saveMatches(
  canIntentId: string,
  coIntentId: string,
  similarity: number,
  explanation: string,
): Promise<Match | null> {
  try {
    const data = await prisma.match.upsert({
      where: {
        canIntentId_coIntentId: { canIntentId, coIntentId },
      },
      update: { similarity, explanation, status: 'suggested' },
      create: {
        canIntentId,
        coIntentId,
        similarity,
        explanation,
        status: 'suggested',
      },
    });

    return data as unknown as Match;
  } catch {
    return null;
  }
}

// ═══════════════════════════════════════════════════════
// Match Advisor Bot
// ═══════════════════════════════════════════════════════

/**
 * Create bot comment on an intent after matching
 */
export async function createMatchBotComment(
  intentId: string,
  intentType: 'CAN' | 'CO',
  matches: MatchResult[],
): Promise<void> {
  // Anti-spam: check if bot already commented
  const existing = await prisma.intentComment.findFirst({
    where: {
      intentId,
      isBot: true,
      botName: 'match_advisor',
    },
    select: { id: true },
  });

  const content = buildBotCommentContent(intentType, matches);

  if (existing) {
    // Update existing comment instead of creating new
    await prisma.intentComment.update({
      where: { id: existing.id },
      data: { content },
    });
    return;
  }

  await prisma.intentComment.create({
    data: {
      intentId,
      isBot: true,
      botName: 'match_advisor',
      content,
    },
  });
}

function buildBotCommentContent(intentType: 'CAN' | 'CO', matches: MatchResult[]): string {
  if (matches.length === 0) {
    return 'Chưa tìm thấy match phù hợp. Đang theo dõi — sẽ thông báo ngay khi có người đăng.';
  }

  if (intentType === 'CAN') {
    const list = matches.slice(0, 3).map((m, i) => {
      const co = m.intent;
      const price = co.price ? formatPrice(co.price) : '';
      const trust = co.verification_level === 'verified' ? ' ✅'
        : co.verification_level === 'kyc' ? ' 🟡' : '';
      const title = co.title || co.raw_text?.slice(0, 40) || 'Tin đăng';
      return `${i + 1}. ${title}${price ? ` (${price})` : ''}${trust}`;
    }).join('\n');

    const pct = Math.round(matches[0].similarity * 100);
    return `Tìm thấy ${matches.length} tin phù hợp nhu cầu của bạn:\n${list}\nĐộ phù hợp cao nhất: ${pct}%`;
  }

  // CÓ intent
  return `${matches.length} người đang tìm kiếm phù hợp với tin của bạn. Tin đã được gợi ý cho họ.`;
}

/**
 * Notify the OTHER side's intents about the match
 */
export async function notifyMatchedIntents(
  sourceIntentType: 'CAN' | 'CO',
  matches: MatchResult[],
): Promise<void> {
  for (const match of matches.slice(0, 3)) {
    // Check if bot already commented on the other intent
    const existing = await prisma.intentComment.findFirst({
      where: {
        intentId: match.intent.id,
        isBot: true,
        botName: 'match_advisor',
      },
      select: { id: true },
    });

    if (existing) continue; // Anti-spam

    const pct = Math.round(match.similarity * 100);
    const content = sourceIntentType === 'CAN'
      ? `Có người đang tìm mua phù hợp với tin của bạn. Độ phù hợp: ${pct}%`
      : `Có tin mới phù hợp nhu cầu của bạn. Độ phù hợp: ${pct}%`;

    await prisma.intentComment.create({
      data: {
        intentId: match.intent.id,
        isBot: true,
        botName: 'match_advisor',
        content,
      },
    });
  }
}

// ═══════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════

/**
 * Convert Prisma intent result to Intent type (snake_case fields for scoring compat)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toIntentType(prismaIntent: any): Intent {
  return {
    id: prismaIntent.id,
    user_id: prismaIntent.userId,
    type: prismaIntent.type,
    raw_text: prismaIntent.rawText,
    title: prismaIntent.title,
    parsed_data: prismaIntent.parsedData || {},
    category: prismaIntent.category,
    subcategory: prismaIntent.subcategory,
    price: prismaIntent.price ? Number(prismaIntent.price) : null,
    price_min: prismaIntent.priceMin ? Number(prismaIntent.priceMin) : null,
    price_max: prismaIntent.priceMax ? Number(prismaIntent.priceMax) : null,
    address: prismaIntent.address,
    district: prismaIntent.district,
    ward: prismaIntent.ward,
    city: prismaIntent.city,
    lat: prismaIntent.lat ? Number(prismaIntent.lat) : null,
    lng: prismaIntent.lng ? Number(prismaIntent.lng) : null,
    trust_score: prismaIntent.trustScore,
    verification_level: prismaIntent.verificationLevel,
    comment_count: prismaIntent.commentCount,
    match_count: prismaIntent.matchCount,
    view_count: prismaIntent.viewCount,
    status: prismaIntent.status,
    expires_at: prismaIntent.expiresAt?.toISOString() || null,
    is_bot: prismaIntent.isBot,
    bot_handle: prismaIntent.botHandle,
    source_url: prismaIntent.sourceUrl,
    created_at: prismaIntent.createdAt?.toISOString(),
    updated_at: prismaIntent.updatedAt?.toISOString(),
    images: prismaIntent.images || [],
  };
}
