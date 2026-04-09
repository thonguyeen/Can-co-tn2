import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUserId, requireAuth } from '@/lib/data/get-user'
import { toSnakeCase } from '@/lib/data/helpers'

// GET /api/comments?postId=xxx - Get comments for a post
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const postId = searchParams.get('postId')

  if (!postId) {
    return NextResponse.json({ error: 'postId required' }, { status: 400 })
  }

  const comments = await prisma.comment.findMany({
    where: { postId },
    include: {
      user: {
        select: {
          displayName: true,
          avatarUrl: true,
        },
      },
      bot: {
        select: {
          name: true,
          handle: true,
          avatarUrl: true,
          colorAccent: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  })

  // Transform to snake_case and add nested structure
  const commentsSnake = comments.map((c) => {
    const snake = toSnakeCase(c)
    // Rename relation keys: user → profiles, bot → bots (frontend expects these names)
    snake.profiles = snake.user
    snake.bots = snake.bot
    delete snake.user
    delete snake.bot
    return snake
  })

  // Build nested tree structure
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const commentMap = new Map<string, any>()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rootComments: any[] = []

  // First pass: create map
  commentsSnake.forEach((comment) => {
    commentMap.set(comment.id, { ...comment, replies: [] })
  })

  // Second pass: build tree
  commentsSnake.forEach((comment) => {
    const commentWithReplies = commentMap.get(comment.id)
    if (comment.parent_id) {
      const parent = commentMap.get(comment.parent_id)
      if (parent) {
        parent.replies.push(commentWithReplies)
      } else {
        rootComments.push(commentWithReplies)
      }
    } else {
      rootComments.push(commentWithReplies)
    }
  })

  return NextResponse.json({ comments: rootComments })
}

// POST /api/comments - Create a new comment
export async function POST(request: NextRequest) {
  const auth = await requireAuth(request)
  if ('error' in auth) return auth.error
  const { userId } = auth

  const body = await request.json()
  const { postId, content, parentId } = body

  if (!postId || !content) {
    return NextResponse.json(
      { error: 'postId and content required' },
      { status: 400 }
    )
  }

  // Create comment
  const comment = await prisma.comment.create({
    data: {
      postId,
      userId,
      content: content.trim(),
      parentId: parentId || null,
    },
    include: {
      user: {
        select: {
          displayName: true,
          avatarUrl: true,
        },
      },
    },
  })

  // Increment comment count
  await prisma.post.update({
    where: { id: postId },
    data: { commentsCount: { increment: 1 } },
  })

  // Convert to snake_case for frontend compatibility
  const commentSnake = toSnakeCase(comment)
  commentSnake.profiles = commentSnake.user
  delete commentSnake.user

  return NextResponse.json({ success: true, comment: commentSnake })
}
