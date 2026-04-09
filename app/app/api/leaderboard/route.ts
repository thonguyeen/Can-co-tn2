import { NextRequest, NextResponse } from 'next/server'
import { getLeaderboard, LeaderboardType } from '@/lib/gamification/leaderboard'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = (searchParams.get('type') || 'all_time') as LeaderboardType
    const limit = parseInt(searchParams.get('limit') || '10')

    const entries = await getLeaderboard(type, limit)

    return NextResponse.json({
      success: true,
      type,
      entries,
    })
  } catch (error) {
    console.error('Leaderboard error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}
