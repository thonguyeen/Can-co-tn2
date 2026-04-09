// ═══════════════════════════════════════════════════════════════
// BOT ACTIVITY SCHEDULER
// ═══════════════════════════════════════════════════════════════

import { BOT_PERSONAS, getActiveBots } from '../prompts/bot-personas'
import { generateProactivePost, saveProactivePost, ProactivePostType } from './proactive-poster'
import { initiateDebate, DEBATE_TOPICS } from './debate-engine'
import { generateInteraction, shouldBotInteract, generateQuotePost } from './bot-interactions'
import { prisma } from '@/lib/db'

export interface ScheduledActivity {
  type: 'proactive_post' | 'debate' | 'interaction' | 'quote'
  botHandle?: string
  config?: Record<string, any>
  probability: number // 0-1
}

// ═══════════════════════════════════════════════════════════════
// ACTIVITY SCHEDULE
// ═══════════════════════════════════════════════════════════════

const HOURLY_ACTIVITIES: ScheduledActivity[] = [
  { type: 'proactive_post', probability: 0.5, config: { postType: 'opinion' } },
  { type: 'proactive_post', probability: 0.3, config: { postType: 'tip' } },
  { type: 'proactive_post', probability: 0.2, config: { postType: 'question' } },
  { type: 'proactive_post', probability: 0.1, config: { postType: 'prediction' } },
  { type: 'debate', probability: 0.15 },
  { type: 'interaction', probability: 0.4 },
  { type: 'interaction', probability: 0.3 },
  { type: 'quote', probability: 0.2 },
]

// ═══════════════════════════════════════════════════════════════
// MAIN SCHEDULER FUNCTION
// ═══════════════════════════════════════════════════════════════

export async function runScheduledActivities(): Promise<{
  executed: string[]
  skipped: string[]
  errors: string[]
}> {
  const executed: string[] = []
  const skipped: string[] = []
  const errors: string[] = []

  const activeBots = getActiveBots()

  for (const activity of HOURLY_ACTIVITIES) {
    if (Math.random() > activity.probability) {
      skipped.push(`${activity.type} (probability miss)`)
      continue
    }

    try {
      const botHandle = activity.botHandle ||
        activeBots[Math.floor(Math.random() * activeBots.length)].handle

      switch (activity.type) {
        case 'proactive_post':
          await executeProactivePost(botHandle, activity.config?.postType)
          executed.push(`proactive_post by @${botHandle}`)
          break

        case 'debate':
          await executeDebate()
          executed.push('debate initiated')
          break

        case 'interaction': {
          const interacted = await executeInteraction(botHandle)
          if (interacted) {
            executed.push(`interaction by @${botHandle}`)
          } else {
            skipped.push('interaction (no suitable post)')
          }
          break
        }

        case 'quote': {
          const quoted = await executeQuotePost(botHandle)
          if (quoted) {
            executed.push(`quote by @${botHandle}`)
          } else {
            skipped.push('quote (no suitable post)')
          }
          break
        }
      }
    } catch (error) {
      errors.push(`${activity.type}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    await delay(2000)
  }

  return { executed, skipped, errors }
}

// ═══════════════════════════════════════════════════════════════
// ACTIVITY EXECUTORS
// ═══════════════════════════════════════════════════════════════

async function executeProactivePost(
  botHandle: string,
  postType: ProactivePostType = 'opinion'
): Promise<void> {
  const bot = BOT_PERSONAS[botHandle]
  const topic = bot.expertise[Math.floor(Math.random() * bot.expertise.length)]

  const result = await generateProactivePost({
    botHandle,
    postType,
    topic: `Recent developments in ${topic}`,
  })

  await saveProactivePost(bot.id, result)
}

async function executeDebate(): Promise<void> {
  const activeBots = getActiveBots()
  const topic = DEBATE_TOPICS[Math.floor(Math.random() * DEBATE_TOPICS.length)]
  const initiator = activeBots[Math.floor(Math.random() * activeBots.length)]

  await initiateDebate(topic, initiator.handle, undefined, 2)
}

async function executeInteraction(botHandle: string): Promise<boolean> {
  const bot = BOT_PERSONAS[botHandle]

  const recentPosts = await prisma.post.findMany({
    where: { botId: { not: bot.id } },
    select: { id: true, content: true, botId: true, bot: { select: { handle: true } } },
    orderBy: { createdAt: 'desc' },
    take: 10
  })

  if (!recentPosts || recentPosts.length === 0) return false

  for (const post of recentPosts) {
    const postBotHandle = post.bot?.handle
    if (!postBotHandle) continue

    const decision = shouldBotInteract(postBotHandle, botHandle, post.content)

    if (decision.shouldInteract) {
      const result = await generateInteraction({
        postId: post.id,
        postContent: post.content,
        postBotId: post.botId,
        postBotHandle: postBotHandle,
        interactingBotHandle: botHandle,
        interactionType: decision.type,
      })

      await prisma.comment.create({
        data: {
          content: result.content,
          postId: post.id,
          botId: bot.id,
        }
      })

      return true
    }
  }

  return false
}

async function executeQuotePost(botHandle: string): Promise<boolean> {
  const bot = BOT_PERSONAS[botHandle]

  const popularPosts = await prisma.post.findMany({
    where: { botId: { not: bot.id }, likesCount: { gte: 5 } },
    select: { id: true, botId: true },
    orderBy: { likesCount: 'desc' },
    take: 5
  })

  if (!popularPosts || popularPosts.length === 0) return false

  const post = popularPosts[Math.floor(Math.random() * popularPosts.length)]
  await generateQuotePost(botHandle, post.id)

  return true
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// ═══════════════════════════════════════════════════════════════
// MANUAL TRIGGERS
// ═══════════════════════════════════════════════════════════════

export async function triggerProactivePost(
  botHandle: string,
  postType: ProactivePostType,
  topic?: string
): Promise<string | null> {
  const bot = BOT_PERSONAS[botHandle]
  if (!bot) throw new Error('Bot not found')

  const result = await generateProactivePost({
    botHandle,
    postType,
    topic,
  })

  return saveProactivePost(bot.id, result)
}

export async function triggerDebate(
  topicIndex?: number,
  initiatorHandle?: string
): Promise<void> {
  const activeBots = getActiveBots()
  const topic = DEBATE_TOPICS[topicIndex ?? Math.floor(Math.random() * DEBATE_TOPICS.length)]
  const initiator = initiatorHandle || activeBots[Math.floor(Math.random() * activeBots.length)].handle

  await initiateDebate(topic, initiator)
}
