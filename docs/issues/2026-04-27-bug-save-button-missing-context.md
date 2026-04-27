# Issue: Save Button Không Gửi API Request

## Thời gian

- Phát hiện: 2026-04-27
- Hoàn thành: 2026-04-27

## Tóm tắt

Save button trên home feed (trang chủ `/`) không đổi màu khi click và không gửi `POST /api/intents/[id]/save`. Nguyên nhân là `SavedProvider` bị thiếu ở trang chủ.

## Hiện tượng

- Click Save button → không đổi màu amber
- Không có request `POST /api/intents/[id]/save` trong Network tab
- `GET /api/intents/saved` trả về `{"ids":[]}` (đúng, DB trống)

## Bằng chứng thu thập được

- Log từ scratchpad session trước: check visual color → FAIL, check API request → FAIL
- API endpoint hoạt động đúng khi test trực tiếp
- Code logic trong `saved-context.tsx` đúng

## Giả thuyết đã kiểm tra

### Giả thuyết A

- Nguyên nhân nghi ngờ: Feed dùng mock data với ID `i-xxx` bị chặn bởi guard `!id.startsWith('i-')`
- Bằng chứng: FeedTab dùng `SocialPostCard` → gọi `useSaved()` → ID từ DB (real UUID)
- Kết quả: ❌ Sai — FeedTab fetch từ real DB

### Giả thuyết B ✅ ROOT CAUSE

- Nguyên nhân nghi ngờ: `SavedProvider` không wrap trang chủ
- Bằng chứng:
  - `app/page.tsx` (SuperAppContainer) là root page, KHÔNG đi qua `(main)/layout.tsx`
  - `SavedProvider` chỉ có trong `MainLayoutWrapper` (dành cho route group `(main)`)
  - `useSaved()` trả về default context: `toggleSave = () => {}` (noop)
- Kết quả: ✅ Đúng — click không làm gì

### Giả thuyết C

- Nguyên nhân nghi ngờ: `requireAuth` nhận session=null dù đã login
- Kết quả: ❌ Không kiểm tra vì đã tìm ra B

## Nguyên nhân gốc

`SavedProvider` bị thiếu ở trang gốc `/`. Trang chủ (`app/page.tsx`) render `SuperAppContainer`, là một client component độc lập không đi qua route group `(main)`, nên `SavedProvider` từ `MainLayoutWrapper` không bao phủ nó. Kết quả là `useSaved()` trong `SocialPostCard` và `ActionBar` nhận default context với `toggleSave` là noop function.

## Cách xử lý

1. Move `SavedProvider` lên `app/providers.tsx` (root level) để bao phủ toàn app
2. Xóa `SavedProvider` khỏi `MainLayoutWrapper.tsx` (duplicate)
3. Xóa `SavedProvider` khỏi `app/demo/layout.tsx` (duplicate)

## File/code đã thay đổi

- `app/providers.tsx` — thêm `SavedProvider`
- `components/layout/MainLayoutWrapper.tsx` — xóa `SavedProvider`
- `app/demo/layout.tsx` — xóa `SavedProvider`

## Cách kiểm tra lại

1. Vào trang chủ `http://localhost:4000`
2. Login (test1@admin.com / 123456)
3. Click nút `Lưu` trên một card trong feed
4. ✅ Icon đổi sang màu amber → optimistic update hoạt động
5. ✅ Network tab thấy `POST /api/intents/[id]/save` được gửi
6. ✅ `GET /api/intents/saved` trả về ID vừa lưu

## Phòng ngừa

- Khi thêm context provider mới cho toàn app, đặt trong `providers.tsx` (root) thay vì trong layout riêng lẻ
- Trang chủ (`app/page.tsx`) là route đặc biệt nằm ngoài mọi route group `(main)`, cần nhớ điều này khi debug context issues

## Tags

`debug`, `bug`, `context`, `react`, `saved-feature`
