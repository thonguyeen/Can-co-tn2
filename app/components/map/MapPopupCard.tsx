'use client';

import React, { useState, useCallback } from 'react';
import { useAuthGate } from '@/components/auth/AuthGateProvider';
import {
  X,
  Heart,
  Navigation,
  ShieldCheck,
  MapPin,
  Tag,
  Loader2,
} from 'lucide-react';
import type { MapFeatureProperties } from '@/types/map';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface LikeResult {
  isMutualMatch: boolean;
  conversationId?: string;
}

interface MapPopupCardProps {
  pin: MapFeatureProperties;
  distance: string;
  onClose: () => void;
  onLikeSuccess: (result: LikeResult) => void;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatPrice(price: number | null, type: 'CAN' | 'CO'): string {
  if (!price) return 'Thỏa thuận';
  if (price >= 1_000_000_000) {
    return `${(price / 1_000_000_000).toFixed(1).replace(/\.0$/, '')} tỷ`;
  }
  const label = type === 'CO' ? ' tr/th' : ' tr';
  return `${Math.round(price / 1_000_000)}${label}`;
}

// ─── Heart Particle (bay lên khi like thành công) ───────────────────────────

function HeartParticle({ index }: { index: number }) {
  const x = (Math.random() - 0.5) * 120;
  const duration = 0.8 + Math.random() * 0.4;
  const delay = index * 0.05;
  const size = 14 + Math.floor(Math.random() * 10);

  return (
    <span
      className="absolute pointer-events-none select-none text-red-500"
      style={{
        fontSize: size,
        bottom: 0,
        left: '50%',
        animation: `heartFloat ${duration}s ease-out ${delay}s forwards`,
        transform: `translateX(${x}px)`,
        opacity: 0,
      }}
    >
      ❤️
    </span>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function MapPopupCard({
  pin,
  distance,
  onClose,
  onLikeSuccess,
}: MapPopupCardProps) {
  const { requireAuth, isGuest } = useAuthGate();

  const [likeState, setLikeState] = useState<'idle' | 'loading' | 'liked'>('idle');
  const [showHearts, setShowHearts] = useState(false);

  // Format giá hiển thị
  const priceStr = formatPrice(pin.price, pin.type);
  const isCan = pin.type === 'CAN';

  // ── Handle Like ──
  const handleLike = useCallback(() => {
    requireAuth(async () => {
      // Auth gate passed — user is logged in
      if (likeState !== 'idle') return;
      setLikeState('loading');

      try {
        const res = await fetch('/api/swipe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ intentId: pin.id, action: 'LIKE' }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          // Bài của chính mình → show friendly message
          if (res.status === 400) {
            setLikeState('idle');
            return;
          }
          throw new Error(err.error || 'Lỗi không xác định');
        }

        const data: { success: boolean; isMutualMatch: boolean; conversationId?: string } =
          await res.json();

        // ✅ Thành công → hiệu ứng tim bay
        setLikeState('liked');
        setShowHearts(true);
        setTimeout(() => setShowHearts(false), 1200);

        // Callback lên parent để show MutualMatchPopup nếu cần
        if (data.success) {
          onLikeSuccess({
            isMutualMatch: data.isMutualMatch,
            conversationId: data.conversationId,
          });
        }
      } catch (err) {
        console.error('[MapPopupCard] Like error:', err);
        setLikeState('idle');
      }
    })
  }, [requireAuth, pin.id, likeState, onLikeSuccess]);

  return (
    <>
      {/* ── Keyframe style inject ── */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes heartFloat {
          0%   { transform: translateX(var(--tx, 0px)) translateY(0)   scale(1);   opacity: 1; }
          100% { transform: translateX(var(--tx, 0px)) translateY(-80px) scale(0.5); opacity: 0; }
        }
        @keyframes slideUpIn {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes fadeSlideIn {
          from { transform: translateX(30px); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        .popup-mobile  { animation: slideUpIn 0.32s cubic-bezier(0.32,0.72,0,1) forwards; }
        .popup-desktop { animation: fadeSlideIn 0.28s cubic-bezier(0.32,0.72,0,1) forwards; }
      `}} />

      {/* ── Panel: bottom sheet mobile / sidebar desktop ── */}
      <div
        className={`
          fixed z-40 bg-white shadow-2xl overflow-hidden
          bottom-0 left-0 right-0 rounded-t-3xl
          md:bottom-auto md:top-28 md:right-6 md:left-auto md:w-[390px] md:rounded-2xl
          popup-mobile md:popup-desktop
        `}
      >
        {/* ── Drag handle (mobile) ── */}
        <div
          className="md:hidden flex justify-center pt-3 pb-1 cursor-pointer"
          onClick={onClose}
        >
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* ── Header: ảnh BĐS ── */}
        <div className="relative w-full h-44 md:h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
          {pin.imageUrl ? (
            <img
              src={pin.imageUrl}
              alt={pin.title}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          ) : (
            /* Placeholder gradient khi không có ảnh */
            <div
              className={`w-full h-full flex items-center justify-center text-5xl
                ${isCan
                  ? 'bg-gradient-to-br from-red-50 to-orange-100'
                  : 'bg-gradient-to-br from-blue-50 to-cyan-100'
                }`}
            >
              🏠
            </div>
          )}

          {/* Type badge */}
          <span
            className={`
              absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs font-black tracking-wide text-white shadow-md
              ${isCan ? 'bg-red-500' : 'bg-[#0068FF]'}
            `}
          >
            {isCan ? 'CẦN' : 'CÓ'}
          </span>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="px-5 pt-4 pb-5">
          {/* Giá + Trust badge */}
          <div className="flex items-start justify-between mb-2">
            <span className={`text-2xl font-black ${isCan ? 'text-red-500' : 'text-[#0068FF]'}`}>
              {priceStr}
            </span>
            {pin.trustScore >= 4 && (
              <span className="flex items-center gap-1 bg-blue-50 text-blue-600 text-xs font-bold px-2 py-1 rounded-lg border border-blue-100">
                <ShieldCheck size={13} /> Xác thực
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-bold text-gray-900 text-sm leading-snug mb-3 line-clamp-2">
            {pin.title}
          </h3>

          {/* Meta: ward/district + khoảng cách */}
          <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
            {(pin.ward || pin.district) && (
              <span className="flex items-center gap-1">
                <MapPin size={12} />
                {pin.ward || pin.district}
              </span>
            )}
            {pin.subcategory && (
              <span className="flex items-center gap-1">
                <Tag size={12} />
                {pin.subcategory}
              </span>
            )}
            <span className="ml-auto font-medium text-gray-400">📍 {distance}</span>
          </div>

          {/* Avatar + Người đăng */}
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 mb-4 border border-gray-100">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${pin.id}`}
              alt={pin.userName}
              className="w-9 h-9 rounded-full border-2 border-white shadow-sm bg-gray-200"
            />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-gray-800 truncate flex items-center gap-1">
                {pin.userName}
                {pin.trustScore >= 4 && <ShieldCheck size={12} className="text-blue-500 shrink-0" />}
              </div>
              <div className="text-xs text-gray-400">Người đăng</div>
            </div>
          </div>

          {/* ── Action buttons ── */}
          <div className="flex gap-2.5 relative">
            {/* Chỉ đường */}
            <a
              href={`https://maps.google.com/?q=${pin.title}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl text-sm transition-colors"
            >
              <Navigation size={15} /> Chỉ đường
            </a>

            {/* Quan tâm ❤️ */}
            <button
              id="like-btn-map"
              onClick={handleLike}
              disabled={likeState === 'loading' || likeState === 'liked'}
              className={`
                relative flex items-center justify-center gap-1.5 flex-1 font-bold py-3 rounded-xl text-sm transition-all duration-200
                ${likeState === 'liked'
                  ? 'bg-red-50 text-red-400 border border-red-200 cursor-default'
                  : isCan
                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-200 active:scale-95'
                    : 'bg-[#0068FF] hover:bg-blue-700 text-white shadow-lg shadow-blue-200 active:scale-95'
                }
              `}
            >
              {likeState === 'loading' ? (
                <Loader2 size={15} className="animate-spin" />
              ) : likeState === 'liked' ? (
                <>❤️ Đã quan tâm</>
              ) : (
                <><Heart size={15} fill="none" /> Quan tâm</>
              )}

              {/* Heart particles */}
              {showHearts && Array.from({ length: 8 }).map((_, i) => (
                <HeartParticle key={i} index={i} />
              ))}
            </button>
          </div>

          {/* Hint chưa đăng nhập */}
          {isGuest && (
            <p className="text-center text-xs text-gray-400 mt-2">
              <button
                onClick={() => requireAuth(() => { })}
                className="text-[#0068FF] hover:underline font-medium"
              >
                Đăng nhập
              </button>{' '}
              để quan tâm bài đăng này
            </p>
          )}
        </div>
      </div>

      {/* ── Backdrop (mobile) ── */}
      <div
        className="fixed inset-0 z-30 bg-black/20 md:hidden"
        onClick={onClose}
      />
    </>
  );
}
