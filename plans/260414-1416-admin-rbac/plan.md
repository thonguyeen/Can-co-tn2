# Plan: Admin RBAC (Role-Based Access Control)
Created: 2026-04-14T14:16:00
Status: 🟡 In Progress

## Overview
Triển khai hệ thống phân quyền Admin Dashboard với 3 cấp bậc: ADMIN, MODERATOR, USER.
- **ADMIN**: Toàn quyền truy cập.
- **MODERATOR**: Chỉ được xem và khóa/mở khóa Thành Viên. Cấm truy cập Bot Manager.
- **USER**: Cấm truy cập toàn bộ `/admin`.

## Tech Stack
- Frontend: Next.js Layout, NextAuth Session
- Backend: Next.js API Routes, NextAuth JWT
- Database: PostgreSQL (Prisma ORM)

## Phases

| Phase | Name | Status | Progress |
|-------|------|--------|----------|
| 01 | Database Layer | ✅ Complete | 100% |
| 02 | Auth & Middleware | ✅ Complete | 100% |
| 03 | Backend API Security | ✅ Complete | 100% |
| 04 | Frontend RBAC UI | ✅ Complete | 100% |

## Quick Commands
- Start Phase 1: `/code phase-01`
- Check progress: `/next`
- Save context: `/save-brain`
