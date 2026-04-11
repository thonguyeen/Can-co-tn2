// ═══════════════════════════════════════════════════════════════
// FACEBOOK CRAWLER — Graph API (Tier 1) + RSS Fallback (Tier 2)
//
// Tier 1: Facebook Graph API (cần FACEBOOK_ACCESS_TOKEN)
//   - Hoạt động với cả Groups và Pages
//   - Rate limit: 200 req/hour → delay 18s/request
//
// Tier 2: RSS Fallback (public Pages only, không cần token)
//   - Chỉ hoạt động với FB Pages công khai
//   - Groups KHÔNG có RSS
//
// Nếu cả 2 đều không khả dụng → return [], log warn, KHÔNG crash
// ═══════════════════════════════════════════════════════════════

import Parser from 'rss-parser';
import type { RawCrawlItem } from './real-estate-crawler';

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

interface FbGraphPost {
  id: string;
  message?: string;
  story?: string;
  created_time: string;
  permalink_url?: string;
  attachments?: {
    data: Array<{
      media?: { image?: { src: string } };
      unshimmed_url?: string;
    }>;
  };
}

interface FbGraphResponse {
  data: FbGraphPost[];
  paging?: { next?: string };
}

// ─────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────

const FB_CONFIG = {
  graphApiVersion: 'v19.0',
  graphApiBase: 'https://graph.facebook.com',
  maxPostsPerSource: 10,
  requestDelay: 18000,     // 18s delay để tránh rate limit (200 req/hour)
  fetchTimeout: 20000,
  maxMessageLength: 1000,  // Cắt message dài cho content field
} as const;

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

/**
 * Parse Facebook URL → trả về ID hoặc username của group/page
 * Hỗ trợ:
 *   https://www.facebook.com/groups/123456789
 *   https://www.facebook.com/groups/tengroup
 *   https://www.facebook.com/pagename
 *   https://www.facebook.com/profile.php?id=123
 */
function extractFacebookId(url: string): string | null {
  try {
    const parsed = new URL(url);

    // Groups: /groups/[id-or-name]
    const groupMatch = parsed.pathname.match(/^\/groups\/([^/?]+)/);
    if (groupMatch) return groupMatch[1];

    // Profile by numeric ID: /profile.php?id=123
    const profileId = parsed.searchParams.get('id');
    if (profileId && /^\d+$/.test(profileId)) return profileId;

    // Page by username: /pagename (bỏ qua paths như /events, /watch...)
    const page = parsed.pathname.match(/^\/([a-zA-Z0-9.]+)\/?$/);
    if (page && !['events', 'watch', 'marketplace', 'gaming'].includes(page[1])) {
      return page[1];
    }

    return null;
  } catch {
    return null;
  }
}

/** Lấy dòng đầu tiên (≤100 chars) làm "tiêu đề" của bài FB */
function extractTitle(message: string): string {
  const firstLine = message.split('\n')[0].trim();
  return firstLine.length > 100 ? firstLine.slice(0, 97) + '...' : firstLine;
}

/** Delay helper */
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// ─────────────────────────────────────────────────────────────
// FACEBOOK CRAWLER CLASS
// ─────────────────────────────────────────────────────────────

export class FacebookCrawler {
  private accessToken: string | null;
  private hasToken: boolean;
  private rssParser: Parser;

  constructor() {
    this.accessToken = process.env.FACEBOOK_ACCESS_TOKEN || null;
    this.hasToken = !!this.accessToken;
    this.rssParser = new Parser({ timeout: FB_CONFIG.fetchTimeout });

    if (!this.hasToken) {
      console.warn('[FacebookCrawler] No FACEBOOK_ACCESS_TOKEN — Groups will be skipped, Pages via RSS only');
    }
  }

  // ─────────────────────────────────────────────────────────────
  // ENTRY POINT
  // ─────────────────────────────────────────────────────────────

  async crawl(
    url: string,
    type: 'facebook_group' | 'facebook_page',
  ): Promise<RawCrawlItem[]> {
    console.log(`[FacebookCrawler] Crawling ${type}: ${url}`);

    // Tier 1: Graph API (nếu có token)
    if (this.hasToken) {
      try {
        return await this.crawlViaGraphAPI(url, type);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`[FacebookCrawler] Graph API failed: ${msg}. Trying fallback...`);
      }
    }

    // Tier 2: RSS fallback (chỉ cho Pages)
    if (type === 'facebook_page') {
      try {
        return await this.crawlViaRSS(url);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`[FacebookCrawler] RSS fallback failed: ${msg}`);
      }
    }

    // Graceful degradation: không crash, trả về []
    console.warn(`[FacebookCrawler] All methods exhausted for ${url}. Returning empty.`);
    return [];
  }

  // ─────────────────────────────────────────────────────────────
  // TIER 1: Graph API
  // ─────────────────────────────────────────────────────────────

  private async crawlViaGraphAPI(
    url: string,
    type: 'facebook_group' | 'facebook_page',
  ): Promise<RawCrawlItem[]> {
    const fbId = extractFacebookId(url);
    if (!fbId) {
      throw new Error(`Cannot extract Facebook ID from URL: ${url}`);
    }

    const endpoint = type === 'facebook_group'
      ? `${FB_CONFIG.graphApiBase}/${FB_CONFIG.graphApiVersion}/${fbId}/feed`
      : `${FB_CONFIG.graphApiBase}/${FB_CONFIG.graphApiVersion}/${fbId}/posts`;

    const params = new URLSearchParams({
      access_token: this.accessToken!,
      fields: 'id,message,story,created_time,permalink_url,attachments{media,unshimmed_url}',
      limit: String(FB_CONFIG.maxPostsPerSource),
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FB_CONFIG.fetchTimeout);

    let response: Response;
    try {
      response = await fetch(`${endpoint}?${params}`, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' },
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      throw new Error(`Graph API HTTP ${response.status}: ${errorBody.slice(0, 200)}`);
    }

    const data = await response.json() as FbGraphResponse;

    if (!data.data || !Array.isArray(data.data)) {
      throw new Error('Graph API response missing "data" array');
    }

    return data.data
      .filter(post => post.message || post.story)
      .map(post => this.mapGraphPostToRawItem(post, url));
  }

  private mapGraphPostToRawItem(post: FbGraphPost, fallbackUrl: string): RawCrawlItem {
    const message = post.message || post.story || '';
    const title = message ? extractTitle(message) : 'Bài đăng Facebook';
    const content = message.length > FB_CONFIG.maxMessageLength
      ? message.slice(0, FB_CONFIG.maxMessageLength) + '...'
      : message;

    const imageUrl = post.attachments?.data
      .find(a => a.media?.image?.src)?.media?.image?.src;

    return {
      title,
      content,
      url: post.permalink_url || fallbackUrl,
      publishedAt: new Date(post.created_time),
      imageUrl,
    };
  }

  // ─────────────────────────────────────────────────────────────
  // TIER 2: RSS Fallback (Pages only)
  // ─────────────────────────────────────────────────────────────

  private async crawlViaRSS(pageUrl: string): Promise<RawCrawlItem[]> {
    const fbId = extractFacebookId(pageUrl);
    if (!fbId) throw new Error(`Cannot extract page ID from: ${pageUrl}`);

    // FB RSS format cho Page
    const rssUrl = `https://www.facebook.com/feeds/page.php?id=${fbId}&format=rss20`;
    console.log(`[FacebookCrawler] Trying RSS: ${rssUrl}`);

    await delay(FB_CONFIG.requestDelay); // Rate limit
    const feed = await this.rssParser.parseURL(rssUrl);

    if (!feed.items?.length) {
      throw new Error('RSS feed empty or not accessible');
    }

    return feed.items.slice(0, FB_CONFIG.maxPostsPerSource).map(item => ({
      title: item.title || 'Bài đăng Facebook',
      content: item.contentSnippet || item.content || item.title || '',
      url: item.link || pageUrl,
      publishedAt: item.pubDate ? new Date(item.pubDate) : undefined,
      imageUrl: undefined,
    }));
  }
}

// ─────────────────────────────────────────────────────────────
// SINGLETON FACTORY
// ─────────────────────────────────────────────────────────────

let instance: FacebookCrawler | null = null;

export function getFacebookCrawler(): FacebookCrawler {
  if (!instance) {
    instance = new FacebookCrawler();
  }
  return instance;
}
