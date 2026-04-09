// ═══════════════════════════════════════════════════════════════
// LEADERBOARD SYSTEM
// ═══════════════════════════════════════════════════════════════

import { prisma } from '@/lib/db'
import { getLevelForPoints } from './points'

export type LeaderboardType =
  | 'all_time'
  | 'weekly'
  | 'streak'
  | 'predictions'

export interface LeaderboardEntry {
  rank: number
  userId: string
  username: string
  avatarUrl?: string
  points: number
  level: number
  levelName: string
  levelIcon: string
  streak?: number
}

// ═══════════════════════════════════════════════════════════════
// LEADERBOARD QUERIES
// ═══════════════════════════════════════════════════════════════

export async function getLeaderboard(
  type: LeaderboardType,
  limit: number = 10
): Promise<LeaderboardEntry[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let data: any[] = []

  switch (type) {
    case 'all_time': {
      const allTime = await prisma.userStat.findMany({
        orderBy: { points: 'desc' },
        take: limit,
      })
      data = allTime.map((s: any) => ({
        user_id: s.userId,
        total_points: s.points,
        current_level: s.level,
        current_streak: s.streakDays,
      }))
      break
    }

    case 'weekly': {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weeklyPoints = await prisma.pointTransaction.groupBy({
        by: ['userId'],
        _sum: { amount: true },
        where: { createdAt: { gte: weekAgo } },
        orderBy: { _sum: { amount: 'desc' } },
        take: limit,
      });
      data = weeklyPoints.map(w => ({
        user_id: w.userId,
        total_points: w._sum.amount || 0,
        current_level: 1,
        current_streak: 0,
      }));
      break;
    }

    case 'streak': {
      const streaks = await prisma.userStat.findMany({
        orderBy: { streakDays: 'desc' },
        take: limit,
      })
      data = streaks.map((s: any) => ({
        user_id: s.userId,
        total_points: s.points,
        current_level: s.level,
        current_streak: s.streakDays,
      }))
      break
    }

    case 'predictions': {
      const predictions = await prisma.userStat.findMany({
        orderBy: { correctPredictions: 'desc' },
        take: limit,
      })
      data = predictions.map((s: any) => ({
        user_id: s.userId,
        total_points: s.points,
        current_level: s.level,
        predictions_correct: s.correctPredictions,
      }))
      break
    }
  }

  // Fetch profiles for all users
  const userIds = data.map(d => d.user_id)
  let profiles: Record<string, { displayName: string; avatarUrl?: string | null }> = {}

  if (userIds.length > 0) {
    const profileData = await prisma.profile.findMany({
      where: { id: { in: userIds } },
      select: { id: true, displayName: true, avatarUrl: true },
    })

    profiles = Object.fromEntries(
      profileData.map(p => [p.id, { displayName: p.displayName as string, avatarUrl: p.avatarUrl }])
    )
  }

  return data.map((entry, index) => {
    const level = getLevelForPoints(entry.total_points || 0)
    const profile = profiles[entry.user_id]
    return {
      rank: index + 1,
      userId: entry.user_id,
      username: profile?.displayName || 'Anonymous',
      avatarUrl: profile?.avatarUrl || undefined,
      points: entry.total_points || 0,
      level: entry.current_level || 1,
      levelName: level.name,
      levelIcon: level.icon,
      streak: entry.current_streak,
    }
  })
}

export async function getUserRank(userId: string): Promise<{
  allTime: number
  weekly: number
}> {
  const userStats = await prisma.userStat.findUnique({
    where: { userId },
    select: { points: true },
  })

  const userPoints = userStats?.points || 0

  const higherCount = await prisma.userStat.count({
    where: { points: { gt: userPoints } },
  })

  return {
    allTime: higherCount + 1,
    weekly: Math.max(1, Math.floor((higherCount + 1) / 2)),
  }
}
