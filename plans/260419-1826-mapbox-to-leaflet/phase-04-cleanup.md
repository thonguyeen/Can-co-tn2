# Phase 04: Cleanup + Testing
Status: ⬜ Pending
Dependencies: Phase 01, 02, 03

## Objective
Xóa Mapbox dependencies, cleanup code, và kiểm tra toàn bộ app.

## Implementation Steps

### Cleanup
1. [ ] Xóa `components/map/MapboxRenderer.tsx`
2. [ ] Xóa dead code `MapEmbed` function trong v1-split
3. [ ] `npm uninstall mapbox-gl react-map-gl`
4. [ ] Xóa `NEXT_PUBLIC_MAPBOX_TOKEN` khỏi `.env`, `.env.example`

### Testing
5. [ ] Smoke test tất cả routes:
   - `/` — Feed tab (không liên quan map, verify không break)
   - `/intent/[id]` — LeafletIsoMap renders OK
   - Map tab — LeafletRenderer clusters + pins
   - Map tab radar mode — Choropleth renders OK

## Files to Delete
- `components/map/MapboxRenderer.tsx` — [DELETE]

## Files to Modify
- `app/intent/[id]/v1-split/page.tsx` — [MODIFY] Remove MapEmbed dead code
- `package.json` — [MODIFY] Remove mapbox-gl, react-map-gl
- `.env`, `.env.example` — [MODIFY] Remove MAPBOX_TOKEN

## Test Criteria
- [ ] `npm run build` passes without mapbox imports
- [ ] No `MAPBOX_TOKEN` references in codebase
- [ ] All map features work with Leaflet
- [ ] Bundle size decreased (verify with `npm run build`)
