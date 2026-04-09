'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { cn, formatDistanceToNow } from '@/lib/utils';
import { useSession } from 'next-auth/react';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
}

interface ConvInfo {
  id: string;
  intent_id: string | null;
  user_a: string;
  user_b: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  intent?: any;
}

export default function ChatRoomPage() {
  const params = useParams();
  const router = useRouter();
  const convId = params.id as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [convInfo, setConvInfo] = useState<ConvInfo | null>(null);
  const [otherPartyName, setOtherPartyName] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Load conversation + messages + current user
  useEffect(() => {
    async function load() {
      if (status === 'loading') return;
      
      try {
        if (!session?.user) { router.push('/login'); return; }
        setCurrentUserId(session.user.id);

        // Fetch messages
        const msgRes = await fetch(`/api/chat/${convId}/messages`);
        if (msgRes.ok) setMessages(await msgRes.json());

        // Fetch conversation info
        const convRes = await fetch('/api/chat/conversations');
        if (convRes.ok) {
          const convList = await convRes.json();
          const found = convList.find((c: { id: string }) => c.id === convId);
          if (found) {
            setConvInfo(found);
            setOtherPartyName(found.other_party?.name || 'Người dùng');
          }
        }
      } catch {
        // Fail silently
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [convId, router]);

  // Scroll to bottom on load + new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Poll for new messages every 3 seconds (replaces Supabase Realtime)
  useEffect(() => {
    if (!currentUserId || isLoading) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/chat/${convId}/messages`);
        if (!res.ok) return;
        const freshMessages = await res.json();
        setMessages((prev) => {
          // Only update if there are genuinely new messages
          if (freshMessages.length !== prev.length) {
            return freshMessages;
          }
          // Check if latest message differs
          const lastFresh = freshMessages[freshMessages.length - 1];
          const lastPrev = prev[prev.length - 1];
          if (lastFresh?.id !== lastPrev?.id) {
            return freshMessages;
          }
          return prev; // No change — skip re-render
        });
      } catch {
        // Polling failure is non-critical
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [convId, currentUserId, isLoading]);

  const handleSend = async () => {
    if (!inputText.trim() || isSending) return;

    const content = inputText.trim();
    setInputText('');
    setIsSending(true);

    // Optimistic update
    const optimisticMsg: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: convId,
      sender_id: currentUserId || '',
      content,
      read_at: null,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const res = await fetch(`/api/chat/${convId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (res.ok) {
        const real = await res.json();
        // Replace optimistic with real
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticMsg.id ? real : m)),
        );
      } else {
        // Rollback on error
        setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--wm-text-muted)]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] md:h-[calc(100vh-100px)]">
      {/* Header */}
      <div className="wm-panel-header shrink-0 px-3 py-2.5">
        <div className="flex items-center gap-3">
          <Link href="/can-co/chat" className="p-1 hover:bg-[var(--wm-surface-hover)] transition-colors">
            <ArrowLeft className="w-4 h-4 text-[var(--wm-text-muted)]" />
          </Link>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[var(--wm-text)] truncate">{otherPartyName}</p>
            {convInfo?.intent && (
              <Link
                href={`/can-co/intent/${convInfo.intent_id}`}
                className="text-[10px] text-[var(--wm-primary)] hover:underline truncate block"
              >
                📌 {convInfo.intent.title || convInfo.intent.raw_text?.slice(0, 40)}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-xs text-[var(--wm-text-faint)]">Bắt đầu cuộc trò chuyện!</p>
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUserId;
          return (
            <div
              key={msg.id}
              className={cn('flex', isMe ? 'justify-end' : 'justify-start')}
            >
              <div
                className={cn(
                  'max-w-[75%] px-3 py-2 text-sm leading-relaxed',
                  isMe
                    ? 'bg-[var(--wm-primary)] text-white rounded-tl-lg rounded-tr-lg rounded-bl-lg'
                    : 'bg-[var(--wm-surface)] border border-[var(--wm-border)] text-[var(--wm-text)] rounded-tl-lg rounded-tr-lg rounded-br-lg',
                )}
              >
                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                <p className={cn(
                  'text-[10px] mt-1',
                  isMe ? 'text-white/60' : 'text-[var(--wm-text-faint)]',
                )}>
                  {formatDistanceToNow(msg.created_at)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 p-3 border-t border-[var(--wm-border)] bg-[var(--wm-surface)]">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhập tin nhắn..."
            className="wm-input text-sm"
            autoFocus
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || isSending}
            className="p-2.5 bg-[var(--wm-primary)] text-white shrink-0 hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
