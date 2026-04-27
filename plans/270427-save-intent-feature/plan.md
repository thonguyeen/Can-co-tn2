# Plan: Fix Tính Năng Lưu Bài Viết Ưa Thích
**Tạo:** 2026-04-27 | **Status:** 🟡 In Progress

## Tóm tắt yêu cầu
User muốn tính năng Lưu hoạt động đúng:
1. **Bắt đăng nhập** trước khi lưu (requireAuth)
2. **Nút đổi màu** (amber/vàng) sau khi bấm Lưu
3. **Tab "Đã lưu"** trong trang Profile hiển thị danh sách bài đã lưu

## Nguyên nhân gốc (Root Cause)

| # | Vấn đề | File | Dòng |
|---|--------|------|------|
| 1 | Đã **bỏ** `requireAuth` nhầm | `SocialPostCard.tsx`, `IntentCard.tsx` | 359, 486 |
| 2 | Tab "Đã lưu" trong Profile **hardcode EmptyState**, không gọi API | `ProfileTabs.tsx` | 174-180 |
| 3 | `GET /api/intents/saved` chưa có → cần tạo để `ProfileTabs` fetch | `app/api/intents/saved/route.ts` | — |

> **Lưu ý:** `/saved` page hoạt động đúng (query `intent_saves`). Chỉ cần fix Profile tab.

## Phases

| Phase | Việc cần làm | File |
|-------|-------------|------|
| **01** | Revert: thêm lại `requireAuth` vào nút Lưu | `SocialPostCard.tsx`, `IntentCard.tsx` |
| **02** | Profile tab "Đã lưu": gọi `/api/intents/saved` khi chọn tab | `ProfileTabs.tsx` |
| **03** | Xác nhận `GET /api/intents/saved` route tồn tại và hoạt động | `app/api/intents/saved/route.ts` |
| **04** | Test end-to-end: login → bấm Lưu → vào profile → thấy bài |  |

## Luồng hoạt động mong muốn

```
Guest bấm Lưu → requireAuth() → hiện modal "Đăng nhập"
                                        ↓
                                    User đăng nhập
                                        ↓
                                Bấm Lưu trên bài → 
                                nút đổi màu amber ✅ →
                                POST /api/intents/[id]/save →
                                lưu vào bảng intent_saves
                                        ↓
                                Vào /profile tab "Đã lưu" →
                                fetch /api/intents/saved →
                                hiển thị danh sách ✅
```

## Files cần thay đổi

- `app/components/intent/SocialPostCard.tsx` – revert `toggleSave(intentId)` → `requireAuth(() => toggleSave(intentId))`
- `app/components/intent/IntentCard.tsx` – revert tương tự
- `app/components/profile/ProfileTabs.tsx` – thêm fetch + render khi tab === 'saved'
- `app/api/intents/saved/route.ts` – verify/ensure GET works

## Checklist
- [ ] Phase 01: Revert requireAuth
- [ ] Phase 02: Fix ProfileTabs saved tab
- [ ] Phase 03: Verify API route
- [ ] Phase 04: End-to-end test
