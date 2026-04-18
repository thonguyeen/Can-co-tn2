# DESIGN: TopNavbar — Chuyển Menu Dọc → Ngang
Created: 2026-04-18T15:08
Plan: plans/260418-1500-topnav-migration/plan.md

---

## 1. Phạm vi thay đổi

| File | Thay đổi |
|------|---------|
| `components/layout/TopNavbar.tsx` | [NEW] Component mới |
| `app/page.tsx` | [MODIFY] Đổi layout từ flex-row → flex-col, thay SidebarDesktop |
| `components/layout/SidebarDesktop.tsx` | [KEEP tạm, xóa sau] |
| `components/layout/BottomNavMobile.tsx` | [KHÔNG đổi] |

Không có thay đổi về Database hay API.

---

## 2. Component Spec: TopNavbar

### Anatomy
```
[Logo]  [Home] [Map] [Swipe] [Chat³] [Apps]  [Bell] [Avatar]
```

### Props Interface
```typescript
interface TopNavbarProps {
  activeTab: string;
  setActiveTab: (id: string) => void;
}
```

### Nav Items (từ SidebarDesktop)
```typescript
const NAV_ITEMS = [
  { id: 'home',  label: 'Trang chủ', icon: <Home /> },
  { id: 'map',   label: 'Bản đồ',    icon: <MapIcon /> },
  { id: 'swipe', label: 'Khớp Nhanh', icon: <Flame /> },
  { id: 'chat',  label: 'Tin nhắn',  icon: <MessageCircle />, badge: 3 },
  { id: 'apps',  label: 'Tiện ích',  icon: <LayoutGrid /> },
];
```

### Styling Tokens
| Element | Tailwind Classes |
|---------|-----------------|
| Wrapper | `hidden md:flex h-16 items-center justify-between px-6 bg-white border-b border-slate-100 shadow-sm z-50` |
| Logo    | `text-xl font-black text-[#0068FF]` |
| Nav container | `flex items-center gap-1` |
| Nav item (inactive) | `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer` |
| Nav item (active) | `... bg-indigo-50 text-indigo-700 font-bold` |
| Badge | `absolute -top-1 -right-1.5 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full` |
| Right actions | `flex items-center gap-3` |

---

## 3. Layout Shell Thay Đổi (app/page.tsx)

### Trước
```jsx
<div className="w-full h-screen flex bg-gray-50 overflow-hidden">
  <SidebarDesktop activeTab={activeTab} setActiveTab={setActiveTab} />
  <main className="flex-1 ...">
    {/* tabs */}
  </main>
  <BottomNavMobile activeTab={activeTab} setActiveTab={setActiveTab} />
  <GlobalChatbot activeTab={activeTab} />
</div>
```

### Sau
```jsx
<div className="w-full h-screen flex flex-col bg-slate-50 overflow-hidden">
  <TopNavbar activeTab={activeTab} setActiveTab={setActiveTab} />
  <main className="flex-1 relative flex flex-col min-w-0 overflow-hidden pb-[70px] md:pb-0">
    {/* tabs — giữ nguyên */}
  </main>
  <BottomNavMobile activeTab={activeTab} setActiveTab={setActiveTab} />
  <GlobalChatbot activeTab={activeTab} />
</div>
```

---

## 4. Acceptance Criteria

- [ ] TC-01: Desktop ≥ 768px → TopNavbar hiển thị, Sidebar biến mất
- [ ] TC-02: Click tab → active state đúng (indigo highlight)
- [ ] TC-03: Badge `3` đỏ hiện trên Tin nhắn
- [ ] TC-04: Mobile < 768px → TopNavbar ẩn, BottomNavMobile hiện
- [ ] TC-05: Content feed không bị chồng lên navbar (padding đúng)
- [ ] TC-06: GlobalChatbot FAB không bị che bởi TopNavbar
- [ ] TC-07: `tab=swipe` mặc định khi vào trang (giữ nguyên từ page.tsx)

---

*Design by AWF 2.1 · Sẵn sàng cho /code*
