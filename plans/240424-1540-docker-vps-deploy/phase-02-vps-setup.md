# Phase 02: VPS Setup & Deploy
Status: ⬜ Pending
Dependencies: Phase 01

## Objective
Deploy lên VPS thật: clone repo, config env, start containers, kết nối nginx + CF tunnel.

## Implementation Steps (Chạy trên VPS qua SSH)

### 1. Clone repo & config
- [ ] `git clone` repo vào `/opt/can-co-tn/`
- [ ] Copy `.env.production.example` → `.env.production` và điền giá trị thật
- [ ] Tạo N8N_WEBHOOK_SECRET mạnh: `openssl rand -hex 32`
- [ ] Tạo NEXTAUTH_SECRET mạnh: `openssl rand -hex 32`

### 2. Tạo Docker shared network
- [ ] `docker network create shared` (nếu chưa có)
- [ ] `docker network connect shared n8n_app`
- [ ] `docker network connect shared nginx_proxy`

### 3. Build & start
- [ ] `chmod +x deploy.sh && ./deploy.sh`
- [ ] Verify: `docker ps` hiện can-co_app + can-co_db đều healthy

### 4. Prisma migrate
- [ ] `docker exec can-co_app npx prisma db push`
- [ ] (Optional) Seed data nếu cần

### 5. Nginx config
- [ ] Copy `nginx/cancotn.conf` vào folder nginx config trên VPS
- [ ] `docker exec nginx_proxy nginx -t` — check syntax
- [ ] `docker exec nginx_proxy nginx -s reload` — reload

### 6. Cloudflare Tunnel
- [ ] Thêm hostname rule cho domain → `http://nginx_proxy:80`
- [ ] Hoặc qua Cloudflare Dashboard nếu dùng managed tunnel

## Test Criteria
- [ ] `curl http://localhost:4000` trả HTML (internal)
- [ ] `curl https://cancotn.com` trả HTML (external qua CF)
- [ ] Đăng nhập hoạt động (NextAuth)
- [ ] Feed hiển thị intents từ DB

---
Next Phase: Phase 03 — Smoke Test & n8n Connect
