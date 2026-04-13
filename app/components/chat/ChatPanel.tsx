'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, Sparkles, BarChart2, Loader2 } from 'lucide-react';
import { type ChatMessage } from '@/hooks/useChat';

interface ChatPanelProps {
  messages: ChatMessage[];
  isTyping: boolean;
  isLoadingHistory: boolean;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  onSend: (text: string) => void;
  onClose: () => void;
}

const QUICK_SUGGESTIONS = [
  { label: '💰 Giá nhà Q7?', text: 'Giá nhà Quận 7 hiện tại bao nhiêu?' },
  { label: '🏠 Tìm nhà 3 tỷ', text: 'Tìm nhà giá khoảng 3 tỷ' },
  { label: '📈 Xu hướng BĐS', text: 'Xu hướng thị trường BĐS hiện tại?' },
];

export default function ChatPanel({
  messages,
  isTyping,
  isLoadingHistory,
  scrollRef,
  onSend,
  onClose,
}: ChatPanelProps) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSend(input);
    setInput('');
  };

  // Simple markdown renderer: **bold**, \n → <br>
  const renderText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>;
      }
      return part.split('\n').map((line, j) => (
        <span key={`${i}-${j}`}>
          {j > 0 && <br />}
          {line}
        </span>
      ));
    });
  };

  // Group history vs new messages
  const historyMessages = messages.filter((m) => m.fromHistory);
  const hasHistory = historyMessages.length > 0;

  return (
    <motion.div
      className="fixed z-[52] bottom-24 right-4 md:right-6 top-4 w-[calc(100vw-2rem)] md:w-[380px] md:top-auto md:max-h-[calc(100vh-7rem)] bg-white rounded-3xl shadow-2xl shadow-indigo-500/10 border border-slate-100 flex flex-col overflow-hidden"
      initial={{ opacity: 0, scale: 0.85, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      style={{ transformOrigin: 'bottom right' }}
    >
      {/* ── HEADER ── */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-indigo-600 to-purple-600 text-white shrink-0">
        <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold">NHA.AI Assistant</h3>
          <p className="text-[10px] text-indigo-200 font-medium flex items-center gap-1">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
            </span>
            Online
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
          aria-label="Đóng chat"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ── MESSAGES ── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 custom-scrollbar">

        {/* History loading skeleton */}
        <AnimatePresence>
          {isLoadingHistory && (
            <motion.div
              className="flex items-center gap-2 text-slate-400 text-xs py-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Đang tải lịch sử chat...</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* History divider */}
        {hasHistory && !isLoadingHistory && (
          <div className="flex items-center gap-2 py-1">
            <div className="h-px flex-1 bg-slate-100" />
            <span className="text-[10px] text-slate-400 font-medium shrink-0">Lịch sử</span>
            <div className="h-px flex-1 bg-slate-100" />
          </div>
        )}

        {messages.map((msg, idx) => (
          <motion.div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            initial={idx > 0 && !msg.fromHistory ? { opacity: 0, x: msg.role === 'user' ? 20 : -20 } : false}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {msg.role === 'bot' && (
              <div className="w-7 h-7 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 mr-2 mt-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              </div>
            )}
            <div className="flex flex-col gap-1 max-w-[80%]">
              {/* History divider after last history msg */}
              {msg.fromHistory && idx === historyMessages.length - 1 && (
                <div className="flex items-center gap-2 my-1">
                  <div className="h-px flex-1 bg-slate-100" />
                  <span className="text-[10px] text-slate-400 font-medium shrink-0">Hôm nay</span>
                  <div className="h-px flex-1 bg-slate-100" />
                </div>
              )}
              <div
                className={`px-4 py-2.5 text-[13px] leading-relaxed transition-opacity ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-2xl rounded-br-md'
                    : 'bg-slate-100 text-slate-700 rounded-2xl rounded-bl-md'
                } ${msg.fromHistory ? 'opacity-70' : 'opacity-100'}`}
              >
                {renderText(msg.text)}
                <div className={`text-[9px] mt-1.5 ${msg.role === 'user' ? 'text-indigo-200' : 'text-slate-400'}`}>
                  {msg.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  {msg.fromHistory && ' · đã lưu'}
                </div>
              </div>

              {/* Market context badge */}
              {msg.role === 'bot' && msg.hasMarketContext && (
                <div className="flex items-center gap-1 ml-1">
                  <BarChart2 className="w-3 h-3 text-emerald-500" />
                  <span className="text-[9px] text-emerald-600 font-semibold">Dữ liệu thực</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            className="flex items-end gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-7 h-7 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            </div>
            <div className="bg-slate-100 px-4 py-3 rounded-2xl rounded-bl-md flex items-center gap-1.5">
              {[0, 0.15, 0.3].map((delay, i) => (
                <motion.span
                  key={i}
                  className="w-2 h-2 bg-slate-400 rounded-full"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* ── INPUT BAR ── */}
      <div className="shrink-0 border-t border-slate-100 bg-white px-4 pt-3 pb-2">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Hỏi gì đó..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 shrink-0"
            aria-label="Gửi"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Quick suggestions */}
        <div className="flex gap-1.5 mt-2 pb-1 overflow-x-auto hide-scrollbar">
          {QUICK_SUGGESTIONS.map((s) => (
            <button
              key={s.label}
              onClick={() => onSend(s.text)}
              className="shrink-0 text-[11px] font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-full border border-indigo-100 transition-colors active:scale-95"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
