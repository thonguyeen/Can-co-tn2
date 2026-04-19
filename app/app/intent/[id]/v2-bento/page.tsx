'use client';

import { useParams } from 'next/navigation';
import { ArrowLeft, Pencil, ShieldCheck, MessageSquare, MapPin, Home, DollarSign, Phone, Bot, Loader2, Zap } from 'lucide-react';
import { IntentCard } from '@/components/intent/IntentCard';
import { ComposeIntent } from '@/components/intent/ComposeIntent';
import { PredictionCard } from '@/components/intent/PredictionCard';
import { DEMO_PREDICTIONS } from '@/lib/mock/predictions';
import { useIntentDetail } from '@/hooks/useIntentDetail';

// ─────────────────────────────────────────────────────────────────────────────
// V2 — BENTO GRID DASHBOARD (Apple-style)
// Full-bleed hero stretches 100vw. Content arranged in 3-col bento grid below.
// Preview at: /intent/[id]/v2-bento
// ─────────────────────────────────────────────────────────────────────────────

export default function V2BentoPage() {
    const { id } = useParams() as { id: string };
    const {
        intent, loading, isOwner, isCO, trustPercent, heroImage,
        isEditing, setIsEditing, handleEditComplete, router,
    } = useIntentDetail(id);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-7 h-7 animate-spin text-indigo-500" />
            </div>
        );
    }
    if (!intent) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
                <div className="text-center">
                    <Home className="w-10 h-10 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">Không tìm thấy bài đăng</p>
                    <button onClick={() => router.back()} className="mt-4 px-5 py-2 bg-indigo-600 text-white rounded-full text-sm font-semibold cursor-pointer">
                        Quay lại
                    </button>
                </div>
            </div>
        );
    }

    const district = (intent.parsed_data as Record<string, unknown>)?.district as string || 'TP.HCM';

    return (
        <div className="min-h-screen bg-slate-100 pb-16">

            {/* ═══ HERO: Full-bleed 100vw ═══ */}
            <div className="relative w-full h-[320px] lg:h-[440px] bg-slate-900 overflow-hidden">
                {heroImage ? (
                    <img src={heroImage} alt="" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-900 via-violet-800 to-slate-900" />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/60" />

                {/* Floating controls */}
                <button
                    onClick={() => router.back()}
                    className="absolute top-5 left-5 z-10 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition cursor-pointer"
                >
                    <ArrowLeft className="w-5 h-5 text-white" />
                </button>
                {isOwner && !isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="absolute top-5 left-[60px] z-10 flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold hover:bg-white/30 transition cursor-pointer"
                    >
                        <Pencil className="w-3.5 h-3.5" />Sửa
                    </button>
                )}
                <div className="absolute top-5 right-5 z-10 flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-md text-white rounded-full text-xs font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-300" />Trust {trustPercent}%
                </div>

                {/* Hero bottom text */}
                <div className="absolute bottom-8 left-6 right-6 z-10">
                    <span className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider mb-2 ${isCO ? 'bg-indigo-500/80 text-white' : 'bg-red-500/80 text-white'}`}>
                        {isCO ? 'Đang bán' : 'Cần tìm'} • {district}
                    </span>
                    <h1 className="text-white text-2xl lg:text-3xl font-black leading-tight line-clamp-2 drop-shadow-lg">
                        {intent.title || intent.raw_text?.slice(0, 90)}
                    </h1>
                </div>
            </div>

            {/* ═══ BENTO GRID: -mt-16 overlap ═══ */}
            <div className="max-w-[1320px] mx-auto px-4 lg:px-6 -mt-16 relative z-10">

                {/* ─ Mobile: Stack single column ─ */}
                <div className="block lg:hidden space-y-4 pt-6">
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                        <div className="text-3xl font-black text-indigo-600 mb-1">
                            {intent.price?.toLocaleString('vi-VN') || intent.price_min?.toLocaleString('vi-VN') || 'Thỏa thuận'}đ
                        </div>
                        <div className="flex gap-2 mt-4">
                            <button className="flex-1 bg-indigo-600 text-white rounded-xl py-3 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"><Phone className="w-4 h-4" />Liên hệ</button>
                            <button className="flex-1 bg-slate-100 text-slate-700 rounded-xl py-3 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"><MessageSquare className="w-4 h-4" />Chat</button>
                        </div>
                    </div>
                    <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden">
                        {isEditing ? (
                            <div className="p-4"><ComposeIntent mode="real" editIntent={intent} onEditComplete={handleEditComplete} onCancelEdit={() => setIsEditing(false)} /></div>
                        ) : (
                            <IntentCard intent={intent} compact={false} basePath="" />
                        )}
                    </div>
                </div>

                {/* ─ Desktop: Bento 3-col grid ─ */}
                <div className="hidden lg:grid grid-cols-12 gap-5">

                    {/* LEFT BENTO (col 3) */}
                    <div className="col-span-3 space-y-5 pt-6">
                        {/* Profile bento */}
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col gap-3">
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Người đăng</h3>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600">
                                    {intent.raw_text?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800">Người dùng</p>
                                    <p className="text-xs text-slate-400">TP.HCM</p>
                                </div>
                            </div>
                        </div>
                        {/* Stats bento */}
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 space-y-3">
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Thống kê</h3>
                            {[
                                { icon: MapPin, label: 'Khu vực', value: district, color: 'text-rose-500', bg: 'bg-rose-50' },
                                { icon: Home, label: 'Loại BĐS', value: isCO ? 'Đang bán' : 'Cần tìm', color: 'text-indigo-600', bg: 'bg-indigo-50' },
                                { icon: DollarSign, label: 'Số khớp', value: `${intent.match_count || 0} khớp`, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                            ].map(({ icon: Icon, label, value, color, bg }) => (
                                <div key={label} className={`${bg} rounded-xl p-3 flex items-center gap-3`}>
                                    <Icon className={`w-4 h-4 ${color} shrink-0`} />
                                    <div>
                                        <p className="text-[10px] text-slate-500">{label}</p>
                                        <p className={`text-xs font-bold ${color}`}>{value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CENTER BENTO (col 6) */}
                    <div className="col-span-6 space-y-5 pt-6">
                        {/* Price bento */}
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Mức giá</p>
                            <div className="text-4xl font-black text-indigo-600">
                                {intent.price?.toLocaleString('vi-VN') || intent.price_min?.toLocaleString('vi-VN') || 'Thỏa thuận'}
                                <span className="text-lg font-medium text-slate-400 ml-1">đ</span>
                            </div>
                        </div>

                        {/* Main content bento */}
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                            {isEditing ? (
                                <div className="p-6">
                                    <ComposeIntent mode="real" editIntent={intent} onEditComplete={handleEditComplete} onCancelEdit={() => setIsEditing(false)} />
                                </div>
                            ) : (
                                <IntentCard intent={intent} compact={false} basePath="" />
                            )}
                        </div>

                        {/* Prediction card */}
                        {DEMO_PREDICTIONS[id] && (
                            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                                <PredictionCard prediction={DEMO_PREDICTIONS[id]} />
                            </div>
                        )}
                    </div>

                    {/* RIGHT BENTO (col 3) */}
                    <div className="col-span-3 space-y-5 pt-6">
                        {/* AI Insight bento */}
                        <div className="bg-indigo-600 rounded-3xl shadow-sm p-6 text-white">
                            <div className="flex items-center gap-2 mb-4">
                                <Bot className="w-5 h-5 text-indigo-200" />
                                <span className="font-bold text-sm">Brain AI</span>
                            </div>
                            <div className="flex items-baseline gap-1 mb-1">
                                <span className="text-5xl font-black">{trustPercent}</span>
                                <span className="text-indigo-200 text-lg font-bold">%</span>
                            </div>
                            <p className="text-indigo-200 text-xs mb-4">Điểm Tin Cậy (KYC)</p>
                            <div className="bg-white/10 rounded-xl p-3">
                                <p className="text-xs text-indigo-100">
                                    {trustPercent >= 80 ? '✅ Người dùng đáng tin cậy.' : '⚠️ Cần xác minh thêm thông tin.'}
                                </p>
                            </div>
                        </div>

                        {/* Action bento */}
                        {!isOwner && !isEditing && (
                            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 space-y-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <Zap className="w-4 h-4 text-amber-500" />
                                    <span className="text-xs font-bold text-slate-700">Kết nối ngay</span>
                                </div>
                                <button className="w-full bg-indigo-600 text-white rounded-2xl py-3.5 font-bold text-sm flex items-center justify-center gap-2 hover:-translate-y-0.5 transition shadow-lg shadow-indigo-600/20 cursor-pointer">
                                    <Phone className="w-4 h-4" />Lấy số liên hệ
                                </button>
                                <button className="w-full bg-slate-100 text-slate-700 rounded-2xl py-3.5 font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-200 transition cursor-pointer">
                                    <MessageSquare className="w-4 h-4" />Nhắn tin
                                </button>
                            </div>
                        )}

                        {/* Match count bento */}
                        <div className="bg-emerald-50 rounded-3xl border border-emerald-100 p-6 text-center">
                            <div className="text-4xl font-black text-emerald-600 mb-1">{intent.match_count || 0}</div>
                            <p className="text-emerald-700 text-xs font-bold">Kết nối khớp tìm thấy</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
