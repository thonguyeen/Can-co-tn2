# Plan: Docker VPS Deployment (Cloudflare Tunnel)
Created: 2026-04-24T15:40:00+07:00
Status: 🟡 In Progress

## Overview
Deploy Can&Co (Next.js) lên VPS 8GB RAM bằng Docker, qua Cloudflare Tunnel đã có sẵn.
- **Chiến lược:** Option A — Build rồi swap (zero-downtime nhờ CF buffer)
- **Networking:** Docker shared network để n8n gọi webhook nội bộ (~1ms)
- **Dùng lại:** nginx_proxy + cloudflared_tunnel đã chạy sẵn trên VPS

## Hạ tầng VPS hiện tại
```
nginx_proxy (:80/:443) — Reverse proxy chung
cloudflared_tunnel     — Kết nối Cloudflare
n8n_app (:5678)        — Crawler automation
goclaw_app (:18790)    — App khác
goclaw_postgres        — DB khác (KHÔNG dùng chung)
goclaw_redis           — Cache khác
9router_app            — AI router
```

## Kiến trúc target
```
Internet → CF Tunnel → nginx_proxy → can-co_app (:4000) → can-co_db (:5432)
                                                  ↑
                                n8n_app ── shared network ──┘ (webhook nội bộ)
```

## Tech Stack
- Runtime: Node.js 20 (Alpine) + Next.js 16.1.3
- Database: PostgreSQL 16 (container riêng)
- ORM: Prisma 7.6
- Image processing: sharp (cần native deps)
- Reverse proxy: nginx (đã có)
- Tunnel: Cloudflare (đã có)

## Phases

| Phase | Name | Status | Progress |
|-------|------|--------|----------|
| 01 | Docker Build Files | ⬜ Pending | 0% |
| 02 | VPS Setup & Deploy | ⬜ Pending | 0% |
| 03 | Smoke Test & n8n Connect | ⬜ Pending | 0% |

## Quick Commands
- Start Phase 1: `/code phase-01`
- Check progress: `/next`
