import { prisma } from '../db';
import { chatWithJSON } from '../ai/client';

export interface AnalystBotConfig {
  scheduleConfig?: {
    autoReportAt?: string[];
    autoReportDays?: number[];
  };
  knowledgeText?: string;
  botHandle: string;
}

export interface MarketStats {
  dataRange: { from: Date; to: Date };
  totalListings: number;
  canCount: number;
  coCount: number;
  avgPrice: number | null;
  priceByDistrict: Record<string, { avg: number; count: number }>;
  topDistricts: string[];
  subcategoryBreakdown: Record<string, number>;
  newVsYesterday: number | null;
  sourcesCount: number;
}

export interface MarketReportResult {
  success: boolean;
  skipped?: boolean;
  reportId?: string;
  error?: string;
  duration?: number;
}

// Format number utility
function toSafeNumber(val: any): number | null {
  if (val === null || val === undefined) return null;
  const num = Number(val);
  return isNaN(num) ? null : num;
}

export class AnalystBot {
  private isRunning = false;
  private config: AnalystBotConfig | null = null;
  private lastDailyRun: string | null = null;
  public botHandle: string;

  constructor(botHandle = 'analyst_bds') {
    this.botHandle = botHandle;
  }

  private async loadConfig(): Promise<AnalystBotConfig> {
    const bot = await prisma.bot.findUnique({ where: { handle: this.botHandle } });
    if (!bot) {
      // Return a default config if bot is not found yet, ensures it doesn't crash entirely before seed
      return { botHandle: this.botHandle, scheduleConfig: { autoReportAt: ['08:00'], autoReportDays: [1,2,3,4,5] } };
    }
    this.config = {
      botHandle: this.botHandle,
      scheduleConfig: (bot.scheduleConfig as any) || undefined,
      knowledgeText: bot.knowledgeText || ''
    };
    return this.config;
  }

  shouldRunToday(): boolean {
    const today = new Date().toISOString().split('T')[0];
    if (this.lastDailyRun === today) return false;
    
    // Config validation is handled in the Orchestrator (it calls checkAndTriggerAnalystReport)
    return true;
  }

  async generateDailyReport(category = 'real_estate', region: string | null = null): Promise<MarketReportResult> {
    if (this.isRunning) return { success: false, skipped: true, error: 'Already running' };
    this.isRunning = true;
    const startTime = Date.now();

    try {
      await this.loadConfig();
      console.log(`[AnalystBot] Generating daily report for ${category} ${region ? region : 'ALL'}...`);
      
      const stats = await this.aggregateStats(category, region, 24);
      
      // Short-circuit if not enough data
      if (stats.totalListings < 5) {
        console.log(`[AnalystBot] Not enough intents (${stats.totalListings} < 5). Skipping report.`);
        return { success: true, skipped: true, duration: Date.now() - startTime };
      }

      const prompt = this.buildPrompt(stats, this.config?.knowledgeText || '', 'daily');

      let llmResult: any;
      try {
        llmResult = await chatWithJSON(prompt.systemPrompt, prompt.userPrompt, {
          temperature: 0.3, // Low temperature to prevent hallucination
          maxTokens: 1000
        });
      } catch (err: any) {
        throw new Error(`LLM call failed: ${err.message}`);
      }

      if (!llmResult || (!llmResult.content && !llmResult.text)) {
        throw new Error('LLM returned invalid format (missing content/text)');
      }

      // Save to database
      const title = `Báo cáo thị trường BĐS - ${new Date().toLocaleDateString('vi-VN')}`;
      const content = llmResult.content || llmResult.text || 'Lỗi: Không có nội dung';

      const report = await prisma.marketReport.create({
        data: {
          botHandle: this.botHandle,
          category,
          region,
          period: 'daily',
          title,
          content,
          stats: stats as any
        }
      });

      this.lastDailyRun = new Date().toISOString().split('T')[0];
      console.log(`[AnalystBot] Saved report ${report.id}`);
      return { success: true, reportId: report.id, duration: Date.now() - startTime };

    } catch (error: any) {
      console.error('[AnalystBot] Error generating daily report:', error);
      return { success: false, error: error.message, duration: Date.now() - startTime };
    } finally {
      this.isRunning = false;
    }
  }

  async generateWeeklyReport(category = 'real_estate', region: string | null = null): Promise<MarketReportResult> {
    // Similar to daily but 168 hours
    if (this.isRunning) return { success: false, skipped: true, error: 'Already running' };
    this.isRunning = true;
    const startTime = Date.now();

    try {
      await this.loadConfig();
      const stats = await this.aggregateStats(category, region, 168);
      
      if (stats.totalListings < 10) {
        return { success: true, skipped: true, duration: Date.now() - startTime };
      }

      const prompt = this.buildPrompt(stats, this.config?.knowledgeText || '', 'weekly');
      
      let llmResult: any;
      try {
        llmResult = await chatWithJSON(prompt.systemPrompt, prompt.userPrompt, {
          temperature: 0.3,
          maxTokens: 1500
        });
      } catch (err: any) {
        throw new Error(`LLM call failed: ${err.message}`);
      }

      const report = await prisma.marketReport.create({
        data: {
          botHandle: this.botHandle,
          category,
          region,
          period: 'weekly',
          title: `Báo cáo Tuần - BĐS (${new Date().toLocaleDateString('vi-VN')})`,
          content: llmResult.content || llmResult.text,
          stats: stats as any
        }
      });

      return { success: true, reportId: report.id, duration: Date.now() - startTime };

    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      this.isRunning = false;
    }
  }

  private async aggregateStats(category: string, region: string | null, hoursBack: number): Promise<MarketStats> {
    const to = new Date();
    const from = new Date(to.getTime() - (hoursBack * 60 * 60 * 1000));
    const previousFrom = new Date(from.getTime() - (hoursBack * 60 * 60 * 1000));

    // Base where clause
    const baseWhere = {
      category,
      status: 'active',
      createdAt: { gte: from },
      ...(region && { city: region })
    };

    // 1. Overview counts by type
    const overview = await prisma.intent.groupBy({
      by: ['type'],
      where: baseWhere,
      _count: true
    });
    
    let canCount = 0;
    let coCount = 0;
    overview.forEach(item => {
      if (item.type === 'CAN') canCount = item._count;
      else if (item.type === 'CO') coCount = item._count;
    });

    const totalListings = canCount + coCount;

    // 2. Average price for CO
    const priceAgg = await prisma.intent.aggregate({
      where: { ...baseWhere, type: 'CO', price: { not: null } },
      _avg: { price: true }
    });

    // 3. Price by district
    const districtAgg = await prisma.intent.groupBy({
      by: ['district'],
      where: { ...baseWhere, type: 'CO', price: { not: null }, district: { not: null } },
      _avg: { price: true },
      _count: true,
      orderBy: { _count: { price: 'desc' } },
      take: 5
    });

    const priceByDistrict: Record<string, { avg: number; count: number }> = {};
    const topDistricts: string[] = [];
    districtAgg.forEach(item => {
      if (item.district) {
        priceByDistrict[item.district] = {
          avg: toSafeNumber(item._avg.price) || 0,
          count: toSafeNumber(item._count) || 0
        };
        topDistricts.push(item.district);
      }
    });

    // 4. Subcategory breakdown
    const subcatAgg = await prisma.intent.groupBy({
      by: ['subcategory'],
      where: baseWhere,
      _count: true
    });
    const subcategoryBreakdown: Record<string, number> = {};
    subcatAgg.forEach(item => {
      if (item.subcategory) {
        subcategoryBreakdown[item.subcategory] = item._count;
      }
    });

    // 5. Compare with previous period
    const previousCount = await prisma.intent.count({
      where: {
        category,
        status: 'active',
        createdAt: { gte: previousFrom, lt: from },
        ...(region && { city: region })
      }
    });

    let newVsYesterday = null;
    if (previousCount > 0) {
      newVsYesterday = Math.round(((totalListings - previousCount) / previousCount) * 100);
    }

    return {
      dataRange: { from, to },
      totalListings,
      canCount,
      coCount,
      avgPrice: toSafeNumber(priceAgg._avg?.price),
      priceByDistrict,
      topDistricts,
      subcategoryBreakdown,
      newVsYesterday,
      sourcesCount: 0 // Optional metric
    };
  }

  private buildPrompt(stats: MarketStats, knowledgeText: string, period: 'daily' | 'weekly'): { systemPrompt: string, userPrompt: string } {
    const systemPrompt = `Bạn là Analyst Bot, bot phân tích thị trường bất động sản.
Nhiệm vụ: Viết báo cáo từ SỐ LIỆU THẬT được cung cấp dưới đây.
KHÔNG bịa số liệu. KHÔNG đoán. Chỉ tổng hợp và nhận xét dựa trên data.

Quy tắc bắt buộc:
1. Mọi con số PHẢI lấy từ JSON data bên dưới. Nếu không có giá, có thể ghi "Chưa đủ dữ liệu giá".
2. Nhận xét xu hướng nếu có 'newVsYesterday' (VD: +12% là tăng, -5% là giảm).
3. Format trả về LÀ JSON có trường "content" chứa string là bài viết Markdown (dùng headings, bullet points, số liệu in đậm).
4. Các số tiền lớn (tỷ, triệu) cần format dễ đọc (VD: 4500000000 -> 4.5 tỷ).
5. Cuối bài luôn phải có câu: "📌 Nguồn: Dựa trên {số_lượng_tin} tin đăng trong thời gian qua."

${knowledgeText}`;

    const userPrompt = `
Dữ liệu thị trường BĐS (${period})
Từ: ${stats.dataRange.from.toISOString()}
Đến: ${stats.dataRange.to.toISOString()}

=== DỮ LIỆU JSON ===
${JSON.stringify(stats, null, 2)}
====================

Hãy viết nội dung Markdown phân tích dữ liệu thị trường theo cấu trúc:
- Tổng quan
- Phân tích chi tiết (theo danh mục / quận)
- Biến động so với kỳ trước (nếu có)
`;

    return { systemPrompt, userPrompt };
  }
}

// Standard exported instance
let analystBotInstance: AnalystBot | null = null;
export function getAnalystBot(): AnalystBot {
  if (!analystBotInstance) {
    analystBotInstance = new AnalystBot();
  }
  return analystBotInstance;
}
