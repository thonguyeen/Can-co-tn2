'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { IntentCard } from '@/components/intent/IntentCard';
import { BottomNav } from '@/components/intent/BottomNav';
import { DEMO_INTENTS } from '@/lib/mock/intents';
import { cn } from '@/lib/utils';

// Demo comments for detail view
function DemoComments({ intentId }: { intentId: string }) {
  const intent = DEMO_INTENTS.find((i) => i.id === intentId);
  if (!intent) return null;

  const comments = [
    intent.bot_comment,
    intent.latest_comment,
  ].filter(Boolean);

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
                    {comment.is_bot && (
                      <span className="wm-badge wm-badge-primary text-[7px]">AI</span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--wm-text-secondary)] leading-relaxed">{comment.content}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comment Input */}
      <div className="p-3 border-t border-[var(--wm-border)]">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Viết bình luận..."
            className="wm-input text-sm"
            disabled
          />
          <button className="px-3 py-2 bg-[var(--wm-primary)] text-white text-xs font-semibold shrink-0 hover:opacity-90 transition-opacity" disabled>
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
}

export default function IntentDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const intent = DEMO_INTENTS.find((i) => i.id === id);

  if (!intent) {
    return (
      <div className="pb-20 md:pb-4">
        <div className="wm-panel p-8 text-center">
          <p className="text-sm text-[var(--wm-text-muted)]">Không tìm thấy intent này</p>
          <Link href="/demo/can-co" className="text-xs text-[var(--wm-primary)] mt-2 inline-block">
            ← Quay lại feed
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 md:pb-4 space-y-3">
      {/* Back button */}
      <Link
        href="/demo/can-co"
        className="inline-flex items-center gap-1.5 text-xs text-[var(--wm-text-muted)] hover:text-[var(--wm-text)] transition-colors mb-2"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại feed</span>
      </Link>

      {/* Full IntentCard (not compact) */}
      <IntentCard intent={intent} compact={false} />

      {/* Chat CTA */}
      <button className="w-full wm-panel p-3 flex items-center justify-center gap-2 hover:border-[var(--wm-primary)] transition-colors">
        <MessageSquare className="w-4 h-4 text-[var(--wm-primary)]" />
        <span className="text-sm font-semibold text-[var(--wm-primary)]">Nhắn trực tiếp</span>
      </button>

      {/* Comments */}
      <DemoComments intentId={id} />

      <BottomNav />
    </div>
  );
}
