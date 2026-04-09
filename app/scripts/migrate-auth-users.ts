/**
 * Phase 05: Migrate auth.users → public.users (NextAuth)
 * 
 * Strategy: DUAL-TABLE (Option A)
 * - Copy users từ auth.users sang public.users với CÙNG UUID
 * - FK profiles.id → auth.users(id) vẫn giữ nguyên
 * - Prisma queries dùng public.users cho NextAuth
 * - Zero-risk, reversible
 * 
 * Usage: npx ts-node scripts/migrate-auth-users.ts
 * (hoặc: npx tsx scripts/migrate-auth-users.ts)
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('❌ DATABASE_URL not found in .env');
  process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: ['error', 'warn'],
} as any);

interface SupabaseAuthUser {
  id: string;
  email: string | null;
  encrypted_password: string | null;
  email_confirmed_at: Date | null;
  created_at: Date | null;
  raw_user_meta_data: Record<string, any> | null;
}

async function main() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📦 PHASE 05: Auth User Migration');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Step 1: Query auth.users từ Supabase auth schema
  console.log('1️⃣ Đọc users từ auth.users...');
  
  const authUsers = await prisma.$queryRaw<SupabaseAuthUser[]>`
    SELECT 
      id, 
      email, 
      encrypted_password, 
      email_confirmed_at, 
      created_at,
      raw_user_meta_data
    FROM auth.users
    WHERE email IS NOT NULL
    ORDER BY created_at ASC
  `;

  console.log(`   → Tìm thấy ${authUsers.length} users trong auth.users\n`);

  if (authUsers.length === 0) {
    console.log('⚠️ Không có users nào trong auth.users. Bỏ qua migration.');
    await prisma.$disconnect();
    return;
  }

  // Step 2: Query existing profiles
  console.log('2️⃣ Đọc profiles hiện có...');

  const profiles = await prisma.profile.findMany({
    select: {
      id: true,
      displayName: true,
      avatarUrl: true,
    },
  });

  const profileMap = new Map(profiles.map(p => [p.id, p]));
  console.log(`   → Tìm thấy ${profiles.length} profiles\n`);

  // Step 3: Upsert users vào public.users (NextAuth User model)
  console.log('3️⃣ Migrating users...\n');

  let migrated = 0;
  let skipped = 0;
  let errors = 0;

  for (const su of authUsers) {
    try {
      const profile = profileMap.get(su.id);
      const displayName = profile?.displayName
        || su.raw_user_meta_data?.display_name
        || su.raw_user_meta_data?.full_name
        || su.email?.split('@')[0]
        || null;

      await prisma.user.upsert({
        where: { id: su.id },
        update: {
          // Update password hash nếu user đã tồn tại
          passwordHash: su.encrypted_password,
          emailVerified: su.email_confirmed_at,
        },
        create: {
          id: su.id,
          email: su.email?.toLowerCase(),
          passwordHash: su.encrypted_password,
          name: displayName,
          image: profile?.avatarUrl || null,
          emailVerified: su.email_confirmed_at,
        },
      });

      migrated++;
      console.log(`   ✅ ${su.email} → migrated (${displayName || 'no name'})`);
    } catch (err: any) {
      // Nếu lỗi unique constraint → user đã tồn tại
      if (err.code === 'P2002') {
        skipped++;
        console.log(`   ⏭️ ${su.email} → already exists, skipped`);
      } else {
        errors++;
        console.log(`   ❌ ${su.email} → ERROR: ${err.message}`);
      }
    }
  }

  // Step 4: Include system user (Nguồn Ngoài)
  console.log('\n4️⃣ Checking system user (Nguồn Ngoài)...');
  const SYSTEM_USER_ID = '11111111-1111-1111-1111-111111111111';

  try {
    await prisma.user.upsert({
      where: { id: SYSTEM_USER_ID },
      update: {},
      create: {
        id: SYSTEM_USER_ID,
        email: 'crawl-system@canco.vn',
        name: 'Nguồn ngoài',
        passwordHash: null, // System user, no login
      },
    });
    console.log('   ✅ System user (Nguồn ngoài) → OK\n');
  } catch (err: any) {
    console.log(`   ⚠️ System user: ${err.message}\n`);
  }

  // Step 5: Verify
  console.log('5️⃣ Verification...');
  const totalUsers = await prisma.user.count();
  const totalProfiles = await prisma.profile.count();

  console.log(`   📊 public.users: ${totalUsers} records`);
  console.log(`   📊 profiles: ${totalProfiles} records\n`);

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 MIGRATION SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`   ✅ Migrated: ${migrated}`);
  console.log(`   ⏭️ Skipped:  ${skipped}`);
  console.log(`   ❌ Errors:   ${errors}`);
  console.log(`   📦 Total in public.users: ${totalUsers}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (errors === 0) {
    console.log('🎉 Migration hoàn tất thành công!');
  } else {
    console.log('⚠️ Có lỗi trong quá trình migration. Kiểm tra lại.');
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('💥 Fatal error:', e);
  prisma.$disconnect();
  process.exit(1);
});
