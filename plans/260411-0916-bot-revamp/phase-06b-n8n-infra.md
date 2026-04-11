# Phase 06b: n8n Crawler Infrastructure
Status: ⬜ Pending
Dependencies: Phase 04 (Orchestrator refactor cần xong — webhook gọi `triggerCrawlAndCurate()`)

## Objective
Thêm n8n làm "vòi nước bổ sung" cho pipeline crawling. n8n xử lý các nguồn mà GenericCrawler không làm được (SPA sites cần headless browser, anti-bot bypass). GenericCrawler vẫn là fallback khi n8n down.

**Mô hình: Hybrid (A)** — n8n push data vào Next.js qua webhook, Next.js vẫn giữ GenericCrawler riêng.

## Requirements

### Functional
- [ ] n8n chạy trong Docker, persist workflow data
- [ ] Webhook API route nhận data từ n8n (authenticated)
- [ ] ≥1 n8n workflow mẫu: crawl trang SPA (Puppeteer) → push webhook
- [ ] ≥1 n8n workflow mẫu: Facebook Group (nếu có token) → push webhook
- [ ] Admin UI hiện badge "n8n managed" cho nguồn do n8n quản lý (optional)
- [ ] n8n error → alert (Telegram/Email workflow)

### Non-Functional
- [ ] GenericCrawler không bị ảnh hưởng — dual-source architecture
- [ ] Webhook có API key validation (`N8N_WEBHOOK_SECRET`)
- [ ] n8n container auto-restart, volume persist

## Implementation Steps

1. [ ] **Thêm n8n vào `docker-compose.yml`**:
   ```yaml
   n8n:
     image: n8nio/n8n:latest
     container_name: cancotn_n8n
     ports:
       - "5678:5678"
     environment:
       - N8N_BASIC_AUTH_ACTIVE=true
       - N8N_BASIC_AUTH_USER=admin
       - N8N_BASIC_AUTH_PASSWORD=${N8N_PASSWORD}
       - WEBHOOK_URL=http://host.docker.internal:4000
     volumes:
       - n8n_data:/home/node/.n8n
     restart: unless-stopped
   ```

2. [ ] **Tạo `api/crawler/webhook/route.ts`**:
   - POST endpoint nhận `{ items: RawCrawlItem[], sourceName, sourceUrl }`
   - Validate `Authorization: Bearer ${N8N_WEBHOOK_SECRET}`
   - Forward items → `orchestrator.createIntentFromCrawledData()` (hoặc save RawNews nếu Phase 03 Curator đã active)
   - Return: `{ success, saved, duplicate, errors }`

3. [ ] **Tạo n8n workflow: BDS SPA Crawler**:
   - Cron trigger → Puppeteer node (headless) → Cào HTML rendered → Parse items → POST webhook
   - Target: ChoTot hoặc trang SPA tương tự

4. [ ] **Tạo n8n workflow: Facebook Group** (optional):
   - Cron trigger → Facebook Graph API node → Parse posts → POST webhook
   - Chỉ khi có FACEBOOK_ACCESS_TOKEN

5. [ ] **Update `.env.local`**:
   ```
   N8N_WEBHOOK_SECRET=xxx
   N8N_PASSWORD=xxx
   ```

6. [ ] **Admin UI badge** (optional):
   - `CrawlSourcesTab`: Nếu source có `notes` chứa `"managed_by": "n8n"` → hiện badge 🤖 n8n

## Files to Create/Modify

### Create:
- `app/app/api/crawler/webhook/route.ts` — Webhook nhận data từ n8n

### Modify:
- `docker-compose.yml` — Thêm n8n service
- `.env.local` / `.env.example` — Thêm n8n secrets
- `app/app/admin/components/CrawlSourcesTab.tsx` — Badge n8n (optional)

## Test Criteria
- [ ] `docker compose up` → n8n accessible tại localhost:5678
- [ ] POST `/api/crawler/webhook` với API key đúng → 200, items saved
- [ ] POST `/api/crawler/webhook` không có key → 401 Unauthorized
- [ ] n8n workflow chạy → data xuất hiện trong RawNews/Intents
- [ ] GenericCrawler vẫn hoạt động bình thường (dual-source)
- [ ] n8n down → app không bị ảnh hưởng

## Notes
- n8n Community Edition miễn phí, self-hosted
- Puppeteer trên n8n cần RAM ~500MB — lưu ý khi deploy VPS nhỏ
- Có thể skip phase này nếu GenericCrawler đủ tốt sau Phase 04
- Đây là phase ĐỘC LẬP — có thể bỏ qua mà không ảnh hưởng Phase 07

---
Next Phase: [Phase 07 - Integration Testing](./phase-07-testing.md)
