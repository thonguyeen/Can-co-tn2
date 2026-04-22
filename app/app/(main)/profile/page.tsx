import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { ProfileTabs } from '@/components/profile/ProfileTabs'
import { ProfileHeader } from '@/components/profile/ProfileHeader'

export const metadata = {
    title: 'Hồ sơ của tôi | Cần & Có',
    description: 'Quản lý thông tin cá nhân, tin đăng và hoạt động của bạn trên Cần & Có.',
}

export default async function ProfilePage() {
    const session = await getServerSession(authOptions)
    if (!session?.user) redirect('/login')

    const userId = (session.user as any).id as string

    // Fetch profile, stats, and intent count in parallel
    const [profile, stats, intentCount] = await Promise.all([
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
                createdAt: true,
            },
        }),
        prisma.userStat.findUnique({
            where: { userId },
            select: { points: true, level: true, streakDays: true },
        }),
        prisma.intent.count({
            where: { userId, status: 'active' },
        }),
    ])

    const displayName = profile?.displayName || session.user.name || 'Thành viên'
    const avatarUrl = profile?.avatarUrl || session.user.image || null
    const initials = displayName.charAt(0).toUpperCase()
    const points = stats?.points ?? 0
    const level = stats?.level ?? 1
    const streak = stats?.streakDays ?? 0

    // Tier label
    const tierLabels: Record<number, string> = {
        1: 'Thành viên',
        2: 'Thành viên Tích Cực',
        3: 'Chuyên gia Uy Tín',
        4: 'Đại Lý Cộng Đồng',
        5: 'Đối Tác Vàng',
    }
    const tierLabel = tierLabels[profile?.tier ?? 1] ?? 'Thành viên'
    const isVerified = profile?.verificationLevel && profile.verificationLevel !== 'none'

    return (
        <div className="min-h-screen bg-slate-50">

            {/* ── Cover Photo + Avatar Header ── */}
            <div className="relative">
                {/* Cover gradient */}
                <div className="h-40 md:h-52 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-600" />

                {/* ProfileHeader — Client Component (handles inline edit) */}
                <ProfileHeader
                    displayName={displayName}
                    avatarUrl={avatarUrl}
                    initials={initials}
                    tierLabel={tierLabel}
                    isVerified={!!isVerified}
                    points={points}
                    level={level}
                    streak={streak}
                    phone={profile?.phone ?? null}
                />
            </div>

            {/* ── Content + Tabs ── */}
            <div className="max-w-3xl mx-auto px-4 md:px-6 py-6">
                <ProfileTabs userId={userId} activeIntentsCount={intentCount} />
            </div>
        </div>
    )
}
