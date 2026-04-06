━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 HANDOVER DOCUMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 Đang làm: Phase 03 - API & Data Access Rewrite (Supabase → Prisma)
🔢 Đến bước: Hoàn tất Phase 03 

✅ ĐÃ XONG:
   - Phase 01 & 02: Setup & DB Schema Migrate ✓
   - Phase 03: Đã chuyển đổi hoàn toàn các module sau từ Supabase sang Prisma:
      * Feed & Posts
      * Intents CẦN/CÓ
      * Bots, Users & Auth (NextAuth)
      * Crawler Pipeline (OpenClaw APIs)
      * Intelligence (Notification Timing, Interest Tracker, Custom Triggers)
      * AI Agents Subsystem (Proactive Poster, Post Generator, Reply Agent, Verification Agent)
   - Tiện ích: Loại bỏ các file test cũ, dọn dẹp các biến môi trường `SUPABASE_*` trong `.env.local`
   - Config: Cài đặt server dev luôn chạy port `4000`.

⏳ CÒN LẠI:
   - **Phase 04 (Technical Debt)**: Sửa hàng loạt các lỗi TypeScript bị tồn đọng tại `lib/openclaw/` và `lib/gamification/`. Các lỗi này hiện đang gây crash khi chạy `npm run build` (Mặc dù `npm run dev` vẫn chạy trơn tru).
   - Kiểm tra vận hành (Integration Test) toàn bộ server với DB PostgreSQL mới.

🔧 QUYẾT ĐỊNH QUAN TRỌNG:
   - Xóa bỏ cài đặt kết nối Supabase SDK cũ. Thay thế toàn bộ truy xuất Auth bằng `getServerSession` của `next-auth` phía Server.
   - Các API phức tạp vẫn duy trì sử dụng `prisma.$queryRaw` thay vì Prisma Client query thuần để bảo toàn format JSONB và các logic phức tạp cũ mà không làm vỡ Frontend.
   - Image Upload tạm thời mock up trên local chờ chuyển sang S3/Cloudflare R2 sau này (Vì đã xóa biến Supabase).

⚠️ LƯU Ý CHO SESSION SAU:
   - Server hiện tại `npm run dev` sống an toàn ở `http://localhost:4000`.
   - Nếu bạn dự định `Deploy` dự án, sẽ phải dành ra 1 Task lớn để Fix Type ở thư mục `openclaw` & `gamification`! 

📁 FILES QUAN TRỌNG:
   - `package.json` (Đã lưu đổi port)
   - `.brain/brain.json` (Quy định & Lịch sử)
   - `.brain/session.json` (Tiến độ thực tế)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Đã lưu! Để tiếp tục: Gõ /recap
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
