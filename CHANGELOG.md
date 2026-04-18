# Changelog — Cần & Có Platform

## [2026-04-18]

### Added
- **TopNavbar** (`components/layout/TopNavbar.tsx`): Thanh menu ngang thay thế SidebarDesktop. Logo-left · Nav-center · Bell+Avatar-right.

### Changed
- **app/page.tsx**: Đổi layout từ `flex-row` (sidebar) → `flex-col` (topnav). Nội dung chiếm full-width.
- **intent/[id]/page.tsx**: Chuẩn hóa theo design system mới — white cards `rounded-3xl`, sticky back bar (`top-16`), indigo gradient CTA, Quick Stats 3-col, ẩn comments.
- **IntentCard.tsx** *(global)*: Loại bỏ toàn bộ `wm-panel` dark CSS variables → Tailwind light tokens: `bg-white rounded-2xl shadow-sm`, `text-slate-900/600/400`, `text-indigo-600` accent, `hover:bg-slate-50`. Tác động toàn hệ thống (cả feed `/` và `/can-co`).

### Notes
- `SidebarDesktop.tsx` giữ lại nhưng không còn dùng → có thể xóa sau.
- `IntentComments` component disabled (comment-out), không xóa để dễ rollback.

---

## [2026-04-17] (Previous session)

### Added
- `IntentCard` redesign: HeroImage + ThumbnailStrip + ExpandableText
- Intent detail `/can-co/intent/[id]` redesigned: white cards, indigo accent
- FeedTab: VIP intents wrapped in Link for navigation

### Fixed
- `useFeedData.ts`: Removed VIP exclusion — all intents now show in main feed

---

## [2026-04-16] (Previous session)

### Added
- Choropleth Map: District-level heatmap for HCMC
- Mapbox point cluster + detail panel

### Changed
- Map boundary: Updated to post-2025 admin reform (no District level, only Ward)
