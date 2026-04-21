# 🎨 DESIGN: SocialPostCard — Feed Redesign Option C

Ngày tạo: 2026-04-20
Dựa trên: `plans/200420-0954-feed-redesign-opt-c/plan.md`

---

## 1. Component Props Interface

```typescript
interface SocialPostCardProps {
  intent: MockIntent;       // Data object (giống IntentCard)
  isVip?: boolean;          // Hiện badge "Premium ⭐" nếu true
  compact?: boolean;        // true = truncate text (default)
  basePath?: string;        // Link prefix cho Detail page
}
```

---

## 2. Sub-components Anatomy

```
<SocialPostCard>
  ├── <HeroSection>          // Full-width image + overlays
  │     ├── <img>            // 16:10 aspect ratio
  │     ├── TypeBadge        // "CÓ BÁN" emerald / "CẦN TÌM" amber
  │     ├── PriceBadge       // Góc phải: "11.8 Tỷ" (white/95 bg)
  │     ├── VipBadge?        // "⭐ Premium" chỉ khi isVip=true
  │     └── PhotoCount       // "📷 5" nếu >1 ảnh
  │
  ├── <PostHeader>           // Avatar + meta  
  │     ├── <img> avatar     // 44px rounded-full + border
  │     ├── Name + Role badge // "Môi giới" | "Chính chủ" | "BOT"
  │     └── Timestamp        // "15 phút trước"
  │
  ├── <PostBody>             // Content
  │     ├── Title?           // h3 font-bold nếu có
  │     ├── TextWithHighlights // AI-highlight giá + địa danh
  │     └── TagPills[]       // 📍 Quận 7 · 🛏 2PN · 💰 3-4 tỷ
  │
  ├── <BotPreview>?          // Chỉ khi có bot_comment
  │     └── "🤖 Match Advisor: ..."
  │
  ├── <ReactionSummary>      // 🔥 12 · 💰 5 · 🤝 4 · 👁 890
  │
  └── <ActionBar>            // Nút tương tác
        ├── [Quan tâm]       // requireAuth
        ├── [Đàm phán ngay]  // requireAuth — indigo CTA (flex-[1.5])
        └── [Lưu]            // requireAuth
```

---

## 3. Design Tokens

| Token | Tailwind class | Dùng cho |
|-------|---------------|---------|
| Card container | `bg-white rounded-[20px] shadow-sm border border-slate-100` | Wrapper |
| Hover | `hover:shadow-md transition duration-300` | Card |
| CẦN badge | `bg-amber-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full` | TypeBadge |
| CÓ badge | `bg-emerald-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full` | TypeBadge |
| Price tag | `bg-white/95 backdrop-blur px-3 py-1.5 rounded-xl shadow-lg` | PriceBadge |
| Price text | `text-lg font-black text-indigo-600 tracking-tight` | Price number |
| Bot preview bg | `bg-teal-50 border border-teal-100 rounded-xl p-2.5` | BotPreview |
| CTA button | `bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg font-bold` | Đàm phán |

---

## 4. AI Highlight Rules (Text Parser)

```typescript
// Regex patterns để highlight tự động trong PostBody
const PRICE_PATTERN  = /(\d+[\d,.]*\s*(tỷ|triệu|tr|tỉ))/gi;
const PLACE_PATTERN  = /(quận\s*\d+|q\.\s*\d+|phường\s*\S+|p\.\s*\S+|huyện\s*\S+)/gi;

// Styles
const priceStyle  = 'font-bold text-indigo-600 bg-indigo-50 px-1 rounded';
const placeStyle  = 'underline decoration-slate-300 decoration-2 underline-offset-2 text-slate-800 font-medium';
```

> [!NOTE]
> Parser chỉ áp dụng ở `SocialPostCard`. `IntentCard` (trang detail) giữ nguyên.

---

## 5. Luồng dữ liệu

```
useFeedData() → vipIntents + regularIntents
      ↓
FeedTab merges → allIntents (vip đánh dấu isVip=true, lên đầu)
      ↓
single-column render: allIntents.map(i => <SocialPostCard isVip={i.isVip} .../>)
```

---

## 6. Acceptance Criteria

- [ ] **Card có ảnh (CÓ BÁN):** Hero image 16:10, price badge overlay, type badge
- [ ] **Card không có ảnh (CẦN MUA):** Hero section ẩn hoàn toàn, layout không vỡ
- [ ] **Bot comment:** Hiện BotPreview teal nếu có `bot_comment` hoặc `bot_comments[0]`
- [ ] **Auth gate:** Quan tâm / Đàm phán / Lưu đều block guest với AuthGateModal
- [ ] **Single-column:** FeedTab bỏ 2-col grid, max-w-[680px] centered
- [ ] **VIP badge:** Card có `isVip=true` hiện overlay "⭐ Premium" trên hero image
- [ ] **Mobile 375px:** Card đầy đủ, action bar 3 nút vẫn đọc được

---

*Tạo bởi AWF 2.1 - Design Phase*
