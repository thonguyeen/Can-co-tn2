'use client';

import { useEffect, useState } from 'react';
import { getPOIs, formatDistance, type POI, type POICategory } from '@/lib/services/ors';

// ─────────────────────────────────────────────────────────────────────────────
// POILayer — Standalone POI section (no map, list format)
// Used in detail pages to show nearby amenities with category filter tabs
// ─────────────────────────────────────────────────────────────────────────────

interface POILayerProps {
    lat: number | null;
    lng: number | null;
    radiusMeters?: number;
    className?: string;
}

const CATEGORIES: { id: POICategory; emoji: string; label: string }[] = [
    { id: 'school', emoji: '🏫', label: 'Trường học' },
    { id: 'hospital', emoji: '🏥', label: 'Y tế' },
    { id: 'supermarket', emoji: '🛒', label: 'Siêu thị' },
    { id: 'market', emoji: '🏪', label: 'Chợ' },
    { id: 'park', emoji: '🌳', label: 'Công viên' },
    { id: 'restaurant', emoji: '🍜', label: 'Ăn uống' },
];

export function POILayer({ lat, lng, radiusMeters = 1000, className = '' }: POILayerProps) {
    const [pois, setPois] = useState<POI[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState<POICategory | 'all'>('all');

    useEffect(() => {
        if (!lat || !lng) {
            setLoading(false);
            return;
        }
        setLoading(true);
        getPOIs(lat, lng, radiusMeters)
            .then(setPois)
            .finally(() => setLoading(false));
    }, [lat, lng, radiusMeters]);

    const filtered = activeCategory === 'all'
        ? pois
        : pois.filter(p => p.category === activeCategory);

    return (
        <div className={className}>
            <h2 className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-3">
                Tiện ích xung quanh
            </h2>

            {/* Category filter pills */}
            <div className="flex flex-wrap gap-2 mb-4">
                <button
                    onClick={() => setActiveCategory('all')}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer
                        ${activeCategory === 'all'
                            ? 'bg-violet-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-violet-50 hover:text-violet-700'
                        }`}
                >
                    Tất cả
                </button>
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer flex items-center gap-1
                            ${activeCategory === cat.id
                                ? 'bg-violet-600 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-600 hover:bg-violet-50 hover:text-violet-700'
                            }`}
                    >
                        <span>{cat.emoji}</span>
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* POI list */}
            {loading ? (
                <div className="space-y-2">
                    {[0, 1, 2].map(i => (
                        <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-6">
                    <p className="text-slate-400 text-sm">
                        {!lat || !lng ? 'Không có tọa độ để tìm tiện ích' : 'Không tìm thấy tiện ích gần đây'}
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {filtered.slice(0, 8).map((poi, i) => {
                        const catInfo = CATEGORIES.find(c => c.id === poi.category);
                        return (
                            <div
                                key={i}
                                className="flex items-center gap-3 px-3 py-2.5 bg-slate-50 hover:bg-violet-50/40 rounded-xl border border-slate-100 hover:border-violet-100 transition group"
                            >
                                {/* Emoji icon */}
                                <div className="w-9 h-9 rounded-lg bg-white border border-slate-100 flex items-center justify-center shrink-0 text-base shadow-sm">
                                    {poi.emoji}
                                </div>

                                {/* Info */}
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-slate-800 truncate">{poi.name}</p>
                                    <p className="text-[11px] text-slate-400">{catInfo?.label ?? poi.category}</p>
                                </div>

                                {/* Distance badge */}
                                {poi.distanceM !== undefined && (
                                    <div className="shrink-0 px-2 py-0.5 bg-violet-50 rounded-full border border-violet-100 text-[11px] font-bold text-violet-600">
                                        {formatDistance(poi.distanceM)}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
