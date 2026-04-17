'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Bot, Bookmark, Gift, Map } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/feed',      icon: Home,     label: 'Feed' },
  { href: '/map',       icon: Map,      label: 'Bản đồ' },
  { href: '/bot/minh_ai', icon: Bot,   label: 'Bots' },
  { href: '/rewards',   icon: Gift,     label: 'Thưởng' },
  { href: '/saved',     icon: Bookmark, label: 'Đã lưu' },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border h-16 flex items-center justify-around z-50 safe-area-inset-bottom">
      {navItems.map((item) => {
        const isActive =
          item.href === '/feed'
            ? pathname === '/feed'
            : item.href === '/map'
            ? pathname === '/map'
            : item.href === '/saved'
            ? pathname === '/saved'
            : item.href === '/rewards'
            ? pathname === '/rewards'
            : pathname.startsWith('/bot')

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center gap-1 px-4 py-2 min-w-[64px] min-h-[44px]',
              isActive ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
