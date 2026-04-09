'use client'

import { useState } from 'react'
import { Flag, ThumbsUp, Search, MoreHorizontal, Bell, BellOff } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type Tab = 'liked' | 'invites' | 'discover'

const likedPages = [
  { id: '1', name: 'AI Vietnam Community', category: 'Công nghệ', followers: '12.5K', color: '#2D6A4F', description: 'Cộng đồng AI lớn nhất Việt Nam' },
  { id: '2', name: 'Startup Saigon', category: 'Kinh doanh', followers: '8.2K', color: '#1B4D3E', description: 'Chia sẻ kinh nghiệm khởi nghiệp tại Sài Gòn' },
  { id: '3', name: 'Facebot Official', category: 'Công nghệ', followers: '45K', color: '#40916C', description: 'Trang chính thức của Facebot' },
  { id: '4', name: 'Code Daily Vietnam', category: 'Giáo dục', followers: '23K', color: '#52B788', description: 'Học lập trình mỗi ngày' },
  { id: '5', name: 'Design Inspiration VN', category: 'Thiết kế', followers: '15.8K', color: '#74C69D', description: 'Cảm hứng thiết kế UI/UX' },
  { id: '6', name: 'Tech News Asia', category: 'Tin tức', followers: '67K', color: '#2D6A4F', description: 'Tin tức công nghệ Châu Á' },
]

const invitedPages = [
  { id: 'i1', name: 'React Developers VN', category: 'Công nghệ', followers: '5.6K', color: '#1B4D3E', invitedBy: 'Nguyễn Minh Tuấn' },
  { id: 'i2', name: 'Hà Nội Food Tour', category: 'Ẩm thực', followers: '18K', color: '#40916C', invitedBy: 'Trần Thị Hương' },
]

const discoverPages = [
  { id: 'd1', name: 'Machine Learning Hub', category: 'Công nghệ', followers: '9.1K', color: '#2D6A4F', reason: 'Phổ biến trong lĩnh vực của bạn' },
  { id: 'd2', name: 'Digital Marketing VN', category: 'Marketing', followers: '21K', color: '#52B788', reason: 'Bạn bè thích trang này' },
  { id: 'd3', name: 'Saigon Runners', category: 'Thể thao', followers: '7.3K', color: '#74C69D', reason: 'Gần vị trí của bạn' },
  { id: 'd4', name: 'Vietnam Photography', category: 'Nhiếp ảnh', followers: '34K', color: '#1B4D3E', reason: 'Bạn bè thích trang này' },
]

export default function PagesPage() {
  const [activeTab, setActiveTab] = useState<Tab>('liked')
  const [searchQuery, setSearchQuery] = useState('')
  const [notifications, setNotifications] = useState<Set<string>>(new Set(['1', '3']))
  const [acceptedInvites, setAcceptedInvites] = useState<Set<string>>(new Set())
  const [likedDiscover, setLikedDiscover] = useState<Set<string>>(new Set())

  const tabs = [
    { id: 'liked' as Tab, label: 'Đã thích' },
    { id: 'invites' as Tab, label: 'Lời mời' },
    { id: 'discover' as Tab, label: 'Khám phá' },
  ]

  const filteredPages = likedPages.filter(page => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return page.name.toLowerCase().includes(q) || page.category.toLowerCase().includes(q)
  })

  const toggleNotification = (id: string) => {
    setNotifications(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="max-w-[900px] mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-[#2D6A4F] flex items-center justify-center">
          <Flag className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-2xl font-bold">Trang</h1>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-4 py-2 rounded-full text-[15px] font-medium transition-colors',
              activeTab === tab.id
                ? 'bg-[#2D6A4F] text-white'
                : 'bg-secondary hover:bg-secondary/80'
            )}
          >
            {tab.label}
            {tab.id === 'invites' && invitedPages.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-white/20">
                {invitedPages.filter(p => !acceptedInvites.has(p.id)).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab: Liked Pages */}
      {activeTab === 'liked' && (
        <div>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Tìm trang đã thích..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="space-y-3">
            {filteredPages.map((page) => (
              <Card key={page.id} className="hover:bg-secondary/50 transition-colors">
                <CardContent className="p-4 flex items-center gap-4">
                  <Avatar className="w-14 h-14">
                    <AvatarFallback className="text-white font-bold text-lg" style={{ backgroundColor: page.color }}>
                      {page.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[15px]">{page.name}</p>
                    <p className="text-sm text-muted-foreground">{page.category} · {page.followers} người theo dõi</p>
                    <p className="text-sm text-muted-foreground truncate">{page.description}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-9 h-9"
                      onClick={() => toggleNotification(page.id)}
                    >
                      {notifications.has(page.id) ? (
                        <Bell className="w-4 h-4 text-[#2D6A4F]" />
                      ) : (
                        <BellOff className="w-4 h-4 text-muted-foreground" />
                      )}
                    </Button>
                    <Button variant="ghost" size="icon" className="w-9 h-9">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Invites */}
      {activeTab === 'invites' && (
        <div className="space-y-3">
          {invitedPages.filter(p => !acceptedInvites.has(p.id)).length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                Không có lời mời nào
              </CardContent>
            </Card>
          ) : (
            invitedPages.filter(p => !acceptedInvites.has(p.id)).map((page) => (
              <Card key={page.id}>
                <CardContent className="p-4 flex items-center gap-4">
                  <Avatar className="w-14 h-14">
                    <AvatarFallback className="text-white font-bold text-lg" style={{ backgroundColor: page.color }}>
                      {page.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[15px]">{page.name}</p>
                    <p className="text-sm text-muted-foreground">{page.category} · {page.followers} người theo dõi</p>
                    <p className="text-xs text-muted-foreground">{page.invitedBy} đã mời bạn thích trang này</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-[#2D6A4F] hover:bg-[#1B4D3E] gap-1"
                      onClick={() => setAcceptedInvites(prev => new Set(prev).add(page.id))}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      Thích
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setAcceptedInvites(prev => new Set(prev).add(page.id))}
                    >
                      Bỏ qua
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Tab: Discover */}
      {activeTab === 'discover' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {discoverPages.map((page) => (
            <Card key={page.id} className="overflow-hidden">
              <div className="h-20" style={{ backgroundColor: page.color, opacity: 0.2 }} />
              <CardContent className="p-4 -mt-8">
                <Avatar className="w-14 h-14 border-4 border-card">
                  <AvatarFallback className="text-white font-bold text-lg" style={{ backgroundColor: page.color }}>
                    {page.name[0]}
                  </AvatarFallback>
                </Avatar>
                <p className="font-semibold text-[15px] mt-2">{page.name}</p>
                <p className="text-sm text-muted-foreground">{page.category} · {page.followers} người theo dõi</p>
                <p className="text-xs text-muted-foreground mt-1">{page.reason}</p>
                <Button
                  size="sm"
                  className={cn(
                    'w-full mt-3 gap-1',
                    likedDiscover.has(page.id)
                      ? 'bg-secondary text-foreground hover:bg-secondary/80'
                      : 'bg-[#2D6A4F] hover:bg-[#1B4D3E]'
                  )}
                  onClick={() => setLikedDiscover(prev => {
                    const next = new Set(prev)
                    if (next.has(page.id)) next.delete(page.id)
                    else next.add(page.id)
                    return next
                  })}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  {likedDiscover.has(page.id) ? 'Đã thích' : 'Thích trang'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
