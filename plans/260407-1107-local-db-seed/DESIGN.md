# 🎨 DESIGN: Local Database & Seed Data

Ngày tạo: 2026-04-07
Dựa trên: [Plan](file:///d:/SW/Can-co-tn/plans/260407-1107-local-db-seed/plan.md)

---

## 1. Cách Lưu Thông Tin (Database)

📦 **SƠ ĐỒ DỮ LIỆU MẪU (SEED DATA SẼ TẠO):**

```text
┌─────────────────────────────────────────────────────────────┐
│  👤 1. NGƯỜI DÙNG (Users & Profiles)                        │
│  ├── 1 tài khoản Admin (test@admin.com / pass: admin123)    │
│  └── 2 tài khoản User thường (để test chat và tương tác)    │
└───────────────────────────┬─────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  🤖 2. HỆ THỐNG AI BOTS (Bots)                              │
│  ├── Bot "Luật sư" (Chuyên tư vấn pháp lý)                  │
│  ├── Bot "Môi giới" (Envoy chuyên crawl tin bài)            │
│  └── Cấp sẵn 100 điểm Gamification cho các bot              │
└───────────────────────────┬─────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  📝 3. NỘI DUNG TƯƠNG TÁC (Intents: CẦN & CÓ)               │
│  ├── 2 bài "CẦN" mua/thuê nhà (Kèm tọa độ Quận 1)           │
│  ├── 2 bài "CÓ" nhà bán/cho thuê (Kèm hình mẫu)             │
│  └── 1 Match (AI khớp nối CẦN và CÓ vào với nhau)           │
└───────────────────────────┬─────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  🏆 4. GAMIFICATION & THÔNG BÁO                            │
│  ├── 1 Thành tựu (Achievement) mẫu đã mở khóa               │
│  └── Vài thông báo (PushLog) mẫu để test UI                 │
└─────────────────────────────────────────────────────────────┘
```

## 2. Danh Sách Màn Hình (Developer Workflow)
Vì đây là tác vụ thiết lập Backend, "màn hình" của Developer chính là Terminal. 

| Bước | Lệnh Terminal | Mục đích | Kết quả mong đợi |
|---|---|---|---|
| 1 | `docker compose up -d` | Bật DB | Mở port `5432` cho PostgreSQL |
| 2 | `(Đổi file .env.local)` | Trỏ URL | Chặt đứt kết nối lên cloud cũ |
| 3 | `npx prisma db push` | Đưa bảng vào DB | Tables = 34 trong `cancotn_local` |
| 4 | `npm run db:seed` | Tạo dữ liệu ảo | Hoàn tất tạo User, Bot, Intent |
| 5 | `npm run dev` | Chạy App | Test giao diện với data đầy |

## 3. Checklist Kiểm Tra & Test Cases

### 📋 Tính năng: "Nhồi dữ liệu mẫu"
SPECS Reference: Phase 03 - Data Seed Script

- [ ] Lệnh seed không được phép chạy nếu `.env.local` đang chứa host Supabase.
- [ ] Database khởi động lại không bị mất data (đã mount Volume).
- [ ] Các User mẫu phải có ảnh avatar ngẫu nhiên.
- [ ] Mật khẩu cho User mẫu dùng chung mã hash của `admin123` để khỏi config nhiều.
- [ ] Prisma phải không chém lỗi khi xóa data có ràng buộc khóa ngoại (Foreign key Constraint).

### 📝 TEST CASES: Gieo hạt (Seed)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**TC-01: Safety Lock Guard (Bảo vệ DB Thật)**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**Given:** Dev lỡ quên chưa đổi `.env.local` (Vẫn đang trỏ về Supabase)
**When:**  Chạy lệnh `npm run db:seed`
**Then:**  
✓ Báo lỗi màu Đỏ: "Dừng lại! Bạn đang trỏ vào Supabase!"
✓ Tiến trình `process.exit(1)`, không chọc vào bảng nào cả.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**TC-02: Upsert Idempotency (Chạy lại nhiều lần)**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**Given:** Đã chạy seed thành công 1 lần trước đó.
**When:**  Chạy lệnh `npm run db:seed` lần thứ 2.
**Then:**  
✓ Kịch bản thực hiện `deleteMany` sạch sẽ từ dưới lên trên.
✓ Chèn dòng mới thành công.
✓ Không văng lỗi "Unique constraint failed" ở màn hình console.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**TC-03: Kiểm thử Đăng nhập App**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**Given:** Khởi chạy `npm run dev` sau khi Seed xong.
**When:**  Vào màn hình Login, nhập `test@admin.com` - Pass: `admin123`.
**Then:**  
✓ Đăng nhập thành công, token được cấp.
✓ Nhìn thấy dữ liệu Card TINDER từ CẦN & CÓ hiển thị ảo bên trong màn hình.

---

*Tạo bởi AWF 4.0.2 - Design Phase*
