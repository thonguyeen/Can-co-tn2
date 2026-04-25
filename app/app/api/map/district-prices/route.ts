// @ts-nocheck
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/map/district-prices — Giá BĐS trung bình theo Quận/Huyện
// Dùng để tô màu Choropleth layer trên bản đồ
// Được cache 5 phút vì dữ liệu thay đổi chậm
export async function GET() {
  try {
    // Raw SQL để GROUP BY và AVG hiệu quả
    const rows = await prisma.$queryRaw<
      { district: string; avg_price: bigint; listing_count: bigint }[]
    >`
      SELECT
        district,
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
        AND district IS NOT NULL
        AND district != ''
        AND (price IS NOT NULL OR price_min IS NOT NULL)
      GROUP BY district
      ORDER BY avg_price DESC NULLS LAST
    `;

    // Chuyển BigInt → Number để JSON serializable
    const districts: Record<string, { avgPrice: number; count: number }> = {};
    for (const row of rows) {
      if (row.district) {
        districts[row.district] = {
          avgPrice: row.avg_price ? Number(row.avg_price) : 0,
          count: Number(row.listing_count),
        };
      }
    }

    return NextResponse.json(
      { districts },
      {
        headers: {
          // Cache 5 phút
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (err) {
    console.error('[GET /api/map/district-prices] Error:', err);
    return NextResponse.json(
      { error: 'Không thể tải dữ liệu giá khu vực' },
      { status: 500 }
    );
  }
}
