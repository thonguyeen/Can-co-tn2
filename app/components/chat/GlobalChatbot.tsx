'use client';

import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import ChatPanel from '@/components/chat/ChatPanel';
import { useChat } from '@/hooks/useChat';

export default function GlobalChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, isTyping, scrollRef, sendMessage, scrollToBottom } = useChat();

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    scrollToBottom();
  }, [scrollToBottom]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <>
      {/* ── CHAT PANEL ── */}
      <AnimatePresence>
        {isOpen && (
          <ChatPanel
            messages={messages}
            isTyping={isTyping}
            scrollRef={scrollRef}
            onSend={sendMessage}
            onClose={handleClose}
          />
        )}
      </AnimatePresence>

      {/* ── FAB BUTTON ── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            onClick={handleOpen}
            className="fixed z-[51] bottom-20 md:bottom-6 right-4 md:right-6 w-14 h-14 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-110 transition-all active:scale-95 group"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            aria-label="Mở trợ lý AI"
          >
            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-full">
              <span className="absolute inset-[-4px] rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 opacity-40 animate-ping" />
            </span>

            <MessageCircle className="w-6 h-6 relative z-10 group-hover:rotate-12 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
