# Design Specifications: Bot Dashboard

## 🎨 Color Palette
| Name | Hex | Usage |
|------|-----|-------|
| Primary | #14b8a6 | Teal accents, progress bars, active icons |
| Primary Dark | #0d9488 | Teal hover states |
| Background | #0f172a | Admin page background (slate-900) |
| Surface | #1e293b | Dashboard Cards, Panels (slate-800) |
| Border | #334155 | Card borders (slate-700) |
| Text | #f1f5f9 | Main white text (slate-100) |
| Text Muted| #94a3b8 | Subtitles, labels (slate-400) |
| Success | #22c55e | Positive KPI indicators |
| Warning | #f59e0b | Missing quota warnings |

## 🔲 UI Components

### 1. Overview Cards (3 Thẻ Trên Cùng)
- **Layout:** CSS Grid (`grid-cols-1 md:grid-cols-3`)
- **Style:** Nền `bg-slate-800`, viền `border border-slate-700/60`, góc bo `rounded-xl`.
- **Hiệu ứng:** Hover nhẹ nhấc lên `hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(20,184,166,0.15)]`.
- **Nội dung:** Icon lớn bên trái, Tên Chỉ Số (muted text) ở trên, Con số to đùng (giữa) với màu neon Teal.

### 2. Leaderboard Bar Chart (Bảng Xếp Hạng)
- **Cấu trúc:** Một danh sách `flex col`.
- **Item layout:** 
  - Khối Trái: Avatar Bot (chữ cái đầu, nền màu riêng của bot `bot.color`).
  - Khối Giữa: Tên Bot và Text phụ "Tiến độ: X/Y bài"
  - Khối Phải (Dưới): Thanh Progress Bar.
- **Thanh Progress Bar:** Container `bg-slate-700`, vạch chạy `bg-teal-500` có shadow glow nhẹ. Nếu đầy 100% thì đổi sang xanh lá `bg-green-500`.

### 3. Regional Map List (Danh Sách Khu Vực)
- **Cấu trúc:** Danh sách dọc có phân chia viền `border-b border-slate-700/50`.
- **Bên Trái:** Tên khu vực (Ví dụ: "Huyện Ba Vì, Hà Nội").
- **Bên Phải:** Số lượng báo cáo (Ví dụ: "2 Bot"). Đi kèm cái chấm nhỏ nhấp nháy `animate-pulse bg-green-500` ám chỉ đang online cào dữ liệu.

## ✨ Animations
- Lên mượt mà lúc load: `animate-in fade-in slide-in-from-bottom-[20px] duration-700`.
- Progress Bar mọc ra từ từ: `transition-all duration-1000 ease-out`.
