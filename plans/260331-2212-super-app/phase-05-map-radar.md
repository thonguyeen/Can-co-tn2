# Phase 05: Global Map & Radar AI
Status: ⬜ Pending
Dependencies: Phase 04

## Objective
Triển khai giao diện Bản đồ thực tế (Map Mode) và Quét Radar (Radar Mode) theo phong cách hiện đại (như màn hình mẫu `homepage1.tmp`), yêu cầu truy cập GPS để lấy toạ độ và hiển thị các điểm tin đăng dưới dạng Custom Marker (giá tiền màu sắc).

## Requirements
### Functional
- [ ] Tích hợp lib mapbox/leaflet.
- [ ] Component chính có nút toggle giữa 'map' mặc định và 'radar' sci-fi.
- [ ] Yêu cầu cấp quyền truy cập vị trí (GPS) ngay khi vào tab. Xử lý Fallback.
- [ ] Hiển thị thông tin BĐS (tin CẦN / CÓ) dưới dạng Custom Marker ghi giá.
- [ ] Hiệu ứng quét liên tục và pin nhấp nháy cho Radar Mode.
- [ ] Panel hiển thị chi tiết cho một điểm Marker khi được click.

### Non-Functional
- [ ] Performance: Cải thiện WebGL rendering, không giật lag khi kéo map.
- [ ] Responsive: Bản Mobile slide-up bottom sheet, Bản Desktop side tab slide-in.

## Implementation Steps
1. [ ] Step 1 - Define mock data và hook/state quản lý GPS + Mode.
2. [ ] Step 2 - Install dependency (`react-map-gl`, mapbox).
3. [ ] Step 3 - Cấu trúc `MapRadarTab.tsx` với 2 chế độ hiển thị Map và Radar.
4. [ ] Step 4 - Xây dựng Custom Markers (Giá tiền đính kèm theo Location).
5. [ ] Step 5 - Xây dựng `MapPinDetailPanel.tsx` hiển thị tooltip thông tin và match status.

## Files to Create/Modify
- `d:\SW\Can-co-tn\app\components\tabs\MapRadarTab.tsx` - Layout & Toggle Mode.
- `d:\SW\Can-co-tn\app\components\map\MapboxRenderer.tsx` - Map Container + Style Overlay.
- `d:\SW\Can-co-tn\app\components\map\MapPinDetailPanel.tsx` - Chi tiết Location click (Slide up/in).

## Test Criteria
- [ ] Cho phép định vị đúng vị trí hoặc rơi vào Default Center (Fallback).
- [ ] Chọn Radar Mode xuất hiện animation spinner quét đẹp mắt.

## Notes
Token cho Mapbox sẽ được hardcode tạm bằng token public trong quá trình dev để đảm bảo render nhanh.

---
Next Phase: N/A
