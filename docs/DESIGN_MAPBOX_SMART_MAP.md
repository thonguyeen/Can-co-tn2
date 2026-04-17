# 🎨 DESIGN: Bản đồ BĐS Thông Minh (Mapbox Smart Map)

Ngày tạo: 2026-04-16
Dựa trên: [SPECS](../docs/specs/mapbox-smart-map_spec.md) | [Plan](../plans/260416-1825-mapbox-smart-map/plan.md)

---

## 1. Database — KHÔNG CẦN MIGRATION

Bảng `Intent` đã có sẵn `lat` (Decimal 10,8) và `lng` (Decimal 11,8).
Bảng `SwipeLike` đã có sẵn — reuse cho nút Like trên bản đồ.

**Chỉ cần fix:** API `/api/intents` response thêm 2 fields `lat`, `lng` (hiện thiếu).

---

## 2. API Endpoints

### 2.1. FIX: GET /api/intents (dòng ~266-325 trong route.ts)
Thêm vào enriched object:
```ts
lat: intent.lat ? Number(intent.lat) : null,
lng: intent.lng ? Number(intent.lng) : null,
```

### 2.2. NEW: GET /api/map/geojson
- File: `app/api/map/geojson/route.ts`
- Params: `?type=CAN|CO &district=X &priceMin=X &priceMax=X` (optional)
- Query: Intent WHERE lat != null AND lng != null AND status = 'active'
- Response: GeoJSON FeatureCollection
- Include: IntentImage (ảnh đầu, displayOrder=0), Profile (tên user)

### 2.3. NEW: GET /api/map/district-prices
- File: `app/api/map/district-prices/route.ts`
- Query: Raw SQL GROUP BY district, AVG(COALESCE(price, price_min))
- Response: `{ districts: { "Quận 7": { avgPrice: N, count: N } } }`
- Cache: revalidate 5 phút

---

## 3. Component Architecture

```
app/map/page.tsx
├── MapFilterPanel.tsx        [NEW] Sidebar filter (type, district, price, verified)
├── MapboxRenderer.tsx        [REFACTOR] 3-layer system
│   ├── Choropleth Layer      (zoom < 12) fill + label
│   ├── Cluster Layer         (zoom 12-15) circle + count
│   └── Point Layer           (zoom > 15) circle + price bubble
├── MapPopupCard.tsx          [NEW] Click pin → compact card + Like button
├── MapLegend.tsx             [NEW] Thang màu + icon legend
└── MutualMatchPopup.tsx      [REUSE] từ components/swipe/

hooks/useMapData.ts           [NEW] Fetch GeoJSON + district prices
```

### Component Props Flow:
```
page.tsx (state: filters)
  → useMapData(filters) → { geojson, districtPrices, isLoading }
  → MapFilterPanel(filters, onFilterChange)
  → MapboxRenderer(geojson, districtPrices, onPinClick)
       → onPinClick(feature) → setState(selectedFeature)
       → MapPopupCard(selectedFeature, onLike, onClose)
            → onLike(intentId) → POST /api/swipe
```

---

## 4. Luồng Hoạt Động

### Flow 1: Zoom xa → gần
1. Mở /map → Choropleth vùng giá HCM
2. Zoom vào Q7 → Choropleth mờ, cluster hiện
3. Zoom sát → Cluster vỡ, pin giá hiện
4. Click pin → Popup card
5. Click ❤️ → Like / Mutual Match

### Flow 2: Filter cụ thể
1. Sidebar chọn CÓ + Q7 + 3-5 tỷ
2. Bản đồ flyTo Q7, chỉ hiện pin xanh 3-5 tỷ
3. Click pin → popup → Like

### Flow 3: User chưa login
1. Xem bản đồ tự do (không cần auth)
2. Click ❤️ → redirect /auth/login
3. Login xong → quay lại /map

---

## 5. Zoom Level Transitions

| Zoom | Layer hiện | Layer ẩn | Ghi chú |
|------|-----------|---------|---------|
| 5-11 | Choropleth (opacity 0.6) | Cluster, Point | Nhìn cả miền Nam |
| 12   | Choropleth (opacity 0.3) + Cluster | Point | Chuyển tiếp |
| 13   | Cluster | Choropleth (opacity 0) | Nhìn cấp quận |
| 14   | Cluster (đang vỡ) | Choropleth | Chuyển tiếp |
| 15+  | Point (pin giá) | Cluster, Choropleth | Nhìn cấp đường |

---

## 6. Design System (đồng bộ homepage)

- Background: `bg-gray-50`
- Sidebar: `bg-white border-r border-gray-200 shadow-sm`
- Active filter: `bg-blue-50 text-[#0068FF] font-bold`
- Pin CAN: `#ef4444` (đỏ)
- Pin CO: `#0068FF` (xanh brand)
- Choropleth: `#d1fae5 → #fef08a → #fca5a5 → #dc2626`
- Popup card: `bg-white rounded-2xl shadow-lg`
- Font: hệ thống (Inter/system)

---

## 7. External Data: GeoJSON Ranh giới Quận/Huyện

- Nguồn: github.com daohoangson/dvhcvn hoặc tương đương
- Lọc: Chỉ Quận/Huyện TP.HCM (~22 polygons)
- Simplify: < 500KB
- Lưu: `public/geojson/hcm-districts.geojson`
- Properties cần: `name` (tên quận), `code` (mã hành chính)

---

## 8. Checklist Kiểm Tra

### API
- [ ] GET /api/map/geojson trả đúng GeoJSON format
- [ ] GET /api/map/district-prices tính đúng AVG
- [ ] Filter params hoạt động
- [ ] Intent null lat/lng không xuất hiện

### UI
- [ ] Bản đồ load < 3s
- [ ] Choropleth hiện đúng thang màu
- [ ] Cluster → zoom → vỡ ra pin
- [ ] Click pin → popup card đúng data
- [ ] Like → tim bay → response OK
- [ ] Mutual Match → popup celebration
- [ ] Mobile responsive (bottom sheet filter)

### Edge Cases
- [ ] 0 intent có tọa độ → bản đồ trống, hiện message
- [ ] Quận không có data → xám nhạt
- [ ] User chưa login + Like → redirect login
- [ ] 1000+ điểm → FPS ổn định

---

## 9. Test Cases

| TC | Mô tả | Given | When | Then |
|----|-------|-------|------|------|
| 01 | GeoJSON format | 5 intent có tọa độ, 3 null | GET /api/map/geojson | features.length=5, valid GeoJSON |
| 02 | District AVG | Q7: 3tỷ + 5tỷ | GET /api/map/district-prices | Q7.avgPrice=4tỷ, count=2 |
| 03 | Filter type | 10 CẦN, 5 CÓ | GET ?type=CO | features.length=5, all CO |
| 04 | Like từ map | User login, click pin | Click ❤️ | POST /api/swipe 200, SwipeLike created |
| 05 | No coords | Intent lat=null | GET /api/map/geojson | Không có trong features |
| 06 | Not logged in | Guest click Like | Click ❤️ | Redirect /auth/login |

---

*Tạo bởi AWF 4.0 - Design Phase*
