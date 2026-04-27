'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { useSession } from 'next-auth/react';

interface SavedContextType {
  savedIds: Set<string>;
  toggleSave: (id: string) => void;
  isSaved: (id: string) => boolean;
}

const SavedContext = createContext<SavedContextType>({
  savedIds: new Set(),
  toggleSave: () => { },
  isSaved: () => false,
});

const STORAGE_KEY = 'canco-saved-intents';

export function SavedProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  /**
   * Load saved IDs whenever auth state is resolved.
   * - "authenticated"  → fetch from DB (source of truth)
   * - "unauthenticated" → read from localStorage (guest mode)
   * Dependency on `session?.user?.id` ensures this re-runs after login/logout.
   */
  useEffect(() => {
    // Still loading auth state — wait
    if (status === 'loading') return;

    const userId = (session?.user as any)?.id as string | undefined;

    const loadSaved = async () => {
      if (userId) {
        // ── Logged-in: fetch from DB ──────────────────────────────────────
        try {
          const res = await fetch('/api/intents/saved');
          if (res.ok) {
            const data = await res.json();
            const dbIds: string[] = data.ids ?? [];
            setSavedIds(new Set(dbIds));
            // Sync localStorage so offline/optimistic reads stay consistent
            localStorage.setItem(STORAGE_KEY, JSON.stringify(dbIds));
            return;
          }
        } catch {
          // Fall through to localStorage fallback
        }
      }

      // ── Guest or DB fetch failed: read localStorage ───────────────────
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed: string[] = JSON.parse(stored);
          // Only keep real UUIDs in guest mode (not mock 'i-xxx')
          const filtered = userId ? parsed : parsed.filter((id) => id.startsWith('i-'));
          setSavedIds(new Set(filtered));
        } else {
          setSavedIds(new Set());
        }
      } catch {
        setSavedIds(new Set());
      }
    };

    loadSaved();
  }, [status, (session?.user as any)?.id]);      // re-run when auth state changes

  const toggleSave = useCallback(
    (id: string) => {
      const userId = (session?.user as any)?.id as string | undefined;

      // ── Optimistic update ────────────────────────────────────────────────
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
        return next;
      });

      // ── Sync with DB (only for real UUIDs when logged in) ───────────────
      if (userId && !id.startsWith('i-')) {
        fetch(`/api/intents/${id}/save`, { method: 'POST' })
          .then((res) => {
            if (!res.ok) throw new Error('save failed');
          })
          .catch(() => {
            // Revert optimistic update on error
            setSavedIds((prev) => {
              const reverted = new Set(prev);
              if (reverted.has(id)) {
                reverted.delete(id);
              } else {
                reverted.add(id);
              }
              localStorage.setItem(STORAGE_KEY, JSON.stringify([...reverted]));
              return reverted;
            });
          });
      }
    },
    [session]
  );

  const isSaved = useCallback((id: string) => savedIds.has(id), [savedIds]);

  return (
    <SavedContext.Provider value={{ savedIds, toggleSave, isSaved }}>
      {children}
    </SavedContext.Provider>
  );
}

export function useSaved() {
  return useContext(SavedContext);
}
