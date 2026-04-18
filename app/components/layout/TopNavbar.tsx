'use client';

import { Home, MessageCircle, MapIcon, Flame, LayoutGrid, Bell, User } from 'lucide-react';

interface TopNavbarProps {
    activeTab: string;
    setActiveTab: (id: string) => void;
}

const NAV_ITEMS = [
    { id: 'home', label: 'Trang chủ', icon: Home },
    { id: 'map', label: 'Bản đồ', icon: MapIcon },
    { id: 'swipe', label: 'Khớp Nhanh', icon: Flame },
    { id: 'chat', label: 'Tin nhắn', icon: MessageCircle, badge: 3 },
    { id: 'apps', label: 'Tiện ích', icon: LayoutGrid },
];

export default function TopNavbar({ activeTab, setActiveTab }: TopNavbarProps) {
    return (
        <header className="hidden md:flex h-16 items-center justify-between px-5 lg:px-8 bg-white border-b border-slate-100 shadow-sm z-50 shrink-0">

            {/* ── Logo ── */}
            <div className="flex items-center gap-1 shrink-0">
                <h1 className="text-xl font-black text-[#0068FF] tracking-tighter select-none">
                    Cần<span className="text-green-500">&</span>Có
                </h1>
            </div>

            {/* ── Nav Items ── */}
            <nav className="flex items-center gap-1">
                {NAV_ITEMS.map(({ id, label, icon: Icon, badge }) => {
                    const isActive = activeTab === id;
                    const isSwipe = id === 'swipe';
                    return (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id)}
                            className={`relative flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${isActive
                                    ? 'bg-indigo-50 text-indigo-700 font-bold'
                                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                                }`}
                        >
                            <div className="relative shrink-0">
                                <Icon
                                    size={18}
                                    className={
                                        isSwipe && isActive
                                            ? 'text-amber-500 fill-amber-400 drop-shadow-sm'
                                            : isSwipe && !isActive
                                                ? 'text-slate-400'
                                                : ''
                                    }
                                />
                                {badge && (
                                    <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                                        {badge}
                                    </span>
                                )}
                            </div>
                            <span className="hidden lg:block">{label}</span>
                            {/* Active underline */}
                            {isActive && (
                                <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-indigo-500 rounded-full" />
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* ── Right Actions ── */}
            <div className="flex items-center gap-2 shrink-0">
                <button className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors cursor-pointer text-slate-500 hover:text-slate-900">
                    <Bell size={18} />
                </button>
                <button className="w-9 h-9 flex items-center justify-center rounded-full bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-colors cursor-pointer shadow-sm">
                    <User size={16} />
                </button>
            </div>

        </header>
    );
}
