'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { IntentCard } from '@/components/intent/IntentCard';
import { ComposeIntent } from '@/components/intent/ComposeIntent';
import { BottomNav } from '@/components/intent/BottomNav';
import { NotificationBell } from '@/components/intent/NotificationBell';
import { OnboardingBanner } from '@/components/intent/OnboardingBanner';
import { cn } from '@/lib/utils';
import { Home, Handshake, TrendingUp, Loader2 } from 'lucide-react';
import type { MockIntent } from '@/lib/mock/intents';

type FilterType = 'all' | 'CAN' | 'CO';

const TABS: { key: FilterType; label: string; icon?: React.ReactNode }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'CAN', label: 'CẦN', icon: <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> },
  { key: 'CO', label: 'CÓ', icon: <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> },
];

export default function CanCoRealFeedPage() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [intents, setIntents] = useState<MockIntent[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const hasMore = intents.length < total;

  const fetchIntents = useCallback(async (pageNum: number, typeFilter?: string, append = false) => {
    try {
      const params = new URLSearchParams({ page: String(pageNum), limit: '10' });
      if (typeFilter && typeFilter !== 'all') params.set('type', typeFilter);

      const res = await fetch(`/api/intents?${params}`);
      if (!res.ok) throw new Error('Failed to load');

      const data = await res.json();

      if (append) {
        setIntents((prev) => [...prev, ...(data.intents || [])]);
      } else {
        setIntents(data.intents || []);
      }
      setTotal(data.total || 0);
      setError(null);
    } catch {
      setError('Không thể tải dữ liệu');
    }
  }, []);

  // Initial load + filter change
  useEffect(() => {
    setIsLoading(true);
    setPage(1);
    fetchIntents(1, filter === 'all' ? undefined : filter).finally(() => setIsLoading(false));
  }, [filter, fetchIntents]);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && !isLoading) {
          setIsLoadingMore(true);
          const nextPage = page + 1;
          setPage(nextPage);
          fetchIntents(nextPage, filter === 'all' ? undefined : filter, true).finally(() =>
            setIsLoadingMore(false),
          );
        }
      },
      { threshold: 0.1 },
    );

    const el = loadMoreRef.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, [hasMore, isLoadingMore, isLoading, page, filter, fetchIntents]);

  const handleIntentCreated = useCallback(() => {
    setPage(1);
    fetchIntents(1, filter === 'all' ? undefined : filter);
  }, [filter, fetchIntents]);

  const canCount = intents.filter((i) => i.type === 'CAN').length;
  const coCount = intents.filter((i) => i.type === 'CO').length;
  const matchCount = intents.reduce((sum, i) => sum + (i.match_count || 0), 0);

  return (
    <div className="pb-20 md:pb-4">
      {/* Page Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Handshake className="w-5 h-5 text-[var(--wm-primary)]" />
            <h1 className="text-lg font-bold text-[var(--wm-text)]">CẦN & CÓ</h1>
          </div>
          <NotificationBell />
        </div>
        <p className="text-xs text-[var(--wm-text-muted)]">Đăng nhu cầu. AI kết nối.</p>
      </div>

      {/* Onboarding */}
      <OnboardingBanner />

      {/* Compose (real mode) */}
      <div className="mb-3">
        <ComposeIntent mode="real" onIntentCreated={handleIntentCreated} />
      </div>

      {/* Stats Bar */}
      <div className="wm-panel mb-3">
        <div className="flex items-center justify-between p-2.5">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="tabular-nums text-sm font-bold text-[var(--wm-text)]">{canCount}</div>
              <div className="text-[9px] uppercase tracking-wider text-[var(--wm-text-muted)] font-semibold">Đang tìm</div>
            </div>
            <div className="w-px h-6 bg-[var(--wm-border)]" />
            <div className="text-center">
              <div className="tabular-nums text-sm font-bold text-[var(--wm-text)]">{coCount}</div>
              <div className="text-[9px] uppercase tracking-wider text-[var(--wm-text-muted)] font-semibold">Đang bán</div>
            </div>
            <div className="w-px h-6 bg-[var(--wm-border)]" />
            <div className="text-center">
              <div className="tabular-nums text-sm font-bold text-emerald-500">{matchCount}</div>
              <div className="text-[9px] uppercase tracking-wider text-[var(--wm-text-muted)] font-semibold">Match</div>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-[var(--wm-primary)] font-semibold">
            <TrendingUp className="w-3 h-3" />
            <span>BĐS HCM</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-[2px] mb-3 border-b border-[var(--wm-border)]">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap',
              filter === tab.key
                ? 'border-[var(--wm-primary)] text-[var(--wm-accent)] font-semibold'
                : 'border-transparent text-[var(--wm-text-dim)] hover:text-[var(--wm-text)] hover:bg-[var(--wm-overlay-subtle)]',
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--wm-text-muted)]" />
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="wm-panel p-6 text-center">
          <p className="text-sm text-red-500 mb-2">{error}</p>
          <button
            onClick={() => fetchIntents(1, filter === 'all' ? undefined : filter)}
            className="text-xs text-[var(--wm-primary)] font-semibold"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Intent Feed */}
      {!isLoading && !error && (
        <div className="space-y-3">
          {intents.map((intent) => (
            <IntentCard key={intent.id} intent={intent as MockIntent} basePath="/can-co" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && intents.length === 0 && (
        <div className="wm-panel p-8 text-center">
          <Home className="w-8 h-8 mx-auto mb-2 text-[var(--wm-text-faint)]" />
          <p className="text-sm text-[var(--wm-text-muted)] mb-1">Chưa có ai đăng. Hãy là người đầu tiên!</p>
          <p className="text-xs text-[var(--wm-text-faint)]">Bấm vào ô phía trên để đăng nhu cầu CẦN hoặc CÓ</p>
        </div>
      )}

      {/* Load More */}
      {hasMore && (
        <div ref={loadMoreRef} className="py-6 flex justify-center">
          {isLoadingMore ? (
            <Loader2 className="w-5 h-5 animate-spin text-[var(--wm-text-muted)]" />
          ) : (
            <span className="text-xs text-[var(--wm-text-muted)]">Cuộn để xem thêm</span>
          )}
        </div>
      )}

      {/* End of feed */}
      {!hasMore && intents.length > 0 && !isLoading && (
        <div className="py-6 text-center">
          <p className="text-xs text-[var(--wm-text-faint)]">Đã hiển thị tất cả {intents.length} intent</p>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
