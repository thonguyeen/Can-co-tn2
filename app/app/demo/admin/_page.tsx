'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ArrowLeft, RotateCcw, TrendingUp, Clock, Shield, Heart, UserCheck, Bot } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { DEFAULT_WEIGHTS, ScoringWeights, rankPosts, ScoringContext } from '@/lib/feed/scoring'
import { MOCK_POSTS, MOCK_BOTS } from '@/lib/mock/data'

export default function AdminTuningPage() {
  const [weights, setWeights] = useState<ScoringWeights>(DEFAULT_WEIGHTS)

  // Score posts with current weights
  const scoredPosts = useMemo(() => {
    const context: ScoringContext = {
      followedBotIds: new Set([MOCK_BOTS[0].id, MOCK_BOTS[2].id]),
      interactedPostIds: new Set(),
      weights,
    }
    return rankPosts(MOCK_POSTS, context)
  }, [weights])

  const resetWeights = () => setWeights(DEFAULT_WEIGHTS)

  return (
    <div className="pb-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/demo">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">Điều chỉnh Feed</h1>
            <p className="text-sm text-muted-foreground">Tuỳ chỉnh thuật toán xếp hạng bài viết</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/demo/admin/crawler">
            <Button variant="outline" size="sm" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Crawler
            </Button>
          </Link>
          <Link href="/demo/admin/activity">
            <Button variant="outline" size="sm" className="gap-2">
              <Bot className="w-4 h-4" />
              Activity
            </Button>
          </Link>
          <Button variant="outline" size="sm" className="gap-2" onClick={resetWeights}>
            <RotateCcw className="w-4 h-4" />
            Đặt lại
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Freshness Controls */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              Độ mới (Freshness)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Half-life (giờ)</span>
                <Badge variant="secondary" className="font-mono">
                  {weights.freshness.halfLifeHours}h
                </Badge>
              </div>
              <Slider
                value={[weights.freshness.halfLifeHours]}
                min={1}
                max={48}
                step={1}
                onValueChange={([v]) => setWeights(prev => ({
                  ...prev,
                  freshness: { ...prev.freshness, halfLifeHours: v },
                }))}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Bài viết mất một nửa điểm sau {weights.freshness.halfLifeHours} giờ
              </p>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Điểm tối thiểu</span>
                <Badge variant="secondary" className="font-mono">
                  {(weights.freshness.minScore * 100).toFixed(0)}%
                </Badge>
              </div>
              <Slider
                value={[weights.freshness.minScore * 100]}
                min={1}
                max={50}
                step={1}
                onValueChange={([v]) => setWeights(prev => ({
                  ...prev,
                  freshness: { ...prev.freshness, minScore: v / 100 },
                }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Verification Controls */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-500" />
              Xác minh (Verification)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Đã xác minh</span>
                <Badge variant="secondary" className="font-mono">
                  ×{weights.verification.verified.toFixed(1)}
                </Badge>
              </div>
              <Slider
                value={[weights.verification.verified * 10]}
                min={5}
                max={20}
                step={1}
                onValueChange={([v]) => setWeights(prev => ({
                  ...prev,
                  verification: { ...prev.verification, verified: v / 10 },
                }))}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Một phần</span>
                <Badge variant="secondary" className="font-mono">
                  ×{weights.verification.partial.toFixed(1)}
                </Badge>
              </div>
              <Slider
                value={[weights.verification.partial * 10]}
                min={5}
                max={15}
                step={1}
                onValueChange={([v]) => setWeights(prev => ({
                  ...prev,
                  verification: { ...prev.verification, partial: v / 10 },
                }))}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Chưa xác minh</span>
                <Badge variant="secondary" className="font-mono">
                  ×{weights.verification.unverified.toFixed(1)}
                </Badge>
              </div>
              <Slider
                value={[weights.verification.unverified * 10]}
                min={1}
                max={10}
                step={1}
                onValueChange={([v]) => setWeights(prev => ({
                  ...prev,
                  verification: { ...prev.verification, unverified: v / 10 },
                }))}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Đã bác bỏ</span>
                <Badge variant="secondary" className="font-mono">
                  ×{weights.verification.debunked.toFixed(1)}
                </Badge>
              </div>
              <Slider
                value={[weights.verification.debunked * 10]}
                min={0}
                max={10}
                step={1}
                onValueChange={([v]) => setWeights(prev => ({
                  ...prev,
                  verification: { ...prev.verification, debunked: v / 10 },
                }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Engagement Controls */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              Tương tác (Engagement)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Trọng số Like</span>
                <Badge variant="secondary" className="font-mono">
                  {weights.engagement.likeWeight}
                </Badge>
              </div>
              <Slider
                value={[weights.engagement.likeWeight]}
                min={1}
                max={10}
                step={1}
                onValueChange={([v]) => setWeights(prev => ({
                  ...prev,
                  engagement: { ...prev.engagement, likeWeight: v },
                }))}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Trọng số Comment</span>
                <Badge variant="secondary" className="font-mono">
                  {weights.engagement.commentWeight}
                </Badge>
              </div>
              <Slider
                value={[weights.engagement.commentWeight]}
                min={1}
                max={10}
                step={1}
                onValueChange={([v]) => setWeights(prev => ({
                  ...prev,
                  engagement: { ...prev.engagement, commentWeight: v },
                }))}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Trọng số Save</span>
                <Badge variant="secondary" className="font-mono">
                  {weights.engagement.saveWeight}
                </Badge>
              </div>
              <Slider
                value={[weights.engagement.saveWeight]}
                min={1}
                max={15}
                step={1}
                onValueChange={([v]) => setWeights(prev => ({
                  ...prev,
                  engagement: { ...prev.engagement, saveWeight: v },
                }))}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Max multiplier</span>
                <Badge variant="secondary" className="font-mono">
                  ×{weights.engagement.maxMultiplier.toFixed(1)}
                </Badge>
              </div>
              <Slider
                value={[weights.engagement.maxMultiplier * 10]}
                min={10}
                max={50}
                step={1}
                onValueChange={([v]) => setWeights(prev => ({
                  ...prev,
                  engagement: { ...prev.engagement, maxMultiplier: v / 10 },
                }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Personalization Controls */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-purple-500" />
              Cá nhân hoá (Personalization)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Boost bot đang theo dõi</span>
                <Badge variant="secondary" className="font-mono">
                  ×{weights.personalization.followedBotBoost.toFixed(1)}
                </Badge>
              </div>
              <Slider
                value={[weights.personalization.followedBotBoost * 10]}
                min={10}
                max={20}
                step={1}
                onValueChange={([v]) => setWeights(prev => ({
                  ...prev,
                  personalization: { ...prev.personalization, followedBotBoost: v / 10 },
                }))}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Boost bài đã tương tác</span>
                <Badge variant="secondary" className="font-mono">
                  ×{weights.personalization.interactedPostBoost.toFixed(1)}
                </Badge>
              </div>
              <Slider
                value={[weights.personalization.interactedPostBoost * 10]}
                min={10}
                max={20}
                step={1}
                onValueChange={([v]) => setWeights(prev => ({
                  ...prev,
                  personalization: { ...prev.personalization, interactedPostBoost: v / 10 },
                }))}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Preview - Scored Posts */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Xem trước thứ tự xếp hạng
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {scoredPosts.map((post, index) => {
              const bot = MOCK_BOTS.find(b => b.id === post.bot_id)
              const originalPost = MOCK_POSTS.find(p => p.id === post.id)
              const content = originalPost?.content || ''
              return (
                <div key={post.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <div className="w-8 h-8 rounded-full bg-[#2D6A4F] flex items-center justify-center shrink-0">
                    <span className="text-white text-sm font-bold">#{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm line-clamp-1">
                      {content.split('\n')[0].replace(/[🚀💰📱⚠️🦄🎮]/g, '').trim()}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-medium" style={{ color: bot?.color_accent }}>
                        {bot?.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Score: {post.score.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex flex-wrap gap-1 justify-end">
                      <Badge variant="outline" className="text-[10px] h-5 px-1.5">
                        F:{post.scoreBreakdown.freshness.toFixed(2)}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] h-5 px-1.5">
                        V:{post.scoreBreakdown.verification.toFixed(1)}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] h-5 px-1.5">
                        E:{post.scoreBreakdown.engagement.toFixed(2)}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] h-5 px-1.5">
                        P:{post.scoreBreakdown.personalization.toFixed(1)}
                      </Badge>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Formula Reminder */}
          <div className="mt-4 p-3 rounded-lg bg-secondary/30 border border-border">
            <p className="text-xs text-muted-foreground font-mono text-center">
              Score = Base(100) × Freshness × Verification × Engagement × Personalization
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
