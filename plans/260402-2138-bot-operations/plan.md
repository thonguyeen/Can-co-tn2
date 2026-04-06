# Plan: Bot Operations Control Panel (Bảng Điều Khiển Bot)
Created: 2026-04-02 21:38
Status: 🟡 In Progress

## Overview
Thêm hệ thống điều khiển vận hành cho đội ngũ Bot Envoy trong trang Admin.
Hiện tại Bot có "bộ não" Orchestrator đầy đủ nhưng CHƯA CÓ giao diện để bật/tắt hay theo dõi.
Tính năng này sẽ biến trang Admin thành "Phòng Điều Hành" thực thụ.

## Tech Stack
- Frontend: React Client Component, TailwindCSS (Dark SaaS)
- Backend: Next.js API Routes (đã có `/api/orchestrator`)
- Engine: `lib/openclaw/orchestrator.ts` (đã code sẵn `start()` / `stop()`)

## Phases

| Phase | Name | Status | Progress |
|-------|------|--------|----------|
| 01 | Backend API — Bổ sung endpoint trạng thái Bot | ✅ Complete | 100% |
| 02 | Frontend UI — Bảng Điều Khiển trên Admin | ✅ Complete | 100% |
| 03 | Tích hợp & Test | ✅ Complete | 100% |

## Quick Commands
- Start Phase 1: `/code phase-01`
- Check progress: `/next`
- Save context: `/save-brain`
