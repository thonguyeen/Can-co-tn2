# 🎨 DESIGN: 3 Prototype Routes — Intent Detail Page

Ngày tạo: 2026-04-19
Dựa trên: `plans/260419-1250-detail-page-prototypes/plan.md`

---

## 1. Shared Hook: `useIntentDetail(id)`

Extract từ `app/intent/[id]/page.tsx` hiện tại. Tất cả 3 prototypes dùng chung.

```ts
// hooks/useIntentDetail.ts
export function useIntentDetail(id: string) {
  // State: intent, loading, isEditing, currentUserId
  // Logic: fetchIntent(), isOwner, handleEditComplete
  return { intent, loading, isOwner, isEditing, setIsEditing, handleEditComplete }
}
```

**Layout mà mỗi prototype sẽ tự làm:**
- Hero image / gallery
- Bố cục cột
- CTA buttons vị trí

---

## 2. Layout Specs Chi Tiết

### V1 — Zillow Split (`/v1-split`)

```
┌─────────────────────────────────────────────────────────────┐
│ [sticky left 50vw]          │  [right 50vw, overflow-y-auto] │
│                              │                               │
│  Ảnh Hero (cover)            │  Badges + Share Icons         │
│  (sticky h-screen)           │  ───────────────────────      │
│                              │  Title (xl font)              │
│  Mini Map (bottom, absolute) │  Giá (3xl font, indigo)       │
│                              │  ───────────────────────      │
│                              │  IntentCard (nội dung)        │
│                              │  Grid Thông Số                │
│                              │  Mô tả chi tiết               │
│                              │  ───────────────────────      │
│                              │  [Sticky bottom CTA]          │
│                              │  [Gọi điện] [Chat]            │
└─────────────────────────────────────────────────────────────┘
```

**CSS Tokens:**
- Left: `w-1/2 sticky top-0 h-screen overflow-hidden` (Desktop lg+)
- Right: `w-1/2 overflow-y-auto px-12 py-10`
- Mobile fallback: left ảnh bình thường (h-[280px]), right full-width bên dưới
- Map mini: `absolute bottom-6 left-6 w-48 h-32 rounded-xl`

---

### V2 — Bento Grid (`/v2-bento`)

```
┌─────────────────────── Full width ─────────────────────────┐
│              Hero Gallery (h-[400px] 100vw)                │
└──────────────────────────────────────────────────────────  ┘
  ← max-w-[1300px] mx-auto (tràn 2 bên, -mt-24 overlap) →
┌─────────────────────────────────────────────────────────────┐
│  [3/12 Left]     │  [6/12 Center]       │  [3/12 Right]    │
│                  │                      │                   │
│  User Profile    │  Title + Price       │  AI Insight Card  │
│  Bento Card      │  Grid Thông số       │  (bg-indigo-600)  │
│  ──────────      │  Mô tả               │  ──────────────   │
│  Mini Map        │  Tài liệu            │  Action Card      │
│  Bento Card      │                      │  [Khớp Nhanh]     │
│                  │                      │  [Chat]           │
└─────────────────────────────────────────────────────────────┘
```

**CSS Tokens:**
- Hero: `w-full h-[400px] object-cover` — không giới hạn max-w
- Grid: `grid grid-cols-12 gap-5 max-w-[1300px] mx-auto px-6 -mt-24 relative z-10`
- Left col: `col-span-3`
- Center: `col-span-6`
- Right: `col-span-3`
- Bento cards: `bg-white rounded-3xl shadow-sm border border-slate-100 p-6`
- AI card: `bg-indigo-600 text-white rounded-3xl`
- Mobile: stack single column, hero h-[260px]

---

### V3 — Command Center (`/v3-command`)

```
┌─────────────────────────────────────────────────────────────┐
│  [Left ~260px sticky] │  [Center flex-1]   │ [Right ~320px] │
│                       │                    │                 │
│  ← Mục lục →          │  Hero Gallery      │  Giá (3xl)      │
│  • Tổng quan          │  ─────────────     │  Trust Badge    │
│  • Mô tả              │  (Hero+Overlap     │  ─────────────  │
│  • Bản đồ             │   như hiện tại)    │  [Gọi điện] CTA │
│  • Tài liệu           │                    │  [Chat] CTA     │
│                       │  IntentCard        │  ─────────────  │
│  ← Tin tương tự →     │  Grid Thông Số     │  Match Count    │
│  [Mini Card 1]        │  Mô tả             │  (12 khớp)      │
│  [Mini Card 2]        │  Map               │                 │
└─────────────────────────────────────────────────────────────┘
```

**CSS Tokens:**
- Left: `w-[260px] shrink-0 border-r border-slate-200 sticky top-0 h-screen overflow-y-auto p-6`
- Center: `flex-1 overflow-y-auto` (hero overlap giống hiện tại: `-mt-6 rounded-t-3xl`)
- Right: `w-[320px] shrink-0 border-l border-slate-200 p-6` — Action sticky card `sticky top-6`
- TOC highlight active section khi cuộn (optional)
- Mobile: hidden left+right, center full width

---

## 3. Component Hierarchy

```
/v1-split/page.tsx
├── useIntentDetail(id)         ← shared hook
├── <SplitHero />               ← sticky image left
└── <SplitContent />            ← right scrollable

/v2-bento/page.tsx
├── useIntentDetail(id)
├── <BentoHero />               ← full-bleed hero
└── <BentoGrid>
│     ├── <BentoProfile />      ← left col
│     ├── <BentoMain />         ← center col
│     └── <BentoActions />      ← right col

/v3-command/page.tsx
├── useIntentDetail(id)
├── <CommandLeft />             ← TOC + related
├── <CommandCenter />           ← hero + content
└── <CommandRight />            ← sticky action panel
```

---

## 4. Shared Reusable Pieces (Dùng lại từ codebase hiện tại)

| Component | Dùng trong | Ghi chú |
|-----------|-----------|---------|
| `<IntentCard />` | V1, V2, V3 | Nội dung chính không đổi |
| `<ComposeIntent />` | V1, V2, V3 | Edit form khi `isEditing` |
| `<PredictionCard />` | V1, V2, V3 | Nếu có prediction |
| `<BottomNav />` | Mobile only | Giữ nguyên |
| `useIntentDetail()` | V1+V2+V3 | NEW shared hook |

---

## 5. Checklist Kiểm Tra

### Chung (cả 3 layout)
- [ ] Data load đúng từ API `/api/intents?id=`
- [ ] Owner thấy nút Sửa bài
- [ ] Non-owner thấy nút Chat
- [ ] Loading state hiện spinner
- [ ] Not-found state hiện empty UI
- [ ] Mobile: collapse về 1-col đẹp

### V1 Split Specific
- [ ] Left panel sticky (không cuộn khi scroll phải)
- [ ] Mini map hiển thị ở góc dưới ảnh
- [ ] CTA buttons cố định ở bottom-right panel

### V2 Bento Specific
- [ ] Hero tràn hết chiều rộng màn hình (không bị limited)
- [ ] Grid bento -mt-24 overlap lên ảnh
- [ ] AI card màu indigo nổi bật phải

### V3 Command Specific
- [ ] TOC highlight section đang xem
- [ ] Action panel phải sticky khi cuộn
- [ ] "Tin tương tự" hiện ở sidebar trái

---

*Tạo bởi AWF 2.1 — Design Phase*
