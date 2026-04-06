# Phase 06: Testing & Polish
Status: ✅ Complete
Dependencies: Phase 04, Phase 05

## Objective
Kiểm tra end-to-end toàn bộ luồng, sửa các bug phụ.

## Test Scenarios
8. [x] Admin → Tab "Nguồn Cào" → Thêm URL RSS → Lưu
9. [x] Admin → Tab "Nhân Sự" → Gán Bot vào Quận 1, quota 10 → Lưu
10. [x] Bấm "Cào Ngay" → Bot cào → AI parse → Insert intents
11. [x] Trang chủ → Tin Bot hiện trong Feed với badge "🤖"
12. [x] Quota đạt → Bot tự dừng
13. [x] Dropdown 3 cấp hiện đúng data từ carCRM Excel
14. [x] Fix lỗi Hydration Error trang /admin
15. [x] Dedup: Cào URL 2 lần → Chỉ tạo 1 intent

## Files to Create/Modify
- `scripts/quick-test-bot-envoy.js` — [NEW] Test script (Đã tạo)

---
End of Plan.
