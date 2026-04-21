'use client';

import { SlidersHorizontal, X } from 'lucide-react';

export type FilterType = 'all' | 'CAN' | 'CO';

interface FeedFilterSidebarProps {
    filter: FilterType;
    setFilter: (f: FilterType) => void;
    district: string;
    setDistrict: (d: string) => void;
    priceMin: number | null;
    setPriceMin: (p: number | null) => void;
    priceMax: number | null;
    setPriceMax: (p: number | null) => void;
    totalCount: number;
    canCount: number;
    coCount: number;
}

export const CITY_DISTRICTS: Record<string, string[]> = {
    'Hồ Chí Minh': [
        'Quận 1', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận 6', 'Quận 7',
        'Quận 8', 'Quận 10', 'Quận 11', 'Quận 12',
        'Bình Thạnh', 'Gò Vấp', 'Phú Nhuận', 'Tân Bình', 'Tân Phú',
        'Bình Tân', 'Thủ Đức', 'Nhà Bè', 'Hóc Môn', 'Củ Chi',
        'Bình Chánh', 'Cần Giờ',
    ],
    'Đà Nẵng': [
        'Hải Châu', 'Thanh Khê', 'Sơn Trà', 'Ngũ Hành Sơn',
        'Liên Chiểu', 'Cẩm Lệ', 'Hòa Vang',
    ],
    'Khánh Hòa': [
        'Nha Trang', 'Cam Ranh', 'Cam Lâm', 'Vạn Ninh',
        'Ninh Hòa', 'Khánh Vĩnh', 'Khánh Sơn', 'Trường Sa',
    ],
    'Hà Nội': [
        'Ba Đình', 'Hoàn Kiếm', 'Hai Bà Trưng', 'Đống Đa',
        'Tây Hồ', 'Cầu Giấy', 'Thanh Xuân', 'Hoàng Mai',
        'Long Biên', 'Nam Từ Liêm', 'Bắc Từ Liêm', 'Hà Đông',
    ],
};

/** Get flat district list for a given city, or all districts if empty */
export function getDistrictsForCity(city: string): string[] {
    if (!city) return Object.values(CITY_DISTRICTS).flat();
    return CITY_DISTRICTS[city] ?? [];
}

export function FeedFilterSidebar({
    filter,
    setFilter,
    district,
    setDistrict,
    priceMin,
    setPriceMin,
    priceMax,
    setPriceMax,
    totalCount,
    canCount,
    coCount,
}: FeedFilterSidebarProps) {
    const hasActiveFilter = filter !== 'all' || district !== '' || priceMin !== null || priceMax !== null;

    const handleClear = () => {
        setFilter('all');
        setDistrict('');
        setPriceMin(null);
        setPriceMax(null);
    };

    const TYPE_PILLS: { key: FilterType; label: string; activeClass: string }[] = [
        { key: 'all', label: 'Tất cả', activeClass: 'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200' },
        { key: 'CAN', label: 'CẦN Tìm', activeClass: 'bg-red-50 text-red-600 ring-1 ring-red-200' },
        { key: 'CO', label: 'Đang BÁN', activeClass: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
    ];

    return (
        <aside className="hidden lg:block w-[240px] xl:w-[260px] shrink-0 sticky top-20 self-start max-h-[calc(100vh-6rem)] overflow-y-auto">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-5">

                {/* Header */}
                <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm font-bold text-slate-800">Bộ lọc</span>
                    {hasActiveFilter && (
                        <button
                            onClick={handleClear}
                            className="ml-auto flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                        >
                            <X className="w-3 h-3" />
                            Xóa
                        </button>
                    )}
                </div>

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
                        {getDistrictsForCity('').map((d) => (
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

                {/* ── Divider ── */}
                <div className="border-t border-slate-100" />

                {/* ── Thống kê nhanh ── */}
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Thống kê</p>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-500">Tổng tin</span>
                            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">{totalCount}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-500">🔴 CẦN Tìm</span>
                            <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">{canCount}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-500">🟢 Đang Bán</span>
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">{coCount}</span>
                        </div>
                    </div>
                </div>

            </div>
        </aside>
    );
}
