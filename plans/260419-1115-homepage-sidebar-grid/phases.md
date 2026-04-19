# Phase 01: Filter Sidebar Component
Status: ⬜ Pending

## Objective
Tạo FeedFilterSidebar — sticky sidebar bên trái hiện bộ lọc BĐS.

## Implementation Steps

### 1. Tạo `FeedFilterSidebar.tsx`
- [ ] Component nhận props: `filter`, `setFilter`, `district`, `setDistrict`, `priceRange`, `setPriceRange`
- [ ] UI elements:
  - **Loại tin:** 3 buttons (Tất cả / CẦN / CÓ) — tái sử dụng filter logic hiện có
  - **Khu vực:** Dropdown/select với danh sách quận TP.HCM (hardcode static list)
  - **Khoảng giá:** 2 inputs (Từ / Đến) hoặc range slider đơn giản
  - **Nút "Áp dụng"** (indigo CTA)
  - **Nút "Xóa lọc"** (text link)
- [ ] Styling: `w-[260px] shrink-0 sticky top-20` (below TopNavbar h-16 + gap)
- [ ] Responsive: `hidden lg:block` — chỉ hiện trên Desktop
- [ ] Design: white card, rounded-2xl, border-slate-100, shadow-sm

### 2. Mở rộng `useFeedData.ts`
- [ ] Thêm state: `district: string | null`, `priceRange: [number | null, number | null]`
- [ ] Thêm filter logic vào `allFiltered`:
  - Nếu `district` có giá trị → filter theo `parsed_data.district`
  - Nếu `priceRange` có giá trị → filter theo `intent.price` hoặc `intent.price_min`
- [ ] Export thêm: `district`, `setDistrict`, `priceRange`, `setPriceRange`

## Files
- NEW: `app/components/feed/FeedFilterSidebar.tsx`
- MODIFY: `app/hooks/useFeedData.ts`

---

# Phase 02: Feed Layout Restructure
Status: ⬜ Pending
Dependencies: Phase 01

## Objective
Thay đổi layout FeedTab: thêm sidebar trái + chuyển Regular List sang grid 2 cột.

## Implementation Steps

### 1. Thay đổi outer container
- [ ] Xóa `max-w-3xl mx-auto` trên main content div
- [ ] Thay bằng flex layout 3 cột: `[FeedFilterSidebar] [Feed] [FeedObserverPanel]`
- [ ] Feed column: `flex-1 min-w-0` (fill available space)

### 2. Chuyển Regular Feed → Grid 2 cột
- [ ] Thay `space-y-4` bằng `grid grid-cols-1 lg:grid-cols-2 gap-4`
- [ ] Đảm bảo IntentCard trong mỗi grid cell `overflow-hidden`
- [ ] VIP carousel giữ nguyên (horizontal scroll full-width)

### 3. Di chuyển Filter Buttons
- [ ] Xóa filter buttons inline hiện tại (line 130-134 trong FeedTab)
- [ ] Filter buttons đã nằm trong FeedFilterSidebar
- [ ] Mobile fallback: giữ filter buttons inline cho mobile (sm only)

### 4. Wire up Sidebar
- [ ] Import FeedFilterSidebar
- [ ] Pass filter props từ useFeedData
- [ ] Đảm bảo FeedFilterSidebar chỉ hiện `hidden lg:block`

## Files
- MODIFY: `app/components/tabs/FeedTab.tsx`

---

# Phase 03: Verify & Responsive
Status: ⬜ Pending
Dependencies: Phase 02

## Objective
Kiểm tra visual trên Desktop + Mobile.

## Test Criteria
- [ ] Desktop (1280px+): 3 cột hiện đúng (Filter | Feed 2-col | Observer)
- [ ] Tablet (768px-1279px): Sidebar ẩn, Feed 1 cột, Observer ẩn
- [ ] Mobile (< 768px): Feed 1 cột, filter buttons inline hiện
- [ ] VIP carousel không bị vỡ layout
- [ ] Infinite scroll vẫn hoạt động
- [ ] Filter by type/district/price hoạt động đúng
