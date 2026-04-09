'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home, Users, Tv, Store, Gamepad2, Search, Menu, MessageCircle, Bell,
  Settings, HelpCircle, Moon, LogOut, User, Flag, Newspaper, Bookmark
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface DemoHeaderProps {
  user?: {
    id: string
    email?: string
    display_name?: string | null
    avatar_url?: string | null
  } | null
}

export function DemoHeader({ user }: DemoHeaderProps) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const centerNavItems = [
    { href: '/demo', icon: Home, label: 'Feed' },
    { href: '/demo/friends', icon: Users, label: 'Kết nối' },
    { href: '/demo/saved', icon: Bookmark, label: 'Đã lưu' },
    { href: '/demo/leaderboard', icon: Store, label: 'Bảng xếp hạng' },
    { href: '/demo/notifications', icon: Bell, label: 'Thông báo' },
  ]

  const menuItems = [
    { href: '/demo/profile', icon: User, label: 'Hồ sơ' },
    { href: '/demo/saved', icon: Bookmark, label: 'Đã lưu' },
    { href: '/demo/leaderboard', icon: Flag, label: 'Bảng xếp hạng' },
    { href: '/demo/notifications', icon: Bell, label: 'Thông báo' },
    { href: '/demo', icon: HelpCircle, label: 'Trợ giúp' },
  ]

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="sticky top-0 z-50 h-14 bg-card border-b border-border">
      <div className="h-full px-4 flex items-center justify-between">
        {/* Left - Logo & Search */}
        <div className="flex items-center gap-2 w-[320px]">
          <Link href="/demo" className="shrink-0">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden p-1.5">
              <img src="/logo.png" alt="CẦN & CÓ" className="w-full h-full object-contain" />
            </div>
          </Link>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm trên CẦN & CÓ"
              className="pl-10 bg-secondary border-none rounded-full h-10 text-sm"
            />
          </div>
        </div>

        {/* Center - Main Navigation */}
        <nav className="hidden lg:flex items-center justify-center flex-1 max-w-[600px] gap-2">
          {centerNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href === '/demo' && pathname === '/demo')
            return (
              <Link key={item.href} href={item.href} className="flex-1 max-w-[112px]">
                <div
                  className={cn(
                    'flex items-center justify-center h-12 rounded-lg transition-colors relative',
                    isActive
                      ? 'text-[#2D6A4F]'
                      : 'text-muted-foreground hover:bg-secondary'
                  )}
                >
                  <item.icon className="w-6 h-6" />
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#2D6A4F] rounded-t-full" />
                  )}
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Right - User Actions */}
        <div className="flex items-center gap-2 w-[320px] justify-end">
          {/* Menu Button with Dropdown */}
          <div className="relative" ref={menuRef}>
            <Button
              variant="secondary"
              size="icon"
              className="w-10 h-10 rounded-full bg-secondary hover:bg-secondary/80"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>

            {menuOpen && (
              <div className="absolute top-12 right-0 w-[280px] bg-card border border-border rounded-xl shadow-lg py-2 z-50">
                {user && (
                  <Link
                    href="/demo/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 border-b border-border mb-1"
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback className="bg-[#1B4D3E] text-white text-sm">
                        {user.display_name?.[0]?.toUpperCase() || 'D'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-[15px]">{user.display_name || 'Demo User'}</p>
                      <p className="text-xs text-muted-foreground">Xem trang cá nhân</p>
                    </div>
                  </Link>
                )}
                {menuItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <span className="text-[15px]">{item.label}</span>
                  </Link>
                ))}
                <div className="h-px bg-border my-1 mx-4" />
                <button className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-secondary/50 transition-colors text-left">
                  <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
                    <Moon className="w-5 h-5" />
                  </div>
                  <span className="text-[15px]">Chế độ tối</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-secondary/50 transition-colors text-left">
                  <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
                    <LogOut className="w-5 h-5" />
                  </div>
                  <span className="text-[15px]">Đăng xuất</span>
                </button>
              </div>
            )}
          </div>

          <Link href="/demo/messenger">
            <Button
              variant="secondary"
              size="icon"
              className="w-10 h-10 rounded-full bg-secondary hover:bg-secondary/80"
            >
              <MessageCircle className="w-5 h-5" />
            </Button>
          </Link>
          <Link href="/demo/notifications">
            <Button
              variant="secondary"
              size="icon"
              className="w-10 h-10 rounded-full bg-secondary hover:bg-secondary/80 relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </Button>
          </Link>

          {user && (
            <Link href="/demo/profile">
              <Avatar className="w-10 h-10 cursor-pointer">
                <AvatarImage src={user.avatar_url || undefined} />
                <AvatarFallback className="bg-[#1B4D3E] text-white text-sm font-medium">
                  {user.display_name?.[0]?.toUpperCase() || 'D'}
                </AvatarFallback>
              </Avatar>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
