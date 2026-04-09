// ═══════════════════════════════════════════════════════════════
// REDDIT CRAWLER
// ═══════════════════════════════════════════════════════════════

import { SourceConfig, RedditConfig } from './source-registry'
import { checkRateLimit } from './rate-limiter'
import { normalizeReddit, NormalizedContent, RawRedditPost } from './content-normalizer'

const REDDIT_API_BASE = 'https://www.reddit.com'
const USER_AGENT = 'Facebot/1.0 (News Aggregator)'

interface RedditApiResponse {
  kind: string
  data: {
    children: Array<{
      kind: string
      data: RawRedditPost
    }>
    after?: string
    before?: string
  }
}

export async function crawlRedditSource(source: SourceConfig): Promise<NormalizedContent[]> {
  if (source.config.type !== 'reddit') {
    throw new Error('Invalid source config for Reddit crawler')
  }

  const rateCheck = checkRateLimit(source.id, source.rateLimit)
  if (!rateCheck.allowed) {
    console.log(`Rate limited: ${source.id}, retry after ${rateCheck.retryAfter}s`)
    return []
  }

  const config = source.config as RedditConfig

  try {
    const url = `${REDDIT_API_BASE}/r/${config.subreddit}/${config.sort}.json`
    const params = new URLSearchParams({
      limit: '25',
      raw_json: '1',
    })

    if (config.sort === 'top' && config.timeframe) {
      params.set('t', config.timeframe)
    }

    const response = await fetch(`${url}?${params.toString()}`, {
      headers: {
        'User-Agent': USER_AGENT,
      },
    })

    if (!response.ok) {
      console.error(`Reddit API error: ${response.status}`)
      return []
    }

    const data: RedditApiResponse = await response.json()

    if (!data.data?.children || data.data.children.length === 0) {
      return []
    }

    const results: NormalizedContent[] = []

    for (const child of data.data.children) {
      if (child.kind !== 't3') continue // t3 = link/post

      const post = child.data

      // Apply filters
      if (config.minScore && post.score < config.minScore) {
        continue
      }

      if (config.flairFilter && config.flairFilter.length > 0) {
        if (!post.link_flair_text || !config.flairFilter.includes(post.link_flair_text)) {
          continue
        }
      }

      // Skip stickied posts
      if (post.stickied) {
        continue
      }

      results.push(normalizeReddit(
        post,
        source.id,
        source.name,
        source.category,
        source.credibilityScore
      ))
    }

    return results

  } catch (error) {
    console.error(`Reddit crawl error for ${source.id}:`, error)
    return []
  }
}
