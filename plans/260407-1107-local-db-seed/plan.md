# KẾ HOẠCH: Triển khai Local Database & Seed Data (Docker + Prisma)

## 📌 Bối cảnh và Mục tiêu
Hiện tại dự án "Cần & Có" đang bị phụ thuộc toàn bộ môi trường phát triển (Local) vào Production Database trên cơ sở hạ tầng đám mây của Supabase. Để đảm bảo an toàn tuyệt đối và giúp anh code các tính năng tự tin không sợ hỏng database, chúng ta phải chuyển sang dùng một máy chủ Database Local với dữ liệu giả định.

## 🎯 Cột mốc & Phạm vi (Scope)
- **Trong phạm vi:** Thiết lập Docker (chạy PostgreSQL tích hợp `pgvector`), điều chỉnh biến môi trường, viết Script `seed` của Prisma để tạo data test. Cài đặt "Khóa an toàn" ngắt quyền tiếp cận Supabase Cloud khi chạy lệnh nhồi data.
- **Rủi ro cao nhất:** Quên thay đổi IP khiến mã nhồi Data mẫu đập chết dữ liệu thật trên Supabase. (Đã có phương án khóa Guard ở Phase 02).

---

## 🗂️ Phân chia Giai đoạn (Phases)

### Phase 01: Setup Architecture (Docker & Dependencies)
Nhiệm vụ: Cài đặt ngôi nhà chứa DB dưới máy tính cá nhân.
- [ ] Soạn file `docker-compose.yml` khai báo server `postgres_local` dùng image `ankane/pgvector:16`.
- [ ] Chèn mapping Volumes để tắt Docker khởi động lại sẽ không mất data local.
- [ ] Can thiệp vào `app/package.json`: Cài vô `ts-node` vào mảng DenvDependencies.
- [ ] Cài thêm shortcut scripts: `"db:seed": "prisma db seed"` và `"db:local": "npm run db:push && npm run db:seed"` vào file cấu hình.

### Phase 02: Kích Hoạt Khóa An Toàn & Đổ Khung
Nhiệm vụ: Switch kết nối từ Cloud sang Local, chuyển 34 Schema của chúng ta xuống.
- [ ] Hướng dẫn đổi `.env.local` thủ công sang cấu hình Local URL (hoặc em tự comment giúp anh lại).
- [ ] Chạy lệnh `npx prisma db push` để in xuống dưới CSDL các Schema hiện tại.
- [ ] Nền móng đầu tiên của file `app/prisma/seed.ts`: Viết đoạn GUARD kiểm tra biến `DATABASE_URL`, nếu có chữ `supabase`, thì throw Error và `process.exit(1)`.

### Phase 03: Thiết kế Thuật toán Seed Data Mẫu
Nhiệm vụ: Đổ ruột dữ liệu ảo vào bảng DB cho đầy đủ nghiệp vụ.
- [ ] Auto Cleanup: Trước khi chạy Seed, dùng Prisma xóa sạch các bảng cũ để tránh lặp (Trình tự xóa theo khóa ngoại Constraints: Matches -> Intents -> Profiles -> Users).
- [ ] Tạo `Auth & Users`: 1 Admin Account chuẩn và 2 User con.
- [ ] Tạo `Bots`: Tạo sẵn Bot Luật Sư và Bot Envoy.
- [ ] Tạo `Intents`: 2 Bài đăng 'CẦN' và 2 Bài đăng 'CÓ', đính kèm GPS giả lập và Match.
- [ ] Tạo `Gamification`: Vài điểm Transaction logs và Notification.
- [ ] Chạy test `npm run db:seed` chốt hạ kết quả cuối cùng.

---
## 💡 Workflow Bàn Giao
Sau khi Kế Hoạch này được chốt, anh chỉ cần gọi tính năng `/code`, em sẽ lập tức lao vào Phase 01 và tạo các file vật lý cho anh ngay!
