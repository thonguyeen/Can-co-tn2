# 🎨 DESIGN: Gamification Schema & DB Cleanup

Ngày tạo: 2026-04-06
Dựa trên: [gamification_cleanup_spec.md](../../docs/specs/gamification_cleanup_spec.md)

---

## 1. Cách Lưu Thông Tin (Database)

```text
┌─────────────────────────────────────────────────────────────┐
│  👤 USERS / PROFILES                                        │
└─┬──────────────────────────┬──────────────────────────────┬─┘
  │ 1 Profile có nhiều GD    │ 1 Profile có nhiều Danh hiệu │ 1 User có nhiều Device
  ▼                          ▼                              ▼
┌─────────────────────┐    ┌─────────────────────┐    ┌──────────────────────────┐
│ 💰 PointTransaction │    │ 🏆 UserAchievement  │    │ 📱 UserChannel           │
│ ├── id              │    │ ├── id              │    │ ├── id                   │
│ ├── userId          │    │ ├── userId          │    │ ├── userId               │
│ ├── amount (+/-)    │    │ ├── achievementType │    │ ├── provider ("fcm")     │
│ ├── reason          │    │ ├── metadata        │    │ ├── token                │
│ └── createdAt       │    │ └── unlockedAt      │    │ └── isActive             │
└─────────────────────┘    └─────────────────────┘    └──────────┬───────────────┘
                                                                 │ 1 User có nhiều log
                                                                 ▼
                                                      ┌─────────────────────┐
                                                      │ 📬 PushLog          │
                                                      │ ├── id              │
                                                      │ ├── userId          │
                                                      │ ├── title           │
                                                      │ ├── body            │
                                                      │ ├── status          │
                                                      │ └── sentAt          │
                                                      └─────────────────────┘
```

## 2. Danh Sách Màn Hình

*(Không áp dụng cho scope này. Đây là thao tác nâng cấp thiết kế dưới nền tảng Database)*

## 3. Luồng Hoạt Động Kỹ Thuật

- **Cộng/Trừ điểm:** User đăng bài -> Ứng dụng gọi hàm tạo 1 dòng ở `PointTransaction` -> Cập nhật tổng điểm của bảng `UserStat`.
- **Dọn dẹp DB:** Script dọn rác bằng Prisma Client gọi `$executeRawUnsafe` để `DROP FUNCTION` và `DROP TRIGGER`.

## 4. Checklist Kiểm Tra (Acceptance Criteria)

### Đảm bảo Cập nhật Schema:
- [ ] Schema `prisma` định nghĩa đúng quan hệ (Foreign Key).
- [ ] Không làm mất dữ liệu của `Profile` hay `User` cũ hiện có trên Supabase Postgres.

### Thiết kế Dọn dẹp Database an toàn:
- [ ] Drop thành công Trigger `on_auth_user_created` trên bảng `auth.users`.
- [ ] Drop thành công Function `public.handle_new_user`.

---

## 5. Test Cases (SDD Compliance)

**TC-01: Prisma Validate**
- Given: Chỉnh sửa hoàn tất `schema.prisma`.
- When: Chạy `npx prisma validate`.
- Then: ✓ Schema hợp lệ. Đảm bảo cấu trúc không break.

**TC-02: DB Push An toàn**
- Given: Schema chuẩn.
- When: Chạy `npx prisma db push --accept-data-loss`.
- Then: ✓ Postgres sinh ra đúng 4 bảng. Không drop hay đụng chạm bảng đang có data quan trọng.

**TC-03: Chống báo lỗi đăng ký từ Trigger rác**
- Given: Script chạy cleanup xong. User thực hiện đăng ký thử.
- When: Lưu profile mới vào `public.users`.
- Then: ✓ KHÔNG bị dội ngược bảng `auth.users` bởi Trigger cũ.

---
*Tạo bởi AWF 2.1 - Design Phase*
