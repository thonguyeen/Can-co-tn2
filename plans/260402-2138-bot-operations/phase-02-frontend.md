# Phase 02: Frontend UI — Bảng Điều Khiển Bot trên Admin
Status: ⬜ Pending
Dependencies: Phase 01

## Objective
Tạo giao diện điều khiển trên trang Admin gồm:
- Nút Start/Stop Orchestrator (Bật/Tắt toàn bộ đội Bot)
- Trạng thái từng Bot (Online/Offline)
- Log hoạt động gần nhất (Bot A vừa đăng bài lúc 21:30...)

## Implementation Steps
1. [ ] Tạo component `BotOperationsTab.tsx` theo phong cách Dark SaaS
2. [ ] Thiết kế phần "Control Center" (Nút Start/Stop to, xanh/đỏ)
3. [ ] Hiển thị KPI nhanh: Tổng Bot, Đang hoạt động, Bài đã đăng hôm nay
4. [ ] Phần "Activity Log" - danh sách hoạt động gần nhất theo thời gian thực
5. [ ] Gắn tab mới "⚙️ Vận Hành" vào trang Admin (`admin/page.tsx`)
6. [ ] Polling mỗi 5 giây lấy trạng thái mới nhất từ API

## Files to Create/Modify
- `app/admin/components/BotOperationsTab.tsx` — [NEW] Bảng điều khiển Bot
- `app/admin/page.tsx` — [MODIFY] Thêm tab "Vận Hành"

## Test Criteria
- [ ] Bấm nút Start → Nút đổi màu xanh, hiện "🟢 Đang chạy"
- [ ] Bấm nút Stop → Nút đổi màu đỏ, hiện "⚪ Đã dừng"
- [ ] Activity Log cập nhật khi có hoạt động mới

---
Next Phase: phase-03-testing.md
