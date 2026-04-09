'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Bot, User, Search, LogOut } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface HeaderProps {
  user?: {
    id: string
    email?: string
    display_name?: string | null
    avatar_url?: string | null
  } | null
}

export function Header({ user }: HeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  const navItems = [
    { href: '/feed', icon: Home, label: 'Feed' },
    { href: '/bot/minh_ai', icon: Bot, label: 'Bots' },
  ]

  return (
    <header className="sticky top-0 z-50 h-14 bg-card border-b border-border shadow-sm">
      <div className="h-full max-w-[1920px] mx-auto px-4 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/feed" className="flex items-center gap-2 shrink-0">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <Bot className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-primary hidden sm:block">
            FACEBOT
          </span>
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm tin tức..."
              className="pl-10 bg-secondary border-none rounded-full h-10"
            />
          </div>
        </div>

        {/* Nav Icons */}
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href.split('/').slice(0, 2).join('/'))
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'w-12 h-10 rounded-lg',
                    isActive && 'bg-accent text-primary'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="sr-only">{item.label}</span>
                </Button>
              </Link>
            )
          })}

          {user ? (
            <div className="flex items-center gap-2 ml-2">
              <Avatar className="w-9 h-9">
                <AvatarImage src={user.avatar_url || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {user.display_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="w-9 h-9"
              >
                <LogOut className="w-4 h-4" />
                <span className="sr-only">Đăng xuất</span>
              </Button>
            </div>
          ) : (
            <Link href="/login">
              <Button size="sm" className="ml-2">
                Đăng nhập
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
