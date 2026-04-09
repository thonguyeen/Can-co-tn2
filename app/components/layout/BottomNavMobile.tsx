import React from 'react';
import { Home, MessageCircle, MapIcon, Flame, LayoutGrid } from 'lucide-react';

export default function BottomNavMobile({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (id: string) => void }) {
  const NavItem = ({ icon, label, id, badge }: any) => (
    <button onClick={() => setActiveTab(id)} className={`flex flex-col items-center gap-1 w-1/5 relative transition-colors ${activeTab === id ? 'text-[#0068FF]' : 'text-gray-400 hover:text-gray-600'}`}>
      <div className="relative">{icon}{badge && <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white shadow-sm">{badge}</span>}</div>
      <span className={`text-[10px] ${activeTab === id ? 'font-bold' : 'font-medium'} truncate w-full text-center`}>{label}</span>
    </button>
  );

  return (
    <div className="md:hidden absolute bottom-0 w-full bg-white/95 backdrop-blur-md border-t border-gray-200 px-2 py-2 flex justify-between items-center z-40 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] env-safe-bottom pb-6">
      <NavItem icon={<Home size={24}/>} label="Trang chủ" id="home" />
      <NavItem icon={<MapIcon size={24}/>} label="Bản đồ" id="map" />
      <NavItem icon={<Flame size={24} className={activeTab === 'swipe' ? 'text-amber-500 fill-amber-500 drop-shadow-md' : ''}/>} label="Khớp Nhanh" id="swipe" />
      <NavItem icon={<MessageCircle size={24}/>} label="Tin nhắn" id="chat" badge={3} />
      <NavItem icon={<LayoutGrid size={24}/>} label="Tiện ích" id="apps" />
    </div>
  );
}
