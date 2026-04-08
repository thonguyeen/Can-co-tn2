━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 HANDOVER DOCUMENT — 2026-04-07T15:51
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 Đang làm: Referral System & User Management
🔢 Đến bước: Planning DONE. Chờ bắt đầu Phase 01 (DB Schema)

✅ ĐÃ XONG HÔM NAY:
   - Local Docker DB setup (plans/260407-1107-local-db-seed) ✓
   - Brainstorm Referral System ✓
   - Tạo plan đầy đủ 6 phases (65 tasks) ✓
   - BRIEF.md + plan.md + 6 phase files ✓

⏳ VIỆC KẾ TIẾP (theo thứ tự):
   Phase 01 — DB Schema
     → Sửa schema.prisma: thêm 4 models mới, sửa 3 models có sẵn
     → npx prisma db push
   Phase 02 — Backend Referral + Boost API (11 endpoints)
   Phase 03 — Backend Admin API (10 endpoints)
   Phase 04 — Frontend User UI (3 trang, 9 components)
   Phase 05 — Frontend Admin UI (3 trang, 8 components)
   Phase 06 — Integration & Testing

🔧 QUYẾT ĐỊNH QUAN TRỌNG:
   - MVP: 1-level referral only. Multi-level là Phase 2.
   - Fraud: Admin review thủ công. Không làm OTP phone ngay.
   - Tier names: Đồng → Bạc → Vàng → Bạch Kim → Kim Cương
   - Điểm giới thiệu: 20 pts/lượt. Boost bài: 50 pts/24h.
   - Đổi quà: Admin duyệt thủ công, từ chối thì hoàn điểm.

⚠️ LƯU Ý CHO SESSION SAU:
   - Gõ `/code phase-01` để bắt đầu sửa Prisma schema
   - File plan chính: plans/260407-1341-referral-system/plan.md
   - Phase files chi tiết trong cùng folder
   - Server đang chạy: http://localhost:4000 (npm run dev, port 4000)
   - DB đang dùng: LOCAL Docker (localhost:5432, cancotn_local)

📁 FILES QUAN TRỌNG:
   - plans/260407-1341-referral-system/   (toàn bộ plan)
   - app/prisma/schema.prisma             (cần sửa ở Phase 01)
   - .brain/brain.json                    (context tổng quan dự án)
   - .brain/session.json                  (trạng thái hiện tại)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Đã lưu! Để tiếp tục: Gõ /recap hoặc /code phase-01
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
