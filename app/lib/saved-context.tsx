'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

interface SavedContextType {
  savedIds: Set<string>;
  toggleSave: (id: string) => void;
  isSaved: (id: string) => boolean;
}

const SavedContext = createContext<SavedContextType>({
  savedIds: new Set(),
  toggleSave: () => {},
  isSaved: () => false,
});

const STORAGE_KEY = 'canco-saved-intents';

// Pre-saved demo intents
const DEFAULT_SAVED = ['i-002', 'i-004', 'i-006'];

export function SavedProvider({ children }: { children: ReactNode }) {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
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
  }, []);

  const toggleSave = useCallback((id: string) => {
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
  }, []);

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
