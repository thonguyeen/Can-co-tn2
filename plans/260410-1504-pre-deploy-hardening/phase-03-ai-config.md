# Phase 03: AI Config Stabilization
Status: ⬜ Pending
Dependencies: Phase 02

## Objective
Đảm bảo hệ thống AI Fallback hoạt động ổn định cho Production. Hiện tại `anthropic-direct.ts` đang hardcode model Anthropic (luôn fail vì chưa có ANTHROPIC_API_KEY), rồi fallback sang OpenAI. Cần cấu hình cho ổn.

## Tình trạng hiện tại
- **Anthropic (Primary trong code):** Luôn fail → vì chưa set `ANTHROPIC_API_KEY`
- **OpenAI (Fallback trong code):** Đang trỏ về 9Router server (`cb1-chatbot-opencode`)
- **Vấn đề:** Code bot tạo bài luôn mất thời gian thử Anthropic (timeout) rồi mới fallback.
  Mỗi AI call tốn thêm ~2-3s vô ích.

## Implementation Steps
1. [ ] **Thống nhất AI config trong `anthropic-direct.ts`**
   - Bỏ Anthropic call nếu ANTHROPIC_API_KEY không có
   - Fallback ngay sang OpenAI nếu không cấu hình Primary
   - Sử dụng `AI_PRIMARY_*` env vars thay vì hardcode model

2. [ ] **Tạo `.env.production` template**
   - Copy từ `.env.local`, comment out local DB
   - Uncomment Supabase connection strings  
   - Set ADMIN_EMAILS cho production
   - Đảm bảo AI keys đúng cho production

3. [ ] **Test fallback chain**
   - Verify: AI_PRIMARY → AI_FALLBACK → graceful error
   - Verify: Bot vẫn tạo được bài sau khi config mới

## Files to Modify
- `app/lib/openclaw/anthropic-direct.ts` — Smart fallback logic
- `app/.env.production` — [NEW] Production env template

## Test Criteria
- [ ] Bot tạo bài thành công mà không log "Anthropic failed" 
- [ ] Nếu Primary fail → Fallback hoạt động ngay (< 1s switch)
- [ ] `.env.production` có đủ biến cần thiết

---
Next Phase: [Phase 04 - Production DB Migration](./phase-04-production-db.md)
