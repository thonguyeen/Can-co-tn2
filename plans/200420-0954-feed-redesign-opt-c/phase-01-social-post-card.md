# Phase 01: Thiết kế SocialPostCard Component
Status: ✅ Complete
Dependencies: None

## Objective
Tạo component `SocialPostCard.tsx` hoàn toàn mới theo design Option C để thay thế `IntentCard` trong FeedTab. IntentCard vẫn giữ nguyên cho trang chi tiết.

## Anatomy của SocialPostCard

```
┌────────────────────────────────────────────────┐
│  [HERO IMAGE full-width 16:10]                 │
│  ┌──────────────┐      ┌──────────────────────┐│
│  │ CÓ BÁN (pill)│      │ 11.8 Tỷ  (price tag) ││
│  └──────────────┘      └──────────────────────┘│
│  [AVATAR] Tên User · Badge · 2 giờ trước  [···]│
│  Title in đậm (nếu có)                         │
│  Body text với AI highlights (giá, địa chỉ)    │
│  Tags: 📍 Quận 7  🛏 2PN  💰 3-4 tỷ           │
│  🤖 Bot: "Có 5 tin tương tự khu vực này"       │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  Reaction: 🔥 12  💰 5  👍 23 · 🤝 4 · 👁 890  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  [Quan tâm]  [━ Đàm phán ngay ━]  [Lưu]        │
└────────────────────────────────────────────────┘
```

## Design Tokens

| Token | Value |
|-------|-------|
| Primary | `indigo-600` |
| CẦN badge | `amber-500` bg + white text |
| CÓ badge | `emerald-500` bg + white text |
| Bot accent | `teal-50` bg + `teal-800` text |
| Price tag | `white/95` bg + `indigo-600` price |
| Card radius | `rounded-[20px]` |
| Card shadow | `shadow-sm hover:shadow-md` |

## Files to Create

- `app/components/intent/SocialPostCard.tsx` — Component chính
- Tái sử dụng `Lightbox` đã có trong IntentCard
- Tái sử dụng `BotComment` component (có sẵn)
- Tái sử dụng `useSaved` hook + `useAuthGate` hook

## Implementation Steps

1. [x] Tạo file `SocialPostCard.tsx` với skeleton đúng anatomy
2. [x] Build `HeroImage` section (full-width, price badge, type badge)
3. [x] Build `PostHeader` (avatar, name, badge, timestamp, menu)
4. [x] Build `PostBody` (title, text với AI-highlight, tags)
5. [x] Build `BotPreview` inline (reuse BotComment)
6. [x] Build `ReactionBar` (emoji counts + metrics)
7. [x] Build `ActionBar` mới (Quan tâm · Đàm phán · Lưu với requireAuth)
8. [x] Export và test render với mock data

## AI Highlight Rules

| Pattern | Style |
|---------|-------|
| Số tiền (X tỷ, X triệu) | `font-bold text-indigo-600 bg-indigo-50 px-1 rounded` |
| Địa danh (Quận X, P.X) | `underline decoration-slate-300 decoration-2 underline-offset-2` |

## Test Criteria

- [x] Card hiển thị đúng với bài có ảnh (CÓ BÁN)
- [x] Card hiển thị đúng với bài không có ảnh (CẦN MUA)
- [x] Click Quan tâm/Lưu khi guest → AuthGateModal
- [x] Click Đàm phán khi guest → AuthGateModal
- [x] Lightbox mở ảnh khi click hero image

---
Next Phase: [phase-02-feedtab-refactor.md](./phase-02-feedtab-refactor.md)
