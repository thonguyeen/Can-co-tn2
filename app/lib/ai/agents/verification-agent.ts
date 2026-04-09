import { chatWithJSON } from '../client'
import {
  VERIFICATION_SYSTEM_PROMPT,
  CLAIM_EXTRACTION_PROMPT,
} from '../prompts/verification'
import { prisma } from '@/lib/db'

// Types
interface RawNews {
  id: string
  source_id: string
  original_url: string
  original_title: string
  original_content: string | null
  original_published_at: string | null
  sources: {
    name: string
    credibility_score: number
    category: string[]
  }
}

interface VerificationResult {
  verification_status: 'unverified' | 'partial' | 'verified' | 'debunked'
  confidence_score: number
  verification_note: string
  claims: {
    claim: string
    status: 'unverified' | 'confirmed' | 'disputed' | 'false'
    evidence: string
  }[]
  recommended_action: string
  key_facts: string[]
  potential_issues?: string[]
}

interface ClaimExtractionResult {
  claims: {
    claim: string
    type: string
    verifiable: boolean
    entities: string[]
    time_reference: string | null
  }[]
  main_topic: string
  category: string
}

// ═══════════════════════════════════════════════════════════════
// MAIN VERIFICATION FUNCTION
// ═══════════════════════════════════════════════════════════════

export async function verifyNews(rawNewsId: string): Promise<{
  success: boolean
  result?: VerificationResult
  error?: string
}> {
  try {
    // 1. Fetch the raw news item
    const rawNewsData = await prisma.$queryRaw<any[]>`
      SELECT r.*, row_to_json(s.*) as sources
      FROM raw_news r
      LEFT JOIN crawl_sources s ON r.source_id = s.id
      WHERE r.id = ${rawNewsId}::uuid
      LIMIT 1
    `
    const rawNews = rawNewsData[0]

    if (!rawNews) {
      throw new Error(`Raw news not found: ${rawNewsId}`)
    }

    // 2. Find cross-references (similar news from other sources)
    const crossRefs = await findCrossReferences(rawNews as RawNews)

    // 3. Extract claims from the article
    const claims = await extractClaims(rawNews as RawNews)

    // 4. Run verification with all context
    const verificationResult = await runVerification(
      rawNews as RawNews,
      crossRefs,
      claims
    )

    // 5. Update raw_news as processed
    await prisma.$executeRaw`
      UPDATE raw_news SET is_processed = true, processed_at = NOW() WHERE id = ${rawNewsId}::uuid
    `

    return {
      success: true,
      result: verificationResult,
    }
  } catch (error) {
    console.error('Verification error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// CROSS-REFERENCE FINDER
// ═══════════════════════════════════════════════════════════════

async function findCrossReferences(mainNews: RawNews): Promise<RawNews[]> {
  // Find similar news from last 48 hours, different sources
  const candidates = await prisma.$queryRaw<any[]>`
    SELECT r.*, row_to_json(s.*) as sources
    FROM raw_news r
    LEFT JOIN crawl_sources s ON r.source_id = s.id
    WHERE r.id != ${mainNews.id}::uuid AND r.source_id != ${mainNews.source_id}::uuid
      AND r.created_at >= NOW() - INTERVAL '48 hours'
    LIMIT 20
  `

  if (!candidates || candidates.length === 0) {
    return []
  }

  // Use keyword-based similarity for speed
  const relatedArticles: RawNews[] = []

  for (const candidate of candidates) {
    const similarity = checkSimilarity(mainNews, candidate as RawNews)
    if (similarity > 0.3) {
      relatedArticles.push(candidate as RawNews)
    }

    // Limit to 5 cross-references
    if (relatedArticles.length >= 5) break
  }

  return relatedArticles
}

function checkSimilarity(newsA: RawNews, newsB: RawNews): number {
  // Simple keyword-based similarity for speed
  const wordsA = new Set(
    (newsA.original_title + ' ' + (newsA.original_content || ''))
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3)
  )

  const wordsB = new Set(
    (newsB.original_title + ' ' + (newsB.original_content || ''))
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3)
  )

  const intersection = new Set([...wordsA].filter((x) => wordsB.has(x)))
  const union = new Set([...wordsA, ...wordsB])

  return intersection.size / union.size // Jaccard similarity
}

// ═══════════════════════════════════════════════════════════════
// CLAIM EXTRACTION
// ═══════════════════════════════════════════════════════════════

async function extractClaims(news: RawNews): Promise<ClaimExtractionResult> {
  const content = `
TIÊU ĐỀ: ${news.original_title}

NỘI DUNG:
${news.original_content || 'Không có nội dung chi tiết'}

NGUỒN: ${news.sources?.name || 'Unknown'}
`

  try {
    const result = await chatWithJSON<ClaimExtractionResult>(
      CLAIM_EXTRACTION_PROMPT,
      content,
      { temperature: 0.2 }
    )
    return result
  } catch (error) {
    // Return empty claims if extraction fails
    return {
      claims: [],
      main_topic: news.original_title,
      category: 'general',
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// MAIN VERIFICATION LOGIC
// ═══════════════════════════════════════════════════════════════

async function runVerification(
  mainNews: RawNews,
  crossRefs: RawNews[],
  claims: ClaimExtractionResult
): Promise<VerificationResult> {
  // Build context for AI
  const mainSourceCredibility = mainNews.sources?.credibility_score || 50
  const crossRefCount = crossRefs.length

  // Calculate combined credibility
  const allCredibilities = [
    mainSourceCredibility,
    ...crossRefs.map((r) => r.sources?.credibility_score || 50),
  ]
  const avgCredibility =
    allCredibilities.reduce((a, b) => a + b, 0) / allCredibilities.length

  const context = `
═══════════════════════════════════════════════════════════════
TIN TỨC CHÍNH
═══════════════════════════════════════════════════════════════

TIÊU ĐỀ: ${mainNews.original_title}

NỘI DUNG:
${mainNews.original_content || 'Không có nội dung chi tiết'}

NGUỒN: ${mainNews.sources?.name || 'Unknown'}
ĐỘ UY TÍN NGUỒN: ${mainSourceCredibility}/100
NGÀY ĐĂNG: ${mainNews.original_published_at || 'Không rõ'}

═══════════════════════════════════════════════════════════════
CLAIMS ĐÃ TRÍCH XUẤT
═══════════════════════════════════════════════════════════════

${
  claims.claims
    .map(
      (c, i) => `
${i + 1}. ${c.claim}
   - Loại: ${c.type}
   - Có thể verify: ${c.verifiable ? 'Có' : 'Không'}
   - Entities: ${c.entities.join(', ')}
`
    )
    .join('\n') || 'Không có claims cụ thể'
}

═══════════════════════════════════════════════════════════════
NGUỒN THAM KHẢO CHÉO (${crossRefCount} nguồn)
═══════════════════════════════════════════════════════════════

${
  crossRefs.length > 0
    ? crossRefs
        .map(
          (ref, i) => `
--- Nguồn ${i + 1}: ${ref.sources?.name || 'Unknown'} (Uy tín: ${ref.sources?.credibility_score || 50}/100) ---
Tiêu đề: ${ref.original_title}
Nội dung: ${ref.original_content?.substring(0, 300) || 'N/A'}...
`
        )
        .join('\n')
    : 'Không tìm thấy nguồn tham khảo chéo'
}

═══════════════════════════════════════════════════════════════
THỐNG KÊ
═══════════════════════════════════════════════════════════════

- Tổng số nguồn: ${1 + crossRefCount}
- Độ uy tín trung bình: ${avgCredibility.toFixed(1)}/100
- Chủ đề: ${claims.main_topic}
- Danh mục: ${claims.category}
`

  // Call AI for verification
  const result = await chatWithJSON<VerificationResult>(
    VERIFICATION_SYSTEM_PROMPT,
    context,
    { maxTokens: 2048, temperature: 0.3 }
  )

  // Apply business rules to adjust status
  return applyVerificationRules(result, mainSourceCredibility, crossRefCount)
}

// ═══════════════════════════════════════════════════════════════
// BUSINESS RULES
// ═══════════════════════════════════════════════════════════════

function applyVerificationRules(
  aiResult: VerificationResult,
  sourceCredibility: number,
  crossRefCount: number
): VerificationResult {
  let status = aiResult.verification_status
  let note = aiResult.verification_note

  // Rule 1: Single source with low credibility = always unverified
  if (crossRefCount === 0 && sourceCredibility < 80) {
    status = 'unverified'
    note = 'Chỉ có 1 nguồn, độ uy tín chưa cao. Đang chờ xác nhận từ nguồn khác.'
  }

  // Rule 2: High credibility source (95+) can be partial even without cross-ref
  else if (crossRefCount === 0 && sourceCredibility >= 95) {
    status = 'partial'
    note = 'Nguồn rất uy tín. Đang chờ thêm xác nhận.'
  }

  // Rule 3: 2+ cross-refs with avg credibility > 85 = verified
  else if (crossRefCount >= 2 && aiResult.confidence_score >= 80) {
    status = 'verified'
    note = `${crossRefCount + 1} nguồn uy tín đã xác nhận. ${note}`
  }

  // Rule 4: Conflicting info = partial at best
  if (aiResult.potential_issues && aiResult.potential_issues.length > 0) {
    if (status === 'verified') {
      status = 'partial'
      note = 'Có một số thông tin chưa nhất quán giữa các nguồn. ' + note
    }
  }

  return {
    ...aiResult,
    verification_status: status,
    verification_note: note,
  }
}

// ═══════════════════════════════════════════════════════════════
// BATCH VERIFICATION
// ═══════════════════════════════════════════════════════════════

export async function verifyPendingNews(limit: number = 10): Promise<{
  processed: number
  results: { id: string; status: string; error?: string }[]
}> {
  // Get unprocessed raw news
  const pending = await prisma.$queryRaw<any[]>`
    SELECT id FROM raw_news WHERE is_processed = false ORDER BY created_at ASC LIMIT ${limit}
  `

  if (!pending || pending.length === 0) {
    return { processed: 0, results: [] }
  }

  const results: { id: string; status: string; error?: string }[] = []

  for (const news of pending) {
    const { success, result, error } = await verifyNews(news.id)

    results.push({
      id: news.id,
      status: success ? result!.verification_status : 'error',
      error: error,
    })

    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  return {
    processed: results.length,
    results,
  }
}
