'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Handshake, Eye, ThumbsUp, Bookmark, Camera } from 'lucide-react';
import { cn, formatDistanceToNow } from '@/lib/utils';
import {
    formatPrice,
    formatPriceRange,
    parsedDataToTags,
} from '@/lib/intent-utils';
import { useSaved } from '@/lib/saved-context';
import { useAuthGate } from '@/components/auth/AuthGateProvider';
import { BotComment } from '@/components/intent/BotComment';
import type { MockIntent } from '@/lib/mock/intents';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

// ─── PROPS ───────────────────────────────────────────────────────────────────

interface SocialPostCardProps {
    intent: MockIntent;
    isVip?: boolean;
    compact?: boolean;
    basePath?: string;
}

// ─── AVATAR ──────────────────────────────────────────────────────────────────

function UserAvatar({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
    if (avatarUrl) {
        return (
            <img
                src={avatarUrl}
                alt={name}
                className="w-11 h-11 rounded-full border-2 border-white shadow-sm object-cover shrink-0"
            />
        );
    }
    const initials = name.split(' ').map((w) => w[0]).slice(-2).join('').toUpperCase();
    // Deterministic colour from name
    const colours = ['#4f46e5', '#0369a1', '#059669', '#9333ea', '#dc2626', '#d97706'];
    const colour = colours[name.charCodeAt(0) % colours.length];
    return (
        <div
            className="w-11 h-11 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-white text-sm font-bold shrink-0"
            style={{ backgroundColor: colour }}
        >
            {initials}
        </div>
    );
}

// ─── HERO SECTION ────────────────────────────────────────────────────────────

function HeroSection({
    intent,
    isVip,
    onOpen,
}: {
    intent: MockIntent;
    isVip?: boolean;
    onOpen: (index: number) => void;
}) {
    const hasImages = intent.images.length > 0 && !intent.is_bot;
    if (!hasImages) return null;

    const isCO = intent.type === 'CO';
    const priceDisplay = intent.price
        ? formatPrice(intent.price)
        : formatPriceRange(intent.price_min, intent.price_max);

    return (
        <div
            className="relative w-full aspect-[16/10] overflow-hidden cursor-pointer group"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onOpen(0); }}
        >
            <Image
                src={intent.images[0].url}
                alt="Ảnh BĐS"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                unoptimized
            />
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

            {/* Top-left: Type badge */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5">
                <span className={cn(
                    'text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md backdrop-blur-sm',
                    isCO ? 'bg-emerald-500/90' : 'bg-amber-500/90'
                )}>
                    {isCO ? 'CÓ BÁN' : 'CẦN TÌM'}
                </span>
                {isVip && (
                    <span className="bg-amber-400/95 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm backdrop-blur-sm uppercase tracking-wide">
                        ⭐ Premium
                    </span>
                )}
            </div>

            {/* Bottom-right: Price tag */}
            {priceDisplay && (
                <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl shadow-lg flex items-baseline gap-1">
                    <span className="text-base font-black text-indigo-600 tracking-tight">{priceDisplay}</span>
                </div>
            )}

            {/* Bottom-left: Photo count */}
            {intent.images.length > 1 && (
                <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm rounded-lg text-white text-xs px-2 py-1 flex items-center gap-1">
                    <Camera className="w-3 h-3" />
                    <span>{intent.images.length}</span>
                </div>
            )}
        </div>
    );
}

// ─── POST HEADER ─────────────────────────────────────────────────────────────

function PostHeader({ intent }: { intent: MockIntent }) {
    const isEdited =
        intent.updated_at &&
        new Date(intent.updated_at).getTime() - new Date(intent.created_at).getTime() > 60_000;

    // Role badge
    let roleBadge: React.ReactNode = null;
    if (intent.is_bot) {
        roleBadge = (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-teal-100 text-teal-700 font-bold border border-teal-200 tracking-widest shrink-0 uppercase">
                BOT
            </span>
        );
    } else if (intent.user.verification_level === 'verified') {
        roleBadge = (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200 shrink-0">
                ✓ Đã xác thực
            </span>
        );
    } else if (intent.user.verification_level === 'kyc') {
        roleBadge = (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200 shrink-0">
                KYC
            </span>
        );
    }

    return (
        <div className="px-4 pb-0 pt-3 flex items-start gap-3">
            <UserAvatar name={intent.user.name} avatarUrl={intent.user.avatar_url} />
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-slate-900 text-[15px] leading-tight">{intent.user.name}</span>
                    {roleBadge}
                </div>
                <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                    <span>{formatDistanceToNow(intent.created_at)}</span>
                    {isEdited && <span className="text-slate-300 italic">(đã chỉnh sửa)</span>}
                </div>
            </div>
        </div>
    );
}

// ─── POST BODY ────────────────────────────────────────────────────────────────

function highlightText(text: string): React.ReactNode[] {
    // Highlight giá tiền và địa danh
    const PRICE_RE = /(\d[\d,.]*\s*(?:tỷ|triệu|tr|tỉ))/gi;
    const PLACE_RE = /(quận\s*\d+|q\.\s*\d+|phường\s*\S+|p\.\s*\S+|huyện\s*\S+|thủ đức|bình thạnh|gò vấp|tân bình|bình dương|đồng nai)/gi;

    const parts: React.ReactNode[] = [];
    let last = 0;
    const combined = new RegExp(`(${PRICE_RE.source}|${PLACE_RE.source})`, 'gi');
    let match: RegExpExecArray | null;

    while ((match = combined.exec(text)) !== null) {
        if (match.index > last) parts.push(text.slice(last, match.index));
        const segment = match[0];
        if (PRICE_RE.test(segment)) {
            parts.push(
                <strong key={match.index} className="font-bold text-indigo-600 bg-indigo-50 px-0.5 rounded">
                    {segment}
                </strong>
            );
        } else {
            parts.push(
                <span key={match.index} className="underline decoration-slate-300 decoration-2 underline-offset-2 text-slate-800 font-medium">
                    {segment}
                </span>
            );
        }
        last = match.index + segment.length;
        PRICE_RE.lastIndex = 0; // reset for test
    }
    if (last < text.length) parts.push(text.slice(last));
    return parts;
}

function PostBody({ intent, compact }: { intent: MockIntent; compact: boolean }) {
    const [expanded, setExpanded] = useState(false);

    const tags = parsedDataToTags(intent.parsed_data as Record<string, unknown>, {
        price: intent.price,
        priceMin: intent.price_min,
        priceMax: intent.price_max,
    });

    const rawText = String(intent.raw_text || '');
    const shouldTruncate = compact && rawText.length > 180 && !expanded;
    const displayText = shouldTruncate ? rawText.slice(0, 180) + '…' : rawText;

    return (
        <div className="px-4 py-3">
            {!!intent.title && (
                <h3 className="font-bold text-slate-800 text-base mb-1.5 leading-snug">{String(intent.title)}</h3>
            )}
            <p className="text-[14.5px] text-slate-600 leading-relaxed mb-2">
                {highlightText(displayText)}
                {shouldTruncate && (
                    <button
                        className="ml-1 text-indigo-500 font-semibold text-sm hover:underline focus:outline-none"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setExpanded(true); }}
                    >
                        Xem thêm
                    </button>
                )}
            </p>

            {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                    {tags.map((tag, i) => (
                        <span
                            key={i}
                            className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200"
                        >
                            {tag.icon} {tag.label}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── BOT PREVIEW ──────────────────────────────────────────────────────────────

function BotPreview({ intent }: { intent: MockIntent }) {
    const bc = intent.bot_comments?.[0] ?? intent.bot_comment;
    if (!bc) return null;

    return (
        <div className="mx-4 mb-3 bg-teal-50 border border-teal-100 rounded-xl p-2.5 flex gap-2.5 items-start">
            <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs shrink-0 shadow-sm">
                🤖
            </div>
            <div className="min-w-0">
                <p className="text-xs text-teal-800 leading-snug">
                    <span className="font-bold capitalize">{(bc.bot_name || 'Bot').replace(/_/g, ' ')}:</span>{' '}
                    {bc.content.split('\n')[0]}
                </p>
            </div>
        </div>
    );
}

// ─── REACTION SUMMARY ─────────────────────────────────────────────────────────

function ReactionSummary({
    intent,
    localInterested,
}: {
    intent: MockIntent;
    localInterested: boolean;
}) {
    const interested = (intent.reactions?.interested || 0) + (localInterested ? 1 : 0);
    const hot = intent.reactions?.hot || 0;
    const fairPrice = intent.reactions?.fair_price || 0;

    if (interested === 0 && hot === 0 && fairPrice === 0 && intent.match_count === 0 && intent.view_count === 0) return null;

    return (
        <div className="px-4 pb-2 flex items-center gap-3 text-xs text-slate-400 flex-wrap border-b border-slate-50">
            {interested > 0 && (
                <span className="flex items-center gap-0.5">
                    <span>👍</span> <span className="font-medium text-slate-500">{interested}</span>
                </span>
            )}
            {hot > 0 && (
                <span className="flex items-center gap-0.5">
                    <span>🔥</span> <span className="font-medium text-slate-500">{hot}</span>
                </span>
            )}
            {fairPrice > 0 && (
                <span className="flex items-center gap-0.5">
                    <span>💰</span> <span className="font-medium text-slate-500">{fairPrice} giá hợp lý</span>
                </span>
            )}
            <span className="ml-auto flex items-center gap-3">
                {intent.match_count > 0 && (
                    <span className="flex items-center gap-1">
                        <Handshake className="w-3 h-3" /> {intent.match_count}
                    </span>
                )}
                <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" /> {intent.view_count}
                </span>
            </span>
        </div>
    );
}

// ─── ACTION BAR ──────────────────────────────────────────────────────────────

function ActionBar({
    intentId,
    interested,
    onToggleInterest,
    requireAuth,
}: {
    intentId: string;
    interested: boolean;
    onToggleInterest: () => void;
    requireAuth: (fn: () => void) => void;
}) {
    const { isSaved, toggleSave } = useSaved();
    const saved = isSaved(intentId);

    return (
        <div className="flex items-center px-2 py-2 gap-1">
            {/* Quan tâm */}
            <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleInterest(); }}
                className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[13px] font-semibold transition-all',
                    interested
                        ? 'text-indigo-600 bg-indigo-50'
                        : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50'
                )}
            >
                <ThumbsUp className={cn('w-4 h-4', interested && 'fill-current')} />
                <span>{interested ? 'Đã quan tâm' : 'Quan tâm'}</span>
            </button>

            {/* Đàm phán — CTA chính */}
            <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); requireAuth(() => { }); }}
                className="flex-[1.5] flex items-center justify-center gap-1.5 py-2 bg-indigo-600 text-white rounded-xl text-[13px] font-bold hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-500/20 active:scale-[0.97]"
            >
                <Handshake className="w-4 h-4" />
                <span>Đàm phán</span>
            </button>

            {/* Lưu */}
            <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); requireAuth(() => toggleSave(intentId)); }}
                className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[13px] font-semibold transition-all',
                    saved
                        ? 'text-amber-500 bg-amber-50'
                        : 'text-slate-500 hover:text-amber-500 hover:bg-amber-50'
                )}
            >
                <Bookmark className={cn('w-4 h-4', saved && 'fill-current')} />
                <span>{saved ? 'Đã lưu' : 'Lưu'}</span>
            </button>
        </div>
    );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export function SocialPostCard({
    intent,
    isVip = false,
    compact = true,
    basePath = '',
}: SocialPostCardProps) {
    const [localInterested, setLocalInterested] = useState(false);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const { requireAuth } = useAuthGate();

    const slides = intent.images.map((img) => ({ src: img.url }));

    const openLightbox = (index: number) => {
        setLightboxIndex(index);
        setLightboxOpen(true);
    };

    const handleToggleInterest = () => {
        requireAuth(async () => {
            const next = !localInterested;
            setLocalInterested(next);
            if (!intent.id.startsWith('i-')) {
                try {
                    await fetch('/api/intents/interest', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: intent.id, increment: next }),
                    });
                } catch {
                    // silent
                }
            }
        });
    };

    const card = (
        <div className={cn(
            'bg-white rounded-[20px] overflow-hidden border border-slate-100 shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-200',
            intent.is_bot && 'border-teal-200 bg-teal-50/20',
        )}>
            {/* 1. Hero image */}
            <HeroSection intent={intent} isVip={isVip} onOpen={openLightbox} />

            {/* 2. Post header */}
            <PostHeader intent={intent} />

            {/* 3. Post body */}
            <PostBody intent={intent} compact={compact} />

            {/* 4. Bot preview */}
            <BotPreview intent={intent} />

            {/* 5. Reaction summary */}
            <ReactionSummary intent={intent} localInterested={localInterested} />

            {/* 6. Action bar */}
            <ActionBar
                intentId={intent.id}
                interested={localInterested}
                onToggleInterest={handleToggleInterest}
                requireAuth={requireAuth}
            />

            {/* Lightbox */}
            {intent.images.length > 0 && (
                <Lightbox
                    open={lightboxOpen}
                    close={() => setLightboxOpen(false)}
                    index={lightboxIndex}
                    slides={slides}
                />
            )}
        </div>
    );

    if (compact) {
        return (
            <Link href={`${basePath}/intent/${intent.id}`} className="block">
                {card}
            </Link>
        );
    }

    return card;
}
