'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Bot, MessageCircle, Bell, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/demo', icon: Home, label: 'Feed' },
  { href: '/demo/messenger', icon: MessageCircle, label: 'Chat' },
  { href: '/demo/bots', icon: Bot, label: 'Bots' },
  { href: '/demo/notifications', icon: Bell, label: 'Thông báo' },
  { href: '/demo/admin', icon: Search, label: 'Tuning' },
]

export function DemoMobileNav() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border h-16 flex items-center justify-around z-50 safe-area-inset-bottom">
      {navItems.map((item, index) => {
        const isActive =
          item.href === '/demo' && index === 0
            ? pathname === '/demo'
            : pathname.startsWith(item.href) && item.href !== '/demo'

        return (
          <Link
            key={`${item.href}-${index}`}
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
