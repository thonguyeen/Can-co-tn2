'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MessageSquare, ShieldCheck, ShieldAlert, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/intent-utils';

interface MatchCardIntent {
  id: string;
  title?: string | null;
  raw_text: string;
  type: string;
  price?: number | null;
  district?: string | null;
  trust_score: number;
  verification_level: string;
  user_id: string;
}

interface MatchCardProps {
  similarity: number;
  explanation: string;
  matchedIntent: MatchCardIntent;
  intentId?: string;
  basePath?: string;
}

export function MatchCard({ similarity, explanation, matchedIntent, intentId, basePath = '/demo/can-co' }: MatchCardProps) {
  const router = useRouter();
  const [isChatting, setIsChatting] = useState(false);
  const pct = Math.round(similarity * 100);
  const isVerified = matchedIntent.verification_level === 'verified';
  const isKyc = matchedIntent.verification_level === 'kyc';
  const isReal = !basePath.includes('demo');

  const handleChat = async () => {
    if (!isReal || isChatting) return;

    setIsChatting(true);
    try {
      const res = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intent_id: intentId || matchedIntent.id,
          other_user_id: matchedIntent.user_id,
        }),
      });

      if (res.ok) {
        const conv = await res.json();
        router.push(`/can-co/chat/${conv.id}`);
      }
    } catch {
      // Fail silently
    } finally {
      setIsChatting(false);
    }
  };

  return (
    <div className="wm-panel p-3">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={cn(
            'tabular-nums text-sm font-bold',
            pct >= 80 ? 'text-emerald-600' : pct >= 60 ? 'text-blue-600' : 'text-[var(--wm-text-dim)]',
          )}>
            {pct}%
          </span>
          <span className="text-[10px] uppercase tracking-wider text-[var(--wm-text-muted)] font-semibold">phù hợp</span>
        </div>
        <div className="flex items-center gap-1">
          {isVerified && (
            <span className="wm-badge wm-badge-normal text-[10px]">
              <ShieldCheck className="w-3 h-3" /> Xác thực
            </span>
          )}
          {isKyc && (
            <span className="wm-badge wm-badge-info text-[10px]">
              <ShieldAlert className="w-3 h-3" /> KYC
            </span>
          )}
        </div>
      </div>

      <Link href={`${basePath}/intent/${matchedIntent.id}`} className="block mb-2 hover:underline">
        <h4 className="text-sm font-semibold text-[var(--wm-text)] leading-snug">
          {matchedIntent.title || matchedIntent.raw_text.slice(0, 60)}
        </h4>
      </Link>

      <div className="flex items-center gap-3 mb-2 text-xs text-[var(--wm-text-dim)]">
        {matchedIntent.district && <span>📍 {matchedIntent.district}</span>}
        {matchedIntent.price && (
          <span className="tabular-nums font-semibold text-[var(--wm-text)]">
            💰 {formatPrice(matchedIntent.price)}
          </span>
        )}
      </div>

      <p className="text-xs text-[var(--wm-text-muted)] mb-3">{explanation}</p>

      <button
        onClick={handleChat}
        disabled={isChatting}
        className="w-full flex items-center justify-center gap-1.5 py-2 border border-[var(--wm-primary)] text-[var(--wm-primary)] text-xs font-semibold hover:bg-[color-mix(in_srgb,var(--wm-primary)_5%,transparent)] transition-colors disabled:opacity-50"
      >
        {isChatting ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <>
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Nhắn trực tiếp</span>
          </>
        )}
      </button>
    </div>
  );
}
