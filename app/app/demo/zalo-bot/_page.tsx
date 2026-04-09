'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  quick_replies?: string[];
}

export default function ZaloBotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'bot',
      content: 'Xin chào! 👋 Tôi là trợ lý CẦN & CÓ.\n\nBạn đang tìm gì? Hoặc bạn có gì muốn đăng?',
      quick_replies: ['Tìm căn hộ Q7', 'Tìm nhà Gò Vấp', 'Tôi muốn bán', 'Xem thị trường'],
    },
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || isSending) return;

    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsSending(true);

    try {
      const res = await fetch('/api/bot/zalo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim() }),
      });
      const data = await res.json();

      const botMsg: Message = {
        id: `b-${Date.now()}`,
        role: 'bot',
        content: data.reply,
        quick_replies: data.quick_replies,
      };

      // Slight delay for realism
      await new Promise((r) => setTimeout(r, 600));
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [...prev, { id: `err-${Date.now()}`, role: 'bot', content: 'Xin lỗi, đã xảy ra lỗi. Thử lại nhé!' }]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-lg mx-auto">
      {/* Header — Zalo-style green */}
      <div className="shrink-0 px-4 py-3 flex items-center gap-3" style={{ background: '#0068FF' }}>
        <Link href="/demo" className="text-white">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-white text-sm font-bold">C&C</div>
        <div>
          <p className="text-white text-sm font-semibold">CẦN & CÓ Bot</p>
          <p className="text-white/70 text-[10px]">Trợ lý tìm nhà AI</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#e5e5ea]/10">
        {messages.map((msg) => (
          <div key={msg.id}>
            <div className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
              <div
                className={cn(
                  'max-w-[80%] px-3 py-2 text-sm leading-relaxed whitespace-pre-line',
                  msg.role === 'user'
                    ? 'bg-[#0068FF] text-white rounded-2xl rounded-br-sm'
                    : 'bg-[var(--wm-surface)] border border-[var(--wm-border)] text-[var(--wm-text)] rounded-2xl rounded-bl-sm',
                )}
              >
                {msg.content}
              </div>
            </div>
            {/* Quick replies */}
            {msg.role === 'bot' && msg.quick_replies && (
              <div className="flex flex-wrap gap-1.5 mt-2 ml-1">
                {msg.quick_replies.map((qr) => (
                  <button
                    key={qr}
                    onClick={() => send(qr)}
                    disabled={isSending}
                    className="px-3 py-1.5 text-xs font-medium border border-[#0068FF] text-[#0068FF] rounded-full hover:bg-[#0068FF]/10 transition-colors disabled:opacity-50"
                  >
                    {qr}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        {isSending && (
          <div className="flex justify-start">
            <div className="bg-[var(--wm-surface)] border border-[var(--wm-border)] rounded-2xl rounded-bl-sm px-4 py-2">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-[var(--wm-text-faint)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-[var(--wm-text-faint)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-[var(--wm-text-faint)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 p-3 border-t border-[var(--wm-border)] bg-[var(--wm-surface)] flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send(input)}
          placeholder="Nhập tin nhắn..."
          className="flex-1 bg-[var(--wm-input-bg)] border border-[var(--wm-border)] rounded-full px-4 py-2 text-sm outline-none focus:border-[#0068FF]"
          disabled={isSending}
        />
        <button
          onClick={() => send(input)}
          disabled={!input.trim() || isSending}
          className="w-9 h-9 flex items-center justify-center bg-[#0068FF] text-white rounded-full disabled:opacity-40 shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
