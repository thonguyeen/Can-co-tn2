import React from 'react';
import { Navigation, MessageCircle, X, ShieldCheck, Zap } from 'lucide-react';
import { type MockIntent } from '@/lib/mock/intents';

interface MapPinDetailPanelProps {
  pin: MockIntent | null;
  distance: string;
  onClose: () => void;
}

export default function MapPinDetailPanel({ pin, distance, onClose }: MapPinDetailPanelProps) {
  if (!pin) return null;

  return (
    <div className={`
      absolute z-30 transition-all duration-300 ease-in-out bg-white 
      bottom-0 left-0 w-full rounded-t-3xl shadow-[0_-20px_40px_rgba(0,0,0,0.15)] pb-24 
      md:pb-6 md:bottom-auto md:top-28 md:right-8 md:w-[400px] md:rounded-2xl
      ${pin ? 'translate-y-0 md:translate-x-0 opacity-100' : 'translate-y-full md:translate-y-0 md:translate-x-[120%] opacity-0 pointer-events-none'}
    `}>
      <div className="p-5">
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-4 cursor-pointer md:hidden" onClick={onClose}></div>
        
        <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg leading-tight flex-1 mr-2">{pin.title}</h3>
            <button onClick={onClose} className="bg-gray-100 p-1.5 rounded-full hover:bg-gray-200 text-gray-500">
                <X size={16} />
            </button>
        </div>

        <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-4">
          <span className={`font-black text-2xl ${pin.type === 'CO' ? 'text-emerald-500' : 'text-red-500'}`}>
            {pin.price?.toLocaleString('vi-VN') || pin.price_min?.toLocaleString('vi-VN') || 'Thỏa thuận'} {pin.price ? 'đ' : ''}
          </span>
          <span className="flex items-center gap-1 bg-green-50 text-green-600 px-2 py-1 rounded-lg text-xs font-bold">
            <Zap size={14}/> Match 95%
          </span>
        </div>

        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl mb-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <img src={pin.user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${pin.id}`} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt="avatar" />
            <div>
              <div className="font-bold text-sm">
                {pin.user?.name || 'Người dùng ẩn danh'} 
                {pin.trust_score >= 4 && <ShieldCheck size={14} className="text-blue-500 inline ml-1"/>}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">Cách bạn {distance}</div>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-5 line-clamp-3">
            {pin.raw_text}
        </p>

        <div className="flex gap-2">
          <button className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl flex justify-center items-center gap-2 hover:bg-gray-200 transition">
            <Navigation size={16}/> Chỉ đường
          </button>
          <button className={`flex-1 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2 shadow-lg hover:opacity-90 transition ${pin.type === 'CO' ? 'bg-[#0068FF]' : 'bg-red-500'}`}>
            <MessageCircle size={16}/> Chat ngay
          </button>
        </div>
      </div>
    </div>
  );
}
