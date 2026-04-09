// ═══════════════════════════════════════════════════════════════
// BREAKING NEWS DETECTOR
// ═══════════════════════════════════════════════════════════════

import { chatWithJSON } from '../client'

export interface BreakingNewsResult {
  isBreaking: boolean
  urgencyLevel: 'critical' | 'high' | 'medium' | 'low'
  category: string
  headline: string
  summary: string
  relatedTopics: string[]
  expiresInMinutes: number
}

export interface BreakingNewsRecord {
  id: string
  post_id: string
  headline: string
  summary: string
  urgency_level: string
  category: string
  related_topics: string[]
  is_active: boolean
  expires_at: string
  created_at: string
}

const BREAKING_DETECTOR_PROMPT = `Bạn là hệ thống phát hiện tin nóng (breaking news). Phân tích nội dung bài viết và xác định xem đó có phải là tin nóng không.

Tiêu chí tin nóng:
1. Sự kiện vừa xảy ra hoặc đang diễn ra
2. Có tác động lớn đến nhiều người
3. Thông tin mới, chưa được biết rộng rãi
4. Có tính khẩn cấp hoặc quan trọng

Mức độ urgency:
- critical: Ảnh hưởng toàn cầu/quốc gia ngay lập tức (thiên tai, chiến tranh, crash thị trường lớn)
- high: Sự kiện lớn trong ngành (product launch quan trọng, scandal lớn, hack/breach)
- medium: Tin đáng chú ý (funding round lớn, thay đổi chính sách, release phần mềm quan trọng)
- low: Tin mới nhưng không quá khẩn cấp

Trả lời JSON:
{
  "isBreaking": boolean,
  "urgencyLevel": "critical" | "high" | "medium" | "low",
  "category": "tech" | "finance" | "crypto" | "gaming" | "security" | "politics" | "general",
  "headline": "Tiêu đề ngắn gọn",
  "summary": "Tóm tắt 1-2 câu",
  "relatedTopics": ["topic1", "topic2"],
  "expiresInMinutes": number (30-480 phút tuỳ mức độ)
}`

/**
 * Detect if a post contains breaking news
 */
export async function detectBreakingNews(
  content: string,
  botHandle?: string
): Promise<BreakingNewsResult> {
  try {
    const userMessage = `
Phân tích bài viết sau:

BOT: ${botHandle || 'unknown'}
NỘI DUNG:
${content}

Đây có phải tin nóng không?`

    const result = await chatWithJSON<BreakingNewsResult>(
      BREAKING_DETECTOR_PROMPT,
      userMessage,
      { maxTokens: 512, temperature: 0.1 }
    )

    return result
  } catch (error) {
    console.error('Breaking news detection error:', error)
    return {
      isBreaking: false,
      urgencyLevel: 'low',
      category: 'general',
      headline: '',
      summary: '',
      relatedTopics: [],
      expiresInMinutes: 60,
    }
  }
}

/**
 * Calculate expiry time based on urgency
 */
export function getExpiryTime(urgencyLevel: string, customMinutes?: number): Date {
  const minutes = customMinutes ?? getDefaultExpiry(urgencyLevel)
  return new Date(Date.now() + minutes * 60 * 1000)
}

function getDefaultExpiry(urgencyLevel: string): number {
  switch (urgencyLevel) {
    case 'critical': return 480 // 8 hours
    case 'high': return 240 // 4 hours
    case 'medium': return 120 // 2 hours
    case 'low': return 60 // 1 hour
    default: return 60
  }
}

/**
 * Check if a breaking news is still active
 */
export function isBreakingActive(record: BreakingNewsRecord): boolean {
  if (!record.is_active) return false
  return new Date(record.expires_at).getTime() > Date.now()
}

/**
 * Get urgency color for UI
 */
export function getUrgencyColor(level: string): { bg: string; text: string; border: string } {
  switch (level) {
    case 'critical':
      return { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500' }
    case 'high':
      return { bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-orange-500' }
    case 'medium':
      return { bg: 'bg-yellow-500/10', text: 'text-yellow-500', border: 'border-yellow-500' }
    default:
      return { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500' }
  }
}
