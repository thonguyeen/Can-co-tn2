# 📋 SPEC: Bản đồ BĐS Thông Minh (Mapbox Smart Map)

**Feature:** Tích hợp Mapbox bản đồ BĐS với Zoom-driven Layers
**Ngày tạo:** 2026-04-16
**Dự án:** Can-co-tn

---

## 1. Executive Summary

Tính năng Bản đồ Thông Minh cho phép người dùng khám phá BĐS trên bản đồ tương tác với 3 mức chi tiết theo zoom. Tích hợp sâu với hệ thống Mutual Match (Khớp Nhanh) — người dùng có thể "Like" ngay trên bản đồ.

## 2. User Stories

| # | Vai trò | Hành động | Kết quả mong đợi |
|---|---------|-----------|-------------------|
| 1 | Người tìm nhà | Mở trang /map → thấy bản đồ TP.HCM | Các quận được tô màu theo giá TB |
| 2 | Người tìm nhà | Zoom vào Quận 7 | Bóng bóng cluster hiện "15 căn" |
| 3 | Người tìm nhà | Zoom sát đường phố | Thấy từng pin giá "3.5 tỷ" |
| 4 | Người tìm nhà | Click pin "3.5 tỷ" | Popup card: ảnh, title, giá, nút Like |
| 5 | Người tìm nhà | Click "Quan tâm ❤️" | SwipeLike được tạo, tim bay |
| 6 | Người bán | Like lại bài người tìm trên map | MutualMatchPopup → Phòng Thỏa Thuận |
| 7 | Người tìm nhà | Lọc "Chỉ CẦN" + "Quận 7" | Bản đồ chỉ hiện dots CẦN ở Q7 |

## 3. Technical Architecture

```
┌──────────────────────────────────────────────────────┐
│                    /map (Page)                       │
├──────────────┬───────────────────────────────────────┤
│ MapFilter    │        MapboxRenderer                 │
│ Panel        │  ┌─────────────────────────────────┐  │
│              │  │  [Choropleth Layer] zoom < 12   │  │
│ • Type       │  │  Quận/Huyện tô màu theo giá    │  │
│ • District   │  ├─────────────────────────────────┤  │
│ • Price      │  │  [Cluster Layer] zoom 12-15     │  │
│ • Verified   │  │  Nhóm điểm → "🔵 15"          │  │
│              │  ├─────────────────────────────────┤  │
│              │  │  [Point Layer] zoom > 15        │  │
│              │  │  Từng pin "3.5 tỷ" → click     │  │
│              │  └────────────┬────────────────────┘  │
│              │               │ click                 │
│              │        MapPopupCard                   │
│              │  ┌────────────┴───────────────────┐  │
│              │  │ Ảnh | Title | Giá | [❤️ Like]  │  │
│              │  └────────────────────────────────┘  │
├──────────────┴───────────────────────────────────────┤
│  MapLegend (overlay góc phải dưới)                   │
└──────────────────────────────────────────────────────┘

API Endpoints:
  GET /api/map/geojson          → GeoJSON FeatureCollection (intents có lat/lng)
  GET /api/map/district-prices  → Giá TB theo Quận/Huyện
  POST /api/swipe               → Like từ popup (reuse)
```

## 4. Database Impact

**KHÔNG cần migration.** Intent model đã có `lat` (Decimal 10,8) và `lng` (Decimal 11,8).

Chỉ cần:
- Fix API `/api/intents` trả thêm `lat`, `lng` trong JSON response
- Tạo 2 API mới (`/api/map/geojson` + `/api/map/district-prices`)

## 5. External Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| mapbox-gl 3.20 | ✅ Đã cài | Không cần install |
| react-map-gl 8.1 | ✅ Đã cài | Không cần install |
| GeoJSON boundaries HCM | 🆕 Cần download | github/daohoangson/dvhcvn hoặc tương đương |
| Mapbox Access Token | ✅ Đã có | Cần chuyển từ hardcode → env |

## 6. Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Phần lớn Intent chưa có lat/lng | Bản đồ trống | Chỉ hiện intent có tọa độ; khuyến khích user thêm địa chỉ cụ thể |
| File GeoJSON boundaries quá lớn | Load chậm | Simplify geometry, lazy load |
| Mapbox token bị lạm dụng | Chi phí phát sinh | Dùng URL restrictions trên Mapbox account |

## 7. Phân chia Phases

1. **Phase 01 — Fix Foundation** (session 1): Token env, fix TS, API lat/lng, GeoJSON endpoint
2. **Phase 02 — Clustering** (session 1-2): Source/Layer, cluster, click-to-zoom
3. **Phase 03 — Choropleth** (session 2): District boundaries, fill layer, zoom transitions
4. **Phase 04 — Popup & Like** (session 2-3): Click → card → Like → Mutual Match
5. **Phase 05 — Standalone Page** (session 3): /map route, sidebar, filter, legend
6. **Phase 06 — Testing** (session 3-4): API tests, browser tests, edge cases
