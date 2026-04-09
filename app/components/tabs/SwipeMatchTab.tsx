'use client';

import { useState, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Star, Heart, Loader2, RefreshCw, Flame } from 'lucide-react';
import SwipeCard from '@/components/swipe/SwipeCard';
import MatchOverlay from '@/components/swipe/MatchOverlay';
import { useFeedData } from '@/hooks/useFeedData';
import { type MockIntent } from '@/lib/mock/intents';

interface SwipeMatchTabProps {
  onNavigateToChat: (intentId: string) => void;
}

export default function SwipeMatchTab({ onNavigateToChat }: SwipeMatchTabProps) {
  const { intents, isLoading, apiError } = useFeedData();
  const [swipedIds, setSwipedIds] = useState<Set<string>>(new Set());
  const [matchedIntent, setMatchedIntent] = useState<MockIntent | null>(null);
  const [exitingCard, setExitingCard] = useState<{ id: string; direction: 'left' | 'right' } | null>(null);

  const remainingCards = useMemo(
    () => intents.filter((i) => !swipedIds.has(i.id)),
    [intents, swipedIds]
  );

  // Show top 3 cards for the stack
  const visibleCards = remainingCards.slice(0, 3);

  const handleSwipe = useCallback(async (direction: 'left' | 'right') => {
    const topCard = visibleCards[0];
    if (!topCard) return;

    // Mark as exiting for animation
    setExitingCard({ id: topCard.id, direction });

    // Small delay for exit animation
    setTimeout(() => {
      setSwipedIds((prev) => new Set(prev).add(topCard.id));
      setExitingCard(null);

      if (direction === 'right') {
        // Call interest API
        if (!topCard.id.startsWith('i-')) {
          fetch('/api/intents/interest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: topCard.id, increment: true }),
          }).catch(() => {});
        }

        // Random match chance (50% for MVP)
        if (Math.random() > 0.5) {
          setMatchedIntent(topCard);
        }
      }
    }, 300);
  }, [visibleCards]);

  const handleButtonSwipe = useCallback((direction: 'left' | 'right') => {
    handleSwipe(direction);
  }, [handleSwipe]);

  const handleSuperLike = useCallback(() => {
    handleSwipe('right');
  }, [handleSwipe]);

  const handleReset = useCallback(() => {
    setSwipedIds(new Set());
  }, []);

  const handleCloseMatch = useCallback(() => {
    setMatchedIntent(null);
  }, []);

  const handleGoToChat = useCallback(() => {
    if (matchedIntent) {
      onNavigateToChat(matchedIntent.id);
      setMatchedIntent(null);
    }
  }, [matchedIntent, onNavigateToChat]);

  // ─── LOADING STATE ───
  if (isLoading && intents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-slate-400 font-medium text-sm">Đang tải tin đăng...</p>
      </div>
    );
  }

  // ─── ERROR STATE ───
  if (apiError) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 px-6">
        <div className="text-4xl">😵</div>
        <p className="text-red-500 font-medium text-sm text-center">{apiError}</p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center h-full overflow-hidden bg-gradient-to-b from-slate-50 to-slate-100">
      {/* ── HEADER ── */}
      <div className="w-full px-6 pt-5 pb-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <Flame className="w-6 h-6 text-amber-500 fill-amber-500" />
          <h1 className="text-xl font-black text-slate-800 tracking-tight">Khớp Nhanh</h1>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
          <span className="bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full font-bold">
            {remainingCards.length} tin
          </span>
        </div>
      </div>

      {/* ── CARD STACK ── */}
      <div className="flex-1 relative w-full flex items-center justify-center">
        {visibleCards.length > 0 ? (
          <>
            {/* Render bottom-to-top so top card is last (highest z-index) */}
            {[...visibleCards].reverse().map((intent, reverseIdx) => {
              const stackIndex = visibleCards.length - 1 - reverseIdx;
              const isExiting = exitingCard?.id === intent.id;

              return isExiting ? (
                <motion.div
                  key={intent.id}
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ zIndex: 40 }}
                  initial={{ x: 0, opacity: 1, rotate: 0 }}
                  animate={{
                    x: exitingCard.direction === 'right' ? 600 : -600,
                    opacity: 0,
                    rotate: exitingCard.direction === 'right' ? 25 : -25,
                  }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                >
                  <div className="w-[85vw] max-w-[370px] h-[65vh] max-h-[520px] rounded-[28px] bg-white shadow-2xl" />
                </motion.div>
              ) : (
                <SwipeCard
                  key={intent.id}
                  intent={intent}
                  isTop={stackIndex === 0 && !exitingCard}
                  stackIndex={exitingCard ? Math.max(0, stackIndex - 1) : stackIndex}
                  onSwipe={handleSwipe}
                />
              );
            })}
          </>
        ) : (
          /* ── EMPTY STATE ── */
          <motion.div
            className="flex flex-col items-center justify-center gap-5 px-8 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 20 }}
          >
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center">
              <Heart className="w-10 h-10 text-slate-300" />
            </div>
            <h2 className="text-xl font-bold text-slate-700">Đã duyệt hết tin!</h2>
            <p className="text-sm text-slate-400 max-w-[260px]">
              Bạn đã lướt qua tất cả tin đăng hiện có. Quay lại sau hoặc tải lại nhé!
            </p>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold text-sm rounded-2xl shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-colors active:scale-[0.97]"
            >
              <RefreshCw className="w-4 h-4" />
              Xem lại từ đầu
            </button>
          </motion.div>
        )}
      </div>

      {/* ── ACTION BUTTONS ── */}
      {visibleCards.length > 0 && (
        <div className="w-full flex items-center justify-center gap-5 py-5 pb-6 z-10">
          {/* NOPE */}
          <button
            onClick={() => handleButtonSwipe('left')}
            className="w-16 h-16 rounded-full bg-white border-2 border-red-200 flex items-center justify-center shadow-lg shadow-red-500/10 hover:bg-red-50 hover:border-red-400 hover:scale-110 transition-all active:scale-95"
          >
            <X className="w-7 h-7 text-red-500" />
          </button>

          {/* SUPER LIKE */}
          <button
            onClick={handleSuperLike}
            className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30 hover:scale-110 transition-all active:scale-95"
          >
            <Star className="w-6 h-6 text-white fill-white" />
          </button>

          {/* LIKE */}
          <button
            onClick={() => handleButtonSwipe('right')}
            className="w-16 h-16 rounded-full bg-white border-2 border-emerald-200 flex items-center justify-center shadow-lg shadow-emerald-500/10 hover:bg-emerald-50 hover:border-emerald-400 hover:scale-110 transition-all active:scale-95"
          >
            <Heart className="w-7 h-7 text-emerald-500" />
          </button>
        </div>
      )}

      {/* ── MATCH OVERLAY ── */}
      <AnimatePresence>
        {matchedIntent && (
          <MatchOverlay
            intent={matchedIntent}
            onContinue={handleCloseMatch}
            onChat={handleGoToChat}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
