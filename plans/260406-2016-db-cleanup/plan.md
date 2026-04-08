# Plan: Gamification Schema & DB Cleanup
Created: 2026-04-06 20:16
Status: 🟡 In Progress

## Overview
Cập nhật `schema.prisma` để thêm 4 bảng phục vụ Gamification và Push Notifications đồng thời dọn dẹp các Trigger/RLS Policies cũ của Supabase làm nhẹ database sau khi chuyển qua NextAuth.

## Tech Stack
- Frontend: N/A
- Backend: Prisma ORM (schema update)
- Database: PostgreSQL (Raw SQL migration)

## Phases

| Phase | Name | Status | Progress |
|-------|------|--------|----------|
| 01 | Schema Updates | ✅ Complete | 100% |
| 02 | SQL Migration Script | ✅ Complete | 100% |
| 03 | Deployment & Verify | ✅ Complete | 100% |

## Quick Commands
- Start Phase 1: `/code phase-01`
- Check progress: `/next`
- Save context: `/save-brain`
