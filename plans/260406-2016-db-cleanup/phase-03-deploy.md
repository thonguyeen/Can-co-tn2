# Phase 03: Deployment & Verify
Status: ✅ Complete
Dependencies: phase-02

## Objective
Chạy cấp nhật database theo prisma schema lên DB trên mây và thực thi dọn dẹp các rule cũ.

## Requirements
### Functional
- Chạy cập nhật: `npx prisma db push`.
- Chạy dọn rác: `npx tsx scripts/cleanup-db.ts`.

## Implementation Steps
1. [ ] Thực thi script dọn rác trước (`npx tsx scripts/cleanup-db.ts`).
2. [ ] Thực thi `npx prisma db push --accept-data-loss` (dù không sinh data loss).
3. [ ] Commit file `schema.prisma`.

## Clean Up Check
- Đảm bảo Terminal Prisma không vướng bất kỳ lỗi Validation/Connection nào.
