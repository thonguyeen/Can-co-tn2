// @ts-nocheck
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
//
// Supported input formats:
//   1. [{ records: [...] }]  — n8n default wrapper
//   2. [post, post, ...]     — flat array
//   3. { posts: [...] }      — legacy format
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
    // ── N8N crawler fields ──
    post_id: string;               // "group_id_post_id" — dùng để dedup
    message_raw?: string;          // Nội dung gốc (có emoji/ký tự đặc biệt)
    message_clean?: string;        // Nội dung đã strip emoji — tốt cho matching
    author_name?: string;          // Tên tác giả FB
    author_id?: string;            // FB user ID tác giả
    images?: string[];             // Array URL ảnh FB CDN
    created_time?: string;         // ISO 8601 timestamp
    post_url?: string;             // Link tới bài FB gốc
    group_id?: string;             // ID group FB
    group_name?: string;           // Tên group FB
    group_url?: string;            // Link group FB
    phones_raw?: string[];         // SĐT trích từ raw message

    // ── AI-parsed fields ──
    type?: number | string;        // 0=unknown, 1=CO (bán/cho thuê), 2=CAN (cần/mua)
    title?: string;                // AI-generated title
    price?: number;                // Giá VNĐ (0 = không rõ)
    district?: string;             // Quận/Huyện/Phường
    subcategory?: string;          // house | land | villa | apartment | room | commercial
    city?: string;                 // Tỉnh/Thành phố
    acreage?: number;              // Diện tích (m²)
    utilities?: string[];          // Tiện ích (sofa, bàn ăn, ...)
    phones?: string[];             // SĐT đã parse
    confidence?: number;           // AI confidence score (0-1)
    ai_processed_at?: string;      // Timestamp AI xử lý

    // ── Backward compat (old format) ──
    fb_post_id?: string;           // Alias cho post_id
    message?: string;              // Alias cho message_raw
    author?: string;               // Alias cho author_name
    image?: string;                // Alias cho images[0] (singular)
}

// ─────────────────────────────────────────────────────────────
// TYPE MAPPING: numeric (n8n) → CO/CAN (DB)
// 0 = không xác định → default CO (Option B — hầu hết bài FB là bán)
// 1 = cung cấp (bán/cho thuê/sang nhượng) → CO
// 2 = cần nhu cầu (mua/thuê/tìm) → CAN
// ─────────────────────────────────────────────────────────────

function mapType(t?: number | string): 'CO' | 'CAN' {
    if (t === 2 || t === 'CAN') return 'CAN';
    return 'CO'; // 0 (unknown) & 1 (bán) & legacy string → CO
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

    // 2. Parse body — handle 3 formats
    let posts: N8nPost[];
    try {
        const body = await req.json();

        // Format 1: [{ records: [...], total, source }] — n8n default wrapper
        if (Array.isArray(body) && body[0]?.records) {
            posts = body[0].records;
        }
        // Format 2: [post, post, ...] — flat array
        else if (Array.isArray(body)) {
            posts = body;
        }
        // Format 3: { posts: [...] } — legacy
        else {
            posts = body?.posts ?? [];
        }
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (!Array.isArray(posts) || posts.length === 0) {
        return NextResponse.json(
            { error: 'Body phải là array, { posts: [...] }, hoặc [{ records: [...] }]' },
            { status: 400 },
        );
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
        // Resolve post ID: post_id (new) > fb_post_id (legacy)
        const fbId = (post.post_id || post.fb_post_id || '').trim();

        // Validate: phải có ID
        if (!fbId) {
            results.skipped++;
            continue;
        }

        // Resolve message: message_clean > message_raw > message (legacy)
        const rawText = (
            post.message_clean || post.message_raw || post.message || ''
        ).trim();

        if (!rawText) {
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

            // Map type: numeric (0/1/2) → CO/CAN
            const intentType = mapType(post.type);
            const title = post.title?.trim() || rawText.slice(0, 80);

            // Tạo Intent
            const intent = await prisma.intent.create({
                data: {
                    userId: systemUserId,
                    type: intentType,
                    rawText,
                    title,
                    category: 'real_estate',
                    subcategory: post.subcategory || 'apartment',
                    price: post.price && post.price > 0
                        ? BigInt(Math.round(post.price))
                        : null,
                    district: post.district || null,
                    city: post.city || null, // Không default HCM — bài ngoại tỉnh giữ nguyên
                    status: 'active',
                    isBot: true,
                    botHandle: 'n8n_crawler',
                    sourceUrl,
                    parsedData: {
                        // Author info
                        author: post.author_name || post.author || null,
                        author_id: post.author_id || null,
                        // Source tracing
                        source: 'facebook_group',
                        fb_post_id: fbId,
                        fb_post_url: post.post_url || null,
                        group_id: post.group_id || null,
                        group_name: post.group_name || null,
                        group_url: post.group_url || null,
                        // AI-parsed metadata
                        acreage: post.acreage || null,
                        utilities: post.utilities || [],
                        phones: post.phones || post.phones_raw || [],
                        confidence: post.confidence ?? null,
                        raw_type: post.type ?? null, // Lưu type gốc (0/1/2) để trace
                        ai_processed_at: post.ai_processed_at || null,
                        crawled_at: new Date().toISOString(),
                    },
                    // Override createdAt với timestamp gốc của bài FB nếu có
                    ...(post.created_time
                        ? { createdAt: new Date(post.created_time) }
                        : {}),
                },
                select: { id: true },
            });

            // ── Tạo ảnh: hỗ trợ images[] (array) và image (singular, legacy) ──
            const imageUrls = post.images?.length
                ? post.images
                : post.image ? [post.image] : [];

            for (const [i, url] of imageUrls.entries()) {
                if (url?.trim()) {
                    await prisma.intentImage.create({
                        data: {
                            intentId: intent.id,
                            url: url.trim(),
                            displayOrder: i,
                        },
                    });
                }
            }

            results.inserted++;
            console.log(
                `[n8n-intents] ✅ Đã lưu intent ${intent.id} từ bài FB ${fbId}` +
                ` (${intentType}, ${imageUrls.length} ảnh)`,
            );

            // Trigger matching engine (fire-and-forget)
            triggerMatching(intent.id).catch((err: Error) =>
                console.warn(`[n8n-intents] Matching fail cho ${intent.id}:`, err.message),
            );

        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            console.error(`[n8n-intents] Error với bài ${fbId}:`, msg);
            results.errors.push(`${fbId}: ${msg}`);
        }
    }

    console.log(
        `[n8n-intents] Kết quả: inserted=${results.inserted}, ` +
        `skipped=${results.skipped}, errors=${results.errors.length}`,
    );

    return NextResponse.json(results, { status: 201 });
}
