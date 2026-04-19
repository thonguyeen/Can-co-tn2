'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
    ArrowLeft, ShieldCheck, MapPin, Home, Maximize2,
    Phone, MessageSquare, Loader2, CarFront, Bed, Bath,
    User, Clock, ExternalLink, Pencil, Building2, Layers,
    Key, Trees, Wifi, Wind,
} from 'lucide-react';
import { ComposeIntent } from '@/components/intent/ComposeIntent';
import { useIntentDetail } from '@/hooks/useIntentDetail';
import { ImageSlider } from '@/components/intent/ImageSlider';
import dynamic from 'next/dynamic';
import type { MockIntent } from '@/lib/mock/intents';

// Dynamic import to avoid SSR issues with Leaflet
const LeafletIsoMap = dynamic(() => import('@/components/map/LeafletIsoMap').then(mod => mod.LeafletIsoMap), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-[#0f0f1a] flex items-center justify-center"><div className="w-6 h-6 border-2 border-violet-400 border-t-transparent animate-spin rounded-full" /></div>
});

// ─────────────────────────────────────────────────────────────────────────────
// V1 — MẪU D: DARK NAVY + VIOLET SPLIT
// Left: Top 50% = Image Slider | Bottom 50% = Mapbox map
// Right: Full BDS detail (tags, title, price, specs, poster, mô tả, tiện ích, related)
// Route: /intent/[id]/v1-split
// ─────────────────────────────────────────────────────────────────────────────

// Static Mapbox image helper (no token required for basic tiles, but we use OSM tiles fallback)
function MapEmbed({ lat, lng, address }: { lat: number | null; lng: number | null; address: string }) {
    const centerLat = lat ?? 10.7769;
    const centerLng = lng ?? 106.7009;

    // Use Mapbox Static Images API — requires public token
    // Fallback to OpenStreetMap tile if no token
    const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    if (MAPBOX_TOKEN) {
        const mapUrl = `https://api.mapbox.com/styles/v1/mapbox/light-v11/static/pin-s+7c3aed(${centerLng},${centerLat})/${centerLng},${centerLat},15,0/800x400@2x?access_token=${MAPBOX_TOKEN}`;
        return (
            <div className="relative w-full h-full overflow-hidden">
                <img
                    src={mapUrl}
                    alt="Bản đồ vị trí"
                    className="w-full h-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                {/* Address pill overlay */}
                <div className="absolute bottom-4 left-4 right-4 z-10">
                    <div className="flex items-center gap-2 px-3 py-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg max-w-xs">
                        <MapPin className="w-4 h-4 text-violet-600 shrink-0" />
                        <span className="text-xs font-semibold text-slate-700 truncate">{address}</span>
                    </div>
                </div>
            </div>
        );
    }

    // Fallback: dark placeholder with address
    return (
        <div className="relative w-full h-full bg-gradient-to-br from-slate-900 to-[#1e1b4b] flex flex-col items-center justify-center gap-4">
            {/* Grid overlay for map feel */}
            <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage: 'linear-gradient(#7c3aed 1px, transparent 1px), linear-gradient(90deg, #7c3aed 1px, transparent 1px)', backgroundSize: '40px 40px' }}
            />
            {/* Pin */}
            <div className="relative z-10 flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-600/50">
                    <MapPin className="w-6 h-6 text-white" />
                </div>
                <div className="px-3 py-1.5 bg-white rounded-lg shadow text-xs font-semibold text-slate-700 text-center max-w-[200px]">
                    {address}
                </div>
            </div>
            {/* Expand hint */}
            <button className="relative z-10 flex items-center gap-1.5 text-white/40 text-xs hover:text-white/60 transition cursor-pointer">
                <Maximize2 className="w-3 h-3" />
                Xem bản đồ
            </button>
        </div>
    );
}

// ── Hook: fetch related intents from API ──
function useRelatedIntents(currentId: string, district: string | null, category: string) {
    const [related, setRelated] = useState<MockIntent[]>([]);
    const [loadingRelated, setLoadingRelated] = useState(false);

    useEffect(() => {
        if (!district && !category) return;
        setLoadingRelated(true);
        const params = new URLSearchParams({ limit: '4', status: 'active' });
        if (district) params.set('district', district);
        if (category) params.set('category', category);

        fetch(`/api/intents?${params}`)
            .then(r => r.json())
            .then(data => {
                const items: MockIntent[] = (data.intents || []).filter(
                    (i: MockIntent) => i.id !== currentId
                ).slice(0, 4);
                setRelated(items);
            })
            .catch(() => setRelated([]))
            .finally(() => setLoadingRelated(false));
    }, [currentId, district, category]);

    return { related, loadingRelated };
}

// ── Amenity chip builder from parsed_data ──
function buildAmenityChips(pd: Record<string, unknown>) {
    const chips: { icon: React.ElementType; label: string }[] = [];
    const add = (icon: React.ElementType, label: string) => chips.push({ icon, label });

    if (typeof pd.bedrooms === 'number' && pd.bedrooms > 0)
        add(Bed, `${pd.bedrooms} phòng ngủ`);
    if (typeof pd.bathrooms === 'number' && pd.bathrooms > 0)
        add(Bath, `${pd.bathrooms} WC`);
    if (typeof pd.area === 'number' || typeof pd.area_m2 === 'number')
        add(Maximize2, `${pd.area ?? pd.area_m2}m²`);
    if (typeof pd.floor === 'number')
        add(Layers, `Tầng ${pd.floor}`);
    if (typeof pd.floors === 'number')
        add(Building2, `${pd.floors} tầng`);
    if (pd.alley_type && typeof pd.alley_type === 'string')
        add(CarFront, pd.alley_type);
    if (pd.furniture && typeof pd.furniture === 'string')
        add(Key, pd.furniture);
    if (pd.parking === true || pd.parking === 'yes')
        add(CarFront, 'Đỗ xe');
    if (pd.balcony === true || pd.balcony === 'yes')
        add(Trees, 'Ban công');
    if (pd.wifi === true || pd.wifi === 'yes')
        add(Wifi, 'Wifi');
    if (pd.air_conditioner === true)
        add(Wind, 'Điều hòa');

    // Keywords array (up to 3 extras)
    if (Array.isArray(pd.keywords)) {
        pd.keywords.slice(0, 3).forEach((kw: unknown) => {
            if (typeof kw === 'string' && chips.length < 8)
                add(Home, kw);
        });
    }

    return chips;
}

// ── Relative time helper ──
function relativeTime(iso: string) {
    const d = (Date.now() - new Date(iso).getTime()) / 1000;
    if (d < 60) return 'vừa xong';
    if (d < 3600) return `${Math.floor(d / 60)} phút trước`;
    if (d < 86400) return `${Math.floor(d / 3600)} giờ trước`;
    return `${Math.floor(d / 86400)} ngày trước`;
}

// ─────────────────────────────────────────────────────────────────────────────

export default function V1SplitPage() {
    const { id } = useParams() as { id: string };
    const {
        intent, loading, isOwner, isCO, trustPercent, allImages,
        isEditing, setIsEditing, handleEditComplete, router,
    } = useIntentDetail(id);

    // ── Related intents hook (MUST be before early returns — Rules of Hooks) ──
    const { related, loadingRelated } = useRelatedIntents(
        id,
        intent?.district ?? null,
        intent?.category || 'real_estate'
    );

    // ── Loading ──
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0f0f1a]">
                <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
            </div>
        );
    }

    // ── Not found ──
    if (!intent) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0f0f1a] px-4">
                <div className="text-center">
                    <Home className="w-12 h-12 text-violet-800 mx-auto mb-4" />
                    <p className="text-white/60 font-medium mb-6">Không tìm thấy bài đăng</p>
                    <button
                        onClick={() => router.back()}
                        className="px-6 py-2.5 bg-violet-600 text-white rounded-full text-sm font-bold cursor-pointer"
                    >Quay lại</button>
                </div>
            </div>
        );
    }

    // ── Data helpers ──
    const pd = intent.parsed_data as Record<string, unknown>;
    const district = (intent.district || pd?.district as string || null);
    const ward = (intent.ward || pd?.ward as string || '');
    const area = (pd?.area ?? pd?.area_m2) as number | null;
    const propertyType = pd?.property_type as string || (pd?.subcategory as string) || (isCO ? 'Bất động sản' : 'Cần tìm');
    const address = intent.address || (ward ? `${ward}, ${district ?? 'TP.HCM'}` : (district ?? 'TP.HCM'));

    const priceDisplay = (() => {
        if (intent.price) return intent.price.toLocaleString('vi-VN') + 'đ';
        if (intent.price_min && intent.price_max)
            return `${intent.price_min.toLocaleString('vi-VN')}đ – ${intent.price_max.toLocaleString('vi-VN')}đ`;
        if (intent.price_min) return `từ ${intent.price_min.toLocaleString('vi-VN')}đ`;
        return 'Thỏa thuận';
    })();

    // ── Build amenity chips from parsed_data ──
    const amenityChips = buildAmenityChips(pd);

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="flex h-screen overflow-hidden bg-[#0f0f1a]">

            {/* ═══════════════════════════════════════════════════════════
                LEFT — STICKY PANEL (desktop only: slider top + map bottom)
                ═══════════════════════════════════════════════════════════ */}
            <div className="hidden lg:flex w-1/2 flex-col shrink-0 relative">

                {/* ── Floating Back button ── */}
                <button
                    onClick={() => router.back()}
                    className="absolute top-5 left-5 z-20 flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 backdrop-blur-md text-white/80 text-xs font-semibold hover:bg-white/20 transition cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Quay lại
                </button>

                {/* ── Trust badge ── */}
                <div className="absolute top-5 right-5 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold text-emerald-300">
                    <ShieldCheck className="w-4 h-4" />
                    Trust {trustPercent}%
                </div>

                {/* IMAGE SLIDER — top 50% */}
                <div className="h-1/2">
                    <ImageSlider images={allImages} className="h-full" />
                </div>

                {/* LEAFLET MAP + ISOCHRONE — bottom 50% */}
                <div className="h-1/2 relative border-t border-white/5">
                    <LeafletIsoMap lat={intent.lat} lng={intent.lng} address={address} showIsochrone={true} className="w-full h-full" />
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════
                RIGHT — SCROLLABLE CONTENT
                ═══════════════════════════════════════════════════════════ */}
            <div className="flex-1 flex flex-col overflow-hidden bg-white">

                {/* ── Mobile hero (no map on mobile) ── */}
                <div className="lg:hidden shrink-0 h-[250px] relative">
                    <button onClick={() => router.back()} className="absolute top-4 left-4 z-10 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center cursor-pointer shadow">
                        <ArrowLeft className="w-5 h-5 text-slate-700" />
                    </button>
                    <ImageSlider images={allImages} className="h-full" />
                </div>

                {/* ── Scrollable body ── */}
                <div className="flex-1 overflow-y-auto">
                    <div className="px-6 lg:px-8 pt-6 pb-24">

                        {/* ── Tags row ── */}
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${isCO ? 'bg-violet-100 text-violet-700' : 'bg-rose-100 text-rose-700'}`}>
                                {isCO ? 'Đang bán / cho thuê' : 'Cần tìm'}
                            </span>
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-teal-100 text-teal-700 uppercase tracking-wider flex items-center gap-1">
                                ✦ AI phân tích
                            </span>
                            {intent.source && (
                                <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 flex items-center gap-1">
                                    <ExternalLink className="w-3 h-3" />
                                    {intent.source}
                                </span>
                            )}
                            {isOwner && !isEditing && (
                                <button onClick={() => setIsEditing(true)} className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center gap-1 cursor-pointer transition">
                                    <Pencil className="w-3 h-3" /> Sửa bài
                                </button>
                            )}
                        </div>

                        {/* ── Edit mode ── */}
                        {isEditing && (
                            <div className="mb-6 bg-slate-50 rounded-2xl p-4 border border-slate-200">
                                <ComposeIntent mode="real" editIntent={intent} onEditComplete={handleEditComplete} onCancelEdit={() => setIsEditing(false)} />
                            </div>
                        )}

                        {/* ── Title ── */}
                        {!isEditing && (
                            <>
                                <h1 className="text-2xl lg:text-3xl font-black text-slate-900 leading-tight mb-1">
                                    {intent.title || intent.raw_text?.slice(0, 80)}
                                </h1>
                                <p className="text-sm text-slate-500 mb-4">
                                    {[isCO ? 'Đang cho thuê / bán' : 'Cần tìm', area ? `${area}m²` : null, ward || null].filter(Boolean).join(' · ')}
                                </p>

                                {/* ── Price ── */}
                                <div className="text-3xl font-black text-violet-600 mb-6">
                                    {priceDisplay}
                                </div>

                                {/* ── Property specs 2×2 grid ── */}
                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    {[
                                        { icon: MapPin, label: 'Địa chỉ', value: address, color: 'text-rose-500' },
                                        { icon: Maximize2, label: 'Diện tích', value: area ? `${area}m²` : 'N/A', color: 'text-blue-500' },
                                        { icon: Home, label: 'Loại BĐS', value: propertyType, color: 'text-violet-500' },
                                        { icon: CarFront, label: 'Lối vào', value: (pd?.alley_type as string) || 'N/A', color: 'text-amber-500' },
                                    ].map(({ icon: Icon, label, value, color }) => (
                                        <div key={label} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                            <div className={`mt-0.5 shrink-0 ${color}`}>
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold mb-0.5">{label}</p>
                                                <p className="text-sm font-semibold text-slate-700 truncate">{value}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* ── Divider ── */}
                                <div className="border-t border-slate-100 mb-6" />

                                {/* ── Poster info ── */}
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                        {intent.user?.name?.[0] || <User className="w-4 h-4" />}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-slate-800">{intent.user?.name || 'Người đăng'}</p>
                                        <p className="text-xs text-slate-400 flex items-center gap-1.5">
                                            <Clock className="w-3 h-3" />
                                            {relativeTime(intent.created_at)}
                                        </p>
                                    </div>
                                    <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 rounded-full border border-emerald-100">
                                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                        <span className="text-[10px] font-bold text-emerald-700">Trust {trustPercent}%</span>
                                    </div>
                                </div>

                                {/* ── Divider ── */}
                                <div className="border-t border-slate-100 mb-6" />

                                {/* ── Mô tả chi tiết ── */}
                                <div className="mb-6">
                                    <h2 className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-3">Mô tả chi tiết</h2>
                                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                                        {intent.raw_text}
                                    </p>
                                </div>

                                {/* ── Tiện ích chips (rich from parsed_data) ── */}
                                {amenityChips.length > 0 && (
                                    <>
                                        <div className="border-t border-slate-100 mb-6" />
                                        <div className="mb-6">
                                            <h2 className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-3">Tiện ích</h2>
                                            <div className="flex flex-wrap gap-2">
                                                {amenityChips.map(({ icon: Icon, label }, i) => (
                                                    <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-violet-50 hover:text-violet-700 rounded-full text-xs font-semibold text-slate-700 transition">
                                                        <Icon className="w-3 h-3 text-slate-500" />{label}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* ── Tin liên quan (real API) ── */}
                                <div className="border-t border-slate-100 mb-6" />
                                <div>
                                    <h2 className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-3">Tin liên quan</h2>
                                    {loadingRelated ? (
                                        <div className="grid grid-cols-2 gap-3">
                                            {[0, 1].map(i => (
                                                <div key={i} className="bg-slate-100 rounded-xl h-32 animate-pulse" />
                                            ))}
                                        </div>
                                    ) : related.length > 0 ? (
                                        <div className="grid grid-cols-2 gap-3">
                                            {related.map(r => {
                                                const rPrice = r.price
                                                    ? r.price.toLocaleString('vi-VN') + 'đ'
                                                    : r.price_min
                                                        ? `từ ${r.price_min.toLocaleString('vi-VN')}đ`
                                                        : 'Thỏa thuận';
                                                return (
                                                    <div
                                                        key={r.id}
                                                        onClick={() => router.push(`/intent/${r.id}`)}
                                                        className="bg-slate-50 rounded-xl p-3 border border-slate-100 hover:border-violet-200 hover:bg-violet-50/30 transition cursor-pointer"
                                                    >
                                                        {r.images?.[0]?.url ? (
                                                            <img src={r.images[0].url} alt="" className="w-full h-20 object-cover rounded-lg mb-2" />
                                                        ) : (
                                                            <div className="w-full h-20 rounded-lg bg-gradient-to-br from-violet-100 to-indigo-100 mb-2 flex items-center justify-center">
                                                                <Home className="w-6 h-6 text-violet-300" />
                                                            </div>
                                                        )}
                                                        <p className="text-xs font-semibold text-slate-800 line-clamp-2 mb-1">{r.title || r.raw_text?.slice(0, 50)}</p>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs font-bold text-violet-600">{rPrice}</span>
                                                            <span className="text-[10px] text-slate-400">{r.district || 'TP.HCM'}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-400 text-center py-4">Chưa có tin liên quan</p>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════
                    STICKY BOTTOM CTA BAR
                    ═══════════════════════════════════════════════════════════ */}
                {!isEditing && !isOwner && (
                    <div className="shrink-0 bg-white border-t border-slate-100 px-6 lg:px-8 py-4 flex items-center gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold">Giá</p>
                            <p className="text-lg font-black text-violet-600 truncate">{priceDisplay}</p>
                        </div>
                        <button className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-violet-600 text-white font-bold text-sm shadow-lg shadow-violet-600/30 hover:bg-violet-700 hover:-translate-y-0.5 transition cursor-pointer shrink-0">
                            <Phone className="w-4 h-4" />
                            Gọi điện
                        </button>
                        <button className="flex items-center gap-2 px-5 py-3 rounded-2xl border-2 border-slate-200 text-slate-700 font-bold text-sm hover:border-violet-300 hover:text-violet-700 transition cursor-pointer shrink-0">
                            <MessageSquare className="w-4 h-4" />
                            Chat
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
