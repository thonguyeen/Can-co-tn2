'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  RefreshCw,
  Play,
  CheckCircle,
  XCircle,
  Clock,
  Database,
  Newspaper,
  ExternalLink,
} from 'lucide-react'

interface Source {
  id: string
  name: string
  last_crawled_at: string | null
  is_active: boolean
}

interface CrawlLog {
  id: string
  source_id: string
  started_at: string
  completed_at: string | null
  status: string
  articles_found: number
  articles_new: number
  error_message: string | null
  sources: { name: string }
}

interface CrawlSummary {
  total_sources: number
  successful: number
  failed: number
  total_articles_found: number
  total_articles_new: number
  total_duration_ms: number
}

interface CrawlResultData {
  success: boolean
  summary?: CrawlSummary
  results?: Array<{
    source_name: string
    status: string
    articles_found: number
    articles_new: number
  }>
}

interface RawNewsItem {
  id: string
  original_url: string
  original_title: string
  is_processed: boolean
  created_at: string
  sources: { name: string }
}

export default function CrawlerAdminPage() {
  const [sources, setSources] = useState<Source[]>([])
  const [logs, setLogs] = useState<CrawlLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCrawling, setIsCrawling] = useState(false)
  const [crawlResult, setCrawlResult] = useState<CrawlResultData | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/crawl')
      const data = await res.json()
      setSources(data.sources || [])
      setLogs(data.recent_logs || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    }
    setIsLoading(false)
  }

  const handleCrawlAll = async () => {
    setIsCrawling(true)
    setCrawlResult(null)

    try {
      const res = await fetch('/api/crawl', { method: 'POST' })
      const data = await res.json()
      setCrawlResult(data)
      fetchData()
    } catch (error) {
      console.error('Crawl error:', error)
    }

    setIsCrawling(false)
  }

  const handleCrawlSource = async (sourceId: string) => {
    setIsCrawling(true)

    try {
      const res = await fetch(`/api/crawl/${sourceId}`, { method: 'POST' })
      const data = await res.json()
      setCrawlResult({ success: true, results: [data.result] })
      fetchData()
    } catch (error) {
      console.error('Crawl error:', error)
    }

    setIsCrawling(false)
  }

  const formatTime = (dateString: string | null) => {
    if (!dateString) return 'Chưa crawl'
    return new Date(dateString).toLocaleString('vi-VN')
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Crawler Admin</h1>
          <p className="text-muted-foreground">
            Quản lý thu thập tin tức tự động
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData} disabled={isLoading}>
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
          <Button onClick={handleCrawlAll} disabled={isCrawling}>
            <Play
              className={`h-4 w-4 mr-2 ${isCrawling ? 'animate-pulse' : ''}`}
            />
            {isCrawling ? 'Đang crawl...' : 'Crawl tất cả'}
          </Button>
        </div>
      </div>

      {/* Crawl Result */}
      {crawlResult && (
        <Card className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
          <CardContent className="pt-4">
            <h3 className="font-semibold mb-2">Kết quả crawl</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Sources</div>
                <div className="font-bold">
                  {crawlResult.summary?.total_sources ||
                    crawlResult.results?.length}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Thành công</div>
                <div className="font-bold text-green-600">
                  {crawlResult.summary?.successful || '-'}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Thất bại</div>
                <div className="font-bold text-red-600">
                  {crawlResult.summary?.failed || '-'}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Tin tìm thấy</div>
                <div className="font-bold">
                  {crawlResult.summary?.total_articles_found || '-'}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Tin mới</div>
                <div className="font-bold text-blue-600">
                  {crawlResult.summary?.total_articles_new || '-'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sources Grid */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Database className="h-5 w-5" />
          News Sources ({sources.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {sources.map((source) => (
            <Card key={source.id}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{source.name}</span>
                  <Badge variant={source.is_active ? 'default' : 'secondary'}>
                    {source.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTime(source.last_crawled_at)}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCrawlSource(source.id)}
                    disabled={isCrawling}
                  >
                    <Play className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {sources.length === 0 && !isLoading && (
            <Card className="col-span-full">
              <CardContent className="p-8 text-center text-muted-foreground">
                Chưa có sources - Chạy migration 003_seed_sources.sql
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Recent Logs */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Newspaper className="h-5 w-5" />
          Recent Crawl Logs
        </h2>
        <Card>
          <div className="divide-y">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {log.status === 'success' ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : log.status === 'failed' ? (
                    <XCircle className="h-5 w-5 text-red-500" />
                  ) : (
                    <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
                  )}
                  <div>
                    <div className="font-medium">{log.sources?.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatTime(log.started_at)}
                    </div>
                  </div>
                </div>
                <div className="text-right text-sm">
                  {log.status === 'success' ? (
                    <div>
                      <span className="text-muted-foreground">
                        {log.articles_found} found,{' '}
                      </span>
                      <span className="text-blue-600 font-medium">
                        {log.articles_new} new
                      </span>
                    </div>
                  ) : log.status === 'failed' ? (
                    <span className="text-red-500 text-xs">
                      {log.error_message}
                    </span>
                  ) : (
                    <span className="text-blue-500">Running...</span>
                  )}
                </div>
              </div>
            ))}
            {logs.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                Chưa có crawl logs
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Raw News Preview */}
      <RawNewsPreview />
    </div>
  )
}

function RawNewsPreview() {
  const [news, setNews] = useState<RawNewsItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchRawNews()
  }, [])

  const fetchRawNews = async () => {
    try {
      const res = await fetch('/api/raw-news?limit=10')
      const data = await res.json()
      setNews(data.news || [])
    } catch (error) {
      console.error('Error fetching raw news:', error)
    }
    setIsLoading(false)
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <Newspaper className="h-5 w-5" />
        Raw News (Latest 10)
      </h2>
      <Card>
        <div className="divide-y">
          {news.map((item) => (
            <div key={item.id} className="p-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <a
                    href={item.original_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium hover:text-primary line-clamp-1 flex items-center gap-1"
                  >
                    {item.original_title}
                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                  </a>
                  <div className="text-xs text-muted-foreground mt-1">
                    {item.sources?.name} •{' '}
                    {new Date(item.created_at).toLocaleString('vi-VN')}
                  </div>
                </div>
                <Badge variant={item.is_processed ? 'default' : 'outline'}>
                  {item.is_processed ? 'Processed' : 'Pending'}
                </Badge>
              </div>
            </div>
          ))}
          {news.length === 0 && !isLoading && (
            <div className="p-8 text-center text-muted-foreground">
              Chưa có raw news - Chạy crawl để thu thập
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
