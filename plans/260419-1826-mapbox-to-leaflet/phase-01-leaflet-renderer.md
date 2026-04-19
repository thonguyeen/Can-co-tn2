# Phase 01: LeafletRenderer — Core Map Component
Status: ⬜ Pending
Dependencies: None (leaflet already installed)

## Objective
Tạo `LeafletRenderer.tsx` thay thế `MapboxRenderer.tsx` — render interactive map với intent pins, clusters, và pin click handler.

## Implementation Steps

### Setup
1. [ ] Tạo `components/map/LeafletRenderer.tsx` — core component
   - CartoDB Dark Matter tiles (dark mode) / Positron (light mode)
   - Zoom controls, attribution
   - Same props interface as MapboxRenderer

### Markers & Clusters
2. [ ] Implement intent pin markers (violet dots cho CÓ, rose dots cho CẦN)
3. [ ] Implement marker clustering với `leaflet.markercluster`
   - Install: `npm install @changey/react-leaflet-markercluster leaflet.markercluster`
   - Cluster circle styling match current design (blue gradient)
4. [ ] Pin click handler → trigger `onPinClick(pin, distance)`

### Map Interactions
5. [ ] User location marker (blue pulsing dot)
6. [ ] Fly-to animation khi chọn pin
7. [ ] Selected pin highlight state

### Integration
8. [ ] Replace `MapboxRenderer` import trong `MapRadarTab.tsx` và `app/(main)/map/page.tsx`

## Files to Create/Modify
- `components/map/LeafletRenderer.tsx` — [NEW] Core Leaflet map component
- `components/tabs/MapRadarTab.tsx` — [MODIFY] Import switch
- `app/(main)/map/page.tsx` — [MODIFY] Import switch

## Test Criteria
- [ ] Map renders dark tiles without token
- [ ] Intent pins display correctly
- [ ] Clusters form and expand on click
- [ ] Pin click opens detail panel
- [ ] User location dot shows
