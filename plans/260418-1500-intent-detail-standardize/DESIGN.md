# DESIGN: Chuẩn hóa `/intent/[id]` theo Design System mới
Created: 2026-04-18T15:23
File mục tiêu: `app/app/intent/[id]/page.tsx`

---

## 1. Phân tích hiện trạng vs mục tiêu

| Thành phần | Hiện tại ❌ | Mục tiêu ✅ |
|------------|------------|------------|
| Background | Tối (`wm-panel`) | `bg-slate-50 → white` gradient |
| Cards | `wm-panel` (tối) | `bg-white rounded-3xl shadow-sm` |
| Back button | Text link đơn giản | Sticky top bar (back + title + trust badge) |
| CTA Desktop | `wm-panel` border | Indigo gradient button |
| CTA Mobile | `bg-[var(--wm-primary)]` | Cùng indigo gradient |
| Bình luận | HIỂN THỊ | ẨN (COMMENTS_DISABLED) |
| Loading | Text string | Spinner + indigo |
| Not Found | `wm-panel` tối | White `rounded-3xl` card |

---

## 2. Layout mới

```
┌──────────────────────────────────────────────────────────┐
│  Sticky Bar: [←] Tiêu đề tin              [ShieldCheck] │  h-16, backdrop-blur
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │  IntentCard (compact=false)                       │  │  bg-white rounded-3xl
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  [🟣 Nhắn tin trực tiếp với người đăng]               │  indigo gradient, chỉ hiện khi không phải owner
│                                                          │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                  │
│  │ 📍 Khu  │  │ 🏠 Loại │  │ $ Match │                  │  Quick Stats 3 cols
│  └─────────┘  └─────────┘  └─────────┘                  │
│                                                          │
│  [Pencil] Edit form (chỉ owner) ← giữ nguyên logic      │
│                                                          │
│  /* COMMENTS_DISABLED */                                 │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 3. Component Diffs

### 3.1 Loading State
```jsx
// BEFORE
<span className="text-[var(--wm-text-muted)]">Đang tải...</span>

// AFTER  
<div className="min-h-screen flex items-center justify-center bg-slate-50">
  <Loader2 className="w-7 h-7 animate-spin text-indigo-500" />
  <p className="text-slate-400 text-sm">Đang tải chi tiết...</p>
</div>
```

### 3.2 Not Found State
```jsx
// BEFORE: wm-panel tối

// AFTER: white card rounded-3xl + back button indigo
```

### 3.3 Back Button → Sticky Header Bar
```jsx
<div className="sticky top-16 z-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex items-center gap-3">
  <button onClick={router.back}> ← </button>
  <p className="text-sm font-semibold truncate">{intent.title}</p>
  <ShieldCheck trust badge />
</div>
// top-16 vì TopNavbar cao h-16
```

### 3.4 Wrapper
```
// BEFORE: pb-20 md:pb-4 space-y-3 max-w-2xl mx-auto mt-4 px-2
// AFTER:  min-h-screen bg-gradient-to-b from-slate-50 to-white pb-24 md:pb-8
```

### 3.5 Edit Section (giữ nguyên logic, chỉ bọc vào white card)
```jsx
<div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden p-4">
  <ComposeIntent mode="real" editIntent={intent} ... />
</div>
```

### 3.6 CTA Nhắn trực tiếp (THỐNG NHẤT desktop + mobile)
```jsx
// XÓA 2 button riêng biệt
// THAY bằng 1 button duy nhất, hiển thị cả 2 mode
<button className="w-full ... indigo gradient ...">
  <MessageSquare /> Nhắn tin trực tiếp với người đăng
</button>
```

---

## 4. Giữ nguyên

- Logic `fetchIntent()` dùng `/api/intents?id=${id}`
- Logic `isOwner` + `isEditing` + `ComposeIntent`
- `PredictionCard` (nếu có data)
- `BottomNav`

---

## 5. Acceptance Criteria

- [ ] TC-01: Background trắng, không còn màu tối
- [ ] TC-02: Sticky bar hiện tiêu đề + trust badge (top-16 = ngay dưới TopNavbar)
- [ ] TC-03: IntentCard nằm trong white card `rounded-3xl`
- [ ] TC-04: Indigo CTA button hiển thị đúng (ẩn nếu là owner)
- [ ] TC-05: Quick Stats 3 cột hiển thị
- [ ] TC-06: Bình luận bị ẩn hoàn toàn
- [ ] TC-07: Edit mode (owner) vẫn hoạt động bình thường

---

*Sẵn sàng cho /code*
