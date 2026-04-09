'use client';

import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { type MockIntent } from '@/lib/mock/intents';

interface SwipeCardProps {
  intent: MockIntent;
  isTop: boolean;
  stackIndex: number; // 0 = top, 1 = middle, 2 = back
  onSwipe: (direction: 'left' | 'right') => void;
}

export default function SwipeCard({ intent, isTop, stackIndex, onSwipe }: SwipeCardProps) {
  const x = useMotionValue(0);

  // Card rotates as it drags
  const rotate = useTransform(x, [-200, 200], [-18, 18]);

  // Overlay indicators opacity
  const likeOpacity = useTransform(x, [0, 120], [0, 1]);
  const nopeOpacity = useTransform(x, [-120, 0], [1, 0]);

  // Stack perspective
  const scale = 1 - stackIndex * 0.05;
  const yOffset = stackIndex * 12;
  const cardOpacity = 1 - stackIndex * 0.2;

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!isTop) return;

    const threshold = 120;
    if (info.offset.x > threshold) {
      onSwipe('right');
    } else if (info.offset.x < -threshold) {
      onSwipe('left');
    }
    // else: card snaps back via dragConstraints
  };

  const trustScore = 85 + (intent.id.length % 15);
  const priceDisplay = intent.price?.toLocaleString('vi-VN')
    || intent.price_min?.toLocaleString('vi-VN')
    || 'Thỏa thuận';

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      style={{
        zIndex: 30 - stackIndex * 10,
      }}
      initial={false}
    >
      <motion.div
        className="relative w-[85vw] max-w-[370px] h-[65vh] max-h-[520px] rounded-[28px] overflow-hidden bg-white shadow-2xl cursor-grab active:cursor-grabbing select-none"
        style={isTop ? { x, rotate, scale } : { scale, y: yOffset, opacity: cardOpacity }}
        drag={isTop ? 'x' : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.9}
        onDragEnd={handleDragEnd}
        whileDrag={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        {/* Photo Section (60%) */}
        <div className="relative h-[60%] w-full overflow-hidden bg-slate-100">
          <img
            src={intent.images?.[0]?.url || (intent.type === 'CO'
              ? 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80'
              : 'https://images.unsplash.com/photo-1628611225249-6c3c7c689552?w=600&q=80')}
            alt=""
            className="w-full h-full object-cover"
            draggable={false}
          />

          {/* Top badges */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className={`text-[11px] uppercase font-black tracking-wider px-3 py-1.5 rounded-full backdrop-blur-md shadow-sm ${
              intent.type === 'CAN'
                ? 'bg-red-500/90 text-white'
                : 'bg-emerald-500/90 text-white'
            }`}>
              {intent.type === 'CAN' ? 'CẦN MUA' : 'ĐANG BÁN'}
            </span>
          </div>

          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full shadow-sm">
            <span className="text-[10px] font-bold text-indigo-600">Trust {trustScore}%</span>
          </div>

          {/* SWIPE OVERLAY INDICATORS (only on top card) */}
          {isTop && (
            <>
              {/* QUAN TÂM (Right) */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center bg-emerald-500/20 border-[4px] border-emerald-500 rounded-[28px]"
                style={{ opacity: likeOpacity }}
              >
                <div className="bg-emerald-500 text-white text-2xl font-black px-6 py-3 rounded-2xl -rotate-12 shadow-xl">
                  QUAN TÂM ✅
                </div>
              </motion.div>

              {/* BỎ QUA (Left) */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center bg-red-500/20 border-[4px] border-red-500 rounded-[28px]"
                style={{ opacity: nopeOpacity }}
              >
                <div className="bg-red-500 text-white text-2xl font-black px-6 py-3 rounded-2xl rotate-12 shadow-xl">
                  BỎ QUA ❌
                </div>
              </motion.div>
            </>
          )}
        </div>

        {/* Content Section (40%) */}
        <div className="flex-1 p-5 flex flex-col bg-white">
          <h3 className="text-lg font-bold text-slate-800 leading-tight line-clamp-2 mb-2">
            {intent.title || intent.raw_text?.slice(0, 60)}
          </h3>

          <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed mb-3">
            {intent.raw_text}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {intent.district && (
              <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full">📍 {intent.district}</span>
            )}
            {(intent.parsed_data as Record<string, any>)?.bedrooms && (
              <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">🛏 {String((intent.parsed_data as Record<string, any>).bedrooms)} PN</span>
            )}
            {intent.match_count > 0 && (
              <span className="text-[10px] font-semibold bg-amber-50 text-amber-600 px-2.5 py-1 rounded-full">🤝 {intent.match_count} khớp</span>
            )}
          </div>

          {/* Price */}
          <div className="mt-auto flex items-end justify-between">
            <div className="text-xl font-black text-indigo-600 tracking-tight">
              {priceDisplay} <span className="text-sm font-semibold text-slate-400">đ</span>
            </div>
            <div className="text-xs font-medium text-slate-400">
              {intent.user?.name}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
