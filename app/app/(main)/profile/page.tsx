import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { ProfileTabs } from '@/components/profile/ProfileTabs'
import { Camera, ShieldCheck } from 'lucide-react'

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

                {/* White card below cover */}
                <div className="bg-white border-b border-slate-100">
                    <div className="max-w-3xl mx-auto px-4 md:px-6">

                        {/* Avatar row */}
                        <div className="flex items-end justify-between -mt-12 md:-mt-14 pb-4">
                            {/* Avatar */}
                            <div className="relative group">
                                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-white shadow-lg overflow-hidden bg-indigo-100">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-indigo-600 text-4xl font-black">
                                            {initials}
                                        </div>
                                    )}
                                </div>
                                {/* Camera overlay (future upload) */}
                                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <Camera size={20} className="text-white" />
                                </div>
                            </div>

                            {/* Edit button (desktop) */}
                            <a
                                href="/profile/edit"
                                className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 border border-slate-200 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-50 transition-colors"
                            >
                                Chỉnh sửa hồ sơ
                            </a>
                        </div>

                        {/* Name + info */}
                        <div className="pb-5">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-2xl md:text-3xl font-black text-slate-900">{displayName}</h1>
                                {isVerified && (
                                    <ShieldCheck size={20} className="text-blue-500 shrink-0" />
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">{tierLabel}</span>
                                {profile?.verificationLevel && profile.verificationLevel !== 'none' && (
                                    <span className="text-xs font-bold bg-green-50 text-green-700 px-3 py-1 rounded-full">
                                        ✓ Đã xác minh
                                    </span>
                                )}
                            </div>

                            {/* Stats chips */}
                            <div className="flex flex-wrap gap-3 mt-4">
                                <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-2xl px-4 py-2">
                                    <span className="text-amber-500 text-lg">🪙</span>
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-amber-500 tracking-wide">Xu tích lũy</p>
                                        <p className="text-lg font-black text-amber-600 leading-none">{points.toLocaleString('vi')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-2xl px-4 py-2">
                                    <span className="text-indigo-500 text-lg">⚡</span>
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-indigo-500 tracking-wide">Cấp độ</p>
                                        <p className="text-lg font-black text-indigo-600 leading-none">Lv.{level}</p>
                                    </div>
                                </div>
                                {streak > 0 && (
                                    <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-2xl px-4 py-2">
                                        <span className="text-orange-500 text-lg">🔥</span>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-orange-500 tracking-wide">Streak</p>
                                            <p className="text-lg font-black text-orange-600 leading-none">{streak} ngày</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Edit button (mobile) */}
                            <a
                                href="/profile/edit"
                                className="mt-4 inline-flex md:hidden items-center gap-2 px-5 py-2.5 border border-slate-200 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-50 transition-colors"
                            >
                                Chỉnh sửa hồ sơ
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Content + Tabs ── */}
            <div className="max-w-3xl mx-auto px-4 md:px-6 py-6">
                <ProfileTabs userId={userId} activeIntentsCount={intentCount} />
            </div>
        </div>
    )
}
