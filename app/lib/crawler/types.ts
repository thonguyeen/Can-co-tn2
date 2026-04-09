export interface NewsSource {
  id: string
  name: string
  url: string
  rss_url: string | null
  credibility_score: number
  category: string[]
  language: 'en' | 'vi'
  is_active: boolean
  last_crawled_at: string | null
}

// Matches real raw_news DB schema:
// id, source_id, title, content, summary, original_url, image_url, author, published_at, is_processed, post_id, content_hash, crawl_metadata, created_at
export interface RawArticle {
  source_id: string
  title: string
  content: string | null
  summary: string | null
  original_url: string
  image_url: string | null
  author: string | null
  published_at: string | null
  content_hash: string
  crawl_metadata: {
    tags?: string[]
    [key: string]: unknown
  }
}

export interface CrawlResult {
  source_id: string
  source_name: string
  status: 'success' | 'failed'
  articles_found: number
  articles_new: number
  error?: string
  duration_ms: number
}

export interface CrawlLog {
  id: string
  source_id: string
  started_at: string
  completed_at: string | null
  status: 'running' | 'success' | 'failed'
  articles_found: number
  articles_new: number
  error_message: string | null
  metadata: Record<string, unknown>
}

export interface CrawlSummary {
  total_sources: number
  successful: number
  failed: number
  total_articles_found: number
  total_articles_new: number
  total_duration_ms: number
}
