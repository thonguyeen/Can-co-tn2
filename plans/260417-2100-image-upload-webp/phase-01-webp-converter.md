# Phase 01: Client-side WebP Converter Utility
Status: ⬜ Pending
Dependencies: None

## Objective
Tạo utility function `convertToWebP(file)` dùng Canvas API để convert ảnh JPEG/PNG sang WebP ngay trên browser, kèm resize nếu ảnh quá lớn.

## Implementation Steps

### 1. Tạo file `lib/image-utils.ts`
- [ ] `convertToWebP(file: File): Promise<{ blob: Blob; originalSize: number; convertedSize: number }>`
- [ ] Dùng `createImageBitmap(file)` để decode ảnh
- [ ] Resize nếu width > 1080px (giữ tỷ lệ aspect ratio)
- [ ] Dùng `canvas.toBlob('image/webp', 0.82)` để export
- [ ] Trả về blob + metadata kích thước trước/sau

### 2. Thông số kỹ thuật
| Param | Value | Lý do |
|-------|-------|-------|
| Quality | 0.82 | Cân bằng tốt chất lượng vs kích thước |
| Max Width | 1080px | Đủ cho mobile + web display |
| Max Height | Giữ tỷ lệ | Không bị méo |
| Output MIME | `image/webp` | Tiết kiệm ~80% so với JPEG |

### 3. Error handling
- [ ] Fallback: nếu browser không hỗ trợ WebP canvas → giữ file gốc
- [ ] Timeout: nếu convert > 10s → giữ file gốc
- [ ] File quá nhỏ (< 50KB): skip convert, giữ nguyên

## Files to Create
- `lib/image-utils.ts` — convertToWebP utility

## Test Criteria
- [ ] JPEG 5MB → WebP < 1MB
- [ ] PNG 3MB → WebP < 500KB
- [ ] Ảnh 4000x3000 → resize xuống 1080xN
- [ ] Ảnh < 1080px → không resize, chỉ convert format
- [ ] Browser không hỗ trợ WebP → fallback giữ gốc

---
Next Phase: phase-02-compose-ui.md
