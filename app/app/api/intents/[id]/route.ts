import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/data/get-user';
import { parseSearchIntent, formatIntentContent, isConfigured as isOpenAIConfigured } from '@/lib/engine/openai';
import { generateIntentEmbedding } from '@/lib/engine/matching';
import type { Intent } from '@/lib/engine/types';

// GET /api/intents/[id] — full detail with comments
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const data = await prisma.intent.findUnique({
    where: { id },
    include: { images: true },
  });

  if (!data) {
    return NextResponse.json({ error: 'Không tìm thấy dữ liệu' }, { status: 404 });
  }

  // Fetch related data in parallel
  const [profile, comments] = await Promise.all([
    data.userId
      ? prisma.profile.findUnique({
          where: { id: data.userId },
          select: { id: true, displayName: true, avatarUrl: true },
        })
      : null,
    prisma.intentComment.findMany({
      where: { intentId: id },
      orderBy: { createdAt: 'asc' },
    }),
  ]);

  // Increment view count (best-effort)
  prisma.intent.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  }).catch(() => {});

  // Resolve user names for human comments
  const humanUserIds = [...new Set(comments.filter(c => !c.isBot && c.userId).map(c => c.userId!))];
  const commentProfiles = humanUserIds.length > 0
    ? await prisma.profile.findMany({
        where: { id: { in: humanUserIds } },
        select: { id: true, displayName: true },
      })
    : [];
  const commentProfileMap = new Map(commentProfiles.map(p => [p.id, p]));

  const commentsResponse = comments.map((c) => ({
    id: c.id,
    intent_id: c.intentId,
    user_id: c.userId,
    bot_name: c.botName,
    content: c.content,
    is_bot: c.isBot,
    parent_id: c.parentId,
    created_at: c.createdAt,
    user: c.isBot ? undefined : { name: commentProfileMap.get(c.userId || '')?.displayName || 'Người dùng' },
    profiles: c.isBot ? undefined : { display_name: commentProfileMap.get(c.userId || '')?.displayName || 'Người dùng' },
  }));

  return NextResponse.json({
    id: data.id,
    user_id: data.userId,
    type: data.type,
    raw_text: data.rawText,
    title: data.title,
    parsed_data: data.parsedData,
    category: data.category,
    subcategory: data.subcategory,
    price: data.price ? Number(data.price) : null,
    price_min: data.priceMin ? Number(data.priceMin) : null,
    price_max: data.priceMax ? Number(data.priceMax) : null,
    address: data.address,
    district: data.district,
    ward: data.ward,
    city: data.city,
    trust_score: data.trustScore,
    verification_level: data.verificationLevel,
    comment_count: data.commentCount,
    match_count: data.matchCount,
    view_count: data.viewCount,
    status: data.status,
    is_bot: data.isBot,
    bot_handle: data.botHandle,
    source_url: data.sourceUrl,
    created_at: data.createdAt,
    updated_at: data.updatedAt,
    user: {
      id: data.userId,
      name: profile?.displayName || 'Người dùng',
      avatar_url: profile?.avatarUrl || null,
      trust_score: data.trustScore,
      verification_level: data.verificationLevel,
    },
    images: (data.images || []).map(img => ({
      id: img.id,
      intent_id: img.intentId,
      url: img.url,
      display_order: img.displayOrder,
      created_at: img.createdAt,
    })),
    intent_images: (data.images || []).map(img => ({
      id: img.id,
      intent_id: img.intentId,
      url: img.url,
      display_order: img.displayOrder,
      created_at: img.createdAt,
    })),
    comments: commentsResponse,
  });
}

// PUT /api/intents/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const auth = await requireAuth(request);
  if ('error' in auth) return auth.error;
  const { userId } = auth;

  const body = await request.json();
  const { raw_text, ...rest } = body;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: any = { updatedAt: new Date() };

  // Map snake_case body fields to camelCase Prisma fields
  if (rest.title !== undefined) updateData.title = rest.title;
  if (rest.category !== undefined) updateData.category = rest.category;
  if (rest.district !== undefined) updateData.district = rest.district;
  if (rest.ward !== undefined) updateData.ward = rest.ward;
  if (rest.address !== undefined) updateData.address = rest.address;
  if (rest.status !== undefined) updateData.status = rest.status;

  // Re-parse AI title & structured data if raw_text changed
  if (raw_text) {
    updateData.rawText = raw_text;

    if (isOpenAIConfigured()) {
      try {
        // Fetch current intent to get its type
        const current = await prisma.intent.findUnique({
          where: { id },
          select: { type: true },
        });

        const intentType = body.type || current?.type || 'CAN';

        const [parsed, formatted] = await Promise.all([
          parseSearchIntent(raw_text),
          formatIntentContent(raw_text, intentType),
        ]);

        updateData.title = formatted.title;
        updateData.rawText = formatted.normalized_text;
        updateData.district = parsed.districts?.[0] || updateData.district || null;
        updateData.parsedData = {
          district: parsed.districts?.[0] || null,
          bedrooms: parsed.bedrooms,
          bathrooms: parsed.bathrooms,
          area_min: parsed.area_min,
          area_max: parsed.area_max,
          keywords: parsed.keywords,
          preferences: parsed.preferences,
        };

        if (intentType === 'CO') {
          updateData.price = parsed.price_min || parsed.price_max ? BigInt(parsed.price_min || parsed.price_max!) : null;
        } else {
          updateData.priceMin = parsed.price_min ? BigInt(parsed.price_min) : null;
          updateData.priceMax = parsed.price_max ? BigInt(parsed.price_max) : null;
        }
      } catch {
        // AI re-parse failed — continue with raw_text update only
      }
    }
  }

  // Prisma: update where id AND userId match (ownership check)
  const data = await prisma.intent.updateMany({
    where: { id, userId },
    data: updateData,
  });

  if (data.count === 0) {
    return NextResponse.json({ error: 'Not found or not owned' }, { status: 404 });
  }

  // Fetch updated record
  const updated = await prisma.intent.findUnique({ where: { id } });

  // Re-generate embedding if raw_text changed
  if (raw_text && updated) {
    const intentForEmbed = {
      id: updated.id,
      user_id: updated.userId || '',
      type: updated.type,
      raw_text: updated.rawText,
      title: updated.title,
      parsed_data: updated.parsedData as Record<string, unknown>,
      category: updated.category,
      price: updated.price ? Number(updated.price) : null,
      price_min: updated.priceMin ? Number(updated.priceMin) : null,
      price_max: updated.priceMax ? Number(updated.priceMax) : null,
      district: updated.district,
      ward: updated.ward,
      city: updated.city,
    } as unknown as Intent;
    generateIntentEmbedding(intentForEmbed).catch(() => {});
  }

  // Convert for response
  const responseData = updated ? {
    ...updated,
    price: updated.price ? Number(updated.price) : null,
    price_min: updated.priceMin ? Number(updated.priceMin) : null,
    price_max: updated.priceMax ? Number(updated.priceMax) : null,
  } : null;

  return NextResponse.json(responseData);
}

// DELETE /api/intents/[id] — soft delete
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const auth = await requireAuth(_request);
  if ('error' in auth) return auth.error;
  const { userId } = auth;

  const result = await prisma.intent.updateMany({
    where: { id, userId },
    data: { status: 'hidden', updatedAt: new Date() },
  });

  if (result.count === 0) {
    return NextResponse.json({ error: 'Not found or not owned' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
