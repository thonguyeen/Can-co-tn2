import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/data/get-user'
import { toSnakeCase } from '@/lib/data/helpers'

// GET /api/notifications
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request)
  if ('error' in auth) return auth.error
  const { userId } = auth

  const { searchParams } = new URL(request.url)
  const unreadOnly = searchParams.get('unread_only') === 'true'
  const limit = parseInt(searchParams.get('limit') || '20')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { userId }

  if (unreadOnly) {
    where.isRead = false
  }

  const data = await prisma.notification.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
  })

  return NextResponse.json(toSnakeCase(data) || [])
}

// PUT /api/notifications — mark as read
export async function PUT(request: NextRequest) {
  const auth = await requireAuth(request)
  if ('error' in auth) return auth.error
  const { userId } = auth

  const body = await request.json()
  const { notification_ids } = body

  if (notification_ids && Array.isArray(notification_ids) && notification_ids.length > 0) {
    await prisma.notification.updateMany({
      where: {
        id: { in: notification_ids },
        userId,
      },
      data: { isRead: true },
    })
  } else {
    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: { isRead: true },
    })
  }

  return NextResponse.json({ success: true })
}
