// ═══════════════════════════════════════════════════════════════
// RSS CRAWLER - For unified crawler system
// ═══════════════════════════════════════════════════════════════

import Parser from 'rss-parser'
import { SourceConfig } from './source-registry'
import { checkRateLimit } from './rate-limiter'
import { NormalizedContent } from './content-normalizer'
import crypto from 'crypto'

const parser = new Parser()

export async function crawlRSSSource(source: SourceConfig): Promise<NormalizedContent[]> {
  if (source.config.type !== 'rss') {
    throw new Error('Invalid source config for RSS crawler')
  }

  const rateCheck = checkRateLimit(source.id, source.rateLimit)
  if (!rateCheck.allowed) {
    console.log(`Rate limited: ${source.id}, retry after ${rateCheck.retryAfter}s`)
    return []
  }

  try {
    const feed = await parser.parseURL(source.config.feedUrl)
    const results: NormalizedContent[] = []

    for (const item of feed.items.slice(0, 20)) {
      if (!item.link || !item.title) continue

      const content = item.contentSnippet || item.content || item.summary || null
      const contentHash = crypto.createHash('md5')
        .update(`${item.title.toLowerCase()}|${item.link}`)
        .digest('hex')

      results.push({
        original_url: item.link,
        original_title: item.title,
        original_content: content?.slice(0, 5000) || null,
        published_at: item.pubDate || item.isoDate || null,

        source_id: source.id,
        source_name: source.name,
        source_platform: 'rss',
        source_categories: source.category,
        source_credibility: source.credibilityScore,

        platform_data: {
          platform: 'rss',
          author: item.creator || item.author || undefined,
        },

        content_hash: contentHash,
      })
    }

    return results

  } catch (error) {
    console.error(`RSS crawl error for ${source.id}:`, error)
    return []
  }
}
