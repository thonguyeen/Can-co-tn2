// ═══════════════════════════════════════════════════════════════
// PROACTIVE POSTING ENGINE
// ═══════════════════════════════════════════════════════════════

import { prisma } from '@/lib/db'
import { BOT_PERSONAS } from '../prompts/bot-personas'
import { chat } from '../client'
import {
  getBotEmotionalState,
  getEmotionalPromptModifier,
} from '../emotions/emotional-state'
import { randomUUID } from 'crypto'

export type ProactivePostType =
  | 'opinion'
  | 'prediction'
  | 'reaction'
  | 'thread'
  | 'question'
  | 'tip'
  | 'throwback'
  | 'comparison'

export interface ProactivePostRequest {
  botHandle: string
  postType: ProactivePostType
  topic?: string
  context?: string
  relatedPostId?: string
  threadParts?: number
}

export interface ProactivePostResult {
  content: string
  postType: ProactivePostType
  emotionalState: string
  threadParts?: string[]
  tags?: string[]
  hashtags?: string[]
}

// ═══════════════════════════════════════════════════════════════
// POST TYPE PROMPTS
// ═══════════════════════════════════════════════════════════════

const POST_TYPE_PROMPTS: Record<ProactivePostType, string> = {
  opinion: `Viết một bài NHẬN ĐỊNH CÁ NHÂN về topic.
Yêu cầu:
- Bắt đầu bằng opinion rõ ràng
- Đưa ra 2-3 lý do support
- Acknowledge góc nhìn khác nếu có
- Kết bằng call-to-action hỏi ý kiến
- Độ dài: 3-5 câu`,

  prediction: `Viết một bài DỰ ĐOÁN về tương lai của topic.
Yêu cầu:
- Nêu rõ prediction
- Dựa trên evidence/trends hiện tại
- Đưa ra timeline nếu có thể
- Acknowledge uncertainty
- Độ dài: 3-4 câu`,

  reaction: `Viết một bài PHẢN ỨNG NHANH với tin tức/sự kiện.
Yêu cầu:
- First reaction ngắn gọn, mạnh mẽ
- Nêu ý nghĩa của sự kiện
- Implications cho industry/users
- Có thể dùng emoji phù hợp
- Độ dài: 2-3 câu`,

  thread: `Viết một THREAD phân tích sâu về topic.
Yêu cầu:
- Part 1: Hook + overview
- Part 2-4: Main points với details
- Final part: Conclusion + takeaways
- Mỗi part 2-3 câu
- Đánh số: 1/, 2/, 3/...`,

  question: `Viết một câu HỎI để engage community.
Yêu cầu:
- Câu hỏi thought-provoking
- Context ngắn gọn
- Có thể đưa ra options
- Mời mọi người chia sẻ
- Độ dài: 2-3 câu`,

  tip: `Chia sẻ một TIP/TRICK hữu ích về topic.
Yêu cầu:
- Tip clear và actionable
- Giải thích ngắn tại sao useful
- Có thể kèm warning nếu cần
- Friendly tone
- Độ dài: 2-4 câu`,

  throwback: `Viết một bài NHÌN LẠI về sự kiện/topic trong quá khứ.
Yêu cầu:
- Reference thời gian cụ thể
- So sánh với hiện tại
- Lessons learned
- Nostalgic nhưng informative
- Độ dài: 3-4 câu`,

  comparison: `Viết một bài SO SÁNH giữa 2 thứ liên quan đến topic.
Yêu cầu:
- Nêu rõ 2 thứ đang so sánh
- Pros/cons mỗi bên
- Opinion của bạn
- Fair và balanced
- Độ dài: 4-5 câu`,
}

// ═══════════════════════════════════════════════════════════════
// MAIN GENERATION FUNCTION
// ═══════════════════════════════════════════════════════════════

export async function generateProactivePost(
  request: ProactivePostRequest
): Promise<ProactivePostResult> {
  const bot = BOT_PERSONAS[request.botHandle]
  if (!bot) {
    throw new Error(`Bot not found: ${request.botHandle}`)
  }

  const emotionalState = getBotEmotionalState(bot.id)
  const emotionalModifier = getEmotionalPromptModifier(bot.id)

  const systemPrompt = `${bot.systemPrompt}

${emotionalModifier}

## NHIỆM VỤ HIỆN TẠI
${POST_TYPE_PROMPTS[request.postType]}

## TOPIC
${request.topic || 'Chọn topic phù hợp với expertise của bạn'}

${request.context ? `## CONTEXT BỔ SUNG\n${request.context}` : ''}

## QUY TẮC
- Viết như chính bạn, không phải AI
- Personality nhất quán với persona
- Tiếng Việt tự nhiên
- Không mention "AI" hay "bot"
- Chỉ output nội dung bài viết, không có gì khác`

  const userPrompt = request.postType === 'thread'
    ? `Viết một thread ${request.threadParts || 5} phần về: ${request.topic || 'topic trong expertise của bạn'}`
    : `Viết bài ${request.postType} về: ${request.topic || 'topic trong expertise của bạn'}`

  const content = await chat(systemPrompt, userPrompt, {
    maxTokens: 1024,
    temperature: 0.85,
  })

  // Extract thread parts if applicable
  let threadParts: string[] | undefined
  if (request.postType === 'thread') {
    threadParts = parseThreadParts(content)
  }

  const tags = extractTags(content)
  const hashtags = extractHashtags(content)

  return {
    content: cleanContent(content),
    postType: request.postType,
    emotionalState: emotionalState.state,
    threadParts,
    tags,
    hashtags,
  }
}

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function parseThreadParts(content: string): string[] {
  const parts = content.split(/(?=\d+[\/\.\)]\s)/)
  return parts
    .map(p => p.trim())
    .filter(p => p.length > 0)
}

function extractTags(content: string): string[] {
  const tagRegex = /@(\w+)/g
  const matches = content.matchAll(tagRegex)
  return [...matches].map(m => m[1])
}

function extractHashtags(content: string): string[] {
  const hashtagRegex = /#(\w+)/g
  const matches = content.matchAll(hashtagRegex)
  return [...matches].map(m => m[1])
}

function cleanContent(content: string): string {
  return content
    .replace(/^["']|["']$/g, '')
    .replace(/^\*\*|\*\*$/g, '')
    .trim()
}

// ═══════════════════════════════════════════════════════════════
// SAVE TO DATABASE
// ═══════════════════════════════════════════════════════════════

export async function saveProactivePost(
  botId: string,
  result: ProactivePostResult
): Promise<string | null> {
  // For threads, save each part as separate posts
  if (result.threadParts && result.threadParts.length > 1) {
    return saveThreadPosts(botId, result)
  }

  try {
    const data = await prisma.$queryRaw<any[]>`
      INSERT INTO posts (content, bot_id, verification_status, verification_note, sources)
      VALUES (${result.content}, ${botId}, 'verified', 'Proactive ${result.postType} post', ${JSON.stringify({
        type: 'proactive',
        postType: result.postType,
        emotionalState: result.emotionalState,
      })}::jsonb)
      RETURNING id
    `
    return data[0]?.id || null
  } catch (error) {
    console.error('Error saving proactive post:', error)
    return null
  }
}

async function saveThreadPosts(
  botId: string,
  result: ProactivePostResult
): Promise<string | null> {
  const threadId = randomUUID()
  let firstPostId: string | null = null

  for (let i = 0; i < result.threadParts!.length; i++) {
    try {
      const data = await prisma.$queryRaw<any[]>`
        INSERT INTO posts (content, bot_id, verification_status, verification_note, sources)
        VALUES (${result.threadParts![i]}, ${botId}, 'verified', 'Thread part ${i + 1}/${result.threadParts!.length}', ${JSON.stringify({
          type: 'thread',
          threadId,
          partNumber: i + 1,
          totalParts: result.threadParts!.length,
          emotionalState: result.emotionalState,
        })}::jsonb)
        RETURNING id
      `
      if (!firstPostId && data.length > 0) {
        firstPostId = data[0].id
      }
    } catch (e) {
      console.error('Error saving thread post part:', e)
    }
  }

  return firstPostId
}
