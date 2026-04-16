'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function MutualMatchPopup({
  partnerName,
  partnerAvatar,
  myAvatar,
  conversationId,
  onClose,
}: {
  partnerName: string;
  partnerAvatar?: string | null;
  myAvatar?: string | null;
  conversationId: string;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Tự động tạo vài hạt pháo giấy bằng CSS thuần (Không cài canvas-confetti)
    createConfetti();
  }, []);

  const createConfetti = () => {
    const container = document.getElementById('confetti-container');
    if (!container) return;

    const colors = ['#10b981', '#34d399', '#fcd34d', '#f87171', '#a78bfa'];
    
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'absolute w-2 h-2 md:w-3 md:h-3 rounded-full opacity-80';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      
      // Randomize position and animation properties
      const startX = Math.random() * 100;
      const startY = Math.random() * 10 + 40; // Start slightly above middle
      const duration = Math.random() * 2 + 1.5;
      const delay = Math.random() * 0.5;
      const roation = Math.random() * 360;
      
      confetti.style.left = `${startX}%`;
      confetti.style.top = `${startY}%`;
      // We will define this keyframe in a global css or inline style block below
      confetti.style.animation = `confetti-fall ${duration}s ease-out ${delay}s forwards`;
      confetti.style.transform = `rotate(${roation}deg)`;
      
      container.appendChild(confetti);
    }
  };

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm px-4">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes confetti-fall {
          0% { transform: translateY(0) scale(1) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) scale(0.5) rotate(720deg); opacity: 0; }
        }
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.3); }
        }
      `}} />
      
      <div id="confetti-container" className="absolute inset-0 overflow-hidden pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        className="relative w-full max-w-sm bg-gradient-to-b from-slate-900 to-slate-800 rounded-3xl border border-emerald-500/30 p-8 shadow-[0_0_50px_rgba(16,185,129,0.2)] text-center overflow-hidden"
      >
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-emerald-500/20 blur-3xl rounded-full" />

        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 mb-2">
            KHỚP ĐÔI! 🎉
          </h2>
          <p className="text-emerald-400/80 text-sm font-medium mb-8">
            Bạn và {partnerName} đã cùng quan tâm
          </p>
        </motion.div>

        {/* Avatars */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="w-20 h-20 rounded-full border-4 border-slate-800 shadow-lg overflow-hidden relative bg-slate-700"
          >
            {myAvatar ? (
               <img src={myAvatar} alt="Me" className="w-full h-full object-cover" />
            ) : (
               <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-2xl">M</div>
            )}
           
          </motion.div>
          
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, type: 'spring' }}
            className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center border-2 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.4)] z-10"
            style={{ animation: 'heartbeat 1.5s ease-in-out infinite' }}
          >
            <span className="text-xl">❤️</span>
          </motion.div>

          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="w-20 h-20 rounded-full border-4 border-slate-800 shadow-lg overflow-hidden relative bg-slate-700"
          >
            {partnerAvatar ? (
               <img src={partnerAvatar} alt={partnerName} className="w-full h-full object-cover" />
            ) : (
               <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-2xl">{partnerName.charAt(0)}</div>
            )}
          </motion.div>
        </div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-slate-300 mb-8"
        >
          Đừng để cơ hội vụt mất, hãy bắt đầu thỏa thuận ngay bây giờ!
        </motion.p>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex flex-col gap-3"
        >
          <a 
            href={`/can-co/chat/${conversationId}`}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3.5 px-4 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-colors flex items-center justify-center gap-2"
          >
            <span>💬</span> Vào Phòng Chat Ngay
          </a>
          <button 
            onClick={onClose}
            className="w-full bg-slate-800/50 hover:bg-slate-700 text-slate-300 font-medium py-3 px-4 rounded-xl transition-colors border border-slate-700"
          >
            Tiếp tục vuốt
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
