// ═══════════════════════════════════════════════════════════════
// CONTENT NORMALIZER - Different formats → Unified raw_news
// ═══════════════════════════════════════════════════════════════

import { SourcePlatform, SourceCategory } from './source-registry'
import crypto from 'crypto'

export interface NormalizedContent {
  // Core fields (match raw_news schema)
  original_url: string
  original_title: string
  original_content: string | null
  published_at: string | null

  // Source metadata
  source_id: string
  source_name: string
  source_platform: SourcePlatform
  source_categories: SourceCategory[]
  source_credibility: number

  // Platform-specific metadata
  platform_data: {
    platform: SourcePlatform
    author?: string
    authorUrl?: string

    // Engagement metrics
    likes?: number
    comments?: number
    shares?: number
    views?: number

    // Platform-specific
    retweets?: number      // Twitter
    score?: number         // Reddit
    subreddit?: string     // Reddit
    channelName?: string   // YouTube/Telegram
    duration?: number      // YouTube (seconds)
    thumbnailUrl?: string  // YouTube

    // Raw data reference
    rawId?: string
  }

  // Content hash for deduplication
  content_hash: string
}

// ═══════════════════════════════════════════════════════════════
// TWITTER NORMALIZER
// ═══════════════════════════════════════════════════════════════

export interface RawTweet {
  id: string
  text: string
  created_at: string
  author: {
    username: string
    name: string
    profile_url: string
  }
  metrics: {
    likes: number
    retweets: number
    replies: number
    quotes: number
  }
  urls?: string[]
  hashtags?: string[]
}

export function normalizeTwitter(
  tweet: RawTweet,
  sourceId: string,
  sourceName: string,
  categories: SourceCategory[],
  credibility: number
): NormalizedContent {
  const tweetUrl = `https://twitter.com/${tweet.author.username}/status/${tweet.id}`

  return {
    original_url: tweetUrl,
    original_title: `@${tweet.author.username}: ${tweet.text.slice(0, 100)}${tweet.text.length > 100 ? '...' : ''}`,
    original_content: tweet.text,
    published_at: tweet.created_at,

    source_id: sourceId,
    source_name: sourceName,
    source_platform: 'twitter',
    source_categories: categories,
    source_credibility: credibility,

    platform_data: {
      platform: 'twitter',
      author: tweet.author.name,
      authorUrl: tweet.author.profile_url,
      likes: tweet.metrics.likes,
      comments: tweet.metrics.replies,
      shares: tweet.metrics.quotes,
      retweets: tweet.metrics.retweets,
      rawId: tweet.id,
    },

    content_hash: generateContentHash(tweet.text, tweetUrl),
  }
}

// ═══════════════════════════════════════════════════════════════
// REDDIT NORMALIZER
// ═══════════════════════════════════════════════════════════════

export interface RawRedditPost {
  id: string
  title: string
  selftext: string | null
  url: string
  permalink: string
  created_utc: number
  author: string
  subreddit: string
  score: number
  upvote_ratio: number
  num_comments: number
  is_self: boolean
  link_flair_text?: string
  thumbnail?: string
  stickied?: boolean
}

export function normalizeReddit(
  post: RawRedditPost,
  sourceId: string,
  sourceName: string,
  categories: SourceCategory[],
  credibility: number
): NormalizedContent {
  const postUrl = `https://reddit.com${post.permalink}`

  const content = post.is_self
    ? post.selftext
    : `${post.selftext || ''}\n\nLink: ${post.url}`.trim()

  return {
    original_url: postUrl,
    original_title: post.title,
    original_content: content || null,
    published_at: new Date(post.created_utc * 1000).toISOString(),

    source_id: sourceId,
    source_name: sourceName,
    source_platform: 'reddit',
    source_categories: categories,
    source_credibility: credibility,

    platform_data: {
      platform: 'reddit',
      author: post.author,
      authorUrl: `https://reddit.com/u/${post.author}`,
      likes: post.score,
      comments: post.num_comments,
      score: post.score,
      subreddit: post.subreddit,
      rawId: post.id,
    },

    content_hash: generateContentHash(post.title, postUrl),
  }
}

// ═══════════════════════════════════════════════════════════════
// YOUTUBE NORMALIZER
// ═══════════════════════════════════════════════════════════════

export interface RawYouTubeVideo {
  id: string
  title: string
  description: string
  publishedAt: string
  channelId: string
  channelTitle: string
  thumbnails: {
    default: { url: string }
    medium?: { url: string }
    high?: { url: string }
  }
  statistics?: {
    viewCount: string
    likeCount: string
    commentCount: string
  }
  contentDetails?: {
    duration: string // ISO 8601 duration
  }
}

export function normalizeYouTube(
  video: RawYouTubeVideo,
  sourceId: string,
  sourceName: string,
  categories: SourceCategory[],
  credibility: number
): NormalizedContent {
  const videoUrl = `https://youtube.com/watch?v=${video.id}`

  return {
    original_url: videoUrl,
    original_title: video.title,
    original_content: video.description?.slice(0, 2000) || null,
    published_at: video.publishedAt,

    source_id: sourceId,
    source_name: sourceName,
    source_platform: 'youtube',
    source_categories: categories,
    source_credibility: credibility,

    platform_data: {
      platform: 'youtube',
      author: video.channelTitle,
      authorUrl: `https://youtube.com/channel/${video.channelId}`,
      views: video.statistics ? parseInt(video.statistics.viewCount) : undefined,
      likes: video.statistics ? parseInt(video.statistics.likeCount) : undefined,
      comments: video.statistics ? parseInt(video.statistics.commentCount) : undefined,
      channelName: video.channelTitle,
      duration: video.contentDetails ? parseDuration(video.contentDetails.duration) : undefined,
      thumbnailUrl: video.thumbnails.high?.url || video.thumbnails.medium?.url || video.thumbnails.default.url,
      rawId: video.id,
    },

    content_hash: generateContentHash(video.title, videoUrl),
  }
}

// ═══════════════════════════════════════════════════════════════
// TELEGRAM NORMALIZER
// ═══════════════════════════════════════════════════════════════

export interface RawTelegramMessage {
  id: number
  date: number
  text: string
  views?: number
  forwards?: number
  channel: {
    username: string
    title: string
  }
  media?: {
    type: 'photo' | 'video' | 'document'
    url?: string
  }
}

export function normalizeTelegram(
  message: RawTelegramMessage,
  sourceId: string,
  sourceName: string,
  categories: SourceCategory[],
  credibility: number
): NormalizedContent {
  const messageUrl = `https://t.me/${message.channel.username}/${message.id}`

  return {
    original_url: messageUrl,
    original_title: `${message.channel.title}: ${message.text.slice(0, 100)}${message.text.length > 100 ? '...' : ''}`,
    original_content: message.text,
    published_at: new Date(message.date * 1000).toISOString(),

    source_id: sourceId,
    source_name: sourceName,
    source_platform: 'telegram',
    source_categories: categories,
    source_credibility: credibility,

    platform_data: {
      platform: 'telegram',
      author: message.channel.title,
      authorUrl: `https://t.me/${message.channel.username}`,
      views: message.views,
      shares: message.forwards,
      channelName: message.channel.title,
      rawId: String(message.id),
    },

    content_hash: generateContentHash(message.text, messageUrl),
  }
}

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function generateContentHash(content: string, url: string): string {
  const normalized = `${content.toLowerCase().trim()}|${url}`
  return crypto.createHash('md5').update(normalized).digest('hex')
}

function parseDuration(isoDuration: string): number {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return 0

  const hours = parseInt(match[1] || '0')
  const minutes = parseInt(match[2] || '0')
  const seconds = parseInt(match[3] || '0')

  return hours * 3600 + minutes * 60 + seconds
}
