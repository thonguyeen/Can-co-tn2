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

  // Check if already saved (composite PK: userId + postId)
  const existingSave = await prisma.save.findUnique({
    where: { userId_postId: { userId, postId } },
  })

  if (existingSave) {
    return NextResponse.json({ error: 'Already saved' }, { status: 400 })
  }

  // Insert save
  await prisma.save.create({
    data: { userId, postId },
  })

  // Increment saves_count
  await prisma.post.update({
    where: { id: postId },
    data: { savesCount: { increment: 1 } },
  })

  return NextResponse.json({ success: true, saved: true })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: postId } = await params
  const auth = await requireAuth(request)
  if ('error' in auth) return auth.error
  const { userId } = auth

  // Delete save
  try {
    await prisma.save.delete({
      where: { userId_postId: { userId, postId } },
    })
  } catch {
    // Save not found — ignore
    return NextResponse.json({ success: true, saved: false })
  }

  // Decrement saves_count
  await prisma.post.update({
    where: { id: postId },
    data: { savesCount: { decrement: 1 } },
  })

  return NextResponse.json({ success: true, saved: false })
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: postId } = await params
  const { getAuthUserId } = await import('@/lib/data/get-user')
  const userId = await getAuthUserId(request)

  if (!userId) {
    return NextResponse.json({ saved: false })
  }

  const save = await prisma.save.findUnique({
    where: { userId_postId: { userId, postId } },
  })

  return NextResponse.json({ saved: !!save })
}
