# Phase 05: Standalone Map Page + UI Polish
Status: ✅ Complete
Dependencies: Phase 03, Phase 04

## Objective
Tạo trang `/map` standalone (giống cách `/swipe` hoạt động) với layout riêng, sidebar filter, và legend giải thích màu sắc.

## Requirements

### Functional
- [x] Route `/map` là trang full-screen độc lập
- [x] Sidebar trái: filter theo type (CAN/CO), ward, price range
- [x] Legend (chú thích): giải thích thang màu Choropleth
- [x] Responsive: mobile = bottom sheet filter, desktop = sidebar
- [x] Navigation: thêm link "🗺️ Bản đồ" vào main sidebar/nav

### Non-Functional
- [x] Design đồng bộ với homepage (light theme, #0068FF, bg-gray-50)
- [x] Smooth transitions khi toggle filter

## Implementation Steps

### 1. Tạo trang `/map`
- [x] File `app/map/page.tsx` — standalone page full-screen
- [x] File `app/map/layout.tsx` — auth guard + SEO metadata, không có Header/Sidebar
- [x] Layout: Sidebar trái (280px) + Map chiếm phần còn lại
- [x] Mobile: Map full + bottom filter drawer

### 2. Sidebar Filter Panel
- [x] Component `components/map/MapFilterPanel.tsx`
- [x] Filters:
  - Toggle CAN / CÓ / Tất cả
  - Search dropdown chọn Phường/Xã (cập nhật: bỏ Quận vì VN bỏ cấp Quận 2025)
  - Slider giá (min-max) dùng @radix-ui/react-slider
  - Toggle: Chỉ hiện tin đã xác thực
- [x] Mobile: bottom drawer animated

### 3. Legend (Chú thích bản đồ)
- [x] Component `components/map/MapLegend.tsx` overlay góc phải dưới
- [x] Hiện thang màu choropleth với gradient bar + discrete dots
- [x] Icon legend: 🔴 CẦN, 🔵 CÓ
- [x] Collapsible để không chiếm không gian

### 4. Thêm navigation link
- [x] Thêm item "🗺️ Bản đồ BĐS" vào Sidebar.tsx (desktop)
- [x] Thêm item "Bản đồ" vào MobileNav.tsx (mobile bottom nav)
- [x] Active state cho /map route

### 5. Polish & Animation
- [x] Slide-up animation cho mobile filter drawer
- [x] Smooth transitions khi toggle filter

## Files Created/Modified
- `app/app/map/page.tsx` — [NEW] Standalone map page
- `app/app/map/layout.tsx` — [NEW] Auth guard layout
- `app/components/map/MapFilterPanel.tsx` — [NEW] Filter sidebar
- `app/components/map/MapLegend.tsx` — [NEW] Color legend
- `app/components/layout/Sidebar.tsx` — [MODIFIED] +Map link
- `app/components/layout/MobileNav.tsx` — [MODIFIED] +Map link

## Test Criteria
- [x] Truy cập `/map` hiển thị bản đồ full-screen
- [x] Filter hoạt động: lọc theo type, ward, price
- [x] Responsive: mobile layout chính xác
- [x] Đồng bộ design với homepage

---
Next Phase: [Phase 06 - Testing](./phase-06-testing.md)
