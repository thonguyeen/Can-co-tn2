# 💡 BRIEF: Tách Giao Diện Admin (Quản Lý Thành Viên & Quản Lý Bot)

**Ngày tạo:** 2026-04-14
**Lĩnh vực:** Tech-Lead / System Architecture

---

## 1. VẤN ĐỀ CẦN GIẢI QUYẾT
- Giao diện quản trị hiện tại nếu gộp chung sẽ dễ gây "chật chội", quá tải thông tin và khó tập trung khi khối lượng dữ liệu phình to.
- Hệ thống Cần & Có chuẩn bị bước vào giai đoạn mở rộng, sau này việc quản lý bot (nghiệp vụ AI) và quản lý người dùng (nghiệp vụ CSKH) sẽ cần những kỹ năng xử lý khác nhau. Việc gộp chung không thuận tiện cho phân quyền.

## 2. GIẢI PHÁP ĐỀ XUẤT
- Xây dựng 2 không gian quản trị (Dashboard pages) hoàn toàn độc lập cho Member Management và Bot Management.
- Mỗi giao diện được tối ưu hoá theo hình thù dữ liệu đặc thù của riêng nó.

## 3. ĐỐI TƯỢNG SỬ DỤNG (Admin Side)
- **Super Admin:** Có toàn quyền truy cập.
- **Nhân viên CSKH / Cộng đồng:** Chỉ cần thao tác trên trang người dùng (xem điểm, khóa tài khoản...).
- **Kỹ sư AI / Biên tập Nội dung:** Chỉ cần thao tác trên trang Bot (config prompt, model, review log chat).

---

## 4. QUY HOẠCH TÍNH NĂNG

### 🚀 MVP (Tính năng cốt lõi cho phiên bản đầu):

**👤 A. Màn hình Quản Lý Thành Viên (Member Manager)**
- [ ] **Bảng danh sách:** Xem nhanh tổng quan số lượng user, trạng thái hoạt động.
- [ ] **Chi tiết hoạt động:** Theo dõi lịch sử người dùng giới thiệu (Referral System), tích điểm thưởng.
- [ ] **Quản trị người dùng:** Nút Block / Unblock tài khoản có hành vi xấu.
- [ ] **Nhãn dán (Labeling):** Phân loại VIP / User thường / User vi phạm.

**🤖 B. Màn hình Quản Lý Bot (Bot Manager)**
- [ ] **Danh sách Bot Môi giới:** Hiển thị các Bot NHA.AI hiện đang có mặt trên server và trạng thái (Active / Inactive).
- [ ] **Control Panel AI:** Giao diện cho phép tùy biến: Đổi model AI (Claude 3, GPT-4...), cập nhật System Prompt.
- [ ] **Giám sát (Audit):** Xem nhanh nhật ký chat (Chat logs) thực tế để đánh giá bot trả lời có chuẩn hay đang bị ảo giác (hallucination).

### 🎁 C. Phase 2 (Nên được bổ sung về sau):
- [ ] **Quản lý Role & Permission:** Giao diện phân quyền cấp bậc thực tế cho nhân sự công ty.
- [ ] **Knowledge Base:** Tải file, quản lý tập tài liệu đào tạo riêng cho từng Bot.
- [ ] **Thống kê (Metrics):** Biểu đồ tỉ lệ giữ chân (Retention) trên trang Member, và Biểu đồ mức độ hài lòng (Sentiment) trên trang Bot.

---

## 5. ĐÁNH GIÁ SƠ BỘ
- **Độ phức tạp:** 🟡 Trung bình. (Đòi hỏi tách UI Front-end, API lấy dữ liệu Prisma có thể tận dụng lại hoặc viết mới các hàm CRUD).
- **Rủi ro rò rỉ:** Cần đảm bảo endpoint trên Next.js cho 2 page này đều có Middleware kiểm tra đúng Role admin hợp lệ.

## 6. KHUYẾN NGHỊ TIẾP THEO
→ Gọi `/plan` để AI thiết kế hạ tầng chi tiết (Routing, Cấu trúc Component, UI Layout và kết nối Database).
