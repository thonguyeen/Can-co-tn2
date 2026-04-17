# Phase 04: Enhanced Popup & Like Integration (Khớp Nhanh)
Status: ✅ Complete
Dependencies: Phase 02

## Objective
Khi click vào điểm BĐS trên bản đồ, hiện Popup card mini ngay tại chỗ (Mapbox Popup) hoặc slide panel. Card chứa thông tin chính + nút "Quan tâm ❤️" nối vào hệ thống Mutual Match (Swipe Like).

## Requirements

### Functional
- [x] Click điểm unclustered → hiện Popup/Panel chi tiết
- [x] Popup hiển thị: ảnh, title, giá, quận, type (CAN/CO), trust badge
- [x] Nút "Quan tâm" gọi `POST /api/swipe` để tạo SwipeLike
- [x] Hiệu ứng tim bay khi Like thành công (giống trang /swipe)
- [x] Nếu Mutual Match → hiện MutualMatchPopup

### Non-Functional
- [x] Popup load ảnh lazy
- [x] Animation mượt 60fps

## Implementation Steps

### 1. Tạo MapPopupCard component
- [x] File `components/map/MapPopupCard.tsx`
- [x] Hiển thị compact card (200x280px):
  - Ảnh BĐS (hoặc placeholder gradient)
  - Title (1 dòng truncated)
  - Giá (format Việt: "3.5 tỷ" / "15 tr/th")
  - Type badge: CAN (đỏ) / CÓ (xanh)
  - Trust badge (nếu ≥ 4)
  - Nút [❤️ Quan tâm] + [📍 Chỉ đường]

### 2. Xử lý click event trên Layer
- [x] Dùng handleMapClick trong MapboxRenderer (đã có từ Phase 02)
- [x] Lấy feature properties → hiện MapPopupCard qua onPinClick callback

### 3. Tích hợp Like (Khớp Nhanh)
- [x] Call `POST /api/swipe` với action: 'LIKE'
- [x] Handle isMutualMatch response
- [x] Xử lý user chưa đăng nhập → redirect login

### 4. Visual feedback
- [x] Heart animation (8 particles bay lên) khi Like
- [x] Button state: idle → loading → liked
- [x] Mutual Match popup reuse từ `components/swipe/MutualMatchPopup.tsx`
- [x] AnimatePresence để animate in/out MutualMatchPopup

## Files Created/Modified
- `app/components/map/MapPopupCard.tsx` — [NEW] Popup card component
- `app/components/tabs/MapRadarTab.tsx` — [MODIFIED] Tích hợp MapPopupCard + matchState

## Test Criteria
- [x] Click điểm trên bản đồ → hiện popup đúng thông tin
- [x] Click "Quan tâm" → POST thành công, hiệu ứng tim
- [x] Mutual Match → popup celebration hiện lên
- [x] User chưa login → redirect đúng

---
Next Phase: [Phase 05 - Standalone Page](./phase-05-standalone-page.md)
