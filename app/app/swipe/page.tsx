'use client';

import { useState, useEffect } from 'react';
import { type MockIntent } from '@/lib/mock/intents';
import { GENERATED_INTENTS } from '@/lib/mock/intent-generator';
import { CRAWLED_INTENTS } from '@/lib/mock/crawled-listings';
import { DEMO_INSIGHTS } from '@/lib/mock/insights';
import { 
  Home, Compass, MessageCircle, User, Settings, 
  X, Heart, Info, ArrowRight, ArrowLeft, Bot, Activity 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_INTENTS = [...GENERATED_INTENTS, ...CRAWLED_INTENTS].sort(
  (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
);

export default function SwipeFeedPage() {
  const [intents, setIntents] = useState<MockIntent[]>(MOCK_INTENTS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // Lõi dữ liệu
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
            return dbIntents.length ? [...dbIntents, ...MOCK_INTENTS] : prev;
          });
        }
      } catch {
        // Fallback to mock
      }
    };
    fetchRealIntents();
  }, []);

  const currentIntent = intents[currentIndex];
  // Dữ liệu Insight ảo mượt mà (Mocked for visual)
  const trustScore = 85 + Math.floor(Math.random() * 14); 
  const currentInsight = DEMO_INSIGHTS[currentIndex % DEMO_INSIGHTS.length] || DEMO_INSIGHTS[0];

  const handleSwipe = (dir: 1 | -1) => {
    setDirection(dir);
    if (currentIndex < intents.length - 1) {
      setTimeout(() => setCurrentIndex(prev => prev + 1), 200);
    }
  };

  if (!currentIntent) return <div className="h-screen bg-[#0f172a] text-slate-50 flex items-center justify-center">Hết tin!</div>;

  return (
    <div className="h-screen w-full bg-[#0f172a] text-slate-50 flex overflow-hidden font-sans selection:bg-emerald-500/30">
      
      {/* 1. LEFT SIDEBAR (Navigation) */}
      <div className="w-20 lg:w-64 border-r border-slate-800/50 bg-[#0f172a]/80 backdrop-blur flex flex-col items-center lg:items-start py-8 px-4 z-10 shrink-0 hidden md:flex">
        <div className="mb-12 lg:px-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center font-bold text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            C&C
          </div>
          <span className="text-xl font-bold tracking-tight hidden lg:block text-slate-100">
            CẦN & CÓ <span className="text-emerald-500 text-sm align-top">BĐS</span>
          </span>
        </div>

        <nav className="flex flex-col gap-6 w-full lg:px-2">
          <NavItem icon={<Compass className="w-6 h-6" />} label="Khám Phá" active />
          <NavItem icon={<Heart className="w-6 h-6" />} label="Quan Tâm" />
          <NavItem icon={<MessageCircle className="w-6 h-6" />} label="Tin Nhắn" badge={3} />
          <NavItem icon={<User className="w-6 h-6" />} label="Hồ Sơ" />
        </nav>
        
        <div className="mt-auto lg:px-2 w-full">
          <NavItem icon={<Settings className="w-6 h-6" />} label="Cài Đặt" />
        </div>
      </div>

      {/* 2. CENTER TINDER FEED */}
      <div className="flex-1 flex flex-col relative h-full items-center justify-center p-4">
        
        {/* Mobile Header (Only visible on small screens) */}
        <div className="md:hidden absolute top-0 w-full p-4 flex justify-between items-center z-20">
           <div className="text-emerald-500 font-bold text-lg tracking-tight">CẦN & CÓ</div>
           <MessageCircle className="w-6 h-6 text-slate-300" />
        </div>

        <div className="relative w-full max-w-[420px] aspect-[4/5] sm:aspect-[9/16] perspective-1000">
          <AnimatePresence mode="popLayout" custom={direction}>
            <motion.div
              key={currentIntent.id}
              initial={{ x: 100 * direction, opacity: 0, rotate: 5 * direction, scale: 0.95 }}
              animate={{ x: 0, opacity: 1, rotate: 0, scale: 1 }}
              exit={{ x: -100 * direction, opacity: 0, rotate: -5 * direction, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden bg-slate-800 shadow-2xl border border-slate-700/50"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.8}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = offset.x * velocity.x;
                if (swipe < -10000) handleSwipe(-1);
                else if (swipe > 10000) handleSwipe(1);
              }}
            >
              {/* Fake Background Image for Prototype (BDS/Apartment) */}
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ 
                  backgroundImage: currentIntent.type === 'CO' 
                    ? `url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800')`
                    : `url('https://images.unsplash.com/photo-1560518881-bcce19af2418?auto=format&fit=crop&q=80&w=800')` 
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#0f172a]/95" />
              </div>

              {/* Trust Badge Top Right */}
              <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-2">
                <div className="px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-emerald-500/30 flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-semibold text-emerald-400 tracking-wide">Trust Score {trustScore}%</span>
                </div>
                <div className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-slate-600/50">
                   <span className="text-[10px] text-slate-300 uppercase font-medium">{currentIntent.type === 'CO' ? 'Chính Chủ' : 'Xác Minh Qua SĐT'}</span>
                </div>
              </div>

              {/* Status Badge Top Left */}
              <div className="absolute top-4 left-4 z-10">
                 <div className="px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-slate-600/50">
                  <span className={`text-xs font-bold ${currentIntent.type === 'CAN' ? 'text-red-400' : 'text-emerald-400'}`}>
                    {currentIntent.type === 'CAN' ? 'CẦN TÌM MUA' : 'ĐANG KÊU BÁN'}
                  </span>
                </div>
              </div>

              {/* Info Overlay Bottom */}
              <div className="absolute bottom-0 w-full p-6 pt-20 flex flex-col justify-end">
                <h2 className="text-2xl font-bold text-white mb-1 leading-snug drop-shadow-md">
                  {currentIntent.title}
                </h2>
                <div className="text-emerald-400 text-xl font-black tracking-tight mb-3 drop-shadow-md">
                  {currentIntent.price?.toLocaleString('vi-VN')} VND
                </div>
                <p className="text-sm text-slate-300 line-clamp-3 mb-4 leading-relaxed whitespace-pre-line text-pretty">
                  {currentIntent.raw_text}
                </p>
                
                {/* Meta tags */}
                <div className="flex gap-2 flex-wrap mb-2">
                  <span className="text-[10px] px-2 py-1 rounded-md bg-white/10 text-slate-200 border border-white/5 backdrop-blur-sm">Quận 7, HCM</span>
                  <span className="text-[10px] px-2 py-1 rounded-md bg-white/10 text-slate-200 border border-white/5 backdrop-blur-sm">65m2</span>
                  <span className="text-[10px] px-2 py-1 rounded-md bg-white/10 text-slate-200 border border-white/5 backdrop-blur-sm">2 Phòng Ngủ</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-6 mt-8 z-10">
          <button 
            onClick={() => handleSwipe(-1)}
            className="w-16 h-16 rounded-full bg-slate-800/80 backdrop-blur-md flex items-center justify-center text-red-400 hover:bg-slate-700 hover:text-red-300 hover:scale-110 active:scale-95 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.3)] border border-slate-700 group"
          >
            <X className="w-8 h-8 group-hover:drop-shadow-[0_0_8px_rgba(248,113,113,0.8)] transition-all" />
          </button>
          <button 
            onClick={() => handleSwipe(1)}
            className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center text-white hover:bg-emerald-400 hover:scale-110 active:scale-95 transition-all shadow-[0_4px_20px_rgba(16,185,129,0.4)] border border-emerald-400 group"
          >
            <Heart className="w-8 h-8 group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.8)] fill-current transition-all" />
          </button>
        </div>
        
        {/* Keyboard hints */}
        <div className="hidden xl:flex items-center gap-4 mt-8 text-[10px] text-slate-500 font-medium">
          <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">←</kbd> Bỏ qua</span>
          <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">→</kbd> Quan tâm</span>
        </div>

      </div>

      {/* 3. RIGHT SIDEBAR (AI Dashboard) */}
      <div className="w-80 lg:w-96 border-l border-slate-800/50 bg-[#1e293b]/30 backdrop-blur-xl p-6 overflow-y-auto hidden xl:block custom-scrollbar">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex flex-center items-center justify-center">
            <Bot className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-sm">CẦN & CÓ Assistant</h3>
            <p className="text-[10px] text-emerald-400 font-medium uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse relative"><span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-50"></span></span>
              Real-time Analysis
            </p>
          </div>
        </div>

        {/* AI Market Context (Price Tooltip Logic) */}
        <div className="mb-6 bg-slate-800/40 rounded-2xl p-4 border border-slate-700/50 shadow-inner">
          <h4 className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-3 flex items-center gap-2">
            <Activity className="w-3 h-3" /> Tín Hiệu Định Giá
          </h4>
          
          <div className="flex items-end gap-2 mb-4">
             <div className="text-2xl font-bold text-emerald-400">Rẻ hơn 12%</div>
             <div className="text-xs text-slate-400 mb-1">so với thị trường</div>
          </div>

          {/* Mini Bar Chart */}
          <div className="space-y-3">
             <div className="flex items-center gap-3">
                <div className="w-12 text-[10px] text-slate-400 text-right">Căn này</div>
                <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                   <div className="h-full bg-emerald-400 rounded-full w-[70%]" />
                </div>
                <div className="w-16 text-[10px] font-bold text-slate-200">3.5 Tỷ</div>
             </div>
             <div className="flex items-center gap-3">
                <div className="w-12 text-[10px] text-slate-400 text-right">Khu Vực</div>
                <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                   <div className="h-full bg-slate-500 rounded-full w-[85%]" />
                </div>
                <div className="w-16 text-[10px] font-bold text-slate-200">4.1 Tỷ</div>
             </div>
          </div>
        </div>

        {/* AI Match Advisor Box */}
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl p-4 border border-slate-700/50 relative overflow-hidden">
           {/* Decorative glow */}
           <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full" />
           
           <h4 className="text-xs text-emerald-400 uppercase tracking-widest font-bold mb-3 flex items-center gap-2 relative">
             <Bot className="w-3 h-3" /> {currentInsight.district}
           </h4>
           
           <p className="text-sm text-slate-300 leading-relaxed relative">
              "{currentInsight.suggestions?.buyer || 'Hệ thống nhận thấy căn góc này cực kỳ hiếm, chủ nhà đang cần bán gấp với giá rất tốt so với mặt bằng chung Quận 7.'}"
           </p>

           <div className="mt-4 pt-4 border-t border-slate-700/50 flex flex-wrap gap-2 relative">
              <span className="text-[10px] font-medium bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-md border border-emerald-500/20">#chinh_chu_gap_ban</span>
              <span className="text-[10px] font-medium bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-md border border-emerald-500/20">#can_goc</span>
           </div>
        </div>
      </div>

    </div>
  );
}

function NavItem({ icon, label, active, badge }: { icon: React.ReactNode, label: string, active?: boolean, badge?: number }) {
  return (
    <button className={`flex items-center gap-4 p-3 rounded-xl transition-all w-full group relative ${active ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
      <div className={`relative ${active ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'} transition-colors`}>
        {icon}
        {badge && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white border-2 border-[#0f172a]">
            {badge}
          </span>
        )}
      </div>
      <span className={`font-semibold hidden lg:block ${active ? 'text-emerald-400' : 'text-slate-300'}`}>{label}</span>
      {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-400 rounded-r-md" />}
    </button>
  );
}
