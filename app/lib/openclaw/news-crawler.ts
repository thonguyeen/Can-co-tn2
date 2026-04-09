// ═══════════════════════════════════════════════════════════════
// NEWS CRAWLER - Fetch Real News for Bot Reactions
// Supports RSS feeds, APIs, and web scraping
// ═══════════════════════════════════════════════════════════════

import Parser from 'rss-parser';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content?: string;
  url: string;
  source: string;
  sourceCategory: string;
  publishedAt: Date;
  imageUrl?: string;
  tags?: string[];
  relevantBots?: string[]; // Bots that should react
}

export interface NewsSource {
  id: string;
  name: string;
  nameVi: string;
  url: string;
  type: 'rss' | 'api' | 'scrape';
  category: string;
  language: 'vi' | 'en';
  reliability: 'high' | 'medium' | 'low';
  updateFrequency: number; // minutes
}

// ═══════════════════════════════════════════════════════════════
// NEWS SOURCES - Vietnamese Tech & Finance News
// ═══════════════════════════════════════════════════════════════

export const NEWS_SOURCES: NewsSource[] = [
  // Tech News
  {
    id: 'vnexpress_tech',
    name: 'VnExpress Tech',
    nameVi: 'VnExpress Công nghệ',
    url: 'https://vnexpress.net/rss/khoa-hoc.rss',
    type: 'rss',
    category: 'tech',
    language: 'vi',
    reliability: 'high',
    updateFrequency: 30,
  },
  {
    id: 'genk',
    name: 'GenK',
    nameVi: 'GenK',
    url: 'https://genk.vn/rss/home.rss',
    type: 'rss',
    category: 'tech',
    language: 'vi',
    reliability: 'high',
    updateFrequency: 30,
  },
  {
    id: 'techcrunch',
    name: 'TechCrunch',
    nameVi: 'TechCrunch',
    url: 'https://techcrunch.com/feed/',
    type: 'rss',
    category: 'tech',
    language: 'en',
    reliability: 'high',
    updateFrequency: 15,
  },

  // Finance News
  {
    id: 'vnexpress_finance',
    name: 'VnExpress Finance',
    nameVi: 'VnExpress Kinh doanh',
    url: 'https://vnexpress.net/rss/kinh-doanh.rss',
    type: 'rss',
    category: 'finance',
    language: 'vi',
    reliability: 'high',
    updateFrequency: 30,
  },
  {
    id: 'cafef',
    name: 'CafeF',
    nameVi: 'CafeF',
    url: 'https://cafef.vn/rss/home.rss',
    type: 'rss',
    category: 'finance',
    language: 'vi',
    reliability: 'high',
    updateFrequency: 15,
  },

  // Crypto News
  {
    id: 'coindesk',
    name: 'CoinDesk',
    nameVi: 'CoinDesk',
    url: 'https://www.coindesk.com/arc/outboundfeeds/rss/',
    type: 'rss',
    category: 'crypto',
    language: 'en',
    reliability: 'high',
    updateFrequency: 15,
  },

  // Startup News
  {
    id: 'techinasia',
    name: 'Tech in Asia',
    nameVi: 'Tech in Asia',
    url: 'https://www.techinasia.com/feed',
    type: 'rss',
    category: 'startup',
    language: 'en',
    reliability: 'high',
    updateFrequency: 60,
  },

  // General News Vietnam
  {
    id: 'vnexpress_news',
    name: 'VnExpress News',
    nameVi: 'VnExpress Thời sự',
    url: 'https://vnexpress.net/rss/thoi-su.rss',
    type: 'rss',
    category: 'news',
    language: 'vi',
    reliability: 'high',
    updateFrequency: 15,
  },
  {
    id: 'tuoitre',
    name: 'Tuoi Tre',
    nameVi: 'Tuổi Trẻ',
    url: 'https://tuoitre.vn/rss/tin-moi-nhat.rss',
    type: 'rss',
    category: 'news',
    language: 'vi',
    reliability: 'high',
    updateFrequency: 15,
  },

  // Gaming/Esports
  {
    id: 'game4v',
    name: 'Game4V',
    nameVi: 'Game4V',
    url: 'https://game4v.com/feed/',
    type: 'rss',
    category: 'gaming',
    language: 'vi',
    reliability: 'medium',
    updateFrequency: 60,
  },
];

// ═══════════════════════════════════════════════════════════════
// BOT-CATEGORY MAPPING
// ═══════════════════════════════════════════════════════════════

export const CATEGORY_BOT_MAPPING: Record<string, string[]> = {
  tech: ['minh_ai', 'nam_gadget', 'duc_security'],
  finance: ['mai_finance', 'hung_crypto'],
  crypto: ['hung_crypto', 'minh_ai'],
  startup: ['lan_startup', 'mai_finance'],
  news: ['an_politics', 'linh_lifestyle'],
  gaming: ['tuan_esports'],
  lifestyle: ['linh_lifestyle'],
  security: ['duc_security'],
};

// Keywords to match bots
export const KEYWORD_BOT_MAPPING: Record<string, string[]> = {
  // AI/ML keywords
  'AI': ['minh_ai'],
  'GPT': ['minh_ai'],
  'machine learning': ['minh_ai'],
  'ChatGPT': ['minh_ai'],
  'OpenAI': ['minh_ai'],
  'LLM': ['minh_ai'],
  'neural': ['minh_ai'],

  // Crypto keywords
  'Bitcoin': ['hung_crypto'],
  'BTC': ['hung_crypto'],
  'Ethereum': ['hung_crypto'],
  'ETH': ['hung_crypto'],
  'crypto': ['hung_crypto'],
  'blockchain': ['hung_crypto', 'minh_ai'],
  'DeFi': ['hung_crypto'],
  'NFT': ['hung_crypto'],
  'Web3': ['hung_crypto'],

  // Finance keywords
  'VN-Index': ['mai_finance'],
  'chứng khoán': ['mai_finance'],
  'cổ phiếu': ['mai_finance'],
  'đầu tư': ['mai_finance', 'hung_crypto'],
  'ngân hàng': ['mai_finance'],
  'lãi suất': ['mai_finance'],
  'FED': ['mai_finance'],

  // Startup keywords
  'startup': ['lan_startup'],
  'khởi nghiệp': ['lan_startup'],
  'gọi vốn': ['lan_startup', 'mai_finance'],
  'Series A': ['lan_startup'],
  'unicorn': ['lan_startup'],

  // Security keywords
  'hack': ['duc_security'],
  'bảo mật': ['duc_security'],
  'lộ dữ liệu': ['duc_security'],
  'ransomware': ['duc_security'],
  'malware': ['duc_security'],
  'CVE': ['duc_security'],

  // Gaming keywords
  'esports': ['tuan_esports'],
  'game': ['tuan_esports'],
  'LMHT': ['tuan_esports'],
  'Valorant': ['tuan_esports'],

  // Politics
  'chính sách': ['an_politics'],
  'quốc hội': ['an_politics'],
  'luật': ['an_politics'],
};

// ═══════════════════════════════════════════════════════════════
// NEWS CRAWLER CLASS
// ═══════════════════════════════════════════════════════════════

export class NewsCrawler {
  private parser: Parser;
  private cache: Map<string, NewsItem[]> = new Map();
  private lastFetch: Map<string, number> = new Map();

  constructor() {
    this.parser = new Parser({
      timeout: 10000,
      headers: {
        'User-Agent': 'FACEBOT News Crawler/1.0',
      },
    });
  }

  // ─────────────────────────────────────────────────────────────
  // FETCH NEWS
  // ─────────────────────────────────────────────────────────────

  async fetchFromSource(source: NewsSource): Promise<NewsItem[]> {
    // Check cache
    const cacheKey = source.id;
    const lastFetchTime = this.lastFetch.get(cacheKey) || 0;
    const now = Date.now();

    if (now - lastFetchTime < source.updateFrequency * 60 * 1000) {
      return this.cache.get(cacheKey) || [];
    }

    try {
      console.log(`[NewsCrawler] Fetching from ${source.name}...`);

      if (source.type === 'rss') {
        const items = await this.fetchRSS(source);
        this.cache.set(cacheKey, items);
        this.lastFetch.set(cacheKey, now);
        return items;
      }

      return [];
    } catch (error) {
      console.error(`[NewsCrawler] Error fetching ${source.name}:`, error);
      return this.cache.get(cacheKey) || [];
    }
  }

  private async fetchRSS(source: NewsSource): Promise<NewsItem[]> {
    try {
      const feed = await this.parser.parseURL(source.url);

      return (feed.items || []).slice(0, 10).map((item, index) => {
        const newsItem: NewsItem = {
          id: `${source.id}_${item.guid || item.link || index}`,
          title: item.title || 'Untitled',
          summary: this.extractSummary(item.contentSnippet || item.content || ''),
          content: item.content,
          url: item.link || '',
          source: source.name,
          sourceCategory: source.category,
          publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
          imageUrl: this.extractImage(item),
          tags: item.categories || [],
        };

        // Determine relevant bots
        newsItem.relevantBots = this.findRelevantBots(newsItem, source);

        return newsItem;
      });
    } catch (error) {
      console.error(`[NewsCrawler] RSS parse error for ${source.name}:`, error);
      return [];
    }
  }

  private extractSummary(content: string): string {
    // Remove HTML tags
    const text = content.replace(/<[^>]*>/g, '').trim();
    // Limit to 300 chars
    return text.length > 300 ? text.slice(0, 300) + '...' : text;
  }

  private extractImage(item: Record<string, unknown>): string | undefined {
    // Try various RSS image fields
    if (item.enclosure && typeof item.enclosure === 'object') {
      const enc = item.enclosure as { url?: string };
      if (enc.url) return enc.url;
    }
    if (item['media:content'] && typeof item['media:content'] === 'object') {
      const media = item['media:content'] as { $?: { url?: string } };
      if (media.$?.url) return media.$.url;
    }
    return undefined;
  }

  // ─────────────────────────────────────────────────────────────
  // BOT MATCHING
  // ─────────────────────────────────────────────────────────────

  private findRelevantBots(news: NewsItem, source: NewsSource): string[] {
    const bots = new Set<string>();

    // Add bots by category
    const categoryBots = CATEGORY_BOT_MAPPING[source.category] || [];
    categoryBots.forEach(b => bots.add(b));

    // Add bots by keywords
    const titleLower = news.title.toLowerCase();
    const summaryLower = news.summary.toLowerCase();
    const text = `${titleLower} ${summaryLower}`;

    for (const [keyword, keywordBots] of Object.entries(KEYWORD_BOT_MAPPING)) {
      if (text.includes(keyword.toLowerCase())) {
        keywordBots.forEach(b => bots.add(b));
      }
    }

    return Array.from(bots);
  }

  // ─────────────────────────────────────────────────────────────
  // FETCH ALL
  // ─────────────────────────────────────────────────────────────

  async fetchAllNews(): Promise<NewsItem[]> {
    const allNews: NewsItem[] = [];

    const results = await Promise.allSettled(
      NEWS_SOURCES.map(source => this.fetchFromSource(source))
    );

    for (const result of results) {
      if (result.status === 'fulfilled') {
        allNews.push(...result.value);
      }
    }

    // Sort by date, newest first
    allNews.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

    return allNews;
  }

  async fetchByCategory(category: string): Promise<NewsItem[]> {
    const sources = NEWS_SOURCES.filter(s => s.category === category);
    const allNews: NewsItem[] = [];

    const results = await Promise.allSettled(
      sources.map(source => this.fetchFromSource(source))
    );

    for (const result of results) {
      if (result.status === 'fulfilled') {
        allNews.push(...result.value);
      }
    }

    return allNews.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
  }

  async fetchForBot(botHandle: string): Promise<NewsItem[]> {
    const allNews = await this.fetchAllNews();
    return allNews.filter(news =>
      news.relevantBots?.includes(botHandle)
    );
  }

  // ─────────────────────────────────────────────────────────────
  // GET TRENDING/HOT NEWS
  // ─────────────────────────────────────────────────────────────

  async getTrendingNews(limit = 5): Promise<NewsItem[]> {
    const allNews = await this.fetchAllNews();

    // Filter to last 6 hours
    const sixHoursAgo = Date.now() - 6 * 60 * 60 * 1000;
    const recentNews = allNews.filter(
      n => n.publishedAt.getTime() > sixHoursAgo
    );

    // Prioritize news with multiple relevant bots (more interesting)
    recentNews.sort((a, b) => {
      const aScore = (a.relevantBots?.length || 0) + (a.tags?.length || 0);
      const bScore = (b.relevantBots?.length || 0) + (b.tags?.length || 0);
      return bScore - aScore;
    });

    return recentNews.slice(0, limit);
  }
}

// ═══════════════════════════════════════════════════════════════
// SINGLETON
// ═══════════════════════════════════════════════════════════════

let crawlerInstance: NewsCrawler | null = null;

export function getNewsCrawler(): NewsCrawler {
  if (!crawlerInstance) {
    crawlerInstance = new NewsCrawler();
  }
  return crawlerInstance;
}
