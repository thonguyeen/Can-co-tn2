# Design Specifications — Referral User UI

## 🎨 Color Palette (Referral Accents)
| Name | Hex | Usage |
|------|-----|-------|
| Primary Green | #1B4D3E | Buttons, Primary Backgrounds |
| Accent Green | #2D6A4F | Progress bars, active states |
| Border Subtle | #3E4042 | Card borders, dividers |
| BG Dark | #18191A | Main page background |
| Surface Dark | #242526 | Cards, sections |
| Text Primary | #E4E6EB | Content, titles |
| Text Muted | #B0B3B8 | Labels, legends |

## 📐 Spacing & Layout
- **Container Padding:** 16px (1rem) cho Mobile.
- **Card Radius:** 8px (`var(--radius)`).
- **Section Gap:** 24px.
- **Internal Card Padding:** 12px.

## 📝 Typography
- **Heading:** Inter, 18px-20px, Bold (700).
- **Body:** Inter, 14px-15px, Regular (400).
- **Stats Numerals:** 'SF Mono' / 'Geist Mono', 22px+, Medium (500), Tabular Nums.

## ✨ Components Design Patterns
1. **Tier Badge:** Hình lục giác hoặc tròn bo góc cực nhẹ, viền gradient mỏng theo kim loại (Bạc/Vàng/Bạch Kim).
2. **Leaderboard Table:** Hàng (row) phẳng, highlight hàng user bằng background `#1B4D3E` độ trong suốt 10%.
3. **Reward Card:** Tỷ lệ ảnh 1:1 hoặc 16:9, giá quà (Points) đặt trong pill badge góc trên bên phải.
