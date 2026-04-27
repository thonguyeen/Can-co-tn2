'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
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

// Pre-saved demo intents (guest mode fallback)
const DEFAULT_SAVED = ['i-002', 'i-004', 'i-006'];

export function SavedProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const initialized = useRef(false);

  // Khởi tạo: load từ DB nếu đã login, fallback localStorage nếu guest
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const loadSaved = async () => {
      if (session?.user) {
        // Đã login → fetch từ DB
        try {
          const res = await fetch('/api/intents/saved');
          if (res.ok) {
            const data = await res.json();
            const dbIds: string[] = data.ids || [];
            // Merge với localStorage để giữ trạng thái optimistic từ tab khác
            const stored = localStorage.getItem(STORAGE_KEY);
            const localIds: string[] = stored ? JSON.parse(stored) : [];
            const merged = new Set([...dbIds, ...localIds.filter((id) => id.startsWith('i-'))]);
            setSavedIds(merged);
            localStorage.setItem(STORAGE_KEY, JSON.stringify([...merged]));
            return;
          }
        } catch {
          // Fall through to localStorage
        }
      }

      // Guest mode: dùng localStorage
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setSavedIds(new Set(JSON.parse(stored)));
        } else {
          setSavedIds(new Set(DEFAULT_SAVED));
          localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SAVED));
        }
      } catch {
        setSavedIds(new Set(DEFAULT_SAVED));
      }
    };

    loadSaved();
  }, [session]);

  const toggleSave = useCallback(
    (id: string) => {
      // Optimistic update ngay lập tức
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

      // Sync với DB nếu là UUID thật (không phải mock 'i-xxx')
      if (session?.user && !id.startsWith('i-')) {
        fetch(`/api/intents/${id}/save`, { method: 'POST' }).catch(() => {
          // Revert nếu API lỗi
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
