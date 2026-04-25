# Phase 01: Docker Build Files
Status: ✅ Complete — 2026-04-24T16:15:00+07:00
Dependencies: None

## Objective
Tạo Dockerfile + docker-compose.prod.yml + .dockerignore + deploy.sh + nginx config + env template.
Tất cả file này nằm trong repo, khi lên VPS chỉ cần `git clone` + `./deploy.sh`.

## Implementation Steps

### 1. Tạo `app/Dockerfile` (multi-stage build)
- [x] Stage 1 `deps`: install dependencies (npm ci)
- [x] Stage 2 `builder`: build Next.js production (`next build`)
- [x] Stage 3 `runner`: copy .next/standalone + static + public → chạy `node server.js`
- [x] Cần `output: 'standalone'` trong `next.config.ts` để Next.js tạo server.js
- [x] sharp cần `--platform=linux --arch=x64` khi install

Lưu ý:
- Base image: `node:20-alpine`
- User: `nextjs` (non-root)
- Port: 4000 (expose)
- ENV: `NODE_ENV=production`, `PORT=4000`, `HOSTNAME=0.0.0.0`

### 2. Sửa `app/next.config.ts`
- [x] Thêm `output: 'standalone'` — bắt buộc cho Docker standalone mode
- [x] Thêm `images.remotePatterns` nếu cần (FB CDN images)

### 3. Tạo `app/.dockerignore`
- [x] Ignore: node_modules, .next, .env.local, .git, .brain, plans/, docs/

### 4. Tạo `docker-compose.prod.yml` (root project)
- [x] Service `app`: build từ `./app`, port 127.0.0.1:4000:4000, depends_on postgres
- [x] Service `postgres`: image postgres:16-alpine, volume persistent, healthcheck
- [x] Network `cancotn` (private app↔db)
- [x] Network `shared` (external, cho n8n)
- [x] env_file: `.env.production`

### 5. Tạo `.env.production.example`
- [x] DATABASE_URL (postgres container internal)
- [x] NEXTAUTH_URL, NEXTAUTH_SECRET
- [x] N8N_WEBHOOK_SECRET
- [x] AI keys
- [x] ORS key

### 6. Tạo `deploy.sh`
- [x] git pull
- [x] docker compose -f docker-compose.prod.yml build --no-cache app
- [x] docker compose -f docker-compose.prod.yml up -d
- [x] docker image prune -f
- [x] Prisma migrate nếu cần (optional flag)

### 7. Tạo `nginx/cancotn.conf`
- [x] server_name cho domain
- [x] proxy_pass http://can-co_app:4000
- [x] WebSocket upgrade headers
- [x] Proxy headers (X-Real-IP, X-Forwarded-For, X-Forwarded-Proto)

## Files to Create/Modify

| Action | File | Purpose |
|--------|------|---------|
| MODIFY | `app/next.config.ts` | Thêm `output: 'standalone'` |
| NEW | `app/Dockerfile` | Multi-stage build Next.js |
| NEW | `app/.dockerignore` | Exclude dev files |
| NEW | `docker-compose.prod.yml` | Production stack (app + postgres) |
| NEW | `.env.production.example` | Template env cho VPS |
| NEW | `deploy.sh` | 1-click deploy script |
| NEW | `nginx/cancotn.conf` | Nginx reverse proxy config |

## Test Criteria
- [x] `docker compose -f docker-compose.prod.yml build app` thành công
- [x] Container start, health check PASS
- [x] `curl http://localhost:4000` trả HTML
