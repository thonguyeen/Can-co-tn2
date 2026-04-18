'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
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

/** Hero image — full-width, rounded top corners, with overlay badges */
function HeroImage({
  images,
  intentType,
  createdAt,
  trustScore,
}: {
  images: { id: string; url: string }[];
  intentType: string;
  createdAt: string;
  trustScore: number | null | undefined;
}) {
  if (images.length === 0) return null;

  const isNew = (new Date().getTime() - new Date(createdAt).getTime()) < 60 * 60 * 1000;
  const isCO = intentType === 'CO';

  return (
    <div className="relative w-full aspect-[16/10] overflow-hidden rounded-t-2xl">
      <Image
        src={images[0].url}
        alt="Ảnh bất động sản"
        fill
        className="object-cover"
        unoptimized
      />
      {/* Gradient overlay for badge readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/25 pointer-events-none" />

      {/* Top-left: Listing type badge */}
      <div className="absolute top-2.5 left-2.5">
        <span
          className={cn(
            'px-2.5 py-1 text-[11px] font-bold text-white rounded-br-xl rounded-tl-xl tracking-wide shadow-sm backdrop-blur-sm',
            isCO ? 'bg-emerald-600/80' : 'bg-amber-500/80',
          )}
        >
          {isCO ? 'CÓ BÁN' : 'CẦN TÌM'}
        </span>
      </div>

      {/* Bottom-left: "Mới" badge (only within 1 hour) */}
      {isNew && (
        <div className="absolute bottom-2.5 left-2.5">
          <span className="px-2 py-0.5 text-[10px] font-bold text-white rounded-tr-xl rounded-bl-xl shadow-sm"
            style={{ background: 'linear-gradient(90deg, #f59e0b, #f97316)' }}>
            ⚡ Mới
          </span>
        </div>
      )}

      {/* Bottom-right: Trust score */}
      {trustScore != null && trustScore > 0 && (
        <div className="absolute bottom-2.5 right-2.5">
          <span className="px-2 py-0.5 text-[10px] font-semibold text-white rounded-xl bg-black/50 backdrop-blur-sm shadow-sm">
            {trustScore}% ✓
          </span>
        </div>
      )}
    </div>
  );
}

/** Thumbnail strip — row of small images below the hero */
function ThumbnailStrip({ images }: { images: { id: string; url: string }[] }) {
  if (images.length <= 1) return null;

  const thumbs = images.slice(0, 4);
  const extra = images.length - 4;

  return (
    <div className="flex gap-1.5 px-3 pt-2">
      {thumbs.map((img) => (
        <div key={img.id} className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-200 shrink-0">
          <Image src={img.url} alt="" fill className="object-cover" unoptimized />
        </div>
      ))}
      {extra > 0 && (
        <div className="w-14 h-14 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
          <span className="text-xs font-bold text-slate-500">+{extra}</span>
        </div>
      )}
    </div>
  );
}

/** Smart expandable text — gradient fade + "XẾm thêm" button, only when text overflows */
function ExpandableText({ text, compact }: { text: string; compact: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !compact) return;
    // Detect if text is taller than the 3-line clamp height
    setIsClamped(el.scrollHeight > el.clientHeight + 2);
  }, [text, compact]);

  if (!compact) {
    return (
      <p className="text-sm text-slate-600 leading-relaxed">{text}</p>
    );
  }

  return (
    <div className="relative">
      <p
        ref={ref}
        className={cn(
          'text-sm text-slate-600 leading-relaxed',
          !expanded && 'line-clamp-3',
        )}
      >
        {text}
      </p>

      {/* Gradient fade overlay — only when collapsed & clamped */}
      {isClamped && !expanded && (
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent pointer-events-none" />
      )}

      {/* Toggle button — only when text is actually long */}
      {isClamped && (
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setExpanded(!expanded); }}
          className="mt-0.5 text-xs font-semibold text-indigo-600 hover:underline focus:outline-none"
        >
          {expanded ? 'Rút gọn ↑' : 'Xem thêm ↓'}
        </button>
      )}
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

  const hasImages = intent.images.length > 0 && !intent.is_bot;

  const cardContent = (
    <div className={cn(
      "bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm transition-all hover:shadow-md hover:border-slate-200",
      intent.is_bot && "border-teal-200 bg-teal-50/30"
    )}>

      {/* ── Hero Image (TOP, only for CÓ bài có ảnh) ── */}
      {hasImages && (
        <HeroImage
          images={intent.images}
          intentType={intent.type}
          createdAt={intent.created_at}
          trustScore={intent.trust_score}
        />
      )}

      {/* ── Thumbnail strip ── */}
      {hasImages && <ThumbnailStrip images={intent.images} />}

      {/* ── Header: User + Type Badge ── */}
      <div className={cn('p-3 pb-0', hasImages && 'pt-2.5')}>
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
              <span className="font-semibold text-sm text-slate-900">{intent.user.name}</span>
              {intent.is_bot && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-teal-100 text-teal-700 font-bold border border-teal-200 tracking-widest shrink-0">
                  BOT TỰ ĐỘNG
                </span>
              )}
              <span className="text-xs text-slate-300">·</span>
              <span className="text-xs text-slate-400">
                {(() => {
                  const isEdited = intent.updated_at && (new Date(intent.updated_at).getTime() - new Date(intent.created_at).getTime()) > 60_000;
                  return isEdited
                    ? <>{formatDistanceToNow(intent.updated_at)} <span className="text-slate-300 italic">(đã chỉnh sửa)</span></>
                    : formatDistanceToNow(intent.created_at);
                })()}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              {isCrawled && <span className="text-[9px] px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(14,116,144,0.08)', color: '#0e7490', border: '1px solid rgba(14,116,144,0.2)' }}>Nguồn ngoài</span>}
              {/* verInfo (trust level) always visible; typeInfo badge only when no hero overlay */}
              <span className={cn('text-[9px] px-2 py-0.5 rounded-full font-medium', verInfo.className)}>{verInfo.label}</span>
              {!hasImages && <span className={typeInfo.bgClass}>{typeInfo.label}</span>}
            </div>
          </div>
          {/* Price display */}
          {priceDisplay && (
            <div className="text-right shrink-0">
              <span className="tabular-nums font-bold text-sm text-slate-900">{priceDisplay}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="px-3 pt-2 pb-2">
        {!!intent.title && (
          <h3 className="font-semibold text-[15px] text-slate-900 leading-snug mb-1">{String(intent.title)}</h3>
        )}
        <ExpandableText text={String(intent.raw_text || '')} compact={compact} />
      </div>

      {/* Source Citation (Nguồn ngoài only) */}
      {isCrawled && !!(intent.parsed_data as Record<string, unknown>)?.original_url && (
        <div className="px-3 pb-2">
          <div className="flex items-center gap-2 text-xs rounded-md px-2.5 py-1.5" style={{ background: 'rgba(14,116,144,0.06)', border: '1px solid rgba(14,116,144,0.15)' }}>
            <span className="text-slate-400">Nguồn:</span>
            <span className="text-teal-700 font-medium">{(intent.parsed_data as Record<string, unknown>)?.source_name as string || 'Bên ngoài'}</span>
            <span className="text-slate-300">·</span>
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
            <span key={i} className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              {tag.icon} {tag.label}
            </span>
          ))}
        </div>
      )}


      {/* Reactions + Metrics */}
      <div className="px-3 pb-2 flex items-center gap-3 text-xs text-slate-400 flex-wrap">
        {interestCount > 0 && (
          <span className="flex items-center gap-1 text-indigo-500 font-medium">{interestCount} quan tâm</span>
        )}
        {(intent.reactions?.fair_price || 0) > 0 && (
          <span className="flex items-center gap-1">{intent.reactions!.fair_price} giá hợp lý</span>
        )}
        {(intent.reactions?.hot || 0) > 0 && (
          <span className="flex items-center gap-1">{intent.reactions!.hot} hot</span>
        )}
        {/* COMMENTS_DISABLED — remove comment wrapper to re-enable
        <span className="flex items-center gap-1">
          <MessageCircle className="w-3.5 h-3.5" />
          {intent.comment_count}
        </span>
        */}
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
            <p className="text-[10px] text-slate-400 px-2.5">+{intent.bot_comments.length - 2} gợi ý khác</p>
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

      {/* COMMENTS_DISABLED — remove comment wrapper to re-enable
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
      */}

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
    <div className="flex items-center border-t border-slate-100">
      <div
        role="button"
        tabIndex={0}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleInterest(); }}
        className={cn(
          'flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs transition-colors cursor-pointer',
          interested
            ? 'text-indigo-600 font-semibold'
            : 'text-slate-500 hover:bg-slate-50',
        )}
      >
        <ThumbsUp className={cn('w-4 h-4', interested && 'fill-current')} />
        <span>{interested ? 'Đã quan tâm' : 'Quan tâm'}</span>
      </div>
      {/* COMMENTS_DISABLED — remove comment wrapper to re-enable
      <div
        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
      >
        <MessageCircle className="w-4 h-4" />
        <span>Bình luận</span>
      </div>
      */}
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
            ? 'text-amber-500 font-semibold'
            : 'text-slate-500 hover:bg-slate-50',
        )}
      >
        <Bookmark className={cn('w-4 h-4', saved && 'fill-current')} />
        <span>{saved ? 'Đã lưu' : 'Lưu'}</span>
      </div>
    </div>
  );
}
