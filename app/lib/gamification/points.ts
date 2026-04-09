// ═══════════════════════════════════════════════════════════════
// POINT SYSTEM
// ═══════════════════════════════════════════════════════════════

import { prisma } from '@/lib/db'

export type PointAction =
  | 'like_post'
  | 'comment'
  | 'share'
  | 'save'
  | 'receive_like'
  | 'receive_comment'
  | 'bot_reply'
  | 'first_comment'
  | 'daily_login'
  | 'streak_bonus'
  | 'prediction_correct'
  | 'prediction_wrong'
  | 'report_verified'
  | 'achievement_unlock'
  | 'level_up'

// ═══════════════════════════════════════════════════════════════
// POINT VALUES
// ═══════════════════════════════════════════════════════════════

export const POINT_VALUES: Record<PointAction, number> = {
  like_post: 1,
  comment: 5,
  share: 3,
  save: 2,
  receive_like: 2,
  receive_comment: 5,
  bot_reply: 10,
  first_comment: 15,
  daily_login: 10,
  streak_bonus: 5,
  prediction_correct: 50,
  prediction_wrong: -10,
  report_verified: 25,
  achievement_unlock: 20,
  level_up: 100,
}

// ═══════════════════════════════════════════════════════════════
// LEVEL SYSTEM
// ═══════════════════════════════════════════════════════════════

export const LEVELS = [
  { level: 1, name: 'Newcomer', minPoints: 0, icon: '🌱' },
  { level: 2, name: 'Reader', minPoints: 100, icon: '📖' },
  { level: 3, name: 'Commenter', minPoints: 300, icon: '💬' },
  { level: 4, name: 'Contributor', minPoints: 700, icon: '✍️' },
  { level: 5, name: 'Enthusiast', minPoints: 1500, icon: '🔥' },
  { level: 6, name: 'Expert', minPoints: 3000, icon: '🎓' },
  { level: 7, name: 'Influencer', minPoints: 6000, icon: '⭐' },
  { level: 8, name: 'Master', minPoints: 12000, icon: '👑' },
  { level: 9, name: 'Legend', minPoints: 25000, icon: '🏆' },
  { level: 10, name: 'Mythic', minPoints: 50000, icon: '💎' },
]

export function getLevelForPoints(points: number): typeof LEVELS[0] {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (points >= LEVELS[i].minPoints) {
      return LEVELS[i]
    }
  }
  return LEVELS[0]
}

export function getProgressToNextLevel(points: number): {
  current: typeof LEVELS[0]
  next: typeof LEVELS[0] | null
  progress: number
  pointsNeeded: number
} {
  const current = getLevelForPoints(points)
  const nextIndex = LEVELS.findIndex(l => l.level === current.level) + 1
  const next = nextIndex < LEVELS.length ? LEVELS[nextIndex] : null

  if (!next) {
    return { current, next: null, progress: 100, pointsNeeded: 0 }
  }

  const pointsInLevel = points - current.minPoints
  const levelRange = next.minPoints - current.minPoints
  const progress = Math.min(100, (pointsInLevel / levelRange) * 100)
  const pointsNeeded = next.minPoints - points

  return { current, next, progress, pointsNeeded }
}

// ═══════════════════════════════════════════════════════════════
// POINT OPERATIONS
// ═══════════════════════════════════════════════════════════════

export interface PointTransaction {
  userId: string
  action: PointAction
  points: number
  metadata?: Record<string, unknown>
}

export async function awardPoints(
  userId: string,
  action: PointAction,
  metadata?: Record<string, unknown>
): Promise<{ newTotal: number; transaction: PointTransaction }> {
  const points = POINT_VALUES[action]

  const transaction: PointTransaction = { userId, action, points, metadata }

  // Record transaction in raw SQL since it's not mapped in Prisma schema
  await prisma.$executeRaw`
    INSERT INTO point_transactions (user_id, action, points, metadata)
    VALUES (${userId}, ${action}, ${points}, ${metadata ? JSON.stringify(metadata) : '{}'}::jsonb)
  `

  const userStat = await prisma.userStat.findUnique({
    where: { userId },
    select: { points: true }
  })

  const currentPoints = userStat?.points || 0
  const newTotal = currentPoints + points

  await prisma.userStat.upsert({
    where: { userId },
    update: { points: newTotal, updatedAt: new Date() },
    create: { userId, points: newTotal, updatedAt: new Date() }
  })

  // Check for level up
  await checkLevelUp(userId, newTotal)

  return { newTotal, transaction }
}

export async function getUserPoints(userId: string): Promise<number> {
  const userStat = await prisma.userStat.findUnique({
    where: { userId },
    select: { points: true }
  })

  return userStat?.points || 0
}

export async function getPointHistory(
  userId: string,
  limit: number = 20
): Promise<PointTransaction[]> {
  const data = await prisma.$queryRaw<any[]>`
    SELECT user_id, action, points, metadata FROM point_transactions
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `

  return (data || []).map(d => ({
    userId: d.user_id,
    action: d.action,
    points: d.points,
    metadata: d.metadata,
  }))
}

async function checkLevelUp(userId: string, newTotal: number): Promise<void> {
  const user = await prisma.userStat.findUnique({
    where: { userId },
    select: { level: true }
  })

  const currentLevel = user?.level || 1
  const newLevel = getLevelForPoints(newTotal)

  if (newLevel.level > currentLevel) {
    await prisma.userStat.update({
      where: { userId },
      data: { level: newLevel.level }
    })

    await prisma.$executeRaw`
      INSERT INTO point_transactions (user_id, action, points, metadata)
      VALUES (${userId}, 'level_up', ${POINT_VALUES.level_up}, ${JSON.stringify({ new_level: newLevel.level, level_name: newLevel.name })}::jsonb)
    `

    await prisma.$executeRaw`
      INSERT INTO notifications (user_id, type, title, message, data)
      VALUES (${userId}, 'level_up', 'Level Up!', ${`Ban da dat ${newLevel.icon} ${newLevel.name} (Level ${newLevel.level})!`}, ${JSON.stringify({ level: newLevel })}::jsonb)
    `

    // Lazy import to avoid circular dependency
    const { checkAchievement } = await import('./achievements')
    await checkAchievement(userId, `level_${newLevel.level}`)
  }
}
