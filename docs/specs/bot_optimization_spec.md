# SPEC: Bot Envoy Optimization & Automation

## 1. Executive Summary
Sau Phase Tích hợp Bot, hệ thống cần ổn định và giảm thiểu can thiệp tay. Dự án tối ưu hóa tập trung vào:
- **UI:** Filter logs của từng bot vì số lượng request sẽ rất đông.
- **AI:** Cơ chế Auto-Healing JSON khi AI LLM hallucinates (bị hỏng cú pháp).
- **Auto:** Chạy nền không cần treo máy bật trình duyệt.

## 2. API Contract Thêm Mới
### `GET /api/orchestrator?bot_handle=HANOI_BOT&status=success`
Mở rộng API GET activities để nhận Query Parameters phục vụ filter.

### `GET /api/cron/crawler`
Headers: `Authorization: Bearer <CRON_SECRET>`
Hành động: Đánh thức các Bots, chạy chu kỳ.

## 3. Database Design
Không thay đổi Schema. Data models hiện tại (Bot, Crawl Source, Intent) được tái sử dụng 100%.

## 4. UI Components
- Thêm `<FilterBar>` trong component `<BotOperationsTab>`, chứa:
  - `<select>` theo `bot_handle`
  - `<select>` theo `status`
  
## 5. Third-party Integrations
- Vercel Cron.
- Các LLM providers hiện có (9Router/Simpleverse) hỗ trợ Retry loops.
