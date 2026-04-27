// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUserId } from '@/lib/data/get-user'

/**
 * GET /api/intents/saved
 * - Mặc định: trả về { ids: string[] } — dùng để khởi tạo SavedContext
 * - ?full=true: trả về { ids, intents: [...] } — dùng cho ProfileTabs
 */
export async function GET(request: NextRequest) {
    const userId = await getAuthUserId(request)

    if (!userId) {
        return NextResponse.json({ ids: [], intents: [] })
    }

    const full = request.nextUrl.searchParams.get('full') === 'true'

    try {
        const saves = await prisma.intentSave.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50,
            select: {
                intentId: true,
                intent: full ? {
                    select: {
                        id: true,
                        type: true,
                        title: true,
                        rawText: true,
                        district: true,
                        ward: true,
                        city: true,
                        price: true,
                        priceMin: true,
                        priceMax: true,
                        category: true,
                        subcategory: true,
                        address: true,
                        lat: true,
                        lng: true,
                        trustScore: true,
                        verificationLevel: true,
                        commentCount: true,
                        matchCount: true,
                        viewCount: true,
                        status: true,
                        isBot: true,
                        parsedData: true,
                        expiresAt: true,
                        createdAt: true,
                        updatedAt: true,
                        userId: true,
                        images: {
                            orderBy: { displayOrder: 'asc' },
                            select: { id: true, url: true, displayOrder: true }
                        },
                    }
                } : false,
            },
        })

        const ids = saves.map((s) => s.intentId)

        if (!full) {
            return NextResponse.json({ ids })
        }

        // Collect unique userIds to batch-fetch profiles
        // (Intent model has no direct `profile` relation — fetch separately)
        const intentsList = saves.map((s) => s.intent).filter(Boolean)
        const userIds = [...new Set(intentsList.map((i) => i!.userId).filter(Boolean))] as string[]

        const profiles = userIds.length > 0
            ? await prisma.profile.findMany({
                where: { id: { in: userIds } },
                select: { id: true, displayName: true, avatarUrl: true, trustScore: true, verificationLevel: true },
            })
            : []
        const profileMap = Object.fromEntries(profiles.map((p) => [p.id, p]))

        // Map Prisma shape → MockIntent shape expected by frontend cards
        const intents = intentsList.map((i) => {
            const profile = profileMap[i!.userId ?? ''] ?? null
            return {
                id: i!.id,
                user_id: i!.userId ?? '',
                type: i!.type as 'CAN' | 'CO',
                raw_text: i!.rawText ?? '',
                title: i!.title ?? '',
                parsed_data: i!.parsedData ?? {},
                category: i!.category ?? 'real_estate',
                subcategory: i!.subcategory ?? null,
                price: i!.price ? Number(i!.price) : null,
                price_min: i!.priceMin ? Number(i!.priceMin) : null,
                price_max: i!.priceMax ? Number(i!.priceMax) : null,
                address: i!.address ?? null,
                district: i!.district ?? null,
                ward: i!.ward ?? null,
                city: i!.city ?? 'Hồ Chí Minh',
                lat: i!.lat ? Number(i!.lat) : null,
                lng: i!.lng ? Number(i!.lng) : null,
                trust_score: i!.trustScore ?? 1,
                verification_level: i!.verificationLevel ?? 'none',
                comment_count: i!.commentCount ?? 0,
                match_count: i!.matchCount ?? 0,
                view_count: i!.viewCount ?? 0,
                reactions: { interested: 0, fair_price: 0, hot: 0 },
                status: i!.status ?? 'active',
                expires_at: i!.expiresAt ?? null,
                created_at: i!.createdAt instanceof Date ? i!.createdAt.toISOString() : String(i!.createdAt ?? ''),
                updated_at: i!.updatedAt instanceof Date ? i!.updatedAt.toISOString() : String(i!.updatedAt ?? ''),
                images: (i!.images ?? []).map((img) => ({
                    id: img.id,
                    url: img.url,
                    display_order: img.displayOrder ?? 0,
                })),
                is_bot: i!.isBot ?? false,
                user: {
                    id: profile?.id ?? i!.userId ?? '',
                    name: profile?.displayName ?? 'Người dùng',
                    avatar_url: profile?.avatarUrl ?? null,
                    trust_score: profile?.trustScore ?? 1,
                    verification_level: profile?.verificationLevel ?? 'none',
                },
                bot_comment: null,
                bot_comments: [],
                latest_comment: null,
            }
        })

        return NextResponse.json({ ids, intents })
    } catch (err) {
        console.error('[intents/saved] fetch error:', err)
        return NextResponse.json({ ids: [], intents: [] })
    }
}
