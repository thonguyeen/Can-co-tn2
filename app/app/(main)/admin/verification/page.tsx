'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Play,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  Zap,
  ExternalLink,
} from 'lucide-react'

interface VerificationStats {
  total: number
  unverified: number
  partial: number
  verified: number
  debunked: number
}

interface PendingNews {
  id: string
  original_title: string
  original_url: string
  created_at: string
  sources: { name: string; credibility_score: number }
}

interface VerifyResultItem {
  id: string
  status: string
  error?: string
}

interface SingleVerifyResult {
  success: boolean
  result?: {
    verification_status: string
    verification_note: string
  }
  error?: string
}

interface BatchVerifyResult {
  processed: number
  results: VerifyResultItem[]
}

type VerifyResult =
  | { single: SingleVerifyResult }
  | BatchVerifyResult

export default function VerificationAdminPage() {
  const [stats, setStats] = useState<VerificationStats | null>(null)
  const [pendingCount, setPendingCount] = useState(0)
  const [pendingNews, setPendingNews] = useState<PendingNews[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isVerifying, setIsVerifying] = useState(false)
  const [verifyResult, setVerifyResult] = useState<VerifyResult | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)

    try {
      // Fetch stats
      const statsRes = await fetch('/api/verify')
      const statsData = await statsRes.json()
      setStats(statsData.stats)
      setPendingCount(statsData.pending_verification)

      // Fetch pending news
      const newsRes = await fetch('/api/raw-news?processed=false&limit=20')
      const newsData = await newsRes.json()
      setPendingNews(newsData.news || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    }

    setIsLoading(false)
  }

  const handleVerifyAll = async () => {
    setIsVerifying(true)
    setVerifyResult(null)

    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batch_limit: 10 }),
      })

      const data = await res.json()
      setVerifyResult(data)
      fetchData()
    } catch (error) {
      console.error('Verify error:', error)
    }

    setIsVerifying(false)
  }

  const handleVerifySingle = async (id: string) => {
    setIsVerifying(true)

    try {
      const res = await fetch(`/api/verify/${id}`, { method: 'POST' })
      const data = await res.json()

      setVerifyResult({ single: data })
      fetchData()
    } catch (error) {
      console.error('Verify error:', error)
    }

    setIsVerifying(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'partial':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 'debunked':
        return <XCircle className="h-5 w-5 text-gray-500" />
      default:
        return <Clock className="h-5 w-5 text-red-500" />
    }
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Verification Agent</h1>
          <p className="text-muted-foreground">
            AI-powered fact-checking system
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData} disabled={isLoading}>
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
          <Button
            onClick={handleVerifyAll}
            disabled={isVerifying || pendingCount === 0}
          >
            <Zap
              className={`h-4 w-4 mr-2 ${isVerifying ? 'animate-pulse' : ''}`}
            />
            {isVerifying
              ? 'Đang verify...'
              : `Verify ${Math.min(10, pendingCount)} tin`}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Tổng posts</div>
            </CardContent>
          </Card>
          <Card className="border-red-200 bg-red-50 dark:bg-red-950">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-red-600">
                {stats.unverified}
              </div>
              <div className="text-sm text-muted-foreground">Chưa verify</div>
            </CardContent>
          </Card>
          <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-yellow-600">
                {stats.partial}
              </div>
              <div className="text-sm text-muted-foreground">Một phần</div>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50 dark:bg-green-950">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-green-600">
                {stats.verified}
              </div>
              <div className="text-sm text-muted-foreground">Đã verify</div>
            </CardContent>
          </Card>
          <Card className="border-gray-200 bg-gray-50 dark:bg-gray-900">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-gray-600">
                {stats.debunked}
              </div>
              <div className="text-sm text-muted-foreground">Bác bỏ</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Verification Result */}
      {verifyResult && (
        <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
          <CardContent className="pt-4">
            <h3 className="font-semibold mb-2">Kết quả verification</h3>
            {'single' in verifyResult ? (
              <div className="text-sm">
                <p>
                  <strong>Status:</strong>{' '}
                  {verifyResult.single.result?.verification_status || 'Error'}
                </p>
                <p>
                  <strong>Note:</strong>{' '}
                  {verifyResult.single.result?.verification_note ||
                    verifyResult.single.error}
                </p>
              </div>
            ) : (
              <div className="text-sm">
                <p>
                  <strong>Đã xử lý:</strong> {verifyResult.processed} tin
                </p>
                <div className="mt-2 space-y-1">
                  {verifyResult.results?.map((r, i) => (
                    <div key={i} className="flex items-center gap-2">
                      {getStatusIcon(r.status)}
                      <span className="truncate">{r.id.slice(0, 8)}...</span>
                      <Badge variant="outline">{r.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pending Queue */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Pending Verification ({pendingCount})
        </h2>
        <Card>
          <div className="divide-y">
            {pendingNews.map((news) => (
              <div
                key={news.id}
                className="p-3 flex items-center justify-between"
              >
                <div className="flex-1 min-w-0 mr-4">
                  <a
                    href={news.original_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium hover:text-primary line-clamp-1 flex items-center gap-1"
                  >
                    {news.original_title}
                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                  </a>
                  <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                    <span>{news.sources?.name}</span>
                    <span>•</span>
                    <span>Credibility: {news.sources?.credibility_score}/100</span>
                    <span>•</span>
                    <span>
                      {new Date(news.created_at).toLocaleString('vi-VN')}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleVerifySingle(news.id)}
                  disabled={isVerifying}
                >
                  <Play className="h-3 w-3 mr-1" />
                  Verify
                </Button>
              </div>
            ))}
            {pendingNews.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                Không có tin nào cần verify
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Verification Stats Chart (Simple) */}
      {stats && stats.total > 0 && (
        <Card>
          <CardContent className="pt-4">
            <h3 className="font-semibold mb-4">Tỷ lệ Verification</h3>
            <div className="h-4 rounded-full overflow-hidden flex bg-muted">
              <div
                className="bg-red-500 transition-all"
                style={{ width: `${(stats.unverified / stats.total) * 100}%` }}
                title={`Unverified: ${stats.unverified}`}
              />
              <div
                className="bg-yellow-500 transition-all"
                style={{ width: `${(stats.partial / stats.total) * 100}%` }}
                title={`Partial: ${stats.partial}`}
              />
              <div
                className="bg-green-500 transition-all"
                style={{ width: `${(stats.verified / stats.total) * 100}%` }}
                title={`Verified: ${stats.verified}`}
              />
              <div
                className="bg-gray-500 transition-all"
                style={{ width: `${(stats.debunked / stats.total) * 100}%` }}
                title={`Debunked: ${stats.debunked}`}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>
                {((stats.unverified / stats.total) * 100).toFixed(1)}% Chưa
                verify
              </span>
              <span>
                {((stats.partial / stats.total) * 100).toFixed(1)}% Một phần
              </span>
              <span>
                {((stats.verified / stats.total) * 100).toFixed(1)}% Đã verify
              </span>
              <span>
                {((stats.debunked / stats.total) * 100).toFixed(1)}% Bác bỏ
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
