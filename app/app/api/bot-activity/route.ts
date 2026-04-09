import { NextRequest, NextResponse } from 'next/server'
import {
  runScheduledActivities,
  triggerProactivePost,
  triggerDebate,
} from '@/lib/ai/agents/activity-scheduler'
import { ProactivePostType } from '@/lib/ai/agents/proactive-poster'

export const maxDuration = 120

// GET: Run scheduled activities (for cron)
export async function GET() {
  try {
    const result = await runScheduledActivities()

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Bot activity error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Activity failed' },
      { status: 500 }
    )
  }
}

// POST: Trigger specific activity
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, botHandle, postType, topic, topicIndex } = body

    let result: any

    switch (action) {
      case 'proactive_post':
        if (!botHandle || !postType) {
          return NextResponse.json(
            { error: 'botHandle and postType required' },
            { status: 400 }
          )
        }
        const postId = await triggerProactivePost(
          botHandle,
          postType as ProactivePostType,
          topic
        )
        result = { postId }
        break

      case 'debate':
        await triggerDebate(topicIndex, botHandle)
        result = { message: 'Debate initiated' }
        break

      case 'scheduled':
        result = await runScheduledActivities()
        break

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      action,
      result,
    })
  } catch (error) {
    console.error('Bot activity error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Activity failed' },
      { status: 500 }
    )
  }
}
