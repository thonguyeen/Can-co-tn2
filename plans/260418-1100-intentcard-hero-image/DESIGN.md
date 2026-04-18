# 🎨 DESIGN: IntentCard Hero Image + Badge Overlay

Ngày tạo: 2026-04-18
Dựa trên: `plans/260418-1100-intentcard-hero-image/plan.md`
Inspiration: Homigo.life (khảo sát 18/04/2026)

---

## 1. Cấu Trúc Card MỚI vs CŨ

### CŨ (hiện tại):
```
┌─────────────────────────────────┐
│ 👤 User | Badges | 💲 Giá      │ ← Header
│ 📝 Tiêu đề                     │ ← Content
│ Nội dung text...                │
│ ┌──────┬──────┐                 │
│ │ Ảnh1 │ Ảnh2 │                 │ ← ImageGrid (giữa card)
│ │ Ảnh3 │ Ảnh4 │                 │
│ └──────┴──────┘                 │
│ 🏷 Tags                        │
│ 🤖 Bot comments                │
│ 👍 Quan tâm | 💬 BL | 🔖 Lưu  │ ← ActionBar
└─────────────────────────────────┘
```

### MỚI (redesign):
```
┌─────────────────────────────────┐
│ ┌───────────────────────────┐   │
│ │ [CÓ BÁN]     ← badge  [🔖]│  │ ← HeroImage (TOP)
│ │                            │  │    + overlay badges
│ │      🏠 ẢNH LỚN           │  │
│ │                            │  │
│ │ [⚡ Mới]            [91%✓]│  │
│ └───────────────────────────┘   │
│ [📷][📷][📷][📷] [+1]         │ ← ThumbnailStrip
│ 👤 User · 5 phút trước  💲 Giá│ ← Header (di chuyển xuống)
│ 📝 Tiêu đề                     │ ← Content
│ Nội dung text...                │
│ 🏷 Tags                        │
│ 🤖 Bot comments                │
│ 👍 Quan tâm | 💬 BL | 🔖 Lưu  │ ← ActionBar
└─────────────────────────────────┘

* Bài KHÔNG có ảnh → giữ layout CŨ (không hiện HeroImage)
* Bài CẦN TÌM → giữ layout CŨ
```

---

## 2. Component Architecture

### 2.1. HeroImage (MỚI)
```
Props:
  - images: { id, url }[]
  - intentType: 'CO' | 'CAN'
  - createdAt: string
  - trustScore: number

Render:
  if (images.length === 0) → return null
  
  <div relative rounded-t-2xl overflow-hidden aspect-[16/10]>
    <Image src={images[0].url} fill object-cover />
    
    <!-- Overlay badges -->
    <BadgeTopLeft type={intentType} />
    <BadgeBottomLeft createdAt={createdAt} />
    <BadgeBottomRight trustScore={trustScore} />
  </div>
```

### 2.2. Overlay Badges (MỚI)
```
┌──────────────────────────────────────┐
│ [CÓ BÁN]                            │  Top-left: Loại tin
│  bg-emerald-600/80                   │  - CÓ → emerald
│  text-white text-[11px] font-bold    │  - CẦN → amber  
│  px-2.5 py-1 rounded-br-xl          │
│                                      │
│                                      │
│ [⚡ Mới]              [91% ✓]       │  Bottom-left: "Mới" (< 1h)
│  bg-gradient-amber                   │  Bottom-right: Trust score
│  text-white text-[10px]              │  bg-black/50 backdrop-blur
│  px-2 py-0.5 rounded-tr-xl          │  text-white text-[10px]
└──────────────────────────────────────┘
```

### 2.3. ThumbnailStrip (MỚI)
```
Props:
  - images: { id, url }[]
  - showCount: 4  (max thumbnails)

Render:
  if (images.length <= 1) → return null

  <div flex gap-1 px-3 py-1.5>
    {images.slice(0, 4).map(img =>
      <div w-14 h-14 rounded-lg overflow-hidden>
        <Image src={img.url} fill object-cover />
      </div>
    )}
    {images.length > 4 && 
      <div w-14 h-14 rounded-lg bg-slate-100 flex center>
        +{images.length - 4}
      </div>
    }
  </div>
```

### 2.4. ImageGrid (XÓA)
Component cũ `ImageGrid` sẽ được thay thế bởi `HeroImage` + `ThumbnailStrip`.

---

## 3. Layout Logic (Quyết Định Hiển Thị)

```
if (intent.images.length > 0):
    card = HeroImage → ThumbnailStrip → Header → Content → Tags → ...
else:
    card = Header → Content → Tags → ...   (layout cũ, không đổi)
```

---

## 4. Visual Specs

| Element | Value |
|---------|-------|
| Hero aspect ratio | `16:10` (`aspect-[16/10]`) |
| Hero corners | `rounded-t-2xl` (chỉ top) |
| Badge font | `text-[11px] font-bold` |
| Badge CÓ color | `bg-emerald-600/80 text-white` |
| Badge CẦN color | `bg-amber-500/80 text-white` |
| "Mới" threshold | `< 60 minutes` từ `created_at` |
| "Mới" color | `bg-gradient-to-r from-amber-500 to-orange-500` |
| Trust badge | `bg-black/50 backdrop-blur-sm text-white` |
| Thumbnail size | `56x56px` (`w-14 h-14`) |
| Thumbnail corners | `rounded-lg` |
| Thumbnail gap | `gap-1` |
| "+N" badge | `bg-slate-100 text-slate-500 font-bold` |

---

## 5. Files to Modify

| File | Changes |
|------|---------|
| `IntentCard.tsx` | Remove `ImageGrid`, add `HeroImage` + `ThumbnailStrip` + overlay badges, restructure card layout |

**Không cần thêm file mới** — tất cả components nằm trong cùng file IntentCard.tsx.

---

## 6. Checklist Kiểm Tra

### ✅ Happy Path
- [ ] Bài CÓ + 4 ảnh → Hero (ảnh 1) + 3 thumbnails + badges overlay
- [ ] Bài CÓ + 1 ảnh → Hero only, không thumbnail strip
- [ ] Bài CÓ + 0 ảnh → Layout text-only (không hero)

### ✅ Badges
- [ ] "CÓ BÁN" badge emerald top-left
- [ ] "Mới ⚡" chỉ hiện khi bài < 1 giờ, ẩn khi > 1 giờ
- [ ] Trust "91% ✓" hiện bottom-right

### ✅ Edge Cases
- [ ] Bài CẦN TÌM → không hiện hero image dù có ảnh
- [ ] Bài BOT → giữ layout cũ
- [ ] Ảnh 404/broken → fallback placeholder hoặc ẩn

---

*Tạo bởi AWF 2.1 - Design Phase*
