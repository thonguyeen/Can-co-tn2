# Design Specifications: Bản đồ Thông Minh (Mapbox)

## 🎨 1. Bảng Màu (Color Palette)
| Tên màu | Mã Hex | Mục đích sử dụng |
|---------|--------|------------------|
| **Brand Blue (CÓ)** | `#0068FF` | Marker người CÓ, Nút bấm chính, Icon active |
| **Brand Red (CẦN)** | `#ef4444` | Marker người CẦN, Hot tags |
| **Bền mặt (Surface)** | `#FFFFFF` | Nền Sidebar, Nền Popup Card |
| **Nền xám nhạt** | `#F9FAFB` | Màu nền mờ của bản đồ |
| **Chữ chính** | `#111827` | Tiêu đề, Giá tiền (Text to, rõ) |
| **Chữ phụ** | `#6b7280` | Quận huyện, thông tin mờ |

## 📐 2. Bố cục (Layout System)
- **Sidebar (Trái):** Rộng `320px` trên Desktop, bám sát mép trái. Màn hình điện thoại sẽ hiển thị dưới dạng thanh trượt (Bottom Sheet).
- **Popup Card (Trên bản đồ):** Rộng tối đa `280px`, bo tròn cực mạnh `rounded-2xl` để tạo cảm giác thân thiện (giống bong bóng chat).

## 🔲 3. Chi tiết Component (Component Specs)

### A. Marker & Cluster (Điểm trên bản đồ)
- Điểm lẻ: Chấm tròn `w-5 h-5` viền trắng dày `2px` (`border-2 border-white`), màu đỏ hoặc xanh kèm đổ bóng nhẹ `shadow-md`.
- Cụm (Cluster): To hơn `w-10 h-10`, màu gradient hoặc vàng nhạt, số lượng hiển thị ngay tâm.

### B. Popup Card (Thẻ thông tin)
- **Đổ bóng (Shadow):** `shadow-[0_8px_30px_rgb(0,0,0,0.12)]` (Đổ bóng lan tỏa rộng, sắc viền mờ tạo cảm giác bồng bềnh).
- **Bo góc (Radius):** `rounded-2xl` (16px).
- **Ảnh thu nhỏ:** `h-32 w-full object-cover rounded-t-2xl`.
- **Nút Quan Tâm (Heart):** Tròn `rounded-full`, nền xám nhạt `bg-gray-100`, hover sang nền hồng nhạt `hover:bg-red-50`.

### C. Sidebar Lọc (Filter Dashboard)
- Tương tự phong cách hiện tại của nền tảng Can-co-tn.
- Input bo tròn nhẹ `rounded-xl`.
- Nút chọn CẦN / CÓ dạng tab chuyển mượt mà (Toggle Group).

## 🚀 4. Trải nghiệm (UX & Animation)
- **Hover:** Rê chuột vào Marker -> Marker nảy lên một chút (`scale-110`, transition 200ms).
- **Zoom/Pan:** Chuyển động mượt mà khi lọc quận (bay đến quận đó thay vì giật cục).
- **Empty State:** Nếu zoom vào khu vực không có dữ liệu, hiện chữ mờ trong bản đồ: *"Khu vực này hiện chưa có bài đăng nào"*.
