# Phase 06: Testing & Validation
Status: ⬜ Pending
Dependencies: Phase 05

## Objective
Kiểm tra toàn bộ chức năng bản đồ end-to-end: từ API data → render → interaction → Like flow.

## Requirements
- [x] API test: GeoJSON endpoint trả đúng format
- [x] API test: District-prices trả dữ liệu hợp lệ
- [ ] UI test: Bản đồ render không lỗi console
- [ ] E2E test: Click pin → popup → Like → response

## Implementation Steps

### 1. Test API endpoints
- [x] Tạo script `scripts/test-map-api.ts`
- [x] Test `GET /api/map/geojson` → validate GeoJSON schema
- [x] Test `GET /api/map/district-prices` → validate district data

### 2. Browser test
- [ ] Mở `/map` → verify bản đồ load thành công
- [ ] Zoom in/out → verify cluster ↔ marker transitions
- [ ] Click pin → verify popup hiển thị đúng
- [ ] Click "Quan tâm" → verify Like flow

### 3. Edge cases
- [ ] Intent không có lat/lng → không hiện trên bản đồ (không crash)
- [ ] Quận không có data → choropleth hiện màu mặc định (xám)
- [ ] User chưa login click Like → redirect login page

### 4. Performance check
- [ ] Load 500+ điểm → FPS vẫn ổn định
- [ ] Choropleth layer không flicker khi zoom

## Files to Create/Modify
- `app/scripts/test-map-api.ts` — [NEW] API test script

## Test Criteria
- [ ] Tất cả API tests pass
- [ ] Không có console error khi dùng bản đồ
- [ ] Like flow hoạt động end-to-end
- [ ] Performance acceptable với dataset thực

---
🎉 Hoàn thành tính năng Bản đồ BĐS Thông Minh!
