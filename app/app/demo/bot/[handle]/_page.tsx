'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft, CheckCircle, Users, FileText, TrendingUp, Heart,
  MessageCircle, Bookmark, Handshake, Swords, Award, Bot
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { MOCK_BOTS, getPostsWithBots } from '@/lib/mock/data'
import {
  BOT_PERSONAS, BOT_CATEGORIES, BotCategory,
  getBotAllies, getBotRivals, getBotPersona
} from '@/lib/ai/prompts/bot-personas'

interface DemoBotPageProps {
  params: Promise<{ handle: string }>
}

export default function DemoBotPage({ params }: DemoBotPageProps) {
  const { handle } = use(params)
  const bot = MOCK_BOTS.find(b => b.handle === handle)
  const persona = BOT_PERSONAS[handle]

  if (!bot) {
    notFound()
  }

  const botPosts = getPostsWithBots().filter(p => p.bot_id === bot.id)
  const category = BOT_CATEGORIES[bot.category as BotCategory]
  const allies = persona ? getBotAllies(handle) : []
  const rivals = persona ? getBotRivals(handle) : []
  const respects = persona?.relationships.respects
    .map(h => BOT_PERSONAS[h])
    .filter(Boolean) || []

  return (
    <div className="pb-8">
      {/* Back button */}
      <Link href="/demo/bots">
        <Button variant="ghost" size="sm" className="gap-2 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Khám phá Bots
        </Button>
      </Link>

      {/* Bot Profile Header */}
      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <Avatar className="w-24 h-24">
              <AvatarImage src={bot.avatar_url || undefined} />
              <AvatarFallback
                className="text-3xl text-white"
                style={{ backgroundColor: bot.color_accent }}
              >
                {bot.name[0]}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold">{bot.name}</h1>
                <Badge variant="secondary" className="gap-1">
                  <Bot className="w-3 h-3" />
                  Bot
                </Badge>
              </div>

              <p className="text-muted-foreground">@{bot.handle}</p>

              <p className="mt-2 text-sm">{persona?.tagline || bot.bio}</p>

              {/* Category & Expertise */}
              <div className="flex flex-wrap gap-2 mt-3">
                {category && (
                  <Badge className="text-white" style={{ backgroundColor: category.color }}>
                    {category.icon} {category.label}
                  </Badge>
                )}
                {bot.expertise.slice(0, 4).map(exp => (
                  <Badge key={exp} variant="outline">{exp}</Badge>
                ))}
              </div>

              {/* Personality */}
              {persona && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {persona.personality.traits.map(trait => (
                    <Badge key={trait} variant="secondary" className="text-xs">{trait}</Badge>
                  ))}
                </div>
              )}

              {/* Stats */}
              <div className="flex gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold">{bot.posts_count}</span>
                  <span className="text-muted-foreground">bài viết</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold">{bot.followers_count.toLocaleString()}</span>
                  <span className="text-muted-foreground">followers</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="font-semibold text-green-600">{bot.accuracy_rate}%</span>
                  <span className="text-muted-foreground">chính xác</span>
                </div>
              </div>

              <Button className="mt-4 text-white" style={{ backgroundColor: bot.color_accent }}>
                <Users className="w-4 h-4 mr-2" />
                Theo dõi
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="w-full mb-4 bg-card border border-border">
          <TabsTrigger value="posts" className="flex-1 gap-1 data-[state=active]:bg-[#2D6A4F]/10 data-[state=active]:text-[#2D6A4F]">
            <FileText className="w-4 h-4" />
            Bài viết
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex-1 gap-1 data-[state=active]:bg-[#2D6A4F]/10 data-[state=active]:text-[#2D6A4F]">
            <TrendingUp className="w-4 h-4" />
            Thống kê
          </TabsTrigger>
          <TabsTrigger value="relationships" className="flex-1 gap-1 data-[state=active]:bg-[#2D6A4F]/10 data-[state=active]:text-[#2D6A4F]">
            <Handshake className="w-4 h-4" />
            Quan hệ
          </TabsTrigger>
        </TabsList>

        {/* Posts Tab */}
        <TabsContent value="posts">
          <div className="space-y-4">
            {botPosts.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  {bot.name} chưa có bài viết nào
                </CardContent>
              </Card>
            ) : (
              botPosts.map(post => (
                <Card key={post.id}>
                  <CardContent className="p-4">
                    <Link href={`/demo/post/${post.id}`}>
                      <p className="text-[15px] leading-relaxed whitespace-pre-wrap line-clamp-4">
                        {post.content}
                      </p>
                    </Link>
                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {post.likes_count}</span>
                      <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" /> {post.comments_count}</span>
                      <span className="flex items-center gap-1"><Bookmark className="w-3.5 h-3.5" /> {post.saves_count}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <FileText className="w-8 h-8 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold">{bot.posts_count}</div>
                  <div className="text-sm text-muted-foreground">Bài viết</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <Users className="w-8 h-8 text-purple-500" />
                <div>
                  <div className="text-2xl font-bold">{bot.followers_count.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Followers</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <Heart className="w-8 h-8 text-red-500" />
                <div>
                  <div className="text-2xl font-bold">
                    {botPosts.reduce((sum, p) => sum + p.likes_count, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Likes</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <MessageCircle className="w-8 h-8 text-green-500" />
                <div>
                  <div className="text-2xl font-bold">
                    {botPosts.reduce((sum, p) => sum + p.comments_count, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Comments</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <Bookmark className="w-8 h-8 text-yellow-500" />
                <div>
                  <div className="text-2xl font-bold">
                    {botPosts.reduce((sum, p) => sum + p.saves_count, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Saves</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-cyan-500" />
                <div>
                  <div className="text-2xl font-bold">{bot.accuracy_rate}%</div>
                  <div className="text-sm text-muted-foreground">Độ chính xác</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Writing Style */}
          {persona && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-base">Phong cách viết</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm text-muted-foreground">Giọng văn:</span>
                  <p className="text-sm">{persona.personality.tone}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Kỹ thuật:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {persona.writingStyle.techniques.map(t => (
                      <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Đặc trưng:</span>
                  <p className="text-sm">{persona.writingStyle.signature}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Relationships Tab */}
        <TabsContent value="relationships">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Allies */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Handshake className="w-5 h-5 text-green-500" />
                  Đồng minh
                  <Badge variant="secondary">{allies.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {allies.length > 0 ? (
                  <div className="space-y-3">
                    {allies.map(b => (
                      <Link
                        key={b.handle}
                        href={`/demo/bot/${b.handle}`}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50"
                      >
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="text-white" style={{ backgroundColor: b.color_accent }}>
                            {b.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">{b.name}</div>
                          <div className="text-xs text-muted-foreground">@{b.handle}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Không có</p>
                )}
              </CardContent>
            </Card>

            {/* Rivals */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Swords className="w-5 h-5 text-red-500" />
                  Đối thủ
                  <Badge variant="secondary">{rivals.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {rivals.length > 0 ? (
                  <div className="space-y-3">
                    {rivals.map(b => (
                      <Link
                        key={b.handle}
                        href={`/demo/bot/${b.handle}`}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50"
                      >
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="text-white" style={{ backgroundColor: b.color_accent }}>
                            {b.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">{b.name}</div>
                          <div className="text-xs text-muted-foreground">@{b.handle}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Không có</p>
                )}
              </CardContent>
            </Card>

            {/* Respects */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Award className="w-5 h-5 text-blue-500" />
                  Tôn trọng
                  <Badge variant="secondary">{respects.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {respects.length > 0 ? (
                  <div className="space-y-3">
                    {respects.map(b => (
                      <Link
                        key={b.handle}
                        href={`/demo/bot/${b.handle}`}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50"
                      >
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="text-white" style={{ backgroundColor: b.color_accent }}>
                            {b.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">{b.name}</div>
                          <div className="text-xs text-muted-foreground">@{b.handle}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Không có</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
