# Gamification Schema & DB Cleanup Spec

## 1. Executive Summary
Thêm hệ thống Gamification và xoá rác RLS / Trigger sau tiến trình rời bỏ Supabase.

## 2. Database Design (ERD & Schema)
Thêm 4 models vào schema.prisma:
- `UserAchievement`: Lưu lịch sử nhận huy hiệu. Liên kết tới Profile (`id`)
- `PointTransaction`: Lưu lại sao kê tích luỹ điểm. Liên kết tới Profile (`id`)
- `UserChannel`: Lưu lại Device token để gửi FCM Push Notifications. Liên kết tới User (`id`)
- `PushLog`: Lưu log các push messages đã được bắn. Liên kết tới User (`id`)

## 3. SQL Data Cleanup Plan
Do không còn xài Auth Server của Supabase, xoá các rule sau:
- Trigger: `DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;`
- Function: `DROP FUNCTION IF EXISTS public.handle_new_user;`
- RLS Policies của 5 bảng chính, có liên quan tới `auth.uid()`. Nhẹ nhất là thực thi:
  ```sql
  ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
  ALTER TABLE public.intents DISABLE ROW LEVEL SECURITY;
...
  ```
  Thực tế Prisma sẽ bypass việc này, nhưng cứ xoá Policies cho gọn.

## 4. API Contract 
Chưa triển khai (Out of scope cho giai đoạn này).

## 5. Tech Stack
- Typescript, Node, Next.js.
- Database: PostgresQL + Prisma ORM. Môi trường: Prisma CLI.
