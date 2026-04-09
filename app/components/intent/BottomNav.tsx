'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageCircle, Users, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const pathname = usePathname();
  const isDemo = pathname.startsWith('/demo');
  const base = isDemo ? '/demo' : '/can-co';

  const items = [
    { href: base, icon: Home, label: 'Feed' },
    { href: isDemo ? '/demo/messenger' : `${base}/chat`, icon: MessageCircle, label: 'Chat' },
    { href: isDemo ? '/demo/friends' : `${base}/friends`, icon: Users, label: 'Kết nối' },
    { href: isDemo ? '/demo/profile' : `${base}/profile`, icon: User, label: 'Tôi' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-[var(--wm-border)] bg-[var(--wm-surface)]">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const isActive = pathname === item.href ||
            (item.label === 'Feed' && (pathname === base || pathname.startsWith(`${base}/intent`))) ||
            (item.label === 'Chat' && pathname.startsWith(item.href)) ||
            (item.label === 'Kết nối' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex flex-col items-center gap-0.5 py-2 px-3 text-[10px] transition-colors min-w-[56px]',
                isActive
                  ? 'text-[var(--wm-primary)] font-semibold'
                  : 'text-[var(--wm-text-muted)]',
              )}
            >
              <item.icon className={cn('w-5 h-5', isActive && 'stroke-[2.5]')} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
