'use client'

import { useState } from 'react'
import { Gamepad2, Play, Star, Users, Trophy, Clock, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type Tab = 'discover' | 'playing' | 'saved'

const games = [
  { id: '1', title: 'Quiz Việt Nam', category: 'Trí tuệ', players: '12.5K', rating: 4.8, color: '#2D6A4F', description: 'Trả lời câu hỏi về lịch sử và văn hóa Việt Nam' },
  { id: '2', title: 'Nông Trại Vui Vẻ', category: 'Mô phỏng', players: '45K', rating: 4.5, color: '#1B4D3E', description: 'Xây dựng và quản lý nông trại của riêng bạn' },
  { id: '3', title: 'Đua Xe 3D', category: 'Đua xe', players: '23K', rating: 4.2, color: '#40916C', description: 'Đua xe tốc độ cao trên đường phố Việt Nam' },
  { id: '4', title: 'Cờ Tướng Online', category: 'Bàn cờ', players: '67K', rating: 4.9, color: '#52B788', description: 'Chơi cờ tướng với người chơi trên toàn quốc' },
  { id: '5', title: 'Bắn Bóng Màu', category: 'Giải đố', players: '89K', rating: 4.3, color: '#74C69D', description: 'Bắn và kết hợp bóng cùng màu để ghi điểm' },
  { id: '6', title: 'Xếp Hình Tetris', category: 'Giải đố', players: '34K', rating: 4.6, color: '#2D6A4F', description: 'Phiên bản hiện đại của game xếp hình kinh điển' },
  { id: '7', title: 'Đế Chế Việt', category: 'Chiến thuật', players: '18K', rating: 4.7, color: '#1B4D3E', description: 'Xây dựng đế chế và chinh phục lãnh thổ' },
  { id: '8', title: 'Thời Trang Show', category: 'Mô phỏng', players: '28K', rating: 4.1, color: '#40916C', description: 'Thiết kế trang phục và tham gia fashion show' },
]

const playingGames = [
  { id: 'p1', title: 'Cờ Tướng Online', lastPlayed: '30 phút trước', level: 25, color: '#52B788' },
  { id: 'p2', title: 'Quiz Việt Nam', lastPlayed: '2 giờ trước', level: 18, color: '#2D6A4F' },
  { id: 'p3', title: 'Bắn Bóng Màu', lastPlayed: '1 ngày trước', level: 42, color: '#74C69D' },
]

export default function GamingPage() {
  const [activeTab, setActiveTab] = useState<Tab>('discover')
  const [savedGames, setSavedGames] = useState<Set<string>>(new Set())

  const tabs = [
    { id: 'discover' as Tab, label: 'Khám phá', icon: TrendingUp },
    { id: 'playing' as Tab, label: 'Đang chơi', icon: Play },
    { id: 'saved' as Tab, label: 'Đã lưu', icon: Star },
  ]

  const toggleSave = (id: string) => {
    setSavedGames(prev => {
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
          <Gamepad2 className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-2xl font-bold">Chơi game</h1>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-full text-[15px] font-medium transition-colors',
              activeTab === tab.id
                ? 'bg-[#2D6A4F] text-white'
                : 'bg-secondary hover:bg-secondary/80'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Discover */}
      {activeTab === 'discover' && (
        <div>
          {/* Featured */}
          <Card className="mb-6 overflow-hidden">
            <div className="h-40 bg-gradient-to-r from-[#1B4D3E] to-[#2D6A4F] flex items-center justify-center">
              <div className="text-center text-white">
                <Trophy className="w-12 h-12 mx-auto mb-2" />
                <p className="text-xl font-bold">Giải đấu tuần này</p>
                <p className="text-sm opacity-80">Cờ Tướng Online - Giải Xuân 2026</p>
              </div>
            </div>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold">Giải thưởng: 5.000.000₫</p>
                <p className="text-sm text-muted-foreground">256 người tham gia · Còn 3 ngày</p>
              </div>
              <Button className="bg-[#2D6A4F] hover:bg-[#1B4D3E]">Tham gia</Button>
            </CardContent>
          </Card>

          {/* Games Grid */}
          <h2 className="font-semibold text-lg mb-4">Game phổ biến</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {games.map((game) => (
              <Card key={game.id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                <div className="aspect-square flex items-center justify-center" style={{ backgroundColor: game.color }}>
                  <Gamepad2 className="w-12 h-12 text-white/60" />
                </div>
                <CardContent className="p-3">
                  <p className="font-semibold text-sm line-clamp-1">{game.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{game.category}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                      <span className="text-xs">{game.rating}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="w-3 h-3" />
                      <span>{game.players}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 mt-2">
                    <Button size="sm" className="flex-1 h-7 text-xs bg-[#2D6A4F] hover:bg-[#1B4D3E]">
                      <Play className="w-3 h-3 mr-1" />
                      Chơi
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-7 w-7 p-0"
                      onClick={(e) => { e.stopPropagation(); toggleSave(game.id) }}
                    >
                      <Star className={cn('w-3 h-3', savedGames.has(game.id) && 'fill-yellow-500 text-yellow-500')} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Playing */}
      {activeTab === 'playing' && (
        <div className="space-y-3">
          {playingGames.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                Bạn chưa chơi game nào
              </CardContent>
            </Card>
          ) : (
            playingGames.map((game) => (
              <Card key={game.id} className="hover:bg-secondary/50 transition-colors">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: game.color }}>
                    <Gamepad2 className="w-8 h-8 text-white/60" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[15px]">{game.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Trophy className="w-3.5 h-3.5" />
                        Level {game.level}
                      </span>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {game.lastPlayed}
                      </span>
                    </div>
                  </div>
                  <Button className="bg-[#2D6A4F] hover:bg-[#1B4D3E] gap-1">
                    <Play className="w-4 h-4" />
                    Tiếp tục
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Tab: Saved */}
      {activeTab === 'saved' && (
        <div>
          {savedGames.size === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <Star className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                <p>Bạn chưa lưu game nào</p>
                <p className="text-sm mt-1">Nhấn biểu tượng ngôi sao để lưu game yêu thích</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {games.filter(g => savedGames.has(g.id)).map((game) => (
                <Card key={game.id} className="overflow-hidden cursor-pointer">
                  <div className="aspect-video flex items-center justify-center" style={{ backgroundColor: game.color }}>
                    <Gamepad2 className="w-10 h-10 text-white/60" />
                  </div>
                  <CardContent className="p-3">
                    <p className="font-semibold text-sm">{game.title}</p>
                    <p className="text-xs text-muted-foreground">{game.category}</p>
                    <Button size="sm" className="w-full mt-2 h-7 text-xs bg-[#2D6A4F] hover:bg-[#1B4D3E]">
                      <Play className="w-3 h-3 mr-1" />
                      Chơi ngay
                    </Button>
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
