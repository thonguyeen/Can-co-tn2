# 🎨 DESIGN: Phase 04 — Realtime & Storage Replacement

Ngày tạo: 2026-04-06
Dựa trên: `plans/260403-1050-postgres-migration/phase-04-realtime-storage.md`
Status: 🟡 Review

---

## 1. Tổng Quan — Đang Làm Gì?

Phase 03 đã gỡ sạch Supabase khỏi frontend, nhưng để lại **3 tính năng "chết lâm sàng"**:

| Tính năng | File bị tắt | Ảnh hưởng |
|-----------|-------------|-----------|
| Feed Realtime | `hooks/useFeedData.ts` | Feed không tự cập nhật khi có tin mới |
| Feed V2 Realtime | `app/hybrid-v2/page.tsx` | Trang V2 cũng không nhận tin live |
| Chat Realtime | `app/(main)/can-co/chat/[id]/page.tsx` | Tin nhắn chat không tự hiện |

Ngoài ra, **việc upload file** cũng đang "chạy tạm":

| Upload | File | Tình trạng |
|--------|------|------------|
| Ảnh intent (BĐS) | `api/intents/[id]/images/route.ts` | Mock path, KHÔNG lưu file thật |
| CCCD / Sổ đỏ | `api/verify/cccd/route.ts`, `sodo/route.ts` | Lưu vào `public/uploads/` (local) |

**Mục tiêu Phase 04:** Hồi sinh 3 tính năng realtime bằng **Pusher Channels** và chuyển upload sang **Vercel Blob**.

---

## 2. Cách Lưu Thông Tin (Không thay đổi Database)

> 💡 Phase này **KHÔNG** cần thay đổi database schema. Pusher là dịch vụ bên ngoài, Vercel Blob cũng lưu file riêng — chỉ cần lưu URL vào DB.

Tuy nhiên ta cần thêm **biến môi trường**:

```env
# Pusher Channels
PUSHER_APP_ID=xxx
PUSHER_KEY=xxx
PUSHER_SECRET=xxx
PUSHER_CLUSTER=ap1
NEXT_PUBLIC_PUSHER_KEY=xxx       # Client cần để subscribe
NEXT_PUBLIC_PUSHER_CLUSTER=ap1

# Vercel Blob
BLOB_READ_WRITE_TOKEN=xxx
```

---

## 3. Thiết Kế Pusher Channels — Sơ Đồ Luồng

### 3.1. Kiến Trúc Tổng Quan

```
┌──────────────────────────────────────────────────────────────────┐
│  BROWSER (Người dùng A)                                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  usePusher('feed')                                       │   │
│  │  ├── on('new-intent') → fetchRealIntents(background)     │   │
│  │  └── on('new-comment') → fetchComments(background)       │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  usePusher('chat-{convId}')                              │   │
│  │  └── on('new-message') → append message to list          │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────┬───────────────────────────────┘
                                   │ Subscribe (WebSocket)
                                   ▼
                        ┌───────────────────┐
                        │   PUSHER CLOUD     │
                        │   (Channels)       │
                        └─────────┬─────────┘
                                  │ Trigger (HTTP)
                                  ▲
┌─────────────────────────────────┴────────────────────────────────┐
│  SERVER (Next.js API Routes)                                     │
│                                                                  │
│  POST /api/intents      → Prisma INSERT → pusher.trigger(        │
│                              'feed', 'new-intent', { id, type }) │
│                                                                  │
│  POST /api/comments     → Prisma INSERT → pusher.trigger(        │
│                              'feed', 'new-comment', { postId })  │
│                                                                  │
│  POST /api/chat/:id/msg → Prisma INSERT → pusher.trigger(        │
│                              'chat-{convId}', 'new-message',     │
│                              { message })                        │
└──────────────────────────────────────────────────────────────────┘
```

### 3.2. Channel Design

| Channel | Loại | Event | Payload | Ai nhận? |
|---------|------|-------|---------|----------|
| `feed` | Public | `new-intent` | `{ id, type, title }` | Tất cả mọi người đang mở feed |
| `feed` | Public | `new-comment` | `{ intentId, postId }` | Mọi người, nhưng chỉ component liên quan xử lý |
| `private-chat-{convId}` | Private | `new-message` | `{ id, sender_id, content, created_at }` | Chỉ 2 người trong cuộc trò chuyện |

> 💡 **Feed dùng Public channel** vì thông tin feed là công khai.
> **Chat dùng Private channel** vì tin nhắn chỉ 2 người biết — cần auth qua Pusher auth endpoint.

### 3.3. File Mới Cần Tạo

```
lib/
├── pusher/
│   ├── server.ts          ← Pusher server instance (trigger events)
│   └── client.ts          ← Pusher client instance (subscribe)
hooks/
├── usePusher.ts           ← React hook để subscribe + cleanup
app/api/
├── pusher/
│   └── auth/route.ts      ← Auth endpoint cho Private channels
```

---

## 4. Thiết Kế Vercel Blob — Upload File

### 4.1. Kiến Trúc Upload

```
┌──────────────────────────────────────────────────────────────┐
│  BROWSER                                                      │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  <input type="file"> → FormData → POST /api/upload       │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────┬─────────────────────────────┘
                                 │ POST (multipart/form-data)
                                 ▼
┌──────────────────────────────────────────────────────────────┐
│  SERVER: POST /api/upload                                     │
│                                                               │
│  1. Auth check (NextAuth)                                     │
│  2. Validate file (type, size ≤ 5MB)                          │
│  3. Upload → Vercel Blob (put)                                │
│  4. Return { url: "https://xxxxx.public.blob.vercel..." }     │
└──────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
                      ┌───────────────────┐
                      │  VERCEL BLOB      │
                      │  (Edge Storage)   │
                      │  CDN-backed URLs  │
                      └───────────────────┘
```

### 4.2. Upload Endpoints

| Endpoint | Thay thế | Mục đích |
|----------|----------|----------|
| `POST /api/upload` | **NEW** (Generic) | Upload bất kỳ → trả về URL |
| `POST /api/intents/[id]/images` | **MODIFY** | Dùng Vercel Blob thay vì mock path |
| `POST /api/verify/cccd` | **MODIFY** | Dùng Vercel Blob thay vì `public/uploads/` |
| `POST /api/verify/sodo` | **MODIFY** | Dùng Vercel Blob thay vì `public/uploads/` |

### 4.3. File Mới / Sửa

```
lib/
├── blob/
│   └── upload.ts            ← Helper: uploadToBlob(file, folder)
app/api/
├── upload/
│   └── route.ts             ← Generic upload endpoint (NEW)
├── intents/[id]/images/
│   └── route.ts             ← MODIFY: use Vercel Blob
├── verify/cccd/
│   └── route.ts             ← MODIFY: use Vercel Blob
├── verify/sodo/
│   └── route.ts             ← MODIFY: use Vercel Blob
```

---

## 5. Luồng Hoạt Động Chi Tiết

### 📍 Luồng 1: Người dùng đăng Intent mới → Feed cập nhật live

```
1️⃣ User A đăng bài "Cần Mua nhà Q7" → POST /api/intents
2️⃣ Server lưu vào DB (Prisma)
3️⃣ Server gọi pusher.trigger('feed', 'new-intent', { id, type: 'CAN', title })
4️⃣ Pusher Cloud broadcast tới tất cả subscribers
5️⃣ Browser User B đang mở feed → usePusher('feed') nhận event
6️⃣ Hook tự gọi fetchRealIntents(true) → Cập nhật UI (có animation mới)
```

### 📍 Luồng 2: Chat realtime

```
1️⃣ User A gửi tin nhắn → POST /api/chat/{convId}/messages
2️⃣ Server lưu DB + optimistic response
3️⃣ Server gọi pusher.trigger('private-chat-{convId}', 'new-message', { message })
4️⃣ Browser User B nhận event → append message vào list
5️⃣ Không cần refresh, tin nhắn hiện luôn!
```

### 📍 Luồng 3: Upload ảnh BĐS khi đăng Intent

```
1️⃣ User chọn ảnh → POST /api/upload (multipart/form-data)
2️⃣ Server upload lên Vercel Blob → nhận URL CDN
3️⃣ Server trả về { url: "https://xxxxx.public.blob.vercel-storage.com/..." }
4️⃣ Frontend hiển thị preview
5️⃣ Khi submit Intent → gửi danh sách URLs kèm theo
```

---

## 6. Danh Sách Tất Cả Files Cần Xử Lý

### 🆕 Files Mới (6 files)

| # | File | Chức năng |
|---|------|-----------|
| 1 | `lib/pusher/server.ts` | Khởi tạo Pusher server instance |
| 2 | `lib/pusher/client.ts` | Khởi tạo Pusher client (browser) |
| 3 | `hooks/usePusher.ts` | React hook subscribe/unsubscribe |
| 4 | `app/api/pusher/auth/route.ts` | Auth cho private channels |
| 5 | `lib/blob/upload.ts` | Helper upload Vercel Blob |
| 6 | `app/api/upload/route.ts` | Generic upload endpoint |

### ✏️ Files Sửa — Pusher Integration (5 files)

| # | File | Thay đổi |
|---|------|----------|
| 7 | `hooks/useFeedData.ts` | Thêm usePusher('feed') thay TODO |
| 8 | `app/hybrid-v2/page.tsx` | Thêm Pusher subscribe |
| 9 | `app/(main)/can-co/chat/[id]/page.tsx` | Thêm Pusher private channel |
| 10 | `app/api/intents/route.ts` (POST) | Trigger `feed:new-intent` sau INSERT |
| 11 | `app/api/comments/route.ts` (POST) | Trigger `feed:new-comment` sau INSERT |

### ✏️ Files Sửa — Vercel Blob (3 files)

| # | File | Thay đổi |
|---|------|----------|
| 12 | `app/api/intents/[id]/images/route.ts` | Thay mock → Vercel Blob |
| 13 | `app/api/verify/cccd/route.ts` | Thay local fs → Vercel Blob |
| 14 | `app/api/verify/sodo/route.ts` | Thay local fs → Vercel Blob |

### 🗑️ Files Cần Xóa (2 files — legacy dead code)

| # | File | Lý do |
|---|------|-------|
| 15 | `lib/realtime/feed-subscription.ts` | Polling cũ, thay bằng Pusher |
| 16 | `hooks/useRealtimeFeed.ts` | Hook cũ, không ai dùng |

---

## 7. Checklist Kiểm Tra — Làm sao biết là XONG?

### ✅ Realtime — Pusher

- [ ] Mở 2 tab browser → đăng intent ở tab A → tab B thấy intent mới xuất hiện (không cần F5)
- [ ] Mở chat room → gửi tin ở tab A → tab B thấy tin ngay lập tức
- [ ] Comment mới từ bot → Observer sidebar có cập nhật
- [ ] Đóng tab → không có memory leak (channel được unsubscribe)
- [ ] Mất mạng → reconnect tự động (Pusher xử lý)

### ✅ Storage — Vercel Blob

- [ ] Upload ảnh BĐS → URL trả về là `https://xxxxx.public.blob.vercel-storage.com/...`
- [ ] Upload CCCD → OCR vẫn hoạt động bình thường
- [ ] Upload Sổ Đỏ → OCR vẫn hoạt động bình thường
- [ ] File > 5MB → trả lỗi 400
- [ ] File không phải ảnh → trả lỗi 400

### ✅ Cleanup

- [ ] Xóa `lib/realtime/feed-subscription.ts`
- [ ] Xóa `hooks/useRealtimeFeed.ts`
- [ ] `npx tsc --noEmit` → Exit Code 0
- [ ] `npm run dev` → chạy bình thường trên port 4000

---

## 8. Thứ Tự Thực Hiện (Implementation Order)

```
Step 1: Cài đặt packages
        └── npm install pusher pusher-js @vercel/blob

Step 2: Tạo Pusher Server + Client lib
        └── lib/pusher/server.ts, lib/pusher/client.ts

Step 3: Tạo hook usePusher
        └── hooks/usePusher.ts

Step 4: Tạo Pusher Auth endpoint
        └── app/api/pusher/auth/route.ts

Step 5: Integrate Pusher vào Feed
        └── Sửa useFeedData.ts, hybrid-v2/page.tsx
        └── Sửa POST /api/intents + /api/comments → trigger events

Step 6: Integrate Pusher vào Chat
        └── Sửa chat/[id]/page.tsx
        └── Sửa POST /api/chat/[id]/messages → trigger events

Step 7: Tạo Vercel Blob helper + Upload endpoint
        └── lib/blob/upload.ts, app/api/upload/route.ts

Step 8: Migrate 3 upload routes sang Vercel Blob
        └── intents/[id]/images, verify/cccd, verify/sodo

Step 9: Cleanup legacy files
        └── Xóa feed-subscription.ts, useRealtimeFeed.ts

Step 10: Verify — tsc + manual test trên browser
```

---

*Tạo bởi AWF 2.1 — Design Phase*
*Dựa trên analysis 16 files source code*
