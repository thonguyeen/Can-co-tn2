# 🎨 DESIGN: Tách Giao Diện Admin Hub

Ngày tạo: 2026-04-14
Dựa trên: [Plan](file:///d:/SW/Can-co-tn/plans/260414-0811-admin-split/plan.md)

---

## 1. Cách Lưu Thông Tin (Database)

*Không có thay đổi về Database so với hiện tại.*
Tuy nhiên, cấu trúc component Front-end được phân tách:

`app/admin` (Hub)
- `app/admin/members` (Tab Thành Viên / Referral)
- `app/admin/bots` (Tabs quản lý Bot)

## 2. Danh Sách Màn Hình

| # | Tên Màn Hình | Mục Đích |
|---|-------------|----------|
| 1 | **Navigation Hub** (`/admin`) | Điểm bắt đầu cho Admin. Cung cấp overview ngắn gọn và điều hướng đến các khu vực chức năng qua 2 Overview Cards. |
| 2 | **Members Manager** (`/admin/members`) | Quản lý hệ thống người dùng, khoá tài khoản, điểm thưởng và Referral tree. |
| 3 | **Bots Manager** (`/admin/bots`) | Giám sát KPI, vận hành, "nhân sự" Bot, điều chỉnh nguồn cào và hệ thống cấu hình Crawler/Orchestrator. |
| 4 | **Member Detail** (`/admin/members/[id]`) | Thao tác chi tiết sâu vào dữ liệu của 1 thành viên. |

## 3. Luồng Hoạt Động (User Journey)

### 📍 HÀNH TRÌNH: Truy cập Quản Trị Hệ Thống
1️⃣ Admin (có quyền) đi tới URL `/admin`
2️⃣ Nhìn thấy Hub thay vì 8 tabs san sát nhau như cũ.
   - Thấy tổng quan hiện tại: VD "Có tổng 540 thành viên" và "Có tổng 14 bots đang chạy".
3️⃣ Click vào block **"Quản Lý Bot"** → Chuyển hướng sang `/admin/bots`
4️⃣ Giao diện tải Layout Menu (Sidebar hoặc Topbar báo hiệu đang ở phần Bots). 
5️⃣ Admin sử dụng 6 tab như bình thường. Chỉnh sửa xong, bấm link ở Layout để về Hub (hoặc sang Members).

## 4. Giao diện (UI/UX Prom Max)

Dựa trên gợi ý của `ui-ux-pro-max`, ta áp dụng:
- **Pattern:** Data-Dense + Drill-Down (Nhiều dữ liệu, bấm vào để khoan sâu)
- **Style:** Minimal padding, grid layout, maximum data visibility
- **Effect:** Hover tooltips, row highlighting, cursor-pointer.
- **Màu Sắc Hub:** Giữ tone Dark Theme gốc của Cần & Có (`bg-slate-900`, `text-slate-200`, accent `teal-500`). Các card Hub sử dụng glassmorphism (`bg-slate-800 border-slate-700/60`).

### 📦 SƠ ĐỒ MÀN HÌNH HUB (`/admin/page.tsx`)
```text
┌─────────────────────────────────────────────────────────────┐
│ 🛡️ Quản Trị Hệ Thống (Hub)                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [CARD 1 - Quản Lý Thành Viên]     [CARD 2 - Quản Lý Bot]   │
│  👥 Icons & Title                 🤖 Icons & Title          │
│  - 1,234 users                    - 14 Active Bots          │
│  - 45 VIPs                        - 90% KPI Today           │
│                                                             │
│  [ Quản Lý Ngay → ]               [ Theo Dõi Ngay → ]       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 5. Checklist Kiểm Tra (Acceptance Criteria)

### Tính năng: Navigation Hub (`/admin`)
- [ ] Giao diện có 2 thẻ bấm (Card) to rõ ràng, có UI hover mượt (gợi ý tương tác).
- [ ] Bấm đúng link `/admin/members` và `/admin/bots`.

### Tính năng: Members & Bots Pages
- [ ] Layout của 2 route `/admin/members` và `/admin/bots` tái sử dụng hoàn hảo các component cũ (`AdminUsersTab`, `BotDashboardTab`...).
- [ ] CSS Modules (`admin.module.css`) vẫn map đúng, không vỡ layout khi đổi trang.
- [ ] `fetchBots` logic giữ nguyên chạy trên tab `/admin/bots`.

### Tính năng: Cleanup & Router linking
- [ ] Link bấm vào xem User Detail ở trang `/admin/members` mở đúng URL `/admin/members/[id]`.
- [ ] Nút "Quay lại danh sách" ở trang chi tiết user về đúng `/admin/members`.

## 6. Test Cases (Chuẩn Bị Kiểm Tra - SDD)

📝 **TEST CASES: Hub Navigation**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**TC-01: Happy Path - Hiển thị Hub**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Given: Admin truy cập `/admin`
When:  Trang tải xong
Then:  ✓ Giao diện không có các 8 tab cũ
       ✓ Hiển thị 2 thẻ (Cards): "Quản Lý Thành Viên" và "Quản Lý Bot"
       ✓ Layout có Navbar/Sidebar chung

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**TC-02: Điểu hướng sang Members**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Given: Admin đứng tại Hub (`/admin`)
When:  Click vào thẻ "Quản Lý Thành Viên"
Then:  ✓ Chuyển sang URL `/admin/members`
       ✓ Tải tab "👥 Thành Viên" và "📊 Referral"
       ✓ Sidebar chỉ rõ mục đang chọn là "Members"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**TC-03: Điểu hướng sang Bots**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Given: Admin đứng tại Hub (`/admin`)
When:  Click vào thẻ "Quản Lý Bot"
Then:  ✓ Chuyển sang URL `/admin/bots`
       ✓ Tải toàn bộ 6 tabs Bot gốc
       ✓ Active tab mặc định là "KPI Báo Cáo"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**TC-04: User Detail Routing**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Given: Admin đang ở `/admin/members`
When:  Bấm vào 1 user trong danh sách
Then:       ✓ Layout mượt chuyển sang `/admin/members/[id]`
       ✓ "Quay lại" sẽ dẫn đúng về `/admin/members` (chứ không phải `/admin`)

📝 **TEST CASES: Members Manager (Phase 02)**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**TC-05: Khởi tạo trang Thành Viên**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Given: Admin truy cập `/admin/members`
When:  Trang tải xong
Then:  ✓ Tab "👥 Thành Viên" được chọn mặc định
       ✓ Component `AdminUsersTab` render thành công danh sách users
       ✓ Có thể fetch list user từ API thay vì bị lỗi fetchBot như trước

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**TC-06: Chuyển Tab sang Referral**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Given: Admin ở trang `/admin/members`
When:  Click chọn tab "📊 Referral"
Then:  ✓ Component đổi sang `AdminReferralTab`
       ✓ Bảng xếp hạng referral và redemptions list hiển thị đúng

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**TC-07: Redirect Detail Page**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Given: Admin tại danh sách Thành Viên (`/admin/members`)
When:  Click vào 1 row (ví dụ: user x)
       ✓ `router.push` dẫn đúng tới `/admin/members/[id]` (thay vì `/admin/users/` cũ)
       ✓ Dữ liệu user x được nạp đúng vào màn hình `AdminUserDetailPage`

📝 **TEST CASES: Bots Manager (Phase 03)**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**TC-08: Khởi tạo trang Quản Lý Bot**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Given: Admin truy cập `/admin/bots`
When:  Trang tải xong
Then:  ✓ Layout hiển thị đầy đủ 6 tabs nghiệp vụ Bot
       ✓ API `/api/bots` được gọi thành công và truyền dữ liệu xuống các components

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**TC-09: Tương tác 6 Tabs Bot**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Given: Admin ở trang `/admin/bots`
When:  Click qua lại giữa các tab (KPI, Vận Hành, Nhân Sự, Config, Nguồn Cào, Hệ Thống)
Then:  ✓ Mỗi tab render đúng component tương ứng mà không bị vỡ giao diện
       ✓ State của data `bots` được giữ nguyên khi navigate giữa các tab

---
*Tạo bởi AWF 4.0 - Design Phase*
