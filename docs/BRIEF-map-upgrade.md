# 💡 BRIEF: Nâng cấp tính năng Bản đồ — Cần & Có

**Ngày tạo:** 2026-04-26  
**Stack hiện tại:** Leaflet + ORS (đã có sẵn)

---

## 🔍 Hiện trạng (Đã có)

| Component | Tình trạng | Ghi chú |
|-----------|-----------|---------|
| `LeafletIsoMap` | ✅ Có | ORS Isochrone 5/15/30 phút, POI từ ORS |
| `MapRadarTab` | ✅ Có | Map + Radar mode, GPS, pin click popup |
| `MapFilterPanel` | ✅ Có | Bộ lọc trên map |
| `MapPopupCard` | ✅ Có | Card chi tiết intent khi click pin |
| `LeafletRenderer` | ✅ Có | Renderer chính với cluster |
| ORS API (`lib/services/ors`) | ✅ Có | Isochrone + POI |

**Điểm mạnh hiện tại:**
- Đã có nền tảng Leaflet + ORS hoàn chỉnh
- `LeafletIsoMap` đã có isochrone 3 mức + POI layer
- Chỉ cần **tích hợp sâu hơn**, không cần xây từ đầu

---

## 🎯 Vấn đề cần giải quyết

Hiện tại map chỉ hiển thị **intent pins** (cần/có BĐS).  
Người dùng **chưa thể** biết:
- Lô đất đó **gần những tiện ích nào**?
- Từ đây đến trường/bệnh viện **mất bao lâu**?
- **Vùng 5-10-15 phút** xung quanh lô đất có gì?

---

## 🚀 Tính năng đề xuất theo giai đoạn

### Phase 1 — MVP (Tích hợp ngay, 1–2 tuần)

| Tính năng | Mô tả | Tool |
|-----------|-------|------|
| **Isochrone trên popup chi tiết** | Khi click vào intent pin → hiện vùng 5/15/30 phút xung quanh | `LeafletIsoMap` (đã có) |
| **POI xung quanh intent** | Hiển thị trường, bệnh viện, chợ gần lô đất | ORS POI API (đã có) |
| **Khoảng cách từ user → pin** | "Cách bạn 2.3 km" đã có, thêm "~8 phút xe máy" | ORS Directions |
| **Tích hợp LeafletIsoMap vào popup** | Embed map nhỏ trong `MapPopupCard` hoặc trang chi tiết | Component sẵn có |

### Phase 2 — Nâng cao (2–4 tuần)

| Tính năng | Mô tả | Tool |
|-----------|-------|------|
| **Database tiện ích riêng** | Lưu sẵn trường/bệnh viện/chợ VN — không phụ thuộc OSM | Prisma DB |
| **Matrix distance** | So sánh khoảng cách/thời gian từ 1 điểm đến nhiều tiện ích | ORS Matrix API |
| **Bộ lọc tiện ích** | Filter: "Gần trường học", "Trong 10 phút đến bệnh viện" | Map filter |
| **Điểm số vị trí** | Chấm điểm 1-10 dựa trên tiện ích, giao thông, quy hoạch | Custom algorithm |

### Phase 3 — Premium (4+ tuần)

| Tính năng | Mô tả |
|-----------|-------|
| **So sánh 2 lô đất** | Hiển thị isochrone 2 điểm cạnh nhau |
| **Tìm lô đất theo vùng tiếp cận** | "Tìm nhà trong 15 phút từ Nguyễn Tri Phương" |
| **Heatmap giá** | Hiển thị mật độ/giá theo khu vực |

---

## ⚙️ Đánh giá kỹ thuật

| Hạng mục | Chi tiết |
|---------|---------|
| **ORS API key** | Đã có `NEXT_PUBLIC_ORS_API_KEY` trong env |
| **Free tier ORS** | 500 req/ngày — đủ cho MVP, cần upgrade khi scale |
| **Dữ liệu POI VN** | OSM có thể thiếu → Phase 2 cần build database riêng |
| **Hiệu năng** | Isochrone call ~1-2s → cần lazy load, chỉ gọi khi mở popup |

---

## ⚠️ Rủi ro

- **ORS POI data VN không đồng đều** → Phase 1 dùng ORS trước, Phase 2 build DB riêng
- **Gọi ORS mỗi lần click pin** → cần cache hoặc giới hạn call
- **Mobile performance** → Polygon isochrone phức tạp có thể lag trên mobile yếu

---

## 📍 Điểm khác biệt so với đối thủ

| Website BĐS thông thường | Can & Có (sau upgrade) |
|--------------------------|----------------------|
| Chỉ hiện marker trên map | Isochrone 5/15/30 phút |
| Không có tiện ích xung quanh | POI + khoảng cách thật |
| Không tính thời gian đi lại | ORS Directions thực tế |
| Phụ thuộc Google Maps (tốn phí) | OpenStreetMap + ORS (mã nguồn mở) |

---

## ✅ Bước tiếp theo

→ Gõ `/plan` để lên implementation plan chi tiết cho **Phase 1**
