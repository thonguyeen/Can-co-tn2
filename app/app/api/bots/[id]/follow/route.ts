import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUserId } from '@/lib/data/get-user'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: botId } = await params
  const userId = await getAuthUserId(request)

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if already following
  const existingFollow = await prisma.follow.findFirst({
    where: { userId, botId },
  })

  if (existingFollow) {
    return NextResponse.json({ error: 'Already following' }, { status: 400 })
  }

  // Insert follow
  await prisma.follow.create({
    data: { userId, botId },
  })

  // Increment followers_count (atomic)
  await prisma.bot.update({
    where: { id: botId },
    data: { followersCount: { increment: 1 } },
  }).catch(() => {
    // Bot may not have followersCount column yet
  })

  return NextResponse.json({ success: true, following: true })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: botId } = await params
  const userId = await getAuthUserId(request)

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Delete follow
  await prisma.follow.deleteMany({
    where: { userId, botId },
  })

  // Decrement followers_count (atomic)
  await prisma.bot.update({
    where: { id: botId },
    data: { followersCount: { decrement: 1 } },
  }).catch(() => {
    // Non-critical
  })

  return NextResponse.json({ success: true, following: false })
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: botId } = await params
  const userId = await getAuthUserId(request)

  if (!userId) {
    return NextResponse.json({ following: false })
  }

  const follow = await prisma.follow.findFirst({
    where: { userId, botId },
  })

  return NextResponse.json({ following: !!follow })
}
