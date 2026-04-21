import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/me — returns { user, profile, stats } for the current session
export async function GET() {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id as string

    try {
        const [user, profile, stats] = await Promise.all([
            prisma.user.findUnique({
                where: { id: userId },
                select: { id: true, name: true, email: true, image: true, role: true },
            }),
            prisma.profile.findUnique({
                where: { id: userId },
                select: {
                    displayName: true,
                    avatarUrl: true,
                    phone: true,
                    trustScore: true,
                    verificationLevel: true,
                    tier: true,
                    referralCode: true,
                },
            }),
            prisma.userStat.findUnique({
                where: { userId },
                select: { points: true, level: true, streakDays: true },
            }),
        ])

        return NextResponse.json({ user, profile, stats })
    } catch (error) {
        console.error('[GET /api/me]', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

// PATCH /api/me — update displayName, phone, avatarUrl
export async function PATCH(req: NextRequest) {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id as string

    try {
        const body = await req.json()
        const { displayName, phone, avatarUrl } = body

        // Validate phone format: 10-11 digits Vietnamese phone
        if (phone !== undefined && phone !== null && phone !== '') {
            const phoneRegex = /^(0|\+84)[0-9]{8,10}$/
            if (!phoneRegex.test(phone)) {
                return NextResponse.json(
                    { error: 'Số điện thoại không hợp lệ (VD: 0901234567)' },
                    { status: 400 }
                )
            }
        }

        // Validate displayName length
        if (displayName !== undefined && displayName !== null) {
            const trimmed = (displayName as string).trim()
            if (trimmed.length < 2 || trimmed.length > 50) {
                return NextResponse.json(
                    { error: 'Tên hiển thị phải từ 2 đến 50 ký tự' },
                    { status: 400 }
                )
            }
        }

        const updated = await prisma.profile.update({
            where: { id: userId },
            data: {
                ...(displayName !== undefined && { displayName: (displayName as string).trim() }),
                ...(phone !== undefined && { phone: phone || null }),
                ...(avatarUrl !== undefined && { avatarUrl }),
                updatedAt: new Date(),
            },
            select: {
                displayName: true,
                avatarUrl: true,
                phone: true,
                trustScore: true,
                verificationLevel: true,
            },
        })

        return NextResponse.json({ profile: updated })
    } catch (error) {
        console.error('[PATCH /api/me]', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
