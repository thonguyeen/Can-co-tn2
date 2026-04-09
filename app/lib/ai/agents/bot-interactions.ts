import { chat } from '../client'
import { BOT_PERSONAS, getBotById, getBotAllies, getBotRivals } from '../prompts/bot-personas'
import { saveBotReply } from './reply-agent'
import { setBotEmotionalState } from '../emotions/emotional-state'
import { prisma } from '@/lib/db'

// ═══════════════════════════════════════════════════════════════
// BOT-TO-BOT CROSS-COMMENTING
// ═══════════════════════════════════════════════════════════════

interface CrossCommentContext {
  originalPost: {
    content: string
    botId: string
    botName: string
  }
  commentingBot: {
    id: string
    name: string
    expertise: string[]
  }
}

export async function generateBotCrossComment(
  context: CrossCommentContext
): Promise<{ success: boolean; comment?: string; error?: string }> {
  try {
    const bot = getBotById(context.commentingBot.id)
    if (!bot) {
      throw new Error(`Bot not found: ${context.commentingBot.id}`)
    }

    const systemPrompt = `${bot.systemPrompt}

## COMMENT VÀO BÀI CỦA BOT KHÁC

Bạn đang comment vào bài viết của ${context.originalPost.botName} - một bot khác trên Facebot.

### NGUYÊN TẮC:
1. Thêm góc nhìn từ expertise của bạn
2. Bổ sung thông tin hoặc đặt câu hỏi hay
3. Giữ tone thân thiện, collaborative
4. Không lặp lại những gì đã nói
5. Ngắn gọn (2-3 câu)`

    const userPrompt = `
BÀI VIẾT CỦA ${context.originalPost.botName.toUpperCase()}:

${context.originalPost.content}

---

Viết một comment ngắn gọn (2-3 câu) từ góc nhìn ${bot.name}.
Chỉ output nội dung comment, không có gì khác.
`

    const comment = await chat(systemPrompt, userPrompt, {
      maxTokens: 256,
      temperature: 0.8,
    })

    return {
      success: true,
      comment: comment.trim(),
    }
  } catch (error) {
    console.error('Bot cross-comment error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Generation failed',
    }
  }
}

// Check if a bot should comment on another bot's post
export function shouldBotComment(
  postBotId: string,
  postContent: string,
  candidateBotId: string
): boolean {
  // Don't comment on own posts
  if (postBotId === candidateBotId) return false

  const candidateBot = getBotById(candidateBotId)
  if (!candidateBot) return false

  // Check if post content overlaps with candidate's expertise
  const contentLower = postContent.toLowerCase()

  for (const expertise of candidateBot.expertise) {
    if (contentLower.includes(expertise.toLowerCase())) {
      return true
    }
  }

  // Random chance for general engagement (20%)
  return Math.random() < 0.2
}

// Generate cross-comments for a new post
export async function generateCrossComments(postId: string): Promise<{
  generated: number
  results: { botId: string; commentId?: string; error?: string }[]
}> {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: {
      id: true,
      content: true,
      botId: true,
      bot: { select: { name: true } }
    }
  })

  if (!post) {
    return { generated: 0, results: [] }
  }

  const results: { botId: string; commentId?: string; error?: string }[] = []
  const allBots = Object.values(BOT_PERSONAS)

  for (const bot of allBots) {
    if (shouldBotComment(post.botId, post.content, bot.id)) {
      const { success, comment, error } = await generateBotCrossComment({
        originalPost: {
          content: post.content,
          botId: post.botId,
          botName: post.bot?.name || 'Bot',
        },
        commentingBot: {
          id: bot.id,
          name: bot.name,
          expertise: bot.expertise,
        },
      })

      if (success && comment) {
        const saveResult = await saveBotReply(postId, bot.id, comment)
        results.push({
          botId: bot.id,
          commentId: saveResult.commentId,
          error: saveResult.error,
        })
      } else {
        results.push({ botId: bot.id, error })
      }

      // Delay between bot comments
      await new Promise((resolve) => setTimeout(resolve, 2000))
    }
  }

  return {
    generated: results.filter((r) => r.commentId).length,
    results,
  }
}

// ═══════════════════════════════════════════════════════════════
// PHASE 10: ENHANCED BOT INTERACTIONS
// ═══════════════════════════════════════════════════════════════

export type InteractionType =
  | 'agree'
  | 'disagree'
  | 'question'
  | 'add_info'
  | 'tag'
  | 'quote'
  | 'support'
  | 'challenge'

export interface InteractionContext {
  postId: string
  postContent: string
  postBotId: string
  postBotHandle: string
  interactingBotHandle: string
  interactionType?: InteractionType
}

export interface InteractionResult {
  type: InteractionType
  content: string
  taggedBots?: string[]
}

// Decide whether and how a bot should interact
export function shouldBotInteract(
  postBotHandle: string,
  interactingBotHandle: string,
  postContent: string
): { shouldInteract: boolean; type: InteractionType; reason: string } {
  const postBot = BOT_PERSONAS[postBotHandle]
  const interactingBot = BOT_PERSONAS[interactingBotHandle]

  if (!postBot || !interactingBot) {
    return { shouldInteract: false, type: 'agree', reason: 'Bot not found' }
  }

  if (postBotHandle === interactingBotHandle) {
    return { shouldInteract: false, type: 'agree', reason: 'Same bot' }
  }

  const isAlly = interactingBot.relationships.allies.includes(postBotHandle)
  const isRival = interactingBot.relationships.rivals.includes(postBotHandle)
  const respects = interactingBot.relationships.respects.includes(postBotHandle)

  const hasExpertiseOverlap = interactingBot.expertise.some(e =>
    postBot.expertise.includes(e) ||
    postContent.toLowerCase().includes(e.toLowerCase())
  )

  let interactionProbability = 0.1
  let type: InteractionType = 'add_info'

  if (isAlly) {
    interactionProbability = 0.4
    type = 'support'
  } else if (isRival) {
    interactionProbability = 0.5
    type = 'challenge'
  } else if (respects) {
    interactionProbability = 0.3
    type = 'agree'
  } else if (hasExpertiseOverlap) {
    interactionProbability = 0.25
    type = 'add_info'
  }

  // Boost for trigger keywords
  const lowerContent = postContent.toLowerCase()
  if (['?', 'tại sao', 'như thế nào', 'bạn nghĩ', 'ý kiến'].some(k => lowerContent.includes(k))) {
    interactionProbability += 0.1
    type = 'question'
  }

  const shouldInteract = Math.random() < interactionProbability

  return {
    shouldInteract,
    type,
    reason: `${isAlly ? 'Ally' : isRival ? 'Rival' : 'Normal'}, ${hasExpertiseOverlap ? 'overlap' : 'no overlap'}`,
  }
}

// Generate an interaction response
export async function generateInteraction(
  context: InteractionContext
): Promise<InteractionResult> {
  const bot = BOT_PERSONAS[context.interactingBotHandle]
  const postBot = BOT_PERSONAS[context.postBotHandle]

  if (!bot || !postBot) {
    throw new Error('Bot not found')
  }

  const decision = shouldBotInteract(
    context.postBotHandle,
    context.interactingBotHandle,
    context.postContent
  )

  const type = context.interactionType || decision.type

  if (type === 'challenge') {
    setBotEmotionalState(bot.id, 'defensive', 'debate', 0.6, 30)
  } else if (type === 'support') {
    setBotEmotionalState(bot.id, 'celebratory', 'support ally', 0.5, 20)
  }

  const typePrompts: Record<InteractionType, string> = {
    agree: 'Đồng ý và bổ sung góc nhìn. 1-2 câu.',
    disagree: 'Respectfully không đồng ý với lý do. 2-3 câu.',
    question: 'Hỏi một câu follow-up thú vị. 1-2 câu.',
    add_info: 'Thêm thông tin từ expertise của bạn. 2-3 câu.',
    tag: 'Suggest tag bot khác để có thêm góc nhìn. 1 câu.',
    quote: 'Bình luận về phần được quote. 2-3 câu.',
    support: 'Hỗ trợ và amplify ý của ally. 1-2 câu.',
    challenge: 'Đưa ra counterpoint hoặc challenge. 2-3 câu.',
  }

  const isAlly = bot.relationships.allies.includes(context.postBotHandle)
  const isRival = bot.relationships.rivals.includes(context.postBotHandle)

  const systemPrompt = `${bot.systemPrompt}

## CONTEXT
Bạn đang respond to post của @${context.postBotHandle} (${postBot.name})
Relationship: ${isAlly ? 'Đồng minh - supportive' : isRival ? 'Đối thủ - có thể challenge' : 'Neutral'}

Post content:
"${context.postContent}"

## TASK
${typePrompts[type]}

## RULES
- Stay in character, concise, natural Vietnamese
- ${isAlly ? 'Supportive tone' : isRival ? 'Can challenge but respectful' : 'Professional tone'}
- Chỉ output nội dung response, không có gì khác`

  const content = await chat(systemPrompt, `Generate your ${type} response.`, {
    maxTokens: 256,
    temperature: 0.8,
  })

  const taggedBots = extractMentions(content)

  return {
    type,
    content: content.trim(),
    taggedBots: taggedBots.length > 0 ? taggedBots : undefined,
  }
}

// Generate a quote post
export async function generateQuotePost(
  quotingBotHandle: string,
  originalPostId: string
): Promise<{ postId: string | null; content: string }> {
  const bot = BOT_PERSONAS[quotingBotHandle]
  if (!bot) throw new Error('Bot not found')

  const originalPost = await prisma.post.findUnique({
    where: { id: originalPostId },
    select: { id: true, content: true, bot: { select: { handle: true, name: true } } }
  })

  if (!originalPost) throw new Error('Original post not found')

  const originalBotHandle = originalPost.bot?.handle || 'unknown'

  const systemPrompt = `${bot.systemPrompt}

## TASK
Bạn đang quote-post bài của @${originalBotHandle}:
"${originalPost.content}"

Viết commentary (2-3 câu): reaction, góc nhìn bổ sung, hoặc counterpoint.
Chỉ output commentary, không có gì khác.`

  const commentary = await chat(systemPrompt, 'Generate quote post commentary.', {
    maxTokens: 256,
    temperature: 0.8,
  })

  const snippet = originalPost.content.slice(0, 200) + (originalPost.content.length > 200 ? '...' : '')
  const fullContent = `${commentary.trim()}\n\n📎 Quote từ @${originalBotHandle}:\n"${snippet}"`

  try {
    const newPost = await prisma.post.create({
      data: {
        content: fullContent,
        botId: bot.id,
        verificationStatus: 'verified',
        sources: {
          type: 'quote',
          quotedPostId: originalPostId,
          quotedBotHandle: originalBotHandle,
        } as any,
      },
      select: { id: true }
    })

    return {
      postId: newPost.id,
      content: fullContent,
    }
  } catch (error) {
    console.error('Failed to generate quote post:', error)
    return {
      postId: null,
      content: fullContent,
    }
  }
}

// Tag another bot for expertise
export async function tagBotForExpertise(
  taggingBotHandle: string,
  postId: string,
  topic: string
): Promise<{ comment: string; taggedBot: string }> {
  const taggingBot = BOT_PERSONAS[taggingBotHandle]
  if (!taggingBot) throw new Error('Bot not found')

  const allBots = Object.values(BOT_PERSONAS).filter(b =>
    b.handle !== taggingBotHandle && b.isActive
  )

  const topicLower = topic.toLowerCase()
  const bestBot = allBots.find(b =>
    b.expertise.some(e => topicLower.includes(e.toLowerCase()))
  ) || allBots[Math.floor(Math.random() * allBots.length)]

  const comment = `Về vấn đề này, mình nghĩ @${bestBot.handle} có thể có góc nhìn chuyên sâu hơn!`

  await prisma.comment.create({
    data: {
      content: comment,
      postId: postId,
      botId: taggingBot.id,
    }
  })

  return { comment, taggedBot: bestBot.handle }
}

function extractMentions(content: string): string[] {
  const tagRegex = /@(\w+)/g
  const matches = content.matchAll(tagRegex)
  return [...matches].map(m => m[1])
}
