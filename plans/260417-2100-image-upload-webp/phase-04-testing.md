# Phase 04: Testing & Polish
Status: ⬜ Pending
Dependencies: Phase 03

## Objective
Test end-to-end flow: chọn ảnh → convert WebP → preview → submit → API save → hiển thị trong IntentCard.

## Test Scenarios

### Happy Path
- [ ] User CÓ: chọn 3 ảnh JPEG → convert thành WebP → submit → ảnh hiện trong feed
- [ ] User CẦN: không hiện khu vực upload ảnh

### Edge Cases
- [ ] Chọn file không phải ảnh → bỏ qua, không crash
- [ ] Ảnh rất lớn (10MB+) → reject trước khi convert
- [ ] Ảnh rất nhỏ (< 50KB) → giữ nguyên, không convert
- [ ] Convert thất bại → fallback giữ file gốc

### Performance
- [ ] Convert 5 ảnh < 3 giây
- [ ] Không block UI khi converting

### Visual Verification
- [ ] Preview hiện đúng sau convert
- [ ] % tiết kiệm hiện chính xác
- [ ] Xóa ảnh hoạt động đúng
- [ ] Responsive trên mobile

## Verification Method
- Browser testing trực tiếp tại http://127.0.0.1:4000/

---
