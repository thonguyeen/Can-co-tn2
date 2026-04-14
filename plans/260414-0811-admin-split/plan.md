# Plan: Tách Giao Diện Admin (Member Manager & Bot Manager)
Created: 2026-04-14
Status: 🟡 In Progress

## Overview
Tách trang `/admin` (hiện gộp 8 tabs) thành 2 trang riêng biệt:
- `/admin/members` — Quản lý Thành viên (Users + Referral)
- `/admin/bots` — Quản lý Bot (Dashboard + HR + Config + Sources + Orchestrator)

Trang `/admin` gốc trở thành **Hub Điều Hướng** (Navigation Hub) chứa overview cards dẫn đến 2 trang con.

## Tech Stack
- Frontend: Next.js 16 App Router (TypeScript)
- Styling: CSS Modules (`admin.module.css`)
- ORM: Prisma (tận dụng API admin đã có)
- Auth: NextAuth JWT Middleware (đã bảo vệ `/api/admin/*`)

## Kiến Trúc Hiện Tại (Trước Khi Tách)

```
app/admin/
├── page.tsx                    ← 1 page gộp 8 tabs (153 LOC)
├── components/
│   ├── BotDashboardTab.tsx     ← [BOT] KPI báo cáo
│   ├── BotOperationsTab.tsx    ← [BOT] Vận hành
│   ├── BotHRTab.tsx            ← [BOT] Nhân sự Bot
│   ├── BotConfigTab.tsx        ← [BOT] Config AI
│   ├── CrawlSourcesTab.tsx     ← [BOT] Nguồn cào
│   ├── OrchestratorTab.tsx     ← [BOT] Lõi hệ thống
│   ├── AdminUsersTab.tsx       ← [MEMBER] Danh sách user
│   └── AdminReferralTab.tsx    ← [MEMBER] Thống kê referral
└── users/[id]/page.tsx         ← [MEMBER] Chi tiết user
```

## Kiến Trúc Đích (Sau Khi Tách)

```
app/admin/
├── page.tsx                    ← HUB: Navigation cards → members | bots
├── layout.tsx                  ← [NEW] Shared layout (sidebar nav)
├── members/
│   ├── page.tsx                ← [NEW] 2 tabs: Thành Viên + Referral
│   └── [id]/page.tsx           ← [MOVE] từ admin/users/[id]/page.tsx
├── bots/
│   └── page.tsx                ← [NEW] 6 tabs: Dashboard + Ops + HR + Config + Sources + System
└── components/                 ← Giữ nguyên, tái sử dụng 100%
```

## Phases

| Phase | Name | Status | Tasks |
|-------|------|--------|-------|
| 01 | Admin Layout & Hub | ✅ Complete | 3 tasks |
| 02 | Members Page | ✅ Complete | 3 tasks |
| 03 | Bots Page | ✅ Complete | 2 tasks |
| 04 | Cleanup & Verify | ✅ Complete | 3 tasks |

**Tổng:** 11 tasks | Ước tính: 1 session

## Quick Commands
- Start: `/code phase-01`
- Check progress: `/next`
- Save context: `/save-brain`
