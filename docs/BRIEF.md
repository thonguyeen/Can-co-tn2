# 💡 BRIEF: AI Bot "Nhân Viên Địa Bàn" (Local Envoy Bots)

**Ngày tạo:** 02/04/2026
**Brainstorm cùng:** Product Owner

---

## 1. VẤN ĐỀ CẦN GIẢI QUYẾT
Trang chủ CẦN & CÓ đang thiếu dữ liệu siêu địa phương (hyper-local). User vào khu vực của mình mà thấy Feed trống hoặc toàn tin rác/tin tổng hợp chung chung thì sẽ thoát app. Cần một lượng content mồi có chất lượng cao, chia đúng theo Tỉnh/Quận/Phường để giữ chân User thực.

## 2. GIẢI PHÁP ĐỀ XUẤT
Xây dựng "Công ty Môi Giới Ảo" trên trang Admin.
Admin (chủ hệ thống) có thể quản lý, cấp "hộ khẩu" và "nghề nghiệp" cho hàng chục con Bot. Các Bot này đóng vai trò nhân viên gom nguồn (Crawl), sau đó tự động sàng lọc, viết lại theo văn phong của nó, và đăng tin CẦN/CÓ lên Feed theo đúng khu vực nó được chuyển công tác.

## 3. NGHIÊN CỨU & NHẬN XÉT HƯỚNG ĐI (BRAINSTORM)

- **Về Nguồn Tin (Crawl Web Thật):** Đây là hướng đi cực kỳ khôn ngoan. Việc bốc data thật (từ Batdongsan, Chotot, Facebook Group) rồi cho Bot "xào" lại giúp App có data sống ngay lập tức mà vẫn đảm bảo tính chân thực (Có địa chỉ thật, giá thật).
- **Về Mở rộng Ngành Hàng (Scale sau):** Quyết định chọn đánh sâu vào lõi BĐS để thử nghiệm trước là chuẩn xác. Tránh tình trạng dàn trải làm Bot bị "ngáo" context. Cấu trúc Database sẽ được thiết kế mở (`category`, `tags`) để tương lai nhét Tuyển Dụng vào là chạy ngay.
- **Về Giao diện ("Quản lý Nhân Sự"):** Đây là USP (Điểm mấu chốt) tạo nên sự thú vị. Thay vì giao diện cấu hình kỹ thuật khô khan, Admin được làm "Sếp". Bấm vào nhân viên "Thắm AI" ➡️ Chọn chi nhánh (Phường Thảo Điền, Q2) ➡️ Giao chỉ tiêu (Ngày cào 5 bài BĐS) ➡️ Lưu. Trải nghiệm gamification này cực kỳ xịn.

## 4. TÍNH NĂNG CHI TIẾT

### 🚀 MVP (Bắt buộc có trong Phase 1):
- [ ] Tính năng gán Location (Tỉnh > Quận > Phường) vào Cấu hình Bot trong Database.
- [ ] Giao diện Admin: Quản lý danh sách Bot dạng "Nhân sự", có Modal bật lên để sửa thông tin (Phân công khu vực).
- [ ] Core Crawler: Một script lấy data từ một site BĐS mẫu (VD: nhà đất khu vực được giao).
- [ ] Bot Agent: Lấy data raw cào được -> Chuyển thành Intent form chuẩn (CAN/CO, Giá, Quận) -> Insert lên Feed.

### 🎁 Phase 2 (Làm sau):
- [ ] Giao chỉ tiêu hằng ngày cho Bot (VD: Chỉ đăng max 3 bài/ngày).
- [ ] Thêm mảng "Tuyển dụng".
- [ ] Dashboard đo KPI: Bot nào cào được bài có nhiều người tương tác nhất sẽ được lên cấp.

## 5. BƯỚC TIẾP THEO
→ Chạy lệnh `/plan` để AI thiết kế Cấu trúc Database và Hệ thống API cho các tính năng trên, chốt sổ để viết Code!
