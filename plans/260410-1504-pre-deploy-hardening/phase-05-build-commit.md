# Phase 05: Build Verification & Commit
Status: ⬜ Pending
Dependencies: Phase 01, 02, 03, 04

## Objective
Xác nhận toàn bộ thay đổi từ Phase 01-04 không gây lỗi build. Commit sạch sẽ sẵn sàng deploy.

## Implementation Steps
1. [ ] **Chạy TypeScript check**
   - `npx tsc --noEmit` — Không có TS errors
   
2. [ ] **Chạy Next.js build**
   - `npm run build` — Build thành công, không warning nghiêm trọng

3. [ ] **Smoke test trên local**
   - Chạy `npm run dev`
   - Truy cập trang chủ → Feed hiển thị
   - Truy cập `/profile/referral` → Dashboard referral ok
   - Truy cập `/admin` → Admin panel ok (nếu đã đăng nhập admin)

4. [ ] **Git commit**
   - `git add -A`
   - `git commit -m "chore: pre-deploy hardening — security fixes, cleanup, AI config"`
   
5. [ ] **Update .brain files**
   - Update `session.json` — working_on status
   - Update `handover.md` — mark deployment ready
   - Update `brain.json` — add pre-deploy hardening to knowledge

## Files to Verify
- Toàn bộ files đã sửa ở Phase 01-04

## Test Criteria
- [ ] `npm run build` exit code 0
- [ ] `git status` sạch (no unstaged changes)
- [ ] Smoke test pass trên local

---
🚀 After this phase → Run `/deploy` to go live!
