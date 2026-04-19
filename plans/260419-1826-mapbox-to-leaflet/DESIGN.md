# 🎨 DESIGN: Mapbox → Leaflet + ORS Migration

Ngày tạo: 2026-04-19
Dựa trên: `plans/260419-1826-mapbox-to-leaflet/plan.md`

---

## 1. Kiến Trúc Component Mới

### Sơ đồ thay thế

```
TRƯỚC (Mapbox):                    SAU (Leaflet):
─────────────────────              ──────────────────────────────
MapRadarTab.tsx                    MapRadarTab.tsx (ít thay đổi)
  └── MapboxRenderer.tsx             └── LeafletRenderer.tsx  ← NEW
       ├── react-map-gl/mapbox            ├── react-leaflet
       ├── mapbox-gl (CSS)               ├── CartoDB tiles
       ├── Source + Layer (GPU)          ├── MarkerClusterGroup
       └── $250K/tháng @10M             └── $0

v1-split/page.tsx                  v1-split/page.tsx (đã done ✅)
  └── MapEmbed (static img)          └── LeafletIsoMap.tsx
       └── Mapbox Static API               ├── CartoDB Dark tiles
            └── $1/1000 calls              ├── Isochrone polygons
                                           └── POI emoji markers
```

---

## 2. Interface Mới: `LeafletRenderer`

**ĐÃ QUYẾT ĐỊNH:** Keep đúng props interface của MapboxRenderer để `MapRadarTab.tsx` thay 1 dòng import là xong.

```typescript
// components/map/LeafletRenderer.tsx
interface LeafletRendererProps {
  viewMode: 'map' | 'radar';
  userLocation: { lat: number; lng: number } | null;
  intents: MockIntent[];
  onPinClick: (pin: MapFeatureProperties, distance: string) => void;
  selectedPinId: string | null;
  filters?: MapFilters;
}
```

**Thay đổi duy nhất tại MapRadarTab.tsx:**
```diff
- import MapboxRenderer from '../map/MapboxRenderer';
+ import LeafletRenderer from '../map/LeafletRenderer';
...
- <MapboxRenderer
+ <LeafletRenderer
```

---

## 3. Mapping: Mapbox Layers → Leaflet Equivalents

### 3.1 Tile Style

| Mapbox | Leaflet (CartoDB) |
|--------|-------------------|
| `mapbox://styles/mapbox/dark-v11` | `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png` |
| `mapbox://styles/mapbox/light-v11` | `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png` |

### 3.2 Intent Pins

| Tính năng | Mapbox | Leaflet |
|-----------|--------|---------|
| Clustering | `Source cluster={true}` + `clusterLayerStyle` | `react-leaflet-markercluster` + `MarkerClusterGroup` |
| Cluster count label | `clusterCountLayerStyle` (symbol layer) | `L.divIcon` custom HTML |
| Cluster color (by count) | `circle-color step` expression | CSS className theo `clusterCount` |
| Pin color (CAN/CO) | `match get type` paint | `divIcon` CSS class: `co-pin` / `can-pin` |
| Pin size (by price) | `circle-radius case coalesce` | divIcon size class: `sm` / `md` / `lg` |
| Expand cluster on click | `getClusterExpansionZoom` | `onClusterClick` built-in MarkerClusterGroup |
| Unclustered pin click | `queryRenderedFeatures` | `marker.on('click', ...)` |

**Color scheme giữ nguyên:**
- CAN (cần tìm): `#ef4444` (rose-500)
- CO (đang bán): `#0068FF` (blue)
- Cluster <10: `#60a5fa` | 10-30: `#3b82f6` | >30: `#1d4ed8`

### 3.3 Choropleth Ward Layer

| Tính năng | Mapbox | Leaflet |
|-----------|--------|---------|
| GeoJSON load | `<Source type="geojson">` | `L.geoJSON(data)` |
| Fill color by avgPrice | `fill-color interpolate linear` | `style` callback với `chroma.js` scale |
| Fill opacity by zoom | `fill-opacity interpolate zoom` | `map.on('zoom', updateOpacity)` |
| Ward border | `fill-outline-color interpolate` | Separate GeoJSON `weight` + `opacity` |
| Ward label | `symbol text-field concat` | `L.tooltip({ permanent: true })` |
| Data join (prices) | `setBoundaryGeojson` + `useMemo` | Giữ nguyên logic — chỉ đổi render |

> ⚠️ **Quan trọng:** Logic `choroplethGeojson = useMemo(...)` và `useWardPrices()` hook **giữ nguyên hoàn toàn**. Chỉ thay phần render.

### 3.4 Radar Mode

| Tính năng | Mapbox | Leaflet |
|-----------|--------|---------|
| Pin markers | `<Marker>` từ react-map-gl | `L.marker()` với `L.divIcon` |
| Pulse animation | Tailwind `animate-pulse` div | Tailwind class trong divIcon HTML |
| Radar overlay | Absolute div trên map | Leaflet Pane hoặc absolute div |
| Fly-to user | Tự động | `map.setView([lat, lng])` |

### 3.5 User Location Dot

| Mapbox | Leaflet |
|--------|---------|
| `<Marker anchor="center">` + animated div | `L.circleMarker()` hoặc `L.divIcon` với ping animation |

---

## 4. Cấu Trúc File Mới

```
components/map/
├── LeafletRenderer.tsx      ← [NEW] Thay MapboxRenderer
├── LeafletIsoMap.tsx        ← [DONE ✅] Detail page map + isochrone  
├── MapboxRenderer.tsx       ← [DELETE sau phase 04]
├── MapLegend.tsx            ← [KEEP] Không đổi
├── MapPopupCard.tsx         ← [KEEP] Không đổi
└── POILayer.tsx             ← [NEW phase 03] POI overlay

lib/services/
└── ors.ts                   ← [NEW phase 03] ORS API client

types/
└── map.ts                   ← [KEEP] Không đổi (MapFeatureProperties...)
```

---

## 5. Dependency Changes

```json
// package.json — THÊM:
"@changey/react-leaflet-markercluster": "^4.x",
"leaflet.markercluster": "^1.5.x",
"chroma-js": "^2.x"       // color interpolation (choropleth)

// package.json — XÓA (phase 04):
"mapbox-gl": "^3.x",
"react-map-gl": "^7.x"
```

> **Tại sao `chroma-js`?** Mapbox dùng expression engine GPU-side cho color interpolation. Leaflet cần tính client-side. `chroma.scale()` là library nhỏ nhất cho việc này (~25KB).

---

## 6. ORS API Client Design

```typescript
// lib/services/ors.ts

const ORS_BASE = process.env.NEXT_PUBLIC_ORS_SELF_HOST_URL    // Self-host (prod)
             || 'https://api.openrouteservice.org/v2';         // Public API (dev)

export async function getIsochrone(
  lat: number, lng: number,
  minutesList: number[],        // [5, 15, 30]
  profile: 'driving-car' | 'foot-walking' = 'driving-car'
): Promise<GeoJSON.FeatureCollection | null>

export async function getPOIs(
  lat: number, lng: number,
  radiusMeters: number,
  categories: string[]          // ['education', 'health', 'shopping']
): Promise<POIFeature[]>

export async function getDirections(
  from: [number, number],       // [lng, lat]
  to: [number, number],
  profile: string
): Promise<GeoJSON.Feature | null>
```

**Fallback strategy:**
```
1. Try self-host ORS (nhanh, không limit)
2. Try public ORS API (500 req/day free)
3. Return mock data (vẫn hiện UI)
```

---

## 7. Environment Variables

```env
# .env.example — THÊM:
NEXT_PUBLIC_ORS_API_KEY=         # ORS public API key (dev, optional)
ORS_SELF_HOST_URL=               # Self-host ORS (prod): http://localhost:8080

# .env.example — XÓA (phase 04):
NEXT_PUBLIC_MAPBOX_TOKEN=
```

---

## 8. Docker Compose — ORS Service

```yaml
# docker-compose.yml — thêm service:
services:
  openrouteservice:
    image: openrouteservice/openrouteservice:v8.x
    container_name: ors
    ports:
      - "8080:8080"
    volumes:
      - ./ors-docker/config:/home/ors/config
      - ./ors-docker/files:/home/ors/files        # OSM extract Vietnam
      - ./ors-docker/graphs:/home/ors/graphs       # Routing graph (300MB+)
    environment:
      ORS_CONFIG_LOCATION: /home/ors/config/ors-config.yml
    restart: unless-stopped
```

**Cài đặt VN data:**
```bash
# 1. Download OSM extract Vietnam (~300MB):
curl -o ors-docker/files/vietnam.osm.pbf \
  https://download.geofabrik.de/asia/vietnam-latest.osm.pbf

# 2. Start ORS (graph build: ~10 phút lần đầu):
docker compose up openrouteservice -d
```

---

## 9. Acceptance Criteria (Phase by Phase)

### Phase 01 ✅ Done when:
- [ ] `/map` route load = dark CartoDB tiles (không cần MAPBOX_TOKEN)
- [ ] Intent pins hiển thị: rose (CAN) / blue (CO)
- [ ] Click pin → `onPinClick` callback trigger → MapPopupCard mở
- [ ] Cluster tụ lại đúng, số đếm hiển thị
- [ ] Click cluster → zoom flyTo để tách cluster
- [ ] User location dot hiển thị với pulse animation

### Phase 02 ✅ Done when:
- [ ] Choropleth colors đúng theo avgPrice range (mint → đỏ)
- [ ] Ward labels hiển thị tên + priceLabel (`~4.2 tỷ`)
- [ ] Fill opacity fade theo zoom (ẩn khi zoom >15)
- [ ] Toggle radar/map smooth không flicker

### Phase 03 ✅ Done when:
- [ ] `ors.ts` gọi được public ORS API (fallback mock nếu không có key)
- [ ] `LeafletIsoMap` vẽ isochrone hình road-following (không phải tròn)
- [ ] POI markers hiển thị trong `LeafletIsoMap` từ ORS
- [ ] `docker compose up openrouteservice` chạy local thành công

### Phase 04 ✅ Done when:
- [ ] `npm run build` pass, không có `mapbox`/`react-map-gl` import
- [ ] Bundle size report: mapbox-gl removed (~900KB gzip savings)
- [ ] Không còn `NEXT_PUBLIC_MAPBOX_TOKEN` trong codebase

---

*Tạo bởi AWF Design Phase — 2026-04-19*
