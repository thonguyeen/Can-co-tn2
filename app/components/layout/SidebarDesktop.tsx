import React from 'react';
import { Home, MessageCircle, MapIcon, Flame, LayoutGrid } from 'lucide-react';

export default function SidebarDesktop({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (id: string) => void }) {
  const NavItem = ({ icon, label, id, badge }: any) => (
    <button onClick={() => setActiveTab(id)} className={`flex items-center justify-center lg:justify-start gap-4 px-3 py-3 lg:px-4 lg:py-3.5 rounded-xl transition-all ${activeTab === id ? 'bg-blue-50 text-[#0068FF] font-bold shadow-sm' : 'text-gray-600 hover:bg-gray-100 font-medium'}`}>
      <div className="relative shrink-0">{icon}{badge && <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white shadow-sm">{badge}</span>}</div>
      <span className="hidden lg:block text-[15px]">{label}</span>
    </button>
  );

  return (
    <div className="hidden md:flex w-24 lg:w-64 flex-col bg-white border-r border-gray-200 shadow-sm z-50 overflow-y-auto">
      <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-gray-100 shrink-0">
        <h1 className="text-2xl font-black text-[#0068FF] hidden lg:block tracking-tighter">Cần<span className="text-green-500">&</span>Có</h1>
        <div className="lg:hidden w-10 h-10 bg-[#0068FF] rounded-xl flex items-center justify-center text-white font-black">C&C</div>
      </div>
      <div className="flex-1 py-6 flex flex-col gap-2 px-3">
        <NavItem icon={<Home size={22}/>} label="Trang chủ" id="home" />
        <NavItem icon={<MapIcon size={22}/>} label="Bản đồ" id="map" />
        <NavItem icon={<Flame size={22} className={activeTab === 'swipe' ? 'text-amber-500 fill-amber-500 drop-shadow-md' : ''}/>} label="Khớp Nhanh" id="swipe" />
        <NavItem icon={<MessageCircle size={22}/>} label="Tin nhắn" id="chat" badge={3} />
        <NavItem icon={<LayoutGrid size={22}/>} label="Tiện ích" id="apps" />
      </div>
    </div>
  );
}
