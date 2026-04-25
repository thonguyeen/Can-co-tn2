// @ts-nocheck
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Header } from '@/components/layout/Header'

/**
 * Layout cho toàn bộ /intent/* routes.
 * Inject Header giống trang chủ với showBackButton=true.
 * Server Component — lấy session và profile để truyền user vào Header.
 */
export default async function IntentLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getServerSession(authOptions)
    const user = session?.user ?? null

    let userData = null
    if (user) {
        const userId = (user as { id?: string }).id
        if (userId) {
            try {
                const profileData = await prisma.$queryRaw<{ display_name?: string; avatar_url?: string }[]>`
                    SELECT display_name, avatar_url FROM profiles WHERE id = ${userId} LIMIT 1
                `
                const profile = profileData[0]
                userData = {
                    id: userId,
                    email: user.email || '',
                    display_name: profile?.display_name || user.name || '',
                    avatar_url: profile?.avatar_url || user.image || '',
                }
            } catch {
                // Fallback nếu DB lỗi
                userData = {
                    id: userId,
                    email: user.email || '',
                    display_name: user.name || '',
                    avatar_url: user.image || '',
                }
            }
        }
    }

    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            <Header user={userData} showBackButton />
            {children}
        </div>
    )
}
