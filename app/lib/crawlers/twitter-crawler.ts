// ═══════════════════════════════════════════════════════════════
// TWITTER/X CRAWLER
// ═══════════════════════════════════════════════════════════════

import { SourceConfig, TwitterConfig } from './source-registry'
import { checkRateLimit } from './rate-limiter'
import { normalizeTwitter, NormalizedContent, RawTweet } from './content-normalizer'

const TWITTER_API_BASE = 'https://api.twitter.com/2'

interface TwitterApiResponse {
  data?: Array<{
    id: string
    text: string
    created_at: string
    author_id: string
    public_metrics: {
      like_count: number
      retweet_count: number
      reply_count: number
      quote_count: number
    }
  }>
  includes?: {
    users?: Array<{
      id: string
      username: string
      name: string
      url?: string
    }>
  }
  meta?: {
    result_count: number
    next_token?: string
  }
}

export async function crawlTwitterSource(source: SourceConfig): Promise<NormalizedContent[]> {
  if (source.config.type !== 'twitter') {
    throw new Error('Invalid source config for Twitter crawler')
  }

  const bearerToken = process.env.TWITTER_BEARER_TOKEN
  if (!bearerToken) {
    console.warn('TWITTER_BEARER_TOKEN not set, skipping Twitter crawl')
    return []
  }

  const rateCheck = checkRateLimit(source.id, source.rateLimit)
  if (!rateCheck.allowed) {
    console.log(`Rate limited: ${source.id}, retry after ${rateCheck.retryAfter}s`)
    return []
  }

  const config = source.config as TwitterConfig
  let endpoint: string
  let params: URLSearchParams

  try {
    switch (config.mode) {
      case 'user': {
        const userId = await getUserId(config.target, bearerToken)
        if (!userId) return []

        endpoint = `${TWITTER_API_BASE}/users/${userId}/tweets`
        params = new URLSearchParams({
          'tweet.fields': 'created_at,public_metrics,author_id',
          'user.fields': 'username,name,url',
          'max_results': '20',
        })
        if (!config.includeRetweets) {
          params.set('exclude', 'retweets')
        }
        break
      }

      case 'hashtag':
      case 'search': {
        endpoint = `${TWITTER_API_BASE}/tweets/search/recent`
        const query = config.mode === 'hashtag'
          ? `#${config.target} -is:retweet`
          : `${config.target} -is:retweet`

        params = new URLSearchParams({
          'query': query,
          'tweet.fields': 'created_at,public_metrics,author_id',
          'user.fields': 'username,name,url',
          'expansions': 'author_id',
          'max_results': '20',
        })
        break
      }

      default:
        console.warn(`Unsupported Twitter mode: ${config.mode}`)
        return []
    }

    const response = await fetch(`${endpoint}?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
      },
    })

    if (!response.ok) {
      console.error(`Twitter API error: ${response.status}`)
      return []
    }

    const data: TwitterApiResponse = await response.json()

    if (!data.data || data.data.length === 0) {
      return []
    }

    // Build user map for author info
    const userMap = new Map<string, { username: string; name: string; url?: string }>()
    data.includes?.users?.forEach(user => {
      userMap.set(user.id, user)
    })

    const results: NormalizedContent[] = []

    for (const tweet of data.data) {
      const author = userMap.get(tweet.author_id) || {
        username: config.target,
        name: config.target,
      }

      // Apply filters
      if (config.minLikes && tweet.public_metrics.like_count < config.minLikes) {
        continue
      }
      if (config.minRetweets && tweet.public_metrics.retweet_count < config.minRetweets) {
        continue
      }

      const rawTweet: RawTweet = {
        id: tweet.id,
        text: tweet.text,
        created_at: tweet.created_at,
        author: {
          username: author.username,
          name: author.name,
          profile_url: `https://twitter.com/${author.username}`,
        },
        metrics: {
          likes: tweet.public_metrics.like_count,
          retweets: tweet.public_metrics.retweet_count,
          replies: tweet.public_metrics.reply_count,
          quotes: tweet.public_metrics.quote_count,
        },
      }

      results.push(normalizeTwitter(
        rawTweet,
        source.id,
        source.name,
        source.category,
        source.credibilityScore
      ))
    }

    return results

  } catch (error) {
    console.error(`Twitter crawl error for ${source.id}:`, error)
    return []
  }
}

async function getUserId(username: string, bearerToken: string): Promise<string | null> {
  try {
    const response = await fetch(
      `${TWITTER_API_BASE}/users/by/username/${username}`,
      {
        headers: { 'Authorization': `Bearer ${bearerToken}` },
      }
    )

    if (!response.ok) return null

    const data = await response.json()
    return data.data?.id || null
  } catch {
    return null
  }
}
