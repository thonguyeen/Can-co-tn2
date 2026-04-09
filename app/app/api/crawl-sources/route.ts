import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { toSnakeCase } from '@/lib/data/helpers';

// GET: Lấy danh sách nguồn cào
export async function GET() {
  try {
    const data = await prisma.crawlSource.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const mapped = toSnakeCase(data);
    return NextResponse.json({ success: true, data: mapped, count: mapped.length });
  } catch (error) {
    console.error('[Crawl Sources GET] Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST: Tạo mới nguồn cào
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name, url,
      source_type = 'rss',
      category = 'real_estate',
      province, district,
      is_active = true,
    } = body;

    if (!name || !url) {
      return NextResponse.json(
        { success: false, error: 'Name and URL are required' },
        { status: 400 }
      );
    }

    const data = await prisma.crawlSource.create({
      data: {
        name,
        url,
        sourceType: source_type,
        category,
        province: province || null,
        district: district || null,
        isActive: is_active,
      },
    });

    return NextResponse.json({ success: true, data: toSnakeCase(data) });
  } catch (error) {
    console.error('[Crawl Sources POST] Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT: Cập nhật nguồn cào (bật/tắt, sửa URL...)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateFields } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Source ID is required' },
        { status: 400 }
      );
    }

    // Map snake_case body keys → camelCase Prisma fields
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prismaData: Record<string, any> = {};
    for (const [key, value] of Object.entries(updateFields)) {
      const camelKey = key.replace(/_([a-z])/g, (_, l) => l.toUpperCase());
      prismaData[camelKey] = value;
    }

    const data = await prisma.crawlSource.update({
      where: { id },
      data: prismaData,
    });

    return NextResponse.json({ success: true, data: toSnakeCase(data) });
  } catch (error) {
    console.error('[Crawl Sources PUT] Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE: Xóa nguồn cào
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Source ID is required' },
        { status: 400 }
      );
    }

    await prisma.crawlSource.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Crawl Sources DELETE] Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
