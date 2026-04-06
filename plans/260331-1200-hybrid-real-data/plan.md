# Plan: Hybrid Real API Integration
Created: 2026-03-31 12:00
Status: ✅ Complete

## Overview
Phase 2 của Hệ Sinh Thái "CẦN & CÓ" tập trung vào việc loại bỏ `MOCK_INTENTS` và kết nối với Backend API thực (Supabase). Điều này đòi hỏi đồng bộ hóa mượt mà màn hình, xử lý Loading Skeletons và đảm bảo AI Sidebar nhận diện đúng cấu trúc `Intent` thật từ DB.

## Tech Stack
- Frontend: Next.js + React Hooks (useEffect, useState)
- Backend: Supabase API (`/api/intents`)
- Thư viện ảnh hưởng: Framer Motion (Carousel)

## Phases

| Phase | Name | Status | Progress |
|-------|------|--------|----------|
| 01 | Setup API Fetching (Load tin thật) | ✅ Complete | 100% |
| 02 | Skeleton Loading View (UX Xử lý chờ mạng) | ✅ Complete | 100% |
| 03 | Real-time Subscription (Feed Tự Động Nhảy Số) | ✅ Complete | 100% |
| 04 | Integration & Edge Cases (Kết Nối Tương Tác Thật) | ✅ Complete | 100% |
| 05 | Testing Observer Sidebar | ✅ Complete | 100% |

## Quick Commands
- Start Phase 1: `/code phase-01`
- Check progress: `/next`
- Save context: `/save-brain`
