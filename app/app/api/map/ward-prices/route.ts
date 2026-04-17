import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/map/ward-prices — Giá BĐS trung bình theo Phường/Xã
// Dùng để tô màu Choropleth layer trên bản đồ (thay thế district-prices)
// VN đã bỏ cấp Quận từ 2025, chỉ còn Tỉnh/Thành → Phường/Xã
// Được cache 5 phút vì dữ liệu thay đổi chậm
export async function GET() {
  try {
    // Raw SQL để GROUP BY và AVG hiệu quả
    const rows = await prisma.$queryRaw<
      { ward: string; avg_price: bigint; listing_count: bigint }[]
    >`
      SELECT
        ward,
        AVG(
          CASE
            WHEN price IS NOT NULL THEN price
            WHEN price_min IS NOT NULL THEN price_min
            ELSE NULL
          END
        )::bigint AS avg_price,
        COUNT(*) AS listing_count
      FROM intents
      WHERE
        status = 'active'
        AND ward IS NOT NULL
        AND ward != ''
        AND (price IS NOT NULL OR price_min IS NOT NULL)
      GROUP BY ward
      ORDER BY avg_price DESC NULLS LAST
    `;

    // Chuyển BigInt → Number để JSON serializable
    const wards: Record<string, { avgPrice: number; count: number }> = {};
    for (const row of rows) {
      if (row.ward) {
        wards[row.ward] = {
          avgPrice: row.avg_price ? Number(row.avg_price) : 0,
          count: Number(row.listing_count),
        };
      }
    }

    return NextResponse.json(
      { wards },
      {
        headers: {
          // Cache 5 phút
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (err) {
    console.error('[GET /api/map/ward-prices] Error:', err);
    return NextResponse.json(
      { error: 'Không thể tải dữ liệu giá khu vực' },
      { status: 500 }
    );
  }
}
