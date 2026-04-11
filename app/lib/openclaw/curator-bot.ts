// ═══════════════════════════════════════════════════════════════
// CURATOR BOT — LLM Parse Pipeline (Phase 03)
//
// Nhiệm vụ: Đọc RawNews chưa xử lý → LLM parse → tạo Intent có cấu trúc
// KHÔNG cào data. KHÔNG tự tạo nội dung. CHỈ extract + format.
//
// Conditions đã apply:
//   C2: isRunning lock guard — tránh dual-process race condition
//   C3: Config cache module-level với TTL 5 phút
// ═══════════════════════════════════════════════════════════════

import { prisma } from '@/lib/db';
import { chatWithJSON } from '@/lib/ai/client';
import {
  saveIntentFromBot,
  checkDuplicate,
  matchBotToRegion,
  markRawNewsProcessed,
} from './persistence';

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

export interface CurateJobResult {
  total: number;       // Tổng RawNews được query
  parsed: number;      // Tạo Intent thành công
  skipped: number;     // Duplicate sourceUrl
  failed: number;      // LLM error → fallback applied
  duration: number;    // ms
}

interface ParsedIntentData {
  title: string;
  type: 'CAN' | 'CO';
  price?: number;
  priceMin?: number;
  priceMax?: number;
  district?: string;
  ward?: string;
  city?: string;
  subcategory?: string;   // apartment|house|land|commercial
  area?: number;          // m²
  summary: string;        // 2-3 câu mô tả sạch
}

interface CuratorBotConfig {
  handle: string;
  systemPrompt: string;
  knowledgeText?: string;
  category: string;
}

interface RawNewsItem {
  id: string;
  title: string;
  content: string | null;
  originalUrl: string;
  crawlSourceId: string | null;
  crawlSource?: {
    province: string | null;
  } | null;
}

// ─────────────────────────────────────────────────────────────
// C3: MODULE-LEVEL CONFIG CACHE (5 phút TTL)
// In Next.js serverless, module-level state persist trong 1 worker lifetime.
// TTL check bằng Date.now() để không dùng Redis.
// ─────────────────────────────────────────────────────────────

let _configCache: { config: CuratorBotConfig; loadedAt: number } | null = null;
const CONFIG_CACHE_TTL_MS = 5 * 60 * 1000; // 5 phút

// ─────────────────────────────────────────────────────────────
// DEFAULT SYSTEM PROMPT (BĐS)
// Admin có thể override qua Bot.systemPrompt trong DB
// ─────────────────────────────────────────────────────────────

const DEFAULT_BDS_SYSTEM_PROMPT = `Bạn là PARSER BẤT ĐỘNG SẢN. Nhiệm vụ duy nhất: extract thông tin từ text.

QUY TẮC BẮT BUỘC:
1. KHÔNG bịa thêm thông tin không có trong text
2. KHÔNG viết lại hay sáng tạo nội dung
3. Trả về DUY NHẤT JSON hợp lệ, KHÔNG có text giải thích xung quanh

SCHEMA PHẢI THEO ĐÚNG (tất cả fields là optional trừ title, type, summary):
{
  "title": "Tiêu đề ngắn gọn ≤ 80 ký tự",
  "type": "CAN nếu muốn mua/thuê, CO nếu muốn bán/cho thuê",
  "price": số nguyên VNĐ hoặc null,
  "priceMin": null,
  "priceMax": null,
  "district": "Quận/Huyện hoặc null",
  "ward": "Phường/Xã hoặc null",
  "city": "Thành phố, mặc định Hồ Chí Minh nếu không rõ",
  "subcategory": "apartment|house|land|commercial hoặc null",
  "area": số m² hoặc null,
  "summary": "2-3 câu mô tả súc tích, CHỈ dùng thông tin có trong text"
}`;

// ─────────────────────────────────────────────────────────────
// CURATOR BOT CLASS
// ─────────────────────────────────────────────────────────────

export class CuratorBot {
  private botHandle: string;

  // C2: isRunning lock guard — ngăn dual-process race condition
  private isRunning = false;

  constructor(botHandle = 'curator_bds') {
    this.botHandle = botHandle;
  }

  // ─────────────────────────────────────────────────────────────
  // ENTRY POINT — gọi từ API trigger hoặc cron
  // ─────────────────────────────────────────────────────────────

  async processUnprocessedNews(limit = 10): Promise<CurateJobResult> {
    // C2: Lock guard — không cho phép 2 process cùng chạy
    if (this.isRunning) {
      console.warn('[CuratorBot] Already running, skipping duplicate trigger');
      return { total: 0, parsed: 0, skipped: 0, failed: 0, duration: 0 };
    }

    this.isRunning = true;
    const startTime = Date.now();
    const result: CurateJobResult = { total: 0, parsed: 0, skipped: 0, failed: 0, duration: 0 };

    try {
      const config = await this.loadConfig();
      console.log(`[CuratorBot] Starting with bot=${this.botHandle}, limit=${limit}`);

      // Query RawNews chưa xử lý
      const unprocessed = await prisma.rawNews.findMany({
        where: { isProcessed: false },
        orderBy: { createdAt: 'asc' },   // Xử lý theo thứ tự cào
        take: limit,
        select: {
          id: true,
          title: true,
          content: true,
          originalUrl: true,
          crawlSourceId: true,
          crawlSource: {
            select: { province: true },
          },
        },
      });

      result.total = unprocessed.length;
      console.log(`[CuratorBot] Found ${unprocessed.length} unprocessed items`);

      for (const rawNews of unprocessed) {
        await this.processOne(rawNews, config, result);
        // Throttle: 1s delay giữa mỗi item (tránh LLM rate limit)
        await delay(1000);
      }
    } catch (err) {
      console.error('[CuratorBot] Fatal error in processUnprocessedNews:', err);
    } finally {
      this.isRunning = false;
      result.duration = Date.now() - startTime;
    }

    console.log(
      `[CuratorBot] Done: ${result.parsed} parsed, ${result.skipped} skipped, ` +
      `${result.failed} failed, ${result.duration}ms`
    );
    return result;
  }

  // ─────────────────────────────────────────────────────────────
  // PROCESS 1 ITEM
  // ─────────────────────────────────────────────────────────────

  private async processOne(
    rawNews: RawNewsItem,
    config: CuratorBotConfig,
    result: CurateJobResult,
  ): Promise<void> {
    try {
      // 1. Dedup check — không tạo Intent trùng sourceUrl
      const isDup = await checkDuplicate(rawNews.originalUrl);
      if (isDup) {
        console.log(`[CuratorBot] Skip duplicate: ${rawNews.originalUrl}`);
        result.skipped++;
        await markRawNewsProcessed(rawNews.id); // Mark processed dù là dup
        return;
      }

      // 2. Parse qua LLM
      const rawText = `Tiêu đề: ${rawNews.title}\n\nNội dung: ${(rawNews.content || '').slice(0, 1500)}`;
      const fallbackCity = rawNews.crawlSource?.province || 'Hồ Chí Minh';
      const { parsed, error: parseError } = await this.parseWithRetry(rawText, config.systemPrompt, config.knowledgeText, fallbackCity);

      // 3. Tìm bot phù hợp theo khu vực
      // C5 (Tech Lead): Fallback về curator_bds nếu không match envoy bot nào
      const botHandle = (await matchBotToRegion(parsed.city, parsed.district)) || this.botHandle;

      // 4. Save Intent
      const intentId = await saveIntentFromBot({
        botHandle,
        title: parsed.title,
        type: parsed.type,
        content: parsed.summary,
        source_url: rawNews.originalUrl,
        province: parsed.city,
        district: parsed.district,
        ward: parsed.ward,
        city: parsed.city || 'Hồ Chí Minh',
        price: parsed.price,
        category: config.category,
        metadata: {
          parsedData: parsed,
          rawNewsId: rawNews.id,
          curatedBy: this.botHandle,
          parseError: parseError || null,
        },
      });

      // 5. Mark processed
      await markRawNewsProcessed(rawNews.id, parseError);

      if (intentId) {
        result.parsed++;
        console.log(`[CuratorBot] Intent created: ${intentId} from ${rawNews.originalUrl}`);
      } else {
        result.failed++;
        console.warn(`[CuratorBot] saveIntentFromBot returned null for ${rawNews.originalUrl}`);
        await markRawNewsProcessed(rawNews.id, 'saveIntentFromBot returned null');
      }
    } catch (err) {
      result.failed++;
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[CuratorBot] Error processing ${rawNews.id}:`, msg);
      await markRawNewsProcessed(rawNews.id, msg.slice(0, 500));
    }
  }

  // ─────────────────────────────────────────────────────────────
  // PARSE VỚI RETRY (max 2 lần) + FALLBACK
  // ─────────────────────────────────────────────────────────────

  async parseRawToIntent(rawText: string, systemPrompt?: string, knowledgeText?: string): Promise<ParsedIntentData> {
    const config = await this.loadConfig();
    const { parsed } = await this.parseWithRetry(
      rawText,
      systemPrompt || config.systemPrompt,
      knowledgeText,
    );
    return parsed;
  }

  private async parseWithRetry(
    rawText: string,
    systemPrompt: string,
    knowledgeText?: string,
    fallbackCity = 'Hồ Chí Minh',
  ): Promise<{ parsed: ParsedIntentData; error?: string }> {
    const prompt = knowledgeText
      ? `${rawText}\n\n[Kiến thức bổ sung]: ${knowledgeText.slice(0, 500)}`
      : rawText;

    try {
      const result = await chatWithJSON<ParsedIntentData>(
        systemPrompt,
        prompt,
        { maxRetries: 2, temperature: 0.1 }
      );

      // Validate minimum required fields
      if (!result.title || !result.type || !result.summary) {
        throw new Error('Missing required fields: title, type, or summary');
      }

      // Normalize type
      const type: 'CAN' | 'CO' = result.type?.toUpperCase() === 'CAN' ? 'CAN' : 'CO';

      return {
        parsed: {
          ...result,
          type,
          title: result.title.slice(0, 120),
          summary: result.summary.slice(0, 1000),
        },
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'LLM parse failed';
      console.warn(`[CuratorBot] Parse failed (using fallback): ${msg}`);

      // Fallback: dùng raw data trực tiếp — không bỏ item
      const firstLine = rawText.split('\n')[0].replace('Tiêu đề: ', '').trim();
      return {
        parsed: {
          title: firstLine.slice(0, 120) || 'Tin BĐS',
          type: 'CO',
          summary: rawText.slice(0, 500),
          city: fallbackCity,
        },
        error: msg.slice(0, 500),
      };
    }
  }

  // ─────────────────────────────────────────────────────────────
  // C3: CONFIG CACHE với TTL 5 phút
  // ─────────────────────────────────────────────────────────────

  private async loadConfig(): Promise<CuratorBotConfig> {
    const now = Date.now();

    // Cache hit
    if (_configCache && (now - _configCache.loadedAt) < CONFIG_CACHE_TTL_MS) {
      return _configCache.config;
    }

    // Cache miss → load từ DB
    try {
      const bot = await prisma.bot.findUnique({
        where: { handle: this.botHandle },
        select: { handle: true, systemPrompt: true, knowledgeText: true, botType: true },
      });

      const config: CuratorBotConfig = {
        handle: bot?.handle || this.botHandle,
        systemPrompt: bot?.systemPrompt || DEFAULT_BDS_SYSTEM_PROMPT,
        knowledgeText: bot?.knowledgeText || undefined,
        category: 'real_estate',
      };

      _configCache = { config, loadedAt: now };
      return config;
    } catch (err) {
      console.warn('[CuratorBot] Failed to load config from DB, using defaults:', err);
      return {
        handle: this.botHandle,
        systemPrompt: DEFAULT_BDS_SYSTEM_PROMPT,
        category: 'real_estate',
      };
    }
  }

  // ─────────────────────────────────────────────────────────────
  // PUBLIC STATS
  // ─────────────────────────────────────────────────────────────

  get running(): boolean {
    return this.isRunning;
  }
}

// ─────────────────────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────────────────────

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// ─────────────────────────────────────────────────────────────
// SINGLETON FACTORY
// ─────────────────────────────────────────────────────────────

let curatorInstance: CuratorBot | null = null;

export function getCuratorBot(botHandle?: string): CuratorBot {
  if (!curatorInstance) {
    curatorInstance = new CuratorBot(botHandle || 'curator_bds');
  }
  return curatorInstance;
}
