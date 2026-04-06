# Phase 01: Backend API — Bổ sung endpoint trạng thái
Status: ⬜ Pending

## Objective
API `/api/orchestrator` đã có sẵn hàm `start` / `stop`. 
Nhưng cần bổ sung thêm endpoint trả về trạng thái chi tiết để Frontend hiển thị.

## Implementation Steps
1. [ ] Kiểm tra lại route `/api/orchestrator` hiện tại, đảm bảo action `start` và `stop` hoạt động.
2. [ ] Bổ sung action mới `status` trả về: isRunning, số bot đang active, thời gian uptime, log hoạt động gần nhất.
3. [ ] Test bằng `curl` / `node` script xem `POST {action: 'start'}` và `GET ?type=status` hoạt động đúng.

## Files to Create/Modify
- `app/api/orchestrator/route.ts` — Bổ sung response `status` chi tiết hơn

## Test Criteria
- [ ] Gọi POST `{action: "start"}` → Server log "[Orchestrator] Starting..."
- [ ] Gọi POST `{action: "stop"}` → Server log "[Orchestrator] Stopped"
- [ ] Gọi GET `?type=status` → Trả về JSON { isRunning, botCount, uptime }

---
Next Phase: phase-02-frontend.md
