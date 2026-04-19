# Plan: 3 Prototype Routes — Intent Detail Page Redesign
Created: 2026-04-19T12:50
Status: 🟡 In Progress

## Overview
Tạo 3 route riêng biệt để anh trải nghiệm trực tiếp rồi chọn 1, xóa 2.

| Route | Layout | Mô tả |
|-------|--------|-------|
| `/intent/[id]` | Hiện tại (giữ nguyên) | Baseline để so sánh |
| `/intent/[id]/v1-split` | Zillow Split 50/50 | Ảnh trái cố định + Content phải cuộn |
| `/intent/[id]/v2-bento` | Bento Grid Dashboard | Ảnh tràn viền + Grid khối bento |
| `/intent/[id]/v3-command` | 3-Col Command Center | Mục lục trái + Content giữa + Action phải |

## Strategy
- Tất cả 3 routes **dùng chung data fetching logic** (cùng API `/api/intents?id=`)
- Extract shared logic ra `useIntentDetail(id)` hook
- Mỗi route chỉ khác phần **presentation/layout**
- Mobile: cả 3 route collapse về 1-col (giữ trải nghiệm mobile hiện tại)

## Phases

| Phase | Name | Status | Tasks |
|-------|------|--------|-------|
| 01 | Shared Hook + V1 Split | ⬜ | 3 |
| 02 | V2 Bento Grid | ⬜ | 2 |
| 03 | V3 Command Center | ⬜ | 2 |
| 04 | Verify All Routes | ⬜ | 3 |

## Files

| Action | File | Mô tả |
|--------|------|-------|
| NEW | `hooks/useIntentDetail.ts` | Shared hook (fetch, owner, edit state) |
| NEW | `app/intent/[id]/v1-split/page.tsx` | Layout 1: Zillow Split |
| NEW | `app/intent/[id]/v2-bento/page.tsx` | Layout 2: Bento Grid |
| NEW | `app/intent/[id]/v3-command/page.tsx` | Layout 3: Command Center |
| KEEP | `app/intent/[id]/page.tsx` | Giữ nguyên làm baseline |

## Quick Access (sau khi code xong)
Giả sử intent ID = `abc123`:
- Baseline: http://localhost:4000/intent/abc123
- V1 Split: http://localhost:4000/intent/abc123/v1-split
- V2 Bento: http://localhost:4000/intent/abc123/v2-bento
- V3 Command: http://localhost:4000/intent/abc123/v3-command
