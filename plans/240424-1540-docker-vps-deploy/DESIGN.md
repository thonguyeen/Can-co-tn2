# 🎨 DESIGN: Docker VPS Deployment

Ngày tạo: 2026-04-24
Plan: `plans/240424-1540-docker-vps-deploy/`

---

## 1. Kiến trúc mạng (Network Topology)

```
Internet → Cloudflare CDN
   → cloudflared_tunnel (container đã có)
      → nginx_proxy (:80/:443)
         ├── cancotn.com     → can-co_app:4000
         ├── goclaw domain   → goclaw_app:18790
         └── n8n domain      → n8n_app:5678

Docker Networks:
┌─── shared (external) ────────────────────────┐
│  nginx_proxy ↔ can-co_app ↔ n8n_app          │
└──────────────────────────────────────────────┘
┌─── cancotn (internal) ───────────────────────┐
│  can-co_app ↔ can-co_db                      │
└──────────────────────────────────────────────┘
```

---

## 2. Dockerfile (Multi-Stage Build)

**Strategy:** 3 stages để image nhỏ nhất (~150MB)

```dockerfile
# ── Stage 1: Dependencies ──────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# ── Stage 2: Builder ───────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Prisma generate
RUN npx prisma generate

# Next.js standalone build
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ── Stage 3: Runner ────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=4000
ENV HOSTNAME=0.0.0.0

# Non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone output
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Prisma client (cần cho runtime)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/prisma ./prisma

USER nextjs
EXPOSE 4000

CMD ["node", "server.js"]
```

**Điểm quan trọng:**
- `output: 'standalone'` trong `next.config.ts` → Next.js tạo `server.js` tự chứa
- Prisma client cần copy riêng vì standalone không bundle nó
- Non-root user `nextjs` cho bảo mật
- Alpine image → nhẹ

---

## 3. next.config.ts (Cần sửa)

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',           // ← BẮT BUỘC cho Docker
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',           // FB CDN images, placeholder, etc.
      },
    ],
  },
};

export default nextConfig;
```

---

## 4. docker-compose.prod.yml

```yaml
services:
  app:
    container_name: can-co_app
    build:
      context: ./app
      dockerfile: Dockerfile
    restart: unless-stopped
    ports:
      - "127.0.0.1:4000:4000"    # Chỉ local — nginx proxy vào
    env_file: .env.production
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - cancotn
      - shared
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:4000/api/intents?limit=1"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  postgres:
    container_name: can-co_db
    image: postgres:16-alpine
    restart: unless-stopped
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: cancotn
      POSTGRES_USER: cancotn
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:?POSTGRES_PASSWORD required}
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U cancotn"]
      interval: 5s
      timeout: 3s
      retries: 5
    networks:
      - cancotn

volumes:
  pgdata:
    name: cancotn_pgdata

networks:
  cancotn:
    name: cancotn
  shared:
    external: true
```

**Điểm quan trọng:**
- Port `127.0.0.1:4000` → chỉ truy cập local, nginx forward vào
- `shared` network external → dùng chung với n8n, nginx
- Healthcheck dùng wget (Alpine không có curl mặc định)
- Postgres password bắt buộc (fail fast nếu thiếu)

---

## 5. .env.production.example

```bash
# ═══ DATABASE ═══
POSTGRES_PASSWORD=<openssl rand -hex 16>
DATABASE_URL=postgresql://cancotn:${POSTGRES_PASSWORD}@can-co_db:5432/cancotn?schema=public

# ═══ AUTH ═══
NEXTAUTH_URL=https://cancotn.com
NEXTAUTH_SECRET=<openssl rand -hex 32>

# ═══ ADMIN ═══
ADMIN_EMAILS=admin@cancotn.com

# ═══ N8N WEBHOOK ═══
N8N_WEBHOOK_SECRET=<openssl rand -hex 32>

# ═══ AI PROVIDERS ═══
AI_PRIMARY_API_KEY=
AI_PRIMARY_BASE_URL=http://9router_app:20128/v1
AI_PRIMARY_MODEL=cb1-chatbot-opencode
AI_FALLBACK_API_KEY=
AI_FALLBACK_BASE_URL=https://futrixapi.com/v1
AI_FALLBACK_MODEL=auto
OPENAI_API_KEY=
OPENAI_BASE_URL=http://9router_app:20128/v1
OPENAI_MODEL=cb1-chatbot-opencode

# ═══ MAP ═══
NEXT_PUBLIC_ORS_API_KEY=
```

> ⚡ **Bonus:** `AI_PRIMARY_BASE_URL` có thể trỏ thẳng vào `9router_app` qua Docker network → AI cũng nhanh hơn!

---

## 6. deploy.sh

```bash
#!/bin/bash
set -e

cd /opt/can-co-tn
echo "📥 Pulling latest code..."
git pull origin main

echo "🔨 Building app..."
docker compose -f docker-compose.prod.yml build --no-cache app

echo "🚀 Starting new container..."
docker compose -f docker-compose.prod.yml up -d

echo "🧹 Cleaning old images..."
docker image prune -f

echo ""
echo "✅ Deploy xong! Kiểm tra:"
echo "   docker ps | grep can-co"
echo "   curl -s http://localhost:4000 | head -5"
```

---

## 7. nginx/cancotn.conf

```nginx
upstream cancotn_backend {
    server can-co_app:4000;
}

server {
    listen 80;
    server_name cancotn.com www.cancotn.com;

    # Giới hạn body size (upload ảnh)
    client_max_body_size 10M;

    location / {
        proxy_pass http://cancotn_backend;
        proxy_http_version 1.1;

        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;

        # Forward headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Cache static assets
    location /_next/static/ {
        proxy_pass http://cancotn_backend;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## 8. .dockerignore

```
node_modules
.next
.env*
!.env.example
.git
.gitignore
.brain
plans
docs
*.md
!README.md
.vscode
.agent
.agents
```

---

## 9. Luồng Deploy (Zero-Downtime)

```
Developer (local):
  1. Code + test → git push

VPS (SSH):
  2. ./deploy.sh
     ├── git pull                        (~5s)
     ├── docker build (multi-stage)      (~60-90s, web vẫn chạy)
     ├── docker up -d app               (~2-3s swap, CF buffer)
     └── docker image prune             (~1s)

Kết quả: Web mới chạy, user hầu như không thấy gián đoạn
```

---

## 10. Test Cases

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TC-01: Docker build thành công
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
When:  docker compose -f docker-compose.prod.yml build app
Then:  ✓ Build xong, không lỗi
       ✓ Image size < 300MB

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TC-02: Containers start & healthy
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
When:  docker compose up -d
Then:  ✓ can-co_app: healthy
       ✓ can-co_db: healthy

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TC-03: Web trả HTML
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
When:  curl http://localhost:4000
Then:  ✓ HTML response, status 200

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TC-04: n8n internal webhook
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
When:  docker exec n8n_app wget -qO- http://can-co_app:4000
Then:  ✓ Response OK (DNS resolution qua shared network)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TC-05: Deploy update zero-downtime
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
When:  Chạy ./deploy.sh khi web đang live
Then:  ✓ Web vẫn truy cập được trong lúc build
       ✓ Thay đổi hiển thị sau khi deploy xong
```

---

*Tạo bởi AWF — Design Phase*
