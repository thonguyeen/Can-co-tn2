# Phase 04: Integration & Edge Cases (Kết Nối Tương Tác Thật)
Status: ⬜ Pending

## 🎯 Mục tiêu
Đưa các tính năng tương tác (Bình Luận, Lưu Tin, Quan Tâm) từ trạng thái "trưng bày" sang hoạt động thật ghi nhận vào cơ sở dữ liệu (Supabase). Đồng thời dời trang Chi Tiết Tin Đăng ra một vùng dùng chung để mọi phiên bản (Demo, Hybrid, Hybrid V2) đều có thể trỏ tới mượt mà.

## 📋 Yêu cầu tính năng (Requirements)
### Functional
- [ ] Thiết lập Trang Chi Tiết Dùng Chung (`app/intent/[id]/page.tsx`), thay vì bị nhốt trong thư mục `/demo` như hiện tại.
- [ ] Kích hoạt Ô Gõ Bình Luận: Cho phép điền text và gửi lên API `/api/intents/comments` và ghi nhận xuống `intent_comments`.
- [ ] Đồng bộ Nút "Quan Tâm" / "Lưu": Khi nhấn 💚 sẽ tăng count `match_count` hoặc gọi API để lưu vào DB thực tế thay vì bộ nhớ ảo của Trình duyệt.
- [ ] Đổi truyền tham số `basePath` trong `<IntentCard />` sang đường dẫn chuẩn mới của chi tiết tin.

### Non-Functional (UX/Performance)
- [ ] Vẫn tải mượt (Skeleton) khi đang chờ xử lý.
- [ ] Lỗi mất mạng phải hiển thị Toast Warning thân thiện chứ không nổ tung trang.

## 🛠️ Trình tự triển khai
1. [ ] **Bước 1**: Rút trang `app/demo/intent/[id]/page.tsx` sao chép sang `app/intent/[id]/page.tsx`. Xóa những thư viện fake MOCK không cần thiết.
2. [ ] **Bước 2**: Thay đổi nút bấm trong thẻ bài đăng tại tất cả các file (`app/hybrid/page.tsx`, `app/hybrid-v2/page.tsx`) sao cho bấm "Xem chi tiết" thì bay qua link gốc mới.
3. [ ] **Bước 3**: Code API POST `/api/comments` để nhận cục đá bình luận của User thả xuống Hồ Supabase.
4. [ ] **Bước 4**: Tháo xích khoá chữ `disabled` ở ô gõ Gửi Bình Luận, nối State React vào và bấm Send.

## 📂 File bị ảnh hưởng
- New: `app/app/intent/[id]/page.tsx`
- New: `app/app/api/comments/route.ts`
- Edit: `app/components/intent/IntentCard.tsx` 
- Edit: `app/app/demo/intent/[id]/page.tsx` (tái cấu trúc)

---
Kế tiếp: Dùng lệnh `/code phase-04` để em làm thợ xây thi công luôn anh nhé!
