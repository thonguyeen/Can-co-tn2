'use client';

import React, { useMemo, useState } from 'react';
import Map, { Marker } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { type MockIntent } from '@/lib/mock/intents';

// Public token tạm thời cho dev. Lưu ý: Thay thế bằng token .env trên production.
const MAPBOX_TOKEN = 'pk.eyJ1IjoibmhhdWtoYW5nIiwiYSI6ImNsdzFjY3FkMTAwMDcya21ydXlycW11OHUifQ.F_Wf-lS7eF1fF_R0NlBEXw';

interface MapboxRendererProps {
  viewMode: 'map' | 'radar';
  userLocation: { lat: number; lng: number } | null;
  intents: MockIntent[];
  onPinClick: (intent: MockIntent, distance: string) => void;
  selectedPinId: string | null;
}

export default function MapboxRenderer({ viewMode, userLocation, intents, onPinClick, selectedPinId }: MapboxRendererProps) {
  const [viewState, setViewState] = useState({
    longitude: userLocation?.lng || 106.6953, // Default: Sài Gòn
    latitude: userLocation?.lat || 10.7766,
    zoom: 14,
    pitch: viewMode === 'radar' ? 60 : 0,
    bearing: viewMode === 'radar' ? -15 : 0,
  });

  // Map dữ liệu thực tế từ Supabase
  const mapData = useMemo(() => {
    if (!userLocation) return [];
    return intents.slice(0, 30).map((intent, idx) => {
      let lat = typeof intent.lat === 'number' ? intent.lat : null;
      let lng = typeof intent.lng === 'number' ? intent.lng : null;
      let numericDistance = 0;

      // Fallback nếu bài đăng cũ chưa có tọa độ: Sinh random xung quanh user (bán kính 2km)
      if (lat === null || lng === null) {
        const r = 0.02 * Math.sqrt(Math.random()); 
        const theta = Math.random() * 2 * Math.PI;
        lat = userLocation.lat + r * Math.cos(theta);
        lng = userLocation.lng + r * Math.sin(theta);
        numericDistance = r * 111;
      } else {
        // Tính khoảng cách flat geometry xấp xỉ
        const dLat = lat - userLocation.lat;
        const dLng = lng - userLocation.lng;
        numericDistance = Math.sqrt(dLat * dLat + dLng * dLng) * 111;
      }
      
      const distanceStr = numericDistance.toFixed(1);

      // Format giá chuẩn thay vì giá ảo
      const formattedPrice = intent.price?.toLocaleString('vi-VN') 
        || intent.price_min?.toLocaleString('vi-VN') 
        || 'Thỏa thuận';
        
      const priceSuffix = intent.price || intent.price_min ? ' đ' : '';

      return {
        ...intent,
        lat,
        lng,
        distance: `${distanceStr}km`,
        priceDisplay: `${formattedPrice}${priceSuffix}`.trim(),
        delay: idx * 0.5 // for radar pulse animation
      };
    });
  }, [userLocation, intents]);

  if (!userLocation) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#0B132B]">
        <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-cyan-400 font-bold animate-pulse">Đang định vị GPS...</p>
      </div>
    );
  }

  const mapStyle = viewMode === 'radar' 
    ? 'mapbox://styles/mapbox/dark-v11'
    : 'mapbox://styles/mapbox/light-v11';

  return (
    <div className="w-full h-full relative bg-[#0B132B]">
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle={mapStyle}
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
      >
        {/* Điểm tâm người dùng */}
        <Marker longitude={userLocation.lng} latitude={userLocation.lat} anchor="center">
          <div className="relative flex items-center justify-center w-12 h-12">
            <div className="absolute w-full h-full bg-[#0068FF]/30 rounded-full animate-ping"></div>
            <div className="w-6 h-6 bg-[#0068FF] rounded-full border-2 border-white shadow-xl relative z-10"></div>
          </div>
        </Marker>

        {/* Marker hiển thị các BĐS */}
        {mapData.map(pin => {
          const isSelected = selectedPinId === pin.id;
          const isCan = pin.type === 'CAN';
          const bgColor = isCan ? 'bg-red-500' : 'bg-[#0068FF]';
          const radarGlow = isCan ? 'shadow-[0_0_15px_rgba(239,68,68,0.8)]' : 'shadow-[0_0_15px_rgba(0,104,255,0.8)]';

          // Ở chế độ Radar, các pin sẽ là những điểm sáng nhấp nháy. 
          // Ở chế độ Map, nó là bong bóng giá tiền.
          if (viewMode === 'radar') {
            return (
              <Marker key={pin.id} longitude={pin.lng} latitude={pin.lat} anchor="center">
                <div 
                  onClick={(e) => { e.stopPropagation(); onPinClick(pin, pin.distance); }}
                  className="cursor-pointer hover:scale-150 transition-transform p-4 -m-4"
                >
                  <div 
                    className={`w-3 h-3 rounded-full border border-white animate-pulse ${bgColor} ${radarGlow}`}
                    style={{ animationDelay: `${pin.delay}s` }}
                  ></div>
                </div>
              </Marker>
            );
          }

          // Map Mode: Hiện bóng giá tiền kiểu Homigo
          return (
            <Marker key={pin.id} longitude={pin.lng} latitude={pin.lat} anchor="bottom">
               <div 
                  onClick={(e) => { e.stopPropagation(); onPinClick(pin, pin.distance); }}
                  className={`
                    cursor-pointer transition-all duration-300 origin-bottom transform
                    ${isSelected ? 'scale-125 z-20' : 'scale-100 z-10 hover:scale-110 hover:z-20'}
                  `}
                >
                  <div className={`
                    text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg relative flex items-center justify-center min-w-[50px]
                    ${isSelected ? 'bg-gray-900 border-2 border-white' : bgColor}
                  `}>
                    {pin.priceDisplay}
                    {/* Tam giác đuôi của bong bóng */}
                    <div className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 rotate-45 rounded-sm ${isSelected ? 'bg-gray-900' : bgColor}`}></div>
                  </div>
                </div>
            </Marker>
          );
        })}

        {/* Lớp phủ màn hình Radar */}
        {viewMode === 'radar' && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0 overflow-hidden">
             {/* Vòng tròn Radar */}
             <div className="relative w-[300px] h-[300px] md:w-[600px] md:h-[600px] rounded-full border border-cyan-500/20">
               <div className="absolute inset-0 border border-cyan-500/10 rounded-full scale-75"></div>
               <div className="absolute inset-0 border border-cyan-500/30 rounded-full scale-50"></div>
               {/* Quạt quét quét vòng (Sweep) */}
               <div className="absolute w-1/2 h-1/2 top-0 right-0 origin-bottom-left border-r-2 border-cyan-400 bg-gradient-to-tr from-cyan-500/40 to-transparent animate-[spin_3s_linear_infinite] rounded-tr-full"></div>
             </div>
             <div className="absolute top-[15%] text-cyan-400 text-xs md:text-sm tracking-widest uppercase font-bold animate-pulse drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]">
               Đang quét bán kính 3km...
             </div>
          </div>
        )}
      </Map>
    </div>
  );
}
