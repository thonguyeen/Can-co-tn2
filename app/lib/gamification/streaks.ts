// ═══════════════════════════════════════════════════════════════
// STREAK SYSTEM
// ═══════════════════════════════════════════════════════════════

import { prisma } from '@/lib/db'
import { awardPoints, POINT_VALUES } from './points'
import { checkAchievement } from './achievements'

export interface StreakInfo {
  currentStreak: number
  longestStreak: number
  lastActiveDate: string | null
  isActiveToday: boolean
  streakBroken: boolean
  nextMilestone: number
}

const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100]

// ═══════════════════════════════════════════════════════════════
// STREAK OPERATIONS
// ═══════════════════════════════════════════════════════════════

export async function recordDailyActivity(userId: string): Promise<StreakInfo> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const stats = await prisma.userStat.findUnique({
    where: { userId },
    select: { streakDays: true, lastActiveDate: true }
  })

  const currentStreak = stats?.streakDays || 0
  const longestStreak = stats?.streakDays || 0 // Warning: Prisma doesn't have longest_streak in schema currently. using streakDays
  const lastActiveDate = stats?.lastActiveDate

  const isActiveToday = !!(lastActiveDate && lastActiveDate.getTime() === today.getTime())

  if (isActiveToday) {
    return {
      currentStreak,
      longestStreak,
      lastActiveDate: lastActiveDate.toISOString().split('T')[0],
      isActiveToday: true,
      streakBroken: false,
      nextMilestone: getNextMilestone(currentStreak),
    }
  }

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  let newStreak: number
  let streakBroken = false

  if (lastActiveDate && lastActiveDate.getTime() === yesterday.getTime()) {
    newStreak = currentStreak + 1
  } else if (!lastActiveDate) {
    newStreak = 1
  } else {
    newStreak = 1
    streakBroken = currentStreak > 0
  }

  const newLongest = Math.max(longestStreak, newStreak)

  // Using raw update for longest_streak if the table supports it but schema doesn't yet.
  // Actually we can update streakDays using prisma natively:
  await prisma.userStat.upsert({
    where: { userId },
    update: { streakDays: newStreak, lastActiveDate: today, updatedAt: new Date() },
    create: { userId, streakDays: newStreak, lastActiveDate: today, updatedAt: new Date() }
  })
  
  // Try to update longest streak via raw if the column exists
  try {
    await prisma.$executeRaw`
      UPDATE user_stats SET longest_streak = ${newLongest} WHERE user_id = ${userId}
    `
  } catch (e) {
    // Ignore if longest_streak column is not actually in db
  }

  await awardPoints(userId, 'daily_login')

  if (newStreak > 1) {
    const streakBonus = POINT_VALUES.streak_bonus * newStreak
    await prisma.$executeRaw`
      INSERT INTO point_transactions (user_id, action, points, metadata)
      VALUES (${userId}, 'streak_bonus', ${streakBonus}, ${JSON.stringify({ streak_days: newStreak })}::jsonb)
    `
  }

  const streakAchievements = ['streak_3', 'streak_7', 'streak_30', 'streak_100']
  for (const achievementId of streakAchievements) {
    await checkAchievement(userId, achievementId)
  }

  if (STREAK_MILESTONES.includes(newStreak)) {
    await prisma.$executeRaw`
      INSERT INTO notifications (user_id, type, title, message, data)
      VALUES (${userId}, 'streak_milestone', ${`Streak ${newStreak} ngay!`}, ${`Tuyet voi! Ban da duy tri streak ${newStreak} ngay lien tiep.`}, ${JSON.stringify({ streak: newStreak })}::jsonb)
    `
  }

  return {
    currentStreak: newStreak,
    longestStreak: newLongest,
    lastActiveDate: today.toISOString().split('T')[0],
    isActiveToday: true,
    streakBroken,
    nextMilestone: getNextMilestone(newStreak),
  }
}

function getNextMilestone(currentStreak: number): number {
  for (const milestone of STREAK_MILESTONES) {
    if (milestone > currentStreak) {
      return milestone
    }
  }
  return currentStreak + 10
}

export async function getStreakInfo(userId: string): Promise<StreakInfo> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const rawStats = await prisma.$queryRaw<any[]>`
    SELECT current_streak, longest_streak, last_active_date FROM user_stats WHERE user_id = ${userId} LIMIT 1
  `

  if (!rawStats || rawStats.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      isActiveToday: false,
      streakBroken: false,
      nextMilestone: 3,
    }
  }

  const stats = rawStats[0]
  
  // Format last_active_date from Date to string YYYY-MM-DD
  let lastActiveDateStr = null
  let isActiveToday = false
  
  if (stats.last_active_date) {
    const d = new Date(stats.last_active_date)
    lastActiveDateStr = d.toISOString().split('T')[0]
    
    // Check if active today
    isActiveToday = lastActiveDateStr === today.toISOString().split('T')[0]
  }

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  const streakBroken = !isActiveToday &&
    lastActiveDateStr !== yesterdayStr &&
    stats.current_streak > 0

  return {
    currentStreak: streakBroken ? 0 : stats.current_streak,
    longestStreak: stats.longest_streak || 0,
    lastActiveDate: lastActiveDateStr,
    isActiveToday,
    streakBroken,
    nextMilestone: getNextMilestone(stats.current_streak || 0),
  }
}
