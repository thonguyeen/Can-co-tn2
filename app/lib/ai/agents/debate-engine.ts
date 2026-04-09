// ═══════════════════════════════════════════════════════════════
// BOT DEBATE ENGINE
// ═══════════════════════════════════════════════════════════════

import { BOT_PERSONAS, getBotRivals } from '../prompts/bot-personas'
import { chat } from '../client'
import { setBotEmotionalState } from '../emotions/emotional-state'

export interface DebateTopic {
  title: string
  context: string
  positions: {
    for: string
    against: string
  }
}

export interface DebateParticipant {
  botHandle: string
  position: 'for' | 'against' | 'neutral'
  relationship: 'ally' | 'rival' | 'neutral'
}

export interface DebateEntry {
  botHandle: string
  content: string
  timestamp: Date
}

export interface DebateResult {
  topic: DebateTopic
  participants: DebateParticipant[]
  entries: DebateEntry[]
  postId: string | null
}

// ═══════════════════════════════════════════════════════════════
// DEBATE TOPIC TEMPLATES
// ═══════════════════════════════════════════════════════════════

export const DEBATE_TOPICS: DebateTopic[] = [
  {
    title: 'AI có nên được regulated?',
    context: 'Với sự phát triển nhanh chóng của AI, câu hỏi về regulation ngày càng cấp bách.',
    positions: {
      for: 'AI cần được regulated để đảm bảo an toàn và đạo đức',
      against: 'Regulation quá sớm sẽ cản trở innovation',
    },
  },
  {
    title: 'Crypto có phải tương lai của finance?',
    context: 'Bitcoin và crypto đã tồn tại hơn 15 năm, nhưng mass adoption vẫn còn xa.',
    positions: {
      for: 'Crypto là cuộc cách mạng tài chính, decentralization là tương lai',
      against: 'Crypto quá volatile, thiếu regulation, không thể thay thế traditional finance',
    },
  },
  {
    title: 'Remote work vs Office work?',
    context: 'Post-pandemic, nhiều công ty đang tranh cãi về return-to-office.',
    positions: {
      for: 'Remote work tăng productivity và work-life balance',
      against: 'Office work cần thiết cho collaboration và company culture',
    },
  },
  {
    title: 'Apple Silicon vs x86 cho professional work?',
    context: 'Apple Silicon đã chứng minh performance, nhưng compatibility vẫn là vấn đề.',
    positions: {
      for: 'Apple Silicon vượt trội về performance-per-watt, tương lai là ARM',
      against: 'x86 vẫn cần thiết cho compatibility và specific workloads',
    },
  },
  {
    title: 'Startup nên bootstrap hay raise funding?',
    context: 'Trong thời kỳ funding winter, câu hỏi này càng relevant.',
    positions: {
      for: 'Bootstrap giữ control và forces profitability focus',
      against: 'VC funding cần thiết để scale nhanh và cạnh tranh',
    },
  },
]

// ═══════════════════════════════════════════════════════════════
// MAIN DEBATE FUNCTION
// ═══════════════════════════════════════════════════════════════

export async function initiateDebate(
  topic: DebateTopic,
  initiatorHandle: string,
  targetHandle?: string,
  maxRounds: number = 3
): Promise<DebateResult> {
  const initiator = BOT_PERSONAS[initiatorHandle]
  if (!initiator) throw new Error(`Initiator bot not found: ${initiatorHandle}`)

  // Find opponent
  const opponentHandle = targetHandle || findDebateOpponent(initiatorHandle)
  const opponent = BOT_PERSONAS[opponentHandle]
  if (!opponent) throw new Error(`Opponent bot not found: ${opponentHandle}`)

  // Assign positions
  const participants = assignPositions(initiatorHandle, opponentHandle)

  // Set emotional states
  setBotEmotionalState(initiator.id, 'analytical', topic.title, 0.7, 120)
  setBotEmotionalState(opponent.id, 'analytical', topic.title, 0.7, 120)

  // Generate debate entries
  const entries: DebateEntry[] = []

  // Round 1: Initiator opening
  const opening = await generateDebateEntry(
    initiatorHandle,
    topic,
    participants.find(p => p.botHandle === initiatorHandle)!.position,
    'opening',
    []
  )
  entries.push(opening)

  // Subsequent rounds
  for (let round = 0; round < maxRounds; round++) {
    const currentBot = round % 2 === 0 ? opponentHandle : initiatorHandle
    const position = participants.find(p => p.botHandle === currentBot)!.position

    const entry = await generateDebateEntry(
      currentBot,
      topic,
      position,
      round === maxRounds - 1 ? 'closing' : 'rebuttal',
      entries
    )

    entries.push(entry)
    await delay(500)
  }

  // Save debate to database
  const postId = await saveDebateToDatabase(topic, initiator.id, entries)

  return {
    topic,
    participants,
    entries,
    postId,
  }
}

// ═══════════════════════════════════════════════════════════════
// DEBATE ENTRY GENERATION
// ═══════════════════════════════════════════════════════════════

async function generateDebateEntry(
  botHandle: string,
  topic: DebateTopic,
  position: 'for' | 'against' | 'neutral',
  stage: 'opening' | 'rebuttal' | 'closing',
  previousEntries: DebateEntry[]
): Promise<DebateEntry> {
  const bot = BOT_PERSONAS[botHandle]

  const stagePrompts = {
    opening: 'Đưa ra argument mở đầu. Clear position, 2-3 main points.',
    rebuttal: 'Respond to previous argument. Acknowledge valid points, counter weak ones.',
    closing: 'Tổng kết argument. Nhấn mạnh key points, offer olive branch if appropriate.',
  }

  const positionText = position === 'for'
    ? topic.positions.for
    : position === 'against'
      ? topic.positions.against
      : 'Balanced view'

  const systemPrompt = `${bot.systemPrompt}

## DEBATE CONTEXT
Topic: ${topic.title}
Your position: ${positionText}
Stage: ${stage}

## PREVIOUS EXCHANGES
${previousEntries.map(e => `@${e.botHandle}: ${e.content}`).join('\n\n')}

## INSTRUCTIONS
${stagePrompts[stage]}

Rules:
- Stay in character
- Be respectful but firm
- Use data/examples when possible
- 2-4 sentences
- No "As an AI" or similar
- Chỉ output nội dung argument, không có gì khác`

  const content = await chat(systemPrompt, `Write your ${stage} argument for the debate on "${topic.title}".`, {
    maxTokens: 512,
    temperature: 0.8,
  })

  return {
    botHandle,
    content: content.trim(),
    timestamp: new Date(),
  }
}

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function findDebateOpponent(initiatorHandle: string): string {
  // Prefer rivals
  const rivals = getBotRivals(initiatorHandle)
  if (rivals.length > 0) {
    return rivals[Math.floor(Math.random() * rivals.length)].handle
  }

  // Find bot with different expertise
  const otherBots = Object.values(BOT_PERSONAS)
    .filter(b => b.handle !== initiatorHandle && b.isActive)

  return otherBots[Math.floor(Math.random() * otherBots.length)].handle
}

function assignPositions(
  initiatorHandle: string,
  opponentHandle: string
): DebateParticipant[] {
  const initiator = BOT_PERSONAS[initiatorHandle]
  const isRival = initiator.relationships.rivals.includes(opponentHandle)
  const isAlly = initiator.relationships.allies.includes(opponentHandle)

  const initiatorFor = Math.random() > 0.5

  return [
    {
      botHandle: initiatorHandle,
      position: initiatorFor ? 'for' : 'against',
      relationship: isRival ? 'rival' : isAlly ? 'ally' : 'neutral',
    },
    {
      botHandle: opponentHandle,
      position: initiatorFor ? 'against' : 'for',
      relationship: isRival ? 'rival' : isAlly ? 'ally' : 'neutral',
    },
  ]
}

import { prisma } from '@/lib/db'

async function saveDebateToDatabase(
  topic: DebateTopic,
  initiatorBotId: string,
  entries: DebateEntry[]
): Promise<string | null> {
  try {
    const post = await prisma.post.create({
      data: {
        content: `DEBATE: ${topic.title}\n\n${entries[0].content}`,
        botId: initiatorBotId,
        verificationStatus: 'verified',
        sources: { type: 'debate', topic: topic.title } as any,
      },
      select: { id: true }
    })

    if (!post) return null

    // Save subsequent entries as comments
    for (let i = 1; i < entries.length; i++) {
      const entry = entries[i]
      const entryBot = BOT_PERSONAS[entry.botHandle]
      if (!entryBot) continue

      await prisma.comment.create({
        data: {
          content: entry.content,
          postId: post.id,
          botId: entryBot.id,
        }
      })
    }

    // Update bot debates_count
    await prisma.bot.update({
      where: { id: initiatorBotId },
      data: { debatesCount: { increment: 1 } }
    })

    return post.id
  } catch (error) {
    console.error('Failed to save debate to database:', error)
    return null
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
