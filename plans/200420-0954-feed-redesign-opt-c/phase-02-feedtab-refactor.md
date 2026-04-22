# Phase 02: Refactor FeedTab → Single Column + SocialPostCard
Status: ✅ Complete
Dependencies: Phase 01 ✅

## Objective
Cập nhật `FeedTab.tsx` để:
1. Bỏ VIP Carousel ngang (horizontal scroll)  
2. Bỏ 2-column grid (`grid-cols-1 lg:grid-cols-2`)  
3. Thay bằng **single-column** dùng `SocialPostCard`  
4. Feed thống nhất: VIP card và regular card cùng 1 layout, chỉ khác badge Premium

## Layout mới

```
FeedTab
├── SearchBar (giữ nguyên)
├── ComposeIntent mode="real" (giữ nguyên)
├── Feed List — single column max-w-[680px] mx-auto
│   ├── SocialPostCard [VIP - badge Premium]
│   ├── SocialPostCard [regular]
│   ├── SocialPostCard [regular]
│   └── ... infinite scroll
└── FeedObserverPanel (sidebar desktop xl+, giữ nguyên)
```

## Files to Modify

- `app/components/tabs/FeedTab.tsx` — refactor layout section

## Implementation Steps

1. [x] import `SocialPostCard` vào FeedTab
2. [x] Hợp nhất `vipIntents` và `regularIntents` thành 1 list duy nhất
3. [x] VIP items được đánh dấu bằng prop `isVip={true}` → SocialPostCard hiển thị badge "Premium ⭐"
4. [x] Xoá đoạn VIP Carousel horizontal scroll
5. [x] Xoá 2-col grid
6. [x] Bọc list trong `max-w-[680px] mx-auto`

## Test Criteria

- [x] Feed hiển thị single-column trên mọi breakpoint
- [x] VIP badge "Premium ⭐" hiển thị trên đúng card
- [x] Infinite scroll vẫn hoạt động
- [x] FeedObserverPanel (right panel) vẫn hiện trên xl+

---
Next Phase: [phase-03-testing.md](./phase-03-testing.md)
