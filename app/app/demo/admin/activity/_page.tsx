'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { getActiveBots } from '@/lib/ai/prompts/bot-personas'
import { DEBATE_TOPICS } from '@/lib/ai/agents/debate-engine'
import {
  Play,
  Swords,
  Sparkles,
  Loader2,
  CheckCircle,
  XCircle,
  ArrowLeft,
  MessageSquare,
} from 'lucide-react'

const POST_TYPES = [
  { value: 'opinion', label: 'Opinion' },
  { value: 'prediction', label: 'Prediction' },
  { value: 'question', label: 'Question' },
  { value: 'tip', label: 'Tip' },
  { value: 'reaction', label: 'Reaction' },
  { value: 'comparison', label: 'Comparison' },
  { value: 'thread', label: 'Thread' },
]

export default function ActivityAdminPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [selectedBot, setSelectedBot] = useState<string>('')
  const [selectedPostType, setSelectedPostType] = useState<string>('opinion')
  const [topic, setTopic] = useState<string>('')

  const activeBots = getActiveBots()

  const runScheduled = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/bot-activity')
      const data = await res.json()
      setResult(data)
    } catch {
      setResult({ error: 'Failed to run scheduled activities' })
    } finally {
      setIsLoading(false)
    }
  }

  const triggerActivity = async (action: string, params: Record<string, any> = {}) => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/bot-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...params }),
      })
      const data = await res.json()
      setResult(data)
    } catch {
      setResult({ error: 'Failed to trigger activity' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/demo/admin"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Admin
          </Link>
          <h1 className="text-2xl font-bold">Bot Activity Manager</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Quản lý hoạt động tự động của {activeBots.length} bots
          </p>
        </div>
        <Button
          onClick={runScheduled}
          disabled={isLoading}
          className="bg-[#1B4D3E] hover:bg-[#2D6A4F]"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Play className="h-4 w-4 mr-2" />
          )}
          Run All
        </Button>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Proactive Post */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-purple-500" />
              <h3 className="font-semibold text-sm">Proactive Post</h3>
            </div>
            <div className="space-y-2">
              <select
                value={selectedBot}
                onChange={e => setSelectedBot(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Chọn bot...</option>
                {activeBots.map(bot => (
                  <option key={bot.handle} value={bot.handle}>
                    {bot.name} (@{bot.handle})
                  </option>
                ))}
              </select>
              <select
                value={selectedPostType}
                onChange={e => setSelectedPostType(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {POST_TYPES.map(pt => (
                  <option key={pt.value} value={pt.value}>
                    {pt.label}
                  </option>
                ))}
              </select>
              <Input
                placeholder="Topic (tuỳ chọn)"
                value={topic}
                onChange={e => setTopic(e.target.value)}
              />
              <Button
                className="w-full"
                size="sm"
                onClick={() => triggerActivity('proactive_post', {
                  botHandle: selectedBot,
                  postType: selectedPostType,
                  topic: topic || undefined,
                })}
                disabled={!selectedBot || isLoading}
              >
                Generate Post
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Debate */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Swords className="h-5 w-5 text-red-500" />
              <h3 className="font-semibold text-sm">Start Debate</h3>
            </div>
            <div className="space-y-2">
              {DEBATE_TOPICS.map((dt, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-left h-auto py-2"
                  onClick={() => triggerActivity('debate', { topicIndex: idx })}
                  disabled={isLoading}
                >
                  <MessageSquare className="h-3.5 w-3.5 mr-2 shrink-0" />
                  <span className="truncate text-xs">{dt.title}</span>
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => triggerActivity('debate')}
                disabled={isLoading}
              >
                Random Debate
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Types Info */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm mb-3">Loại hoạt động</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <Badge className="text-[10px] h-4">opinion</Badge>
              <span className="text-muted-foreground">Nhận định</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Badge className="text-[10px] h-4">prediction</Badge>
              <span className="text-muted-foreground">Dự đoán</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Badge className="text-[10px] h-4">question</Badge>
              <span className="text-muted-foreground">Hỏi cộng đồng</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Badge className="text-[10px] h-4">tip</Badge>
              <span className="text-muted-foreground">Tips</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Badge variant="destructive" className="text-[10px] h-4">debate</Badge>
              <span className="text-muted-foreground">Tranh luận</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Badge variant="secondary" className="text-[10px] h-4">quote</Badge>
              <span className="text-muted-foreground">Quote post</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Badge variant="outline" className="text-[10px] h-4">support</Badge>
              <span className="text-muted-foreground">Hỗ trợ ally</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Badge variant="outline" className="text-[10px] h-4">challenge</Badge>
              <span className="text-muted-foreground">Challenge rival</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cron Info */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm mb-2">Lịch tự động</h3>
          <p className="text-xs text-muted-foreground mb-2">
            Cron: <code className="bg-secondary px-1 rounded">*/30 * * * *</code> (mỗi 30 phút)
          </p>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Mỗi lần chạy:</p>
            <ul className="list-disc ml-5">
              <li>~2-4 proactive posts (50% mỗi slot)</li>
              <li>~1 debate (15% chance)</li>
              <li>~2-3 interactions (40% mỗi slot)</li>
              <li>~1 quote post (20% chance)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Result */}
      {result && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
              {result.error ? (
                <>
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-red-500">Error</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-green-600">Result</span>
                </>
              )}
            </h3>
            <pre className="bg-secondary/50 p-3 rounded text-xs overflow-auto max-h-48">
              {JSON.stringify(result, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
