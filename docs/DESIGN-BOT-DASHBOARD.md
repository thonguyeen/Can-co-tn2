# 🎨 DESIGN: Bot HR Dashboard

Ngày tạo: 02/04/2026
Dựa trên: Yêu cầu mở rộng Tab Báo Cáo & KPI cho trang Quản Trị

---

## 1. Cách Lưu & Xử Lý Thông Tin (Data Aggregation)

Dữ liệu không cần tạo bảng mới, toàn bộ được tính toán (Aggregated) từ mảng `envoyBots` hiện tại:

┌─────────────────────────────────────────────────────────────┐
│  🤖 ENVOY BOTS (Nguồn Data từ API /api/bots)                    │
│  ├── Tổng số Bot (count)                                 │
│  ├── Tổng Quota (sum of daily_quota)                     │
│  ├── Tổng Bài Đã Đăng (sum of posts_today)               │
│  └── Nhóm theo Khu Vực (group by assigned_province)      │
└───────────────────────────┬─────────────────────────────────┘
                            │ Đổ dữ liệu vào Dashboard
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  📊 BOT DASHBOARD STATE (Khu vực hiển thị)                 │
│  ├── Overview Metrics (Tổng quan)                       │
│  ├── Top Performers Array (Sắp xếp posts_today giảm dần)│
│  └── Regional Map (Bản đồ phân bổ nhân sự)              │
└─────────────────────────────────────────────────────────────┘

## 2. Danh Sách Màn Hình (Component Mới)

| # | Tên | Mục đích |
|---|-----|----------|
| 1 | `BotDashboardTab.tsx` | View tổng quan toàn bộ số liệu hiệu suất |

**Bố cục Tab Dashboard:**
- Trái: View Overview (3 thẻ Card to chỉ số tổng)
- Giữa: Bảng Leaderboard thi đua
- Phải: Bảng Thống Kê Theo Tỉnh/Thành phố

## 3. Luồng Hoạt Động (User Journey)

1️⃣ Admin vào màn hình `/admin`
2️⃣ Ở thanh điều hướng trên cùng, bấm vào tab "📈 KPI Báo Cáo" (Mới thêm)
3️⃣ Màn hình vạch ra các biểu đồ thanh (bằng CSS) để Admin thấy ngay:
   - "À, hôm nay bọn Bot đã đăng được 15/50 bài báo chỉ tiêu."
   - "Bot Tuấn Insider đang top 1."
   - "Hà Nội đang có 2 Bot cắm chốt."
   
## 4. Test Cases & Checklist Kiểm Tra (Acceptance Criteria)

### Tính năng: Bot Dashboard Tab
SPECS Reference: Quản trị viên theo dõi công việc của Bot

🧪 **TC-01: Happy Path (Trường hợp bình thường)**
- Given: Admin nhấp vào Tab Báo Cáo & KPI
- When: Data của Bots được tải thành công từ API
- Then: 
  - ✓ Component render ra được 3 thẻ Overview.
  - ✓ Top 5 Bot (theo số bài) hiện trên bảng xếp hạng (Biểu đồ ngang vẽ bằng thẻ div màu xanh ngọc).

🧪 **TC-02: Logic Tính Toán**
- Given: Hệ thống có 2 Bot (1 con đăng 5 bài, rảnh 10; 1 con đăng 10 bài, rảnh 10)
- When: Dashboard render
- Then: 
  - ✓ Tổng bài phải hiện 15.
  - ✓ Tổng Quota phải hiện 20.
  - ✓ Thanh % (Tiến độ) chỉ ở mức 75% đạt KPI KPI.

---

*Tạo bởi AWF 2.1 - Design Phase*
