// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUserId } from '@/lib/data/get-user'

/**
 * GET /api/intents/saved
 * Trả về danh sách intentId user đã lưu — dùng để khởi tạo SavedContext
 */
export async function GET(request: NextRequest) {
    const userId = await getAuthUserId(request)

    if (!userId) {
        return NextResponse.json({ ids: [] })
    }

    try {
        const saves = await prisma.intentSave.findMany({
            where: { userId },
            select: { intentId: true },
            orderBy: { createdAt: 'desc' },
        })

        const ids = saves.map((s) => s.intentId)
        return NextResponse.json({ ids })
    } catch (err) {
        console.error('[intents/saved] fetch error:', err)
        return NextResponse.json({ ids: [] })
    }
}
