# DESIGN: V1-Split Mẫu D Redesign
Created: 2026-04-19T16:09 | Màu: Dark Navy + Violet | Route: /intent/[id]/v1-split

---

## 1. Màn Hình & Components

### Layout Tổng Thể (Desktop)
```
┌──────────────────────────────┬──────────────────────────────┐
│  LEFT (w-1/2, sticky)        │  RIGHT (flex-1, overflow-y)  │
│                              │                              │
│  ┌──────────────────────┐    │  Tags row                    │
│  │   IMAGE SLIDER       │    │  H1 Title                    │
│  │   h-[50vh]           │    │  Subtitle (area·type·ward)   │
│  │   prev/next/dots     │    │  Price (violet, 36px bold)   │
│  │   4 thumbnails       │    │  ──────────────────────────  │
│  └──────────────────────┘    │  Specs 2×2 grid              │
│  ┌──────────────────────┐    │  Poster row                  │
│  │   MAPBOX MAP         │    │  Description section         │
│  │   h-[50vh]           │    │  Tiện ích chips              │
│  │   violet pin         │    │  Tin liên quan (2-col grid)  │
│  │   address pill       │    │  ──────────────────────────  │
│  └──────────────────────┘    │  [Gọi điện] [Chat ngay]     │
└──────────────────────────────┴──────────────────────────────┘
```

Mobile: 1-col stack → Slider → Content (no map)

---

## 2. Components

### 2.1 [NEW] ImageSlider.tsx
`app/components/intent/ImageSlider.tsx`

```
Props:
  images: { url: string }[]   // from intent.images[]
  className?: string

State:
  currentIndex: number (0)

UI:
  - Main image: object-cover, relative container
  - Prev "‹" button: absolute left-3, white circle w-9 h-9, shadow-lg
  - Next "›" button: absolute right-3, white circle w-9 h-9, shadow-lg
  - Counter pill: absolute bottom-3 right-3, dark/60 backdrop-blur, "1 / 4"
  - Dot row: absolute bottom-3 center, violet dot = active
  - Thumbnail strip: 4 squares below, cursor-pointer, violet border if active

Fallback: violet gradient (#4c1d95→#1e1b4b) + "Cần & Có" watermark
```

### 2.2 [NEW] MapSection (inline in page)
Reuse Mapbox token + `react-map-gl` (already in package.json if map page exists).

```
Strategy:
  - If intent has lat/lng in parsed_data → center on it
  - Else → default HCMC center (10.7769, 106.7009), zoom 13
  - Violet marker pin (custom SVG or Marker component)
  - Address pill overlay (white, bottom-left)
  - No controls (zoom disabled for mini map feel)

Height: h-[50vh], w-full
```

### 2.3 [MODIFY] useIntentDetail.ts

Add to return:
```ts
const allImages = intent?.images ?? [];
// return { ...existing, allImages }
```

### 2.4 [MODIFY] v1-split/page.tsx

Full rewrite of JSX. Data mapping:

| UI Element | Data Source |
|-----------|-------------|
| Image slider | `allImages` (from hook) |
| Tags row | `isCO`, `intent.source`, `intent.type` |
| Title | `intent.title \|\| intent.raw_text?.slice(0,80)` |
| Subtitle | `parsed_data.district`, `parsed_data.area_m2`, `parsed_data.ward` |
| Price | `intent.price \|\| intent.price_min` |
| Specs grid | `parsed_data.district`, `area_m2`, `property_type`, `alley_type` |
| Poster | `intent.user_id`, `intent.created_at`, `intent.source` |
| Description | `intent.raw_text` |
| District tag | `(parsed_data as any).district` |
| Tin liên quan | Static mock (2 cards) — real fetch sau |

---

## 3. Màu Sắc

| Token Tailwind | Hex | Dùng ở |
|----------------|-----|--------|
| `bg-[#0f0f1a]` | dark navy | left panel bg |
| `bg-violet-700 / violet-600` | #6d28d9 / #7c3aed | CTA filled, price, pin, tags |
| `text-violet-400` | #a78bfa | price text |
| `bg-white` | #ffffff | right panel |
| `bg-slate-50` | #f8fafc | specs card bg |
| `text-slate-700` | #334155 | body text |
| `border-slate-100` | #f1f5f9 | card borders |

---

## 4. Acceptance Criteria

### AC-01: Image Slider hoạt động đúng
- [ ] Hiện ảnh đầu tiên khi load
- [ ] Click "›" → sang ảnh tiếp theo (loop lại đầu)
- [ ] Click "‹" → về ảnh trước (loop từ cuối)
- [ ] Thumbnail strip: click thumbnail → nhảy đến đúng ảnh
- [ ] Active thumbnail có violet border
- [ ] Counter pill cập nhật đúng "x / n"
- [ ] Nếu 0 ảnh → hiện violet gradient placeholder, không crash

### AC-02: Mapbox Map render
- [ ] Map hiện street map ánh xạ đúng khu vực HCMC
- [ ] Violet pin hiện tại center
- [ ] Address pill hiện "📍 [ward], [district]" hoặc default "TP.HCM"
- [ ] Map không có zoom controls (tắt navigation)
- [ ] Height đúng h-[50vh]

### AC-03: Right panel content đầy đủ
- [ ] Tags row: at least type badge (Đang bán / Cần tìm)
- [ ] Title hiện tên bài đăng
- [ ] Price hiện số định dạng locale VN, màu violet
- [ ] Specs grid: 4 ô (addr / area / type / access)
- [ ] Poster: avatar + name + time relative
- [ ] Description: full raw_text hoặc truncate 300 chars với "Xem thêm"
- [ ] Tiện ích chips: từ parsed_data hoặc ẩn section nếu không có data
- [ ] Tin liên quan: 2 mock cards (không crash nếu không có data)

### AC-04: Layout & UX
- [ ] Left panel sticky (không cuộn khi right panel cuộn)
- [ ] Sticky CTA bar luôn visible ở bottom right panel
- [ ] Desktop ≥1024px: 2-col. Mobile <1024px: 1-col (slider trên, no map)
- [ ] Back button hoạt động (router.back())
- [ ] Trust badge hiện % đúng

---

## 5. Kế Hoạch Implement

| Bước | Việc | File |
|------|------|------|
| 1 | Thêm `allImages` vào hook | `useIntentDetail.ts` |
| 2 | Tạo `ImageSlider` component | `ImageSlider.tsx` |
| 3 | Rewrite page JSX — left panel | `v1-split/page.tsx` |
| 4 | Rewrite page JSX — right panel | `v1-split/page.tsx` |
| 5 | Tích hợp Mapbox map trong left bottom | `v1-split/page.tsx` |
| 6 | Browser test & polish | - |
