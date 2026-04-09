import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/data/get-user'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: postId } = await params
  const auth = await requireAuth(request)
  if ('error' in auth) return auth.error
  const { userId } = auth

  // Check if already liked (composite PK: userId + postId)
  const existingLike = await prisma.like.findUnique({
    where: { userId_postId: { userId, postId } },
  })

  if (existingLike) {
    return NextResponse.json({ error: 'Already liked' }, { status: 400 })
  }

  // Insert like
  await prisma.like.create({
    data: { userId, postId },
  })

  // Increment likes_count
  await prisma.post.update({
    where: { id: postId },
    data: { likesCount: { increment: 1 } },
  })

  return NextResponse.json({ success: true, liked: true })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: postId } = await params
  const auth = await requireAuth(request)
  if ('error' in auth) return auth.error
  const { userId } = auth

  // Delete like
  try {
    await prisma.like.delete({
      where: { userId_postId: { userId, postId } },
    })
  } catch {
    // Like not found — ignore
    return NextResponse.json({ success: true, liked: false })
  }

  // Decrement likes_count
  await prisma.post.update({
    where: { id: postId },
    data: { likesCount: { decrement: 1 } },
  })

  return NextResponse.json({ success: true, liked: false })
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: postId } = await params
  const { getAuthUserId } = await import('@/lib/data/get-user')
  const userId = await getAuthUserId(request)

  if (!userId) {
    return NextResponse.json({ liked: false })
  }

  const like = await prisma.like.findUnique({
    where: { userId_postId: { userId, postId } },
  })

  return NextResponse.json({ liked: !!like })
}
