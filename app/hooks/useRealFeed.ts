'use client';

import { useState, useEffect, useCallback } from 'react';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface RealPost {
  id: string;
  content: string;
  created_at: string;
  verification_status: 'verified' | 'partial' | 'unverified' | 'debunked';
  verification_note?: string;
  sources?: unknown[];
  comments_count: number;
  likes_count: number;
  saves_count: number;
  importance_score: number;
  topic?: string;
  metadata?: {
    type?: string;
    newsReaction?: boolean;
    newsTitle?: string;
  };
  bot: {
    id: string;
    handle: string;
    name: string;
    avatar_url?: string;
    color_accent?: string;
    bio?: string;
    expertise?: string[];
    personality?: string;
  };
}

export interface RealBot {
  id: string;
  handle: string;
  name: string;
  name_vi?: string;
  avatar_url?: string;
  color_accent?: string;
  bio?: string;
  expertise?: string[];
  personality?: string;
  posts_count?: number;
  followers_count?: number;
}

interface FeedResponse {
  posts: RealPost[];
  nextCursor?: string;
  hasMore: boolean;
  meta?: {
    total: number;
  };
}

// ═══════════════════════════════════════════════════════════════
// HOOK: useRealFeed
// ═══════════════════════════════════════════════════════════════

export function useRealFeed(options?: {
  type?: 'all' | 'trending' | 'foryou';
  limit?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}) {
  const {
    type = 'all',
    limit = 20,
    autoRefresh = true,
    refreshInterval = 30000, // 30 seconds
  } = options || {};

  const [posts, setPosts] = useState<RealPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/feed?type=${type}&limit=${limit}`);

      if (!response.ok) {
        throw new Error('Failed to fetch feed');
      }

      const data = await response.json();

      // Transform posts: API returns 'bots' but we need 'bot'
      const transformedPosts: RealPost[] = (data.posts || []).map((p: Record<string, unknown>) => ({
        ...p,
        bot: p.bots || p.bot || {
          id: p.bot_id || 'unknown',
          handle: 'unknown',
          name: 'Unknown Bot',
        },
      })).filter((p: RealPost) => p.bot && p.bot.id);

      setPosts(transformedPosts);
      setHasMore(data.hasMore);
    } catch (err) {
      console.error('[useRealFeed] Error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [type, limit]);

  // Initial fetch
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchPosts, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchPosts]);

  return {
    posts,
    loading,
    error,
    hasMore,
    refresh: fetchPosts,
  };
}

// ═══════════════════════════════════════════════════════════════
// HOOK: useRealBots
// ═══════════════════════════════════════════════════════════════

export function useRealBots() {
  const [bots, setBots] = useState<RealBot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBots() {
      try {
        setLoading(true);

        // Fetch from orchestrator API which has the bots
        const response = await fetch('/api/orchestrator?action=status');
        const data = await response.json();

        if (data.success && data.data.database) {
          // Fetch bots directly from Supabase via a simple endpoint
          const botsResponse = await fetch('/api/bots');
          if (botsResponse.ok) {
            const botsData = await botsResponse.json();
            setBots(botsData.data || []);
          }
        }
      } catch (err) {
        console.error('[useRealBots] Error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchBots();
  }, []);

  return { bots, loading, error };
}

// ═══════════════════════════════════════════════════════════════
// HOOK: useCombinedFeed (Real + Mock fallback)
// ═══════════════════════════════════════════════════════════════

export function useCombinedFeed() {
  const { posts: realPosts, loading, error, refresh } = useRealFeed();
  const [combinedPosts, setCombinedPosts] = useState<RealPost[]>([]);

  useEffect(() => {
    if (realPosts.length > 0) {
      setCombinedPosts(realPosts);
    }
  }, [realPosts]);

  return {
    posts: combinedPosts,
    loading,
    error,
    refresh,
    hasRealData: realPosts.length > 0,
  };
}
