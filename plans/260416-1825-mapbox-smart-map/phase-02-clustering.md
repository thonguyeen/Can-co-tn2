# Phase 02: GeoJSON Clustering (Source/Layer)
Status: ✅ Complete — 2026-04-16
Dependencies: Phase 01

## Objective
Thay thế cách hiển thị Marker đơn lẻ (chậm khi >100 điểm) bằng GeoJSON Source + Circle Layer + Clustering — hiệu suất cao, mượt mà với hàng ngàn điểm.

## Requirements

### Functional
- [ ] Bản đồ dùng `map.addSource()` + `map.addLayer()` thay vì `<Marker>` component
- [ ] Khi zoom xa: các điểm gần nhau tự gom thành 1 cụm hiển thị số lượng
- [ ] Khi zoom gần: cụm vỡ ra thành từng điểm riêng lẻ (bong bóng giá)
- [ ] Click vào cụm → zoom vào cụm đó

### Non-Functional
- [ ] Render mượt 60fps với 1000+ điểm

## Implementation Steps

### 1. Refactor MapboxRenderer.tsx
- [ ] Thay thế `<Marker>` loop bằng `<Source>` + `<Layer>` component từ react-map-gl
- [ ] Config clustering:
  ```tsx
  <Source
    id="intents"
    type="geojson"
    data={geojsonData}
    cluster={true}
    clusterMaxZoom={14}
    clusterRadius={50}
  >
    {/* Cluster circles */}
    <Layer id="clusters" type="circle" filter={['has', 'point_count']} paint={{
      'circle-color': ['step', ['get', 'point_count'], '#51bbd6', 10, '#f1f075', 30, '#f28cb1'],
      'circle-radius': ['step', ['get', 'point_count'], 20, 10, 30, 30, 40]
    }} />
    
    {/* Cluster count text */}
    <Layer id="cluster-count" type="symbol" filter={['has', 'point_count']} layout={{
      'text-field': ['get', 'point_count_abbreviated'],
      'text-size': 12
    }} />
    
    {/* Individual points (unclustered) */}
    <Layer id="unclustered-point" type="circle" filter={['!', ['has', 'point_count']]} paint={{
      'circle-color': ['match', ['get', 'type'], 'CAN', '#ef4444', 'CO', '#0068FF', '#888'],
      'circle-radius': 8,
      'circle-stroke-width': 2,
      'circle-stroke-color': '#fff'
    }} />
  </Source>
  ```

### 2. Fetch GeoJSON data
- [ ] Tạo hook `useMapData()` gọi `GET /api/map/geojson`
- [ ] Cache response, refresh mỗi 30 giây (background)

### 3. Click-to-zoom cho cluster
- [ ] Khi click cluster → `map.getSource('intents').getClusterExpansionZoom()` → flyTo

### 4. Giữ lại chế độ Radar
- [ ] viewMode === 'radar' vẫn dùng cơ chế cũ (dark theme + pulse dots)
- [ ] viewMode === 'map' dùng clustering mới

### 5. Data-driven styling cho unclustered points
- [ ] Màu theo type: CAN = đỏ, CO = xanh dương (#0068FF)
- [ ] Size theo giá: giá cao → điểm to hơn

## Files to Create/Modify
- `app/components/map/MapboxRenderer.tsx` — refactor toàn bộ Map mode
- `app/hooks/useMapData.ts` — [NEW] hook fetch GeoJSON
- `app/components/map/layers/ClusterLayer.tsx` — [NEW] cluster config (optional tách)

## Test Criteria
- [x] Bản đồ hiển thị cluster circles khi zoom xa
- [x] Cluster vỡ ra khi zoom gần
- [x] Click cluster → zoom in mượt mà (flyTo)
- [x] Vẫn giữ được chế độ Radar hoạt động

---
Next Phase: [Phase 03 - Choropleth](./phase-03-choropleth.md)
