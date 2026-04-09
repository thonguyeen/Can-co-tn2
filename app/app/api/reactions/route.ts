import { NextRequest, NextResponse } from 'next/server'
import { addReaction, getReactions, getUserReaction, ReactionType } from '@/lib/gamification/reactions'

// GET: Get reactions for a target
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const targetType = searchParams.get('targetType') as 'post' | 'comment'
    const targetId = searchParams.get('targetId')
    const userId = searchParams.get('userId')

    if (!targetType || !targetId) {
      return NextResponse.json(
        { error: 'targetType and targetId are required' },
        { status: 400 }
      )
    }

    const counts = await getReactions(targetType, targetId)
    let userReaction: ReactionType | null = null

    if (userId) {
      userReaction = await getUserReaction(userId, targetType, targetId)
    }

    return NextResponse.json({
      success: true,
      counts,
      userReaction,
    })
  } catch (error) {
    console.error('Reactions fetch error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch reactions' },
      { status: 500 }
    )
  }
}

// POST: Add/toggle reaction
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, targetType, targetId, reactionType } = body

    if (!userId || !targetType || !targetId || !reactionType) {
      return NextResponse.json(
        { error: 'userId, targetType, targetId, and reactionType are required' },
        { status: 400 }
      )
    }

    const result = await addReaction(userId, targetType, targetId, reactionType)

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    console.error('Reaction add error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add reaction' },
      { status: 500 }
    )
  }
}
