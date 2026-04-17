import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/map/geojson — GeoJSON FeatureCollection cho bản đồ BĐS
// Chỉ trả Intent có lat/lng hợp lệ và status active
// Params: ?type=CAN|CO &district=X &priceMin=X &priceMax=X &verified=true
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const type = searchParams.get('type');
    const district = searchParams.get('district');
    const priceMin = searchParams.get('priceMin');
    const priceMax = searchParams.get('priceMax');
    const verifiedOnly = searchParams.get('verified') === 'true';

    // Build dynamic where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      status: 'active',
      lat: { not: null },
      lng: { not: null },
    };

    if (type === 'CAN' || type === 'CO') {
      where.type = type;
    }
    if (district) {
      where.district = district;
    }
    if (priceMin || priceMax) {
      where.OR = [
        {
          price: {
            ...(priceMin ? { gte: BigInt(priceMin) } : {}),
            ...(priceMax ? { lte: BigInt(priceMax) } : {}),
          },
        },
        {
          priceMin: {
            ...(priceMin ? { gte: BigInt(priceMin) } : {}),
          },
        },
      ];
    }
    if (verifiedOnly) {
      where.verificationLevel = { in: ['verified', 'kyc'] };
    }

    // Fetch intents với ảnh đầu tiên và tên user
    const intents = await prisma.intent.findMany({
      where,
      select: {
        id: true,
        type: true,
        title: true,
        price: true,
        priceMin: true,
        priceMax: true,
        district: true,
        ward: true,
        city: true,
        subcategory: true,
        lat: true,
        lng: true,
        trustScore: true,
        verificationLevel: true,
        isBot: true,
        userId: true,
        botHandle: true,
        images: {
          select: { url: true, displayOrder: true },
          orderBy: { displayOrder: 'asc' },
          take: 1,
        },
      },
      orderBy: { trustScore: 'desc' },
      // Giới hạn 1000 điểm để đảm bảo hiệu suất bản đồ
      take: 1000,
    });

    // Batch lấy tên user/bot
    const userIds = [...new Set(intents.filter(i => !i.isBot && i.userId).map(i => i.userId!))];
    const botHandles = [...new Set(intents.filter(i => i.isBot && i.botHandle).map(i => i.botHandle!))];

    const [profiles, bots] = await Promise.all([
      prisma.profile.findMany({
        where: { id: { in: userIds } },
        select: { id: true, displayName: true },
      }),
      prisma.bot.findMany({
        where: { handle: { in: botHandles } },
        select: { handle: true, name: true },
      }),
    ]);

    const profilesMap = new Map(profiles.map(p => [p.id, p.displayName || 'Người dùng']));
    const botsMap = new Map(bots.map(b => [b.handle, b.name]));

    // Chuyển đổi sang GeoJSON FeatureCollection chuẩn RFC 7946
    const features = intents.map(intent => {
      const lat = Number(intent.lat);
      const lng = Number(intent.lng);

      // Lấy giá hiển thị (ưu tiên price, fallback priceMin)
      const price = intent.price ? Number(intent.price)
        : intent.priceMin ? Number(intent.priceMin)
        : null;

      // Lấy ảnh đầu tiên
      const imageUrl = intent.images?.[0]?.url || null;

      // Lấy tên
      const userName = intent.isBot
        ? botsMap.get(intent.botHandle ?? '') || 'Bot'
        : profilesMap.get(intent.userId ?? '') || 'Người dùng';

      return {
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [lng, lat], // GeoJSON: [longitude, latitude]
        },
        properties: {
          id: intent.id,
          type: intent.type,         // 'CAN' | 'CO'
          title: intent.title,
          price,                     // Số tiền (VND), null nếu không có
          district: intent.district,
          ward: intent.ward,
          city: intent.city,
          subcategory: intent.subcategory,
          trustScore: intent.trustScore,
          verificationLevel: intent.verificationLevel,
          imageUrl,
          userName,
        },
      };
    });

    const geojson = {
      type: 'FeatureCollection' as const,
      features,
    };

    return NextResponse.json(geojson, {
      headers: {
        // Cache 30 giây — cân bằng freshness và hiệu suất
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (err) {
    console.error('[GET /api/map/geojson] Error:', err);
    return NextResponse.json(
      { error: 'Không thể tải dữ liệu bản đồ' },
      { status: 500 }
    );
  }
}
