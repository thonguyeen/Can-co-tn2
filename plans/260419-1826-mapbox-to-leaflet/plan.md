# Plan: Mapbox → Leaflet + Self-Host ORS Migration
Created: 2026-04-19T18:26
Status: 🟡 Planning

## Overview
Chuyển toàn bộ hệ thống map từ **Mapbox GL** (trả phí) sang **Leaflet + CartoDB tiles** (miễn phí) + **OpenRouteService self-host** (isochrone, directions, POIs). Mục tiêu: $0 chi phí map khi scale lên vài chục triệu user.

## Scope — 3 Files Chính Cần Migrate

| File | Chức năng | Độ phức tạp |
|------|-----------|-------------|
| `components/map/MapboxRenderer.tsx` (449 lines) | Clusters, choropleth, markers, pin click | 🔴 Cao |
| `components/tabs/MapRadarTab.tsx` | Consumes MapboxRenderer | 🟡 TB |
| `app/(main)/map/page.tsx` | Standalone map page | 🟢 Thấp |

> ✅ `v1-split/page.tsx` — Đã migrated (LeafletIsoMap prototype hoạt động)

## Tech Stack Mới
- **Map rendering**: Leaflet + react-leaflet
- **Tiles**: CartoDB Dark Matter (dark) / Positron (light) — miễn phí
- **Isochrone**: OpenRouteService (self-host Docker)
- **POIs**: openpoiservice (self-host)
- **Geocoding**: Nominatim (self-host hoặc public API)
- **Choropleth**: Leaflet GeoJSON layer (thay Mapbox fill layer)

## Chi phí so sánh

| Hạng mục | Mapbox (10M MAU) | Leaflet+ORS |
|----------|-------------------|-------------|
| Map tiles | ~$250,000/tháng | $0 |
| Isochrone | N/A | $0 (self-host) |
| POIs | N/A | $0 (self-host) |
| ORS Docker VPS | N/A | ~$20/tháng |
| **Tổng** | **~$250,000/tháng** | **~$20/tháng** |

## Phases

| Phase | Name | Status | Tasks |
|-------|------|--------|-------|
| 01 | LeafletRenderer — Core Map | ⬜ Pending | 8 |
| 02 | Choropleth + Ward Layer | ⬜ Pending | 5 |
| 03 | ORS Integration (Isochrone + POIs) | ⬜ Pending | 6 |
| 04 | Cleanup + Testing | ⬜ Pending | 5 |

**Tổng:** 24 tasks | Ước tính: 2-3 sessions

## Quick Commands
- Start Phase 1: `/code phase-01`
- Check progress: `/next`
- Save context: `/save-brain`
