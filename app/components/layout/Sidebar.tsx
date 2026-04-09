'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Bookmark, Settings, Bot as BotIcon, Users, Trophy, Gift } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import type { Bot } from '@/lib/types'

interface SidebarProps {
  user?: {
    id: string
    display_name?: string | null
    avatar_url?: string | null
  } | null
  followedBots?: Bot[]
}

export function Sidebar({ user, followedBots = [] }: SidebarProps) {
  const pathname = usePathname()

  const renderNavLinks = (items: any[]) => items.map((item) => {
    const isActive = pathname === item.href
    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
          isActive
            ? 'bg-accent text-primary font-medium'
            : 'hover:bg-secondary/50 text-foreground'
        )}
      >
        <item.icon className="w-5 h-5" />
        <span className="text-[15px]">{item.label}</span>
      </Link>
    )
  })

  return (
    <aside className="hidden lg:block w-[280px] shrink-0">
      <div className="sticky top-[72px] space-y-2 pr-2">
        {/* User Info */}
        {user && (
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors">
            <Avatar className="w-9 h-9">
              <AvatarImage src={user.avatar_url || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {user.display_name?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium text-sm">
              {user.display_name || 'Người dùng'}
            </span>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-border my-2" />

        {/* Navigation - Main */}
        <nav className="space-y-1">
          {renderNavLinks([
            { href: '/feed', icon: Home, label: 'Trang chủ' },
            { href: '/saved', icon: Bookmark, label: 'Đã lưu' },
          ])}
        </nav>

        {/* Divider */}
        <div className="border-t border-border my-2" />

        {/* Navigation - Gamification */}
        <nav className="space-y-1">
          {renderNavLinks([
            { href: '/profile/referral', icon: Users, label: 'Giới thiệu bạn' },
            { href: '/leaderboard', icon: Trophy, label: 'Bảng xếp hạng' },
            { href: '/rewards', icon: Gift, label: 'Cửa hàng quà' },
          ])}
        </nav>

        {/* Divider */}
        <div className="border-t border-border my-2" />

        {/* Navigation - Settings */}
        <nav className="space-y-1">
          {renderNavLinks([
            { href: '/settings', icon: Settings, label: 'Cài đặt' },
          ])}
        </nav>

        {/* Divider */}
        <div className="border-t border-border my-2" />

        {/* Followed Bots */}
        <div className="space-y-1">
          <div className="px-3 py-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Đang theo dõi
            </h3>
          </div>

          {followedBots.length > 0 ? (
            followedBots.map((bot) => {
              const isActive = pathname === `/bot/${bot.handle}`
              return (
                <Link
                  key={bot.id}
                  href={`/bot/${bot.handle}`}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                    isActive
                      ? 'bg-accent font-medium'
                      : 'hover:bg-secondary/50'
                  )}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={bot.avatar_url || undefined} />
                    <AvatarFallback
                      className="text-white text-xs"
                      style={{ backgroundColor: bot.color_accent || '#1877F2' }}
                    >
                      {bot.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm truncate">{bot.name}</span>
                </Link>
              )
            })
          ) : (
            <div className="px-3 py-2">
              <p className="text-sm text-muted-foreground">
                Chưa theo dõi bot nào
              </p>
              <Link
                href="/bot/minh_ai"
                className="text-sm text-primary hover:underline mt-1 inline-flex items-center gap-1"
              >
                <BotIcon className="w-4 h-4" />
                Khám phá các bots
              </Link>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
