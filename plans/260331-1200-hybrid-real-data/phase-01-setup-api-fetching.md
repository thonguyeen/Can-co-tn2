# Phase 01: Setup API Fetching (Tải tin thật)
Status: ⬜ Pending
Dependencies: None

## Objective
Thay thế mảng dữ liệu cứng `MOCK_INTENTS` bằng dữ liệu thực được lấy liên tục từ endpoint `/api/intents` tại 2 giao diện (V1 và V2).

## Requirements
### Functional
- [ ] Xóa/Bình luận luồng khởi tạo `MOCK_INTENTS` trong `hybrid-v2/page.tsx` và `hybrid/page.tsx`.
- [ ] Import type `Intent` từ schema thực tế (hiện đang được dùng bên `/demo` hoặc component khác).
- [ ] Thêm `useEffect` để gọi `fetch('/api/intents')` ngay khi load trang.
- [ ] Phân loại dữ liệu thành Tin Vip (Carousel) và Tin Thường (List) như logic Fake cũ, ưu tiên dự trên `trust_score` thực của dữ liệu.

### Non-Functional
- [ ] Code sạch, không re-render lại nguyên cái list nhiều lần khi lướt Carousel (Tách biệt state tốt nếu có thể).
- [ ] Bắt lỗi try-catch đầy đủ để UI không trắng bóc khi API ngỏm.

## Implementation Steps
1. [ ] Cập nhật Type Declaration từ MockIntent sang Real Intent.
2. [ ] Viết hàm `fetchIntents` sử dụng Next.js SWR hoặc `useEffect` cơ bản.
3. [ ] Áp dụng vào 2 trang `hybrid/page.tsx`, `hybrid-v2/page.tsx`.
4. [ ] Thay đổi cách thức lấy data của component `ComposeIntent` để map với chuẩn Data model trả về.

## Files to Modify
- `app/app/hybrid/page.tsx`
- `app/app/hybrid-v2/page.tsx`

## Test Criteria
- [ ] Refresh trang, Network Tab báo đã Request tới `/api/intents`.
- [ ] Giao diện có ít nhất 1 tin trả về từ Database thật hiện lên List.

---
Next Phase: Phase 02
