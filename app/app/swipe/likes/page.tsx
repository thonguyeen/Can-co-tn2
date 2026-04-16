'use client';

import { useState, useEffect } from 'react';
import { Compass, MessageCircle, Settings, Heart, Bot, MapIcon, LayoutGrid, Flame, Activity, Clock } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface SwipeLike {
  id: string;
  intentId: string;
  action: string;
  createdAt: string;
  user: {
    displayName: string;
    avatarUrl: string | null;
    trustScore: number | null;
  };
  intent: {
    title: string;
    type: string;
  };
}

export default function SwipeLikesPage() {
  const [likes, setLikes] = useState<SwipeLike[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/swipe/likes');
        if (!res.ok) throw new Error('Failed to fetch likes');
        const data = await res.json();
        if (data.likes) setLikes(data.likes);
      } catch (error) {
        console.error('Error fetching likes:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLikes();
  }, []);

  return (
    <div className="h-screen w-full bg-gray-50 text-gray-900 flex overflow-hidden font-sans">

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
          <NavItem icon={<Flame size={22} />} label="Khớp Nhanh" href="/swipe" active={pathname === '/swipe'} />
          <NavItem
            icon={<Heart size={22} />}
            label="Quan Tâm"
            href="/swipe/likes"
            active={pathname === '/swipe/likes'}
            badge={likes.length}
          />
          <NavItem icon={<MessageCircle size={22} />} label="Tin nhắn" href="/?tab=chat" active={false} badge={3} />
          <NavItem icon={<LayoutGrid size={22} />} label="Tiện ích" href="/?tab=apps" active={false} />
        </nav>

        <div className="px-3 pb-4 border-t border-gray-100 pt-3">
          <NavItem icon={<Settings size={22} />} label="Cài đặt" href="/settings" active={false} />
        </div>
      </div>

      {/* CENTER — Likes Feed */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-pink-50 border border-pink-100 flex items-center justify-center">
              <Heart className="w-5 h-5 text-pink-500 fill-pink-400" />
            </div>
            <div>
              <h1 className="text-lg font-black text-gray-800 tracking-tight leading-none">Quan Tâm</h1>
              <p className="text-xs text-gray-400 font-medium mt-0.5">Người đã thích bài của bạn</p>
            </div>
          </div>
          {likes.length > 0 && (
            <span className="bg-blue-50 text-[#0068FF] text-sm px-3 py-1 rounded-full font-bold border border-blue-100">
              {likes.length} lượt
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 px-4 py-6 max-w-2xl w-full mx-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Activity className="w-8 h-8 text-[#0068FF] animate-pulse" />
              <p className="text-gray-400 text-sm font-medium">Đang tải...</p>
            </div>
          ) : likes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-gray-100 shadow-sm gap-4">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100">
                <Heart className="w-9 h-9 text-gray-200" />
              </div>
              <div className="text-center">
                <h2 className="text-lg font-bold text-gray-700">Chưa có lượt quan tâm nào</h2>
                <p className="text-sm text-gray-400 mt-1 max-w-[260px] mx-auto">
                  Hãy cập nhật bài đăng để thu hút sự chú ý!
                </p>
              </div>
              <Link href="/swipe">
                <button className="px-5 py-2.5 bg-[#0068FF] text-white text-sm font-semibold rounded-xl shadow-sm hover:bg-blue-700 transition-colors duration-200 cursor-pointer">
                  Xem Khớp Nhanh
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {likes.map((like) => (
                <div
                  key={like.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 p-5 transition-all duration-200 group cursor-pointer"
                >
                  <div className="flex gap-4 items-start">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0 overflow-hidden font-bold text-[#0068FF] text-lg">
                      {like.user.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={like.user.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        like.user.displayName.charAt(0).toUpperCase()
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-gray-800 text-sm">{like.user.displayName}</h3>
                          {like.user.trustScore && like.user.trustScore >= 80 && (
                            <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-600 text-[10px] font-bold border border-green-100">
                              Tin cậy
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-400 flex items-center gap-1 shrink-0">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(like.createdAt), { addSuffix: true, locale: vi })}
                        </span>
                      </div>

                      <p className="text-sm text-gray-500 leading-relaxed">
                        Đã quan tâm bài{' '}
                        <span className={`font-semibold ${like.intent.type === 'CAN' ? 'text-[#0068FF]' : 'text-green-600'}`}>
                          [{like.intent.type === 'CAN' ? 'CẦN' : 'CÓ'}]
                        </span>{' '}
                        &quot;{like.intent.title}&quot;
                      </p>

                      <div className="flex gap-2 mt-3">
                        <button className="px-4 py-1.5 bg-[#0068FF] text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 cursor-pointer shadow-sm">
                          Phản hồi
                        </button>
                        <button className="px-4 py-1.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-200 transition-colors duration-200 cursor-pointer">
                          Bỏ qua
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SIDEBAR — Stats */}
      <div className="hidden xl:flex w-72 flex-col bg-white border-l border-gray-200 overflow-y-auto">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0068FF]/10 border border-[#0068FF]/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-[#0068FF]" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-sm">Thống kê</h3>
              <p className="text-[10px] text-green-600 font-semibold uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
                Live
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {/* Stats Card */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <h4 className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-3 flex items-center gap-1.5">
              <Activity className="w-3 h-3" /> Tóm tắt
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Tổng quan tâm:</span>
                <span className="text-sm font-bold text-gray-800">{likes.length} lượt</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Match rate:</span>
                <span className="text-sm font-bold text-green-600">24%</span>
              </div>
            </div>
          </div>

          {/* Tip */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <h4 className="text-xs text-[#0068FF] uppercase tracking-wide font-bold mb-2 flex items-center gap-1.5">
              <Bot className="w-3 h-3" /> Gợi ý
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Tốc độ phản hồi cao giúp tăng cơ hội khớp đôi thành công lên đến 3 lần!
            </p>
          </div>
        </div>
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
