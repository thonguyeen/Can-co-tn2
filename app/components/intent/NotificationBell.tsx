'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Bell, MessageCircle, Handshake, Bot, X } from 'lucide-react';
import { cn, formatDistanceToNow } from '@/lib/utils';

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  new_message: <MessageCircle className="w-3.5 h-3.5 text-blue-500" />,
  match_found: <Handshake className="w-3.5 h-3.5 text-emerald-500" />,
  bot_comment: <Bot className="w-3.5 h-3.5 text-[var(--wm-primary)]" />,
};

export function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.slice(0, 10));
        setUnreadCount(data.filter((n: NotificationItem) => !n.is_read).length);
      }
    } catch {
      // Fail silently
    }
  };

  // Initial load + periodic poll
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const markRead = async (ids: string[]) => {
    await fetch('/api/notifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notification_ids: ids }),
    });
    setNotifications((prev) =>
      prev.map((n) => (ids.includes(n.id) ? { ...n, is_read: true } : n)),
    );
    setUnreadCount((prev) => Math.max(0, prev - ids.length));
  };

  const markAllRead = async () => {
    await fetch('/api/notifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notification_ids: notifications.filter((n) => !n.is_read).map((n) => n.id) }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-[var(--wm-surface-hover)] transition-colors"
      >
        <Bell className="w-5 h-5 text-[var(--wm-text-dim)]" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-80 max-h-96 overflow-y-auto wm-panel shadow-lg z-50">
          <div className="wm-panel-header">
            <span className="wm-panel-title">Thông báo</span>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[10px] text-[var(--wm-primary)] font-semibold hover:underline"
                >
                  Đọc tất cả
                </button>
              )}
              <button onClick={() => setIsOpen(false)}>
                <X className="w-3.5 h-3.5 text-[var(--wm-text-muted)]" />
              </button>
            </div>
          </div>

          {notifications.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-xs text-[var(--wm-text-muted)]">Chưa có thông báo</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--wm-border-subtle)]">
              {notifications.map((notif) => (
                <Link
                  key={notif.id}
                  href={notif.link || '#'}
                  onClick={() => {
                    if (!notif.is_read) markRead([notif.id]);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'flex items-start gap-2.5 p-3 hover:bg-[var(--wm-surface-hover)] transition-colors',
                    !notif.is_read && 'bg-[color-mix(in_srgb,var(--wm-primary)_3%,transparent)]',
                  )}
                >
                  <div className="mt-0.5 shrink-0">
                    {TYPE_ICONS[notif.type] || <Bell className="w-3.5 h-3.5 text-[var(--wm-text-muted)]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'text-xs leading-snug',
                      !notif.is_read ? 'text-[var(--wm-text)] font-medium' : 'text-[var(--wm-text-dim)]',
                    )}>
                      {notif.title}
                    </p>
                    {notif.message && (
                      <p className="text-[10px] text-[var(--wm-text-muted)] mt-0.5 truncate">{notif.message}</p>
                    )}
                    <p className="text-[10px] text-[var(--wm-text-faint)] mt-0.5">
                      {formatDistanceToNow(notif.created_at)}
                    </p>
                  </div>
                  {!notif.is_read && (
                    <span className="w-2 h-2 bg-[var(--wm-primary)] rounded-full mt-1 shrink-0" />
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
