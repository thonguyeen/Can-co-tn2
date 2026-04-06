# Phase 03: Tích Hợp Realtime Feed (Supabase Subscription)
Status: ⬜ Pending

## 🎯 Mục tiêu
Đảm bảo khi có một người dùng bất kỳ trên hệ thống đăng tin mới, tất cả những người đang mở trang Chủ/Feed sẽ ngay lập tức nhận được tin đó (nhảy lên đầu trang) mà không cần nhấn F5 hay tải lại trang, giúp sàn Cần & Có luôn "sống động" trong thời gian thực.

## 📋 Yều cầu tính năng (Requirements)
### Functional
- [ ] Thiết lập kết nối kênh `realtime` tới bảng `intents` trong Supabase.
- [ ] Lắng nghe sự kiện `INSERT` trên bảng `intents` (có `status` là `active`).
- [ ] Tự động cập nhật thêm tin tức mới vào bộ bài (state `intents`) trên cả 2 giao diện `hybrid` (Dark) và `hybrid-v2` (Light).

### Non-Functional (UX/Performance)
- [ ] Có thông báo nhỏ dạng Snack-bar/Toast "Có tin mới vừa đăng, tải hiển thị..." để người dùng khỏi giật mình.
- [ ] Chỉ insert những bài đăng mới chưa có trên giao diện để tránh duplicate ID thẻ lỗi React.

## 🛠️ Các bước thi công (Implementation Steps)
1. [ ] **Bước 1**: Cấu hình `useEffect` trong `hybrid/page.tsx` để mở kênh Realtime Supabase Subscription (`supabase.channel('public:intents').on('postgres_changes')`).
2. [ ] **Bước 2**: Khi nhận Event, tự động móc nối data mới nhất đẩy lên đỉnh State hiển thị.
3. [ ] **Bước 3**: Đồng bộ tính năng Realtime đó sang `hybrid-v2/page.tsx` cho cả 2 bản Đêm và Ngày.

## 📂 File bị ảnh hưởng
- `app/app/hybrid/page.tsx`
- `app/app/hybrid-v2/page.tsx`

---
Kế tiếp: Dùng lệnh `/code phase-03` để triển khai viết code.
