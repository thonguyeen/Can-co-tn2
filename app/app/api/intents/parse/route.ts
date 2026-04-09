import { NextRequest, NextResponse } from 'next/server';
import { parseSearchIntent, isConfigured } from '@/lib/engine/openai';
import { formatPriceRange } from '@/lib/intent-utils';

/**
 * Detect intent type from content keywords
 * Returns 'CAN', 'CO', or null (ambiguous)
 */
function detectIntentType(text: string): 'CAN' | 'CO' | null {
  const lower = text.toLowerCase();

  // CẦN indicators (seeking / looking for / want to buy or rent)
  const canPatterns = [
    /\b(cần|c[aầ]n)\s*(tìm|thuê|mua|tìm\s*mua|tìm\s*thuê)/i,
    /\b(muốn|mu[oố]n)\s*(thuê|mua|tìm)/i,
    /\btìm\s*(thuê|mua|kiếm|phòng|nhà|căn)/i,
    /\b(ai\s*có|có\s*ai)\b/i,
    /\bneed\b/i,
    /\blooking\s*for\b/i,
    /\bwant\s*(to)?\s*(buy|rent)\b/i,
    /\b(tìm\s*giúp|giúp\s*tìm)\b/i,
    /\b(đang\s*cần|đang\s*tìm)\b/i,
  ];

  // CÓ indicators (offering / selling / for rent)
  const coPatterns = [
    /\b(cần\s*bán|bán\s*gấp|bán\s*nhanh)\b/i,
    /\b(cho\s*thuê|c[hh]o\s*thuê)\b/i,
    /\b(đang\s*bán|rao\s*bán|bán\s*căn|bán\s*nhà|bán\s*đất)\b/i,
    /\b(sang\s*nhượng|chuyển\s*nhượng)\b/i,
    /\b(còn\s*trống|phòng\s*trống)\b/i,
    /\bfor\s*(sale|rent)\b/i,
    /\b(tôi\s*có|mình\s*có|em\s*có)\s*(căn|nhà|phòng|đất)/i,
    /\b(sở\s*hữu|chính\s*chủ)\b/i,
  ];

  let canScore = 0;
  let coScore = 0;

  for (const p of canPatterns) {
    if (p.test(lower)) canScore++;
  }
  for (const p of coPatterns) {
    if (p.test(lower)) coScore++;
  }

  if (canScore > 0 && coScore === 0) return 'CAN';
  if (coScore > 0 && canScore === 0) return 'CO';
  if (canScore > coScore) return 'CAN';
  if (coScore > canScore) return 'CO';

  return null; // ambiguous
}

// POST /api/intents/parse — AI parse raw_text into tags (no DB write)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { raw_text } = body;

    if (!raw_text || raw_text.length < 10) {
      return NextResponse.json({ tags: [] });
    }

    // Detect suggested type from keywords
    const suggested_type = detectIntentType(raw_text);

    if (!isConfigured()) {
      return NextResponse.json({ tags: [], ai: false, suggested_type });
    }

    const intent = await parseSearchIntent(raw_text);

    const tags: { icon: string; label: string; type: string }[] = [];

    if (intent.districts && intent.districts.length > 0) {
      for (const d of intent.districts) {
        tags.push({ icon: '📍', label: d, type: 'district' });
      }
    }
    if (intent.bedrooms) {
      tags.push({ icon: '🛏', label: `${intent.bedrooms} PN`, type: 'bedrooms' });
    }
    if (intent.bathrooms) {
      tags.push({ icon: '🚿', label: `${intent.bathrooms} WC`, type: 'bathrooms' });
    }
    if (intent.area_min || intent.area_max) {
      const area = intent.area_min && intent.area_max
        ? `${intent.area_min}-${intent.area_max}m²`
        : intent.area_min ? `từ ${intent.area_min}m²` : `đến ${intent.area_max}m²`;
      tags.push({ icon: '📐', label: area, type: 'area' });
    }
    if (intent.price_min || intent.price_max) {
      const priceLabel = formatPriceRange(intent.price_min, intent.price_max);
      if (priceLabel) tags.push({ icon: '💰', label: priceLabel, type: 'price' });
    }
    for (const kw of (intent.keywords || []).slice(0, 3)) {
      tags.push({ icon: '🎯', label: kw, type: 'keyword' });
    }

    return NextResponse.json({ tags, intent, ai: true, suggested_type });
  } catch {
    return NextResponse.json({ tags: [], ai: false });
  }
}
