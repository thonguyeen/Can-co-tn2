// ═══════════════════════════════════════════════════════════════
// REAL ESTATE CRAWLER - Cào tin BĐS từ nguồn RSS/HTML
// Đọc nguồn từ bảng crawl_sources (Admin nhập)
// Pipeline: crawl → dedup → orchestrator.createIntentFromCrawledData()
// ═══════════════════════════════════════════════════════════════

import Parser from 'rss-parser';
import * as cheerio from 'cheerio';
import { prisma } from '@/lib/db';

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
// DEFAULT HTML SELECTORS (cho các trang phổ biến)
// ═══════════════════════════════════════════════════════════════

interface HTMLSelectors {
  listItem: string;     // Container mỗi tin
  title: string;        // Tiêu đề
  link: string;         // Link chi tiết
  content: string;      // Nội dung/mô tả
  price?: string;       // Giá
}

const DEFAULT_SELECTORS: HTMLSelectors = {
  listItem: 'article, .item, .listing, .property-item, .news-item',
  title: 'h2 a, h3 a, .title a, .property-title a',
  link: 'h2 a, h3 a, .title a',
  content: '.summary, .description, .excerpt, p',
  price: '.price, .property-price',
};

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

export class RealEstateCrawler {
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
        default:
          console.warn(`[Crawler] Unsupported sourceType: ${source.sourceType}`);
          items = [];
      }
    } catch (err) {
      console.error(`[Crawler] Crawl error for ${source.name}:`, err);
      items = [];
    }

    console.log(`[Crawler] ${source.name}: ${items.length} raw items`);

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
      // Parse custom selectors nếu có
      let selectors = DEFAULT_SELECTORS;
      if (notesJson) {
        try {
          const custom = JSON.parse(notesJson);
          selectors = { ...DEFAULT_SELECTORS, ...custom };
        } catch {
          // Invalid JSON → dùng default
        }
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

    // Lazy import orchestrator (tránh circular dependency)
    const { getOrchestrator } = await import('./orchestrator');
    const orchestrator = getOrchestrator();

    for (const item of items) {
      // Skip nếu content quá ngắn
      if (item.title.length < 5 && item.content.length < 10) continue;

      try {
        const activity = await orchestrator.createIntentFromCrawledData({
          title: item.title,
          content: item.content || item.title,
          url: item.url,
          province: source.province || undefined,
          district: source.district || undefined,
        });

        if (activity === null) {
          // null = duplicate hoặc no bot available
          duplicate++;
        } else if (activity.status === 'completed') {
          saved++;
        } else if (activity.status === 'failed') {
          // Quota exceeded hoặc duplicate source_url
          if (activity.error?.includes('Duplicate')) {
            duplicate++;
          }
        }
      } catch (err) {
        console.error(`[Crawler] Process item error:`, err);
      }

      // Delay nhỏ giữa mỗi item (tránh spam DB)
      await this.delay(500);
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

let crawlerInstance: RealEstateCrawler | null = null;

export function getRealEstateCrawler(): RealEstateCrawler {
  if (!crawlerInstance) {
    crawlerInstance = new RealEstateCrawler();
  }
  return crawlerInstance;
}
