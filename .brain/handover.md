━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 HANDOVER DOCUMENT — REFERRAL SYSTEM MVP COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 Feature: Referral System & User Management
🔢 Status: ✅ ALL 6 PHASES COMPLETE — MVP Shipped

✅ ĐÃ XONG:
   - Phase 01: Database ✓ (4 new models + Profile/UserStat/PointTransaction updates)
   - Phase 02: Backend APIs ✓ (ReferralService, 7 referral endpoints, Register integration)
   - Phase 03: Admin APIs ✓ (5 admin endpoints, user mgmt, redemption approval)
   - Phase 04: User Frontend ✓ (/profile/referral, /leaderboard, /rewards — 9 components)
   - Phase 05: Admin Frontend ✓ (AdminUsersTab, AdminReferralTab, User Detail, recharts)
   - Phase 06: Integration ✓ (Seed data, boost sorting, TS fixes, build pass)

🏗️ KIẾN TRÚC BOOST SORTING:
   - Dùng Hybrid SQL: Raw query lấy ID đã sort → Prisma findMany để hydrate
   - LEFT JOIN intent_boosts → CASE WHEN sort boosted first
   - Frontend không cần sửa (API contract giữ nguyên)

🔧 QUYẾT ĐỊNH QUAN TRỌNG:
   - Prisma 7: seed.ts tạo PrismaPg adapter riêng (không import lib/db.ts)
   - Next.js 16: register/page.tsx wrap Suspense cho useSearchParams
   - Admin auth: Email whitelist (ADMIN_EMAILS env var)
   - Boost sort: Hybrid SQL thay vì memory sort

⏳ CÒN LẠI (Post-MVP):
   - [ ] git commit -m "feat: referral system MVP"
   - [ ] Cleanup /api/dev/test-logic + middleware bypass
   - [ ] Deploy to production (switch DB to Supabase pooler)
   - [ ] Multi-level referral (hoa hồng cấp 2)
   - [ ] Push notification khi thăng hạng
   - [ ] Referral Analytics nâng cao

📁 FILES QUAN TRỌNG:
   - .brain/brain.json (Full project knowledge)
   - .brain/session.json (Current progress)
   - plans/260407-1341-referral-system/ (All 6 phase specs)
   - app/prisma/seed.ts (Demo data with referral)
   - app/app/api/intents/route.ts (Boost sorting logic)
   - app/lib/referral-service.ts (Core referral business logic)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Đã lưu! Để tiếp tục: Gõ /recap
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
