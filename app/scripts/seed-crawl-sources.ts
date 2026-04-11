// ═══════════════════════════════════════════════════════════════
// SEED: Default BĐS Crawl Sources (Phase 02)
// Chạy: npx tsx scripts/seed-crawl-sources.ts
// Dùng upsert (by URL) → an toàn khi chạy lại
// ChoTot bị bỏ qua vì API endpoint đã 404
// ═══════════════════════════════════════════════════════════════

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

const DEFAULT_SOURCES = [
  // ── 1. BatDongSan HTML ────────────────────────────────────
  {
    name: 'BatDongSan.com.vn - TP.HCM',
    url: 'https://batdongsan.com.vn/nha-dat-ban/tp-hcm',
    sourceType: 'html',
    category: 'real_estate',
    province: 'Hồ Chí Minh',
    crawlIntervalMinutes: 120,
    notes: null, // sẽ dùng preset auto-detect
  },
  // ── 2. AlonhaDat HTML ─────────────────────────────────────
  {
    name: 'AlonhaDat.com.vn - TP.HCM',
    url: 'https://alonhadat.com.vn/nha-dat/can-ban/1/ho-chi-minh.html',
    sourceType: 'html',
    category: 'real_estate',
    province: 'Hồ Chí Minh',
    crawlIntervalMinutes: 120,
    notes: null,
  },
  // ── 3. CafeLand RSS ───────────────────────────────────────
  {
    name: 'CafeLand.vn - BĐS RSS',
    url: 'https://cafeland.vn/rss/can-mua-ban.rss',
    sourceType: 'rss',
    category: 'real_estate',
    province: null,
    crawlIntervalMinutes: 60, // RSS nhanh hơn, cào mỗi giờ
    notes: null,
  },
];

async function seed() {
  console.log('[Seed] Seeding default crawl sources...');
  let upserted = 0;
  let skipped = 0;

  for (const src of DEFAULT_SOURCES) {
    try {
      // findFirst by URL (không có @unique → không thể upsert by url)
      const existing = await prisma.crawlSource.findFirst({
        where: { url: src.url },
        select: { id: true, name: true, sourceType: true },
      });

      if (existing) {
        await prisma.crawlSource.update({
          where: { id: existing.id },
          data: {
            name: src.name,
            sourceType: src.sourceType,
            category: src.category,
            province: src.province,
            crawlIntervalMinutes: src.crawlIntervalMinutes,
            isActive: true,
          },
        });
        console.log(`[Seed] 🔄 Updated: ${src.name} (${src.sourceType}) — ${existing.id}`);
        upserted++;
      } else {
        const created = await prisma.crawlSource.create({
          data: {
            name: src.name,
            url: src.url,
            sourceType: src.sourceType,
            category: src.category,
            province: src.province,
            crawlIntervalMinutes: src.crawlIntervalMinutes,
            isActive: true,
            notes: src.notes,
          },
          select: { id: true, name: true, sourceType: true },
        });
        console.log(`[Seed] ✅ Created: ${created.name} (${created.sourceType}) — ${created.id}`);
        upserted++;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      // URL có thể không phải unique field, xử lý gracefully
      if (msg.includes('Unique constraint')) {
        console.log(`[Seed] ⚠️  Skip (already exists): ${src.name}`);
        skipped++;
      } else {
        console.error(`[Seed] ❌ Error for ${src.name}:`, msg);
      }
    }
  }

  console.log(`\n[Seed] Done! ${upserted} upserted, ${skipped} skipped`);
  console.log('[Seed] ChoTot bị bỏ qua: API endpoint v2/public/ad/listing → 404');
}

seed()
  .then(() => process.exit(0))
  .catch((err) => { console.error(err); process.exit(1); })
  .finally(() => prisma.$disconnect());
