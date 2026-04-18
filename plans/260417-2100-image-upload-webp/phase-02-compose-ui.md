# Phase 02: ComposeIntent UI Upgrade
Status: ⬜ Pending
Dependencies: Phase 01

## Objective
Cập nhật ComposeIntent.tsx để tích hợp WebP conversion, giảm limit từ 10 → 5, và hiển thị kích thước file + % tiết kiệm.

## Implementation Steps

### 1. Tích hợp convertToWebP
- [ ] Import `convertToWebP` từ `lib/image-utils.ts`
- [ ] Trong `handleImageSelect`: convert mỗi file → WebP blob trước khi thêm vào state
- [ ] Thêm loading state "Đang nén ảnh..." trong lúc convert
- [ ] Lưu cả `originalSize` và `convertedSize` để hiển thị

### 2. Giảm limit ảnh: 10 → 5
- [ ] Đổi `selectedImages.length < 10` → `< 5`  
- [ ] Đổi `.slice(0, 10 - ...)` → `.slice(0, 5 - ...)`
- [ ] Cập nhật text "(x/5)" thay vì "(x/10)"

### 3. Hiển thị kích thước & % tiết kiệm
- [ ] Mỗi preview thumbnail hiện badge: "−85%" (phần trăm đã nén)
- [ ] Tổng cộng (footer): "3 ảnh · 4.2 MB → 680 KB (−84%)"

### 4. UI Polish
- [ ] Nút thêm ảnh bo tròn `rounded-2xl` theo design system mới
- [ ] Preview grid 3 cột trên mobile, 5 cột trên desktop
- [ ] Hover effect: overlay "✕" để xóa

## Files to Modify
- `components/intent/ComposeIntent.tsx` — main changes

## Test Criteria
- [ ] Chọn 6 ảnh → chỉ nhận 5, thông báo đã đủ
- [ ] Hiện loading "Đang nén ảnh..." khi converting
- [ ] % tiết kiệm hiển thị chính xác
- [ ] Xóa ảnh → cập nhật lại counter

---
Next Phase: phase-03-backend.md
