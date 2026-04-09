'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Play, RefreshCw, Zap, Bot, FileText, Clock } from 'lucide-react'

interface BotStats {
  id: string
  name: string
  handle: string
  posts_count: number
  avatar_url: string
  color_accent: string
}

interface RecentPost {
  id: string
  content: string
  created_at: string
  verification_status: string
  bot: {
    name: string
    handle: string
    avatar_url: string
  }
}

interface GenerateResultItem {
  rawNewsId: string
  postId?: string
  error?: string
}

interface GenerateResult {
  generated: number
  results: GenerateResultItem[]
}

export default function GenerationAdminPage() {
  const [bots, setBots] = useState<BotStats[]>([])
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([])
  const [pendingCount, setPendingCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generateResult, setGenerateResult] = useState<GenerateResult | null>(
    null
  )

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/generate-post')
      const data = await res.json()
      setBots(data.bots || [])
      setRecentPosts(data.recent_posts || [])
      setPendingCount(data.pending_news || 0)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
    setIsLoading(false)
  }

  const handleGenerateAll = async () => {
    setIsGenerating(true)
    setGenerateResult(null)

    try {
      const res = await fetch('/api/generate-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batch_limit: 5 }),
      })

      const data = await res.json()
      setGenerateResult(data)
      fetchData()
    } catch (error) {
      console.error('Generate error:', error)
    }

    setIsGenerating(false)
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      verified:
        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      partial:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      unverified: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      debunked:
        'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    }
    return colors[status] || colors.unverified
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Post Generation</h1>
          <p className="text-muted-foreground">AI bots viết tin theo persona</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData} disabled={isLoading}>
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
          <Button
            onClick={handleGenerateAll}
            disabled={isGenerating || pendingCount === 0}
          >
            <Zap
              className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-pulse' : ''}`}
            />
            {isGenerating
              ? 'Đang generate...'
              : `Generate ${Math.min(5, pendingCount)} posts`}
          </Button>
        </div>
      </div>

      {/* Bot Stats */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Bot Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {bots.map((bot) => (
            <Card key={bot.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={bot.avatar_url} />
                    <AvatarFallback
                      style={{ backgroundColor: bot.color_accent }}
                      className="text-white"
                    >
                      {bot.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-semibold">{bot.name}</div>
                    <div className="text-sm text-muted-foreground">
                      @{bot.handle}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{bot.posts_count}</div>
                    <div className="text-xs text-muted-foreground">posts</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Pending News */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <span className="font-semibold">Pending News</span>
            </div>
            <Badge variant="outline" className="text-lg">
              {pendingCount} tin chờ generate
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Generation Result */}
      {generateResult && (
        <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
          <CardContent className="pt-4">
            <h3 className="font-semibold mb-2">Kết quả generation</h3>
            <div className="text-sm">
              <p>
                <strong>Đã generate:</strong> {generateResult.generated} posts
              </p>
              {generateResult.results && (
                <div className="mt-2 space-y-1">
                  {generateResult.results.map((r, i) => (
                    <div key={i} className="flex items-center gap-2">
                      {r.postId ? (
                        <span className="text-green-600">✓</span>
                      ) : (
                        <span className="text-red-600">✗</span>
                      )}
                      <span className="truncate text-muted-foreground">
                        {r.rawNewsId.slice(0, 8)}...
                      </span>
                      {r.error && (
                        <span className="text-red-500 text-xs">{r.error}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Posts */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Recent Generated Posts
        </h2>
        <Card>
          <div className="divide-y">
            {recentPosts.map((post) => (
              <div key={post.id} className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={post.bot?.avatar_url} />
                    <AvatarFallback>
                      {post.bot?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold">{post.bot?.name}</span>
                      <span className="text-muted-foreground">
                        @{post.bot?.handle}
                      </span>
                      <Badge className={getStatusBadge(post.verification_status)}>
                        {post.verification_status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {post.content}
                    </p>
                    <div className="text-xs text-muted-foreground mt-2">
                      {new Date(post.created_at).toLocaleString('vi-VN')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {recentPosts.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                Chưa có posts - Chạy generate để tạo
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
