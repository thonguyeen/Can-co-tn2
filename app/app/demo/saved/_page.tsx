'use client';

import { Bookmark } from 'lucide-react';
import { IntentCard } from '@/components/intent/IntentCard';
import { BottomNav } from '@/components/intent/BottomNav';
import { useSaved } from '@/lib/saved-context';
import { DEMO_INTENTS } from '@/lib/mock/intents';

export default function SavedPage() {
  const { savedIds, toggleSave } = useSaved();

  const savedIntents = DEMO_INTENTS.filter((i) => savedIds.has(i.id));

  return (
    <div className="pb-20 md:pb-4">
      <div className="flex items-center gap-2 mb-4">
        <Bookmark className="w-5 h-5 text-yellow-500" />
        <h1 className="text-lg font-bold text-[var(--wm-text)]">
          Đã lưu ({savedIntents.length})
        </h1>
      </div>

      {savedIntents.length === 0 ? (
        <div className="wm-panel p-8 text-center">
          <Bookmark className="w-8 h-8 mx-auto mb-2 text-[var(--wm-text-faint)]" />
          <p className="text-sm text-[var(--wm-text-muted)]">Chưa lưu tin nào</p>
          <p className="text-xs text-[var(--wm-text-faint)] mt-1">Lưu tin để theo dõi cập nhật!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {savedIntents.map((intent) => (
            <div key={intent.id} className="relative">
              <IntentCard intent={intent} basePath="/demo" />
              <button
                onClick={() => toggleSave(intent.id)}
                className="absolute top-2 right-2 px-2 py-1 text-[10px] font-semibold text-red-400 bg-[var(--wm-surface)] border border-[var(--wm-border)] hover:bg-red-500/10 transition-colors z-10"
              >
                Bỏ lưu
              </button>
            </div>
          ))}
        </div>
      )}

      <BottomNav />
    </div>
  );
}
