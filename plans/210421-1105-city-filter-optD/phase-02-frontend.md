# Phase 02: Frontend — City Chips + Filter Drawer
Status: ⬜ Pending
Dependencies: Phase 01 ✅

## Objective
Thay thế cột sidebar "Bộ lọc" bằng: thanh City Chips ngang + nút Bộ lọc mở Drawer.

## Implementation Steps

### 1. Tạo `CityChipBar.tsx` (NEW)
- [ ] Component: hàng chip ngang ("Tất cả", "TP.HCM", "Đà Nẵng", "Khánh Hòa", "Hà Nội")
- [ ] Props: `city`, `setCity`
- [ ] Style: pill buttons, active = indigo, inactive = gray, mỗi TP có emoji icon
- [ ] Mobile: nằm ngang, overflow-x-auto cuộn ngang mượt
- [ ] Mapping: chip label → API city value
  ```
  "Tất cả" → "" (không filter)
  "TP.HCM" → "Hồ Chí Minh"
  "Đà Nẵng" → "Đà Nẵng"
  "Khánh Hòa" → "Khánh Hòa"
  "Hà Nội" → "Hà Nội"
  ```

### 2. Tạo `FeedFilterDrawer.tsx` (NEW)
- [ ] Slide-over panel từ cạnh phải (hoặc bottom sheet trên mobile)
- [ ] Chứa nội dung cũ của FeedFilterSidebar: Loại tin, Quận/Phường, Khoảng giá
- [ ] Nút "Áp dụng" + "Xóa bộ lọc"
- [ ] Backdrop overlay khi mở
- [ ] Animation: slide-in + fade

### 3. Sửa `useFeedData.ts`
- [ ] Thêm state: `city`, `setCity`
- [ ] Truyền `city` vào API fetch URL: `/api/intents?limit=100&status=active&city=${city}`
- [ ] Reset `district` khi đổi city (vì danh sách quận khác nhau theo TP)
- [ ] Export `city`, `setCity`

### 4. Sửa `FeedTab.tsx`
- [ ] Xóa block LEFT: FILTER SIDEBAR (cột trái)
- [ ] Thêm CityChipBar ngay dưới Search Bar
- [ ] Thêm nút 🎛️ Bộ lọc vào bên phải Search Bar (thay thế Ctrl+K)
- [ ] Import & render FeedFilterDrawer (mở/đóng bằng state)
- [ ] Badge hiện số filter đang active (nếu > 0)

### 5. Cập nhật `FeedFilterSidebar.tsx`
- [ ] Đổi HCM_DISTRICTS → CITY_DISTRICTS map theo city đang chọn
- [ ] Thêm danh sách quận cho Đà Nẵng, Khánh Hòa, Hà Nội
- [ ] Component này sẽ được reuse bên trong FeedFilterDrawer

## Files to Create
- `app/components/feed/CityChipBar.tsx`
- `app/components/feed/FeedFilterDrawer.tsx`

## Files to Modify
- `app/hooks/useFeedData.ts` — Thêm city state + API param
- `app/components/tabs/FeedTab.tsx` — Xóa sidebar, thêm chips + drawer
- `app/components/feed/FeedFilterSidebar.tsx` — Multi-city districts map

## Test Criteria
- [ ] City chip bar hiển thị đúng 5 chip (Tất cả + 4 TP)
- [ ] Bấm chip → feed filter theo thành phố đó
- [ ] Nút Bộ lọc → Drawer trượt ra
- [ ] Drawer chứa đủ: Loại tin, Quận, Giá
- [ ] Mobile: chip bar cuộn ngang, drawer chiếm đáy màn hình
- [ ] Bài viết hiển thị giữ nguyên, không thay đổi

---
Next Phase: phase-03
