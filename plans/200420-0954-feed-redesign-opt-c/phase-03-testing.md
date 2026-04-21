# Phase 03: Testing & Polish
Status: ✅ Done
Dependencies: Phase 02 ✅

## Objective
Kiểm tra toàn bộ luồng hoạt động của feed mới trong trình duyệt (manual + browser test).

## Test Matrix

| ID | Scenario | Kết quả mong đợi |
|----|----------|-----------------|
| T1 | Load trang chủ (guest) | Feed hiển thị đúng Option C layout |
| T2 | Click ảnh hero | Lightbox mở full-screen |
| T3 | Guest click Quan tâm | AuthGateModal hiện |
| T4 | Guest click Đàm phán | AuthGateModal hiện |
| T5 | Guest click Lưu | AuthGateModal hiện |
| T6 | User đã đăng nhập click Quan tâm | Toggle hoạt động |
| T7 | Scroll xuống cuối feed | Infinite scroll load thêm |
| T8 | Mobile (375px) | Card single-col vẫn đẹp |
| T9 | Desktop xl (1280px) | FeedObserverPanel hiện bên phải |
| T10 | Bài không có ảnh (CẦN MUA) | Hero image ẩn, layout vẫn đẹp |

## Polish Checklist

- [x] Hover effect mượt trên card
- [x] Loading skeleton đẹp khi chưa có data
- [x] Empty state khi feed trống

---
✅ Hoàn tất Phase 03 → Feature DONE
