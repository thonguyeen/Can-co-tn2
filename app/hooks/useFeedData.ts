'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { type MockIntent } from '@/lib/mock/intents';

type FilterType = 'all' | 'CAN' | 'CO';
const PAGE_SIZE = 8;

export function useFeedData() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [intents, setIntents] = useState<MockIntent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [activeIntent, setActiveIntent] = useState<MockIntent | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Filtered + sorted data
  const allFiltered = filter === 'all' ? intents : intents.filter((i) => i.type === filter);

  const vipIntents = [...allFiltered]
    .filter((i) => i.match_count > 0 || i.trust_score >= 4)
    .sort((a, b) => b.match_count - a.match_count)
    .slice(0, 5);

  const regularIntents = allFiltered.filter((i) => !vipIntents.includes(i));
  const visibleRegular = regularIntents.slice(0, visibleCount);
  const hasMore = visibleCount < regularIntents.length;

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && !isLoading) {
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
  }, [hasMore, isLoadingMore, isLoading]);

  // Fetch intents from API
  const fetchRealIntents = useCallback(async (isBackground = false) => {
    try {
      if (!isBackground) setIsLoading(true);
      setApiError(null);
      const res = await fetch('/api/intents?limit=50&status=active');
      if (!res.ok) throw new Error('Failed to fetch API');
      const data = await res.json();
      if (data.intents && Array.isArray(data.intents)) {
        setIntents(data.intents);
      } else {
        setIntents([]);
      }
    } catch (err) {
      console.error('Lỗi tải tin:', err);
      if (!isBackground) setApiError('Gặp sự cố khi nạp dữ liệu. Vui lòng tải lại trang.');
    } finally {
      if (!isBackground) setIsLoading(false);
    }
  }, []);

  // Initial fetch + auto-refresh polling (15s)
  useEffect(() => {
    fetchRealIntents();

    const interval = setInterval(() => {
      fetchRealIntents(true); // background refresh — no loading spinner
    }, 15000);

    return () => clearInterval(interval);
  }, [fetchRealIntents]);

  // Auto-select first VIP as activeIntent
  useEffect(() => {
    if (vipIntents.length > 0 && !activeIntent) {
      setActiveIntent(vipIntents[0]);
    }
  }, [vipIntents, activeIntent]);

  // Optimistic UI insert
  const handleNewIntent = useCallback((newIntent: MockIntent) => {
    setIntents((prev) => [newIntent, ...prev]);
  }, []);

  // Full refresh after POST
  const handleIntentCreated = useCallback(async () => {
    await fetchRealIntents();
  }, [fetchRealIntents]);

  return {
    // Data
    intents,
    vipIntents,
    regularIntents: visibleRegular,
    allFiltered,
    // State
    filter,
    setFilter,
    isLoading,
    isLoadingMore,
    apiError,
    hasMore,
    // Active intent (for Observer panel)
    activeIntent,
    setActiveIntent,
    // Actions
    handleNewIntent,
    handleIntentCreated,
    // Refs
    loadMoreRef,
  };
}
