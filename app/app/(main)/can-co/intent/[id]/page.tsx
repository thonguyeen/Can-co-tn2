'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, MessageSquare, Loader2, Send, Handshake } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { IntentCard } from '@/components/intent/IntentCard';
import { MatchCard } from '@/components/intent/MatchCard';
import { VerifySection } from '@/components/intent/VerifySection';
import { BottomNav } from '@/components/intent/BottomNav';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import type { MockIntent } from '@/lib/mock/intents';

interface IntentDetail extends MockIntent {
  comments?: Array<{
    id: string;
    intent_id: string;
    user_id: string | null;
    content: string;
    is_bot: boolean;
    bot_name: string | null;
    created_at: string;
    user?: { name: string };
  }>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface MatchData {
  id: string;
  can_intent_id: string;
  co_intent_id: string;
  similarity: number;
  explanation: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  can_intent?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  co_intent?: any;
}

export default function RealIntentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [intent, setIntent] = useState<IntentDetail | null>(null);
  const [matches, setMatches] = useState<MatchData[]>([]);
  const { data: session } = useSession();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isChatting, setIsChatting] = useState(false);

  useEffect(() => {
    setCurrentUserId(session?.user?.id || null);
    
    async function load() {
      try {
        const [intentRes, matchRes] = await Promise.all([
          fetch(`/api/intents/${id}`),
          fetch(`/api/intents/${id}/matches`).catch(() => null),
        ]);

        if (!intentRes.ok) throw new Error('Not found');
        const data = await intentRes.json();
        setIntent(data);

        if (matchRes?.ok) {
          const matchData = await matchRes.json();
          setMatches(matchData.matches || []);
        }
      } catch {
        setIntent(null);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [id]);

  const handleSubmitComment = async () => {
    if (!commentText.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    try {
      const res = await fetch(`/api/intents/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentText }),
      });

      if (res.ok) {
        // Refresh intent data
        const refreshRes = await fetch(`/api/intents/${id}`);
        if (refreshRes.ok) {
          setIntent(await refreshRes.json());
        }
        setCommentText('');
      }
    } catch {
      // Fail silently
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="pb-20 md:pb-4 flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--wm-text-muted)]" />
      </div>
    );
  }

  if (!intent) {
    return (
      <div className="pb-20 md:pb-4">
        <div className="wm-panel p-8 text-center">
          <p className="text-sm text-[var(--wm-text-muted)]">Không tìm thấy dữ liệu</p>
          <Link href="/can-co" className="text-xs text-[var(--wm-primary)] mt-2 inline-block">
            ← Quay lại feed
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 md:pb-4 space-y-3">
      <Link
        href="/can-co"
        className="inline-flex items-center gap-1.5 text-xs text-[var(--wm-text-muted)] hover:text-[var(--wm-text)] transition-colors mb-2"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại feed</span>
      </Link>

      <IntentCard intent={intent as MockIntent} compact={false} basePath="/can-co" />

      {/* Chat CTA — only if viewing someone else's intent */}
      {currentUserId && intent.user_id !== currentUserId && (
        <button
          onClick={async () => {
            if (isChatting) return;
            setIsChatting(true);
            try {
              const res = await fetch('/api/chat/conversations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ intent_id: id, other_user_id: intent.user_id }),
              });
              if (res.ok) {
                const conv = await res.json();
                router.push(`/can-co/chat/${conv.id}`);
              }
            } catch {} finally { setIsChatting(false); }
          }}
          disabled={isChatting}
          className="w-full wm-panel p-3 flex items-center justify-center gap-2 hover:border-[var(--wm-primary)] transition-colors disabled:opacity-50"
        >
          {isChatting ? (
            <Loader2 className="w-4 h-4 animate-spin text-[var(--wm-primary)]" />
          ) : (
            <>
              <MessageSquare className="w-4 h-4 text-[var(--wm-primary)]" />
              <span className="text-sm font-semibold text-[var(--wm-primary)]">Nhắn trực tiếp</span>
            </>
          )}
        </button>
      )}

      {/* Matches Section */}
      {matches.length > 0 && (
        <div className="wm-panel">
          <div className="wm-panel-header">
            <span className="wm-panel-title flex items-center gap-1.5">
              <Handshake className="w-3.5 h-3.5" />
              Kết quả match ({matches.length})
            </span>
          </div>
          <div className="p-3 space-y-2">
            {matches.map((m) => {
              const otherIntent = intent.type === 'CAN' ? m.co_intent : m.can_intent;
              if (!otherIntent) return null;
              return (
                <MatchCard
                  key={m.id}
                  similarity={m.similarity || 0}
                  explanation={m.explanation || ''}
                  matchedIntent={otherIntent}
                  basePath="/can-co"
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Verification (owner of CÓ intent only) */}
      {currentUserId && intent.user_id === currentUserId && intent.type === 'CO' && (
        <VerifySection intentId={id} currentLevel={intent.verification_level || 'none'} />
      )}

      {/* Comments */}
      <div className="wm-panel">
        <div className="wm-panel-header">
          <span className="wm-panel-title">Bình luận ({intent.comment_count || 0})</span>
        </div>

        {intent.comments && intent.comments.length > 0 ? (
          <div className="divide-y divide-[var(--wm-border-subtle)]">
            {intent.comments.map((comment) => (
              <div key={comment.id} className={cn('p-3', comment.is_bot && 'bg-[var(--wm-overlay-subtle)]')}>
                <div className="flex items-start gap-2">
                  <div className={cn(
                    'w-7 h-7 flex items-center justify-center text-white text-[10px] font-semibold shrink-0',
                    comment.is_bot ? 'bg-[var(--wm-primary)]' : 'bg-zinc-600',
                  )}>
                    {comment.is_bot ? '🤖' : (comment.user?.name?.[0] || '?')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-xs font-semibold text-[var(--wm-text)]">
                        {comment.is_bot ? comment.bot_name : comment.user?.name || 'Người dùng'}
                      </span>
                      {comment.is_bot && (
                        <span className="wm-badge wm-badge-primary text-[7px]">AI</span>
                      )}
                      <span className="text-[10px] text-[var(--wm-text-faint)]">
                        {formatDistanceToNow(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--wm-text-secondary)] leading-relaxed">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center">
            <p className="text-xs text-[var(--wm-text-muted)]">Chưa có bình luận nào</p>
          </div>
        )}

        {/* Comment Input */}
        <div className="p-3 border-t border-[var(--wm-border)]">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
              placeholder="Viết bình luận..."
              className="wm-input text-sm"
            />
            <button
              onClick={handleSubmitComment}
              disabled={!commentText.trim() || isSubmittingComment}
              className="px-3 py-2 bg-[var(--wm-primary)] text-white text-xs font-semibold shrink-0 hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              {isSubmittingComment ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
