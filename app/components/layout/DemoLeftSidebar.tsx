'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Users, Clock, Bookmark, Flag, Calendar, ChevronDown,
  Newspaper, ShoppingBag, Gamepad2, PlayCircle, Bot, Trophy
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface DemoLeftSidebarProps {
  user?: {
    id: string
    email?: string
    display_name?: string | null
    avatar_url?: string | null
  } | null
}

const menuItems = [
  { href: '/demo/friends', icon: Users, label: 'Kết nối' },
  { href: '/demo/messenger', icon: Bot, label: 'Tin nhắn' },
  { href: '/demo/leaderboard', icon: Trophy, label: 'Bảng xếp hạng' },
  { href: '/demo/notifications', icon: Clock, label: 'Thông báo' },
  { href: '/demo/saved', icon: Bookmark, label: 'Đã lưu' },
  { href: '/demo/profile', icon: Flag, label: 'Hồ sơ' },
]

const shortcuts = [
  { id: '1', name: 'BĐS Quận 7', color: '#2D6A4F' },
  { id: '2', name: 'BĐS Thủ Đức', color: '#40916C' },
  { id: '3', name: 'BĐS Gò Vấp', color: '#52B788' },
  { id: '4', name: 'Mặt bằng HCM', color: '#74C69D' },
]

export function DemoLeftSidebar({ user }: DemoLeftSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:block w-[360px] shrink-0 sticky top-14 h-[calc(100vh-56px)] overflow-y-auto overflow-x-hidden sidebar-scroll pl-2">
      <div className="py-2 px-1">
        {/* User Profile */}
        {user && (
          <Link
            href="/demo/profile"
            className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-secondary/50 transition-colors"
          >
            <Avatar className="w-9 h-9">
              <AvatarImage src={user.avatar_url || undefined} />
              <AvatarFallback className="bg-[#1B4D3E] text-white text-sm">
                {user.display_name?.[0]?.toUpperCase() || 'D'}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium text-[15px]">{user.display_name || 'Demo User'}</span>
          </Link>
        )}

        {/* Menu Items */}
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-2 py-2 rounded-lg transition-colors',
                isActive
                  ? 'bg-secondary/70 text-[#2D6A4F]'
                  : 'hover:bg-secondary/50 text-foreground'
              )}
            >
              <div className={cn(
                'w-9 h-9 rounded-full flex items-center justify-center',
                isActive ? 'bg-[#1B4D3E] text-white' : 'bg-secondary/80'
              )}>
                <item.icon className="w-5 h-5" />
              </div>
              <span className="text-[15px]">{item.label}</span>
            </Link>
          )
        })}

        <Button
          variant="ghost"
          className="w-full justify-start gap-3 px-2 py-2 h-auto font-normal text-foreground hover:bg-secondary/50"
        >
          <div className="w-9 h-9 rounded-full bg-secondary/80 flex items-center justify-center">
            <ChevronDown className="w-5 h-5" />
          </div>
          <span className="text-[15px]">Xem thêm</span>
        </Button>

        {/* Divider */}
        <div className="h-px bg-border/50 my-3 mx-2" />

        {/* Shortcuts */}
        <h3 className="text-muted-foreground text-[17px] font-semibold mb-2 px-2">Lối tắt của bạn</h3>
        {shortcuts.map((shortcut) => (
          <Link
            key={shortcut.id}
            href={`/demo/group/${shortcut.id}`}
            className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-secondary/50 transition-colors"
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-medium text-sm"
              style={{ backgroundColor: shortcut.color }}
            >
              {shortcut.name[0]}
            </div>
            <span className="text-[15px] truncate">{shortcut.name}</span>
          </Link>
        ))}

        {/* Footer */}
        <div className="mt-4 px-2 text-[13px] text-muted-foreground/70 leading-relaxed">
          <span className="hover:underline cursor-pointer">Quyền riêng tư</span>
          <span className="mx-1">·</span>
          <span className="hover:underline cursor-pointer">Điều khoản</span>
          <span className="mx-1">·</span>
          <span className="hover:underline cursor-pointer">Quảng cáo</span>
          <span className="mx-1">·</span>
          <span className="hover:underline cursor-pointer">Cookie</span>
          <span className="mx-1">·</span>
          <span className="hover:underline cursor-pointer">Xem thêm</span>
          <span className="mx-1">·</span>
          <span>CẦN & CÓ © 2026</span>
        </div>
      </div>
    </aside>
  )
}
