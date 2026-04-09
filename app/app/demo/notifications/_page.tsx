'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';
import { BottomNav } from '@/components/intent/BottomNav';
import { cn, formatDistanceToNow } from '@/lib/utils';

const BASE_TIME = new Date('2026-03-22T08:00:00Z').getTime();
const h = (hours: number) => new Date(BASE_TIME - hours * 60 * 60 * 1000).toISOString();

const MOCK_NOTIFICATIONS = [
  { id: 'n01', type: 'match', icon: '🤝', title: 'Tìm thấy 3 match mới cho "Tìm căn hộ 2PN Q7"', time: h(0.5), read: false },
  { id: 'n02', type: 'message', icon: '💬', title: 'Trần Anh Khoa đã nhắn: "Dạ anh xem nhà chiều nay..."', time: h(1), read: false },
  { id: 'n03', type: 'bot', icon: '🤖', title: 'Match Advisor gợi ý mới trên tin Vinhomes Q7', time: h(1.5), read: false },
  { id: 'n04', type: 'reaction', icon: '👍', title: '8 người quan tâm đến tin Vinhomes Q7 của bạn', time: h(3), read: false },
  { id: 'n05', type: 'match', icon: '🤝', title: 'Match mới: Sunrise City Q7 3PN phù hợp 87%', time: h(4), read: false },
  { id: 'n06', type: 'message', icon: '💬', title: 'Lê Hồng Nhung: "Cho em hỏi phí quản lý..."', time: h(5), read: false },
  { id: 'n07', type: 'bot', icon: '🏠', title: 'Nhà Advisor: Giá Q7 tăng 5% so với tháng trước', time: h(6), read: false },
  { id: 'n08', type: 'verify', icon: '✅', title: 'CCCD đã được xác thực thành công', time: h(8), read: true },
  { id: 'n09', type: 'reaction', icon: '💰', title: '5 người đánh giá "Giá hợp lý" tin Masteri', time: h(10), read: true },
  { id: 'n10', type: 'match', icon: '🤝', title: 'Có người mới đăng nhà phố Gò Vấp phù hợp bạn', time: h(12), read: true },
  { id: 'n11', type: 'message', icon: '💬', title: 'Đặng Minh Đức: "Giá đã giảm 200tr..."', time: h(14), read: true },
  { id: 'n12', type: 'saved', icon: '📌', title: 'Tin bạn lưu "Bán Saigon Pearl 3PN" vừa giảm giá', time: h(18), read: true },
  { id: 'n13', type: 'bot', icon: '📊', title: 'Market Analyst: Báo cáo tuần Q7 — cầu/cung 2.7x', time: h(20), read: true },
  { id: 'n14', type: 'match', icon: '🤝', title: '2 match mới cho "Tìm nhà phố Bình Thạnh"', time: h(24), read: true },
  { id: 'n15', type: 'reaction', icon: '🔥', title: 'Tin Sunrise City Q7 đang HOT — 15 quan tâm', time: h(28), read: true },
  { id: 'n16', type: 'message', icon: '💬', title: 'Hoàng Thanh Hà: "Cuối tuần mình xem nhà nhé"', time: h(32), read: true },
  { id: 'n17', type: 'verify', icon: '✅', title: 'Sổ đỏ đã được duyệt — Trust Score tăng lên 4.2', time: h(36), read: true },
  { id: 'n18', type: 'bot', icon: '🛡️', title: 'Trust Checker: Bạn đã xác thực 2/3 — thêm GPS?', time: h(40), read: true },
  { id: 'n19', type: 'match', icon: '🤝', title: 'Gateway Thảo Điền phù hợp 82% nhu cầu bạn', time: h(48), read: true },
  { id: 'n20', type: 'reaction', icon: '👍', title: '12 người quan tâm đến tin bán nhà Gò Vấp', time: h(52), read: true },
  { id: 'n21', type: 'bot', icon: '🤝', title: 'Connector: Nguyễn Minh Tú cũng tìm nhà Q7 — kết nối?', time: h(56), read: true },
  { id: 'n22', type: 'message', icon: '💬', title: 'Phạm Hoàng Nam: "Anh có thể gửi thêm ảnh?"', time: h(60), read: true },
  { id: 'n23', type: 'match', icon: '🤝', title: 'Match mới: Căn hộ Tân Phú 2.1 tỷ phù hợp budget', time: h(72), read: true },
  { id: 'n24', type: 'saved', icon: '📌', title: 'Tin "Cho thuê Masteri" bạn lưu có 3 match mới', time: h(80), read: true },
  { id: 'n25', type: 'bot', icon: '🎯', title: 'Concierge: Mẹo tăng match — thêm ảnh thật', time: h(88), read: true },
  { id: 'n26', type: 'reaction', icon: '💰', title: '3 người đánh giá giá hợp lý tin Studio Thủ Đức', time: h(96), read: true },
  { id: 'n27', type: 'verify', icon: '✅', title: 'GPS check-in thành công — Trust Score: 4.5/5', time: h(108), read: true },
  { id: 'n28', type: 'match', icon: '🤝', title: '4 match mới tuần này — xem chi tiết →', time: h(120), read: true },
  { id: 'n29', type: 'message', icon: '💬', title: 'Lê Quốc Bảo: "Deal chốt rồi, cảm ơn bạn!"', time: h(144), read: true },
  { id: 'n30', type: 'bot', icon: '📊', title: 'Market Analyst: Thủ Đức nóng nhất — 6x cầu/cung', time: h(168), read: true },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="pb-20 md:pb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-[var(--wm-primary)]" />
          <h1 className="text-lg font-bold text-foreground">Thông báo</h1>
          {unread > 0 && <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full">{unread}</span>}
        </div>
        {unread > 0 && (
          <button onClick={() => setNotifications((p) => p.map((n) => ({ ...n, read: true })))} className="text-xs text-[var(--wm-primary)] font-semibold">Đọc tất cả</button>
        )}
      </div>

      <div className="wm-panel divide-y divide-[var(--wm-border-subtle,#2F3032)]">
        {notifications.map((n) => (
          <button key={n.id} onClick={() => setNotifications((p) => p.map((item) => item.id === n.id ? { ...item, read: true } : item))}
            className={cn('w-full flex items-start gap-3 p-3 text-left hover:bg-[var(--wm-surface-hover)] transition-colors', !n.read && 'bg-[var(--wm-primary)]/5')}>
            <span className="text-lg shrink-0">{n.icon}</span>
            <div className="flex-1 min-w-0">
              <p className={cn('text-sm leading-snug', !n.read ? 'text-foreground font-medium' : 'text-muted-foreground')}>{n.title}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{formatDistanceToNow(n.time)}</p>
            </div>
            {!n.read && <span className="w-2.5 h-2.5 bg-[var(--wm-primary)] rounded-full mt-1 shrink-0" />}
          </button>
        ))}
      </div>
      <BottomNav />
    </div>
  );
}
