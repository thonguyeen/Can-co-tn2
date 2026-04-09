import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserRank } from '@/lib/gamification/leaderboard'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const stats = await prisma.userStat.findUnique({
      where: { userId: id },
    })

    if (!stats) {
      return NextResponse.json({
        totalPoints: 0,
        currentLevel: 1,
        currentStreak: 0,
        longestStreak: 0,
        likesGiven: 0,
        commentsMade: 0,
        predictionsCorrect: 0,
        rank: 0,
      })
    }

    const rank = await getUserRank(id)

    return NextResponse.json({
      totalPoints: stats.points || 0,
      currentLevel: stats.level || 1,
      currentStreak: stats.streakDays || 0,
      longestStreak: stats.streakDays || 0,
      likesGiven: stats.likesGiven || 0,
      commentsMade: stats.commentsMade || 0,
      predictionsCorrect: stats.correctPredictions || 0,
      rank: rank.allTime,
    })
  } catch (error) {
    console.error('User stats error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
