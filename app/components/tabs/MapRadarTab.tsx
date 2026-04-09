'use client';

import React, { useState, useEffect } from 'react';
import { Map as MapIcon, Radar, Search, Filter } from 'lucide-react';
import { useFeedData } from '@/hooks/useFeedData';
import MapboxRenderer from '../map/MapboxRenderer';
import MapPinDetailPanel from '../map/MapPinDetailPanel';
import { type MockIntent } from '@/lib/mock/intents';

export default function MapRadarTab() {
  const [viewMode, setViewMode] = useState<'map' | 'radar'>('map');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedPin, setSelectedPin] = useState<{ intent: MockIntent; distance: string } | null>(null);
  const { intents } = useFeedData();

  useEffect(() => {
    // Giả lập xin quyền vị trí giống thật
    const getPos = () => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          },
          (err) => {
            console.warn('GPS denied or error:', err);
            // Fallback: Tâm Sài Gòn
            setUserLocation({ lat: 10.7766, lng: 106.6953 }); 
          },
          { timeout: 5000 }
        );
      } else {
         // Không có api hỗ trợ
         setUserLocation({ lat: 10.7766, lng: 106.6953 }); 
      }
    };
    getPos();
  }, []);

  return (
    <div className="h-full relative overflow-hidden flex flex-col text-gray-800 bg-[#AADAFF]">
      {/* HEADER MENU (Glassmorphism overlay) */}
      <div className="absolute top-0 w-full z-20 bg-gradient-to-b from-white via-white/80 to-transparent pt-4 md:pt-6 pb-8 px-4 md:px-8 pointer-events-none">
        <div className="max-w-3xl mx-auto flex flex-col gap-3 pointer-events-auto">
          {/* Toggle Bản đồ / Radar */}
          <div className="flex bg-gray-100/90 backdrop-blur-md p-1.5 rounded-2xl shadow-sm mb-1 mx-auto w-full md:w-fit border border-gray-200 lg:ml-0 lg:mr-auto">
            <button 
                onClick={() => setViewMode('map')} 
                className={`flex-1 md:w-40 flex justify-center items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${viewMode === 'map' ? 'bg-white text-[#0068FF] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
                <MapIcon size={18}/> Bản đồ thực
            </button>
            <button 
                onClick={() => { setViewMode('radar'); setSelectedPin(null); }} 
                className={`flex-1 md:w-40 flex justify-center items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${viewMode === 'radar' ? 'bg-[#0B132B] text-cyan-400 shadow-md border border-cyan-500/50' : 'text-gray-500 hover:text-gray-700'}`}
            >
                <Radar size={18} className={viewMode === 'radar' ? 'animate-[spin_4s_linear_infinite]' : ''}/> Quét Radar
            </button>
          </div>

          <div className="flex gap-2">
            <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-100 flex items-center px-4 py-3 flex-1">
              <Search size={20} className="text-gray-400 mr-2" />
              <input type="text" placeholder="Tìm kiếm khu vực, đường..." className="flex-1 outline-none text-sm font-medium bg-transparent"/>
              <div className="border-l pl-3 ml-2 cursor-pointer">
                  <Filter size={18} className="text-[#0068FF]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NỀN BẢN ĐỒ HERO */}
      <div className="flex-1 relative">
         <MapboxRenderer 
            viewMode={viewMode}
            userLocation={userLocation}
            intents={intents}
            selectedPinId={selectedPin?.intent.id || null}
            onPinClick={(intent, distance) => setSelectedPin({ intent, distance })}
         />
      </div>

      {/* BẢNG CHI TIẾT PIN */}
      {selectedPin && (
          <div className="absolute z-50"> 
             <MapPinDetailPanel 
                 pin={selectedPin.intent} 
                 distance={selectedPin.distance} 
                 onClose={() => setSelectedPin(null)} 
             />
          </div>
      )}
    </div>
  );
}
