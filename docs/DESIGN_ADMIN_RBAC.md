# 🎨 DESIGN: Quản Lý Phân Quyền (RBAC) Admin Dashboard

Ngày tạo: 2026-04-14
Dựa trên: Plan `plans/260414-1416-admin-rbac/plan.md`

---

## 1. Cách Lưu Thông Tin (Database)

📦 **SƠ ĐỒ LƯU TRỮ:**

Giống như việc gắn thêm một nhãn "Chức vụ" lên thẻ nhân viên, chúng ta sẽ thêm cột `role` vào bảng `User`.

```prisma
┌─────────────────────────────────────────────────────────────┐
│  👤 USERS (Người dùng)                                      │
│  ├── id (Mã số)                                             │
│  ├── email                                                  │
│  └── role ⬅️ [CỘT MỚI: "ADMIN" | "MODERATOR" | "USER"]        │
│      *(Mặc định ai mới vào cũng là "USER")                   │
└─────────────────────────────────────────────────────────────┘
```

## 2. Danh Sách Màn Hình (Điều Chỉnh)

Hệ thống màn hình Admin vẫn giữ nguyên, nhưng sẽ "tàng hình" một số phần tùy theo người xem là ai.

| # | Các Phần Giao Diện | Nếu là ADMIN 👑 | Nếu là MODERATOR 🛡️ | Nếu là USER 👤 |
|---|--------------------|-----------------|---------------------|----------------|
| 1 | Trang `/admin` (Hub) | Thấy 2 thẻ (Members & Bots) | Chỉ thấy thẻ Members | **Bị đuổi ra** |
| 2 | Topbar Nav (Menu)  | Hiện nút "Quản Lý Bot" | Ẩn nút "Quản Lý Bot" | **Bị đuổi ra** |
| 3 | Trang `/admin/bots`| Vào bình thường | **Bị đuổi ra về Hub**| **Bị đuổi ra** |
| 4 | Trang `/admin/members`| Vào bình thường | Vào bình thường | **Bị đuổi ra** |

## 3. Luồng Hoạt Động (User Journey)

🚶 **HÀNH TRÌNH 1: Khách vãng lai tò mò gõ `/admin` (Role: USER)**
1️⃣ Gõ link `/admin` trên trình duyệt.
2️⃣ Hệ thống kiểm tra "Thẻ chức vụ". Thấy là "USER".
3️⃣ Hệ thống "Vui lòng không vào khu vực nội bộ!" và tự động chuyển hướng về Trang Chủ `/`.

🚶 **HÀNH TRÌNH 2: Người kiểm duyệt vào làm việc (Role: MODERATOR)**
1️⃣ Đăng nhập thành công, vào `/admin`.
2️⃣ Nhìn thấy Dashboard, nhưng chỉ có phần Quản Lý Thành Viên. Khối Quản Lý Bot trống trơn (không hề biết đến sự tồn tại của Bots).
3️⃣ Nếu cố tình gõ link `/admin/bots` để hack -> Hệ thống đá về lại trang `/admin`.
4️⃣ Được phép duyệt hồ sơ, cấm người dùng bình thường.

🚶 **HÀNH TRÌNH 3: Sếp lớn vào kiểm tra (Role: ADMIN)**
1️⃣ Đăng nhập thành công, vào `/admin`.
2️⃣ Thấy toàn bộ, thao tác toàn bộ.

## 4. Checklist Kiểm Tra & Test Cases

📋 Tính năng này HOÀN THÀNH khi vượt qua các bài kiểm tra sau:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**TC-01: Ngăn chặn từ cửa (Bảo Vệ Bên Ngoài)**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- **Given:** Một User bình thường hoặc người chưa đăng nhập.
- **When:** Cố gắng vào `/admin`.
- **Then:** ✓ Bị đẩy về trang chủ. Không thấy trang nội bộ nào.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**TC-02: Phân chia quyền hạn UI (Bảo Vệ Giao Diện)**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- **Given:** Tài khoản MODERATOR đang ở `/admin`.
- **When:** Nhìn vào màn hình và Menu ngang.
- **Then:** ✓ Không thấy tab "Quản Lý Bot". ✓ Không thấy Overview Card của Bot.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**TC-03: Ngăn chặn hack đường link thẳng**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- **Given:** Tài khoản MODERATOR.
- **When:** Cố tình dán link `http://localhost:4000/admin/bots` vào trình duyệt.
- **Then:** ✓ Hệ thống chặn ngay lập tức và đẩy về lại `http://localhost:4000/admin`.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**TC-04: Ngăn chặn hack API (Bảo Vệ Lõi Data)**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- **Given:** Kẻ gian dùng code ngoài gửi lệnh POST sửa dữ liệu Bot (`/api/bots`).
- **When:** Không có token của ADMIN.
- **Then:** ✓ API báo lỗi 403 Forbidden hoặc 401 Unauthorized, không cho sửa Database.
