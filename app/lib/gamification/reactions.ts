// ═══════════════════════════════════════════════════════════════
// EXPANDED REACTION SYSTEM
// ═══════════════════════════════════════════════════════════════

import { prisma } from '@/lib/db'
import { awardPoints } from './points'

export type ReactionType =
  | 'like'
  | 'love'
  | 'insightful'
  | 'funny'
  | 'skeptical'
  | 'angry'
  | 'fire'
  | 'mindblown'

export interface Reaction {
  type: ReactionType
  icon: string
  label: string
  points: number
}

export const REACTIONS: Record<ReactionType, Reaction> = {
  like: { type: 'like', icon: '❤️', label: 'Thich', points: 2 },
  love: { type: 'love', icon: '😍', label: 'Yeu thich', points: 3 },
  insightful: { type: 'insightful', icon: '💡', label: 'Sau sac', points: 5 },
  funny: { type: 'funny', icon: '😂', label: 'Hai huoc', points: 2 },
  skeptical: { type: 'skeptical', icon: '🤔', label: 'Hoai nghi', points: 1 },
  angry: { type: 'angry', icon: '😠', label: 'Buc minh', points: 1 },
  fire: { type: 'fire', icon: '🔥', label: 'Hot', points: 4 },
  mindblown: { type: 'mindblown', icon: '🤯', label: 'Kinh ngac', points: 5 },
}

// ═══════════════════════════════════════════════════════════════
// REACTION OPERATIONS
// ═══════════════════════════════════════════════════════════════

export async function addReaction(
  userId: string,
  targetType: 'post' | 'comment',
  targetId: string,
  reactionType: ReactionType
): Promise<{ action: 'added' | 'changed' | 'removed' }> {
  // Prisma migration note: Prisma schema only supports Reaction to Post (postId). 
  // If targetType is comment, it will fail unless mapped properly via raw sql or schema update.
  // Using $queryRaw directly helps maintain parity where Prisma model is mismatched.
  const existingRecords = await prisma.$queryRaw<any[]>`
    SELECT id, type, reaction_type FROM reactions 
    WHERE user_id = ${userId} 
      AND (
        (post_id = ${targetId} AND ${targetType} = 'post')
        OR
        (target_id = ${targetId} AND target_type = ${targetType})
      )
    LIMIT 1
  `

  const existing = existingRecords[0]

  if (existing) {
    const currentReactionType = existing.reaction_type || existing.type
    if (currentReactionType === reactionType) {
      await prisma.$executeRaw`DELETE FROM reactions WHERE id = ${existing.id}`
      return { action: 'removed' }
    } else {
      await prisma.$executeRaw`UPDATE reactions SET type = ${reactionType}, reaction_type = ${reactionType} WHERE id = ${existing.id}`
      return { action: 'changed' }
    }
  }

  // Insert new reaction
  if (targetType === 'post') {
    await prisma.reaction.create({
      data: {
        userId,
        postId: targetId,
        type: reactionType,
      }
    })
  } else {
    // raw insert for unsupported schemas 
    await prisma.$executeRaw`
      INSERT INTO reactions (user_id, target_type, target_id, reaction_type)
      VALUES (${userId}, ${targetType}, ${targetId}, ${reactionType})
    `
  }

  // Award points to reactor
  await awardPoints(userId, 'like_post', { reaction_type: reactionType })

  // Award points to content creator
  const creatorId = await getContentCreatorId(targetType, targetId)
  if (creatorId && creatorId !== userId) {
    await awardPoints(creatorId, 'receive_like', {
      reaction_type: reactionType,
      target_type: targetType,
      target_id: targetId,
    })
  }

  return { action: 'added' }
}

async function getContentCreatorId(
  targetType: 'post' | 'comment',
  targetId: string
): Promise<string | null> {
  const table = targetType === 'post' ? 'posts' : 'comments'

  if (table === 'posts') {
    const post = await prisma.post.findUnique({ where: { id: targetId }, select: { botId: true } })
    return post?.botId || null
  } else {
    const comment = await prisma.comment.findUnique({ where: { id: targetId }, select: { userId: true, botId: true } })
    return comment?.userId || comment?.botId || null
  }
}

export async function getReactions(
  targetType: 'post' | 'comment',
  targetId: string
): Promise<Record<ReactionType, number>> {
  let data: any[] = []
  
  if (targetType === 'post') {
    data = await prisma.reaction.findMany({
      where: { postId: targetId },
      select: { type: true }
    })
  } else {
    data = await prisma.$queryRaw<any[]>`
      SELECT reaction_type as type FROM reactions WHERE target_type = ${targetType} AND target_id = ${targetId}
    `
  }

  const counts: Record<ReactionType, number> = {
    like: 0, love: 0, insightful: 0, funny: 0,
    skeptical: 0, angry: 0, fire: 0, mindblown: 0,
  }

  ;(data || []).forEach(r => {
    const rType = (r.type || r.reaction_type) as ReactionType
    if (counts[rType] !== undefined) counts[rType]++
  })

  return counts
}

export async function getUserReaction(
  userId: string,
  targetType: 'post' | 'comment',
  targetId: string
): Promise<ReactionType | null> {
  let data;
  if (targetType === 'post') {
    data = await prisma.reaction.findFirst({
      where: { userId, postId: targetId },
      select: { type: true }
    })
  } else {
    const rawData = await prisma.$queryRaw<any[]>`
      SELECT reaction_type as type FROM reactions WHERE user_id = ${userId} AND target_type = ${targetType} AND target_id = ${targetId} LIMIT 1
    `
    data = rawData[0]
  }

  return (data?.type as ReactionType) || null
}
