'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MessageSquare, Pencil, Loader2, MapPin, Home, DollarSign, ShieldCheck } from 'lucide-react';
import { IntentCard } from '@/components/intent/IntentCard';
import { ComposeIntent } from '@/components/intent/ComposeIntent';
import { PredictionCard } from '@/components/intent/PredictionCard';
import { BottomNav } from '@/components/intent/BottomNav';
import { DEMO_PREDICTIONS } from '@/lib/mock/predictions';

import { useEffect, useState } from 'react';
import { MockIntent } from '@/lib/mock/intents';
import { useSession } from 'next-auth/react';

export default function IntentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [intent, setIntent] = useState<MockIntent | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setCurrentUserId(session?.user?.id || null);
  }, [session]);

  const fetchIntent = async () => {
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
    setIsEditing(false);
    setLoading(true);
    await fetchIntent();
  };

  /* ─── Loading ─── */
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-slate-50">
        <Loader2 className="w-7 h-7 animate-spin text-indigo-500" />
        <p className="text-slate-400 text-sm font-medium">Đang tải chi tiết...</p>
      </div>
    );
  }

  /* ─── Not Found ─── */
  if (!intent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-10 text-center max-w-sm w-full">
          <Home className="w-10 h-10 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 font-semibold mb-1">Không tìm thấy bài đăng</p>
          <p className="text-slate-400 text-sm mb-6">Bài này có thể đã bị xóa hoặc không tồn tại.</p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-full hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại trang trước
          </button>
        </div>
      </div>
    );
  }

  const isCO = intent.type === 'CO';
  const trustPercent = Math.round((intent.trust_score || 3) / 5 * 100);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-24 md:pb-8">

      {/* ── Sticky Back Bar (top-16 = below TopNavbar h-16) ── */}
      <div className="sticky top-16 z-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer shrink-0"
        >
          <ArrowLeft className="w-4 h-4 text-slate-600" />
        </button>
        <p className="text-sm font-semibold text-slate-900 truncate flex-1">{intent.title || 'Chi tiết bài đăng'}</p>

        {/* Owner edit button */}
        {isOwner && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 border border-indigo-200 rounded-full hover:bg-indigo-50 transition-colors cursor-pointer shrink-0"
          >
            <Pencil className="w-3.5 h-3.5" />
            Sửa bài
          </button>
        )}

        {/* Trust badge */}
        <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1 shrink-0">
          <ShieldCheck className="w-3 h-3 text-emerald-600" />
          <span className="text-[10px] font-bold text-emerald-700">Trust {trustPercent}%</span>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="max-w-2xl mx-auto px-4 md:px-6 pt-6 space-y-4">

        {/* ── IntentCard or Edit Form ── */}
        <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden">
          {isEditing ? (
            <div className="p-4">
              <ComposeIntent
                mode="real"
                editIntent={intent}
                onEditComplete={handleEditComplete}
                onCancelEdit={() => setIsEditing(false)}
              />
            </div>
          ) : (
            <IntentCard intent={intent} compact={false} basePath="" />
          )}
        </div>

        {/* ── Chat CTA (only non-owner) ── */}
        {!isEditing && !isOwner && (
          <button
            className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-3xl font-bold text-sm text-white cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg"
            style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' }}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Nhắn tin trực tiếp với người đăng</span>
          </button>
        )}

        {/* ── Quick Stats ── */}
        {!isEditing && (
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                icon: MapPin,
                label: 'Khu vực',
                value: (intent.parsed_data as Record<string, unknown>)?.district as string || 'TP.HCM',
                color: 'text-rose-500',
                bg: 'bg-rose-50',
              },
              {
                icon: Home,
                label: 'Loại BĐS',
                value: isCO ? 'Đang bán' : 'Cần tìm',
                color: isCO ? 'text-indigo-600' : 'text-red-500',
                bg: isCO ? 'bg-indigo-50' : 'bg-red-50',
              },
              {
                icon: DollarSign,
                label: 'Số khớp',
                value: `${intent.match_count || 0} khớp`,
                color: 'text-emerald-600',
                bg: 'bg-emerald-50',
              },
            ].map(({ icon: Icon, label, value, color, bg }) => (
              <div key={label} className={`${bg} rounded-2xl p-3 text-center`}>
                <Icon className={`w-4 h-4 ${color} mx-auto mb-1`} />
                <p className="text-[10px] text-slate-500 font-medium">{label}</p>
                <p className={`text-xs font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── PredictionCard (if available) ── */}
        {!isEditing && DEMO_PREDICTIONS[id] && (
          <PredictionCard prediction={DEMO_PREDICTIONS[id]} />
        )}

        {/* COMMENTS_DISABLED — uncomment to re-enable
        <IntentComments intent={intent} fetchIntent={fetchIntent} />
        */}

      </div>

      <BottomNav />
    </div>
  );
}
