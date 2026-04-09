'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { IntentCard } from '@/components/intent/IntentCard';
import { ComposeIntent } from '@/components/intent/ComposeIntent';
import { BottomNav } from '@/components/intent/BottomNav';
import { OnboardingBanner } from '@/components/intent/OnboardingBanner';
import { type MockIntent } from '@/lib/mock/intents';
import { GENERATED_INTENTS } from '@/lib/mock/intent-generator';
import { CRAWLED_INTENTS } from '@/lib/mock/crawled-listings';
import { InsightCard } from '@/components/intent/InsightCard';
import { DEMO_INSIGHTS } from '@/lib/mock/insights';
import { cn } from '@/lib/utils';
import { Home, Handshake, TrendingUp } from 'lucide-react';

type FilterType = 'all' | 'CAN' | 'CO';

const TABS: { key: FilterType; label: string; icon?: React.ReactNode }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'CAN', label: 'CẦN', icon: <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> },
  { key: 'CO', label: 'CÓ', icon: <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> },
];

const PAGE_SIZE = 8;

export default function DemoPage() {
  const [filter, setFilter] = useState<FilterType>('all');
  const MOCK_INTENTS = [...GENERATED_INTENTS, ...CRAWLED_INTENTS].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const [intents, setIntents] = useState<MockIntent[]>(MOCK_INTENTS);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const filtered = filter === 'all' ? intents : intents.filter((i) => i.type === filter);
  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          setIsLoadingMore(true);
          setTimeout(() => {
            setVisibleCount((prev) => prev + PAGE_SIZE);
            setIsLoadingMore(false);
          }, 600);
        }
      },
      { threshold: 0.1 },
    );
    const el = loadMoreRef.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, [hasMore, isLoadingMore]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filter]);

  // Load real intents from DB on mount and put them at the top
  useEffect(() => {
    const fetchRealIntents = async () => {
      try {
        const res = await fetch('/api/intents?limit=20&status=active');
        if (!res.ok) return;
        const data = await res.json();
        if (data.intents && data.intents.length > 0) {
          setIntents((prev) => {
            const mockIds = new Set(MOCK_INTENTS.map((i) => i.id));
            const dbIntents = data.intents.filter((i: MockIntent) => !mockIds.has(i.id));
            if (dbIntents.length === 0) return prev;
            // DB intents on top, then mock data
            return [...dbIntents, ...MOCK_INTENTS];
          });
        }
      } catch {
        // Silently fail — mock data still shows
      }
    };
    fetchRealIntents();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNewIntent = useCallback((newIntent: MockIntent) => {
    setIntents((prev) => [newIntent, ...prev]);
  }, []);

  const handleIntentCreated = useCallback(async () => {
    // Fetch ngay để bài hiện lên trước (chưa có bot comment)
    const fetchAndMerge = async () => {
      try {
        const res = await fetch('/api/intents?limit=5');
        if (res.ok) {
          const data = await res.json();
          if (data.intents && data.intents.length > 0) {
            setIntents((prev) => {
              const existingIds = new Set(prev.map((i) => i.id));
              const newOnes = data.intents.filter((i: MockIntent) => !existingIds.has(i.id));
              if (newOnes.length === 0) {
                // Update existing intents with fresh bot_comment data
                const updatedMap = new Map(data.intents.map((i: MockIntent) => [i.id, i]));
                return prev.map((i) => {
                  const fresh = updatedMap.get(i.id) as MockIntent | undefined;
                  return fresh ? { ...i, ...fresh } : i;
                });
              }
              return [...newOnes, ...prev];
            });
          }
        }
      } catch {
        // Fallback: keep existing mock data
      }
    };

    // Fetch ngay để bài hiện ra
    await fetchAndMerge();

    // Fetch lại sau 3 giây — lúc này bot comment đã kịp được ghi vào DB
    setTimeout(() => { fetchAndMerge(); }, 3000);
  }, []);

  return (
    <div className="pb-20 md:pb-4">
      {/* Page Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <Handshake className="w-5 h-5 text-[var(--wm-primary)]" />
          <h1 className="text-lg font-bold text-[var(--wm-text)]">
            CẦN & CÓ
          </h1>
        </div>
        <p className="text-xs text-[var(--wm-text-muted)]">
          Đăng nhu cầu. AI kết nối.
        </p>
      </div>

      <OnboardingBanner />

      <div className="mb-3">
        <ComposeIntent mode="real" onSubmit={handleNewIntent} onIntentCreated={handleIntentCreated} />
      </div>

      {/* Stats Bar */}
      <div className="wm-panel mb-3">
        <div className="flex items-center justify-between p-2.5">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="tabular-nums text-sm font-bold text-[var(--wm-text)]">{intents.filter((i) => i.type === 'CAN').length}</div>
              <div className="text-[9px] uppercase tracking-wider text-[var(--wm-text-muted)] font-semibold">Đang tìm</div>
            </div>
            <div className="w-px h-6 bg-[var(--wm-border)]" />
            <div className="text-center">
              <div className="tabular-nums text-sm font-bold text-[var(--wm-text)]">{intents.filter((i) => i.type === 'CO').length}</div>
              <div className="text-[9px] uppercase tracking-wider text-[var(--wm-text-muted)] font-semibold">Đang bán</div>
            </div>
            <div className="w-px h-6 bg-[var(--wm-border)]" />
            <div className="text-center">
              <div className="tabular-nums text-sm font-bold text-emerald-500">{intents.reduce((sum, i) => sum + i.match_count, 0)}</div>
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
            <span className="tabular-nums text-[10px] text-[var(--wm-text-muted)]">
              ({tab.key === 'all' ? intents.length : intents.filter((i) => i.type === tab.key).length})
            </span>
          </button>
        ))}
      </div>

      {/* Intent Feed — with insights interleaved */}
      <div className="space-y-3">
        {visible.map((intent, index) => (
          <div key={intent.id}>
            <IntentCard intent={intent} basePath="/demo" />
            {/* Insert insight after every 4th intent */}
            {(index + 1) % 4 === 0 && DEMO_INSIGHTS[Math.floor(index / 4)] && (
              <div className="mt-3">
                <p className="text-[10px] text-center text-[var(--wm-text-faint)] uppercase tracking-widest mb-2">— Phân tích thị trường —</p>
                <InsightCard insight={DEMO_INSIGHTS[Math.floor(index / 4)]} />
              </div>
            )}
          </div>
        ))}
      </div>

      {hasMore && (
        <div ref={loadMoreRef} className="py-6 flex justify-center">
          {isLoadingMore ? (
            <div className="space-y-3 w-full">
              {[1, 2].map((i) => (
                <div key={i} className="wm-panel p-4 animate-pulse">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-zinc-700 shrink-0" />
                    <div className="flex-1">
                      <div className="h-3 bg-zinc-700 rounded w-1/3 mb-2" />
                      <div className="h-2 bg-zinc-700 rounded w-1/4" />
                    </div>
                  </div>
                  <div className="h-3 bg-zinc-700 rounded w-full mb-2" />
                  <div className="h-3 bg-zinc-700 rounded w-4/5" />
                </div>
              ))}
            </div>
          ) : (
            <span className="text-xs text-[var(--wm-text-muted)]">Cuộn để xem thêm</span>
          )}
        </div>
      )}

      {!hasMore && visible.length > 0 && (
        <div className="py-6 text-center">
          <p className="text-xs text-[var(--wm-text-faint)]">Đã hiển thị tất cả {filtered.length} tin đăng</p>
        </div>
      )}

      {visible.length === 0 && (
        <div className="wm-panel p-8 text-center">
          <Home className="w-8 h-8 mx-auto mb-2 text-[var(--wm-text-faint)]" />
          <p className="text-sm text-[var(--wm-text-muted)]">Chưa có tin đăng nào</p>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
