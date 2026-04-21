# Phase 03: Testing
Status: ✅ Complete
Dependencies: Phase 02 ✅

## Objective
Kiểm tra toàn bộ luồng hoạt động của bộ lọc mới trong trình duyệt.

## Test Matrix

| ID | Scenario | Kết quả mong đợi |
|----|----------|-----------------|
| T1 | Load trang chủ (guest) | Chip bar hiện, "Tất cả" active |
| T2 | Bấm chip "TP.HCM" | Feed chỉ hiện tin ở HCM |
| T3 | Bấm chip "Tất cả" | Feed hiện toàn bộ tin |
| T4 | Bấm nút "Bộ lọc" | Drawer trượt ra từ phải |
| T5 | Trong Drawer: chọn "CẦN Tìm" | Feed chỉ hiện tin CẦN |
| T6 | Trong Drawer: chọn Quận | Feed lọc đúng quận |
| T7 | Bấm "Xóa bộ lọc" trong Drawer | Tất cả filter reset |
| T8 | Mobile (375px) | Chip bar cuộn ngang, Drawer dạng bottom sheet |
| T9 | Desktop (1280px) | Layout rộng hơn (do không còn sidebar trái) |
| T10 | Bài viết | Nội dung y hệt, không bị ảnh hưởng |

---
✅ Hoàn tất Phase 03 → Feature DONE
