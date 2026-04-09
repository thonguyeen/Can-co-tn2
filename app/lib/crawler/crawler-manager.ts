import { prisma } from '@/lib/db'
import { parseRSSFeed } from './rss-parser'
import { scrapeWebPage } from './web-scraper'
import type { NewsSource, RawArticle, CrawlResult } from './types'

export async function crawlSource(source: NewsSource): Promise<CrawlResult> {
  const startTime = Date.now()
  
  // Create crawl log entry
  const logEntry = await prisma.crawlLog.create({
    data: {
      sourceId: source.id,
      status: 'running',
    }
  })

  try {
    // Fetch articles
    let articles: RawArticle[]
    if (source.rss_url) {
      articles = await parseRSSFeed(source)
    } else {
      articles = await scrapeWebPage(source)
    }

    // Deduplicate against existing
    const newArticles = await deduplicateArticles(articles)

    // Insert new articles
    if (newArticles.length > 0) {
      await prisma.rawNews.createMany({
        data: newArticles.map(a => ({
          sourceId: a.source_id,
          title: a.title,
          content: a.content,
          summary: a.summary,
          originalUrl: a.original_url,
          imageUrl: a.image_url,
          author: a.author,
          publishedAt: a.published_at ? new Date(a.published_at) : null,
          contentHash: a.content_hash,
          crawlMetadata: a.crawl_metadata as any
        }))
      })
    }

    // Update source last_crawled_at
    await prisma.source.update({
      where: { id: source.id },
      data: { lastCrawledAt: new Date() }
    })

    // Update crawl log
    if (logEntry) {
      await prisma.crawlLog.update({
        where: { id: logEntry.id },
        data: {
          status: 'success',
          completedAt: new Date(),
          articlesFound: articles.length,
          articlesNew: newArticles.length,
        }
      })
    }

    return {
      source_id: source.id,
      source_name: source.name,
      status: 'success',
      articles_found: articles.length,
      articles_new: newArticles.length,
      duration_ms: Date.now() - startTime,
    }

  } catch (error) {
    if (logEntry) {
      await prisma.crawlLog.update({
        where: { id: logEntry.id },
        data: {
          status: 'failed',
          completedAt: new Date(),
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        }
      })
    }

    return {
      source_id: source.id,
      source_name: source.name,
      status: 'failed',
      articles_found: 0,
      articles_new: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration_ms: Date.now() - startTime,
    }
  }
}

async function deduplicateArticles(
  articles: RawArticle[]
): Promise<RawArticle[]> {
  if (articles.length === 0) return []

  const hashes = articles.map(a => a.content_hash)
  
  const existing = await prisma.rawNews.findMany({
    where: { contentHash: { in: hashes } },
    select: { contentHash: true }
  })

  const existingHashes = new Set(existing.map(e => e.contentHash))

  return articles.filter(a => !existingHashes.has(a.content_hash))
}

export async function crawlAllSources(): Promise<CrawlResult[]> {
  const sources = await prisma.source.findMany({
    where: { isActive: true }
  })

  if (!sources || sources.length === 0) {
    return []
  }

  const CONCURRENT_LIMIT = 5
  const results: CrawlResult[] = []

  // map PRISMA source back to NewsSource type for parser/scraper compat
  const mappedSources: NewsSource[] = sources.map(s => ({
    id: s.id,
    name: s.name,
    url: s.url,
    rss_url: s.rssUrl,
    credibility_score: s.credibilityScore || 0,
    category: s.category ? [s.category] : [],
    language: (s.language as any) || 'vi',
    is_active: s.isActive || false,
    last_crawled_at: s.lastCrawledAt?.toISOString() || null
  }))

  for (let i = 0; i < mappedSources.length; i += CONCURRENT_LIMIT) {
    const batch = mappedSources.slice(i, i + CONCURRENT_LIMIT)
    const batchResults = await Promise.all(
      batch.map(source => crawlSource(source))
    )
    results.push(...batchResults)
  }

  return results
}

export async function crawlSingleSource(sourceId: string): Promise<CrawlResult> {
  const s = await prisma.source.findUnique({
    where: { id: sourceId }
  })

  if (!s) {
    throw new Error(`Source not found: ${sourceId}`)
  }

  const mappedSource: NewsSource = {
    id: s.id,
    name: s.name,
    url: s.url,
    rss_url: s.rssUrl,
    credibility_score: s.credibilityScore || 0,
    category: s.category ? [s.category] : [],
    language: (s.language as any) || 'vi',
    is_active: s.isActive || false,
    last_crawled_at: s.lastCrawledAt?.toISOString() || null
  }

  return crawlSource(mappedSource)
}
