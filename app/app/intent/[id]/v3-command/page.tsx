'use client';

import { useParams } from 'next/navigation';
import { ArrowLeft, Pencil, ShieldCheck, MessageSquare, MapPin, Home, DollarSign, Phone, Loader2, List, Zap } from 'lucide-react';
import { IntentCard } from '@/components/intent/IntentCard';
import { ComposeIntent } from '@/components/intent/ComposeIntent';
import { PredictionCard } from '@/components/intent/PredictionCard';
import { DEMO_PREDICTIONS } from '@/lib/mock/predictions';
import { useIntentDetail } from '@/hooks/useIntentDetail';

// ─────────────────────────────────────────────────────────────────────────────
// V3 — 3-COL COMMAND CENTER
// Left: Sticky TOC + related intents. Center: Hero + content scroll.
// Right: Sticky action panel (price, CTAs, match count).
// Preview at: /intent/[id]/v3-command
// ─────────────────────────────────────────────────────────────────────────────

const TOC_ITEMS = [
    { label: 'Tổng quan', href: '#overview' },
    { label: 'Mô tả chi tiết', href: '#description' },
    { label: 'Vị trí bản đồ', href: '#location' },
    { label: 'Dự báo thị trường', href: '#prediction' },
];

export default function V3CommandPage() {
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
        <div className="flex h-screen overflow-hidden bg-slate-50">

            {/* ═════════════ LEFT: TOC + Related (Desktop only) ═════════════ */}
            <div className="hidden lg:flex flex-col w-[260px] xl:w-[280px] shrink-0 border-r border-slate-200 bg-white h-full overflow-y-auto">
                {/* Back button */}
                <div className="p-5 border-b border-slate-100">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" />Quay lại
                    </button>
                </div>

                {/* Table of contents */}
                <div className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <List className="w-4 h-4 text-slate-400" />
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mục lục</h3>
                    </div>
                    <ul className="space-y-1">
                        {TOC_ITEMS.map((item, i) => (
                            <li key={item.href}>
                                <a
                                    href={item.href}
                                    className={`block text-sm font-medium pl-3 py-2 rounded-lg transition-colors ${i === 0
                                        ? 'border-l-2 border-indigo-500 text-indigo-600 bg-indigo-50 font-semibold'
                                        : 'border-l-2 border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                                        }`}
                                >
                                    {item.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Divider */}
                <div className="mx-5 border-t border-slate-100" />

                {/* Related intents mini cards */}
                <div className="p-5 flex-1">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Tin tương tự</h3>
                    <div className="space-y-3">
                        {[1, 2].map((i) => (
                            <div key={i} className="bg-slate-50 rounded-xl p-3 border border-slate-100 cursor-pointer hover:bg-slate-100 transition">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${isCO ? 'bg-indigo-100 text-indigo-700' : 'bg-red-100 text-red-700'}`}>
                                        {isCO ? 'BÁN' : 'CẦN'}
                                    </span>
                                    <span className="text-[10px] text-slate-400">{district}</span>
                                </div>
                                <p className="text-xs font-semibold text-slate-700 line-clamp-2">
                                    Tin tương tự trong khu vực {district}
                                </p>
                                <p className="text-xs text-indigo-600 font-bold mt-1">Thỏa thuận đ</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ═════════════ CENTER: Hero + Content ═════════════ */}
            <div className="flex-1 overflow-y-auto min-w-0">
                {/* Mobile back button */}
                <div className="lg:hidden fixed top-4 left-4 z-50">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md shadow-md flex items-center justify-center cursor-pointer"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-700" />
                    </button>
                </div>

                {/* Hero — same as original Option D */}
                <section id="overview">
                    <div className="relative w-full">
                        {heroImage ? (
                            <div
                                className="w-full h-[260px] lg:h-[360px] bg-cover bg-center"
                                style={{ backgroundImage: `url(${heroImage})` }}
                            />
                        ) : (
                            <div className="w-full h-[180px] lg:h-[260px] bg-gradient-to-br from-slate-100 via-indigo-100 to-slate-200" />
                        )}

                        {/* Floating Trust + Edit */}
                        <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-white/80 backdrop-blur-md text-emerald-700 rounded-full shadow-md text-xs font-bold">
                            <ShieldCheck className="w-4 h-4" />Trust {trustPercent}%
                        </div>
                        {isOwner && !isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="absolute top-4 right-28 flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/80 backdrop-blur-md shadow-md hover:bg-white text-indigo-600 font-semibold text-xs transition cursor-pointer"
                            >
                                <Pencil className="w-3.5 h-3.5" />Sửa bài
                            </button>
                        )}
                    </div>

                    {/* Content card — overlaps hero */}
                    <div className="relative z-10 -mt-6 mx-4 bg-white rounded-t-3xl shadow-[0_-6px_20px_rgba(0,0,0,0.06)] border-x border-slate-100 overflow-hidden">
                        {isEditing ? (
                            <div className="p-4">
                                <ComposeIntent mode="real" editIntent={intent} onEditComplete={handleEditComplete} onCancelEdit={() => setIsEditing(false)} />
                            </div>
                        ) : (
                            <IntentCard intent={intent} compact={false} basePath="" />
                        )}
                    </div>
                </section>

                {/* Stats */}
                {!isEditing && (
                    <section id="description" className="mx-4 mt-4">
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { icon: MapPin, label: 'Khu vực', value: district, color: 'text-rose-500', bg: 'bg-rose-50' },
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
                    </section>
                )}

                {/* Prediction card */}
                {!isEditing && DEMO_PREDICTIONS[id] && (
                    <section id="prediction" className="mx-4 mt-4">
                        <PredictionCard prediction={DEMO_PREDICTIONS[id]} />
                    </section>
                )}

                {/* Mobile CTA (hidden when right panel is visible) */}
                {!isEditing && !isOwner && (
                    <div className="lg:hidden mx-4 mt-4 mb-16 flex gap-3">
                        <button className="flex-1 bg-indigo-600 text-white rounded-2xl py-4 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer">
                            <Phone className="w-4 h-4" />Liên hệ
                        </button>
                        <button className="flex-1 bg-slate-100 text-slate-700 rounded-2xl py-4 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer">
                            <MessageSquare className="w-4 h-4" />Chat
                        </button>
                    </div>
                )}
            </div>

            {/* ═════════════ RIGHT: Sticky Action Panel (Desktop only) ═════════════ */}
            <div className="hidden lg:block w-[300px] xl:w-[320px] shrink-0 border-l border-slate-200 bg-white h-full overflow-y-auto">
                <div className="p-6 sticky top-0">
                    {/* Price */}
                    <div className="mb-6">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Mức giá</p>
                        <div className="text-3xl font-black text-indigo-600">
                            {intent.price?.toLocaleString('vi-VN') || intent.price_min?.toLocaleString('vi-VN') || 'Thỏa thuận'}
                            <span className="text-base font-medium text-slate-400 ml-1">đ</span>
                        </div>
                    </div>

                    {/* Trust badge */}
                    <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 mb-6">
                        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                        <div>
                            <p className="text-xs font-bold text-emerald-700">Trust {trustPercent}%</p>
                            <p className="text-[10px] text-emerald-600">{trustPercent >= 80 ? 'Đáng tin cậy' : 'Cần xác minh'}</p>
                        </div>
                    </div>

                    {/* CTAs */}
                    {!isOwner && !isEditing && (
                        <div className="space-y-3 mb-6">
                            <button className="w-full bg-indigo-600 text-white rounded-2xl py-4 font-bold text-sm flex items-center justify-center gap-2 hover:-translate-y-0.5 transition shadow-lg shadow-indigo-600/20 cursor-pointer">
                                <Phone className="w-4 h-4" />Lấy số liên hệ
                            </button>
                            <button className="w-full bg-slate-100 text-slate-700 rounded-2xl py-4 font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-200 transition cursor-pointer">
                                <MessageSquare className="w-4 h-4" />Nhắn tin trực tiếp
                            </button>
                        </div>
                    )}

                    {/* Divider */}
                    <div className="border-t border-slate-100 mb-6" />

                    {/* Match count */}
                    <div className="text-center bg-amber-50 rounded-2xl p-5 border border-amber-100">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Zap className="w-5 h-5 text-amber-500" />
                            <span className="text-xs font-bold text-amber-700">Kết nối khớp</span>
                        </div>
                        <div className="text-4xl font-black text-amber-600">{intent.match_count || 0}</div>
                        <p className="text-xs text-amber-600 mt-1">người đang tìm giống anh</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
