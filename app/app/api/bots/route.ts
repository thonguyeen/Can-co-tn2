import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { toSnakeCase } from '@/lib/data/helpers';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const handle = searchParams.get('handle');
  const limit = parseInt(searchParams.get('limit') || '50');

  try {
    if (handle) {
      // Get single bot
      const data = await prisma.bot.findUnique({
        where: { handle },
      });

      if (!data) {
        return NextResponse.json({ success: false, error: 'Bot not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, data: toSnakeCase(data) });
    }

    // Get all bots
    const data = await prisma.bot.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: data.map(toSnakeCase),
      count: data.length,
    });
  } catch (error) {
    console.error('[Bots API] Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, handle, category, province, district, is_envoy = true } = body;

    if (!name || !handle || !category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, handle, category' },
        { status: 400 }
      );
    }

    const data = await prisma.bot.create({
      data: {
        name,
        handle,
        isEnvoy: is_envoy,
        assignedProvince: province || null,
        assignedDistrict: district || null,
        assignedCategories: [category],
        dailyQuota: 10,
        postsToday: 0,
        colorAccent: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`,
        expertise: ['local_market', category],
        personality: 'professional',
      },
    });

    return NextResponse.json({ success: true, data: toSnakeCase(data) });
  } catch (error) {
    console.error('[Bots API POST] Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Whitelist: chỉ cho phép update các field này qua API
const ALLOWED_UPDATE_FIELDS = new Set([
  'system_prompt', 'knowledge_text', 'schedule_config', 'bot_type',
  'is_active', 'is_envoy',
  'assigned_province', 'assigned_district', 'assigned_ward',
  'assigned_province_code', 'assigned_district_code', 'assigned_ward_code',
  'assigned_categories', 'daily_quota',
  'name', 'bio', 'expertise', 'personality', 'color', 'color_accent', 'avatar_url',
]);

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { handle, ...updateFields } = body;

    if (!handle) {
      return NextResponse.json(
        { success: false, error: 'Missing bot handle' },
        { status: 400 }
      );
    }

    // Filter: chỉ chấp nhận fields trong whitelist
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prismaData: any = {};
    const rejected: string[] = [];
    for (const [key, value] of Object.entries(updateFields)) {
      if (!ALLOWED_UPDATE_FIELDS.has(key)) {
        rejected.push(key);
        continue;
      }
      // Convert common snake_case keys to camelCase
      const camelKey = key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
      prismaData[camelKey] = value;
    }

    if (rejected.length > 0) {
      console.warn(`[Bots API PUT] Rejected fields: ${rejected.join(', ')}`);
    }

    if (Object.keys(prismaData).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid update fields provided' },
        { status: 400 }
      );
    }

    const data = await prisma.bot.update({
      where: { handle },
      data: prismaData,
    });

    return NextResponse.json({ success: true, data: toSnakeCase(data) });
  } catch (error) {
    console.error('[Bots API PUT] Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
