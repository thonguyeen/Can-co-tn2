// ═══════════════════════════════════════════════════════════════
// CẦN & CÓ — Content Moderation Engine
// AI-powered content filtering for Vietnamese community standards
// ═══════════════════════════════════════════════════════════════

import OpenAI from 'openai';

let client: OpenAI | null = null;

function getClient(): OpenAI | null {
  if (client) return client;
  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey && apiKey !== 'not-set') {
    const baseURL = process.env.OPENAI_BASE_URL;
    client = new OpenAI({ apiKey, ...(baseURL ? { baseURL } : {}) });
    return client;
  }
  return null;
}

export interface ModerationResult {
  allowed: boolean;
  violation_type: string | null;  // 'sexual' | 'illegal' | 'vulgar' | 'spam' | null
  reason: string | null;          // Human-readable explanation in Vietnamese
}

/**
 * Keyword-based pre-filter (fast, no AI call needed)
 * Catches obvious violations before wasting an API call
 */
const BLOCKED_PATTERNS: { pattern: RegExp; type: string; reason: string }[] = [
  // Sexual content
  {
    pattern: /\b(sex|khỏa thân|khoa than|mua dâm|mại dâm|quan hệ tình dục|ảnh nóng|phim sex|gái gọi|massage\s*(sung sướng|happy ending)|d[iị]ch v[uụ] người lớn)\b/i,
    type: 'sexual',
    reason: 'Nội dung có yếu tố khiêu dâm, vi phạm tiêu chuẩn cộng đồng',
  },
  // Illegal substances & activities
  {
    pattern: /\b(ma túy|ma tuy|cần sa|can sa|heroin|cocaine|thuốc lắc|ketamine|mua bán chất cấm|rửa tiền|lừa đảo|cá độ|đánh bạc|cho vay nặng lãi|tín dụng đen)\b/i,
    type: 'illegal',
    reason: 'Nội dung liên quan đến hoạt động vi phạm pháp luật Việt Nam',
  },
  // Weapons & violence
  {
    pattern: /\b(súng|vũ khí|vu khi|thuốc nổ|bom|chất nổ|giết người|đâm thuê chém mướn)\b/i,
    type: 'illegal',
    reason: 'Nội dung liên quan đến vũ khí hoặc bạo lực',
  },
  // Vulgar / hate speech (common Vietnamese profanity)
  {
    pattern: /\b(đ[ịi]t|d[iị]t|đ[éè]o|cl|cặc|lồn|đ[ụu] m[áa]|dm|vcl|vkl|cc|đcm|dcm|con m[eẹ]|thằng chó|con chó|đồ chó|khốn nạn)\b/i,
    type: 'vulgar',
    reason: 'Nội dung chứa ngôn từ thô tục, xúc phạm',
  },
];

function keywordFilter(text: string): ModerationResult {
  const normalized = text.toLowerCase();

  for (const { pattern, type, reason } of BLOCKED_PATTERNS) {
    if (pattern.test(normalized)) {
      return { allowed: false, violation_type: type, reason };
    }
  }

  return { allowed: true, violation_type: null, reason: null };
}

/**
 * AI-powered deep content moderation
 * Uses LLM to understand context and nuance
 */
async function aiModerate(text: string): Promise<ModerationResult> {
  const c = getClient();
  if (!c) {
    // If AI not available, only use keyword filter (already ran)
    return { allowed: true, violation_type: null, reason: null };
  }

  try {
    const response = await c.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: 0,
      max_tokens: 200,
      messages: [
        {
          role: 'system',
          content: `Bạn là hệ thống kiểm duyệt nội dung cho nền tảng BẤT ĐỘNG SẢN "CẦN & CÓ" tại Việt Nam.

Phân loại nội dung sau:
- "allowed": true nếu nội dung hợp lệ (mua/bán/thuê BĐS, dịch vụ, việc làm...)
- "allowed": false nếu vi phạm

Các loại vi phạm:
- "sexual": Nội dung khiêu dâm, đồi trụy, mua bán tình dục
- "illegal": Vi phạm pháp luật VN (ma tuý, vũ khí, lừa đảo, cờ bạc, rửa tiền)
- "vulgar": Ngôn từ thô tục, xúc phạm, kích động thù hận
- "spam": Quảng cáo rác, link lừa đảo, nội dung vô nghĩa

Trả về JSON duy nhất, không giải thích:
{"allowed": boolean, "violation_type": string|null, "reason": string|null}

Lưu ý: Nội dung BĐS hợp lệ bao gồm mô tả nhà, giá, vị trí, tiện ích. KHÔNG chặn nội dung BĐS bình thường.`,
        },
        { role: 'user', content: text },
      ],
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) return { allowed: true, violation_type: null, reason: null };

    // Rút trích JSON nếu AI trả về kèm markdown (e.g. ```json ... ```)
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) return { allowed: true, violation_type: null, reason: null };

    const parsed = JSON.parse(match[0]);
    
    // Đưa tất cả keys về lowercase để tránh lỗi {"Allowed": true} bị coi là undefined => false
    const normalized: Record<string, any> = {};
    for (const key in parsed) {
      normalized[key.toLowerCase()] = parsed[key];
    }

    // Khởi tạo allowed mặc định là true (để bảo vệ người dùng, chỉ cấm khi AI gọi ra chữ false rõ ràng)
    let isAllowed = true;
    if ('allowed' in normalized) {
      const v = normalized.allowed;
      if (v === false || String(v).toLowerCase() === 'false') {
        isAllowed = false;
      }
    }

    return {
      allowed: isAllowed,
      violation_type: normalized.violation_type || null,
      reason: normalized.reason || null,
    };
  } catch (err) {
    console.error('[moderation] AI check failed:', err);
    // On AI failure, allow the content (don't block legitimate posts)
    return { allowed: true, violation_type: null, reason: null };
  }
}

/**
 * Main moderation function — keyword filter first, then AI deep check
 */
export async function moderateContent(text: string): Promise<ModerationResult> {
  // Step 1: Fast keyword filter
  const keywordResult = keywordFilter(text);
  if (!keywordResult.allowed) {
    return keywordResult;
  }

  // Step 2: AI deep analysis (catches subtle violations)
  return aiModerate(text);
}

/** Max violations before permanent ban */
export const MAX_VIOLATIONS = 3;
