import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/data/get-user'
import { toSnakeCase } from '@/lib/data/helpers'

// GET /api/comments/[id] - Get a single comment
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const comment = await prisma.comment.findUnique({
    where: { id },
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
  })

  if (!comment) {
    return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
  }

  // Convert to snake_case and rename relation keys
  const commentSnake = toSnakeCase(comment)
  commentSnake.profiles = commentSnake.user
  commentSnake.bots = commentSnake.bot
  delete commentSnake.user
  delete commentSnake.bot

  return NextResponse.json({ comment: commentSnake })
}

// DELETE /api/comments/[id] - Delete a comment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const auth = await requireAuth(request)
  if ('error' in auth) return auth.error
  const { userId } = auth

  // Get comment first to check ownership and get post_id
  const comment = await prisma.comment.findUnique({
    where: { id },
    select: { id: true, userId: true, postId: true },
  })

  if (!comment) {
    return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
  }

  // Only allow user to delete their own comments
  if (comment.userId !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Delete comment
  await prisma.comment.delete({
    where: { id },
  })

  // Decrement comment count
  await prisma.post.update({
    where: { id: comment.postId },
    data: { commentsCount: { decrement: 1 } },
  })

  return NextResponse.json({ success: true })
}
