import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { toSnakeCase } from '@/lib/data/helpers'

// GET: Fetch single breaking news by ID
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const data = await prisma.breakingNews.findUnique({
      where: { id },
      include: {
        post: {
          select: {
            content: true,
            botId: true,
            bot: {
              select: {
                name: true,
                handle: true,
                colorAccent: true,
              },
            },
          },
        },
      },
    })

    if (!data) {
      return NextResponse.json(
        { error: 'Not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      breaking: toSnakeCase(data),
    })
  } catch (error) {
    console.error('Breaking news fetch error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Not found' },
      { status: 404 }
    )
  }
}

// PATCH: Update breaking news (deactivate, extend, etc.)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { is_active, extends_minutes } = body

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updates: any = {}

    if (typeof is_active === 'boolean') {
      updates.isActive = is_active
    }

    if (extends_minutes) {
      // Extend expiry time
      const current = await prisma.breakingNews.findUnique({
        where: { id },
        select: { expiresAt: true },
      })

      if (current?.expiresAt) {
        const currentExpiry = new Date(current.expiresAt).getTime()
        const newExpiry = Math.max(currentExpiry, Date.now()) + extends_minutes * 60 * 1000
        updates.expiresAt = new Date(newExpiry)
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid update fields provided' },
        { status: 400 }
      )
    }

    const data = await prisma.breakingNews.update({
      where: { id },
      data: updates,
    })

    return NextResponse.json({
      success: true,
      breaking: toSnakeCase(data),
    })
  } catch (error) {
    console.error('Breaking news update error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Update failed' },
      { status: 500 }
    )
  }
}

// DELETE: Remove breaking news
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.breakingNews.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Breaking news delete error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Delete failed' },
      { status: 500 }
    )
  }
}
