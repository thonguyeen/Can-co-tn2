'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, MessageSquare, Loader2, Handshake, MapPin, Home, DollarSign, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { IntentCard } from '@/components/intent/IntentCard';
import { MatchCard } from '@/components/intent/MatchCard';
import { VerifySection } from '@/components/intent/VerifySection';
import { BottomNav } from '@/components/intent/BottomNav';
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
  }, [id, session]);

  /* ─── Loading ─── */
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-indigo-500" />
          <p className="text-slate-400 text-sm font-medium">Đang tải tin đăng...</p>
        </div>
      </div>
    );
  }

  /* ─── Not found ─── */
  if (!intent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-10 text-center max-w-sm w-full">
          <Home className="w-10 h-10 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 font-semibold mb-1">Không tìm thấy tin đăng</p>
          <p className="text-slate-400 text-sm mb-6">Tin này có thể đã bị xóa hoặc không tồn tại.</p>
          <Link
            href="/can-co"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-full hover:bg-indigo-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  const isCO = intent.type === 'CO';
  const trustPercent = Math.round((intent.trust_score || 3) / 5 * 100);

  const heroImage = intent.images?.[0]?.url ?? null;

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-8">

      {/* ── Hero Zone (Floating buttons + image/placeholder) ── */}
      <div className="relative w-full max-w-2xl mx-auto">

        {/* Background image or gradient placeholder */}
        {heroImage ? (
          <div
            className="w-full h-[280px] md:h-[340px] bg-cover bg-center"
            style={{ backgroundImage: `url(${heroImage})` }}
          />
        ) : (
          <div className="w-full h-[180px] bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100" />
        )}

        {/* Floating Back button — top left */}
        <Link
          href="/can-co"
          className="absolute top-4 left-4 z-50 flex items-center justify-center w-10 h-10 rounded-full bg-white/80 backdrop-blur-md shadow-md hover:bg-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </Link>

        {/* Floating Trust badge — top right */}
        <div className="absolute top-4 right-4 z-50 flex items-center gap-1.5 px-3 py-1.5 bg-white/80 backdrop-blur-md text-emerald-700 rounded-full shadow-md font-bold text-xs">
          <ShieldCheck className="w-4 h-4" />
          <span>Trust {trustPercent}%</span>
        </div>
      </div>

      {/* ── Main Content — overlaps hero image ── */}
      <div className="relative z-10 -mt-6 max-w-2xl mx-auto space-y-4">

        {/* ── INTENT CARD (full mode) ── */}
        <div className="bg-white rounded-t-3xl shadow-[0_-6px_20px_rgba(0,0,0,0.06)] border-x border-slate-100 overflow-hidden">
          <div className="wm-light">
            <IntentCard intent={intent as MockIntent} compact={false} basePath="/can-co" />
          </div>
        </div>

        {/* ── Chat CTA — only if viewing someone else's intent ── */}
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
              } catch { } finally { setIsChatting(false); }
            }}
            disabled={isChatting}
            className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-3xl font-bold text-sm text-white cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' }}
          >
            {isChatting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <MessageSquare className="w-4 h-4" />
                <span>Nhắn tin trực tiếp với người đăng</span>
              </>
            )}
          </button>
        )}

        {/* ── Quick Stats Bar ── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: MapPin, label: 'Khu vực', value: (intent.parsed_data as Record<string, unknown>)?.district as string || 'TP.HCM', color: 'text-rose-500', bg: 'bg-rose-50' },
            { icon: Home, label: 'Loại BĐS', value: isCO ? 'Đang bán' : 'Cần tìm', color: isCO ? 'text-indigo-600' : 'text-red-500', bg: isCO ? 'bg-indigo-50' : 'bg-red-50' },
            { icon: DollarSign, label: 'Số khớp', value: `${intent.match_count || 0} khớp`, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className={`${bg} rounded-2xl p-3 text-center`}>
              <Icon className={`w-4 h-4 ${color} mx-auto mb-1`} />
              <p className="text-[10px] text-slate-500 font-medium">{label}</p>
              <p className={`text-xs font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* ── Matches Section ── */}
        {matches.length > 0 && (
          <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center">
                <Handshake className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Kết quả khớp</p>
                <p className="text-[11px] text-slate-400">{matches.length} tin phù hợp với nhu cầu của bạn</p>
              </div>
              <span className="ml-auto bg-indigo-100 text-indigo-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {matches.length}
              </span>
            </div>
            <div className="p-4 space-y-3">
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

        {/* ── Verification (owner of CÓ intent only) ── */}
        {currentUserId && intent.user_id === currentUserId && intent.type === 'CO' && (
          <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Xác minh tin đăng</p>
                <p className="text-[11px] text-slate-400">Tăng độ tin cậy cho bài viết của bạn</p>
              </div>
            </div>
            <div className="p-4">
              <VerifySection intentId={id} currentLevel={intent.verification_level || 'none'} />
            </div>
          </div>
        )}

        {/* COMMENTS_DISABLED — remove wrapper to re-enable
        <div className="bg-white rounded-3xl ...">
          ... comment section ...
        </div>
        */}

      </div>

      <BottomNav />
    </div>
  );
}
