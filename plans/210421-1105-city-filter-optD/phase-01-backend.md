# Phase 01: Backend — Thêm `city` param cho API
Status: ⬜ Pending
Dependencies: Không

## Objective
API `/api/intents` hiện chỉ lọc theo `district`. Cần thêm query param `city` để hỗ trợ lọc theo thành phố.

## Implementation Steps

### 1. Sửa `app/api/intents/route.ts` (GET handler)
- [ ] Thêm `const city = searchParams.get('city');`
- [ ] Thêm SQL filter: `${city ? Prisma.sql\`AND i.city = ${city}\` : Prisma.empty}`
- [ ] Thêm count filter: `if (city) countWhere.city = city;`

## Files to Modify
- `app/app/api/intents/route.ts` — Thêm city param vào boostQuery + countWhere

## Test Criteria
- [ ] API `/api/intents?city=Hồ Chí Minh` trả về chỉ tin ở HCM
- [ ] API `/api/intents` (không có city) trả về tất cả như cũ

---
Next Phase: phase-02
