# 🎨 DESIGN: Phase 05 — Data Migration & Go Live

Ngày tạo: 2026-04-06
Dựa trên: `plan.md` Phase 05
Dependencies: Phases 01–04 (✅ Complete)

---

## 1. TỔNG QUAN TÌNH HÌNH

### 1.1. Database hiện tại

```
┌──────────────────────────────────────────────────────────────┐
│  🗄️ SUPABASE POSTGRESQL (ap-south-1.pooler.supabase.com)     │
│  ├── Schema: public (app tables) ← Prisma đang dùng         │
│  ├── Schema: auth (Supabase Auth) ← CẦN MIGRATE USERS       │
│  ├── Schema: storage ← KHÔNG CẦN (đã chuyển local)          │
│  └── Schema: realtime ← KHÔNG CẦN (đã chuyển polling)       │
└──────────────────────────────────────────────────────────────┘
                           │
                    (hiện tại dùng chung)
                           │
┌──────────────────────────────────────────────────────────────┐
│  📱 APP (Next.js + Prisma)                                    │
│  ├── ORM: Prisma Client (✅ migrated)                         │
│  ├── Auth: NextAuth.js (✅ migrated)                          │
│  ├── Realtime: HTTP Polling (✅ migrated)                     │
│  └── Storage: Local filesystem (✅ migrated)                  │
└──────────────────────────────────────────────────────────────┘
```

### 1.2. Prisma Schema: 30 models ĐÃ ĐỊNH NGHĨA
- NextAuth: `User`, `Account`, `Session`, `VerificationToken`
- App Core: `Profile`, `Bot`, `Post`, `Comment`, `Like`, `Save`, `Follow`
- Cần & Có: `Intent`, `IntentImage`, `IntentComment`, `Match`, `Conversation`, `Message`
- Gamification: `UserStat`, `Reaction`, `Notification`, `Prediction`
- Intelligence: `AgentMemory`, `KnowledgeEdge`, `AgentActivity`
- Crawler: `Source`, `RawNews`, `CrawlLog`, `CrawlSource`, `ActivityLog`
- Moderation: `ContentViolation`, `Verification`
- News: `BreakingNews`, `StoryCluster`, `ClusterPost`, `PostUpdate`

### 1.3. ENV hiện tại

| Variable | `.env` | `.env.local` | Cần sửa? |
|----------|--------|-------------|----------|
| `DATABASE_URL` | ✅ Supabase Pooler (6543) | ❌ Thiếu | Copy sang `.env.local` |
| `DIRECT_URL` | ✅ Supabase Direct (5432) | ❌ Thiếu | Copy sang `.env.local` |
| `NEXTAUTH_URL` | ✅ `localhost:3000` | ❌ Thiếu | Sửa thành `:4000` |
| `NEXTAUTH_SECRET` | ✅ Có | ❌ Thiếu | Copy sang `.env.local` |
| AI Keys | ❌ | ✅ Có | OK |

---

## 2. CÁC BƯỚC THỰC HIỆN (Luồng hoạt động)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 BƯỚC 1: Fix Environment (.env.local)          [5 phút]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣ Copy DATABASE_URL, DIRECT_URL, NEXTAUTH_SECRET → .env.local
2️⃣ Sửa NEXTAUTH_URL → http://localhost:4000
3️⃣ Restart dev server

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 BƯỚC 2: Sync Prisma Schema lên DB            [2 phút]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣ npx prisma db push
   → Tạo/cập nhật tables trong DB production
   → Tables mới (NextAuth): users, accounts, sessions, verification_tokens
   → Tables mới (App): user_stats nếu chưa có
2️⃣ npx prisma generate
   → Cập nhật Prisma Client

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 BƯỚC 3: Migrate Auth Users                   [15 phút]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Supabase lưu users trong schema `auth.users`.
NextAuth cần users trong schema `public.users` (model User).

Script tự động:
  auth.users → public.users + public.profiles

Cần xử lý:
  ├── id:           giữ nguyên UUID
  ├── email:        copy
  ├── passwordHash: copy từ encrypted_password
  ├── name:         copy từ profiles.display_name
  └── image:        copy từ profiles.avatar_url

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 BƯỚC 4: Verify & Test Login                  [10 phút]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣ Thử login bằng email/password đã migrate
2️⃣ Kiểm tra session hoạt động
3️⃣ Kiểm tra feed loads data từ DB
4️⃣ Kiểm tra chat polling hoạt động

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 BƯỚC 5: Dọn dẹp & Go Live                   [5 phút]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣ Xóa folder lib/supabase/ rỗng
2️⃣ Xóa @supabase/* từ package.json (nếu còn)
3️⃣ Git init + commit milestone
4️⃣ Chạy npx tsc --noEmit final check
5️⃣ Update plan.md → Phase 05 ✅ Complete
```

---

## 3. THIẾT KẾ CHI TIẾT: Auth User Migration

### 3.1. Sơ đồ dữ liệu

```
┌────────────────────────────────────────┐
│  📦 auth.users (Supabase)              │
│  ├── id (uuid)                         │
│  ├── email                             │
│  ├── encrypted_password (bcrypt hash)  │
│  ├── email_confirmed_at                │
│  ├── created_at                        │
│  └── raw_user_meta_data (json)         │
└───────────────┬────────────────────────┘
                │
                │ MIGRATE
                ▼
┌────────────────────────────────────────┐
│  📦 public.users (NextAuth - Model User) │
│  ├── id (same uuid)                    │
│  ├── email                             │
│  ├── passwordHash ← encrypted_password │
│  ├── name ← profiles.display_name      │
│  ├── image ← profiles.avatar_url       │
│  └── emailVerified ← confirmed_at     │
└────────────────────────────────────────┘
```

### 3.2. Migration Script Design

File: `scripts/migrate-auth-users.ts`

```typescript
// Pseudocode
async function migrateAuthUsers() {
  // 1. Query auth.users từ Supabase (raw SQL vì Prisma không model auth schema)
  const supabaseUsers = await prisma.$queryRaw`
    SELECT id, email, encrypted_password, email_confirmed_at, created_at,
           raw_user_meta_data
    FROM auth.users
    WHERE email IS NOT NULL
  `;

  // 2. Query existing profiles
  const profiles = await prisma.profile.findMany();
  const profileMap = new Map(profiles.map(p => [p.id, p]));

  // 3. Upsert vào public.users
  for (const su of supabaseUsers) {
    const profile = profileMap.get(su.id);

    await prisma.user.upsert({
      where: { id: su.id },
      update: { passwordHash: su.encrypted_password },
      create: {
        id: su.id,
        email: su.email,
        passwordHash: su.encrypted_password,
        name: profile?.displayName || su.raw_user_meta_data?.full_name || null,
        image: profile?.avatarUrl || null,
        emailVerified: su.email_confirmed_at || null,
      }
    });
  }

  // 4. Báo cáo
  console.log(`Migrated ${supabaseUsers.length} users`);
}
```

### 3.3. Password Compatibility

> Supabase Auth dùng **bcrypt** để hash password.
> NextAuth + bcryptjs cũng dùng **bcrypt**.
> → **TƯƠNG THÍCH 100%** — Users login bình thường sau migration, không cần reset password!

---

## 4. CHECKLIST KIỂM TRA (Acceptance Criteria)

### ✅ Bước 1: Environment
- [ ] `.env.local` có `DATABASE_URL`
- [ ] `.env.local` có `NEXTAUTH_SECRET`
- [ ] `.env.local` có `NEXTAUTH_URL=http://localhost:4000`
- [ ] App restart thành công

### ✅ Bước 2: Schema Sync
- [ ] `npx prisma db push` không lỗi
- [ ] Table `users` (NextAuth) đã tạo trong DB
- [ ] Table `accounts` đã tạo trong DB
- [ ] Table `sessions` đã tạo trong DB

### ✅ Bước 3: Auth Migration
- [ ] Script migrate-auth-users.ts chạy thành công
- [ ] Số users migrated > 0
- [ ] Password hash được copy đúng

### ✅ Bước 4: Verify
- [ ] Login bằng email/password cũ → OK
- [ ] Session tồn tại sau refresh page
- [ ] Feed hiển thị intents từ DB
- [ ] Chat polling hoạt động

### ✅ Bước 5: Go Live
- [ ] `lib/supabase/` folder đã xóa
- [ ] `npx tsc --noEmit` → 0 errors
- [ ] Git initialized + first commit

---

## 5. TEST CASES

### TC-01: Login sau migration
```
Given: User có email user@test.com đã migrate từ Supabase
When:  Nhập email + password cũ tại /login
Then:  ✓ Login thành công
       ✓ Redirect đến homepage
       ✓ Session cookie được set
```

### TC-02: Feed loads data
```
Given: User đã login
When:  Truy cập /hybrid-v2
Then:  ✓ Feed hiển thị intents từ DB (thay vì "0 tin")
       ✓ Polling 15s hoạt động
       ✓ Không có console errors
```

### TC-03: API auth protected
```
Given: User CHƯA login
When:  Gọi /api/intents trực tiếp
Then:  ✓ HTTP 401 Unauthorized
```

### TC-04: Chat messaging
```
Given: 2 users đã login, có conversation
When:  User A gửi message
Then:  ✓ Message lưu vào DB
       ✓ User B thấy message sau 3s (polling)
```

---

## 6. RISKS & MITIGATIONS

| Risk | Impact | Mitigation |
|------|--------|-----------|
| DB Supabase bị disconnect | App crash | Chuyển sang DB self-hosted nếu cần |
| Password hash không tương thích | Users không login được | Test bcrypt compare trước khi deploy |
| Schema conflict khi db push | Tables bị drop | Dùng `--accept-data-loss` flag cẩn thận |
| Missing FKs vì data order | Migration fail | Migrate users → profiles → intents theo thứ tự |

---

*Tạo bởi AWF 4.0 - Design Phase*
