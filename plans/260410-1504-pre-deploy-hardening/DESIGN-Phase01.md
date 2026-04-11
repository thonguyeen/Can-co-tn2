# 🎨 DESIGN: Phase 01 - Security Hardening (Orchestrator APIs)

Ngày tạo: 2026-04-10
Cập nhật: 2026-04-10 (Tech Lead review — fix 3 gaps)
Dựa trên: `plans/260410-1504-pre-deploy-hardening/phase-01-security-hardening.md`

---

## 1. Cơ Chế Bảo Mật (Cửa nhiều lớp)

Hành động của Middleware và Route Guards sẽ giống như một chốt gác bảo vệ dân phòng nhiều tầng:

- **Tầng 1 (Middleware.ts):** Người lạ (không đăng nhập) sẽ không thể vào trong → `401 Unauthorized`
- **Tầng 2 (Route /api/orchestrator):** Dù đăng nhập cũng phải có "thẻ VIP Admin" (Email nằm trong danh sách `ADMIN_EMAILS`) → `403 Forbidden`

## 2. API Endpoint Protection

| API | Chức năng (Mục đích) | Trạng thái bảo vệ MỚI |
|---|---|---|
| `GET /api/orchestrator` | Xem trạng thái/thống kê Bot | Admin Only (`JWT` + `Admin Check`) |
| `POST /api/orchestrator` | Khởi tạo, bật/tắt hành vi của bot spam | Admin Only (`JWT` + `Admin Check`) |

## 3. Luồng Hoạt Động

### Kịch bản 1: Người lạ (Không token)
1. Cố ý gõ lệnh `GET /api/orchestrator` để xem bot.
2. Vấp ngay Middleware ở `app/middleware.ts`.
3. Bị đá ra ngay lập tức với mã `401 Unauthorized`. Thất bại!

### Kịch bản 2: Người xem nhà (User thường)
1. Đã đăng nhập, gửi lệnh `GET /api/orchestrator`
2. Middleware cho qua (vì đã có JWT token).
3. Đến Route `route.ts`, `requireAdmin()` soi chiếu thấy Email không nằm trong `ADMIN_EMAILS`.
4. Bị đá ra với mã `403 Forbidden` — "Bạn không có quyền quản trị". Thất bại!

### Kịch bản 3: Admin (Quyền tối cao)
1. Đăng nhập bằng Email quyền lực (đã cài đặt ở `ADMIN_EMAILS`).
2. Middleware cho qua ✅
3. `requireAdmin()` xác nhận Email hợp lệ ✅
4. Gửi Request thành công, bot được tạo mượt mà. `200 OK`

## 4. Code Pattern (Copy từ /api/admin/*)

### 4.1. middleware.ts — Xóa bypass (line 15)

**Trước:**
```typescript
if (pathname.startsWith('/api/cron') || pathname.startsWith('/api/dev') || pathname.startsWith('/api/orchestrator')) {
```

**Sau:**
```typescript
if (pathname.startsWith('/api/cron')) {
```

> ⚠️ `/api/dev` cũng bị xóa ở đây — gộp từ Phase 02 để tránh sửa file 2 lần.

### 4.2. route.ts — Thêm Admin Guard

**Import thêm (đầu file):**
```typescript
import { requireAdmin } from '@/lib/admin/guard';
```

**Dòng đầu tiên trong mỗi handler GET và POST:**
```typescript
const guard = await requireAdmin();
if (!guard.isAdmin) return guard.response;
```

> Pattern proven — đã dùng nguyên bản trong 9 admin routes (xem `api/admin/users/route.ts` line 8-9).

## 5. Fix bổ sung: `saveBot()` trong persistence.ts

### Vấn đề
Hàm `saveBot()` (line 12-42) upsert bot nhưng **thiếu** các trường Envoy:
- `isEnvoy`
- `assignedProvince`
- `assignedDistrict`
- `dailyQuota`

### Sửa
Thêm các trường vào cả block `update` và `create`:

```typescript
// Trong update block:
...(bot.isEnvoy !== undefined && { isEnvoy: bot.isEnvoy }),
...(bot.assignedProvince && { assignedProvince: bot.assignedProvince }),
...(bot.assignedDistrict && { assignedDistrict: bot.assignedDistrict }),
...(bot.dailyQuota !== undefined && { dailyQuota: bot.dailyQuota }),

// Trong create block (tương tự):
isEnvoy: bot.isEnvoy ?? false,
assignedProvince: bot.assignedProvince ?? null,
assignedDistrict: bot.assignedDistrict ?? null,
dailyQuota: bot.dailyQuota ?? 0,
```

> Đảm bảo `GeneratedBot` type trong `bot-factory.ts` đã có các trường này.

## 6. Test Cases (Checklist Nghiệm Thu)

### Bảng mã HTTP chuẩn

| Kịch bản | Tầng chặn | HTTP Code | Message |
|----------|-----------|-----------|---------|
| Chưa đăng nhập | Middleware | **401** | "Unauthorized / Cần đăng nhập" |
| User thường (đã login) | Route Guard | **403** | "Forbidden: Bạn không có quyền quản trị" |
| Admin | Không chặn | **200** | Data bình thường |

### Tình huống kiểm tra
- [ ] **TC-01:** Truy cập nặc danh (Log out). Gọi GET `/api/orchestrator` → mong đợi `401 Unauthorized`.
- [ ] **TC-02:** Tài khoản thường (User). Đăng nhập acc phụ, gọi POST `/api/orchestrator` → mong đợi `403 Forbidden`.
- [ ] **TC-03:** Admin gọi hệ thống. Đăng nhập Email Admin, gọi GET/POST → Server trả về `200` và data chạy chuẩn xác.
- [ ] **TC-04:** Tạo Envoy Bot mới qua Orchestrator → Bot lưu với đủ `isEnvoy`, `assignedProvince`, `dailyQuota`.

## 7. Implementation Checklist

```
□ middleware.ts line 15: Xóa "|| pathname.startsWith('/api/dev') || pathname.startsWith('/api/orchestrator')"
□ route.ts: import { requireAdmin } from '@/lib/admin/guard'
□ route.ts GET: Thêm 2 dòng guard ở đầu function body
□ route.ts POST: Thêm 2 dòng guard ở đầu function body (trong try block)
□ persistence.ts saveBot(): Thêm isEnvoy, assignedProvince, assignedDistrict, dailyQuota
□ Verify ADMIN_EMAILS có trong .env.local
□ Chạy TC-01, TC-02, TC-03, TC-04
```

---

*Cập nhật bởi AWF Tech Lead Checkpoint — 2026-04-10*
