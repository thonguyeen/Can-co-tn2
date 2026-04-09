import { chatWithJSON } from '../client'
import { prisma } from '@/lib/db'
import { findMatchesForCan, findMatchesForCo, saveMatches } from '../../engine/matching'

const CRAWL_SYSTEM_EMAIL = 'crawl-system@canco.vn'
const CRAWL_SYSTEM_PASSWORD = 'canco-secure-pwd'

// ═══════════════════════════════════════════════════════════════
// 1. Get or Create the System User for "Nguồn ngoài"
// ═══════════════════════════════════════════════════════════════

export async function getOrCreateCrawlUser(): Promise<string> {
  const existingProfile = await prisma.profile.findFirst({
    where: { displayName: 'Nguồn ngoài' },
    select: { id: true }
  })

  if (existingProfile) {
    return existingProfile.id
  }

  // Create or find User
  let user = await prisma.user.findUnique({
    where: { email: CRAWL_SYSTEM_EMAIL },
    select: { id: true }
  })

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: CRAWL_SYSTEM_EMAIL,
        name: 'Nguồn ngoài',
        passwordHash: CRAWL_SYSTEM_PASSWORD,
        emailVerified: new Date(),
      },
      select: { id: true }
    })
  }

  // Create Profile
  const profile = await prisma.profile.upsert({
    where: { id: user.id },
    update: {
      displayName: 'Nguồn ngoài',
      avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=NN&backgroundColor=475569',
    },
    create: {
      id: user.id,
      displayName: 'Nguồn ngoài',
      avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=NN&backgroundColor=475569',
      trustScore: 0,
      verificationLevel: 'none',
    }
  })

  return profile.id
}

// ═══════════════════════════════════════════════════════════════
// 2. AI Parser — Parse raw crawled text into structured intent fields
// ═══════════════════════════════════════════════════════════════

interface ParsedIntentFields {
  type: 'CO' | 'CAN'
  category: string
  subcategory: string
  price: number | null
  district: string | null
  clean_title: string
  source?: string
  source_name?: string
  original_url?: string
  source_dead?: boolean
}

const PARSE_SYSTEM_PROMPT = `Bạn là AI chuyên gia phân tích dữ liệu Bất Động Sản cho mạng lưới CẦN & CÓ.
Nhiệm vụ: Bóc tách bài đăng thô thành JSON cấu trúc.
Quy tắc:
- Trả về JSON hợp lệ bọc trong \`\`\`json ... \`\`\`
- Phân biệt rõ loại tin:
  "CO" = Người bán, người cho thuê, tức là ĐANG CÓ nhà/đất.
  "CAN" = Người mua, người cần tìm, tức là ĐANG CẦN nhà/đất.
- Nếu bài không phải BĐS (ví dụ tin công nghệ, tin tức), vẫn cố gắng phân loại type dựa trên nội dung (CO nếu chia sẻ thông tin, CAN nếu đang tìm kiếm).
- Format Giá (price) ra dạng số nguyên VNĐ (vd: "12 tỷ" -> 12000000000, "500 triệu" -> 500000000). Nếu không rõ hoặc giá thỏa thuận, để null.
- Rút gọn địa chỉ thành 1-2 từ khóa cấp quận (district) nếu có thể (vd: "Quận 1", "Gò Vấp", "Bình Thạnh").
- clean_title: Viết lại tiêu đề ngắn gọn, dễ hiểu, tối đa 100 ký tự.

CẤU TRÚC JSON:
{
  "type": "CO",
  "category": "real_estate",
  "subcategory": "apartment",
  "price": 12000000000,
  "district": "Quận 1",
  "clean_title": "Bán nhà mặt tiền Nguyễn Trãi Q1 100m2"
}`

export async function parseRawNewsToIntentFields(title: string, content: string | null): Promise<ParsedIntentFields> {
  const prompt = `TIÊU ĐỀ: ${title}\nNỘI DUNG:\n${content || 'Không có nội dung chi tiết'}`

  const parsed = await chatWithJSON<ParsedIntentFields>(PARSE_SYSTEM_PROMPT, prompt, {
    temperature: 0.1,
  })

  return parsed
}

// ═══════════════════════════════════════════════════════════════
// 3. Main Injection Function
// ═══════════════════════════════════════════════════════════════

export async function injectIntentFromRawNews(rawNewsId: string): Promise<{ success: boolean; intentId?: string; error?: string }> {
  try {
    // 1. Fetch raw news with source name
    const rawNews = await prisma.rawNews.findUnique({
      where: { id: rawNewsId },
      include: { source: { select: { name: true } } }
    })

    if (!rawNews) throw new Error('Không tìm thấy tin crawled')
    if (rawNews.isProcessed) throw new Error('Tin này đã được xử lý rồi')

    // 2. Ensure system user exists
    const systemUserId = await getOrCreateCrawlUser()

    // 3. AI Parsing
    const parsedData = await parseRawNewsToIntentFields(rawNews.title, rawNews.content)

    // Append source info
    parsedData.source = rawNews.sourceId || 'Unknown'
    parsedData.source_name = rawNews.source?.name || 'Nguồn ngoài'
    parsedData.original_url = rawNews.originalUrl

    // 4. Insert into intents table
    const newIntent = await prisma.intent.create({
      data: {
        userId: systemUserId,
        type: parsedData.type || 'CO',
        rawText: rawNews.content || rawNews.title,
        title: parsedData.clean_title || rawNews.title,
        parsedData: parsedData as any,
        category: parsedData.category || 'real_estate',
        subcategory: parsedData.subcategory || 'apartment',
        price: parsedData.price ? BigInt(parsedData.price) : null,
        district: parsedData.district,
        status: 'active',
      },
      select: { id: true, type: true, rawText: true, parsedData: true, price: true, district: true, userId: true, category: true }
    })

    if (!newIntent) throw new Error('Lưu Intent thất bại')

    // 5. Mark raw_news as processed
    await prisma.rawNews.update({
      where: { id: rawNewsId },
      data: { isProcessed: true }
    })

    // 6. Auto-Matching (ghép đôi CẦN-CÓ)
    try {
      const candidates = newIntent.type === 'CAN'
        ? await findMatchesForCan(newIntent as any)
        : await findMatchesForCo(newIntent as any)

      for (const candidate of candidates) {
        const canId = newIntent.type === 'CAN' ? newIntent.id : candidate.intent.id
        const coId = newIntent.type === 'CO' ? newIntent.id : candidate.intent.id
        await saveMatches(canId, coId, candidate.similarity, candidate.explanation)
      }

      await prisma.intent.update({
        where: { id: newIntent.id },
        data: { matchCount: candidates.length }
      })
    } catch (matchErr) {
      console.warn('[Intent Injector] Auto-match failed (intent vẫn được lưu):', matchErr)
    }

    return { success: true, intentId: newIntent.id }
  } catch (err: any) {
    console.error('[Intent Injector] Error:', err)
    return { success: false, error: err.message }
  }
}
