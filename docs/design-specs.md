# Design Specifications: Real-time AI Observer
Dự án: CẦN & CÓ

## 🎨 Color Palette & Vibe
| Name | Focus | Tailwind Class | Usage |
|------|-------|----------------|-------|
| Surface | #0f172a | `bg-slate-900` | Nền chính của Sidebar |
| Glass | #1e293b / 40% | `bg-slate-800/40 backdrop-blur-2xl` | Nền mờ của Component chứa log |
| Border | #334155 / 50% | `border-slate-700/50` | Viền mỏng tách biệt khối |
| Accent Emerald | #10b981 | `text-emerald-500` | Highlight cho Bot Name / Icon |
| Text Primary | #f1f5f9 | `text-slate-100` | Tittle & Nội dung log chính |
| Text Muted | #94a3b8 | `text-slate-400` | Timestamp & Metadata |

## 📝 Typography
| Element | Font | Tailwind Class | Style |
|---------|------|----------------|-------|
| Header | Sans | `text-sm font-bold uppercase tracking-widest` | Tiêu đề "SuperBrain AI" |
| Log Title | Sans | `text-sm font-semibold` | Tên của Bot thực thi |
| Log Body | Sans | `text-[13px] leading-relaxed` | Đoạn nhận xét / text bot trả về |
| Metadata | Sans | `text-[10px] font-medium` | Chữ nhỏ góc phụ |

## ✨ Animations (Linh hồn của Live Stream)
| Element | Effect | Tailwind Class |
|---------|--------|----------------|
| Vòng Ring | Quét radar | `animate-[scan_2s_ease-in-out_infinite]` |
| Status Dot| Đập nhịp tim | `animate-pulse text-emerald-400` |
| New Log In| Rơi từ trên xuống / Fade | `animate-in fade-in slide-in-from-top-4 duration-500` |

## 🖼️ UI Structure (Observer Sidebar)
```html
<aside className="w-[400px] h-screen bg-slate-900 border-l border-slate-800/50 flex flex-col relative overflow-hidden">
  <!-- Header cố định -->
  <div className="p-4 bg-slate-800/80 backdrop-blur-md rounded-2xl m-4 border border-emerald-500/20">
    Hệ thống lắng nghe Bot
  </div>

  <!-- Danh sách trượt (Live log) -->
  <div className="flex-1 overflow-y-auto px-4 space-y-4 custom-scrollbar">
    <!-- Component: BotLogItem -->
    <div className="animate-in fade-in ...">
       <Avatar /> <Nội dung>
    </div>
  </div>
</aside>
```
Đã đồng bộ tuyệt đối với layout Dark Mode có sẵn của dự án CẦN & CÓ.
