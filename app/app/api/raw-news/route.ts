import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { toSnakeCase } from '@/lib/data/helpers'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = parseInt(searchParams.get('offset') || '0')
  const processed = searchParams.get('processed')

  // Build where clause
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {}
  if (processed === 'true') {
    where.isProcessed = true
  } else if (processed === 'false') {
    where.isProcessed = false
  }

  const data = await prisma.rawNews.findMany({
    where,
    include: {
      source: {
        select: { name: true, credibilityScore: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    skip: offset,
    take: limit,
  })

  return NextResponse.json({ news: toSnakeCase(data) })
}
