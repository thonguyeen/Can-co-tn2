# 📋 HANDOVER DOCUMENT

📍 **Đang làm:** Bot Operations Control Panel & AI Chatbot Integration
🔢 **Đến bước:** Phase 03 - Tích hợp & Test (✅ Đã Xong 100%)

---

## ✅ ĐÃ XONG (Session 02-04-2026)
1. **AI Chatbot:**
   - Đã tạo `/api/chat` hỗ trợ AI thực tế.
   - Cơ chế Fallback: Thử `9Router` (nhanh), nếu 403 chuyển `SimpleVerse` (ổn định).
2. **Bot Operations (Vận hành):**
   - Tab "Vận Hành" trong Admin UI.
   - Nút START/STOP, mode TEST/LIVE.
   - Log hoạt động realtime (cập nhật 5s/lần).
3. **Orchestrator Engine:**
   - Hỗ trợ `dryRun` (không lưu DB).
   - Tự động chạy (Auto-start) khi instance khởi tạo.

---

## ⏳ CÒN LẠI (Future Tasks)
1. **AI Tuning:** Tiếp tục cải thiện tỷ lệ parse JSON thành công (hiện 60% cho tin tức tổng hợp).
2. **UI Polish:** Thêm filter theo bot_handle vào Activity Log.
3. **Auto-Crawl Cron:** Thiết lập lịch chạy tự động cho cào tin (hiện đang chạy bằng cơm qua Admin/Scripts).

---

## 🔧 QUYẾT ĐỊNH QUAN TRỌNG
1. **Dùng dryRun mode làm mặc định:** Để tránh làm rác DB khi dev, Admin phải chủ động bật LIVE.
2. **Auto-start Orchestrator:** Giúp Bot luôn sẵn sàng reply/post bài mà không cần kích hoạt thủ công mỗi lần server restart.
3. **API Orchestrator:** Thống nhất các action `status`, `activities`, `set_mode`, `start`, `stop`.

---

## ⚠️ LƯU Ý CHO SESSION SAU
- **File quan trọng:** `lib/openclaw/orchestrator.ts` (Lõi chính).
- **Environment:** Kiểm tra `.env.local` đã có đủ `AI_PRIMARY_*` và `AI_FALLBACK_*`.
- **Bot Activity:** Bot sẽ tự chạy ở chế độ TEST nếu không có can thiệp từ Admin.

---

## 📁 FILES QUAN TRỌNG
- `.brain/brain.json` (Static knowledge)
- `.brain/session.json` (Progress)
- `app/admin/components/BotOperationsTab.tsx` (New UI)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Đã lưu! Để tiếp tục: Gõ /recap
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
