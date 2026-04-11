# Phase 04: Production DB — Docker PostgreSQL trên VPS
Status: ⬜ Pending
Dependencies: Phase 03

## Objective
Triển khai PostgreSQL trên VPS bằng Docker (thay vì Supabase). Dùng chung kiến trúc Docker đã quen từ local dev, scale lên production.

## Kiến trúc Production

```
VPS (Ubuntu/Debian)
├── Docker: PostgreSQL 16 (pgvector) ← Database
├── Docker: Next.js App              ← Hoặc chạy trực tiếp
└── Nginx reverse proxy (optional)
```

**Connection:** App kết nối trực tiếp localhost:5432 trên cùng VPS → Không cần PgBouncer.

## Implementation Steps

### A. Chuẩn bị Docker Compose cho Production

1. [ ] **Tạo `docker-compose.prod.yml`**
   - PostgreSQL 16 với pgvector extension
   - Volume persist data (không mất khi restart container)  
   - Env vars cho DB password mạnh (không dùng admin/admin123)
   - Restart policy: `always`

2. [ ] **Tạo `.env.production`**
   ```env
   DATABASE_URL="postgresql://cancotn:STRONG_PASSWORD@localhost:5432/cancotn_prod?schema=public"
   DIRECT_URL="postgresql://cancotn:STRONG_PASSWORD@localhost:5432/cancotn_prod?schema=public"
   NEXTAUTH_URL="https://your-domain.com"
   NEXTAUTH_SECRET="<generate-new-secret>"
   ```

### B. Setup trên VPS

3. [ ] **SSH vào VPS, cài Docker + Docker Compose**
   ```bash
   # Nếu chưa có
   curl -fsSL https://get.docker.com | sh
   ```

4. [ ] **Upload project lên VPS** (git clone hoặc rsync)

5. [ ] **Khởi động Database container**
   ```bash
   docker compose -f docker-compose.prod.yml up -d db
   ```

6. [ ] **Push schema lên DB production**
   ```bash
   npx prisma db push
   ```

7. [ ] **Seed data demo (tùy chọn)**
   ```bash
   npx prisma db seed
   ```

### C. Bảo mật Database

8. [ ] **Không expose port 5432 ra public**
   - Docker bind chỉ `127.0.0.1:5432:5432` (không phải `0.0.0.0`)
   - Firewall block port 5432 từ bên ngoài

9. [ ] **Backup strategy**
   - Cron job chạy `pg_dump` hàng ngày
   - Lưu backup ra folder riêng hoặc S3

## Files to Create/Modify
- `docker-compose.prod.yml` — [NEW] Production Docker config
- `.env.production` — [NEW] Production environment variables
- `scripts/backup-db.sh` — [NEW] Backup script (optional)
- `app/.env.local` — Giữ nguyên local dev config (không đổi)

## So sánh: Docker VPS vs Supabase

| | Docker trên VPS | Supabase |
|--|----------------|----------|
| **Chi phí** | Chỉ VPS (~$5-10/mo) | Free tier giới hạn, paid ~$25/mo |
| **Kiểm soát** | Toàn quyền | Bị phụ thuộc platform |
| **Latency** | Cực thấp (cùng server) | Phụ thuộc region |
| **Backup** | Tự quản lý | Auto backup |
| **Scale** | Nâng RAM/CPU VPS | Nâng plan |

## ⚠️ Rủi ro
- **Mất data nếu VPS lỗi:** Cần backup định kỳ (`pg_dump` cron)
- **Security:** Phải tự bảo mật PostgreSQL (không expose public, password mạnh)
- **Mitigation:** Docker volume + backup script + firewall rules

## Test Criteria
- [ ] `docker compose -f docker-compose.prod.yml up -d` → Container chạy
- [ ] `npx prisma db push` → Schema push thành công
- [ ] App kết nối DB Docker → Feed hiển thị
- [ ] Port 5432 KHÔNG truy cập được từ bên ngoài VPS

---
Next Phase: [Phase 05 - Build Verification & Commit](./phase-05-build-commit.md)
