# Phase 03: ORS Integration (Isochrone + POIs)
Status: ⬜ Pending
Dependencies: Phase 01

## Objective
Tích hợp OpenRouteService API (hoặc self-host) cho isochrone, POIs, và directions. Enhance LeafletIsoMap đã có trong v1-split.

## Implementation Steps

### ORS API Integration
1. [ ] Tạo `lib/services/ors.ts` — ORS API client
   - `getIsochrone(lat, lng, minutes, profile)` → GeoJSON polygon
   - `getPOIs(lat, lng, radiusMeters, categories)` → POI[]
   - `getDirections(from, to, profile)` → Route GeoJSON
   - Fallback: mock data khi không có API key

### Isochrone Enhancement
2. [ ] Upgrade `LeafletIsoMap.tsx` — dùng ORS client thay mock
   - Real road-following isochrone shapes
   - Cache isochrone results (localStorage, 1 hour TTL)

### POI Layer
3. [ ] Tạo `components/map/POILayer.tsx` — real POI markers
   - Categories: school, hospital, supermarket, park, restaurant
   - Toggle on/off by category
   - Click → popup with name + distance

### Detail Page Integration
4. [ ] Section "Tiện ích xung quanh" trong v1-split
   - Dùng ORS POIs API thay mock data
   - Hiển thị khoảng cách + thời gian đi bộ

### ORS Deployment (Future)
5. [ ] Docker Compose for self-host ORS
   - Download Vietnam OSM extract (~300MB từ Geofabrik)
   - Generate routing graph
   - Add to docker-compose.yml
6. [ ] Environment config
   - `NEXT_PUBLIC_ORS_API_KEY` — public API (prototype)
   - `ORS_SELF_HOST_URL` — self-host (production)

## Files to Create/Modify
- `lib/services/ors.ts` — [NEW] ORS API client
- `components/map/LeafletIsoMap.tsx` — [MODIFY] Real ORS integration
- `components/map/POILayer.tsx` — [NEW] POI overlay component
- `app/intent/[id]/v1-split/page.tsx` — [MODIFY] POI section
- `docker-compose.yml` — [MODIFY] Add ORS service

## Test Criteria
- [ ] Isochrone shapes follow real roads (not circles)
- [ ] POI markers show correct types and names
- [ ] POI distances are accurate
- [ ] Fallback works when ORS is unavailable
