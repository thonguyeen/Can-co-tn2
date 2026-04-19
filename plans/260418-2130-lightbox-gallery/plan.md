# Plan: Lightbox Gallery cho IntentCard

**Created:** 2026-04-18T21:28  
**Feature:** Click ảnh → mở fullscreen lightbox với navigation  
**Scope:** `IntentCard.tsx` only — không đụng API, DB

---

## Vấn đề hiện tại

- Click vào `HeroImage` → không có gì xảy ra
- Click vào `ThumbnailStrip` → không có gì xảy ra
- Người dùng không thể xem ảnh fullscreen

## Giải pháp

Dùng `yet-another-react-lightbox` (YARL) — lightweight, Next.js-compatible, zero CSS conflict.

---

## Các bước thực hiện

### Phase 1: Cài thư viện
```bash
npm install yet-another-react-lightbox
```

### Phase 2: Thêm state vào IntentCard
```tsx
const [lightboxOpen, setLightboxOpen] = useState(false);
const [lightboxIndex, setLightboxIndex] = useState(0);
const slides = intent.images.map(img => ({ src: img.url }));
```

### Phase 3: Gắn onClick vào HeroImage
- HeroImage nhận thêm prop `onOpen: (index: number) => void`
- Click vào hero → `onOpen(0)` → mở lightbox tại ảnh 0

### Phase 4: Gắn onClick vào ThumbnailStrip
- ThumbnailStrip nhận thêm prop `onOpen: (index: number) => void`  
- Click vào thumb[i] → `onOpen(i + 1)` (vì hero là index 0)
- "+X thêm" badge → `onOpen(4)`

### Phase 5: Render Lightbox component
```tsx
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

<Lightbox
  open={lightboxOpen}
  close={() => setLightboxOpen(false)}
  index={lightboxIndex}
  slides={slides}
/>
```

---

## Acceptance Criteria

- [ ] Click HeroImage → lightbox mở tại ảnh 0
- [ ] Click thumbnail[i] → lightbox mở tại đúng ảnh đó
- [ ] Click "+X" → lightbox mở tại ảnh cuối cùng
- [ ] Có nút prev/next để duyệt ảnh
- [ ] Bấm Esc hoặc click ngoài → lightbox đóng
- [ ] Cursor pointer trên ảnh (hover hint)
- [ ] Chỉ render Lightbox khi có ảnh (`hasImages`)
- [ ] Không break compact mode (feed card)

---

## Files thay đổi

- `app/components/intent/IntentCard.tsx` — 1 file duy nhất
- `package.json` — thêm 1 dependency

## Rollback
```bash
npm uninstall yet-another-react-lightbox
git checkout -- app/components/intent/IntentCard.tsx
```
