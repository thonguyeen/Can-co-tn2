'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MessageCircle, Loader2 } from 'lucide-react';
import { cn, formatDistanceToNow } from '@/lib/utils';
import { BottomNav } from '@/components/intent/BottomNav';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface ConversationItem {
  id: string;
  intent_id: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  intent: any;
  other_party: { id: string; name: string; avatar_url: string | null };
  last_message: { content: string; created_at: string; sender_id: string } | null;
  unread_count: number;
  last_message_at: string | null;
}

export default function ChatInboxPage() {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/chat/conversations');
        if (res.ok) {
          const data = await res.json();
          setConversations(data);
        }
      } catch {
        // Fail silently
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="pb-20 md:pb-4">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="w-5 h-5 text-[var(--wm-primary)]" />
        <h1 className="text-lg font-bold text-[var(--wm-text)]">Tin nhắn</h1>
      </div>

      {isLoading && (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--wm-text-muted)]" />
        </div>
      )}

      {!isLoading && conversations.length === 0 && (
        <div className="wm-panel p-8 text-center">
          <MessageCircle className="w-8 h-8 mx-auto mb-2 text-[var(--wm-text-faint)]" />
          <p className="text-sm text-[var(--wm-text-muted)]">Chưa có tin nhắn</p>
          <p className="text-xs text-[var(--wm-text-faint)] mt-1">Tìm nhà và bắt đầu chat!</p>
        </div>
      )}

      {!isLoading && conversations.length > 0 && (
        <div className="wm-panel divide-y divide-[var(--wm-border-subtle)]">
          {conversations.map((conv) => (
            <Link
              key={conv.id}
              href={`/can-co/chat/${conv.id}`}
              className="flex items-start gap-3 p-3 hover:bg-[var(--wm-surface-hover)] transition-colors"
            >
              {/* Avatar */}
              <div className="w-10 h-10 bg-zinc-600 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                {conv.other_party.name.split(' ').map((w) => w[0]).slice(-2).join('').toUpperCase()}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className={cn(
                    'text-sm font-semibold text-[var(--wm-text)]',
                    conv.unread_count > 0 && 'text-[var(--wm-accent)]',
                  )}>
                    {conv.other_party.name}
                  </span>
                  {conv.last_message && (
                    <span className="text-[10px] text-[var(--wm-text-faint)]">
                      {formatDistanceToNow(conv.last_message.created_at)}
                    </span>
                  )}
                </div>

                {/* Intent context */}
                {conv.intent && (
                  <div className="flex items-center gap-1 mb-0.5">
                    <span className={cn(
                      'text-[9px] font-bold px-1.5 py-0.5',
                      conv.intent.type === 'CAN'
                        ? 'bg-red-500/10 text-red-500'
                        : 'bg-emerald-500/10 text-emerald-500',
                    )}>
                      {conv.intent.type === 'CAN' ? 'CẦN' : 'CÓ'}
                    </span>
                    <span className="text-xs text-[var(--wm-text-dim)] truncate">
                      {conv.intent.title || conv.intent.raw_text?.slice(0, 40)}
                    </span>
                  </div>
                )}

                {/* Last message preview */}
                <div className="flex items-center justify-between">
                  <p className={cn(
                    'text-xs truncate',
                    conv.unread_count > 0 ? 'text-[var(--wm-text)] font-medium' : 'text-[var(--wm-text-muted)]',
                  )}>
                    {conv.last_message?.content || 'Bắt đầu cuộc trò chuyện...'}
                  </p>
                  {conv.unread_count > 0 && (
                    <span className="ml-2 shrink-0 w-5 h-5 flex items-center justify-center bg-[var(--wm-primary)] text-white text-[10px] font-bold rounded-full">
                      {conv.unread_count}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <BottomNav />
    </div>
  );
}
