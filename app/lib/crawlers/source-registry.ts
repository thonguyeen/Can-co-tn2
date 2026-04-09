// ═══════════════════════════════════════════════════════════════
// UNIFIED SOURCE REGISTRY
// ═══════════════════════════════════════════════════════════════

export type SourcePlatform =
  | 'rss'
  | 'web'
  | 'twitter'
  | 'reddit'
  | 'youtube'
  | 'telegram'

export type SourceCategory =
  | 'ai'
  | 'startup'
  | 'gadget'
  | 'crypto'
  | 'finance'
  | 'gaming'
  | 'lifestyle'
  | 'security'
  | 'politics'
  | 'general'

export interface SourceConfig {
  id: string
  name: string
  platform: SourcePlatform
  category: SourceCategory[]
  credibilityScore: number // 1-10

  // Platform-specific config
  config: RSSConfig | WebConfig | TwitterConfig | RedditConfig | YouTubeConfig | TelegramConfig

  // Crawl settings
  enabled: boolean
  priority: number // 1-10, higher = more frequent
  rateLimit: {
    requestsPerMinute: number
    cooldownMinutes: number
  }

  // Metadata
  lastCrawledAt?: string
  totalItemsCrawled?: number
  errorCount?: number
}

interface RSSConfig {
  type: 'rss'
  feedUrl: string
}

interface WebConfig {
  type: 'web'
  url: string
  selectors: {
    articles: string
    title: string
    content: string
    date?: string
    author?: string
  }
}

export interface TwitterConfig {
  type: 'twitter'
  mode: 'user' | 'hashtag' | 'search' | 'list'
  target: string
  includeReplies?: boolean
  includeRetweets?: boolean
  minLikes?: number
  minRetweets?: number
}

export interface RedditConfig {
  type: 'reddit'
  subreddit: string
  sort: 'hot' | 'new' | 'top' | 'rising'
  timeframe?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all'
  minScore?: number
  flairFilter?: string[]
  stickied?: boolean
}

export interface YouTubeConfig {
  type: 'youtube'
  mode: 'channel' | 'search' | 'trending' | 'playlist'
  target: string
  minViews?: number
  maxAgeDays?: number
}

export interface TelegramConfig {
  type: 'telegram'
  channelUsername: string
  minViews?: number
}

// ═══════════════════════════════════════════════════════════════
// SOURCE DEFINITIONS
// ═══════════════════════════════════════════════════════════════

export const SOURCES: SourceConfig[] = [
  // ─────────────────────────────────────────────────────────────
  // RSS SOURCES
  // ─────────────────────────────────────────────────────────────
  {
    id: 'techcrunch-rss',
    name: 'TechCrunch',
    platform: 'rss',
    category: ['ai', 'startup'],
    credibilityScore: 8,
    config: { type: 'rss', feedUrl: 'https://techcrunch.com/feed/' },
    enabled: true,
    priority: 8,
    rateLimit: { requestsPerMinute: 10, cooldownMinutes: 5 },
  },
  {
    id: 'theverge-rss',
    name: 'The Verge',
    platform: 'rss',
    category: ['gadget', 'ai'],
    credibilityScore: 8,
    config: { type: 'rss', feedUrl: 'https://www.theverge.com/rss/index.xml' },
    enabled: true,
    priority: 8,
    rateLimit: { requestsPerMinute: 10, cooldownMinutes: 5 },
  },
  {
    id: 'wired-rss',
    name: 'Wired',
    platform: 'rss',
    category: ['ai', 'gadget', 'security'],
    credibilityScore: 8,
    config: { type: 'rss', feedUrl: 'https://www.wired.com/feed/rss' },
    enabled: true,
    priority: 7,
    rateLimit: { requestsPerMinute: 10, cooldownMinutes: 5 },
  },
  {
    id: 'arstechnica-rss',
    name: 'Ars Technica',
    platform: 'rss',
    category: ['ai', 'gadget', 'security'],
    credibilityScore: 9,
    config: { type: 'rss', feedUrl: 'https://feeds.arstechnica.com/arstechnica/index' },
    enabled: true,
    priority: 8,
    rateLimit: { requestsPerMinute: 10, cooldownMinutes: 5 },
  },

  // ─────────────────────────────────────────────────────────────
  // TWITTER/X SOURCES
  // ─────────────────────────────────────────────────────────────
  {
    id: 'twitter-openai',
    name: 'OpenAI (Twitter)',
    platform: 'twitter',
    category: ['ai'],
    credibilityScore: 10,
    config: {
      type: 'twitter',
      mode: 'user',
      target: 'OpenAI',
      includeReplies: false,
      includeRetweets: false,
    },
    enabled: true,
    priority: 9,
    rateLimit: { requestsPerMinute: 5, cooldownMinutes: 15 },
  },
  {
    id: 'twitter-anthropic',
    name: 'Anthropic (Twitter)',
    platform: 'twitter',
    category: ['ai'],
    credibilityScore: 10,
    config: {
      type: 'twitter',
      mode: 'user',
      target: 'AnthropicAI',
      includeReplies: false,
      includeRetweets: false,
    },
    enabled: true,
    priority: 9,
    rateLimit: { requestsPerMinute: 5, cooldownMinutes: 15 },
  },
  {
    id: 'twitter-elonmusk',
    name: 'Elon Musk (Twitter)',
    platform: 'twitter',
    category: ['ai', 'startup', 'gadget'],
    credibilityScore: 6,
    config: {
      type: 'twitter',
      mode: 'user',
      target: 'elonmusk',
      includeReplies: false,
      includeRetweets: false,
      minLikes: 10000,
    },
    enabled: true,
    priority: 7,
    rateLimit: { requestsPerMinute: 5, cooldownMinutes: 15 },
  },
  {
    id: 'twitter-ai-hashtag',
    name: '#AI Trending',
    platform: 'twitter',
    category: ['ai'],
    credibilityScore: 5,
    config: {
      type: 'twitter',
      mode: 'hashtag',
      target: 'AI',
      minLikes: 1000,
      minRetweets: 100,
    },
    enabled: true,
    priority: 6,
    rateLimit: { requestsPerMinute: 3, cooldownMinutes: 20 },
  },
  {
    id: 'twitter-crypto-hashtag',
    name: '#Crypto Trending',
    platform: 'twitter',
    category: ['crypto'],
    credibilityScore: 4,
    config: {
      type: 'twitter',
      mode: 'hashtag',
      target: 'crypto',
      minLikes: 500,
      minRetweets: 50,
    },
    enabled: true,
    priority: 6,
    rateLimit: { requestsPerMinute: 3, cooldownMinutes: 20 },
  },

  // ─────────────────────────────────────────────────────────────
  // REDDIT SOURCES
  // ─────────────────────────────────────────────────────────────
  {
    id: 'reddit-machinelearning',
    name: 'r/MachineLearning',
    platform: 'reddit',
    category: ['ai'],
    credibilityScore: 7,
    config: {
      type: 'reddit',
      subreddit: 'MachineLearning',
      sort: 'hot',
      minScore: 100,
    },
    enabled: true,
    priority: 8,
    rateLimit: { requestsPerMinute: 10, cooldownMinutes: 10 },
  },
  {
    id: 'reddit-localllama',
    name: 'r/LocalLLaMA',
    platform: 'reddit',
    category: ['ai'],
    credibilityScore: 6,
    config: {
      type: 'reddit',
      subreddit: 'LocalLLaMA',
      sort: 'hot',
      minScore: 50,
    },
    enabled: true,
    priority: 7,
    rateLimit: { requestsPerMinute: 10, cooldownMinutes: 10 },
  },
  {
    id: 'reddit-cryptocurrency',
    name: 'r/CryptoCurrency',
    platform: 'reddit',
    category: ['crypto'],
    credibilityScore: 5,
    config: {
      type: 'reddit',
      subreddit: 'CryptoCurrency',
      sort: 'hot',
      minScore: 200,
    },
    enabled: true,
    priority: 7,
    rateLimit: { requestsPerMinute: 10, cooldownMinutes: 10 },
  },
  {
    id: 'reddit-bitcoin',
    name: 'r/Bitcoin',
    platform: 'reddit',
    category: ['crypto'],
    credibilityScore: 6,
    config: {
      type: 'reddit',
      subreddit: 'Bitcoin',
      sort: 'hot',
      minScore: 100,
    },
    enabled: true,
    priority: 6,
    rateLimit: { requestsPerMinute: 10, cooldownMinutes: 10 },
  },
  {
    id: 'reddit-technology',
    name: 'r/technology',
    platform: 'reddit',
    category: ['gadget', 'ai', 'security'],
    credibilityScore: 6,
    config: {
      type: 'reddit',
      subreddit: 'technology',
      sort: 'hot',
      minScore: 500,
    },
    enabled: true,
    priority: 7,
    rateLimit: { requestsPerMinute: 10, cooldownMinutes: 10 },
  },
  {
    id: 'reddit-gaming',
    name: 'r/gaming',
    platform: 'reddit',
    category: ['gaming'],
    credibilityScore: 5,
    config: {
      type: 'reddit',
      subreddit: 'gaming',
      sort: 'hot',
      minScore: 1000,
    },
    enabled: true,
    priority: 6,
    rateLimit: { requestsPerMinute: 10, cooldownMinutes: 10 },
  },
  {
    id: 'reddit-esports',
    name: 'r/esports',
    platform: 'reddit',
    category: ['gaming'],
    credibilityScore: 6,
    config: {
      type: 'reddit',
      subreddit: 'esports',
      sort: 'hot',
      minScore: 100,
    },
    enabled: true,
    priority: 6,
    rateLimit: { requestsPerMinute: 10, cooldownMinutes: 10 },
  },
  {
    id: 'reddit-netsec',
    name: 'r/netsec',
    platform: 'reddit',
    category: ['security'],
    credibilityScore: 8,
    config: {
      type: 'reddit',
      subreddit: 'netsec',
      sort: 'hot',
      minScore: 50,
    },
    enabled: true,
    priority: 7,
    rateLimit: { requestsPerMinute: 10, cooldownMinutes: 10 },
  },
  {
    id: 'reddit-startups',
    name: 'r/startups',
    platform: 'reddit',
    category: ['startup'],
    credibilityScore: 5,
    config: {
      type: 'reddit',
      subreddit: 'startups',
      sort: 'hot',
      minScore: 50,
    },
    enabled: true,
    priority: 5,
    rateLimit: { requestsPerMinute: 10, cooldownMinutes: 10 },
  },

  // ─────────────────────────────────────────────────────────────
  // YOUTUBE SOURCES
  // ─────────────────────────────────────────────────────────────
  {
    id: 'youtube-mkbhd',
    name: 'MKBHD',
    platform: 'youtube',
    category: ['gadget'],
    credibilityScore: 8,
    config: {
      type: 'youtube',
      mode: 'channel',
      target: 'UCBJycsmduvYEL83R_U4JriQ',
      maxAgeDays: 7,
    },
    enabled: true,
    priority: 7,
    rateLimit: { requestsPerMinute: 5, cooldownMinutes: 30 },
  },
  {
    id: 'youtube-linustechtips',
    name: 'Linus Tech Tips',
    platform: 'youtube',
    category: ['gadget'],
    credibilityScore: 7,
    config: {
      type: 'youtube',
      mode: 'channel',
      target: 'UCXuqSBlHAE6Xw-yeJA0Tunw',
      maxAgeDays: 7,
    },
    enabled: true,
    priority: 7,
    rateLimit: { requestsPerMinute: 5, cooldownMinutes: 30 },
  },
  {
    id: 'youtube-twominutepapers',
    name: 'Two Minute Papers',
    platform: 'youtube',
    category: ['ai'],
    credibilityScore: 8,
    config: {
      type: 'youtube',
      mode: 'channel',
      target: 'UCbfYPyITQ-7l4upoX8nvctg',
      maxAgeDays: 14,
    },
    enabled: true,
    priority: 7,
    rateLimit: { requestsPerMinute: 5, cooldownMinutes: 30 },
  },
  {
    id: 'youtube-tech-trending',
    name: 'YouTube Tech Trending',
    platform: 'youtube',
    category: ['gadget', 'ai'],
    credibilityScore: 5,
    config: {
      type: 'youtube',
      mode: 'trending',
      target: 'VN',
      minViews: 100000,
    },
    enabled: true,
    priority: 5,
    rateLimit: { requestsPerMinute: 3, cooldownMinutes: 60 },
  },

  // ─────────────────────────────────────────────────────────────
  // TELEGRAM SOURCES
  // ─────────────────────────────────────────────────────────────
  {
    id: 'telegram-coindesk',
    name: 'CoinDesk (Telegram)',
    platform: 'telegram',
    category: ['crypto'],
    credibilityScore: 7,
    config: {
      type: 'telegram',
      channelUsername: 'coindesk',
      minViews: 1000,
    },
    enabled: true,
    priority: 6,
    rateLimit: { requestsPerMinute: 5, cooldownMinutes: 15 },
  },
  {
    id: 'telegram-crypto-news',
    name: 'Crypto News (Telegram)',
    platform: 'telegram',
    category: ['crypto'],
    credibilityScore: 5,
    config: {
      type: 'telegram',
      channelUsername: 'CryptoNewsChannel',
      minViews: 500,
    },
    enabled: true,
    priority: 5,
    rateLimit: { requestsPerMinute: 5, cooldownMinutes: 15 },
  },
]

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

export function getSourceById(id: string): SourceConfig | undefined {
  return SOURCES.find(s => s.id === id)
}

export function getSourcesByPlatform(platform: SourcePlatform): SourceConfig[] {
  return SOURCES.filter(s => s.platform === platform && s.enabled)
}

export function getSourcesByCategory(category: SourceCategory): SourceConfig[] {
  return SOURCES.filter(s => s.category.includes(category) && s.enabled)
}

export function getEnabledSources(): SourceConfig[] {
  return SOURCES.filter(s => s.enabled)
}

export function getSourcesByPriority(minPriority: number = 5): SourceConfig[] {
  return SOURCES
    .filter(s => s.enabled && s.priority >= minPriority)
    .sort((a, b) => b.priority - a.priority)
}
