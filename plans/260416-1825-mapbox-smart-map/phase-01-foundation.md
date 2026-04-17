# Phase 01: Fix Foundation & Data Pipeline
Status: ✅ Complete — 2026-04-16
Dependencies: Không

## Objective
Sửa các lỗi nền tảng hiện có và đảm bảo API trả đủ dữ liệu tọa độ cho bản đồ.

## Requirements

### Functional
- [x] Mapbox token phải được đọc từ env, không hardcode
- [x] API `/api/intents` phải trả `lat` và `lng` trong response JSON
- [x] Tạo API endpoint mới `GET /api/map/geojson` chuyên cấp GeoJSON FeatureCollection cho bản đồ
- [x] Fix TypeScript errors trong MapboxRenderer.tsx

### Non-Functional
- [ ] GeoJSON API phải trả dữ liệu < 200ms cho 500 records
- [ ] Token không bị lộ trong client bundle (dùng `NEXT_PUBLIC_` prefix)

## Implementation Steps

### 1. Chuyển Mapbox token vào env
- [ ] Thêm `NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1...` vào `.env.local`
- [ ] Cập nhật `MapboxRenderer.tsx` đọc từ `process.env.NEXT_PUBLIC_MAPBOX_TOKEN`

### 2. Fix API `/api/intents` trả lat/lng
- [ ] Trong file `app/api/intents/route.ts`, thêm `lat` và `lng` vào enriched object (dòng ~266-325)
- [ ] Convert `Decimal` sang `Number` (giống cách xử lý `price`)

### 3. Tạo API `GET /api/map/geojson`
- [ ] Tạo file `app/api/map/geojson/route.ts`
- [ ] Query tất cả Intent có `lat != null AND lng != null AND status = 'active'`
- [ ] Trả về chuẩn GeoJSON FeatureCollection:
  ```json
  {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "geometry": { "type": "Point", "coordinates": [lng, lat] },
        "properties": {
          "id": "...",
          "title": "...",
          "price": 3500000000,
          "type": "CO",
          "district": "Quận 7",
          "subcategory": "apartment",
          "imageUrl": "...",
          "trustScore": 5
        }
      }
    ]
  }
  ```

### 4. Fix TS errors trong MapboxRenderer.tsx
- [ ] Sửa `e.stopPropagation()` → `e.originalEvent` issue (dòng 114, 130)
- [ ] Nguyên nhân: React event vs Mapbox event conflict

## Files to Create/Modify
- `app/.env.local` — thêm NEXT_PUBLIC_MAPBOX_TOKEN
- `app/components/map/MapboxRenderer.tsx` — fix token + TS errors
- `app/app/api/intents/route.ts` — thêm lat/lng vào response
- `app/app/api/map/geojson/route.ts` — [NEW] GeoJSON endpoint

## Test Criteria
- [x] `MapboxRenderer.tsx` không còn TS error (đã verify via tsc)
- [x] `GET /api/intents` response chứa `lat` và `lng` fields
- [x] `GET /api/map/geojson` tạo xong, cần verify sau khi server chạy

---
Next Phase: [Phase 02 - GeoJSON Clustering](./phase-02-clustering.md)
