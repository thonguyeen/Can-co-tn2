// ═══════════════════════════════════════════════════════════════
// n8n → Intent Webhook
// POST /api/webhook/n8n-intents
//
// Nhận bài viết ĐÃ ĐƯỢC AI PARSE TRÊN N8N và insert thẳng vào
// bảng intents (không gọi AI phía server).
//
// Flow: n8n crawl FB → AI node parse → POST đây → insert DB → matching
//
// Auth: Authorization: Bearer <N8N_WEBHOOK_SECRET>
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getOrCreateCrawlUser } from '@/lib/ai/agents/intent-injector';
import {
    findMatchesForCan,
    findMatchesForCo,
    saveMatches,
} from '@/lib/engine/matching';
import type { Intent } from '@/lib/engine/types';

// ─────────────────────────────────────────────────────────────
// MATCHING TRIGGER (fire-and-forget — reuse logic từ intents/route.ts)
// ─────────────────────────────────────────────────────────────

async function triggerMatching(intentId: string): Promise<void> {
    const intentData = await prisma.intent.findUnique({ where: { id: intentId } });
    if (!intentData) return;

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
}

// ─────────────────────────────────────────────────────────────
// TYPES — dữ liệu n8n gửi lên (đã qua AI parse)
// ─────────────────────────────────────────────────────────────

interface N8nPost {
    // Từ crawler Facebook
    fb_post_id: string;        // ID bài viết FB — dùng để dedup
    message?: string;          // Nội dung bài (bắt buộc để insert)
    author?: string;           // Tên tác giả FB
    image?: string;            // URL ảnh FB CDN
    created_time?: string;     // ISO 8601 timestamp

    // Đã parse bởi AI node trên n8n
    type?: 'CO' | 'CAN';       // Default: 'CO'
    title?: string;            // Default: message.slice(0, 80)
    price?: number;            // Giá VNĐ (null nếu không rõ)
    district?: string;         // Quận/Huyện
    subcategory?: string;      // apartment | house | land | room | commercial
    city?: string;             // Default: 'Hồ Chí Minh'
}

// ─────────────────────────────────────────────────────────────
// AUTH HELPER (reuse pattern từ /api/crawler/webhook)
// ─────────────────────────────────────────────────────────────

function validateAuth(req: NextRequest): boolean {
    const secret = process.env.N8N_WEBHOOK_SECRET;
    if (!secret) {
        console.error('[n8n-intents] N8N_WEBHOOK_SECRET chưa được cấu hình');
        return false;
    }
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return false;
    return authHeader.slice(7).trim() === secret;
}

// ─────────────────────────────────────────────────────────────
// POST /api/webhook/n8n-intents
// ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
    // 1. Auth
    if (!validateAuth(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse body — expect array of N8nPost
    let posts: N8nPost[];
    try {
        const body = await req.json();
        posts = Array.isArray(body) ? body : body?.posts ?? [];
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (!Array.isArray(posts) || posts.length === 0) {
        return NextResponse.json({ error: 'Body phải là array hoặc { posts: [...] }' }, { status: 400 });
    }

    // Cap batch size — Tech Lead recommendation
    if (posts.length > 50) {
        return NextResponse.json({ error: 'Tối đa 50 bài/request' }, { status: 400 });
    }

    console.log(`[n8n-intents] Nhận ${posts.length} bài từ n8n`);

    // 3. Get/create system user "Nguồn ngoài" (reuse existing logic)
    const systemUserId = await getOrCreateCrawlUser();

    // 4. Process batch
    const results = { inserted: 0, skipped: 0, errors: [] as string[] };

    for (const post of posts) {
        const fbId = post.fb_post_id?.trim();

        // Validate: phải có fb_post_id và message
        if (!fbId) {
            results.skipped++;
            continue;
        }
        if (!post.message?.trim()) {
            results.skipped++;
            console.log(`[n8n-intents] Skip bài ${fbId}: không có nội dung`);
            continue;
        }

        const sourceUrl = `fb://group_post/${fbId}`;

        try {
            // Dedup: bỏ qua nếu đã tồn tại
            const existing = await prisma.intent.findFirst({
                where: { sourceUrl },
                select: { id: true },
            });
            if (existing) {
                results.skipped++;
                continue;
            }

            // Tạo Intent
            const rawText = post.message.trim();
            const title = post.title?.trim() || rawText.slice(0, 80);

            const intent = await prisma.intent.create({
                data: {
                    userId: systemUserId,
                    type: post.type === 'CAN' ? 'CAN' : 'CO',
                    rawText,
                    title,
                    category: 'real_estate',
                    subcategory: post.subcategory || 'apartment',
                    price: post.price && post.price > 0 ? BigInt(Math.round(post.price)) : null,
                    district: post.district || null,
                    city: post.city || 'Hồ Chí Minh',
                    status: 'active',
                    isBot: true,
                    botHandle: 'n8n_crawler',
                    sourceUrl,
                    parsedData: {
                        author: post.author || null,
                        source: 'facebook_group',
                        fb_post_id: fbId,
                        crawled_at: new Date().toISOString(),
                    },
                    // Override createdAt với timestamp gốc của bài FB nếu có
                    ...(post.created_time
                        ? { createdAt: new Date(post.created_time) }
                        : {}),
                },
                select: { id: true },
            });

            // Tạo ảnh nếu có
            if (post.image?.trim()) {
                await prisma.intentImage.create({
                    data: {
                        intentId: intent.id,
                        url: post.image.trim(),
                        displayOrder: 0,
                    },
                });
            }

            results.inserted++;
            console.log(`[n8n-intents] ✅ Đã lưu intent ${intent.id} từ bài FB ${fbId}`);

            // Trigger matching engine (fire-and-forget)
            triggerMatching(intent.id).catch((err: Error) =>
                console.warn(`[n8n-intents] Matching fail cho ${intent.id}:`, err.message)
            );

        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            console.error(`[n8n-intents] Error với bài ${fbId}:`, msg);
            results.errors.push(`${fbId}: ${msg}`);
        }
    }

    console.log(
        `[n8n-intents] Kết quả: inserted=${results.inserted}, ` +
        `skipped=${results.skipped}, errors=${results.errors.length}`
    );

    return NextResponse.json(results, { status: 201 });
}
