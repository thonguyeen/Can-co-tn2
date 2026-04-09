// ═══════════════════════════════════════════════════════════════
// UNIFIED CRAWLER - Orchestrates all platform crawlers
// ═══════════════════════════════════════════════════════════════

import {
  SourceConfig,
  getEnabledSources,
  getSourcesByPlatform,
  SourcePlatform,
} from './source-registry'
import { NormalizedContent } from './content-normalizer'
import { crawlTwitterSource } from './twitter-crawler'
import { crawlRedditSource } from './reddit-crawler'
import { crawlYouTubeSource } from './youtube-crawler'
import { crawlTelegramSource } from './telegram-crawler'
import { crawlRSSSource } from './rss-crawler'
import { prisma } from '@/lib/db'

export interface CrawlResult {
  sourceId: string
  sourceName: string
  platform: SourcePlatform
  itemsCrawled: number
  itemsSaved: number
  errors: string[]
  duration: number
}

export interface CrawlSummary {
  startTime: string
  endTime: string
  totalSources: number
  totalItemsCrawled: number
  totalItemsSaved: number
  results: CrawlResult[]
  errors: string[]
}

// ═══════════════════════════════════════════════════════════════
// MAIN CRAWL FUNCTION
// ═══════════════════════════════════════════════════════════════

export async function crawlAllSources(
  platforms?: SourcePlatform[]
): Promise<CrawlSummary> {
  const startTime = new Date().toISOString()
  const results: CrawlResult[] = []
  const globalErrors: string[] = []

  let sources: SourceConfig[]
  if (platforms && platforms.length > 0) {
    sources = platforms.flatMap(p => getSourcesByPlatform(p))
  } else {
    sources = getEnabledSources()
  }

  console.log(`Starting crawl for ${sources.length} sources`)

  for (const source of sources) {
    const result = await crawlSource(source)
    results.push(result)

    // Small delay between sources
    await delay(1000)
  }

  const endTime = new Date().toISOString()

  return {
    startTime,
    endTime,
    totalSources: sources.length,
    totalItemsCrawled: results.reduce((sum, r) => sum + r.itemsCrawled, 0),
    totalItemsSaved: results.reduce((sum, r) => sum + r.itemsSaved, 0),
    results,
    errors: globalErrors,
  }
}

// ═══════════════════════════════════════════════════════════════
// SINGLE SOURCE CRAWL
// ═══════════════════════════════════════════════════════════════

async function crawlSource(source: SourceConfig): Promise<CrawlResult> {
  const startMs = Date.now()
  const errors: string[] = []

  try {
    const items = await getCrawlerForPlatform(source)

    if (items.length === 0) {
      return {
        sourceId: source.id,
        sourceName: source.name,
        platform: source.platform,
        itemsCrawled: 0,
        itemsSaved: 0,
        errors: [],
        duration: Date.now() - startMs,
      }
    }

    const savedCount = await saveToDatabase(items)

    return {
      sourceId: source.id,
      sourceName: source.name,
      platform: source.platform,
      itemsCrawled: items.length,
      itemsSaved: savedCount,
      errors,
      duration: Date.now() - startMs,
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    errors.push(errorMessage)

    return {
      sourceId: source.id,
      sourceName: source.name,
      platform: source.platform,
      itemsCrawled: 0,
      itemsSaved: 0,
      errors,
      duration: Date.now() - startMs,
    }
  }
}

async function getCrawlerForPlatform(source: SourceConfig): Promise<NormalizedContent[]> {
  switch (source.platform) {
    case 'rss':
      return crawlRSSSource(source)
    case 'twitter':
      return crawlTwitterSource(source)
    case 'reddit':
      return crawlRedditSource(source)
    case 'youtube':
      return crawlYouTubeSource(source)
    case 'telegram':
      return crawlTelegramSource(source)
    default:
      console.warn(`Unknown platform: ${source.platform}`)
      return []
  }
}

// ═══════════════════════════════════════════════════════════════
// DATABASE OPERATIONS
// ═══════════════════════════════════════════════════════════════

async function saveToDatabase(items: NormalizedContent[]): Promise<number> {
  let savedCount = 0

  for (const item of items) {
    try {
      // Check for duplicates by content hash or URL
      const existing = await prisma.rawNews.findFirst({
        where: {
          OR: [
            { originalUrl: item.original_url },
            { contentHash: item.content_hash }
          ]
        },
        select: { id: true }
      })

      if (existing) {
        continue // Skip duplicate
      }

      const newRecord = await prisma.rawNews.create({
        data: {
          originalUrl: item.original_url,
          title: item.original_title, 
          content: item.original_content,
          publishedAt: item.published_at ? new Date(item.published_at) : null,
          contentHash: item.content_hash,
          crawlMetadata: {
            id: item.source_id,
            name: item.source_name,
            platform: item.source_platform,
            category: item.source_categories,
            credibility: item.source_credibility,
            platform_data: item.platform_data,
          } as any,
          isProcessed: false,
        }
      })

      if (newRecord) {
        savedCount++
      }
    } catch (error) {
      console.error('Error saving item:', error)
    }
  }

  return savedCount
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// ═══════════════════════════════════════════════════════════════
// PLATFORM-SPECIFIC CRAWL
// ═══════════════════════════════════════════════════════════════

export async function crawlPlatform(platform: SourcePlatform): Promise<CrawlSummary> {
  return crawlAllSources([platform])
}

export async function crawlTwitter(): Promise<CrawlSummary> {
  return crawlPlatform('twitter')
}

export async function crawlReddit(): Promise<CrawlSummary> {
  return crawlPlatform('reddit')
}

export async function crawlYouTube(): Promise<CrawlSummary> {
  return crawlPlatform('youtube')
}

export async function crawlTelegram(): Promise<CrawlSummary> {
  return crawlPlatform('telegram')
}
