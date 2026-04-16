# 💡 BRIEF: Tính năng "Tinder Bất Động Sản" (Mutual Match & Lọc Crawler)

**Ngày tạo:** 2026-04-14
**Giai đoạn:** Brainstorm

---

## 1. VẤN ĐỀ CẦN GIẢI QUYẾT
- **Tính năng "Khớp Nhanh" bị loãng:** Hiển thị lẫn lộn các tin tức cào tự động từ Bot (Crawler). Người dùng vuốt "thích" tin Bot nhưng không thể chat được -> Trải nghiệm hụt hẫng (Match rác).
- **Spam Phòng Chat:** Hiện tại cứ "Thích" là ngay lập tức mở phòng trò chuyện, dễ dẫn đến tình trạng môi giới hoặc người lạ spam tin nhắn rác làm phiền.

## 2. GIẢI PHÁP ĐỀ XUẤT
Biến tính năng "Khớp nhanh" (Chốt nhanh) thành sân chơi **ĐỘC QUYỀN cho người thật** với cơ chế bảo vệ 2 lớp (Mutual Match):
1. **Dời nhà cho Bot:** Các bài đăng từ Crawler (Bot) sẽ bị loại hoàn toàn khỏi khu vực Khớp Nhanh, và chỉ xuất hiện ở Bảng tin Trang chủ (Feed) để làm nguồn tham khảo thị trường.
2. **Cơ chế Khớp Đôi (Mutual Match):** Cả hai người dùng phải có hành động "Thích" (Like) bài đăng của nhau thì hệ thống mới cho phép mở Phòng Thỏa Thuận (Chat).
3. **Thông báo chủ động:** Nếu chỉ 1 người "Thích", hệ thống gửi thông báo Bật mí Tên/Avatar (Công khai) cho người kia biết để họ quyết định có "Thích lại" hay không.

## 3. ĐỐI TƯỢNG SỬ DỤNG
- **Người dùng thật (Seller/Buyer):** Muốn kết nối nhanh gọn lẹ, đúng người, đúng nhu cầu mà không bị phiền phức.

## 4. TÍNH NĂNG CỐT LÕI (MVP)

### 🚀 MVP (Bắt buộc có):
- [ ] Logic lấy danh sách bài đăng cho "Khớp Nhanh": Bổ sung bộ lọc `isEnvoy: false` (hoặc tương tự) để chặn tin do Bot đăng.
- [ ] Tính năng "Thả tim 1 chiều": Lưu trạng thái một người đã Like, gửi Notifications hệ thống (Hiển thị rõ mặt mũi người Like).
- [ ] Logic "Khớp 2 chiều": Kiểm tra xem cả A và B đã Like nhau chưa. Nếu Có, tạo `RoomChat` và thông báo "CHÚC MỪNG".

### 🎁 Phase Tiếp Theo (Làm sau):
- [ ] Tính năng thu phí (Gamification): Bỏ tiền/Point mua lượt "Siêu Thích" (Super Like) để được ưu tiên hiển thị lên đầu.

## 5. BƯỚC TIẾP THEO
→ Gọi `/plan` để AI vẽ chi tiết Sơ đồ Database (Thêm bảng Like/Match status) và phân chia công việc code.
