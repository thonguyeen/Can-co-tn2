'use client';

import { useState } from 'react';
import { Search, Loader2, SlidersHorizontal } from 'lucide-react';
import { SocialPostCard } from '@/components/intent/SocialPostCard';
import { ComposeIntent } from '@/components/intent/ComposeIntent';
import FeedObserverPanel from '@/components/feed/FeedObserverPanel';
import { CityChipBar } from '@/components/feed/CityChipBar';
import { FeedFilterDrawer } from '@/components/feed/FeedFilterDrawer';
import { getDistrictsForCity } from '@/components/feed/FeedFilterSidebar';
import { useFeedData } from '@/hooks/useFeedData';

export default function FeedTab() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const {
    vipIntents,
    regularIntents,
    intents,
    city,
    setCity,
    filter,
    setFilter,
    district,
    setDistrict,
    priceMin,
    setPriceMin,
    priceMax,
    setPriceMax,
    canCount,
    coCount,
    activeFilterCount,
    isLoading,
    isLoadingMore,
    apiError,
    hasMore,
    activeIntent,
    setActiveIntent,
    handleNewIntent,
    handleIntentCreated,
    loadMoreRef,
  } = useFeedData();

  const districts = getDistrictsForCity(city);

  // Merge VIP (first) + regular intents for single-column social feed
  const allFeedIntents = [
    ...vipIntents.map((i) => ({ ...i, _isVip: true as const })),
    ...regularIntents.map((i) => ({ ...i, _isVip: false as const })),
  ];

  return (
    <div className="flex h-full overflow-hidden gap-0">

      {/* ═══════════ MAIN FEED CONTENT ═══════════ */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-6 pb-24 md:pb-8">
        <div className="max-w-[680px] mx-auto">

          {/* ── SEARCH BAR + FILTER BUTTON ── */}
          <div className="mb-4 relative z-30">
            <div className="relative group flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 transition-colors group-focus-within:text-indigo-600" />
                <input
                  type="text"
                  placeholder="Tìm theo khu vực, dự án, khoảng giá..."
                  className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-semibold placeholder:font-medium placeholder-slate-400 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all"
                />
              </div>
              <button
                onClick={() => setDrawerOpen(true)}
                className="relative shrink-0 flex items-center gap-2 px-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline text-xs font-bold">Bộ lọc</span>
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* ── CITY CHIP BAR ── */}
          <div className="mb-6 relative z-20">
            <CityChipBar city={city} setCity={setCity} />
          </div>

          {/* ── COMPOSE INTENT ── */}
          <div className="mb-6 relative z-20">
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
              <span className="text-xs font-bold text-indigo-600 tracking-widest uppercase">Thị trường thời gian thực</span>
            </div>
            <div className="wm-light bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
              <ComposeIntent mode="real" onSubmit={handleNewIntent} onIntentCreated={handleIntentCreated} />
            </div>
          </div>

          {/* ── SOCIAL FEED (single-column) ── */}
          {isLoading && allFeedIntents.length === 0 ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-white rounded-[20px] border border-slate-100 overflow-hidden">
                  <div className="aspect-[16/10] bg-slate-200" />
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-slate-200" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-4 bg-slate-200 rounded w-2/5" />
                        <div className="h-3 bg-slate-100 rounded w-1/4" />
                      </div>
                    </div>
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-full" />
                    <div className="h-3 bg-slate-100 rounded w-5/6" />
                  </div>
                </div>
              ))}
            </div>
          ) : apiError ? (
            <div className="text-center py-10 bg-red-50 text-red-600 rounded-3xl text-sm font-medium">{apiError}</div>
          ) : allFeedIntents.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-sm bg-white rounded-[20px] border border-dashed border-slate-200">
              Không tìm thấy tin đăng nào phù hợp
            </div>
          ) : (
            <div className="space-y-4 wm-light">
              {allFeedIntents.map((intent) => (
                <SocialPostCard
                  key={intent.id}
                  intent={intent}
                  isVip={intent._isVip}
                  compact
                  basePath=""
                />
              ))}

              {/* Infinite Scroll Trigger */}
              {hasMore && !isLoading && (
                <div ref={loadMoreRef} className="py-8 flex justify-center">
                  {isLoadingMore ? (
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" />
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.4s]" />
                    </div>
                  ) : (
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Cuộn để xem thêm</span>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* ═══════════ RIGHT: AI OBSERVER (Desktop xl+) ═══════════ */}
      <FeedObserverPanel activeIntent={activeIntent} />

      {/* ═══════════ FILTER DRAWER (Overlay) ═══════════ */}
      <FeedFilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        filter={filter}
        setFilter={setFilter}
        district={district}
        setDistrict={setDistrict}
        priceMin={priceMin}
        setPriceMin={setPriceMin}
        priceMax={priceMax}
        setPriceMax={setPriceMax}
        districts={districts}
        activeFilterCount={activeFilterCount}
      />
    </div>
  );
}
