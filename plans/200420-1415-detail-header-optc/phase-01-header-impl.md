# Phase 01: Implement Header + Light Theme
Status: ⬜ Pending

## Objective
Thêm sticky header vào trang chi tiết và chuyển màu sang light theme để đồng bộ với trang chủ.

## Files cần sửa

### 1. `app/app/intent/[id]/v1-split/page.tsx`

#### A. Xóa floating back button cũ (desktop, dòng ~175-182)
Nút này sẽ được chuyển vào header mới.

#### B. Thêm sticky header sau `<div className="flex h-screen...">`:
```tsx
{/* ── Sticky Header (nhất quán với trang chủ) ── */}
<header className="fixed top-0 left-0 right-0 z-50 h-14 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
  <div className="flex items-center h-full px-4 gap-3">
    {/* Back */}
    <button onClick={() => router.back()}
      className="flex items-center gap-1.5 text-slate-600 hover:text-indigo-600 transition-colors text-sm font-semibold">
      <ArrowLeft className="w-4 h-4" />
      <span className="hidden sm:inline">Quay lại</span>
    </button>

    {/* Logo */}
    <Link href="/" className="flex-1 flex justify-center">
      <span className="font-black text-indigo-600 text-lg tracking-tight">Cần&Có</span>
    </Link>

    {/* Actions */}
    <div className="flex items-center gap-2">
      <button className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors">
        <Bookmark className="w-4 h-4" />
      </button>
      <button className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors">
        <Share2 className="w-4 h-4" />
      </button>
    </div>
  </div>
</header>

{/* Spacer để push content xuống dưới header */}
<div className="h-14 shrink-0" />
```

#### C. Đổi left panel từ dark → light:
- `bg-[#0f0f1a]` → `bg-slate-50`
- Trust badge: `bg-white/10 text-emerald-300` → `bg-emerald-50 text-emerald-700 border border-emerald-200`

#### D. Sửa map sang light tile:
- Trong `LeafletIsoMap.tsx` thêm prop `lightMode?: boolean`
- Hoặc đổi tile URL sang `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`

### 2. Imports cần thêm:
```tsx
import Link from 'next/link';
import { Bookmark, Share2 } from 'lucide-react';
```

## Test Criteria
- [ ] Header hiển thị đúng trên desktop và mobile
- [ ] Nút Quay lại hoạt động
- [ ] Logo click về trang chủ
- [ ] Left panel không còn màu dark navy
- [ ] Không có layout shift khi load

---
Next: phase-02-smoke-test.md
