━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 HANDOVER DOCUMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 Đang làm: Bot System Hardening for Production
🔢 Đến bước: Phase 01 (Security & Stability)

✅ ĐÃ XONG:
   - Phase 00 (Seeding & Verification): 
     ✓ Tạo 5 Envoy Bots cho 5 khu vực (Q1, Q2, Q7, Cầu Giấy, Hải Châu).
     ✓ Ép cờ isEnvoy và vùng phụ trách vào database thành công.
     ✓ Kiểm tra bài đăng tự động của bot hiển thị đúng trên Home Feed (Intent) và Admin.
     ✓ Ổn định cấu hình AI Providers (OpenAI 9Router primary, Futrix fallback).
   - Lập kế hoạch 5 giai đoạn Hardening hệ thống.

⏳ CÒN LẠI:
   - Phase 01: Secure /admin and /api/orchestrator routes (Bảo mật route).
   - Phase 02: Cleanup dead code /api/dev endpoints (Dọn dẹp code rác).
   - Phase 03: Fix persistence layer logic (Missing fields in saveBot).
   - Phase 04: Production DB Migration (Docker setup trên VPS).
   - Phase 05: Build & Final Commit.

🔧 QUYẾT ĐỊNH QUAN TRỌNG:
   - Dùng OpenAI (CB1 Model) thay cho Claude vì độ ổn định cao hơn trong môi trường dev hiện tại.
   - Bỏ qua WebSocket Gateway cho các script test nội bộ để tránh lỗi kết nối không cần thiết.
   - Ưu tiên lưu bài viết Bot vào bảng `Intents` thay vì `Posts` để hiển thị trên luồng Rao vặt Cần/Có.

⚠️ LƯU Ý CHO SESSION SAU:
   - File `persistence.ts` cần được bổ sung logic `upsert` cho các trường `isEnvoy`, `assignedProvince`... để bot tạo mới sau này không bị lỗi hiển thị.
   - `/admin` hiện tại đang mở công khai, cần khôi phục lại middleware guards.
   - Mapbox token vẫn đang báo 401 Unauthorized, cần kiểm tra lại token trong .env.local.

📁 FILES QUAN TRỌNG:
   - app/.env.local (AI config & DB URL)
   - app/lib/openclaw/persistence.ts (Bug in saveBot)
   - plans/260410-1504-pre-deploy-hardening/ (Full hardening spec)
   - .brain/session.json (Detailed progress)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Đã lưu! Để tiếp tục: Gõ /recap
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
