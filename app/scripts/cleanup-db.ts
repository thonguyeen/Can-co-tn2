import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

/**
 * Phase 02: Dọn dẹp Database (Post-Migration)
 * 
 * Target: 
 * - Drop Trigger on_auth_user_created
 * - Drop Function handle_new_user
 * - Disable RLS trên các table.
 * 
 * Lưu ý: Dùng DIRECT_URL để có đủ quyền thực thi DDL (Data Definition Language) 
 * thay vì thông qua PgBouncer (DATABASE_URL).
 */

import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const directUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!directUrl) {
  console.error('❌ DIRECT_URL or DATABASE_URL not found in .env');
  process.exit(1);
}

const pool = new Pool({ connectionString: directUrl });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
} as any);

async function main() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🧹 PHASE 02: Dọn dẹp Trigger & RLS Policies');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // 1. Drop trigger on auth.users
    console.log('1️⃣ Đang xoá Trigger `on_auth_user_created`...');
    await prisma.$executeRawUnsafe(`
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    `);
    console.log('   ✅ Xoá Trigger thành công.\n');

    // 2. Drop function handle_new_user
    console.log('2️⃣ Đang xoá Function `public.handle_new_user`...');
    await prisma.$executeRawUnsafe(`
      DROP FUNCTION IF EXISTS public.handle_new_user();
    `);
    console.log('   ✅ Xoá Function thành công.\n');

    // 3. Disable RLS
    console.log('3️⃣ Đang vô hiệu hoá RLS trên các bảng public chính...');
    const tables = ['profiles', 'intents', 'posts', 'comments', 'crawl_sources', 'bots'];
    for (const table of tables) {
      try {
        await prisma.$executeRawUnsafe(`
          ALTER TABLE public.${table} DISABLE ROW LEVEL SECURITY;
        `);
        console.log(`   ✅ RLS đã được disable trên bảng ${table}`);
      } catch (err: any) {
        console.log(`   ⚠️ Cảnh báo trên ${table}: ${err.message}`);
      }
    }
    console.log('\n🎉 Hoàn thành dọn dẹp Database!');
  } catch (err: any) {
    console.error('\n❌ Lỗi khi dọn dẹp:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error('💥 Fatal error:', e);
  process.exit(1);
});
