# DESIGN: City Filter — Option D (Homigo Style)
Created: 2026-04-21
Based on: [`implementation_plan.md`](file:///C:/Users/ITS/.gemini/antigravity/brain/01db47f0-438b-4a0b-95c0-b553073cc711/implementation_plan.md)

---

## 1. Luồng Dữ Liệu (Data Flow)

```text
User bấm City Chip "TP.HCM"
        │
        ▼
setCity("Hồ Chí Minh")  [useFeedData state]
        │
        ▼
API call: GET /api/intents?limit=100&status=active&city=Hồ%20Chí%20Minh
        │
        ▼
SQL: WHERE i.status='active' AND i.city='Hồ Chí Minh'
        │
        ▼
Feed cập nhật: chỉ hiện tin ở HCM
```

---

## 2. Cây Component (Component Tree)

```text
FeedTab
├── [Search Bar + Filter Button 🎛️]     ← nút mở Drawer
├── CityChipBar                          ← NEW
│   ├── Chip "Tất cả"
│   ├── Chip "TP.HCM"
│   ├── Chip "Đà Nẵng"
│   ├── Chip "Khánh Hòa"
│   └── Chip "Hà Nội"
├── FeedFilterDrawer                     ← NEW (slide-over panel)
│   ├── Section: Loại tin (CẦN / BÁN / Tất cả)
│   ├── Section: Quận/Phường (dropdown theo city đang chọn)
│   ├── Section: Khoảng giá (từ / đến)
│   └── Footer: [Xóa bộ lọc] [Áp dụng]
└── Feed (SocialPostCard list)           ← KHÔNG ĐỔI
```

---

## 3. State Management

State tập trung ở `useFeedData` hook:

| State | Type | Default | Mô tả |
|-------|------|---------|-------|
| `city` | `string` | `''` | Thành phố đang chọn |
| `filter` | `FilterType` | `'all'` | Loại tin (CẦN/CO/all) |
| `district` | `string` | `''` | Quận/phường |
| `priceMin` | `number\|null` | `null` | Giá từ |
| `priceMax` | `number\|null` | `null` | Giá đến |
| `drawerOpen` | `boolean` | `false` | State mở/đóng Drawer |

> ⚠️ Reset `district = ''` khi `city` thay đổi.

---

## 4. City → Districts Mapping

```typescript
const CITY_DISTRICTS: Record<string, string[]> = {
  'Hồ Chí Minh': [
    'Quận 1', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận 6', 'Quận 7',
    'Quận 8', 'Quận 10', 'Quận 11', 'Quận 12',
    'Bình Thạnh', 'Gò Vấp', 'Phú Nhuận', 'Tân Bình', 'Tân Phú',
    'Bình Tân', 'Thủ Đức', 'Nhà Bè', 'Hóc Môn', 'Củ Chi',
  ],
  'Đà Nẵng': [
    'Hải Châu', 'Thanh Khê', 'Sơn Trà', 'Ngũ Hành Sơn',
    'Liên Chiểu', 'Cẩm Lệ', 'Hòa Vang',
  ],
  'Khánh Hòa': [
    'Nha Trang', 'Cam Ranh', 'Cam Lâm', 'Vạn Ninh',
    'Ninh Hòa', 'Khánh Vĩnh', 'Khánh Sơn', 'Trường Sa',
  ],
  'Hà Nội': [
    'Ba Đình', 'Hoàn Kiếm', 'Hai Bà Trưng', 'Đống Đa',
    'Tây Hồ', 'Cầu Giấy', 'Thanh Xuân', 'Hoàng Mai',
    'Long Biên', 'Nam Từ Liêm', 'Bắc Từ Liêm', 'Hà Đông',
  ],
};
```

---

## 5. City Chip Bar Design

```text
[ 🏙️ Tất cả ] [ 🌆 HCM ] [ 🏖️ Đà Nẵng ] [ 🌊 Khánh Hòa ] [ 🏛️ Hà Nội ]
```

- Active chip: `bg-indigo-600 text-white`
- Inactive chip: `bg-slate-100 text-slate-600 hover:bg-slate-200`
- Border radius: `rounded-full`
- Container: `flex gap-2 overflow-x-auto no-scrollbar pb-1`

---

## 6. Filter Drawer Design

- **Desktop**: slide over từ phải, chiều rộng `w-[320px]`
- **Mobile**: bottom sheet chiếm 70% chiều cao màn hình
- **Backdrop**: `bg-black/40` phủ phía sau, bấm để đóng
- **Animation**: `translate-x` slide-in (desktop), `translate-y` slide-up (mobile)
- Badge trên nút Bộ lọc: số filter đang active > 0: `bg-indigo-600 text-white text-[10px] rounded-full`

---

## 7. Acceptance Criteria

### Feature: City Chip Bar
- [ ] 5 chips hiển thị đúng (Tất cả + 4 TP)
- [ ] "Tất cả" active mặc định khi tải trang
- [ ] Bấm chip → feed load lại với city tương ứng
- [ ] Chip bar cuộn ngang trên mobile (không xuống dòng)

### Feature: Filter Drawer
- [ ] Nút 🎛️ mở Drawer, bấm backdrop đóng
- [ ] Drawer chứa đủ: Loại tin, Quận, Giá
- [ ] Quận dropdown hiển thị danh sách đúng theo city đang chọn
- [ ] Nút "Xóa bộ lọc" reset tất cả (trừ city)
- [ ] Badge count hiện số filter đang active

### Feature: Layout
- [ ] Không còn cột sidebar trái
- [ ] Feed rộng hơn (full center column)
- [ ] Bài viết (SocialPostCard) không bị thay đổi

### Feature: Backend
- [ ] API `?city=HCM` trả kết quả đúng
- [ ] API không có city param vẫn trả toàn bộ

---

## 8. Files Summary

| File | Action | Mô tả |
|------|--------|-------|
| `app/hooks/useFeedData.ts` | MODIFY | Thêm city state + API param |
| `app/components/tabs/FeedTab.tsx` | MODIFY | Xóa sidebar, thêm chips + drawer |
| `app/components/feed/FeedFilterSidebar.tsx` | MODIFY | Multi-city districts map |
| `app/components/feed/CityChipBar.tsx` | NEW | City chip bar component |
| `app/components/feed/FeedFilterDrawer.tsx` | NEW | Filter slide-over drawer |
| `app/app/api/intents/route.ts` | MODIFY | Thêm city filter param |
