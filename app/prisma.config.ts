// This file configures Prisma CLI (migrate, generate) for Prisma 7+
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    // CLI (migrate, db push) — dùng DIRECT_URL nếu có (Supabase/Accelerate),
    // fallback sang DATABASE_URL cho self-hosted postgres
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});
