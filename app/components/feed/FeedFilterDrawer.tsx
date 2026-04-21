'use client';

import { SlidersHorizontal, X } from 'lucide-react';
import { type FilterType } from './FeedFilterSidebar';

interface FeedFilterDrawerProps {
    open: boolean;
    onClose: () => void;
    filter: FilterType;
    setFilter: (f: FilterType) => void;
    district: string;
    setDistrict: (d: string) => void;
    priceMin: number | null;
    setPriceMin: (p: number | null) => void;
    priceMax: number | null;
    setPriceMax: (p: number | null) => void;
    districts: string[];
    activeFilterCount: number;
}

const TYPE_PILLS: { key: FilterType; label: string; activeClass: string }[] = [
    { key: 'all', label: 'Tất cả', activeClass: 'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200' },
    { key: 'CAN', label: 'CẦN Tìm', activeClass: 'bg-red-50 text-red-600 ring-1 ring-red-200' },
    { key: 'CO', label: 'Đang BÁN', activeClass: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
];

export function FeedFilterDrawer({
    open,
    onClose,
    filter,
    setFilter,
    district,
    setDistrict,
    priceMin,
    setPriceMin,
    priceMax,
    setPriceMax,
    districts,
    activeFilterCount,
}: FeedFilterDrawerProps) {
    const handleClear = () => {
        setFilter('all');
        setDistrict('');
        setPriceMin(null);
        setPriceMax(null);
    };

    const hasActiveFilter = filter !== 'all' || district !== '' || priceMin !== null || priceMax !== null;

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={onClose}
            />

            {/* Drawer panel */}
            <div
                className={`fixed top-0 right-0 h-full w-[320px] max-w-[85vw] bg-white z-50 shadow-2xl transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full">

                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                            <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                            <span className="text-sm font-bold text-slate-800">Bộ lọc</span>
                            {activeFilterCount > 0 && (
                                <span className="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                    {activeFilterCount}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                            <X className="w-4 h-4 text-slate-500" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-6">

                        {/* ── Loại tin ── */}
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Loại tin</p>
                            <div className="flex flex-col gap-1.5">
                                {TYPE_PILLS.map(({ key, label, activeClass }) => (
                                    <button
                                        key={key}
                                        onClick={() => setFilter(key)}
                                        className={`w-full text-left text-xs font-semibold px-3 py-2 rounded-xl transition-all cursor-pointer ${filter === key
                                                ? activeClass
                                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                            }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* ── Khu vực ── */}
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Khu vực</p>
                            <select
                                value={district}
                                onChange={(e) => setDistrict(e.target.value)}
                                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all cursor-pointer"
                            >
                                <option value="">Tất cả khu vực</option>
                                {districts.map((d) => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>

                        {/* ── Khoảng giá ── */}
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Khoảng giá (tỷ đồng)</p>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min={0}
                                    placeholder="Từ"
                                    value={priceMin !== null ? priceMin / 1_000_000_000 : ''}
                                    onChange={(e) => setPriceMin(e.target.value ? Number(e.target.value) * 1_000_000_000 : null)}
                                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                                />
                                <span className="text-slate-300 text-xs shrink-0">–</span>
                                <input
                                    type="number"
                                    min={0}
                                    placeholder="Đến"
                                    value={priceMax !== null ? priceMax / 1_000_000_000 : ''}
                                    onChange={(e) => setPriceMax(e.target.value ? Number(e.target.value) * 1_000_000_000 : null)}
                                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-slate-100 p-4 flex gap-3">
                        {hasActiveFilter && (
                            <button
                                onClick={handleClear}
                                className="flex-1 text-xs font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl py-2.5 transition-colors cursor-pointer"
                            >
                                Xóa bộ lọc
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="flex-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl py-2.5 transition-colors cursor-pointer"
                        >
                            Áp dụng
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
