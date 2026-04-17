# Plan: Bản đồ BĐS Thông Minh (Mapbox Smart Map)
Created: 2026-04-16T18:25:00+07:00
Status: 🟡 In Progress

## Overview
Nâng cấp trang bản đồ BĐS hiện có từ "demo với mock data + Markers đơn lẻ" thành "bản đồ thông minh production-ready" với 3 lớp hiển thị theo zoom level:
- **Zoom xa (tỉnh/thành):** Choropleth tô màu vùng giá trung bình theo Quận/Huyện
- **Zoom trung (phường/xã):** Cluster tự động nhóm các điểm BĐS lân cận
- **Zoom gần (đường phố):** Marker giá tiền từng bài đăng + Popup chi tiết + nút Like (Khớp Nhanh)

## 📊 Kết quả nghiên cứu codebase

### ✅ Đã có sẵn (KHÔNG cần cài thêm)
- `mapbox-gl@3.20.0` + `react-map-gl@8.1.0` → đã install
- `components/map/MapboxRenderer.tsx` → component bản đồ cơ bản (có bug TS)
- `components/map/MapPinDetailPanel.tsx` → panel chi tiết khi click
- `components/tabs/MapRadarTab.tsx` → wrapper tab bản đồ/radar
- Model `Intent` đã có fields `lat` (Decimal 10,8) và `lng` (Decimal 11,8)
- API `GET /api/intents` đã trả về `lat`, `lng` qua Prisma (nhưng chưa trả trong response JSON!)

### ⚠️ Vấn đề hiện tại cần fix
1. **Token hardcoded** trong MapboxRenderer.tsx (dòng 9) → chuyển vào `.env.local`
2. **TS Error** ở `MapboxRenderer.tsx:114,130` — `originalEvent` property không tồn tại
3. **API /api/intents** response KHÔNG trả `lat`/`lng` (thiếu trong enriched object, dòng 266-325)
4. **Data mock** – MapRadarTab dùng `useFeedData()` hook → hook gọi `/api/intents` thật nhưng type vẫn là `MockIntent` 
5. **Phần lớn intent chưa có tọa độ** (nhìn mock data: 8/12 có lat=null, lng=null)

## Tech Stack
- Frontend: Next.js 16 (App Router) + React 19 + Tailwind CSS v4
- Map: Mapbox GL JS 3.20 via react-map-gl 8.1
- Backend: Next.js API Routes + Prisma 7.6 + PostgreSQL
- Dữ liệu GeoJSON ranh giới VN: Nguồn mở từ GitHub (vietnam-geojson)

## Phases

| Phase | Name | Status | Tasks |
|-------|------|--------|-------|
| 01 | Fix Foundation & Data Pipeline | ⬜ Pending | 6 |
| 02 | GeoJSON Clustering (Source/Layer) | ⬜ Pending | 5 |
| 03 | Choropleth Vùng Giá | ⬜ Pending | 5 |
| 04 | Enhanced Popup & Like Integration | ⬜ Pending | 4 |
| 05 | Standalone Map Page + Polish | ⬜ Pending | 5 |
| 06 | Testing & Validation | ⬜ Pending | 4 |

**Tổng:** 29 tasks | Ước tính: 3-4 sessions

## Quick Commands
- Start Phase 1: `/code phase-01`
- Check progress: `/next`
- Save context: `/save-brain`
