'use client';

import { useState, useEffect } from 'react';
import { Compass, MessageCircle, Settings, X, Heart, Bot, MapIcon, LayoutGrid, Flame, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MutualMatchPopup } from '@/components/swipe/MutualMatchPopup';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface FeedIntent {
  id: string;
  type: string;
  title: string;
  rawText: string;
  price: number | null;
  priceMin: number | null;
  priceMax: number | null;
  address: string | null;
  district: string | null;
  ward: string | null;
  city: string | null;
  category: string;
  subcategory: string | null;
  trustScore: number | null;
  matchCount: number | null;
  viewCount: number | null;
  createdAt: string;
  userId: string;
  images: { url: string; displayOrder: number }[];
}

export default function SwipeFeedPage() {
  const [intents, setIntents] = useState<FeedIntent[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [matchData, setMatchData] = useState<{
    conversationId: string;
    partnerName: string;
    partnerAvatar: string | null;
  } | null>(null);
  const [unreadLikesCount] = useState(3);
  const pathname = usePathname();

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/swipe/feed?limit=20');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        if (data.intents) setIntents(data.intents);
      } catch (error) {
        console.error('Error fetching swipe feed:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeed();
  }, []);

  const currentIntent = intents[currentIndex];

  const handleSwipe = async (dir: 1 | -1) => {
    if (!currentIntent) return;
    setDirection(dir);
    if (currentIndex < intents.length - 1) {
      setTimeout(() => setCurrentIndex(prev => prev + 1), 200);
    }
    const action = dir === 1 ? 'LIKE' : 'SKIP';
    try {
      const res = await fetch('/api/swipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intentId: currentIntent.id, action }),
      });
      const data = await res.json();
      if (data.success && data.isMutualMatch && data.conversationId) {
        setMatchData({ conversationId: data.conversationId, partnerName: 'Người dùng', partnerAvatar: null });
      }
    } catch (error) {
      console.error('Error sending swipe action:', error);
    }
  };

  const bgImage = currentIntent?.images?.[0]?.url ??
    (currentIntent?.type === 'CO'
      ? 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800'
      : 'https://images.unsplash.com/photo-1560518881-bcce19af2418?auto=format&fit=crop&q=80&w=800');

  const displayPrice = () => {
    if (!currentIntent) return '';
    if (currentIntent.price) return `${(currentIntent.price / 1_000_000_000).toFixed(1)} Tỷ`;
    if (currentIntent.priceMin && currentIntent.priceMax)
      return `${(currentIntent.priceMin / 1_000_000_000).toFixed(1)} - ${(currentIntent.priceMax / 1_000_000_000).toFixed(1)} Tỷ`;
    return 'Thỏa thuận';
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-gray-50 flex flex-col items-center justify-center gap-3">
        <Flame className="w-10 h-10 text-[#0068FF] animate-pulse" />
        <p className="text-gray-500 text-sm font-medium">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-gray-50 text-gray-900 flex overflow-hidden font-sans">

      {matchData && (
        <MutualMatchPopup
          partnerName={matchData.partnerName}
          partnerAvatar={matchData.partnerAvatar}
          conversationId={matchData.conversationId}
          onClose={() => setMatchData(null)}
        />
      )}

      {/* LEFT SIDEBAR — Matches homepage exactly */}
      <div className="hidden md:flex w-24 lg:w-64 flex-col bg-white border-r border-gray-200 shadow-sm z-50">
        <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-gray-100 shrink-0">
          <h1 className="text-2xl font-black text-[#0068FF] hidden lg:block tracking-tighter">
            Cần<span className="text-green-500">&</span>Có
          </h1>
          <div className="lg:hidden w-10 h-10 bg-[#0068FF] rounded-xl flex items-center justify-center text-white font-black text-sm">
            C&C
          </div>
        </div>

        <nav className="flex-1 py-4 flex flex-col gap-1 px-3">
          <NavItem icon={<Compass size={22} />} label="Trang chủ" href="/" active={false} />
          <NavItem icon={<MapIcon size={22} />} label="Bản đồ" href="/?tab=map" active={false} />
          <NavItem
            icon={<Flame size={22} className="text-amber-500 fill-amber-400" />}
            label="Khớp Nhanh"
            href="/swipe"
            active={pathname === '/swipe'}
          />
          <NavItem
            icon={<Heart size={22} />}
            label="Quan Tâm"
            href="/swipe/likes"
            active={pathname === '/swipe/likes'}
            badge={unreadLikesCount}
          />
          <NavItem icon={<MessageCircle size={22} />} label="Tin nhắn" href="/?tab=chat" active={false} badge={3} />
          <NavItem icon={<LayoutGrid size={22} />} label="Tiện ích" href="/?tab=apps" active={false} />
        </nav>

        <div className="px-3 pb-4 border-t border-gray-100 pt-3">
          <NavItem icon={<Settings size={22} />} label="Cài đặt" href="/settings" active={false} />
        </div>
      </div>

      {/* CENTER — Swipe Feed */}
      <div className="flex-1 flex flex-col h-full items-center justify-center relative overflow-hidden">

        {/* Header */}
        <div className="w-full px-6 pt-5 pb-3 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-2">
            <Flame className="w-6 h-6 text-amber-500 fill-amber-400" />
            <h1 className="text-xl font-black text-gray-800 tracking-tight">Khớp Nhanh</h1>
          </div>
          {intents.length > 0 && (
            <span className="bg-blue-50 text-[#0068FF] text-xs px-3 py-1 rounded-full font-bold">
              {intents.length - currentIndex} tin
            </span>
          )}
        </div>

        {!currentIntent ? (
          <motion.div
            className="flex flex-col items-center justify-center gap-5 px-8 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
              <Heart className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-xl font-bold text-gray-700">Đã duyệt hết tin!</h2>
            <p className="text-sm text-gray-400 max-w-[260px]">
              Bạn đã lướt qua tất cả tin đăng. Hãy quay lại sau!
            </p>
          </motion.div>
        ) : (
          <>
            {/* Card Stack */}
            <div className="relative w-full max-w-[380px] aspect-[3/4] perspective-1000 flex-1 flex items-center justify-center px-4">
              <AnimatePresence mode="popLayout" custom={direction}>
                <motion.div
                  key={currentIntent.id}
                  initial={{ x: 80 * direction, opacity: 0, rotate: 4 * direction, scale: 0.96 }}
                  animate={{ x: 0, opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ x: -120 * direction, opacity: 0, rotate: -6 * direction, scale: 0.96 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 26 }}
                  className="absolute inset-0 w-full h-full rounded-[28px] overflow-hidden bg-white shadow-2xl border border-gray-100 cursor-grab active:cursor-grabbing"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.7}
                  onDragEnd={(e, { offset, velocity }) => {
                    const swipe = offset.x * velocity.x;
                    if (swipe < -10000) handleSwipe(-1);
                    else if (swipe > 10000) handleSwipe(1);
                  }}
                >
                  {/* Property Image */}
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url('${bgImage}')` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/80" />
                  </div>

                  {/* Type Badge - Top Left */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md shadow-sm ${currentIntent.type === 'CAN'
                      ? 'bg-blue-500/90 text-white border border-blue-400/50'
                      : 'bg-green-500/90 text-white border border-green-400/50'}`}>
                      {currentIntent.type === 'CAN' ? 'CẦN TÌM' : 'ĐANG BÁN'}
                    </span>
                  </div>

                  {/* Trust Score - Top Right */}
                  <div className="absolute top-4 right-4 z-10">
                    <div className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-xs font-semibold text-white">{currentIntent.trustScore ?? 80}%</span>
                    </div>
                  </div>

                  {/* Info Bottom */}
                  <div className="absolute bottom-0 w-full p-5 z-10">
                    <h2 className="text-xl font-bold text-white mb-1 leading-snug drop-shadow-md">
                      {currentIntent.title || 'Bất động sản'}
                    </h2>
                    <div className="text-green-400 text-lg font-black tracking-tight mb-2 drop-shadow-md">
                      {displayPrice()}
                    </div>
                    <p className="text-xs text-white/80 line-clamp-2 mb-3 leading-relaxed">
                      {currentIntent.rawText}
                    </p>
                    <div className="flex gap-1.5 flex-wrap">
                      {currentIntent.district && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/15 text-white border border-white/20 backdrop-blur-sm">
                          {currentIntent.district}
                        </span>
                      )}
                      {currentIntent.subcategory && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/15 text-white border border-white/20 backdrop-blur-sm">
                          {currentIntent.subcategory}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Action Buttons — matches SwipeMatchTab style */}
            <div className="flex items-center justify-center gap-5 py-6 shrink-0 z-10">
              {/* SKIP */}
              <button
                onClick={() => handleSwipe(-1)}
                className="w-16 h-16 rounded-full bg-white border-2 border-red-200 flex items-center justify-center shadow-lg shadow-red-500/10 hover:bg-red-50 hover:border-red-400 hover:scale-110 transition-all duration-200 active:scale-95 cursor-pointer"
              >
                <X className="w-7 h-7 text-red-500" />
              </button>

              {/* LIKE */}
              <button
                onClick={() => handleSwipe(1)}
                className="w-16 h-16 rounded-full bg-white border-2 border-green-200 flex items-center justify-center shadow-lg shadow-green-500/10 hover:bg-green-50 hover:border-green-400 hover:scale-110 transition-all duration-200 active:scale-95 cursor-pointer"
              >
                <Heart className="w-7 h-7 text-green-500" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* RIGHT SIDEBAR — AI Info */}
      <div className="hidden xl:flex w-80 flex-col bg-white border-l border-gray-200 overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0068FF]/10 border border-[#0068FF]/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-[#0068FF]" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-sm">CẦN & CÓ Assistant</h3>
              <p className="text-[10px] text-green-600 font-semibold uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block"></span>
                Real-time Analysis
              </p>
            </div>
          </div>
        </div>

        {currentIntent && (
          <div className="p-4">
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <h4 className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-3 flex items-center gap-2">
                <Activity className="w-3 h-3" /> Chi tiết bài đăng
              </h4>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Mã bài:</span>
                  <span className="font-mono text-xs font-semibold text-gray-700">{currentIntent.id.substring(0, 8)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Loại:</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${currentIntent.type === 'CAN' ? 'bg-blue-50 text-[#0068FF]' : 'bg-green-50 text-green-600'}`}>
                    {currentIntent.type}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Người tìm:</span>
                  <span className="font-semibold text-gray-700">{currentIntent.matchCount ?? 0} người</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Lượt xem:</span>
                  <span className="font-semibold text-gray-700">{currentIntent.viewCount ?? 34}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 bg-blue-50 rounded-2xl p-4 border border-blue-100">
              <h4 className="text-xs text-[#0068FF] uppercase tracking-wide font-bold mb-2 flex items-center gap-1.5">
                <Bot className="w-3 h-3" /> Gợi ý thị trường
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Bất động sản khu vực {currentIntent.district ?? 'này'} đang có nhu cầu cao. Đây là thời điểm tốt để kết nối!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function NavItem({ icon, label, href, active, badge }: {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
  badge?: number;
}) {
  return (
    <Link href={href}>
      <div className={`flex items-center justify-center lg:justify-start gap-4 px-3 py-3 lg:px-4 lg:py-3.5 rounded-xl transition-all cursor-pointer ${active
        ? 'bg-blue-50 text-[#0068FF] font-bold shadow-sm'
        : 'text-gray-600 hover:bg-gray-100 font-medium'}`}>
        <div className="relative shrink-0">
          {icon}
          {badge ? (
            <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
              {badge > 9 ? '9+' : badge}
            </span>
          ) : null}
        </div>
        <span className="hidden lg:block text-[15px]">{label}</span>
      </div>
    </Link>
  );
}
