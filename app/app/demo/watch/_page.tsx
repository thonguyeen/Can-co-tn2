'use client'

import { useState } from 'react'
import { PlayCircle, ThumbsUp, MessageCircle, Share2, Bookmark, MoreHorizontal, Search, Eye } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type Tab = 'foryou' | 'live' | 'following' | 'saved'

const videos = [
  { id: '1', title: 'Hướng dẫn deploy Next.js 15 lên Vercel trong 5 phút', channel: 'Code Vui', channelColor: '#2D6A4F', views: '12K', time: '3 giờ trước', duration: '5:23', likes: 234, comments: 45, color: '#1B4D3E' },
  { id: '2', title: 'Review MacBook Pro M4 - Có đáng upgrade?', channel: 'Tech Review VN', channelColor: '#1B4D3E', views: '45K', time: '6 giờ trước', duration: '12:45', likes: 890, comments: 156, color: '#2D6A4F' },
  { id: '3', title: 'Ẩm thực đường phố Sài Gòn - Top 10 món phải thử', channel: 'Sài Gòn Ăn Gì', channelColor: '#40916C', views: '89K', time: '1 ngày trước', duration: '15:30', likes: 2100, comments: 342, color: '#40916C' },
  { id: '4', title: 'Tutorial: Tạo AI Chatbot với LangChain và GPT-4', channel: 'AI Dễ Hiểu', channelColor: '#52B788', views: '23K', time: '2 ngày trước', duration: '28:10', likes: 567, comments: 89, color: '#52B788' },
  { id: '5', title: 'Workout tại nhà 30 phút không cần dụng cụ', channel: 'Fit Vietnam', channelColor: '#74C69D', views: '67K', time: '3 ngày trước', duration: '30:00', likes: 1500, comments: 210, color: '#74C69D' },
  { id: '6', title: '10 tips tăng năng suất làm việc cho developer', channel: 'Dev Life', channelColor: '#2D6A4F', views: '34K', time: '4 ngày trước', duration: '8:45', likes: 780, comments: 123, color: '#1B4D3E' },
  { id: '7', title: 'Du lịch Phú Quốc 2026 - Kinh nghiệm từ A-Z', channel: 'Travel VLog', channelColor: '#1B4D3E', views: '56K', time: '5 ngày trước', duration: '20:15', likes: 1200, comments: 267, color: '#2D6A4F' },
  { id: '8', title: 'Giải thích Blockchain đơn giản nhất có thể', channel: 'Crypto Easy', channelColor: '#40916C', views: '28K', time: '1 tuần trước', duration: '10:30', likes: 650, comments: 98, color: '#40916C' },
]

const liveVideos = [
  { id: 'l1', title: 'Live: Coding session - Build SaaS from scratch', channel: 'Code Vui', channelColor: '#2D6A4F', viewers: 234, color: '#1B4D3E' },
  { id: 'l2', title: 'Live: Q&A về career path trong tech', channel: 'Tech Career VN', channelColor: '#40916C', viewers: 567, color: '#40916C' },
]

export default function WatchPage() {
  const [activeTab, setActiveTab] = useState<Tab>('foryou')
  const [searchQuery, setSearchQuery] = useState('')
  const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set())
  const [savedVideos, setSavedVideos] = useState<Set<string>>(new Set())

  const tabs = [
    { id: 'foryou' as Tab, label: 'Dành cho bạn' },
    { id: 'live' as Tab, label: 'Trực tiếp' },
    { id: 'following' as Tab, label: 'Đang theo dõi' },
    { id: 'saved' as Tab, label: 'Đã lưu' },
  ]

  const filteredVideos = videos.filter(v => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return v.title.toLowerCase().includes(q) || v.channel.toLowerCase().includes(q)
  })

  return (
    <div className="max-w-[900px] mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-[#2D6A4F] flex items-center justify-center">
          <PlayCircle className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-2xl font-bold">Video</h1>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Tìm video..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap',
              activeTab === tab.id
                ? 'bg-[#2D6A4F] text-white'
                : 'bg-secondary hover:bg-secondary/80'
            )}
          >
            {tab.label}
            {tab.id === 'live' && liveVideos.length > 0 && (
              <span className="ml-1.5 w-2 h-2 rounded-full bg-red-500 inline-block" />
            )}
          </button>
        ))}
      </div>

      {/* Tab: For You */}
      {activeTab === 'foryou' && (
        <div className="space-y-4">
          {filteredVideos.map((video) => (
            <Card key={video.id} className="overflow-hidden hover:bg-secondary/50 transition-colors cursor-pointer">
              <CardContent className="p-0">
                {/* Video Thumbnail */}
                <div className="relative aspect-video flex items-center justify-center" style={{ backgroundColor: video.color }}>
                  <PlayCircle className="w-16 h-16 text-white/80" />
                  <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                    {video.duration}
                  </span>
                </div>
                {/* Video Info */}
                <div className="p-4">
                  <div className="flex gap-3">
                    <Avatar className="w-10 h-10 shrink-0">
                      <AvatarFallback className="text-white text-sm" style={{ backgroundColor: video.channelColor }}>
                        {video.channel[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[15px] line-clamp-2">{video.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {video.channel} · {video.views} lượt xem · {video.time}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" className="w-8 h-8 shrink-0">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn('gap-1', likedVideos.has(video.id) && 'text-[#2D6A4F]')}
                      onClick={() => setLikedVideos(prev => {
                        const next = new Set(prev)
                        if (next.has(video.id)) next.delete(video.id)
                        else next.add(video.id)
                        return next
                      })}
                    >
                      <ThumbsUp className={cn('w-4 h-4', likedVideos.has(video.id) && 'fill-[#2D6A4F]')} />
                      {video.likes}
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-1">
                      <MessageCircle className="w-4 h-4" />
                      {video.comments}
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-1">
                      <Share2 className="w-4 h-4" />
                      Chia sẻ
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn('gap-1 ml-auto', savedVideos.has(video.id) && 'text-[#2D6A4F]')}
                      onClick={() => setSavedVideos(prev => {
                        const next = new Set(prev)
                        if (next.has(video.id)) next.delete(video.id)
                        else next.add(video.id)
                        return next
                      })}
                    >
                      <Bookmark className={cn('w-4 h-4', savedVideos.has(video.id) && 'fill-[#2D6A4F]')} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Tab: Live */}
      {activeTab === 'live' && (
        <div className="space-y-4">
          {liveVideos.map((video) => (
            <Card key={video.id} className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
              <div className="relative aspect-video flex items-center justify-center" style={{ backgroundColor: video.color }}>
                <PlayCircle className="w-16 h-16 text-white/80" />
                <span className="absolute top-3 left-3 bg-red-600 text-white text-xs px-2 py-1 rounded font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  TRỰC TIẾP
                </span>
                <span className="absolute bottom-3 left-3 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {video.viewers} người xem
                </span>
              </div>
              <CardContent className="p-4 flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="text-white" style={{ backgroundColor: video.channelColor }}>
                    {video.channel[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-[15px]">{video.title}</p>
                  <p className="text-sm text-muted-foreground">{video.channel}</p>
                </div>
                <Button className="bg-red-600 hover:bg-red-700">Xem ngay</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Tab: Following */}
      {activeTab === 'following' && (
        <div className="space-y-4">
          {videos.slice(0, 4).map((video) => (
            <Card key={video.id} className="overflow-hidden hover:bg-secondary/50 transition-colors cursor-pointer">
              <CardContent className="p-4 flex gap-4">
                <div className="relative w-40 aspect-video rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: video.color }}>
                  <PlayCircle className="w-10 h-10 text-white/80" />
                  <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1 py-0.5 rounded">
                    {video.duration}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[15px] line-clamp-2">{video.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">{video.channel}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{video.views} lượt xem · {video.time}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Tab: Saved */}
      {activeTab === 'saved' && (
        <div>
          {savedVideos.size === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <Bookmark className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                <p>Bạn chưa lưu video nào</p>
                <p className="text-sm mt-1">Nhấn biểu tượng bookmark để lưu video</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {videos.filter(v => savedVideos.has(v.id)).map((video) => (
                <Card key={video.id} className="hover:bg-secondary/50 transition-colors cursor-pointer">
                  <CardContent className="p-4 flex gap-4">
                    <div className="relative w-32 aspect-video rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: video.color }}>
                      <PlayCircle className="w-8 h-8 text-white/80" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{video.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{video.channel} · {video.views} lượt xem</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
