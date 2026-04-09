'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { MessageCircle, Handshake, Eye, ThumbsUp, Bookmark } from 'lucide-react';
import { cn, formatDistanceToNow } from '@/lib/utils';
import { formatPrice, formatPriceRange, getIntentTypeInfo, parsedDataToTags, getVerificationInfo } from '@/lib/intent-utils';
import { useSaved } from '@/lib/saved-context';
import { BotComment } from '@/components/intent/BotComment';
import type { MockIntent } from '@/lib/mock/intents';

interface IntentCardProps {
  intent: MockIntent;
  compact?: boolean;
  basePath?: string;
}

function UserAvatar({ name, verificationLevel }: { name: string; verificationLevel: string }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(-2)
    .join('')
    .toUpperCase();

  const colors: Record<string, string> = {
    verified: 'bg-emerald-600',
    kyc: 'bg-blue-600',
    none: 'bg-zinc-500',
  };

  return (
    <div
      className={cn(
        'w-10 h-10 flex items-center justify-center text-white text-sm font-semibold shrink-0',
        colors[verificationLevel] || 'bg-zinc-500',
      )}
    >
      {initials}
    </div>
  );
}

function ImageGrid({ images }: { images: { id: string; url: string }[] }) {
  if (images.length === 0) return null;

  const show = images.slice(0, 4);
  const remaining = images.length - 4;

  if (show.length === 1) {
    return (
      <div className="relative aspect-video overflow-hidden border border-[var(--wm-border)]">
        <Image src={show[0].url} alt="" fill className="object-cover" unoptimized />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-[2px] overflow-hidden border border-[var(--wm-border)]">
      {show.map((img, i) => (
        <div key={img.id} className="relative aspect-video">
          <Image src={img.url} alt="" fill className="object-cover" unoptimized />
          {i === 3 && remaining > 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white text-lg font-semibold">+{remaining}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function IntentCard({ intent, compact = true, basePath = '/demo/can-co' }: IntentCardProps) {
  const typeInfo = getIntentTypeInfo(intent.type);
  const verInfo = getVerificationInfo(intent.user.verification_level);
  const isCrawled = !!(intent.parsed_data as Record<string, unknown>)?.source;
  const [localInterested, setLocalInterested] = useState(false);
  const interestCount = (intent.reactions?.interested || 0) + (localInterested ? 1 : 0);
  const tags = parsedDataToTags(intent.parsed_data, {
    price: intent.price,
    priceMin: intent.price_min,
    priceMax: intent.price_max,
  });

  const priceDisplay = intent.price
    ? formatPrice(intent.price)
    : formatPriceRange(intent.price_min, intent.price_max);

  const handleToggleInterest = async () => {
    const nextState = !localInterested;
    setLocalInterested(nextState);
    if (!intent.id.startsWith('i-')) {
      // It's a real Postgres UUID!
      try {
        await fetch('/api/intents/interest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: intent.id, increment: nextState })
        });
      } catch (e) {
        console.error('Failed to toggle interest', e);
      }
    }
  };

  const cardContent = (
    <div className={cn(
      "wm-panel transition-all hover:border-[var(--wm-border-strong)]",
      intent.is_bot && "border-teal-500/20 bg-teal-500/[0.02]"
    )}>
      {/* Header: User + Type Badge */}
      <div className="p-3 pb-0">
        <div className="flex items-start gap-3">
          {intent.is_bot ? (
            <div 
              className="w-10 h-10 flex items-center justify-center text-white text-lg shrink-0 shadow-[0_0_10px_rgba(20,184,166,0.3)] border border-teal-500/50"
              style={{ backgroundColor: (intent.user as any)?.bot_color || '#0e7490' }}
            >
              🤖
            </div>
          ) : (
            <UserAvatar name={intent.user.name} verificationLevel={intent.user.verification_level} />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm text-[var(--wm-text)]">{intent.user.name}</span>
              {intent.is_bot && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-400 font-bold border border-teal-500/30 tracking-widest shrink-0 shadow-[0_0_8px_rgba(20,184,166,0.15)]">
                  BOT TỰ ĐỘNG
                </span>
              )}
              <span className="text-xs text-[var(--wm-text-faint)]">·</span>
              <span className="text-xs text-[var(--wm-text-muted)]">
                {(() => {
                  const isEdited = intent.updated_at && (new Date(intent.updated_at).getTime() - new Date(intent.created_at).getTime()) > 60_000;
                  return isEdited
                    ? <>{formatDistanceToNow(intent.updated_at)} <span className="text-[var(--wm-text-faint)] italic">(đã chỉnh sửa)</span></>
                    : formatDistanceToNow(intent.created_at);
                })()}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              {isCrawled && <span className="wm-badge text-[10px]" style={{ background: 'rgba(14,116,144,0.15)', color: '#0e7490', border: '1px solid rgba(14,116,144,0.25)' }}>📡 Nguồn ngoài</span>}
              <span className={cn('wm-badge text-[10px]', verInfo.className)}>{verInfo.label}</span>
              <span className={typeInfo.bgClass}>{typeInfo.label}</span>
            </div>
          </div>
          {/* Price display */}
          {priceDisplay && (
            <div className="text-right shrink-0">
              <span className="tabular-nums font-bold text-sm text-[var(--wm-text)]">{priceDisplay}</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-3 pt-2 pb-2">
        {!!intent.title && (
          <h3 className="font-semibold text-[15px] text-[var(--wm-text)] leading-snug mb-1">{String(intent.title)}</h3>
        )}
        <p className={cn(
          'text-sm text-[var(--wm-text-secondary)] leading-relaxed',
          compact && 'line-clamp-3',
        )}>
          {String(intent.raw_text || '')}
        </p>
      </div>

      {/* Images (CÓ only) */}
      {intent.images.length > 0 && (
        <div className="px-3 pb-2">
          <ImageGrid images={intent.images} />
        </div>
      )}

      {/* Source Citation (Nguồn ngoài only) */}
      {isCrawled && !!(intent.parsed_data as Record<string, unknown>)?.original_url && (
        <div className="px-3 pb-2">
          <div className="flex items-center gap-2 text-xs rounded-md px-2.5 py-1.5" style={{ background: 'rgba(14,116,144,0.08)', border: '1px solid rgba(14,116,144,0.15)' }}>
            <span className="text-[var(--wm-text-muted)]">📰</span>
            <span className="text-[var(--wm-text-muted)]">Nguồn:</span>
            <span className="text-cyan-500 font-medium">{(intent.parsed_data as Record<string, unknown>)?.source_name as string || 'Bên ngoài'}</span>
            <span className="text-[var(--wm-text-faint)]">·</span>
            <span
              className="text-cyan-500 hover:text-cyan-400 hover:underline transition-colors cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.open((intent.parsed_data as Record<string, unknown>)?.original_url as string, '_blank', 'noopener,noreferrer');
              }}
            >
              Xem bài gốc ↗
            </span>
            {!!(intent.parsed_data as Record<string, unknown>)?.source_dead && (
              <span className="ml-auto text-amber-500 text-[10px]">⚠️ Nguồn có thể đã gỡ</span>
            )}
          </div>
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="px-3 pb-2 flex flex-wrap gap-1">
          {tags.map((tag, i) => (
            <span key={i} className="wm-badge text-[9px] font-medium" style={{ background: 'var(--wm-overlay-subtle)', color: 'var(--wm-text-dim)', border: '1px solid var(--wm-border)' }}>
              {tag.icon} {tag.label}
            </span>
          ))}
        </div>
      )}


      {/* Reactions + Metrics */}
      <div className="px-3 pb-2 flex items-center gap-3 text-xs text-[var(--wm-text-muted)] flex-wrap">
        {interestCount > 0 && (
          <span className="flex items-center gap-1">👍 {interestCount}</span>
        )}
        {(intent.reactions?.fair_price || 0) > 0 && (
          <span className="flex items-center gap-1">💰 {intent.reactions!.fair_price}</span>
        )}
        {(intent.reactions?.hot || 0) > 0 && (
          <span className="flex items-center gap-1">🔥 {intent.reactions!.hot}</span>
        )}
        <span className="flex items-center gap-1">
          <MessageCircle className="w-3.5 h-3.5" />
          {intent.comment_count}
        </span>
        <span className="flex items-center gap-1">
          <Handshake className="w-3.5 h-3.5" />
          {intent.match_count}
        </span>
        <span className="flex items-center gap-1">
          <Eye className="w-3.5 h-3.5" />
          {intent.view_count}
        </span>
      </div>

      {/* Bot Comments (multi-bot) */}
      {(intent.bot_comments && intent.bot_comments.length > 0) ? (
        <div className="mx-3 mb-2 space-y-0.5">
          {(compact ? intent.bot_comments.slice(0, 2) : intent.bot_comments).map((bc) => (
            <BotComment
              key={bc.id}
              botName={bc.bot_name || 'match_advisor'}
              content={bc.content}
              createdAt={bc.created_at}
              compact={compact}
            />
          ))}
          {compact && intent.bot_comments.length > 2 && (
            <p className="text-[10px] text-[var(--wm-text-faint)] px-2.5">+{intent.bot_comments.length - 2} gợi ý khác</p>
          )}
        </div>
      ) : intent.bot_comment && (
        <div className="mx-3 mb-2">
          <BotComment
            botName={intent.bot_comment.bot_name || 'match_advisor'}
            content={intent.bot_comment.content}
            createdAt={intent.bot_comment.created_at}
            compact={compact}
          />
        </div>
      )}

      {/* Latest Human Comment */}
      {intent.latest_comment && !intent.latest_comment.is_bot && (
        <div className="mx-3 mb-2 flex items-start gap-2">
          <div className="w-6 h-6 bg-zinc-600 flex items-center justify-center text-white text-[9px] font-semibold shrink-0 mt-0.5">
            {intent.latest_comment.user?.name?.[0] || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs">
              <span className="font-semibold text-[var(--wm-text)]">{intent.latest_comment.user?.name}</span>
              <span className="text-[var(--wm-text-dim)]"> {intent.latest_comment.content}</span>
            </span>
          </div>
        </div>
      )}

      {/* Action Bar */}
      <ActionBar intentId={intent.id} interested={localInterested} onToggleInterest={handleToggleInterest} />
    </div>
  );

  if (compact) {
    return (
      <Link href={`${basePath}/intent/${intent.id}`} className="block">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}

function ActionBar({ intentId, interested, onToggleInterest }: { intentId: string; interested: boolean; onToggleInterest: () => void }) {
  const { isSaved, toggleSave } = useSaved();
  const saved = isSaved(intentId);

  return (
    <div className="flex items-center border-t border-[var(--wm-border)]">
      <div
        role="button"
        tabIndex={0}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleInterest(); }}
        className={cn(
          'flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs transition-colors cursor-pointer',
          interested
            ? 'text-[var(--wm-primary)] font-semibold'
            : 'text-[var(--wm-text-dim)] hover:bg-[var(--wm-surface-hover)]',
        )}
      >
        <ThumbsUp className={cn('w-4 h-4', interested && 'fill-current')} />
        <span>{interested ? 'Đã quan tâm' : 'Quan tâm'}</span>
      </div>
      <div
        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-[var(--wm-text-dim)] hover:bg-[var(--wm-surface-hover)] transition-colors cursor-pointer"
        // Không block event để click có thể bubble lên thẻ Link bọc ngoài
      >
        <MessageCircle className="w-4 h-4" />
        <span>Bình luận</span>
      </div>
      <div
        role="button"
        tabIndex={0}
        onClick={(e) => {
          e.preventDefault(); e.stopPropagation();
          toggleSave(intentId);
        }}
        className={cn(
          'flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs transition-colors cursor-pointer',
          saved
            ? 'text-yellow-500 font-semibold'
            : 'text-[var(--wm-text-dim)] hover:bg-[var(--wm-surface-hover)]',
        )}
      >
        <Bookmark className={cn('w-4 h-4', saved && 'fill-current')} />
        <span>{saved ? 'Đã lưu' : 'Lưu'}</span>
      </div>
    </div>
  );
}
