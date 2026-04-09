'use client';

import { Search, Loader2 } from 'lucide-react';
import { IntentCard } from '@/components/intent/IntentCard';
import { ComposeIntent } from '@/components/intent/ComposeIntent';
import FeedObserverPanel from '@/components/feed/FeedObserverPanel';
import { useFeedData } from '@/hooks/useFeedData';

export default function FeedTab() {
  const {
    vipIntents,
    regularIntents,
    filter,
    setFilter,
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

  const trustScore = activeIntent ? 85 + (activeIntent.id.length % 15) : 95;

  return (
    <div className="flex h-full overflow-hidden">
      {/* ═══════════ MAIN FEED CONTENT ═══════════ */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-8 py-6 pb-24 md:pb-8">
        <div className="max-w-3xl mx-auto">

          {/* ── SEARCH BAR ── */}
          <div className="mb-6 relative z-30">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 transition-colors group-focus-within:text-indigo-600" />
              <input
                type="text"
                placeholder="Tìm theo khu vực, dự án, khoảng giá..."
                className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-semibold placeholder:font-medium placeholder-slate-400 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <kbd className="hidden sm:inline-block px-2 py-1 text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-200 rounded">Ctrl+K</kbd>
              </div>
            </div>
          </div>

          {/* ── COMPOSE INTENT ── */}
          <div className="mb-8 relative z-20">
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
              <span className="text-xs font-bold text-indigo-600 tracking-widest uppercase">Thị trường thời gian thực</span>
            </div>
            <div className="wm-light bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
              <ComposeIntent mode="real" onSubmit={handleNewIntent} onIntentCreated={handleIntentCreated} />
            </div>
          </div>

          {/* ══════════════ TẦNG 1: VIP CAROUSEL ══════════════ */}
          <div className="mb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-5 flex items-center gap-2">
              Nhà Đất Khuyên Dùng
              <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full border border-amber-200 uppercase font-bold">Premium</span>
            </h2>

            {isLoading && vipIntents.length === 0 ? (
              <div className="flex justify-center items-center py-16 bg-slate-50 rounded-3xl border border-slate-100 border-dashed">
                <Loader2 className="w-7 h-7 animate-spin text-indigo-400" />
                <span className="ml-3 text-slate-400 font-medium text-sm">Đang chắt lọc tin...</span>
              </div>
            ) : apiError ? (
              <div className="text-center py-10 bg-red-50 text-red-600 rounded-3xl text-sm font-medium">{apiError}</div>
            ) : vipIntents.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm bg-slate-50 rounded-3xl">Chưa có tin nổi bật nào lúc này.</div>
            ) : (
              <div className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-6 pt-1 px-1 -mx-1 custom-scrollbar-hide hide-scrollbar w-full relative">
                {vipIntents.map((vipIntent) => (
                  <div
                    key={vipIntent.id}
                    className={`snap-center shrink-0 w-[260px] h-[360px] md:w-[280px] md:h-[400px] rounded-[28px] overflow-hidden cursor-pointer transition-all duration-400 bg-white flex flex-col relative group ${
                      activeIntent?.id === vipIntent.id
                        ? 'ring-2 ring-indigo-500 ring-offset-4 shadow-[0_20px_40px_-15px_rgba(79,70,229,0.3)] scale-[1.02]'
                        : 'shadow-[0_10px_30px_-15px_rgba(0,0,0,0.1)] hover:shadow-[0_15px_35px_-15px_rgba(0,0,0,0.15)] hover:-translate-y-1'
                    }`}
                    onClick={() => setActiveIntent(vipIntent)}
                  >
                    {/* Photo */}
                    <div className="h-3/5 w-full relative overflow-hidden bg-slate-100">
                      <img
                        src={vipIntent.images?.[0]?.url || (vipIntent.type === 'CO' ? 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80' : 'https://images.unsplash.com/photo-1628611225249-6c3c7c689552?w=600&q=80')}
                        alt=""
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                        <span className="text-[10px] font-bold text-indigo-600 uppercase">
                          Trust {activeIntent?.id === vipIntent.id ? trustScore : 85 + (vipIntent.id.length % 15)}%
                        </span>
                      </div>
                    </div>
                    {/* Content */}
                    <div className="flex-1 p-4 flex flex-col bg-white">
                      <span className={`text-[10px] uppercase font-bold tracking-wider mb-1.5 ${vipIntent.type === 'CAN' ? 'text-red-500' : 'text-indigo-600'}`}>
                        {vipIntent.type === 'CAN' ? 'TÌM MUA' : 'ĐANG BÁN'}
                      </span>
                      <h3 className="text-sm font-bold text-slate-800 mb-1 line-clamp-2 leading-tight">
                        {vipIntent.title || vipIntent.raw_text?.slice(0, 50)}
                      </h3>
                      <div className="mt-auto flex items-end justify-between">
                        <div className="text-indigo-600 text-base font-black tracking-tight">
                          {vipIntent.price?.toLocaleString('vi-VN') || vipIntent.price_min?.toLocaleString('vi-VN') || 'Thỏa thuận'} đ
                        </div>
                        <div className="text-slate-400 text-[11px] font-semibold bg-slate-100 px-2 py-0.5 rounded-lg">
                          {vipIntent.match_count || 0} khớp
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ══════════════ TẦNG 2: REGULAR LIST ══════════════ */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-900">Danh Sách Tin Đăng</h2>
              <div className="flex gap-1.5 p-1 bg-white rounded-full shadow-sm border border-slate-100">
                <button onClick={() => setFilter('all')} className={`text-[11px] font-semibold px-4 py-1.5 rounded-full transition-colors ${filter === 'all' ? 'bg-indigo-50 text-indigo-600' : 'bg-transparent text-slate-500 hover:text-slate-800'}`}>Tất cả</button>
                <button onClick={() => setFilter('CAN')} className={`text-[11px] font-semibold px-4 py-1.5 rounded-full transition-colors ${filter === 'CAN' ? 'bg-red-50 text-red-600' : 'bg-transparent text-slate-500 hover:text-slate-800'}`}>Cần Tìm</button>
                <button onClick={() => setFilter('CO')} className={`text-[11px] font-semibold px-4 py-1.5 rounded-full transition-colors ${filter === 'CO' ? 'bg-indigo-50 text-indigo-600' : 'bg-transparent text-slate-500 hover:text-slate-800'}`}>Đang Bán</button>
              </div>
            </div>

            <div className="space-y-4 wm-light">
              {isLoading && regularIntents.length === 0 ? (
                [1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex p-4 bg-white rounded-3xl border border-slate-100 shadow-sm gap-4">
                    <div className="w-16 h-16 rounded-xl bg-slate-200 shrink-0" />
                    <div className="flex-1 py-1">
                      <div className="h-4 bg-slate-200 rounded w-3/4 mb-4" />
                      <div className="h-3 bg-slate-100 rounded w-1/2 mb-3" />
                      <div className="flex gap-2">
                        <div className="h-6 w-16 bg-slate-100 rounded-full" />
                        <div className="h-6 w-20 bg-slate-100 rounded-full" />
                      </div>
                    </div>
                  </div>
                ))
              ) : apiError ? (
                <div className="text-center py-10 text-slate-400 text-sm">{apiError}</div>
              ) : regularIntents.length === 0 ? (
                <div className="text-center py-16 text-slate-400 text-sm bg-white rounded-3xl border border-dashed border-slate-200">
                  Không tìm thấy tin đăng nào phù hợp
                </div>
              ) : (
                regularIntents.map((intent) => (
                  <div
                    key={intent.id}
                    className={`transition-all duration-300 rounded-3xl overflow-hidden ${
                      activeIntent?.id === intent.id
                        ? 'ring-2 ring-indigo-500 shadow-[0_10px_30px_-15px_rgba(79,70,229,0.2)] bg-white -translate-y-0.5'
                        : 'bg-white shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-0.5'
                    }`}
                    onMouseEnter={() => setActiveIntent(intent)}
                    onClick={() => setActiveIntent(intent)}
                  >
                    <div className="p-1">
                      <IntentCard intent={intent} basePath="" />
                    </div>
                  </div>
                ))
              )}

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
          </div>

        </div>
      </div>

      {/* ═══════════ RIGHT: AI OBSERVER (Desktop xl+) ═══════════ */}
      <FeedObserverPanel activeIntent={activeIntent} />
    </div>
  );
}
