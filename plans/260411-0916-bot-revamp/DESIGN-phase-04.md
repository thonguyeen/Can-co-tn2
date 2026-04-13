# 🎨 DESIGN: Bot Revamp - Phase 04: Orchestrator Refactor

Ngày tạo: 2026-04-11
Dựa trên: [phase-04-orchestrator.md](./phase-04-orchestrator.md)

---

## 1. Cơ Chế Hoạt Động (Architecture)

### 1.1 Khái Niệm Mới
- **Bỏ Fake Data:** Các bot "FACEBOT" sẽ không còn tự động nghĩ ra bài viết (post) nữa. 
- **Chỉ Tương Tác Thật:** Thay vào đó, bot sẽ hành động y như người dùng thật dựa trên dữ liệu **Intents** (tin đăng thật) mà hệ thống (Crawler + Curator) vừa lấy về.
- **Tuân Thủ Lịch Trình (Schedule):** Bot sẽ "đi ngủ" đúng giờ, chỉ hoạt động khi giờ giấc trùng với `scheduleConfig` được cấp cho nó.

### 1.2 Pipeline Mới
┌────────────────────────────────────────────────────────┐
│ 🕷️ Crawler (Lấy tin Raw) → 🧠 CuratorBot (Tạo Intent) │ 
└────────────────────────┬───────────────────────────────┘
                         │ (Dữ liệu THẬT)
                         ▼
┌────────────────────────────────────────────────────────┐
│ 🤖 Orchestrator (Người quản lý Bot)                   │
│ 1. startCrawlCurateLoop() (Mỗi 60p trigger Crawler)    │
│ 2. startCommentLoop() (Bot FACEBOT comment/nhận xét)   │
│ 3. scheduleCheck() (Bot nào ngủ thì bỏ qua)            │
└────────────────────────────────────────────────────────┘

---

### 1.3 Cập Nhật Từ Tech Lead Checkpoint (CONDITIONAL GO)
- **Xác minh Schema:** Trong Prisma schema đã CÓ SẴN model `IntentComment` (cách biệt với `Comment` của bảng `Post`). Do đó, luồng FACEBOT comment sẽ ghi trực tiếp vào `IntentComment` mà không cần migrate tạo bảng mới. An toàn 100%.
- **Chống Rate Limit (Throttling):** Để tránh "dội bom" API LLM (như OpenRouter bị 429) khi có cả rổ Intents đổ về cùng lúc, Orchestrator sẽ thêm cơ chế **Delay/Batching** (nghỉ nhịp 3-5s hoặc batch nhỏ) bên trong hàm `triggerCommentLoop()`.

---

## 2. Lưu Đồ Hệ Thống & Thay Đổi Giao Diện

### 2.1 Màn hình Admin Operations Tab (`BotOperationsTab.tsx`)
- Thay đổi nút *"Trigger Random Post"* ➔ bằng nút *"Trigger Crawl & Curate"*
- Thêm Nhãn Trạng Thái (Badge): 
  - Nếu `isBotAvailable()` trả về `false` ➔ Hiện `[🕐 Đang ngủ]`
  - Nếu `true` ➔ Hiện `[🟢 Đang hoạt động]`

### 2.2 Sơ đồ Schedule Check
1. Admin (hoặc Cron) gọi Bot làm việc.
2. Hàm `isBotAvailable(bot)` kiểm tra:
   - Bot có đang bật `isActive` = `true`? Nếu `false`, bỏ qua.
   - Bot có `scheduleConfig` không? Nếu không, hoạt động 24/7.
   - Xem `activeDays`: Hôm nay có nằm trong ngày được chạy không?
   - Xem `activeHours`: Giờ hiện hành có nằm trong khoảng `start` .. `end` không?
3. Nếu tất cả đúng → Bot làm việc. Nếu sai → Log "Bot đang ngủ".

---

## 3. Các Luồng Xử Lý (User Journey / Bot Journey)

### HÀNH TRÌNH: Orchestrator Tự Động Định Kỳ
1. Orchestrator thức dậy theo Loop (Interval).
2. Gọi Crawler quét dữ liệu → Gọi Curator xử lý tin chưa phân tích.
3. Kế tiếp, gọi Comment Loop:
   - Tìm danh sách `Intent` mới nhất chưa có bot nào bình luận.
   - Chọn ra 1 FACEBOT nào đang thức (trong giờ làm việc) và phù hợp chuyên môn.
   - FACEBOT gửi Prompts lên AI (Dựa trên nội dung Intent) ➔ Tạo `IntentComment`.
4. Trình duyệt UI cập nhật các comment này cho người dùng thấy.

---

## 4. Test Cases & Checklist (SDD Compliance)

### 🧪 TEST CASES

**TC-01: Orchestrator không còn gen fake post**
- **Given:** Bật Orchestrator.
- **When:** Chờ qua vòng lặp trigger (ví dụ 60s trên Dev).
- **Then:** Khẳng định Database KHÔNG xuất hiện bản ghi Post mới nào (mà trước đó là do Bot bịa ra). Khẳng định crawler logs kích hoạt bình thường.

**TC-02: Kiểm tra chức năng ngủ của Bot (ScheduleConfig)**
- **Given:** Gán cho Bot A `activeHours`: `{start: '01', end: '05'}` và bây giờ đang là 10h sáng.
- **When:** Hệ thống cố gắng trigger Bot A để comment.
- **Then:** Hệ thống log ra màn hình Admin/Server "Bot đang ngủ", và Bot A không tạo ra comment nào.

**TC-03: Bot Comment trên Intent Thật**
- **Given:** Có 1 Intent vừa được Curator duyệt + 1 Bot FACEBOT chuyên bđs đang "thức".
- **When:** Gây trigger comment loop.
- **Then:** Bot FACEBOT sẽ có 1 `IntentComment` mới chỉ đích danh vào ID của Intent đó.

### 📋 CHECKLIST CHO GIAI ĐOẠN CODE
- [ ] Xóa `startPostingLoop()`, `triggerRandomPost()`.
- [ ] Hàm `isBotAvailable` hoạt động đúng logic (Giờ bắt đầu/kết thúc).
- [ ] Chuyển các bình luận ảo sang bình luận trên *Intents* qua AI.
- [ ] Ghi comment vào model `IntentComment` có sẵn, trỏ đúng `intentId`.
- [ ] Thêm logic **Delay / Batching** vào `triggerCommentLoop` để chống Rate Limit LLM.
- [ ] Thay Node Logic comment ở Admin từ NewsReactor sang Intent comment.
- [ ] Giao diện Admin hiển thị status 🕐 của Bot chính xác.
