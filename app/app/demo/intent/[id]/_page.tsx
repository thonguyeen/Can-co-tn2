'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MessageSquare, Pencil } from 'lucide-react';
import { IntentCard } from '@/components/intent/IntentCard';
import { ComposeIntent } from '@/components/intent/ComposeIntent';
import { PredictionCard } from '@/components/intent/PredictionCard';
import { BottomNav } from '@/components/intent/BottomNav';
import { GENERATED_INTENTS } from '@/lib/mock/intent-generator';
import { CRAWLED_INTENTS } from '@/lib/mock/crawled-listings';
import { DEMO_PREDICTIONS } from '@/lib/mock/predictions';

const ALL_INTENTS = [...GENERATED_INTENTS, ...CRAWLED_INTENTS];
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { MockIntent } from '@/lib/mock/intents';
import { useSession } from 'next-auth/react';

function DemoComments({ intent }: { intent: MockIntent }) {
  if (!intent) return null;

  const comments = [intent.bot_comment, intent.latest_comment].filter(Boolean);

  if (comments.length === 0) {
    return (
      <div className="wm-panel p-4 text-center">
        <p className="text-xs text-[var(--wm-text-muted)]">Chưa có bình luận nào</p>
      </div>
    );
  }

  return (
    <div className="wm-panel">
      <div className="wm-panel-header">
        <span className="wm-panel-title">Bình luận ({intent.comment_count})</span>
      </div>
      <div className="divide-y divide-[var(--wm-border-subtle)]">
        {comments.map((comment) => {
          if (!comment) return null;
          return (
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
                      {comment.is_bot ? comment.bot_name : comment.user?.name}
                    </span>
                    {comment.is_bot && <span className="wm-badge wm-badge-primary text-[7px]">AI</span>}
                  </div>
                  <p className="text-sm text-[var(--wm-text-secondary)] leading-relaxed">{comment.content}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="p-3 border-t border-[var(--wm-border)]">
        <div className="flex items-center gap-2">
          <input type="text" placeholder="Viết bình luận..." className="wm-input text-sm" disabled />
          <button className="px-3 py-2 bg-[var(--wm-primary)] text-white text-xs font-semibold shrink-0" disabled>Gửi</button>
        </div>
      </div>
    </div>
  );
}

export default function IntentDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [intent, setIntent] = useState<MockIntent | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Get current user
  useEffect(() => {
    setCurrentUserId(session?.user?.id || null);
  }, [session]);

  // Fetch intent
  const fetchIntent = async () => {
    // 1. Try mock first
    const mockFound = ALL_INTENTS.find((i) => i.id === id);
    if (mockFound) {
      setIntent(mockFound);
      setLoading(false);
      return;
    }

    // 2. Fetch from DB if not mock
    try {
      const res = await fetch(`/api/intents?id=${id}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      if (data.intents && data.intents.length > 0) {
        setIntent(data.intents[0]);
      }
    } catch (err) {
      console.error('Fetch intent error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntent();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const isOwner = currentUserId && intent && intent.user_id === currentUserId;

  const handleEditComplete = async () => {
    // Re-fetch to get full enriched data (with user, bot_comments, etc.)
    setIsEditing(false);
    setLoading(true);
    try {
      const res = await fetch(`/api/intents?id=${id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.intents && data.intents.length > 0) {
          setIntent(data.intents[0]);
        }
      }
    } catch {
      // Keep existing data
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="pb-20 md:pb-4 flex justify-center items-center h-40">
        <span className="text-[var(--wm-text-muted)] text-sm">Đang tải...</span>
      </div>
    );
  }

  if (!intent) {
    return (
      <div className="pb-20 md:pb-4">
        <div className="wm-panel p-8 text-center">
          <p className="text-sm text-[var(--wm-text-muted)]">Không tìm thấy intent này</p>
          <Link href="/demo" className="text-xs text-[var(--wm-primary)] mt-2 inline-block">← Quay lại feed</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 md:pb-4 space-y-3">
      <div className="flex items-center justify-between mb-2">
        <Link href="/demo" className="inline-flex items-center gap-1.5 text-xs text-[var(--wm-text-muted)] hover:text-[var(--wm-text)] transition-colors">
          <ArrowLeft className="w-4 h-4" /><span>Quay lại feed</span>
        </Link>
        {isOwner && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--wm-primary)] border border-[var(--wm-primary)]/30 hover:bg-[var(--wm-primary)]/10 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            Sửa bài
          </button>
        )}
      </div>

      {isEditing ? (
        <ComposeIntent
          mode="real"
          editIntent={intent}
          onEditComplete={handleEditComplete}
          onCancelEdit={() => setIsEditing(false)}
        />
      ) : (
        <IntentCard intent={intent} compact={false} basePath="/demo" />
      )}

      {!isEditing && (
        <>
          <DemoComments intent={intent} />
          {DEMO_PREDICTIONS[id] && <PredictionCard prediction={DEMO_PREDICTIONS[id]} />}
          {/* Sticky CTA */}
          <div className="fixed bottom-14 md:bottom-4 left-0 right-0 z-40 px-3 md:hidden">
            <button className="w-full p-3 flex items-center justify-center gap-2 bg-[var(--wm-primary)] text-white font-semibold text-sm shadow-lg">
              <MessageSquare className="w-4 h-4" />
              Nhắn trực tiếp
            </button>
          </div>
          {/* Desktop CTA */}
          <button className="hidden md:flex w-full wm-panel p-3 items-center justify-center gap-2 hover:border-[var(--wm-primary)] transition-colors">
            <MessageSquare className="w-4 h-4 text-[var(--wm-primary)]" />
            <span className="text-sm font-semibold text-[var(--wm-primary)]">Nhắn trực tiếp</span>
          </button>
        </>
      )}
      <BottomNav />
    </div>
  );
}
