# 🎨 DESIGN: Homepage Desktop — Sidebar Lọc + Grid 2 Cột

Ngày tạo: 2026-04-19
Dựa trên: `plans/260419-1115-homepage-sidebar-grid/plan.md`

---

## 1. Component Tree (Cấu trúc mảnh ghép)

```
FeedTab.tsx (đã có)
├── <div className="flex h-full">              ← outer 3-column flex
│
│   ├── <FeedFilterSidebar />                  ← NEW: Cột trái, hidden lg:block
│   │     ├── Loại tin (CẦN / CÓ / Tất cả)
│   │     ├── Khu vực (dropdown quận)
│   │     ├── Khoảng giá (min / max)
│   │     └── [Áp dụng] [Xóa lọc]
│   │
│   ├── <div className="flex-1">               ← Cột giữa (Feed)
│   │     ├── SearchBar
│   │     ├── ComposeIntent
│   │     ├── VIP Carousel (giữ nguyên, full-width)
│   │     ├── Filter buttons (sm only, ẩn khi lg+)
│   │     └── Regular Feed → grid grid-cols-1 lg:grid-cols-2
│   │
│   └── <FeedObserverPanel />                  ← Cột phải (đã có, xl+)
```

## 2. Layout Specs (Kích thước)

| Vùng | Desktop (lg+) | Tablet (md) | Mobile (sm) |
|------|--------------|-------------|-------------|
| Sidebar Lọc | `w-[260px]` sticky | ẩn | ẩn |
| Feed | `flex-1`, grid 2 col | full, 1 col | full, 1 col |
| Observer AI | `w-[340px]` xl+ | ẩn | ẩn |
| Filter buttons inline | ẩn | hiện | hiện |

## 3. FeedFilterSidebar — Chi tiết UI

```
┌──────────────────────────┐
│  🔍 BỘ LỌC               │  ← header
├──────────────────────────┤
│                          │
│  LOẠI TIN                │
│  [Tất cả] [CẦN] [CÓ]    │  ← 3 pill buttons, active = indigo
│                          │
│  KHU VỰC                 │
│  ┌────────────────────┐  │
│  │ Chọn quận ▾        │  │  ← <select> hoặc custom dropdown
│  └────────────────────┘  │
│                          │
│  KHOẢNG GIÁ              │
│  ┌────────┐ ┌────────┐  │
│  │ Từ...  │ │ Đến... │  │  ← 2 number inputs
│  └────────┘ └────────┘  │
│                          │
│  [    Áp dụng lọc     ]  │  ← indigo CTA button
│  [    Xóa bộ lọc      ]  │  ← text link, slate-400
│                          │
│  ───────────────────     │
│  📊 THỐNG KÊ NHANH       │
│  • Tổng tin: 42          │
│  • CẦN: 18 | CÓ: 24     │
│  • Khu vực hot: Q.7      │
└──────────────────────────┘
```

**Styling tokens:**
- Container: `bg-white rounded-2xl border border-slate-100 shadow-sm p-5`
- Sticky: `sticky top-20` (below TopNavbar 64px + 16px gap)
- Labels: `text-xs font-bold text-slate-500 uppercase tracking-wider mb-2`
- Pill active: `bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200`
- Pill idle: `bg-slate-50 text-slate-600 hover:bg-slate-100`
- CTA: `bg-indigo-600 text-white rounded-xl py-2.5 text-sm font-bold`

## 4. Danh sách Quận TP.HCM (Hardcode)

```ts
const HCM_DISTRICTS = [
  'Quận 1', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận 6', 'Quận 7',
  'Quận 8', 'Quận 10', 'Quận 11', 'Quận 12',
  'Bình Thạnh', 'Gò Vấp', 'Phú Nhuận', 'Tân Bình', 'Tân Phú',
  'Bình Tân', 'Thủ Đức', 'Nhà Bè', 'Hóc Môn', 'Củ Chi',
  'Bình Chánh', 'Cần Giờ',
];
```

## 5. Filter Logic (trong `useFeedData.ts`)

```ts
// Hiện tại:
const allFiltered = filter === 'all' ? intents : intents.filter(i => i.type === filter);

// Sau khi sửa:
let filtered = intents;
if (filter !== 'all') filtered = filtered.filter(i => i.type === filter);
if (district) filtered = filtered.filter(i => (i.parsed_data as any)?.district === district);
if (priceMin) filtered = filtered.filter(i => (i.price || i.price_min || 0) >= priceMin);
if (priceMax) filtered = filtered.filter(i => (i.price || i.price_min || Infinity) <= priceMax);
const allFiltered = filtered;
```

## 6. Checklist Kiểm Tra

### FeedFilterSidebar
- [ ] Hiện sticky bên trái trên Desktop (lg+)
- [ ] Ẩn hoàn toàn trên Tablet/Mobile
- [ ] 3 pill buttons hoạt động đúng (active state)
- [ ] Dropdown quận hiện đủ 22 quận
- [ ] Input giá chỉ nhận số
- [ ] "Xóa lọc" reset tất cả về mặc định

### Feed Grid
- [ ] Desktop: Grid 2 cột, gap-4
- [ ] Mobile: 1 cột (giữ nguyên)
- [ ] VIP carousel vẫn full-width, không bị grid ảnh hưởng
- [ ] Infinite scroll vẫn hoạt động với grid 2 cột

### Filter Logic
- [ ] Lọc CẦN → chỉ hiện tin CẦN
- [ ] Lọc Quận 7 → chỉ hiện tin có district = "Quận 7"
- [ ] Lọc giá 1B–3B → chỉ hiện tin trong khoảng
- [ ] Kết hợp nhiều filter cùng lúc hoạt động
- [ ] Xóa lọc → hiện toàn bộ tin

## 7. Test Cases

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**TC-01:** Filter loại tin
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Given: Sidebar hiện, feed có cả CẦN và CÓ
When:  Click pill "CẦN"
Then:  Feed chỉ hiện tin CẦN. Pill "CẦN" active (indigo).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**TC-02:** Filter khu vực
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Given: Feed hiện tất cả
When:  Chọn "Quận 7" trong dropdown
Then:  Feed chỉ hiện tin có district = "Quận 7"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**TC-03:** Không có kết quả phù hợp
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Given: Filter CẦN + Quận Cần Giờ (ít tin)
When:  Không tìm thấy tin nào
Then:  Hiện empty state "Không tìm thấy tin phù hợp"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**TC-04:** Responsive
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Given: Desktop (1280px+)
When:  Thu nhỏ cửa sổ xuống < 1024px
Then:  Sidebar ẩn. Filter buttons inline hiện.

---

*Tạo bởi AWF 2.1 — Design Phase*
