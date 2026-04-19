# Phase 02: Choropleth + Ward GeoJSON Layer
Status: ✅ Complete
Dependencies: Phase 01

## Objective
Migrate choropleth heatmap từ Mapbox fill/symbol layers sang Leaflet GeoJSON layer. Ward-level pricing overlay.

## Implementation Steps

1. [ ] Leaflet GeoJSON choropleth layer — color fill by `avgPrice`
   - Dùng `L.geoJSON()` với `style` callback thay fillLayerStyle
   - Color scale giữ nguyên: green → yellow → orange → red → purple
2. [ ] Ward label overlay — tên phường + price label
   - Dùng `L.tooltip()` permanent hoặc custom divIcon
3. [ ] Ward hover highlight — outline khi hover
4. [ ] Ward border layer — outline only, fade by zoom
5. [ ] Toggle radar/map view mode (viewMode switch giữ nguyên)

## Files to Create/Modify
- `components/map/LeafletRenderer.tsx` — [MODIFY] Thêm choropleth GeoJSON layer
- `components/map/MapLegend.tsx` — [KEEP] Không đổi (pure UI)
- `public/geo/hcm-wards.geojson` — [KEEP] Data input không đổi

## Test Criteria
- [ ] Choropleth colors hiển thị đúng theo price range
- [ ] Ward labels hiển thị tên + giá trung bình
- [ ] Hover highlight hoạt động
- [ ] Toggle radar/map smooth
