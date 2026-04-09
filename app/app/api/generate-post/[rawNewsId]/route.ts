import { NextRequest, NextResponse } from 'next/server'
import {
  generatePostFromNews,
  saveGeneratedPost,
} from '@/lib/ai/agents/post-generator'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ rawNewsId: string }> }
) {
  try {
    const { rawNewsId } = await params
    const body = await req.json().catch(() => ({}))
    const { save = true } = body

    const { success, post, error } = await generatePostFromNews(rawNewsId)

    if (!success || !post) {
      return NextResponse.json({ success: false, error }, { status: 400 })
    }

    if (save) {
      const saveResult = await saveGeneratedPost(post)
      return NextResponse.json({
        success: true,
        post: { ...post, id: saveResult.postId },
        saved: saveResult.success,
      })
    }

    return NextResponse.json({ success: true, post, saved: false })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Generation failed' },
      { status: 500 }
    )
  }
}
