# 💡 BRIEF: Tích hợp Bản đồ BĐS Thông Minh (Mapbox) - Can-co-tn

**Ngày tạo:** 2026-04-16
**Dự án:** Can-co-tn Web App

---

## 1. VẤN ĐỀ CẦN GIẢI QUYẾT
Người thuê/mua (Bên Cần) thiếu một công cụ trực quan để:
- Hình dung được khu vực mình nhắm tới thực tế đắt/rẻ ra sao (mặt bằng giá chung).
- Nhìn vị trí chính xác của từng căn nhà hiển thị trên bản đồ.
- Tương tác tìm kiếm nhà nhanh chóng, không muốn lướt list quá dài.

## 2. GIẢI PHÁP ĐỀ XUẤT
Tích hợp Bản đồ dựa trên công nghệ **Mapbox GL JS** áp dụng cơ chế "Zoom-driven detail" (Hiển thị chi tiết theo mức độ phóng to):
- **Khi Zoom ở mức Vùng/Thành phố:** Hiện bản đồ Choropleth (tô màu theo giá trị trung bình), người dùng sẽ thấy "Bản đồ nhiệt giá cả" của từng Quận/Huyện.
- **Khi Zoom ở mức Phố/Phường:** Lớp màu vùng sẽ nhường chỗ cho các Cluster (nhóm 10-20 căn nhà lân cận) và khi zoom sát nữa sẽ bung ra từng Ghim (Marker) vị trí chính xác.
- Tích hợp Popup tương tác: Khi click vào 1 điểm ghim, một mẩu tin BĐS nhỏ gọn sẽ hiện ra kèm nút "Quan tâm / Like" (nối thẳng luồng Khớp Nhanh).

## 3. ĐỐI TƯỢNG SỬ DỤNG
- **Người tìm kiếm (Bên Cần):** Lọc và tìm định vị nơi an cư lý tưởng theo túi tiền và vị trí.
- **Môi giới/Người cho thuê (Bên Có - Tương lai):** Khảo sát giá khu vực quanh BĐS của mình để định giá bán đúng.

## 4. TÍNH NĂNG MONG ĐỢI

### 🚀 MVP (Bắt buộc có trong phiên bản này):
- [ ] Tích hợp Core Mapbox GL JS hiển thị bản đồ mặc định tại Việt Nam.
- [ ] Lấy dữ liệu BĐS từ database (API cấp GeoJSON) để rải điểm lên bản đồ.
- [ ] Tính năng gom cụm (Clustering) khi số lượng điểm quá dày đặc.
- [ ] Popup hiển thị Card mini khi click vào một điểm nhà cụ thể.

### 🎁 Phase 2 (Độ phức tạp cao, xử lý hiển thị Heatmap vùng giá):
- [ ] Chuẩn bị tệp dữ liệu không gian ranh giới hành chính các Quận/Huyện của VN (GeoJSON boundaries).
- [ ] Giải thuật tính toán giá BĐS trung bình cho mỗi vùng để tô màu (Choropleth).
- [ ] Cơ chế ẩn/hiện Layer mượt mà dựa vào Mapbox Zoom Event.

## 5. ƯỚC TÍNH SƠ BỘ VỀ KỸ THUẬT
- **Độ phức tạp:** 🟡 **Trung Bình - Cao**. 
- **Rủi ro/Lưu ý:** 
  - Khó khăn lớn nhất ở Phase 2 là cần bộ dữ liệu ranh giới Quận/Huyện chuẩn (Polygon) để làm bản đồ nhiệt. 
  - Database hiện tại (Prisma) cần đảm bảo bảng `Intent` lưu kinh độ (longitude) và vĩ độ (latitude) hợp lệ cho mỗi bài post/intent để vẽ bản đồ được.

## 6. BƯỚC TIẾP THEO
→ Chạy `/plan` để lên thiết kế kỹ thuật chi tiết.
