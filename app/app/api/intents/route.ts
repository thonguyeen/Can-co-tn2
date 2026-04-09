import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthUserId, requireAuth } from '@/lib/data/get-user';
import { parseSearchIntent, formatIntentContent, isConfigured as isOpenAIConfigured } from '@/lib/engine/openai';
import {
  generateIntentEmbedding,
  findMatchesForCan,
  findMatchesForCo,
  saveMatches,
  notifyMatchedIntents,
} from '@/lib/engine/matching';
import { orchestrate, executeActions } from '@/lib/agents/orchestrator';
import { moderateContent, MAX_VIOLATIONS } from '@/lib/engine/moderation';
import type { Intent } from '@/lib/engine/types';

/** Fire-and-forget matching trigger — runs in background */
async function triggerMatching(intentId: string): Promise<void> {
  try {
    const intentData = await prisma.intent.findUnique({
      where: { id: intentId },
    });

    if (!intentData) return;

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

    const candidates = typedIntent.type === 'CAN'
      ? await findMatchesForCan(typedIntent)
      : await findMatchesForCo(typedIntent);

    for (const candidate of candidates) {
      const canId = typedIntent.type === 'CAN' ? typedIntent.id : candidate.intent.id;
      const coId = typedIntent.type === 'CO' ? typedIntent.id : candidate.intent.id;
      await saveMatches(canId, coId, candidate.similarity, candidate.explanation);
    }

    await prisma.intent.update({
      where: { id: intentId },
      data: { matchCount: candidates.length },
    });

    await notifyMatchedIntents(typedIntent.type as 'CAN' | 'CO', candidates);

    // Run orchestrator — decides which bots comment
    const event = candidates.length > 0 ? 'match_found' as const : 'intent_created' as const;
    const actions = await orchestrate(
      { event, intentId, intentData: typedIntent, context: { matchCount: candidates.length, similarCount: candidates.length } },
    );
    if (actions.length > 0) {
      await executeActions(actions);
    }
  } catch (err) {
    console.error('[triggerMatching] failed:', err);
  }
}

// GET /api/intents — feed with joins
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const district = searchParams.get('district');
    const status = searchParams.get('status') || 'active';
    const id = searchParams.get('id'); // Support fetching by ID
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (!id) {
      where.status = status;
    }

    if (id) where.id = id;
    if (type) where.type = type;
    if (category) where.category = category;
    if (district) where.district = district;

    // Fetch intents with images + count
    const [intents, count] = await Promise.all([
      prisma.intent.findMany({
        where,
        include: { images: true },
        orderBy: [{ trustScore: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      prisma.intent.count({ where }),
    ]);

    if (intents.length === 0) {
      return NextResponse.json({ intents: [], total: 0, page, limit });
    }

    // Batch fetch related data
    const intentIds = intents.map((i) => i.id);
    const userIds = [...new Set(intents.filter(i => !i.isBot && i.userId).map((i) => i.userId!))];
    const botHandles = [...new Set(intents.filter(i => i.isBot && i.botHandle).map((i) => i.botHandle!))];

    const [profiles, bots, botComments, latestComments] = await Promise.all([
      // User profiles
      prisma.profile.findMany({
        where: { id: { in: userIds } },
        select: { id: true, displayName: true, avatarUrl: true },
      }),
      // Bot info
      prisma.bot.findMany({
        where: { handle: { in: botHandles } },
      }),
      // ALL bot comments per intent (match_advisor first, then others)
      prisma.intentComment.findMany({
        where: { intentId: { in: intentIds }, isBot: true },
        orderBy: { createdAt: 'asc' },
      }),
      // Latest human comment per intent
      prisma.intentComment.findMany({
        where: { intentId: { in: intentIds }, isBot: false },
        include: {
          // No direct profile relation in IntentComment — we'll resolve manually
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const profilesMap = new Map(
      profiles.map((p) => [p.id, p]),
    );

    const botsMap = new Map(
      bots.map((b) => [b.handle, b]),
    );

    // Group ALL bot comments per intent, pin match_advisor first
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const botCommentsGroupMap = new Map<string, any[]>();
    for (const bc of botComments) {
      const key = bc.intentId;
      if (!botCommentsGroupMap.has(key)) {
        botCommentsGroupMap.set(key, []);
      }
      botCommentsGroupMap.get(key)!.push({
        id: bc.id,
        intent_id: bc.intentId,
        user_id: bc.userId,
        bot_name: bc.botName,
        content: bc.content,
        is_bot: bc.isBot,
        parent_id: bc.parentId,
        created_at: bc.createdAt,
      });
    }
    // Sort each group: match_advisor first
    for (const [, comments] of botCommentsGroupMap) {
      comments.sort((a: { bot_name: string }, b: { bot_name: string }) => {
        if (a.bot_name === 'match_advisor') return -1;
        if (b.bot_name === 'match_advisor') return 1;
        return 0;
      });
    }

    // Get first human comment per intent + resolve user names
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const latestCommentMap = new Map<string, any>();
    for (const lc of latestComments) {
      if (!latestCommentMap.has(lc.intentId)) {
        const profile = lc.userId ? profilesMap.get(lc.userId) : null;
        latestCommentMap.set(lc.intentId, {
          id: lc.id,
          intent_id: lc.intentId,
          content: lc.content,
          user_id: lc.userId,
          is_bot: lc.isBot,
          bot_name: lc.botName,
          created_at: lc.createdAt,
          profiles: profile ? { display_name: profile.displayName } : null,
        });
      }
    }

    // Assemble enriched intents
    const enriched = intents.map((intent) => {
      const allBotComments = botCommentsGroupMap.get(intent.id) || [];
      const botComment = allBotComments[0] || null;
      const latestComment = latestCommentMap.get(intent.id) || null;

      let userObj;
      if (intent.isBot) {
        const bot = botsMap.get(intent.botHandle!);
        userObj = {
          id: bot?.handle || intent.botHandle || 'unknown',
          name: bot?.name || 'Bot Đặc Vụ',
          avatar_url: null,
          trust_score: intent.trustScore,
          verification_level: 'verified',
          is_bot: true,
          bot_color: bot?.color || '#0e7490'
        };
      } else {
        const profile = profilesMap.get(intent.userId!);
        userObj = {
          id: intent.userId,
          name: profile?.displayName || 'Người dùng',
          avatar_url: profile?.avatarUrl || null,
          trust_score: intent.trustScore,
          verification_level: intent.verificationLevel,
          is_bot: false
        };
      }

      return {
        id: intent.id,
        user_id: intent.userId,
        type: intent.type,
        raw_text: intent.rawText,
        title: intent.title,
        parsed_data: intent.parsedData,
        category: intent.category,
        subcategory: intent.subcategory,
        price: intent.price ? Number(intent.price) : null,
        price_min: intent.priceMin ? Number(intent.priceMin) : null,
        price_max: intent.priceMax ? Number(intent.priceMax) : null,
        address: intent.address,
        district: intent.district,
        ward: intent.ward,
        city: intent.city,
        trust_score: intent.trustScore,
        verification_level: intent.verificationLevel,
        comment_count: intent.commentCount,
        match_count: intent.matchCount,
        view_count: intent.viewCount,
        status: intent.status,
        is_bot: intent.isBot,
        bot_handle: intent.botHandle,
        source_url: intent.sourceUrl,
        created_at: intent.createdAt,
        updated_at: intent.updatedAt,
        user: userObj,
        images: (intent.images || []).map(img => ({
          id: img.id,
          intent_id: img.intentId,
          url: img.url,
          display_order: img.displayOrder,
          created_at: img.createdAt,
        })),
        intent_images: (intent.images || []).map(img => ({
          id: img.id,
          intent_id: img.intentId,
          url: img.url,
          display_order: img.displayOrder,
          created_at: img.createdAt,
        })),
        bot_comments: allBotComments,
        bot_comment: botComment,
        latest_comment: latestComment
          ? {
              id: latestComment.id,
              intent_id: latestComment.intent_id,
              content: latestComment.content,
              user_id: latestComment.user_id,
              is_bot: latestComment.is_bot,
              bot_name: latestComment.bot_name,
              created_at: latestComment.created_at,
              user: {
                name: latestComment.profiles?.display_name || 'Người dùng',
              },
            }
          : null,
      };
    });

    return NextResponse.json({ intents: enriched, total: count || 0, page, limit });
  } catch (err) {
    console.error('Feed API error:', err);
    return NextResponse.json({ error: 'Failed to load feed' }, { status: 500 });
  }
}

// POST /api/intents — create intent with AI parsing
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if ('error' in auth) return auth.error;
    const { userId } = auth;

    const body = await request.json();
    const { type, raw_text, category } = body;

    if (!type || !raw_text) {
      return NextResponse.json({ error: 'type and raw_text are required' }, { status: 400 });
    }
    if (type !== 'CAN' && type !== 'CO') {
      return NextResponse.json({ error: 'type must be CAN or CO' }, { status: 400 });
    }
    if (raw_text.trim().length < 10) {
      return NextResponse.json({ error: 'Vui lòng mô tả ít nhất 10 ký tự' }, { status: 400 });
    }

    // ═══ CONTENT MODERATION ═══
    // 1. Check if user is already banned
    const profile = await prisma.profile.findUnique({
      where: { id: userId },
      select: { violationCount: true, isBanned: true },
    });

    if (profile?.isBanned) {
      return NextResponse.json({
        error: 'Tài khoản của bạn đã bị khóa vĩnh viễn do vi phạm tiêu chuẩn cộng đồng nhiều lần.',
        code: 'ACCOUNT_BANNED',
      }, { status: 403 });
    }

    // 2. Run content moderation (keyword + AI)
    const moderation = await moderateContent(raw_text);

    if (!moderation.allowed) {
      const currentViolations = (profile?.violationCount || 0) + 1;

      // Log the violation
      await prisma.contentViolation.create({
        data: {
          userId,
          rawText: raw_text.slice(0, 500),
          violationType: moderation.violation_type || 'unknown',
          aiReason: moderation.reason,
        },
      });

      // Update violation count on profile
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updateData: any = {
        violationCount: currentViolations,
      };

      // Ban if reached max violations
      if (currentViolations >= MAX_VIOLATIONS) {
        updateData.isBanned = true;
        updateData.bannedAt = new Date();
        updateData.banReason = `Vi phạm ${currentViolations} lần: ${moderation.violation_type}`;
      }

      await prisma.profile.update({
        where: { id: userId },
        data: updateData,
      });

      // Build response message
      const remaining = MAX_VIOLATIONS - currentViolations;
      let message = `⚠️ Nội dung vi phạm: ${moderation.reason}`;

      if (currentViolations >= MAX_VIOLATIONS) {
        message += '\n\n🔒 Tài khoản của bạn đã bị KHÓA VĨNH VIỄN do vi phạm quá 3 lần.';
      } else {
        message += `\n\n📌 Cảnh báo ${currentViolations}/${MAX_VIOLATIONS}. Còn ${remaining} lần vi phạm nữa sẽ bị khóa tài khoản vĩnh viễn.`;
      }

      return NextResponse.json({
        error: message,
        code: currentViolations >= MAX_VIOLATIONS ? 'ACCOUNT_BANNED' : 'CONTENT_VIOLATION',
        violation_count: currentViolations,
        max_violations: MAX_VIOLATIONS,
      }, { status: 422 });
    }

    // AI parsing (best-effort)
    let parsedData: Record<string, unknown> = {};
    let title = raw_text.slice(0, 80);
    let normalized_text: string | undefined;
    let district: string | null = null;
    let price: number | null = null;
    let priceMin: number | null = null;
    let priceMax: number | null = null;

    if (isOpenAIConfigured()) {
      try {
        const [intent, formatted] = await Promise.all([
          parseSearchIntent(raw_text),
          formatIntentContent(raw_text, type),
        ]);

        title = formatted.title;
        normalized_text = formatted.normalized_text;
        district = intent.districts?.[0] || null;
        if (type === 'CO') {
          price = intent.price_min || intent.price_max || null;
        } else {
          priceMin = intent.price_min || null;
          priceMax = intent.price_max || null;
        }
        parsedData = {
          district: district,
          bedrooms: intent.bedrooms,
          bathrooms: intent.bathrooms,
          area_min: intent.area_min,
          area_max: intent.area_max,
          keywords: intent.keywords,
          preferences: intent.preferences,
        };
      } catch {
        // AI failed — continue with raw text only
      }
    }

    // Use body overrides if provided
    const data = await prisma.intent.create({
      data: {
        userId,
        type,
        rawText: typeof normalized_text !== 'undefined' ? normalized_text : raw_text,
        title,
        category: category || 'real_estate',
        price: body.price ?? price ? BigInt(body.price ?? price) : null,
        priceMin: body.price_min ?? priceMin ? BigInt(body.price_min ?? priceMin) : null,
        priceMax: body.price_max ?? priceMax ? BigInt(body.price_max ?? priceMax) : null,
        district: body.district ?? district,
        ward: body.ward || null,
        address: body.address || null,
        lat: body.lat || null,
        lng: body.lng || null,
        parsedData: body.parsed_data || parsedData,
      },
    });

    // Convert BigInt to Number for JSON serialization
    const responseData = {
      ...data,
      price: data.price ? Number(data.price) : null,
      price_min: data.priceMin ? Number(data.priceMin) : null,
      price_max: data.priceMax ? Number(data.priceMax) : null,
    };

    // Trigger bot comments + matching IMMEDIATELY (fire-and-forget)
    triggerMatching(data.id).catch((err) => console.error('Matching pipeline failed:', err));

    // Generate embedding in parallel (best-effort)
    const intentForEmbed = {
      id: data.id,
      user_id: userId,
      type: data.type,
      raw_text: data.rawText,
      title: data.title,
      parsed_data: data.parsedData as Record<string, unknown>,
      category: data.category,
      price: data.price ? Number(data.price) : null,
      price_min: data.priceMin ? Number(data.priceMin) : null,
      price_max: data.priceMax ? Number(data.priceMax) : null,
      district: data.district,
      ward: data.ward,
      city: data.city,
    } as unknown as Intent;
    generateIntentEmbedding(intentForEmbed).catch(() => {});

    return NextResponse.json(responseData, { status: 201 });
  } catch (err) {
    console.error('Create intent error:', err);
    return NextResponse.json({ error: 'Không thể đăng, vui lòng thử lại' }, { status: 500 });
  }
}
