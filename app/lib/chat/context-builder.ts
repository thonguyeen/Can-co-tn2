// ═══════════════════════════════════════════════════════════════
// CHAT CONTEXT BUILDER — Phase 06
// Pure helper: detect market queries, inject real data from DB.
// Zero hallucination: AI only gets facts, not opinions.
// ═══════════════════════════════════════════════════════════════

import { prisma } from '@/lib/db';

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

export interface ChatContextResult {
  systemContext: string;      // Injected after systemPrompt
  hasMarketData: boolean;     // Badge indicator for FE
  reportId?: string;         // Which report was used
}

// ─────────────────────────────────────────────────────────────
// MARKET KEYWORD DETECTION
// ─────────────────────────────────────────────────────────────

const MARKET_KEYWORDS = [
  // Price queries
  'giá', 'bao nhiêu', 'bán', 'mua', 'cho thuê', 'thuê', 'tỷ', 'triệu', 'đắt', 'rẻ',
  // Location
  'quận', 'huyện', 'q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10',
  'q11', 'q12', 'bình thạnh', 'tân bình', 'gò vấp', 'phú nhuận', 'bình dương',
  'bình chánh', 'nhà bè', 'hóc môn', 'củ chi', 'cần giờ', 'thủ đức',
  // Market terms
  'thị trường', 'xu hướng', 'tăng', 'giảm', 'biến động', 'cung cầu',
  'căn hộ', 'nhà phố', 'đất nền', 'biệt thự', 'chung cư', 'mặt tiền',
  // Time reference
  'tháng này', 'năm nay', 'gần đây', 'hiện tại', 'mới nhất',
];

export function detectMarketKeywords(message: string): boolean {
  const lowerMsg = message.toLowerCase();
  return MARKET_KEYWORDS.some((kw) => lowerMsg.includes(kw));
}

// ─────────────────────────────────────────────────────────────
// MARKET REPORT LOADER
// ─────────────────────────────────────────────────────────────

const MAX_REPORT_CHARS = 1500; // Guard against token overflow

async function loadLatestMarketReport(category = 'real_estate'): Promise<{
  content: string;
  id: string;
  title: string;
} | null> {
  try {
    const report = await prisma.marketReport.findFirst({
      where: { category },
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, content: true, stats: true },
    });

    if (!report) return null;

    // Extract just the stats JSON for brevity (more reliable than full markdown)
    const statsStr = report.stats
      ? `\n=== SỐ LIỆU TỔNG HỢP ===\n${JSON.stringify(report.stats, null, 2)}`
      : '';

    // Truncate if too long
    const combined = (report.content + statsStr).slice(0, MAX_REPORT_CHARS);

    return { id: report.id, title: report.title, content: combined };
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// USER PREFERENCE LOADER (khu vực đã từng xem/tạo)
// ─────────────────────────────────────────────────────────────

async function loadUserRegionPreference(userId: string): Promise<string | null> {
  try {
    const intents = await prisma.intent.groupBy({
      by: ['district'],
      where: { userId, status: 'active', district: { not: null } },
      _count: true,
      orderBy: { _count: { district: 'desc' } },
      take: 2,
    });

    if (intents.length === 0) return null;

    const regions = intents
      .filter((i) => i.district)
      .map((i) => i.district as string)
      .join(', ');

    return regions;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// MAIN: BUILD CHAT CONTEXT
// ─────────────────────────────────────────────────────────────

export async function buildChatContext(
  latestMessage: string,
  options?: {
    userId?: string | null;
    category?: string;
  }
): Promise<ChatContextResult> {
  const isMarketQuery = detectMarketKeywords(latestMessage);
  const category = options?.category || 'real_estate';
  const userId = options?.userId;

  if (!isMarketQuery) {
    return { systemContext: '', hasMarketData: false };
  }

  // Load market data
  const report = await loadLatestMarketReport(category);
  if (!report) {
    return { systemContext: '', hasMarketData: false };
  }

  // Optionally personalise with user's region preference
  let personalTip = '';
  if (userId) {
    const region = await loadUserRegionPreference(userId);
    if (region) {
      personalTip = `\nUser này thường quan tâm đến khu vực: ${region}.`;
    }
  }

  const systemContext = `
--- DỮ LIỆU THỊ TRƯỜNG THỰC (${new Date().toLocaleDateString('vi-VN')}) ---
Nguồn: ${report.title}
${report.content}${personalTip}
--- HẾT DỮ LIỆU ---
Hãy trả lời dựa trên số liệu trên. Trích dẫn cụ thể khi có thể. KHÔNG bịa số liệu.
`;

  return { systemContext, hasMarketData: true, reportId: report.id };
}

// ─────────────────────────────────────────────────────────────
// QUOTA CHECK HELPER
// ─────────────────────────────────────────────────────────────

const DAILY_LIMIT = 50;

export async function checkDailyQuota(userId: string): Promise<{
  allowed: boolean;
  used: number;
  limit: number;
}> {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const used = await prisma.aIChatMessage.count({
      where: {
        userId,
        role: 'user', // Only count user messages (not bot replies)
        createdAt: { gte: startOfDay },
      },
    });

    return { allowed: used < DAILY_LIMIT, used, limit: DAILY_LIMIT };
  } catch {
    // Fail open — don't block chat if quota check fails
    return { allowed: true, used: 0, limit: DAILY_LIMIT };
  }
}
