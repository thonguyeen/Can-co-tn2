# Plan: Mô Hình Hệ Sinh Thái CẦN & CÓ
Created: 260331-0940
Status: 🟡 In Progress

## Overview
Dự án sẽ chuyển đổi từ Web App BĐS nguyên khối sang hệ Multi-Tenant (Nhiều Sub-domain: bds, jobs, docu...) dùng chung 1 Repo Next.js thông qua Middleware và chung 1 Database Supabase.

## Tech Stack
- Frontend: Next.js 14 (App Router) + Route Groups `/(sites)` + Middleware Rewrite.
- Backend: Supabase (PostgreSQL) + Single Sign-On.
- Database: Tích hợp category_id cho các bảng cốt lõi (Profiles, Intents).

## Phases

| Phase | Name | Status | Progress |
|-------|------|--------|----------|
| 01 | Setup Architecture & Middleware | ⬜ Pending | 0% |
| 02 | Database Migration (Category ID) | ⬜ Pending | 0% |
| 03 | Frontend Real Estate Migration | ⬜ Pending | 0% |
| 04 | Frontend Jobs (Tuyển Dụng) MVP | ⬜ Pending | 0% |

## Quick Commands
- Start Phase 1: `/code phase-01`
- Next steps detail: `/design`
- Save context: `/save-brain`
