import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { toSnakeCase } from '@/lib/data/helpers'

// GET: Fetch active breaking news
export async function GET() {
  try {
    const data = await prisma.breakingNews.findMany({
      where: {
        isActive: true,
        expiresAt: { gt: new Date() },
      },
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
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    // Deactivate expired ones
    await prisma.breakingNews.updateMany({
      where: {
        expiresAt: { lt: new Date() },
        isActive: true,
      },
      data: { isActive: false },
    })

    return NextResponse.json({
      success: true,
      breaking: toSnakeCase(data) || [],
    })
  } catch (error) {
    console.error('Breaking news fetch error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch breaking news' },
      { status: 500 }
    )
  }
}

// POST: Create breaking news (used by post-generator after detection)
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { postId, headline, summary, urgencyLevel, category, relatedTopics, expiresInMinutes } = body

    if (!postId || !headline) {
      return NextResponse.json(
        { error: 'postId and headline are required' },
        { status: 400 }
      )
    }

    const expiresAt = new Date(
      Date.now() + (expiresInMinutes || 120) * 60 * 1000
    )

    const data = await prisma.breakingNews.create({
      data: {
        postId,
        headline,
        summary: summary || '',
        urgencyLevel: urgencyLevel || 'medium',
        category: category || 'general',
        isActive: true,
        expiresAt,
      },
    })

    return NextResponse.json({
      success: true,
      breaking: toSnakeCase(data),
    })
  } catch (error) {
    console.error('Breaking news create error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create breaking news' },
      { status: 500 }
    )
  }
}
