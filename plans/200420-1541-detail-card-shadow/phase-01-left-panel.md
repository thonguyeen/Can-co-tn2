# Phase 01: Outer Layout + Left Panel Cards
Status: ⬜ Pending
Plan: `plans/200420-1541-detail-card-shadow/plan.md`

## Objective
Thêm padding và gap cho outer layout, bọc Image Slider và Leaflet Map trong các card bo tròn có shadow.

## Thay đổi cần làm

### 1. Outer div — thêm padding + gap + nền slate-50
```
TRƯỚC: className="flex h-[calc(100vh-3.5rem)] overflow-hidden bg-slate-50"
SAU:   className="flex h-[calc(100vh-3.5rem)] p-3 gap-3 bg-slate-50"
```

### 2. Left column — thêm gap giữa slider và map
```
TRƯỚC: className="hidden lg:flex w-1/2 flex-col shrink-0 relative"
SAU:   className="hidden lg:flex w-1/2 flex-col shrink-0 gap-3"
```

### 3. Image Slider wrapper — bo tròn + shadow + overflow
```
TRƯỚC: className="h-1/2"
SAU:   className="h-1/2 rounded-2xl overflow-hidden shadow-lg shadow-slate-200/60 ring-1 ring-slate-200/50"
```
- Trust badge: cập nhật `top-3 right-3` → đã đúng position, không cần sửa

### 4. Map wrapper — bo tròn + shadow + border
```
TRƯỚC: className="h-1/2 relative border-t border-slate-200"
SAU:   className="flex-1 relative rounded-2xl overflow-hidden shadow-md shadow-slate-200/60 ring-1 ring-slate-200 min-h-0"
```
- Bỏ `border-t` (gap đã phân cách)

## Files to Modify
- `app/app/intent/[id]/v1-split/page.tsx` — lines 168, 173, 182, 187

## Test Criteria
- [ ] Slider ảnh có viền bo tròn rõ ràng trên desktop
- [ ] Map có viền bo tròn, shadow nhẹ
- [ ] Có khoảng cách (gap) giữa slider và map
- [ ] Toàn trang có padding xung quanh, không dính vào edge
- [ ] Mobile: không bị ảnh hưởng (left-col đã `hidden lg:flex`)

---
Next: phase-02-right-panel.md
