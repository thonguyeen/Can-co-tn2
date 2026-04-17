# Phase 03: Choropleth Vùng Giá (Heatmap theo Quận/Huyện)
Status: ✅ Complete — 2026-04-16
Dependencies: Phase 02

## Objective
Thêm lớp (layer) tô màu các vùng hành chính theo giá BĐS trung bình — tạo "bản đồ nhiệt giá" giúp người dùng nhìn một phát là biết khu vực đắt/rẻ.

## Requirements

### Functional
- [x] Download và tích hợp file GeoJSON ranh giới Quận/Huyện TP.HCM
- [x] API tính giá trung bình mỗi Quận/Huyện từ Intent data
- [x] Lớp Choropleth hiển thị khi zoom level < 12 (tầm nhìn thành phố)
- [x] Lớp Choropleth mờ dần / ẩn khi zoom > 13 (nhường cho cluster/marker)

### Non-Functional
- [ ] File GeoJSON boundaries phải < 500KB (simplified)
- [ ] Transition chuyển layer phải mượt (opacity animation)

## Implementation Steps

### 1. Chuẩn bị dữ liệu ranh giới hành chính
- [ ] Download GeoJSON từ nguồn mở: `github.com/daohoangson/dvhcvn` hoặc tương đương
- [ ] Lọc chỉ lấy Quận/Huyện TP.HCM (hoặc các tỉnh có data)
- [ ] Simplify geometry nếu file quá lớn (mapshaper.org)
- [ ] Lưu tại `public/geojson/hcm-districts.geojson`

### 2. API tính giá trung bình theo vùng
- [ ] Tạo API `GET /api/map/district-prices`
- [ ] Query:
  ```sql
  SELECT district, 
         AVG(COALESCE(price, price_min)) as avg_price,
         COUNT(*) as listing_count
  FROM intents 
  WHERE status = 'active' 
    AND district IS NOT NULL
    AND (price IS NOT NULL OR price_min IS NOT NULL)
  GROUP BY district
  ```
- [ ] Response:
  ```json
  {
    "districts": {
      "Quận 7": { "avgPrice": 4200000000, "count": 15 },
      "Gò Vấp": { "avgPrice": 5800000000, "count": 8 }
    }
  }
  ```

### 3. Merge dữ liệu giá vào GeoJSON boundaries
- [ ] Client-side join: match `district` tên với GeoJSON `properties.name`
- [ ] Thêm `avgPrice` vào mỗi Feature's properties

### 4. Thêm Fill Layer cho Choropleth
- [ ] Sử dụng `type: 'fill'` layer với data-driven `fill-color`:
  ```tsx
  <Layer
    id="district-fills"
    type="fill"
    paint={{
      'fill-color': [
        'interpolate', ['linear'], ['get', 'avgPrice'],
        0, '#d1fae5',            // Rất rẻ → xanh nhạt
        3000000000, '#fef08a',   // Trung bình → vàng
        8000000000, '#fca5a5',   // Đắt → đỏ nhạt
        15000000000, '#dc2626'   // Rất đắt → đỏ đậm
      ],
      'fill-opacity': [
        'interpolate', ['linear'], ['zoom'],
        10, 0.6,  // Zoom xa → opacity cao
        13, 0.1,  // Zoom gần → mờ dần
        14, 0     // Ẩn hoàn toàn
      ]
    }}
  />
  ```

### 5. Label hiển thị tên Quận + giá
- [ ] Thêm Symbol Layer hiện text ở tâm mỗi vùng:
  ```
  "Quận 7\n~4.2 tỷ" (12 listings)
  ```

## Files to Create/Modify
- `app/public/geojson/hcm-districts.geojson` — [NEW] Ranh giới quận huyện
- `app/app/api/map/district-prices/route.ts` — [NEW] API giá trung bình
- `app/components/map/MapboxRenderer.tsx` — Thêm choropleth layer
- `app/hooks/useMapData.ts` — Thêm fetch district prices

## Test Criteria
- [x] Khi zoom mức thành phố: thấy rõ các quận tô màu khác nhau
- [x] Khi zoom vào đường phố: lớp màu biến mất, hiện cluster/marker
- [x] Label hiện tên quận + giá TB (ví dụ: "Quận 3 ~4.4 tỷ")
- [x] Data giá tính từ DB thật (không mock)

---
Next Phase: [Phase 04 - Popup & Like](./phase-04-popup-like.md)
