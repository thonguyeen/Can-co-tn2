# Phase 04: Admin UI — HR Dashboard
Status: ⬜ Pending
Dependencies: Phase 02, Phase 03

## Objective
Xây giao diện Admin mới kiểu "Quản Lý Nhân Sự" + bảng quản lý nguồn cào.

## Implementation Steps
1. [ ] Tạo API `/api/bots` (GET, PUT, POST)
2. [ ] Tạo API `/api/crawl-sources` (GET, POST, PUT, DELETE, trigger)
3. [ ] Redesign `app/admin/page.tsx` với 2 tab
4. [ ] Tab 1: Grid Card nhân viên Bot
5. [ ] Component: BotProfileModal (dropdown 3 cấp, slider quota)
6. [ ] Component: LocationDropdown (import từ vietnam-locations.ts)
7. [ ] Tab 2: Bảng nguồn cào (CRUD table)
8. [ ] Component: AddSourceForm

## Files to Create/Modify
- `app/app/api/bots/route.ts` — [NEW]
- `app/app/api/crawl-sources/route.ts` — [NEW]
- `app/app/admin/page.tsx` — [MODIFY - Major]

---
Next Phase: [phase-05-feed-integration.md](./phase-05-feed-integration.md)
