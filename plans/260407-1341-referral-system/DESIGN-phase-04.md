# 🎨 DESIGN: Phase 04 — Frontend User Dashboard

Ngày tạo: 2026-04-08
Dựa trên: [phase-04-frontend-user.md](./phase-04-frontend-user.md)
Design Specs: [design-specs-referral.md](./design-specs-referral.md)

---

## 1. Sơ Đồ Dữ Liệu (API → Giao diện)

Tất cả dữ liệu cho 3 trang đã có sẵn API backend. Dưới đây là bản đồ
"Từ dữ liệu nào → hiển thị ở đâu":

```
┌─────────────────────────────────────────────────────────────────────┐
│  📡 API ĐÃ CÓ SẴN (Phase 02)                                      │
├─────────────────────────────────────────────────────────────────────┤
│  GET /api/referral/code   → Mã referral, link, tier, points        │
│  GET /api/referral/stats  → Tier chi tiết, điểm, multiplier        │
│  GET /api/referral/logs   → Danh sách bạn đã mời (paginated)       │
│  GET /api/leaderboard     → Top users (?type=all_time|weekly)       │
│  GET /api/rewards         → Danh mục quà tặng                      │
│  POST /api/rewards/redeem → Đổi quà (atomic)                       │
│  GET /api/rewards/my-redemptions → Lịch sử đổi quà                 │
│  POST /api/boosts         → Boost bài đăng (atomic)                 │
│  GET /api/boosts/active   → Danh sách bài đang boost               │
└─────────────────────────────────────────────────────────────────────┘
           │                         │                       │
           ▼                         ▼                       ▼
┌─────────────────┐  ┌──────────────────┐  ┌─────────────────────┐
│ /profile/referral│  │   /leaderboard   │  │      /rewards       │
│  (Dashboard)     │  │  (Bảng xếp hạng) │  │  (Cửa hàng quà)    │
└─────────────────┘  └──────────────────┘  └─────────────────────┘
```

> ✅ **Không cần tạo API mới.** Tất cả đã viết xong từ Phase 02.

---

## 2. Danh Sách Màn Hình & Chi Tiết

### 📱 MÀN HÌNH A: `/profile/referral` — Dashboard Referral Cá Nhân

```
┌──────────────────────────────────────────────────────────┐
│  🏅 HẠNG CỦA BẠN                                        │
│  [Badge Bạc] Hạng Bạc             5/10 lượt mời         │
│  ████████░░░░ "Còn 5 lượt nữa → Hạng Vàng"             │
├──────────────────────────────────────────────────────────┤
│  📊 THỐNG KÊ NHANH                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                 │
│  │    5     │ │   120    │ │    80    │                 │
│  │ Lượt mời │ │ Điểm     │ │ Đã tiêu  │                 │
│  └──────────┘ └──────────┘ └──────────┘                 │
├──────────────────────────────────────────────────────────┤
│  🔗 MÃ GIỚI THIỆU                                       │
│  ┌───────────────────────────────┐ [📋 Copy] [📤 Share] │
│  │  cancotn.com/reg?ref=ABC123  │                        │
│  └───────────────────────────────┘                       │
├──────────────────────────────────────────────────────────┤
│  👥 BẠN ĐÃ GIỚI THIỆU (10 gần nhất)                    │
│  ┌─ Avatar ─ Nguyễn A ── +20đ ── 3 ngày trước ────────┐│
│  ├─ Avatar ─ Trần B   ── +20đ ── 1 tuần trước  ───────┤│
│  └──────────────────────────────────────────── Xem thêm┘│
├──────────────────────────────────────────────────────────┤
│  [🚀 Đẩy bài — 50 điểm]              [🎁 Đổi quà →]   │
└──────────────────────────────────────────────────────────┘
```

**Dữ liệu cần fetch:**
| Vùng hiển thị | API | Fields dùng |
|---|---|---|
| Badge + Tier Progress | `GET /api/referral/stats` | `tier`, `tierName`, `totalReferrals`, `nextTierAt`, `multiplier` |
| 3 ô thống kê | `GET /api/referral/stats` | `totalReferrals`, `points`, `pointsSpent` |
| Mã referral | `GET /api/referral/code` | `code`, `referralUrl` |
| Danh sách bạn mời | `GET /api/referral/logs` | `logs[]` → `refereeName`, `refereeAvatar`, `pointsAwarded`, `createdAt` |

**Components (6):**
| Component | Props | Mô tả |
|---|---|---|
| `TierCard` | `tier, tierName, totalReferrals, nextTierAt, multiplier` | Card hạng + progress bar |
| `StatsRow` | `totalReferrals, points, pointsSpent` | 3 ô số liệu ngang |
| `ReferralCodeBox` | `code, referralUrl` | Link share + Copy + Share button |
| `ReferralLogItem` | `name, avatar, points, date` | 1 dòng trong danh sách bạn mời |
| `ReferralLogTable` | `logs[], total, page` | Danh sách bạn mời (paginated) |
| `TierInfoModal` | `isOpen, onClose` | Popup giải thích 5 cấp bậc |

---

### 📱 MÀN HÌNH B: `/leaderboard` — Bảng Xếp Hạng

```
┌──────────────────────────────────────────────────────────┐
│  🏆 BẢNG XẾP HẠNG                                       │
│  [Tất cả  ▪] [Tuần này  ○]                              │
├──────────────────────────────────────────────────────────┤
│        🥈              🥇              🥉                │
│  ┌──────────┐  ┌──────────────┐  ┌──────────┐           │
│  │  Trần B  │  │    Lê A      │  │  Phạm C  │           │
│  │  32 lượt │  │   87 lượt    │  │  28 lượt │           │
│  │  Bạch Kim│  │  Kim Cương   │  │  Bạch Kim│           │
│  └──────────┘  └──────────────┘  └──────────┘           │
├──────────────────────────────────────────────────────────┤
│  #4  [Av] Bùi D          500đ    Vàng                   │
│  #5  [Av] Hồ E           380đ    Vàng                   │
│  ...                                                     │
│  ★#28 (BẠN) Bạn           60đ    Bạc     ← highlight   │
└──────────────────────────────────────────────────────────┘
```

**Dữ liệu cần fetch:**
| Vùng | API | Fields |
|---|---|---|
| Top 3 Cards | `GET /api/leaderboard?type=all_time&limit=50` | `entries[]` → `rank, username, avatarUrl, points, levelName, levelIcon` |
| Tab "Tuần này" | `GET /api/leaderboard?type=weekly&limit=50` | Same fields |
| Highlight "BẠN" | So sánh `entry.userId === session.user.id` (client-side) |

**Components (3):**
| Component | Props | Mô tả |
|---|---|---|
| `LeaderboardTopCards` | `top3: LeaderboardEntry[]` | 3 thẻ Elite cho rank 1-2-3 (Modern List style) |
| `LeaderboardTable` | `entries[], currentUserId` | Bảng rank 4+, highlight hàng user |
| `LeaderboardTabs` | `activeTab, onChangeTab` | Tab "Tất cả" / "Tuần này" |

---

### 📱 MÀN HÌNH C: `/rewards` — Cửa Hàng Đổi Quà

```
┌──────────────────────────────────────────────────────────┐
│  🎁 CỬA HÀNG ĐỔI QUÀ                        120 ⭐     │
├──────────────────────────────────────────────────────────┤
│  ⚡ TÍNH NĂNG ĐẶC BIỆT                                  │
│  ┌────────────────────────────────────────────────────┐  │
│  │ 🚀 Đẩy bài lên TOP 24h                            │  │
│  │ Bài của bạn xuất hiện đầu feed trong 24 giờ       │  │
│  │                                    [💎 50 điểm]   │  │
│  └────────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────┤
│  🎁 QUÀ TẶNG                                            │
│  ┌──────────┐  ┌──────────┐                              │
│  │ 🖼️ img   │  │ 🖼️ img   │                              │
│  │ Thẻ cào  │  │ Voucher  │                              │
│  │ 100 điểm │  │ 200 điểm │                              │
│  │ [Đổi]    │  │ [Đổi]    │                              │
│  └──────────┘  └──────────┘                              │
│  ┌──────────┐  ┌──────────┐                              │
│  │ 🖼️ img   │  │ 🖼️ img   │                              │
│  │ Premium  │  │ Áo thun  │                              │
│  │ 500 điểm │  │ 800 điểm │                              │
│  │ [Đổi]    │  │ [Hết hàng]│                             │
│  └──────────┘  └──────────┘                              │
├──────────────────────────────────────────────────────────┤
│  📋 LỊCH SỬ ĐỔI QUÀ                                    │
│  Thẻ cào 50k ── 100đ ── ⏳Đang xử lý ── 3 ngày trước   │
│  Voucher Grab ── 200đ ── ✅Đã giao ── 1 tuần trước      │
└──────────────────────────────────────────────────────────┘
```

**Dữ liệu cần fetch:**
| Vùng | API | Fields |
|---|---|---|
| Số điểm hiện tại | `GET /api/referral/stats` | `points` |
| Danh sách phần thưởng | `GET /api/rewards` | `rewards[]` → `id, label, description, pointsCost, stock, imageUrl` |
| Đổi quà (click "Đổi") | `POST /api/rewards/redeem` | Body: `{ rewardItemId }` |
| Lịch sử đổi quà | `GET /api/rewards/my-redemptions` | `redemptions[]` → `rewardLabel, pointsCost, status, createdAt` |
| Đẩy bài (click "Boost") | `POST /api/boosts` | Body: `{ intentId }` |

**Components (5):**
| Component | Props | Mô tả |
|---|---|---|
| `PointsHeader` | `points` | Thanh hiển thị số điểm hiện tại |
| `BoostFeatureCard` | `points, onBoost` | Card boost bài đăng đặc biệt |
| `RewardCard` | `reward, userPoints, onRedeem` | 1 thẻ quà trong grid 2 cột |
| `ConfirmSpendModal` | `reward, isOpen, onConfirm, onCancel` | Xác nhận trước khi tiêu điểm |
| `RedemptionHistory` | `redemptions[]` | Danh sách đơn đổi quà đã gửi |

---

## 3. Luồng Hoạt Động (User Journeys)

### 📍 Hành trình 1: Xem Referral Dashboard & Chia sẻ mã mời

```
1️⃣  User bấm "Giới thiệu bạn" trên Sidebar / Mobile Nav
2️⃣  → Trang /profile/referral load:
     • Fetch song song: /api/referral/stats + /api/referral/code + /api/referral/logs
     • Hiện Skeleton loading → Fill dữ liệu
3️⃣  User nhìn thấy Tier hiện tại + progress bar tới tier kế
4️⃣  User bấm [📋 Copy] → Clipboard nhận link referral → Toast "Đã sao chép!"
5️⃣  Hoặc bấm [📤 Chia sẻ] → Gọi Web Share API (navigator.share)
     • Fallback: Copy link nếu browser không hỗ trợ
6️⃣  User cuộn xuống xem danh sách bạn đã mời
7️⃣  Bấm "Xem thêm" → paginate (page 2, 3...)
```

### 📍 Hành trình 2: Xem Bảng xếp hạng

```
1️⃣  User bấm "Bảng xếp hạng" trên Sidebar / Mobile Nav
2️⃣  → Trang /leaderboard load:
     • Fetch: /api/leaderboard?type=all_time&limit=50
     • Hiện Skeleton → Fill top 3 cards + bảng
3️⃣  User thấy top 3 dạng card Elite (1 ở giữa lớn hơn)
4️⃣  Cuộn xuống → tìm hàng "★ (BẠN)" được highlight xanh
5️⃣  Bấm tab "Tuần này" → Re-fetch: /api/leaderboard?type=weekly
     • Loading indicator nhẹ trên bảng (không full page skeleton)
```

### 📍 Hành trình 3: Đổi quà

```
1️⃣  User bấm "Đổi quà" trên Sidebar / trong Dashboard
2️⃣  → Trang /rewards load:
     • Fetch song song: /api/referral/stats (lấy points) + /api/rewards + /api/rewards/my-redemptions
3️⃣  User thấy số điểm hiện tại ở header: "120 ⭐"
4️⃣  Xem grid quà — quà nào đủ điểm → nút [Đổi] xanh, thiếu điểm → nút xám
5️⃣  Bấm [Đổi] → ConfirmSpendModal mở:
     "Bạn chắc chắn muốn đổi 'Thẻ cào 50k' với 100 điểm?"
6️⃣  a) Bấm "Xác nhận" → POST /api/rewards/redeem
       → Thành công: Toast "🎉 Đã gửi đơn!" + Refresh points + Thêm vào lịch sử
       → Thất bại: Toast đỏ "Không đủ điểm" hoặc "Hết hàng"
    b) Bấm "Hủy" → Đóng modal
7️⃣  Cuộn xuống → Xem lịch sử đổi quà (PENDING / APPROVED / REJECTED / FULFILLED)
```

### 📍 Hành trình 4: Boost bài đăng

```
1️⃣  User bấm [🚀 Đẩy bài — 50 điểm] (trên Dashboard hoặc Rewards)
2️⃣  → BoostIntentModal mở: Hiển thị danh sách intent CỦA user
     • Fetch: /api/intents?userId=me (hoặc dùng existing API)
3️⃣  User chọn 1 bài đăng → ConfirmSpendModal:
     "Boost 'Cần thuê nhà Q7' lên TOP 24h? Tốn 50 điểm."
4️⃣  Xác nhận → POST /api/boosts { intentId }
     → Thành công: Toast "🚀 Bài đã lên TOP!" + Refresh points
     → Thất bại: Toast đỏ "Không đủ điểm" hoặc "Bài đã đang được boost"
```

---

## 4. Tích Hợp Navigation (Sidebar + Mobile Nav)

### 4.1. Desktop Sidebar (components/layout/Sidebar.tsx)

**Thêm 3 menu items mới** vào mảng `navItems`:

```
navItems hiện tại:
  [/feed]  [/saved]  [/settings]

navItems MỚI:
  [/feed]  [/saved]
  ─── divider ───
  [🎯 Giới thiệu bạn → /profile/referral]
  [🏆 Bảng xếp hạng   → /leaderboard]
  [🎁 Đổi quà          → /rewards]
  ─── divider ───
  [/settings]
```

### 4.2. Mobile Bottom Nav (components/layout/MobileNav.tsx)

Thêm icon "🎁" cho Rewards (hoặc thay thế 1 slot hiện tại):

```
Mobile Nav hiện tại: [Feed] [Bots] [Đã lưu]
Mobile Nav MỚI:      [Feed] [Bots] [🎁 Thưởng] [Đã lưu]
```

### 4.3. Tier Badge bên cạnh avatar trong Sidebar

```
  [Avatar] Tên User [⬡ Bạc]    ← badge nhỏ cạnh tên
```

---

## 5. Checklist Kiểm Tra (Acceptance Criteria)

### ✅ Trang `/profile/referral`

- [ ] Load thành công, hiển thị đúng tier + progress bar
- [ ] Bấm [📋 Copy] → Clipboard nhận link `cancotn.com/dang-ky?ref=ABC123`
- [ ] Bấm [📤 Chia sẻ] → Mở share sheet (hoặc copy fallback)
- [ ] Progress bar tính đúng % (VD: 5/10 = 50%)
- [ ] Danh sách bạn mời hiển thị avatar + tên + điểm + thời gian
- [ ] Paginate "Xem thêm" load trang 2
- [ ] Nếu chưa mời ai → Hiện Empty State "Mời bạn bè để nhận thưởng!"
- [ ] Skeleton loading khi đang fetch

### ✅ Trang `/leaderboard`

- [ ] Top 3 hiển thị dạng elite cards (1 ở giữa, 2 hai bên)
- [ ] Hàng user đang đăng nhập được highlight khác biệt
- [ ] Tab "Tất cả" / "Tuần này" chuyển đổi có loading indicator
- [ ] Ranking numbers hiển thị đúng (#1, #2, #3...)
- [ ] Nếu user ngoài top 50 → Hiện "Bạn chưa lọt bảng xếp hạng"

### ✅ Trang `/rewards`

- [ ] Grid 2 cột responsive trên Mobile
- [ ] Quà đủ điểm → nút [Đổi] xanh, thiếu điểm → nút xám + tooltip
- [ ] Bấm [Đổi] → Mở Confirm Modal trước khi gửi
- [ ] Sau đổi thành công → Số điểm cập nhật real-time (không cần F5)
- [ ] Hết hàng (stock = 0) → Hiện "Hết hàng" disable
- [ ] Lịch sử đổi quà hiển thị đúng status + màu status badge

### ✅ Navigation

- [ ] 3 menu items mới xuất hiện trong Sidebar (Desktop)
- [ ] Badge tier hiển thị cạnh avatar trong Sidebar
- [ ] Mobile Nav có nút "Thưởng" trỏ tới "/rewards"
- [ ] Active state highlight đúng khi đang ở trang tương ứng

---

## 6. Test Cases (Given-When-Then)

### TC-01: Happy Path — Copy mã referral
```
Given: User đã đăng nhập, đang ở /profile/referral
When:  Bấm nút [📋 Copy]
Then:  ✓ Clipboard chứa link "cancotn.com/dang-ky?ref=ABC123"
       ✓ Toast "Đã sao chép link giới thiệu!" hiện ra 3 giây
       ✓ Nút Copy chuyển thành "✓ Đã copy" trong 2 giây rồi trở lại
```

### TC-02: Đổi quà thành công
```
Given: User có 150 điểm, đang ở /rewards
When:  Bấm [Đổi] trên "Thẻ cào 50k" (100 điểm)
       Bấm [Xác nhận] trong modal
Then:  ✓ POST /api/rewards/redeem → 200
       ✓ Số điểm header giảm: 150 → 50
       ✓ "Thẻ cào 50k" xuất hiện trong Lịch sử (status: Đang xử lý)
       ✓ Toast "🎉 Gửi đơn thành công!"
```

### TC-03: Đổi quà — Thiếu điểm
```
Given: User có 50 điểm, đang ở /rewards
When:  Bấm [Đổi] trên "Voucher Grab" (200 điểm)
Then:  ✓ Nút [Đổi] bị disable (xám) HOẶC
       ✓ Modal mở nhưng nút Xác nhận disable + ghi "Bạn cần thêm 150 điểm"
```

### TC-04: Leaderboard — Tab switch
```
Given: User đang ở /leaderboard, đang xem tab "Tất cả"
When:  Bấm tab "Tuần này"
Then:  ✓ Bảng hiện loading spinner nhẹ
       ✓ Dữ liệu cập nhật (rank có thể thay đổi)
       ✓ Tab "Tuần này" active (highlight)
```

### TC-05: Empty State — Chưa mời ai
```
Given: User mới, chưa mời ai, totalReferrals = 0
When:  Vào /profile/referral
Then:  ✓ Phần "Bạn đã giới thiệu" hiện empty state với illustration
       ✓ CTA: "Chia sẻ mã ngay để nhận 20 điểm mỗi lượt!"
       ✓ Nút [📤 Chia sẻ] nổi bật hơn
```

### TC-06: Responsive — Mobile 375px
```
Given: User trên iPhone SE (375px width)
When:  Vào /rewards
Then:  ✓ Grid quà tặng hiển thị 2 cột (mỗi thẻ ~170px)
       ✓ Không bị tràn ngang, không cuộn ngang
       ✓ Bottom nav không che nội dung cuối trang (có padding-bottom an toàn)
```

---

## 7. Files Cần Tạo / Sửa

### 📂 NEW — Pages (3 files)
| File | Mô tả |
|---|---|
| `app/(main)/profile/referral/page.tsx` | Dashboard Referral |
| `app/(main)/leaderboard/page.tsx` | Bảng xếp hạng |
| `app/(main)/rewards/page.tsx` | Cửa hàng quà |

### 📂 NEW — Components (13 files)
| File | Mô tả |
|---|---|
| `components/referral/TierCard.tsx` | Badge hạng + progress bar |
| `components/referral/StatsRow.tsx` | 3 ô thống kê |
| `components/referral/ReferralCodeBox.tsx` | Link + Copy + Share |
| `components/referral/ReferralLogItem.tsx` | 1 dòng bạn mời |
| `components/referral/ReferralLogTable.tsx` | Danh sách bạn mời |
| `components/referral/TierInfoModal.tsx` | Popup 5 cấp bậc |
| `components/referral/LeaderboardTopCards.tsx` | Top 3 Elite cards |
| `components/referral/LeaderboardTable.tsx` | Bảng rank 4+ |
| `components/referral/LeaderboardTabs.tsx` | Tab switch |
| `components/referral/RewardCard.tsx` | 1 thẻ quà |
| `components/referral/BoostFeatureCard.tsx` | Card boost đặc biệt |
| `components/referral/ConfirmSpendModal.tsx` | Modal xác nhận chi tiêu |
| `components/referral/RedemptionHistory.tsx` | Lịch sử đổi quà |

### 📂 NEW — Styles (1 file)
| File | Mô tả |
|---|---|
| `app/styles/referral.module.css` | CSS Module cho hệ thống referral |

### 📂 MODIFY — Navigation (2 files)
| File | Thay đổi |
|---|---|
| `components/layout/Sidebar.tsx` | Thêm 3 nav items + Tier badge cạnh avatar |
| `components/layout/MobileNav.tsx` | Thêm nút "Thưởng" → /rewards |

### 📂 MODIFY — Registration (1 file)
| File | Thay đổi |
|---|---|
| `app/(auth)/register/page.tsx` | Đọc `?ref=CODE` từ URL, gửi kèm khi đăng ký |

---

## 8. Thứ Tự Triển Khai (Implementation Order)

```
Phase 4A — Styles + Components cơ sở        (~30 phút)
  1. referral.module.css (tokens, utilities)
  2. TierCard
  3. StatsRow
  4. ReferralCodeBox

Phase 4B — Dashboard page                    (~20 phút)
  5. ReferralLogItem + ReferralLogTable
  6. TierInfoModal
  7. /profile/referral/page.tsx (ghép tất cả)

Phase 4C — Leaderboard page                  (~20 phút)
  8. LeaderboardTopCards
  9. LeaderboardTable + LeaderboardTabs
  10. /leaderboard/page.tsx

Phase 4D — Rewards page                      (~25 phút)
  11. RewardCard + BoostFeatureCard
  12. ConfirmSpendModal
  13. RedemptionHistory
  14. /rewards/page.tsx

Phase 4E — Navigation Integration            (~10 phút)
  15. Sidebar.tsx (thêm menu + tier badge)
  16. MobileNav.tsx (thêm nút Thưởng)

Phase 4F — Register Integration              (~5 phút)
  17. register/page.tsx (đọc ?ref= param)
```

---

*Tạo bởi AWF 4.0 — Design Phase*
*Kiến trúc sư: Minh*
