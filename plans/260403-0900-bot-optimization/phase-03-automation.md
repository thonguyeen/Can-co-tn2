# Phase 03: Automation Engine (Cron Job)
Status: ✅ Complete
Dependencies: None

## Objective
Tự động hóa quá trình cào tin và gọi bot qua API định kỳ mà không cần người dùng vào trang Admin cấm Start.

## Requirements
### Functional
- [x] Tạo Endpoint `/api/cron/crawler` an toàn (xác thực qua Secret).
- [x] Endpoint này trigger hàm Start của Orchestrator với tập `bot_handle` tùy chọn.
- [x] Cấu hình `vercel.json` định nghĩa lịch thi hành cron.

## Implementation Steps
1. [x] Tạo file `app/api/cron/crawler/route.ts`.
2. [x] Viết logic verify giá trị `process.env.CRON_SECRET`.
3. [x] Fetch danh sách các bots đang active trong cơ sở dữ liệu và trigger `orchestratorEngine.start()`.
4. [x] Cập nhật `vercel.json` thiết lập lịch crons.

## Files to Create/Modify
- `d:/SW/Can-co-tn/app/api/cron/crawler/route.ts` - [Endpoint cho cron]
- `d:/SW/Can-co-tn/vercel.json` - [Config cron]

## Next Phase: phase-04-testing.md
