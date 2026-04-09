import { NextRequest, NextResponse } from 'next/server'
import { getUserAchievements } from '@/lib/gamification/achievements'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await getUserAchievements(id)

    return NextResponse.json(result)
  } catch (error) {
    console.error('User achievements error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch achievements' },
      { status: 500 }
    )
  }
}
