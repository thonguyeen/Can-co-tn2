# Plan: Bot Môi Giới Địa Phương (Local Envoy Bots)
Created: 2026-04-02 09:33
Status: ✅ Complete

## Overview
Biến AI Bot thành Nhân Viên Môi Giới chuyên cào tin BĐS thật từ web,
tự đăng lên Feed CẦN & CÓ theo khu vực được Admin phân công.
Giao diện Admin kiểu "Quản Lý Nhân Sự".

## Tech Stack
- Frontend: Next.js 16 + Tailwind CSS v4 + Framer Motion
- Backend: Next.js API Routes + Supabase (PostgreSQL)
- Data: Excel carCRM → TypeScript (bộ địa chính VN)
- Crawler: RSS Parser + HTML scraper

## Phases

| Phase | Name | Status | Progress |
|-------|------|--------|----------|
| 01 | DB Migration + Location Data | ✅ Complete | 100% |
| 02 | Backend Refactor (Persistence) | ✅ Complete | 100% |
| 03 | BĐS Crawler | ✅ Complete | 100% |
| 04 | Admin UI (HR Dashboard) | ✅ Complete | 100% |
| 05 | Feed Integration | ✅ Complete | 100% |
| 06 | Testing & Polish | ✅ Complete | 100% |

## Reference Docs
- BRIEF: `docs/BRIEF.md`
- DESIGN: `docs/DESIGN.md`
- Location Excel: `ref/carCRM_Danh-muc-Phuong-xa_2025.xlsx`

## Quick Commands
- Start Phase 1: `/code phase-01`
- Check progress: `/next`
- Save context: `/save-brain`
