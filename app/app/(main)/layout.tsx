import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { MainLayoutWrapper } from '@/components/layout/MainLayoutWrapper'
import type { Bot } from '@/lib/types'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  const user = session?.user

  if (!user) {
    redirect('/login')
  }

  const userId = (user as any).id;

  // Get user profile
  const profileData = await prisma.$queryRaw<any[]>`SELECT * FROM profiles WHERE id = ${userId} LIMIT 1`
  const profile = profileData[0]

  // Get followed bots
  const follows = await prisma.$queryRaw<any[]>`SELECT bot_id FROM follows WHERE user_id = ${userId}`

  let followedBots: Bot[] = []
  if (follows && follows.length > 0) {
    const botIds = follows.map((f) => f.bot_id)
    const botIdsStr = botIds.map((id) => `'${id}'`).join(',')
    const bots = await prisma.$queryRawUnsafe<any[]>(`SELECT * FROM bots WHERE id IN (${botIdsStr})`)
    followedBots = (bots as Bot[]) || []
  }

  // Get all bots for suggestions (exclude followed)
  const followedBotIds = followedBots.map((b) => b.id)
  let suggestedBots = []
  if (followedBotIds.length > 0) {
    const excludeStr = followedBotIds.map(id => `'${id}'`).join(',')
    suggestedBots = await prisma.$queryRawUnsafe<any[]>(`SELECT * FROM bots WHERE id NOT IN (${excludeStr}) LIMIT 3`)
  } else {
    suggestedBots = await prisma.$queryRaw<any[]>`SELECT * FROM bots LIMIT 3`
  }

  const userData = {
    id: userId,
    email: user.email || '',
    display_name: profile?.display_name || user.name || '',
    avatar_url: profile?.avatar_url || user.image || '',
  }

  // Serialize để loại bỏ Prisma Decimal/BigInt objects — Next.js không hỗ trợ
  // truyền chúng từ Server Component sang Client Component
  const safeFollowedBots = JSON.parse(JSON.stringify(followedBots))
  const safeSuggestedBots = JSON.parse(JSON.stringify(suggestedBots))

  return (
    <MainLayoutWrapper
      userData={userData}
      followedBots={safeFollowedBots}
      suggestedBots={safeSuggestedBots}
    >
      {children}
    </MainLayoutWrapper>
  )
}
