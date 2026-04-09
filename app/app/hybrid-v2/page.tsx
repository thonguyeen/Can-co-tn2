'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { IntentCard } from '@/components/intent/IntentCard';
import { ComposeIntent } from '@/components/intent/ComposeIntent';
import { BottomNav } from '@/components/intent/BottomNav';
import { type MockIntent } from '@/lib/mock/intents';
import { DEMO_INSIGHTS } from '@/lib/mock/insights';
import { 
  Home, Compass, MessageCircle, User, Settings, 
  Bot, Activity, TrendingUp, Sparkles, Filter, Search,
  ChevronLeft, ChevronRight, Loader2
} from 'lucide-react';

type FilterType = 'all' | 'CAN' | 'CO';

const PAGE_SIZE = 8;

export default function HybridV2Page() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [intents, setIntents] = useState<MockIntent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  
  // Trạng thái AI Lắng nghe (Active Intent)
  const [activeIntent, setActiveIntent] = useState<MockIntent | null>(null);

  // States for Sidebars
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(true);
  const [isRightCollapsed, setIsRightCollapsed] = useState(true);

  // Auto-expand feed width based on collapsed sidebars
  const centerMaxWidth = (isLeftCollapsed && isRightCollapsed) 
    ? "max-w-5xl" 
    : (isLeftCollapsed || isRightCollapsed) ? "max-w-4xl" : "max-w-2xl";

  const allFiltered = filter === 'all' ? intents : intents.filter((i) => i.type === filter);
  const vipIntents = [...allFiltered]
    .filter((i) => i.match_count > 0 || i.trust_score >= 4)
    .sort((a, b) => b.match_count - a.match_count)
    .slice(0, 5); 
    
  const regularIntents = allFiltered.filter(i => !vipIntents.includes(i)); 
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const visibleRegular = regularIntents.slice(0, visibleCount);
  const hasMore = visibleCount < regularIntents.length;

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

  useEffect(() => {
    fetchRealIntents();

    const interval = setInterval(() => {
      fetchRealIntents(true);
    }, 15000);

    return () => clearInterval(interval);
  }, [fetchRealIntents]);

  useEffect(() => {
    if (vipIntents.length > 0 && !activeIntent) {
      setActiveIntent(vipIntents[0]);
    }
  }, [vipIntents, activeIntent]);

  const handleNewIntent = useCallback((newIntent: MockIntent) => {
    // Để có UX tốt nhất, thay vì chờ refresh API, gá luôn mảng cũ
    setIntents((prev) => [newIntent, ...prev]);
  }, []);

  const handleIntentCreated = useCallback(async () => {
    // Làm mới luồng feed sau khi POST thành công từ UI
    await fetchRealIntents();
  }, [fetchRealIntents]);

  const currentInsightIdx = activeIntent ? (activeIntent.id.length % DEMO_INSIGHTS.length) : 0;
  const currentInsight = DEMO_INSIGHTS[currentInsightIdx];
  const trustScore = activeIntent ? 85 + (activeIntent.id.length % 15) : 95;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex overflow-hidden font-sans selection:bg-indigo-500/30">
      
      {/* 1. LEFT SIDEBAR (Clean & Bright) */}
      <div className={`border-r border-slate-200 bg-white shadow-[4px_0_24px_rgba(0,0,0,0.02)] flex flex-col pt-8 pb-4 px-4 z-10 shrink-0 hidden md:flex h-screen sticky top-0 transition-all duration-300 relative ${isLeftCollapsed ? 'w-20 items-center' : 'w-64'}`}>
        
        {/* Toggle Button */}
        <button 
           onClick={() => setIsLeftCollapsed(!isLeftCollapsed)}
           className="absolute -right-3 top-10 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-indigo-600 shadow-sm z-20 transition-transform"
        >
           {isLeftCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>

        <div className={`mb-10 flex items-center gap-3 ${isLeftCollapsed ? 'justify-center' : 'lg:px-4'}`}>
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-[0_8px_16px_rgba(79,70,229,0.25)] shrink-0">
            C&C
          </div>
          {!isLeftCollapsed && (
            <span className="text-xl font-bold tracking-tight hidden lg:block text-slate-900 whitespace-nowrap overflow-hidden">
              CẦN & CÓ <span className="text-indigo-600 text-sm align-top font-black">BĐS</span>
            </span>
          )}
        </div>

        <nav className={`flex flex-col gap-2 w-full ${!isLeftCollapsed ? 'lg:px-2' : ''}`}>
          <NavItem icon={<Compass className="w-5 h-5" />} label="Khám Phá" active isCollapsed={isLeftCollapsed} />
          <NavItem icon={<Filter className="w-5 h-5" />} label="Đã Lưu" isCollapsed={isLeftCollapsed} />
        </nav>

        <div className="mt-8 border-t border-slate-100 pt-8 w-full" />
        <nav className={`flex flex-col gap-2 w-full ${!isLeftCollapsed ? 'lg:px-2' : ''}`}>
          <NavItem icon={<MessageCircle className="w-5 h-5" />} label="Tin Nhắn AI" badge={2} isCollapsed={isLeftCollapsed} />
          <NavItem icon={<User className="w-5 h-5" />} label="Hồ Sơ" isCollapsed={isLeftCollapsed} />
        </nav>
      </div>

      {/* 2. CENTER FEED (LIGHT MODE HYBRID) */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto custom-scrollbar relative px-4 md:px-10 py-6 pb-24 md:pb-8">
        
        {/* HEADER TÌM KIẾM - TOP BAR */}
        <div className={`w-full mx-auto mb-8 relative z-30 transition-all duration-500 ${centerMaxWidth}`}>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 transition-colors group-focus-within:text-indigo-600" />
            <input 
              type="text" 
              placeholder="Tìm theo khu vực, dự án, khoảng giá..." 
              className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-semibold placeholder:font-medium placeholder-slate-400 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all"
            />
            {/* Short-cut hint */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
               <kbd className="hidden sm:inline-block px-2 py-1 text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-200 rounded">Ctrl+K</kbd>
            </div>
          </div>
        </div>

        {/* COMPONENT ĐĂNG BÀI - WHITE THEME */}
        <div className={`w-full mx-auto mb-10 relative z-20 mt-8 md:mt-0 transition-all duration-500 ${centerMaxWidth}`}>
          <div className="flex items-center gap-2 mb-3 px-1">
             <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
             <span className="text-xs font-bold text-indigo-600 tracking-widest uppercase">Thị trường thời gian thực</span>
          </div>
          {/* Reuse ComposeIntent, but wrapped in a light container to force some visual boundaries if needed */}
          <div className="wm-light bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
             <ComposeIntent mode="real" onSubmit={handleNewIntent} onIntentCreated={handleIntentCreated} />
          </div>
        </div>

        <div className={`w-full mx-auto transition-all duration-500 ${centerMaxWidth}`}>
          {/* ===================== TẦNG 1: VIP CAROUSEL (CLEAN) ===================== */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
               Nhà Đất Khuyên Dùng
               <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full border border-amber-200 uppercase font-bold">Premium</span>
            </h2>
            
            {isLoading && vipIntents.length === 0 ? (
              <div className="flex justify-center items-center py-20 bg-slate-50 rounded-3xl border border-slate-100 border-dashed">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                <span className="ml-3 text-slate-400 font-medium">Đang chắt lọc tin...</span>
              </div>
            ) : apiError ? (
              <div className="text-center py-10 bg-red-50 text-red-600 rounded-3xl text-sm font-medium">
                {apiError}
              </div>
            ) : vipIntents.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm bg-slate-50 rounded-3xl">Chưa có tin nổi bật nào lúc này.</div>
            ) : (
              <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-8 pt-2 px-2 -mx-2 custom-scrollbar-hide hide-scrollbar w-full relative">
                {vipIntents.map((vipIntent) => (
                  <div 
                    key={vipIntent.id} 
                    className={`snap-center shrink-0 w-[280px] h-[380px] md:w-[300px] md:h-[420px] rounded-[32px] overflow-hidden cursor-pointer transition-all duration-400 bg-white flex flex-col relative group ${activeIntent?.id === vipIntent.id ? 'ring-2 ring-indigo-500 ring-offset-4 shadow-[0_20px_40px_-15px_rgba(79,70,229,0.3)] scale-[1.02]' : 'shadow-[0_10px_30px_-15px_rgba(0,0,0,0.1)] hover:shadow-[0_15px_35px_-15px_rgba(0,0,0,0.15)] hover:-translate-y-1'}`}
                    onClick={() => setActiveIntent(vipIntent)}
                  >
                    {/* Photo Half */}
                    <div className="h-3/5 w-full relative overflow-hidden bg-slate-100">
                      <img 
                        src={vipIntent.images?.[0]?.url || (vipIntent.type === 'CO' ? 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80' : 'https://images.unsplash.com/photo-1628611225249-6c3c7c689552?w=600&q=80')} 
                        alt=""
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                         <span className="text-[10px] font-bold text-indigo-600 uppercase">Trust {activeIntent?.id === vipIntent.id ? trustScore : 85 + (vipIntent.id.length % 15)}%</span>
                      </div>
                    </div>
  
                    {/* Content Half */}
                    <div className="flex-1 p-5 flex flex-col bg-white">
                      <span className={`text-[10px] uppercase font-bold tracking-wider mb-2 ${vipIntent.type === 'CAN' ? 'text-red-500' : 'text-indigo-600'}`}>
                        {vipIntent.type === 'CAN' ? 'TÌM MUA' : 'ĐANG BÁN'}
                      </span>
                      <h3 className="text-base font-bold text-slate-800 mb-1 line-clamp-2 leading-tight">
                        {vipIntent.title || vipIntent.raw_text?.slice(0, 50)}
                      </h3>
                      <div className="mt-auto flex items-end justify-between">
                         <div className="text-indigo-600 text-lg font-black tracking-tight">
                            {vipIntent.price?.toLocaleString('vi-VN') || vipIntent.price_min?.toLocaleString('vi-VN') || 'Thỏa thuận'} đ
                         </div>
                         <div className="text-slate-400 text-xs font-semibold bg-slate-100 px-2 py-1 rounded-lg">
                            {vipIntent.match_count || 0} khớp
                         </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
  
          {/* ===================== TẦNG 2: LIST TRUYỀN THỐNG (MÀU SÁNG) ===================== */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Danh Sách Tin Đăng</h2>
              
              <div className="flex gap-1.5 p-1 bg-white rounded-full shadow-sm border border-slate-100">
                <button onClick={() => setFilter('all')} className={`text-[11px] font-semibold px-4 py-1.5 rounded-full transition-colors ${filter === 'all' ? 'bg-indigo-50 text-indigo-600' : 'bg-transparent text-slate-500 hover:text-slate-800'}`}>Tất cả</button>
                <button onClick={() => setFilter('CAN')} className={`text-[11px] font-semibold px-4 py-1.5 rounded-full transition-colors ${filter === 'CAN' ? 'bg-red-50 text-red-600' : 'bg-transparent text-slate-500 hover:text-slate-800'}`}>Cần Tìm</button>
                <button onClick={() => setFilter('CO')} className={`text-[11px] font-semibold px-4 py-1.5 rounded-full transition-colors ${filter === 'CO' ? 'bg-indigo-50 text-indigo-600' : 'bg-transparent text-slate-500 hover:text-slate-800'}`}>Đang Bán</button>
              </div>
            </div>

            <div className="space-y-4 wm-light">
              {isLoading && visibleRegular.length === 0 ? (
                // Lặp 3 thẻ Skeletons cơ bản
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
                <div className="text-center py-10 text-slate-400 text-sm">
                  {apiError}
                </div>
              ) : visibleRegular.length === 0 ? (
                <div className="text-center py-16 text-slate-400 text-sm bg-white rounded-3xl border border-dashed border-slate-200">
                  Không tìm thấy tin đăng nào phù hợp
                </div>
              ) : (
                visibleRegular.map((intent) => (
                  <div 
                    key={intent.id} 
                    className={`transition-all duration-300 rounded-3xl overflow-hidden ${activeIntent?.id === intent.id ? 'ring-2 ring-indigo-500 shadow-[0_10px_30px_-15px_rgba(79,70,229,0.2)] bg-white -translate-y-0.5' : 'bg-white shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-0.5'}`}
                    onMouseEnter={() => setActiveIntent(intent)} 
                    onClick={() => setActiveIntent(intent)}
                  >
                    <div className="p-1">
                       <IntentCard intent={intent} basePath="" />
                    </div>
                  </div>
                ))
              )}

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

      {/* 3. RIGHT SIDEBAR (AI OBSERVER DASHBOARD - CLEAN & PRO) */}
      <div className={`border-l border-slate-200 bg-white shadow-[-10px_0_40px_rgba(0,0,0,0.03)] hidden xl:flex flex-col z-20 sticky top-0 h-screen transition-all duration-300 relative ${isRightCollapsed ? 'w-24 pt-8 px-4 items-center bg-slate-50' : 'w-[420px] p-8'}`}>
        
        {/* Toggle Button */}
        <button 
           onClick={() => setIsRightCollapsed(!isRightCollapsed)}
           className="absolute -left-3 top-10 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-indigo-600 shadow-sm z-20 transition-transform"
        >
           {isRightCollapsed ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>

        {isRightCollapsed ? (
          <div 
             className="w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center shrink-0 cursor-pointer hover:border-indigo-500 transition-colors relative"
             onClick={() => setIsRightCollapsed(false)}
             title="Mở AI Analytics"
          >
             <Bot className="w-7 h-7 text-indigo-600" />
             <span className="absolute flex h-3 w-3 top-0 right-0">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
             </span>
          </div>
        ) : (
          <div className="w-full h-full overflow-y-auto custom-scrollbar pr-2 pb-6">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                 <Bot className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Brain AI Analytics</h3>
                <p className="text-[11px] text-indigo-600 font-bold uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                  <span className="relative flex h-2 w-2">
                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                     <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                  </span>
                  Trực Tiếp
                </p>
              </div>
            </div>

        {activeIntent ? (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500 fill-mode-both">
            
            {/* Thẻ Preview Bản nháp */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-8 flex gap-4 items-center">
               <div className="w-14 h-14 rounded-xl bg-slate-200 shadow-sm flex items-center justify-center font-black text-slate-300 text-sm shrink-0 border border-slate-100 overflow-hidden relative">
                  <img 
                    src={activeIntent.type === 'CO' ? 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80' : 'https://images.unsplash.com/photo-1628611225249-6c3c7c689552?w=600&q=80'} 
                    alt="thumbnail"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute font-bold uppercase tracking-wider top-0 right-0 bg-indigo-600 text-white text-[8px] px-1 py-0.5 rounded-bl-md z-10">{activeIntent.type}</div>
               </div>
               <div className="flex-1">
                  <div className="text-sm font-bold text-slate-800 line-clamp-2">{activeIntent.title}</div>
                  <div className="text-xs font-semibold text-slate-500 mt-1">{activeIntent.price?.toLocaleString() || 'Thỏa thuận'} VNĐ</div>
               </div>
            </div>

            {/* AI Trust Score Tool - Clean Radial/Bar Chart feel */}
            <div className="mb-6 bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
               <h4 className="text-[11px] text-slate-400 uppercase tracking-widest font-bold mb-4 flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-indigo-500" /> Đánh Giá An Toàn (Kyc)
               </h4>
               <div className="flex justify-between items-baseline mb-3">
                  <div className="text-4xl font-black text-slate-800 tracking-tighter">{trustScore}<span className="text-xl text-slate-400">%</span></div>
                  <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">Uy tín cao</div>
               </div>
               {/* Progress bar */}
               <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-4">
                  <div className="h-full bg-indigo-600 rounded-full transition-all duration-1000" style={{ width: `${trustScore}%` }} />
               </div>
               <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Hệ thống phân tích 15 bài đăng của SĐT này. Kết luận: Người dùng lâu năm, chưa từng bị report rác.
               </p>
            </div>

            {/* AI Price Context Tool */}
            <div className="mb-6 bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <h4 className="text-[11px] text-slate-400 uppercase tracking-widest font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-blue-500" /> Đo Lường Giá Trị
              </h4>
              <div className="flex items-center gap-3 mb-6 bg-blue-50 p-3 rounded-xl border border-blue-100">
                 <div className="flex-1">
                    <div className="text-xs text-blue-600 font-semibold mb-0.5">Mức Giá Đang Chào</div>
                    <div className="text-lg font-black text-blue-700">Rẻ hơn 12%</div>
                 </div>
                 <div className="text-right">
                    <div className="text-xs text-blue-400">so với trung bình</div>
                 </div>
              </div>

              <div className="space-y-4">
                 <div>
                    <div className="flex justify-between text-[11px] font-bold text-slate-500 mb-1.5">
                       <span>Căn này</span>
                       <span className="text-slate-700">3.5 Tỷ</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full bg-blue-500 rounded-full w-[70%]" />
                    </div>
                 </div>
                 <div>
                    <div className="flex justify-between text-[11px] font-bold text-slate-500 mb-1.5">
                       <span>Sàn Khu Vực Phường</span>
                       <span className="text-slate-700">4.1 Tỷ</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full bg-slate-300 rounded-full w-[85%]" />
                    </div>
                 </div>
              </div>
            </div>

            {/* AI Match Advisor / Insights */}
            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-6 shadow-xl shadow-indigo-500/20 relative overflow-hidden text-white">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-2xl rounded-full" />
               <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/20 blur-2xl rounded-full" />
               
               <h4 className="text-[11px] text-indigo-200 uppercase tracking-widest font-bold mb-4 flex items-center gap-2 relative z-10">
                 <Sparkles className="w-3.5 h-3.5 text-white" /> Chiến Lược Giao Dịch
               </h4>
               
               <h5 className="text-lg font-bold mb-2 relative z-10 leading-snug">{`Phân Tích ${currentInsight.district}` || 'Đề Xuất Khớp Lệnh'}</h5>
               
               <p className="text-sm text-indigo-100 leading-relaxed relative z-10 font-medium">
                  {currentInsight.suggestions?.buyer || 'Thuật toán phát hiện căn nhà này đang bị bán dưới giá trị thực để chủ nhà thu hồi vốn đẩy đi Mỹ định cư. Chốt ngay kẻo lỡ!'}
               </p>
               
               <div className="mt-6 flex flex-wrap gap-2 relative z-10">
                  <span className="text-[10px] font-bold bg-white/20 text-white px-3 py-1.5 rounded-full backdrop-blur-md">#BĐS_ĐầuTư</span>
                  <span className="text-[10px] font-bold bg-white/20 text-white px-3 py-1.5 rounded-full backdrop-blur-md">#Gấp</span>
               </div>
            </div>

          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
               <Bot className="w-8 h-8 text-slate-300" />
            </div>
            <h4 className="text-sm font-bold text-slate-700 mb-2">Chờ Tín Hiệu...</h4>
            <p className="text-xs text-slate-400 max-w-[200px]">Rê chuột vào một bài đăng bất kỳ để hệ thống đo lường dữ liệu</p>
          </div>
        )}

          </div>
        )}

      </div>

      <BottomNav />
    </div>
  );
}

function NavItem({ icon, label, active, badge, isCollapsed }: { icon: React.ReactNode, label: string, active?: boolean, badge?: number, isCollapsed?: boolean }) {
  return (
    <button className={`flex items-center gap-3 p-3 rounded-2xl transition-all w-full group relative ${active ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'} ${isCollapsed ? 'justify-center' : ''}`}>
      <div className={`relative ${active ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'} transition-colors shrink-0`}>
        {icon}
        {badge && (
          <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm">
            {badge}
          </span>
        )}
      </div>
      {!isCollapsed && (
        <span className={`text-sm font-bold hidden lg:block ${active ? 'text-indigo-600' : 'text-slate-600'}`}>{label}</span>
      )}
      {active && <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-indigo-600 ${isCollapsed ? 'rounded-r-md' : 'rounded-r-full'}`} />}
    </button>
  );
}
