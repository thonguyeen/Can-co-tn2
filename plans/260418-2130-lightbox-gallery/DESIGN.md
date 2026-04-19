# DESIGN: Lightbox Gallery — IntentCard
Created: 2026-04-18T21:32
Plan: `plans/260418-2130-lightbox-gallery/plan.md`

---

## 1. Data Flow (Không đụng DB)

```
intent.images[]  →  slides[]  →  <Lightbox slides={slides} index={n} />
```

Không cần API mới. `intent.images` đã có sẵn trong prop.

---

## 2. Component Architecture

```
IntentCard (state owner)
├── lightboxOpen: boolean
├── lightboxIndex: number
├── slides: { src: string }[]
│
├── HeroImage (nhận onOpen prop)
│   └── onClick → onOpen(0)
│
├── ThumbnailStrip (nhận onOpen prop)
│   ├── onClick thumb[i] → onOpen(i + 1)
│   └── onClick "+X" badge → onOpen(images.length - 1)
│
└── <Lightbox> (render ở cuối cardContent)
    open={lightboxOpen}
    close={() => setLightboxOpen(false)}
    index={lightboxIndex}
    slides={slides}
```

---

## 3. Prop Changes

### HeroImage
```tsx
// BEFORE
function HeroImage({ images, intentType, createdAt, trustScore })

// AFTER — thêm onOpen
function HeroImage({ images, intentType, createdAt, trustScore, onOpen })
// Bọc toàn bộ div trong: onClick={(e) => { e.preventDefault(); e.stopPropagation(); onOpen(0); }}
// Thêm cursor-pointer vào className
```

### ThumbnailStrip
```tsx
// BEFORE
function ThumbnailStrip({ images })

// AFTER — thêm onOpen
function ThumbnailStrip({ images, onOpen })
// Mỗi thumb: onClick={(e) => { e.preventDefault(); e.stopPropagation(); onOpen(i + 1); }}
// "+X" badge: onClick → onOpen(images.length - 1)
```

### IntentCard (thêm state + render Lightbox)
```tsx
const [lightboxOpen, setLightboxOpen] = useState(false);
const [lightboxIndex, setLightboxIndex] = useState(0);
const slides = intent.images.map(img => ({ src: img.url }));

const openLightbox = (index: number) => {
  setLightboxIndex(index);
  setLightboxOpen(true);
};
```

---

## 4. Lightbox Render (cuối cardContent, trước </div>)

```tsx
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

{hasImages && (
  <Lightbox
    open={lightboxOpen}
    close={() => setLightboxOpen(false)}
    index={lightboxIndex}
    slides={slides}
  />
)}
```

> ⚠️ Import `styles.css` ở đầu file — YARL cần CSS riêng

---

## 5. UX Details

| Trigger | Hành động |
|---------|----------|
| Click HeroImage | Mở lightbox, ảnh 0 |
| Click Thumbnail[i] | Mở lightbox, ảnh i+1 |
| Click "+X more" | Mở lightbox, ảnh cuối |
| Bấm ← → | Duyệt ảnh |
| Bấm Esc | Đóng lightbox |
| Click backdrop | Đóng lightbox |

---

## 6. Acceptance Criteria

- [ ] TC-01: Click HeroImage → lightbox mở ở ảnh 0
- [ ] TC-02: Click Thumbnail[1] → lightbox mở ở ảnh 1 (index 1)
- [ ] TC-03: Click "+X" → lightbox mở ở ảnh cuối
- [ ] TC-04: Bấm → để chuyển sang ảnh tiếp
- [ ] TC-05: Bấm Esc → lightbox đóng
- [ ] TC-06: Cursor pointer hiện trên HeroImage + Thumbnails
- [ ] TC-07: compact=true (feed card) vẫn hoạt động đúng
- [ ] TC-08: Intent không có ảnh → Lightbox không render, no error

---

*Ready for /code*
