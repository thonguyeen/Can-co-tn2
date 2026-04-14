# Phase 03: Bots Page
Status: ✅ Complete
Dependencies: Phase 01

## Objective
Tạo trang `/admin/bots` chứa 6 tabs nghiệp vụ Bot hiện có.

## Implementation Steps

### 1. Tạo `app/admin/bots/page.tsx`
- Tab bar 6 mục: `📈 KPI` | `⚙️ Vận Hành` | `👨‍💼 Nhân Sự` | `🧠 Config` | `🌐 Nguồn Cào` | `⚙️ Hệ Thống`
- Fetch bots data (giống logic cũ ở admin/page.tsx)
- Import và render 6 component tab (tái sử dụng 100%):
  - `BotDashboardTab`
  - `BotOperationsTab`
  - `BotHRTab`
  - `BotConfigTab`
  - `CrawlSourcesTab`
  - `OrchestratorTab`

### 2. Đảm bảo tương thích
- Props `bots`, `onUpdate`, `fetchBots` giữ nguyên interface
- Không cần thay đổi bất kỳ component con nào

## Files to Create/Modify
- `app/app/admin/bots/page.tsx` — [NEW] Bots management page

## Test Criteria
- [ ] `/admin/bots` hiển thị 6 tabs đầy đủ
- [ ] Tất cả tab render đúng component
- [ ] Fetch bots data thành công và truyền xuống

---
Next Phase: Phase 04 - Cleanup & Verify
