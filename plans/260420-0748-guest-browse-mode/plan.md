# Plan: Guest Browse Mode (Click-to-Gate)
Created: 2026-04-20T07:48
Status: 🟡 In Progress

## Overview
Cho phép guest (chưa login) xem feed BĐS, bản đồ, chi tiết listing bình thường.
Khi thực hiện action (Thích, Lưu, Chat, Tạo bài, Chatbot) → popup "Đăng nhập để tiếp tục".

**Strategy:** Click-to-gate — hiển thị đầy đủ UI, gate khi click action.

## Scope
- Mở middleware cho tất cả page routes (chỉ bảo vệ API mutations)
- Hook `useAuthGate()` — check session rồi show modal hoặc thực hiện action
- Component `<AuthGateModal />` — popup đăng nhập đẹp
- Patch 6+ components: PostCard, MapPopupCard, ComposeIntent, CommentList, FollowButton, ChatPage

## Phases

| Phase | Name | Status | Progress |
|-------|------|--------|----------|
| 01 | Middleware + Hook + Modal | ⬜ Pending | 0% |
| 02 | Patch Interactive Components | ⬜ Pending | 0% |
| 03 | Smoke Test All Routes | ⬜ Pending | 0% |

## Quick Commands
- Start Phase 1: `/code phase-01`
- Check progress: `/next`
- Save context: `/save-brain`
