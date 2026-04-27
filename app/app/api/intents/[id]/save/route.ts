// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/data/get-user'

/**
 * POST /api/intents/[id]/save
 * Toggle save: lưu nếu chưa lưu, bỏ lưu nếu đã lưu
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: intentId } = await params
    const auth = await requireAuth(request)
    if ('error' in auth) return auth.error
    const { userId } = auth

    // Skip DB call cho mock IDs (format 'i-001', 'i-002', ...)
    if (intentId.startsWith('i-')) {
        return NextResponse.json({ saved: true, mock: true })
    }

    try {
        // Check existing save
        const existing = await prisma.intentSave.findUnique({
            where: { userId_intentId: { userId, intentId } },
        })

        if (existing) {
            // Unsave
            await prisma.intentSave.delete({
                where: { userId_intentId: { userId, intentId } },
            })
            return NextResponse.json({ saved: false })
        } else {
            // Save
            await prisma.intentSave.create({
                data: { userId, intentId },
            })
            return NextResponse.json({ saved: true })
        }
    } catch (err) {
        console.error('[intent-save] toggle error:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

/**
 * GET /api/intents/[id]/save
 * Kiểm tra user đã lưu bài này chưa
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: intentId } = await params
    const { getAuthUserId } = await import('@/lib/data/get-user')
    const userId = await getAuthUserId(request)

    if (!userId || intentId.startsWith('i-')) {
        return NextResponse.json({ saved: false })
    }

    const save = await prisma.intentSave.findUnique({
        where: { userId_intentId: { userId, intentId } },
    })

    return NextResponse.json({ saved: !!save })
}
