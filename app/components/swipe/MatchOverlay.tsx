'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Sparkles, ArrowRight } from 'lucide-react';
import { type MockIntent } from '@/lib/mock/intents';

interface MatchOverlayProps {
  intent: MockIntent;
  onContinue: () => void;
  onChat: () => void;
}

export default function MatchOverlay({ intent, onContinue, onChat }: MatchOverlayProps) {
  // Auto-dismiss after 8 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onContinue();
    }, 8000);
    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Background particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-white/30"
              initial={{
                x: `${50 + (Math.random() - 0.5) * 20}%`,
                y: '110%',
                scale: Math.random() * 0.5 + 0.5,
              }}
              animate={{
                y: '-10%',
                x: `${50 + (Math.random() - 0.5) * 60}%`,
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                delay: Math.random() * 1.5,
                repeat: Infinity,
                repeatDelay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* MATCH! Text */}
        <motion.div
          className="relative z-10 mb-8"
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.2 }}
        >
          <div className="flex items-center gap-3">
            <Sparkles className="w-10 h-10 text-yellow-300" />
            <h1 className="text-6xl md:text-7xl font-black text-white tracking-tighter drop-shadow-2xl">
              MATCH!
            </h1>
            <Sparkles className="w-10 h-10 text-yellow-300" />
          </div>
          <motion.p
            className="text-center text-white/80 text-sm font-medium mt-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            Bạn quan tâm đến tin đăng này!
          </motion.p>
        </motion.div>

        {/* Intent Preview */}
        <motion.div
          className="relative z-10 w-[85vw] max-w-[340px] bg-white/15 backdrop-blur-xl rounded-3xl p-5 border border-white/20 mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 bg-white/20">
              <img
                src={intent.images?.[0]?.url || (intent.type === 'CO'
                  ? 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=200&q=60'
                  : 'https://images.unsplash.com/photo-1628611225249-6c3c7c689552?w=200&q=60')}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <span className={`text-[10px] uppercase font-bold tracking-wider ${intent.type === 'CAN' ? 'text-red-300' : 'text-emerald-300'}`}>
                {intent.type === 'CAN' ? 'CẦN MUA' : 'ĐANG BÁN'}
              </span>
              <h3 className="text-white font-bold text-sm line-clamp-2 leading-tight mt-0.5">
                {intent.title || intent.raw_text?.slice(0, 50)}
              </h3>
              <p className="text-white/60 text-xs mt-1 font-medium">
                {intent.price?.toLocaleString('vi-VN') || intent.price_min?.toLocaleString('vi-VN') || 'Thỏa thuận'} đ
              </p>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="relative z-10 flex flex-col gap-3 w-[85vw] max-w-[340px]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <button
            onClick={onChat}
            className="w-full py-4 bg-white text-indigo-600 font-bold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-xl hover:bg-indigo-50 transition-colors active:scale-[0.98]"
          >
            <MessageCircle className="w-5 h-5" />
            Vào phòng đàm phán
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onContinue}
            className="w-full py-3 bg-white/15 backdrop-blur text-white font-semibold text-sm rounded-2xl border border-white/20 hover:bg-white/25 transition-colors active:scale-[0.98]"
          >
            Tiếp tục lướt
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
