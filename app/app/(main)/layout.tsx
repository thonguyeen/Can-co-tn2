import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { RightPanel } from '@/components/layout/RightPanel'
import { MobileNav } from '@/components/layout/MobileNav'
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

  return (
    <div className="min-h-screen bg-background">
      <Header user={userData} />

      <div className="max-w-[1920px] mx-auto px-4 pt-4 pb-20 lg:pb-4">
        <div className="flex gap-4 justify-center">
          <Sidebar user={userData} followedBots={followedBots} />

          <main className="w-full max-w-[680px] min-w-0">
            {children}
          </main>

          <RightPanel suggestedBots={(suggestedBots as Bot[]) || []} />
        </div>
      </div>

      <MobileNav />
    </div>
  )
}
