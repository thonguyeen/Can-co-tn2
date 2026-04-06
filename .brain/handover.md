# 📋 HANDOVER DOCUMENT — Cần & Có Platform

**Date:** 2026-04-06 16:38 (GMT+7)
**Status:** Migration COMPLETE ✅

---

## 📍 Đang ở đâu

**Chiến dịch "Cắt đứt 100% Supabase"** đã hoàn thành 5/5 phases:

```
████████████████████ 100% (5/5 phases)

Phase 01: Setup Prisma          ✅
Phase 02: NextAuth Migration    ✅
Phase 03: API Rewrite           ✅
Phase 04: Realtime & Storage    ✅
Phase 05: Data Migration        ✅
```

## ✅ ĐÃ XONG

- **30 Prisma models** synced lên DB production
- **4 users** migrated từ `auth.users` → `public.users`
- **0 TypeScript errors** — codebase clean 100%
- **0 Supabase imports** — hoàn toàn độc lập
- **Git initialized** với 2 commits (baseline + phase 05)
- **Login page** renders đúng, API auth guard hoạt động (401)
- **Middleware** dùng NextAuth JWT, không Supabase SSR

## 🔧 QUYẾT ĐỊNH QUAN TRỌNG

| Quyết định | Lý do |
|-----------|-------|
| **Dual-table auth** | Giữ FK `profiles.id → auth.users(id)`. Copy users với cùng UUID sang `public.users`. Zero-risk. |
| **HTTP Polling** (not WebSocket) | Platform independence. 15s feed, 3s chat. |
| **Local filesystem storage** | Đủ cho MVP. Cần S3 cho serverless deploy. |
| **bcrypt compatible** | Supabase + NextAuth đều dùng bcrypt → users login bình thường. |

## ⚠️ LƯU Ý CHO SESSION SAU

### Technical Debt (10 TODOs)
- 4 missing Prisma models: `userAchievement`, `pointTransaction`, `pushLog`, `userChannel`
- 15+ dead RLS policies using `auth.uid()`
- Dead trigger `on_auth_user_created`
- `/demo` route returns 404

### Environment
- App runs on **port 4000**: `npm run dev -- -p 4000`
- DB connection uses **PgBouncer** (port 6543) for runtime, **Direct** (port 5432) for Prisma CLI
- `prisma.config.ts` reads `DIRECT_URL`, `lib/db.ts` reads `DATABASE_URL`

## 📁 FILES QUAN TRỌNG

| File | Purpose |
|------|---------|
| `app/lib/db.ts` | Prisma client singleton (PrismaPg adapter) |
| `app/lib/auth.ts` | NextAuth config (Credentials + JWT) |
| `app/lib/data/get-user.ts` | Auth helper: `getAuthUserId()`, `requireAuth()` |
| `app/middleware.ts` | Route protection (NextAuth JWT) |
| `app/prisma/schema.prisma` | 30 models, 663 lines |
| `app/prisma.config.ts` | CLI config (reads DIRECT_URL) |
| `app/scripts/migrate-auth-users.ts` | Phase 05 migration script |
| `plans/260403-1050-postgres-migration/plan.md` | Migration plan (✅ Complete) |
| `.brain/brain.json` | Project knowledge base |
| `.brain/session.json` | Dynamic session state |

---

📍 **Đã lưu! Để tiếp tục: Gõ `/recap`**
