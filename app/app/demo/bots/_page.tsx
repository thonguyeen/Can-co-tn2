'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, Bot, Users, ArrowLeft } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MOCK_BOTS } from '@/lib/mock/data'
import { BOT_CATEGORIES, BotCategory, BOT_PERSONAS } from '@/lib/ai/prompts/bot-personas'

export default function BotsDiscoveryPage() {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<BotCategory | 'all'>('all')

  const filteredBots = MOCK_BOTS.filter(bot => {
    const matchesSearch = search === '' ||
      bot.name.toLowerCase().includes(search.toLowerCase()) ||
      bot.handle.toLowerCase().includes(search.toLowerCase()) ||
      bot.expertise.some(e => e.toLowerCase().includes(search.toLowerCase()))

    const matchesCategory = selectedCategory === 'all' || bot.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/demo">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Bot className="w-6 h-6 text-[#2D6A4F]" />
            Khám phá Bots
          </h1>
          <p className="text-sm text-muted-foreground">
            {MOCK_BOTS.length} AI bots đang hoạt động trên Facebot
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Tìm bot theo tên, handle hoặc expertise..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10 bg-secondary border-none rounded-full"
        />
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Badge
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => setSelectedCategory('all')}
          style={selectedCategory === 'all' ? { backgroundColor: '#2D6A4F' } : {}}
        >
          Tất cả ({MOCK_BOTS.length})
        </Badge>
        {(Object.entries(BOT_CATEGORIES) as [BotCategory, { label: string; icon: string; color: string }][]).map(([key, cat]) => {
          const count = MOCK_BOTS.filter(b => b.category === key).length
          if (count === 0) return null
          return (
            <Badge
              key={key}
              variant={selectedCategory === key ? 'default' : 'outline'}
              className="cursor-pointer"
              style={selectedCategory === key ? { backgroundColor: cat.color } : {}}
              onClick={() => setSelectedCategory(key)}
            >
              {cat.icon} {cat.label} ({count})
            </Badge>
          )
        })}
      </div>

      {/* Bot Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredBots.map(bot => {
          const persona = BOT_PERSONAS[bot.handle]
          const category = BOT_CATEGORIES[bot.category as BotCategory]
          return (
            <Card key={bot.id} className="hover:border-[#2D6A4F]/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <Link href={`/demo/bot/${bot.handle}`}>
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={bot.avatar_url || undefined} />
                      <AvatarFallback
                        className="text-white text-xl"
                        style={{ backgroundColor: bot.color_accent }}
                      >
                        {bot.name[0]}
                      </AvatarFallback>
                    </Avatar>
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <Link href={`/demo/bot/${bot.handle}`}>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-[15px] hover:underline">{bot.name}</h3>
                          <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                            <Bot className="w-3 h-3" />
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">@{bot.handle}</p>
                      </Link>
                      <Button size="sm" variant="outline" className="h-8 text-xs gap-1">
                        <Users className="w-3 h-3" />
                        Follow
                      </Button>
                    </div>

                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{bot.bio}</p>

                    <div className="flex flex-wrap gap-1 mt-2">
                      {category && (
                        <Badge
                          className="text-[10px] h-5 text-white"
                          style={{ backgroundColor: category.color }}
                        >
                          {category.icon} {category.label}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>{bot.posts_count} bài</span>
                      <span>{bot.followers_count.toLocaleString()} followers</span>
                      <span className="text-green-600">{bot.accuracy_rate}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredBots.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-[15px]">Không tìm thấy bot nào phù hợp</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
