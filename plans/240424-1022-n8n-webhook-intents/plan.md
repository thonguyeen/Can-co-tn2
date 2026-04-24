# Plan: n8n Webhook → Intent Injection
Created: 2026-04-24T10:22:00+07:00
Updated: 2026-04-24T14:30:00+07:00
Status: ✅ Complete

## Overview
Tạo API webhook chuyên dụng `POST /api/webhook/n8n-intents` để n8n đẩy bài viết **đã được AI parse sẵn** từ Facebook Group vào database Cần & Có.

## Kiến trúc: n8n parse, Webhook chỉ insert

```
n8n Workflow:
  1. Crawl FB Group → raw JSON
  2. AI Node (OpenAI/Claude) → parse: type, price, district, title...
  3. POST /api/webhook/n8n-intents → gửi data đã parsed

Webhook (backend):
  ✅ Validate API key
  ✅ Dedup by FB post ID
  ✅ Insert intent (data đã sẵn sàng, KHÔNG gọi AI)
  ✅ Trigger matching engine (fire-and-forget)
```

**Lý do chọn n8n-side AI:**
- Webhook đơn giản = ít bug, nhanh hơn
- Sửa prompt AI trên n8n = 0 deploy
- Server nhẹ hơn (n8n gánh AI)
- n8n có retry built-in khi AI fail

## Tech Stack
- Backend: Next.js API Route (TypeScript)
- Database: PostgreSQL (Prisma ORM)
- Auth: API Key via `x-api-key` header
- Reuse: `intent-injector.ts` → `getOrCreateCrawlUser()`, matching engine

## Phases

| Phase | Name | Status | Progress |
|-------|------|--------|----------|
| 01 | Webhook API + Middleware | ✅ Complete | 100% |
| 02 | Verification & n8n Config | ✅ Complete | 100% |

## Quick Commands
- Start Phase 1: `/code phase-01`
- Check progress: `/next`
