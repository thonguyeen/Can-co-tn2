# Phase 02: Right Panel + Section Cards
Status: ⬜ Pending
Dependencies: Phase 01
Plan: `plans/200420-1541-detail-card-shadow/plan.md`

## Objective
Bọc cột nội dung phải trong card lớn (bo tròn + shadow), và chuyển các section bên trong thành sub-cards riêng biệt.

## Thay đổi cần làm

### 1. Right column wrapper — card lớn bo tròn
```
TRƯỚC: className="flex-1 flex flex-col overflow-hidden bg-white"
SAU:   className="flex-1 flex flex-col overflow-hidden bg-white rounded-2xl shadow-lg shadow-slate-200/50 ring-1 ring-slate-200/60"
```

### 2. Property specs grid — nâng cấp từng item thành micro-card
```
TRƯỚC: className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100"
SAU:   className="flex items-start gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-violet-100 transition-all duration-200"
```

### 3. Poster info section — bọc trong card
```
TRƯỚC: <div className="flex items-center gap-3 mb-6"> (dùng divider border-t)
SAU:   <div className="flex items-center gap-3 mb-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
```
- Xóa `<div className="border-t border-slate-100 mb-6" />` trước và sau poster

### 4. Mô tả chi tiết — bọc trong card
```
TRƯỚC: <div className="mb-6">
SAU:   <div className="mb-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
```
- Xóa divider `border-t` trước section này

### 5. Tiện ích chips — bọc trong card
```
TRƯỚC: <div className="mb-6">
SAU:   <div className="mb-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
```

### 6. Section headers — nâng cấp typography
```
TRƯỚC: className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-3"
SAU:   className="text-[11px] uppercase tracking-widest font-black text-slate-500 mb-3 flex items-center gap-2"
```

### 7. POILayer wrapper — bọc trong card
Bọc `<POILayer ...>` trong:
```jsx
<div className="mb-4 rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
  <div className="px-4 pt-4 pb-1">
    <h2 className="...">Tiện ích xung quanh</h2>
  </div>
  <POILayer ... className="px-4 pb-4" />
</div>
```

### 8. Related intents — bọc trong card
```jsx
<div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
  <h2 ...>Tin liên quan</h2>
  {/* grid related */}
</div>
```

### 9. Sticky CTA bar — nâng cấp shadow
```
TRƯỚC: shadow-[0_-4px_20px_rgba(0,0,0,0.06)]
SAU:   shadow-[0_-4px_24px_rgba(0,0,0,0.1)] backdrop-blur-sm bg-white/95
```

## Files to Modify
- `app/app/intent/[id]/v1-split/page.tsx` — từ line 195 đến cuối

## Test Criteria
- [ ] Right column có viền bo tròn, shadow rõ ràng
- [ ] Spec grid: 4 cells có shadow hover effect
- [ ] Poster info nằm trong box riêng, không dùng divider border-t
- [ ] Mô tả, tiện ích, POI, related — mỗi section một card riêng
- [ ] CTA bar sticky ở dưới vẫn hoạt động
- [ ] Toàn trang không bị overflow dọc

---
Prev: phase-01-left-panel.md
