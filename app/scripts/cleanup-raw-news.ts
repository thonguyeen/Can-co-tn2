// ═══════════════════════════════════════════════════════════════
// CLEANUP: RawNews Staging Buffer
// Gỡ bỏ dữ liệu rác sau khi đã parse để tối ưu DB.
// Chạy định kỳ thông qua cron.
// ═══════════════════════════════════════════════════════════════

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { prisma } from '../lib/db';

async function main() {
  console.log('[Cleanup] Starting auto-cleanup of RawNews staging buffer...');

  // Retention period: 7 days
  const RETENTION_DAYS = 7;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);

  try {
    const deleted = await prisma.rawNews.deleteMany({
      where: {
        isProcessed: true,
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    console.log(`[Cleanup] ✅ Deleted ${deleted.count} old processed records.`);
    console.log(`[Cleanup] Retention policy: Older than ${RETENTION_DAYS} days.`);
  } catch (error) {
    console.error('[Cleanup] ❌ Error cleaning RawNews:', error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
