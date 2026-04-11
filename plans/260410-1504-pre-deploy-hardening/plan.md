# Plan: Pre-Deploy Hardening & Production Readiness
Created: 2026-04-10T15:04:00+07:00
Status: 🟡 In Progress

## Overview
Dọn dẹp bảo mật, khắc phục các lỗ hổng từ quá trình test, chuẩn bị Database Production, và commit code sạch trước khi deploy lên Vercel + Supabase.

**Bối cảnh:** Tech Lead Checkpoint đã đánh giá **CONDITIONAL GO** — 3 điều kiện bắt buộc hoàn thành trước khi ra production.

## Tech Stack
- Frontend: Next.js 16 (App Router, Turbopack)
- Backend: Next.js API Routes + Prisma 7
- Database: PostgreSQL (Local Docker → Supabase Pooler)
- Auth: NextAuth.js v4 (JWT sessions)
- AI: OpenAI-compatible (Dual Fallback: 9Router + FutrixAPI)

## Phases

| Phase | Name | Status | Progress | Est. Time |
|-------|------|--------|----------|-----------|
| 01 | **Security Hardening (Orchestrator APIs)** | ✅ Complete | 100% | 15 min |
| 02 | **Code Cleanup (Bypass & Dev Routes)** | 🟡 Pending | 0% | 15 min |
| 03 | **AI Config Stabilization** | ✅ Complete | 0% | 10 min |
| 04 | Production DB Migration | ⬜ Pending | 0% | 20 min |
| 05 | Build Verification & Commit | ⬜ Pending | 0% | 15 min |

**Tổng:** ~75 phút | 5 phases | Ước tính: 1 session

## Quick Commands
- Start Phase 1: `/code phase-01`
- Check progress: `/next`
- Save context: `/save-brain`
