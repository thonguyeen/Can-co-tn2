# Phase 04: Realtime & Storage Replacement
Status: ⬜ Pending
Dependencies: Phase 03

## Objective
Gỡ bỏ Supabase Websockets và Storage, chuyển sang Pusher/S3.

## Requirements
### Functional
- [ ] Tích hợp Pusher channel cho bảng Hybrid Feed, bắn sự kiện khi có Intent hoặc Comment mới.
- [ ] Tạo endpoint API độc lập cho việc Upload hình đại diện/bot sang S3/Vercel Blob thay cho `supabase.storage`.

## Implementation Steps
...
---
Next Phase: `phase-05-data-migration.md`
