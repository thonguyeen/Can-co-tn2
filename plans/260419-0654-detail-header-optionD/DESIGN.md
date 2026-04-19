# 🎨 DESIGN: Intent Detail Sticky Header (Option D: Overlap)
Ngày tạo: 2026-04-19
Dựa trên: `plans/260419-0654-detail-header-optionD/plan.md`

---

## 1. Bản Đồ UI (Component Structure)

```
app/app/(main)/can-co/intent/[id]/page.tsx
└── <div className="min-h-screen bg-slate-50"> // Full Page
    ├── <div className="relative"> // Hero Section (Ảnh + Floating Buttons)
    │   ├── <ImageGrid /> hoặc <GradientPlaceholder />
    │   ├── Nút Back 
    │   │   └─ absolute top-4 left-4, z-50, backdrop-blur
    │   └── Nút Trust Badge
    │       └─ absolute top-4 right-4, z-50, backdrop-blur
    │
    └── <div className="relative z-10 -mt-6"> // Content Card
        └── <div className="bg-white rounded-t-3xl pt-6 px-4 shadow-[0_-8px_20px_rgba(0,0,0,0.08)]">
            ├── <IntentCard compact={false} /> (Nội dung chi tiết)
            └── Các phần khác (VerifySection, MatchCard, etc.)
```

## 2. Checklist Kiểm Tra & Edge Cases

### Tính năng: Floating Header & Content Overlap

- [ ] **Màn hình có ảnh (CÓ):** 
  - Ảnh hiển thị đầy đủ phía sau.
  - Buttons (Back, Trust) hiển thị đè (floating) lên trên ảnh, bo tròn đẹp, có shadow và backdrop-blur để dễ đọc trên hình nền.
  - Box nội dung màu trắng bo tròn đè lên nhô lên phần dưới ảnh khoảng 24px (`-mt-6`).
- [ ] **Màn hình KHÔNG có ảnh (CẦN - fallback):**
  - Vẫn có padding-top tạo khoảng trống (phía sau có placeholder màu xám/xanh nhẹ) để nút Back và badge Trust không bị dính sát lề trên quá mức.
  - Content card vẫn đè lên một chút tạo layer mượt mà.
- [ ] **Mobile Experience:**
  - Nút Back đủ to để chạm (min w-10 h-10).
  - Không bị thanh điều hướng Top/Bottom che mất nội dung quan trọng.

## 3. Test Cases (Tự Kiểm Tra Bằng Mắt)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**TC-01: Intent CÓ (Có hình ảnh)**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Mở chi tiết 1 tin CÓ (VD: Bán nhà Phòng 40m2...)
2. **Kỳ vọng:** Ảnh hiện to, có nút Back và Badge nổi bên trên. Thẻ nội dung đè chồm lên mép dưới ảnh tạo hiệu ứng 3D layer. Vuốt xuống, form trắng trượt lên dễ chịu.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**TC-02: Intent CẦN (Không có hình ảnh)**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Mở chi tiết 1 tin CẦN (VD: Cần thuê nhà...)
2. **Kỳ vọng:** Phần Hero space chuyển thành placeholder/blank space, nút Back và Badge vẫn đứng vững ở vị trí top, giao diện không bị co rúm, layout thẻ chồng lên nhau mượt.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**TC-03: Click nút Back**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Click nút Back trên Hero Image.
2. **Kỳ vọng:** Chuyển về màn hình `/can-co` ngay lập tức, UI không có lỗi.
