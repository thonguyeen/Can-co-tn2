/**
 * Script: Gán role cho tài khoản Admin
 * Chạy: npx tsx scripts/set-admin-role.ts
 *
 * ⚠️ QUAN TRỌNG: Chạy script này TRƯỚC khi deploy Phase 02 (middleware)
 * Nếu không, bạn sẽ tự khoá mình khỏi trang Admin!
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import dotenv from "dotenv";
import path from "path";

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

function createPrisma() {
  const connectionString = process.env.DATABASE_URL!;
  if (!connectionString) {
    throw new Error("DATABASE_URL chưa được cấu hình trong .env.local");
  }
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter } as any);
}

const prisma = createPrisma();


// ═══════════════════════════════════════════════════════════════
// CẤU HÌNH: Sửa danh sách này trước khi chạy
// ═══════════════════════════════════════════════════════════════

const ADMIN_EMAILS: string[] = [
  "test@admin.com",
];

const MODERATOR_EMAILS: string[] = [
  // Thêm email Moderator vào đây (nếu có):
  // "moderator@example.com",
];

// ═══════════════════════════════════════════════════════════════

async function main() {
  console.log("🔐 RBAC Role Assignment Script");
  console.log("═".repeat(50));

  if (ADMIN_EMAILS.length === 0 && MODERATOR_EMAILS.length === 0) {
    console.error("❌ Chưa có email nào được cấu hình!");
    console.error("   Mở file scripts/set-admin-role.ts và thêm email vào");
    console.error("   ADMIN_EMAILS hoặc MODERATOR_EMAILS trước khi chạy.");
    process.exit(1);
  }

  // Gán ADMIN
  if (ADMIN_EMAILS.length > 0) {
    console.log(`\n👑 Gán role ADMIN cho ${ADMIN_EMAILS.length} tài khoản...`);
    for (const email of ADMIN_EMAILS) {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        console.warn(`  ⚠️  Không tìm thấy user: ${email} — bỏ qua`);
        continue;
      }
      await prisma.user.update({
        where: { email },
        data: { role: "ADMIN" },
      });
      console.log(`  ✅ ${email} → ADMIN`);
    }
  }

  // Gán MODERATOR
  if (MODERATOR_EMAILS.length > 0) {
    console.log(
      `\n🛡️  Gán role MODERATOR cho ${MODERATOR_EMAILS.length} tài khoản...`
    );
    for (const email of MODERATOR_EMAILS) {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        console.warn(`  ⚠️  Không tìm thấy user: ${email} — bỏ qua`);
        continue;
      }
      await prisma.user.update({
        where: { email },
        data: { role: "MODERATOR" },
      });
      console.log(`  ✅ ${email} → MODERATOR`);
    }
  }

  // Hiển thị tổng kết
  console.log("\n" + "═".repeat(50));
  console.log("📊 Tổng kết phân quyền hiện tại:");
  const allUsers = await prisma.user.findMany({ select: { role: true } });
  const roleCounts: Record<string, number> = {};
  for (const u of allUsers) {
    roleCounts[u.role] = (roleCounts[u.role] ?? 0) + 1;
  }
  for (const [role, count] of Object.entries(roleCounts)) {
    const icon = role === "ADMIN" ? "👑" : role === "MODERATOR" ? "🛡️ " : "👤";
    console.log(`  ${icon} ${role}: ${count} tài khoản`);
  }

  console.log("\n✅ Hoàn tất! Giờ an toàn để deploy Phase 02 (middleware).");
}

main()
  .catch((e) => {
    console.error("❌ Lỗi:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
