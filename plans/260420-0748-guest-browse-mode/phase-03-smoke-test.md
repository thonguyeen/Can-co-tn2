# Phase 03: Smoke Test All Routes
Status: ✅ Completed
Dependencies: Phase 01, 02

## Objective
Verify toàn bộ app hoạt động đúng cho cả guest và logged-in user.

## Test Matrix

### Guest (No Session)
1. [x] `/` — Feed hiển thị, scroll OK, action buttons hiện modal
2. [x] `/map` — Bản đồ Leaflet render, pins hiện
3. [x] `/intent/[id]` — Chi tiết listing hiện đầy đủ
4. [x] `/intent/[id]/v1-split` — LeafletIsoMap + POILayer render
5. [x] API: POST /api/intents → 401 (blocked)
6. [x] API: GET /api/intents → 200 (allowed)
7. [x] `/admin` → redirect /login (giữ nguyên protection)

### Logged-In User
8. [x] Mọi action (Like, Save, Chat, Compose) → hoạt động bình thường
9. [x] Admin pages → hoạt động bình thường
10. [x] Không có regression

## Files to Check
- Browser test: 5+ routes
- Console: zero errors related to auth
