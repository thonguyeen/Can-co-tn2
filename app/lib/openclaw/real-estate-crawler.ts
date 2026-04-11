// ═══════════════════════════════════════════════════════════════
// GENERIC CRAWLER (formerly RealEstateCrawler)
// Cào tin từ nguồn RSS/HTML/Facebook — category-agnostic
// Đọc nguồn từ bảng crawl_sources (Admin nhập)
// Pipeline (Phase 03): crawl → dedup → saveRawNewsFromCrawl() (Staging buffer) → CuratorBot
// ═══════════════════════════════════════════════════════════════

import Parser from 'rss-parser';
import * as cheerio from 'cheerio';
import { prisma } from '@/lib/db';
import { getSelectorsForUrl, DEFAULT_SELECTORS } from './crawl-selectors';
import { saveRawNewsFromCrawl } from './persistence';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface CrawlSourceData {
  id: string;
  name: string;
  url: string;
  sourceType: string;
  category: string;
  province?: string | null;
  district?: string | null;
  isActive?: boolean | null;
  lastCrawledAt?: Date | null;
  crawlIntervalMinutes?: number | null;
  totalItemsCrawled?: number | null;
  notes?: string | null;
}

export interface RawCrawlItem {
  title: string;
  content: string;
  url: string;
  publishedAt?: Date;
  imageUrl?: string;
}

export interface CrawlResult {
  sourcesProcessed: number;
  sourcesSkipped: number;
  itemsCrawled: number;
  itemsDuplicate: number;
  itemsSaved: number;
  errors: string[];
  duration: number;
}

// ═══════════════════════════════════════════════════════════════
// NOTE: DEFAULT_SELECTORS và SITE_PRESETS đã chuyển sang
// crawl-selectors.ts — import từ đó để dùng
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// CRAWLER CONFIG
// ═══════════════════════════════════════════════════════════════

const CRAWLER_CONFIG = {
  maxConcurrent: 3,         // Số nguồn cào song song
  delayBetweenRequests: 2000, // ms delay giữa mỗi request
  fetchTimeout: 15000,      // 15s timeout
  maxItemsPerSource: 20,    // Max items mỗi nguồn
  userAgent: 'CanCoBot/1.0 (+https://canco.vn)',
};

// ═══════════════════════════════════════════════════════════════
// REAL ESTATE CRAWLER CLASS
// ═══════════════════════════════════════════════════════════════

export class GenericCrawler {
  private parser: Parser;

  constructor() {
    this.parser = new Parser({
      timeout: CRAWLER_CONFIG.fetchTimeout,
      headers: {
        'User-Agent': CRAWLER_CONFIG.userAgent,
      },
    });
  }

  // ─────────────────────────────────────────────────────────────
  // ENTRY POINT: Cào tất cả nguồn active
  // ─────────────────────────────────────────────────────────────

  async crawlAll(): Promise<CrawlResult> {
    const startTime = Date.now();
    const result: CrawlResult = {
      sourcesProcessed: 0,
      sourcesSkipped: 0,
      itemsCrawled: 0,
      itemsDuplicate: 0,
      itemsSaved: 0,
      errors: [],
      duration: 0,
    };

    try {
      // 1. Fetch nguồn active từ DB
      const sources = await prisma.crawlSource.findMany({
        where: { isActive: true },
        orderBy: { lastCrawledAt: { sort: 'asc', nulls: 'first' } }
      });

      console.log(`[Crawler] Found ${sources.length} active sources`);

      // 2. Filter nguồn đến giờ cào
      const sourcesToCrawl = sources.filter((s) => this.shouldCrawl(s));
      result.sourcesSkipped = sources.length - sourcesToCrawl.length;

      console.log(`[Crawler] ${sourcesToCrawl.length} sources ready, ${result.sourcesSkipped} skipped (not due)`);

      // 3. Cào song song (max concurrent)
      const chunks = this.chunkArray(sourcesToCrawl, CRAWLER_CONFIG.maxConcurrent);
      for (const chunk of chunks) {
        const chunkResults = await Promise.allSettled(
          chunk.map((source) => this.crawlAndProcess(source))
        );

        for (const r of chunkResults) {
          if (r.status === 'fulfilled') {
            result.sourcesProcessed++;
            result.itemsCrawled += r.value.crawled;
            result.itemsDuplicate += r.value.duplicate;
            result.itemsSaved += r.value.saved;
          } else {
            result.errors.push(r.reason?.message || 'Unknown crawl error');
          }
        }

        // Delay giữa mỗi batch
        if (chunks.indexOf(chunk) < chunks.length - 1) {
          await this.delay(CRAWLER_CONFIG.delayBetweenRequests);
        }
      }
    } catch (error) {
      result.errors.push(`DB error: ${error instanceof Error ? error.message : 'Unknown'}`);
    }

    result.duration = Date.now() - startTime;
    console.log(
      `[Crawler] Done: ${result.sourcesProcessed} sources, ` +
      `${result.itemsSaved} saved, ${result.itemsDuplicate} dup, ` +
      `${result.duration}ms`
    );

    return result;
  }

  // ─────────────────────────────────────────────────────────────
  // CÀO 1 NGUỒN CỤ THỂ (theo ID)
  // ─────────────────────────────────────────────────────────────

  async crawlSourceById(sourceId: string): Promise<CrawlResult> {
    const startTime = Date.now();
    const result: CrawlResult = {
      sourcesProcessed: 0,
      sourcesSkipped: 0,
      itemsCrawled: 0,
      itemsDuplicate: 0,
      itemsSaved: 0,
      errors: [],
      duration: 0,
    };

    try {
      const source = await prisma.crawlSource.findUnique({
        where: { id: sourceId }
      });

      if (!source) {
        result.errors.push(`Source not found: ${sourceId}`);
        result.duration = Date.now() - startTime;
        return result;
      }

      const r = await this.crawlAndProcess(source);
      result.sourcesProcessed = 1;
      result.itemsCrawled = r.crawled;
      result.itemsDuplicate = r.duplicate;
      result.itemsSaved = r.saved;
    } catch (err) {
      result.errors.push(err instanceof Error ? err.message : 'Unknown error');
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  // ─────────────────────────────────────────────────────────────
  // CRAWL + PROCESS 1 SOURCE
  // ─────────────────────────────────────────────────────────────

  private async crawlAndProcess(source: CrawlSourceData): Promise<{
    crawled: number;
    duplicate: number;
    saved: number;
  }> {
    console.log(`[Crawler] Crawling: ${source.name} (${source.sourceType})`);

    // 1. Cào raw items
    let items: RawCrawlItem[];
    try {
      switch (source.sourceType) {
        case 'rss':
          items = await this.crawlRSS(source.url);
          break;
        case 'html':
          items = await this.crawlHTML(source.url, source.notes || undefined);
          break;
        case 'facebook_group':
        case 'facebook_page': {
          const { getFacebookCrawler } = await import('./facebook-crawler');
          items = await getFacebookCrawler().crawl(
            source.url,
            source.sourceType as 'facebook_group' | 'facebook_page',
          );
          break;
        }
        default:
          console.warn(`[Crawler] Unsupported sourceType: ${source.sourceType}`);
          items = [];
      }
    } catch (err) {
      console.error(`[Crawler] Crawl error for ${source.name}:`, err);
      items = [];
    }

    console.log(`[Crawler] ${source.name}: ${items.length} raw items`);
    // Stale selector warning: nếu HTML source mà 0 items → có thể selector lỗi thời
    if (items.length === 0 && source.sourceType === 'html') {
      console.warn(`[Crawler] ⚠️ STALE SELECTOR? Source "${source.name}" returned 0 HTML items. Check selectors.`);
    }

    // 2. Process (dedup + gọi orchestrator)
    const processResult = await this.processItems(items, source);

    // 3. Update stats
    await this.updateCrawlStats(
      source.id,
      (source.totalItemsCrawled || 0) + processResult.saved
    );

    return processResult;
  }

  // ─────────────────────────────────────────────────────────────
  // RSS CRAWLER (rss-parser)
  // ─────────────────────────────────────────────────────────────

  async crawlRSS(url: string): Promise<RawCrawlItem[]> {
    try {
      const feed = await this.parser.parseURL(url);
      const items: RawCrawlItem[] = [];

      for (const entry of (feed.items || []).slice(0, CRAWLER_CONFIG.maxItemsPerSource)) {
        const itemUrl = entry.link || entry.guid || '';
        if (!itemUrl) continue;

        items.push({
          title: this.stripHtml(entry.title || 'Untitled'),
          content: this.stripHtml(entry.contentSnippet || entry.content || entry.summary || ''),
          url: itemUrl,
          publishedAt: entry.pubDate ? new Date(entry.pubDate) : undefined,
          imageUrl: this.extractRSSImage(entry),
        });
      }

      return items;
    } catch (error) {
      console.error(`[Crawler] RSS error for ${url}:`, error);
      return [];
    }
  }

  // ─────────────────────────────────────────────────────────────
  // HTML CRAWLER (cheerio)
  // ─────────────────────────────────────────────────────────────

  async crawlHTML(url: string, notesJson?: string): Promise<RawCrawlItem[]> {
    try {
      // Auto-detect selectors: customJson > domain preset > DEFAULT
      const { selectors, presetName } = getSelectorsForUrl(url, notesJson);
      if (presetName) {
        console.log(`[Crawler] Using preset selectors: ${presetName}`);
      } else {
        console.log(`[Crawler] Using DEFAULT selectors for ${url}`);
      }

      // Fetch HTML
      const response = await fetch(url, {
        headers: { 'User-Agent': CRAWLER_CONFIG.userAgent },
        signal: AbortSignal.timeout(CRAWLER_CONFIG.fetchTimeout),
      });

      if (!response.ok) {
        console.error(`[Crawler] HTTP ${response.status} for ${url}`);
        return [];
      }

      const html = await response.text();
      const $ = cheerio.load(html);
      const items: RawCrawlItem[] = [];
      const baseUrl = new URL(url).origin;

      $(selectors.listItem).each((i, el) => {
        if (i >= CRAWLER_CONFIG.maxItemsPerSource) return false; // break

        const $el = $(el);
        const titleEl = $el.find(selectors.title).first();
        const linkEl = $el.find(selectors.link).first();

        const title = titleEl.text().trim();
        let link = linkEl.attr('href') || '';
        const content = $el.find(selectors.content).first().text().trim();

        // Skip nếu thiếu title hoặc link
        if (!title || !link) return;

        // Resolve relative URL
        if (link.startsWith('/')) {
          link = baseUrl + link;
        }

        items.push({
          title: title.slice(0, 300),
          content: content.slice(0, 1000),
          url: link,
        });
      });

      return items;
    } catch (error) {
      console.error(`[Crawler] HTML error for ${url}:`, error);
      return [];
    }
  }

  // ─────────────────────────────────────────────────────────────
  // PROCESS ITEMS (Dedup + gọi Orchestrator)
  // ─────────────────────────────────────────────────────────────

  private async processItems(
    items: RawCrawlItem[],
    source: CrawlSourceData,
  ): Promise<{ crawled: number; duplicate: number; saved: number }> {
    let duplicate = 0;
    let saved = 0;

    for (const item of items) {
      // Skip nếu content quá ngắn
      if (item.title.length < 5 && item.content.length < 10) continue;

      try {
        // Phase 03: Lưu vào RawNews buffer (Dedup check C1 nằm bên trong saveRawNewsFromCrawl)
        const rawNewsId = await saveRawNewsFromCrawl({
          title: item.title,
          content: item.content || item.title,
          originalUrl: item.url,
          imageUrl: item.imageUrl,
          publishedAt: item.publishedAt,
          crawlSourceId: source.id,
        });

        if (!rawNewsId) {
          // null means duplicate or failed
          duplicate++;
        } else {
          saved++;
        }
      } catch (err) {
        console.error(`[Crawler] Process item error:`, err);
      }
    }

    return { crawled: items.length, duplicate, saved };
  }

  // ─────────────────────────────────────────────────────────────
  // UTILITIES
  // ─────────────────────────────────────────────────────────────

  shouldCrawl(source: CrawlSourceData): boolean {
    if (!source.lastCrawledAt) return true; // Chưa cào lần nào

    const lastCrawl = new Date(source.lastCrawledAt).getTime();
    const interval = (source.crawlIntervalMinutes || 60) * 60 * 1000;
    return Date.now() - lastCrawl >= interval;
  }

  private async updateCrawlStats(sourceId: string, totalItems: number): Promise<void> {
    await prisma.crawlSource.update({
      where: { id: sourceId },
      data: {
        lastCrawledAt: new Date(),
        totalItemsCrawled: totalItems,
        updatedAt: new Date(),
      }
    });
  }

  private stripHtml(text: string): string {
    return text.replace(/<[^>]*>/g, '').trim();
  }

  private extractRSSImage(item: Record<string, unknown>): string | undefined {
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

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ═══════════════════════════════════════════════════════════════
// SINGLETON
// ═══════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────
// Type alias để backward compat
// ─────────────────────────────────────────────────────────────
export type RealEstateCrawler = GenericCrawler;

let crawlerInstance: GenericCrawler | null = null;

export function getGenericCrawler(): GenericCrawler {
  if (!crawlerInstance) {
    crawlerInstance = new GenericCrawler();
  }
  return crawlerInstance;
}

// Backward compat alias — trigger/route.ts và cron/crawler/route.ts dùng cái này
export function getRealEstateCrawler(): GenericCrawler {
  return getGenericCrawler();
}
