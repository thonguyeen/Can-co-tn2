# Plan: Bot System Revamp — Data-First Architecture
Created: 2026-04-11
Status: 🟢 Phase 02 Complete
Brief: [BRIEF-bot-revamp.md](../BRIEF-bot-revamp.md)

## Overview
Chuyển đổi toàn bộ hệ thống Bot từ mô hình "LLM bịa nội dung" sang "Data-First" — bot chỉ thu thập, chuẩn hóa, và phân tích dữ liệu thật. Tích hợp Global Chatbot (NHA.AI) thành trợ lý cá nhân hóa có nhớ lịch sử.

## Tech Stack
- **Runtime:** Next.js 15 (App Router) + TypeScript
- **Database:** PostgreSQL (Prisma 7)
- **AI:** OpenAI-compatible API (3-tier fallback: Anthropic → 9Router → SimpleVerse)
- **Crawling:** rss-parser, cheerio, Facebook Graph API, n8n (Phase 06b)
- **Workflow Automation:** n8n (Docker, headless browser, visual workflow)
- **Existing modules:** `lib/openclaw/` (26 files)

## Phases

| Phase | Name | Status | Scope |
|-------|------|--------|-------|
| 01 | Database Schema & Bot Config UI | ✅ Complete | Schema mới + Admin UI cho System Prompt/Knowledge/Schedule |
| 02 | Crawler Mở Rộng | ✅ Complete | +4 sourceTypes, 4 site presets, FacebookCrawler, Test button UI, 3 nguồn BĐS seeded |
| 03 | Curator Bot (LLM Parse Pipeline) | ⬜ Pending | Tách parse ra khỏi orchestrator, category-agnostic |
| 04 | Orchestrator Refactor & FACEBOT Chuyển Vai | ⬜ Pending | Bỏ auto-posting, chỉ giữ comment/react on real data |
| 05 | Analyst Bot (Báo Cáo Tự Động) | ⬜ Pending | Tổng hợp intents thật → tạo Market Report |
| 06 | Global Chatbot Personalization (NHA.AI) | ⬜ Pending | Chat history persistence, context-aware, Analyst data injection |
| 06b | n8n Crawler Infrastructure | ⬜ Pending | Docker setup, webhook API, Puppeteer workflows cho SPA sites |
| 07 | Integration Testing | ⬜ Pending | End-to-end test full pipeline (bao gồm n8n) |

## Architecture Changes

```
BEFORE (Current):
  Orchestrator → AI bịa nội dung → Post/Intent (no source)

AFTER (Target):
  CrawlSource (DB) → GenericCrawler → RawNews (DB)
  n8n Workflows ───→ Webhook API ─────↗     (Phase 06b, headless/SPA)
                                        ↓
                                   Curator Bot (LLM parse only)
                                        ↓
                                   Intent CẦN/CÓ (DB, source_url required)
                                    ↓              ↓
                              Analyst Bot      FACEBOT Bots
                              (Market Report)  (Comment only)
                                    ↓
                              NHA.AI Chatbot
                              (truy vấn DB, nhớ user)
```

## Quick Commands
- Start Phase 1: `/code phase-01`
- Check progress: `/next`
- Save context: `/save-brain`
