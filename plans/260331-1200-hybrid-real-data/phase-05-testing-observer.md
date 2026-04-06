# Phase 05: Testing Observer Sidebar
Status: ⬜ Pending
Dependencies: Phase 04

## Objective
Hoàn thiện và kiểm thử Observer Sidebar (cột theo dõi AI bên lề phải) hoạt động hoàn toàn theo thời gian thực dựa trên Database thực tế (Supabase), thay thế cho dữ liệu AI giả lập MOCK trước đây.

## Requirements
### Functional
- [ ] Lắng nghe các thay đổi và comment mới nhất từ Bot trong bảng `intent_comments` (thông qua Realtime Subscription hoặc API Polling ngầm).
- [ ] Hiển thị luồng log hoạt động của các AI Agent (Trust Checker, Match Advisor, v.v...) dạng live stream.
- [ ] Loại bỏ/Cách ly dữ liệu Mock cứng ra khỏi component Observer hiện tại.

### Non-Functional
- [ ] Performance: Sidebar tự động update mà không gây re-render liên tục cho toàn bộ Feed chính.
- [ ] UI/UX: Cập nhật có hiệu ứng transition trơn tru (Auto-scroll nhẹ hoặc Highlight).
- [ ] Scalability: Chuẩn bị cho việc filter log theo từng loại Bot nếu cần.

## Implementation Steps
1. [ ] **Khảo sát Component hiện có**: Tìm hoặc tạo mới `ObserverSidebar`/`ObserverPanel` bên lề phải.
2. [ ] **Viết DB Listener**: Tích hợp hook Supabase (vd: `supabase.channel('observer_comments').on('postgres_changes', ...)`) để chỉ bắt các event insert vào `intent_comments` có `is_bot = true`.
3. [ ] **Cập nhật Layout**: Nhúng component Observer này vào chế độ xem `hybrid` (hoặc `hybrid-v2`).
4. [ ] **Clean-up**: Xóa bỏ các dòng code phụ thuộc vào log tĩnh của file `mock/intents.ts`.

## Files to Create/Modify
- `components/layout/ObserverSidebar.tsx` (Tạo mới hoặc sửa component tương đương).
- `app/hybrid/layout.tsx` (hoặc `page.tsx`) (Sửa) - Để render Observer Sidebar.
- `app/hybrid-v2/page.tsx` (Sửa nếu cần đồng bộ view).

## Test Criteria
- [ ] Thử tạo post mới bằng tài khoản User thường => Đợi delay AI phân tích.
- [ ] Màn hình tự động nhảy log trên Sidebar của Match Advisor/Trust Checker đang comment.
- [ ] Không bị crash khi có 2 AI comment cùng lúc vào cùng 1 bài.

## Notes
Phase cuối này đảm bảo tính năng "Theo dõi sự sống của hệ sinh thái" qua mắt nhìn Observer hoạt động 100% bằng real data.

---
Next Phase: N/A - Hoàn thành Plan.
