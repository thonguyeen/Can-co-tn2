'use client';

import React, { useState, useCallback } from 'react';
import * as Slider from '@radix-ui/react-slider';
import { X, SlidersHorizontal, ChevronDown, ShieldCheck } from 'lucide-react';
import type { MapFilters } from '@/types/map';

// ─── Constants ───────────────────────────────────────────────────────────────

const PRICE_MIN = 0;
const PRICE_MAX = 50_000_000_000; // 50 tỷ

// Các phường/xã tiêu biểu để gợi ý (dữ liệu tĩnh)
const SAMPLE_WARDS = [
  'An Đông', 'An Khánh', 'An Lạc', 'An Phú', 'Bảy Hiền',
  'Bình Chiểu', 'Bình Hưng Hòa', 'Bình Trưng Đông', 'Cầu Kho',
  'Hiệp Bình Chánh', 'Hiệp Bình Phước', 'Hiệp Phú', 'Hòa Thạnh',
  'Linh Đông', 'Linh Tây', 'Long Bình', 'Long Phước', 'Long Thạnh Mỹ',
  'Long Trường', 'Nguyễn Cư Trinh', 'Phú Hữu', 'Phú Mỹ', 'Phước Long A',
  'Phước Long B', 'Tân An Hội', 'Tân Chánh Hiệp', 'Tân Hưng Thuận',
  'Tân Kiểng', 'Tân Phong', 'Tân Phú', 'Tân Thới Hiệp', 'Tân Thới Nhất',
  'Thạnh Lộc', 'Thạnh Mỹ Lợi', 'Thạnh Xuân', 'Thủ Thiêm', 'Trường Thạnh',
];

// ─── Format helpers ──────────────────────────────────────────────────────────

function formatPriceLabel(value: number): string {
  if (value === 0) return '0';
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(0)}tỷ`;
  return `${(value / 1_000_000).toFixed(0)}tr`;
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface MapFilterPanelProps {
  filters: MapFilters;
  onChange: (filters: MapFilters) => void;
  // Mobile: controlled open/close
  isOpen?: boolean;
  onClose?: () => void;
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function MapFilterPanel({
  filters,
  onChange,
  isOpen,
  onClose,
}: MapFilterPanelProps) {
  const [wardSearch, setWardSearch] = useState('');
  const [showWardDropdown, setShowWardDropdown] = useState(false);

  const priceRange = [
    filters.priceMin ?? PRICE_MIN,
    filters.priceMax ?? PRICE_MAX,
  ];

  // ── Handlers ──
  const handleTypeChange = useCallback(
    (type: MapFilters['type']) => onChange({ ...filters, type }),
    [filters, onChange]
  );

  const handleWardSelect = useCallback(
    (ward: string) => {
      setWardSearch(ward);
      setShowWardDropdown(false);
      onChange({ ...filters, district: ward });
    },
    [filters, onChange]
  );

  const handleWardClear = useCallback(() => {
    setWardSearch('');
    onChange({ ...filters, district: undefined });
  }, [filters, onChange]);

  const handlePriceChange = useCallback(
    ([min, max]: number[]) => {
      onChange({
        ...filters,
        priceMin: min === PRICE_MIN ? undefined : min,
        priceMax: max === PRICE_MAX ? undefined : max,
      });
    },
    [filters, onChange]
  );

  const handleVerifiedToggle = useCallback(
    () => onChange({ ...filters, verified: !filters.verified }),
    [filters, onChange]
  );

  const handleReset = useCallback(
    () => {
      setWardSearch('');
      onChange({ type: 'all' });
    },
    [onChange]
  );

  const filteredWards = wardSearch.length > 0
    ? SAMPLE_WARDS.filter(w => w.toLowerCase().includes(wardSearch.toLowerCase()))
    : SAMPLE_WARDS.slice(0, 8);

  const hasActiveFilters =
    (filters.type && filters.type !== 'all') ||
    filters.priceMin ||
    filters.priceMax ||
    filters.district ||
    filters.verified;

  // ── Shared Panel Content ──
  const panelContent = (
    <div className="flex flex-col gap-5 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={18} className="text-[#0068FF]" />
          <h2 className="font-bold text-gray-900 text-base">Bộ lọc</h2>
          {hasActiveFilters && (
            <span className="w-2 h-2 bg-[#0068FF] rounded-full" />
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="text-xs text-gray-400 hover:text-gray-600 font-medium transition-colors"
            >
              Xóa tất cả
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors lg:hidden"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ── 1. Loại tin ── */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Loại tin
        </label>
        <div className="flex gap-2">
          {(['all', 'CAN', 'CO'] as const).map((t) => (
            <button
              key={t}
              onClick={() => handleTypeChange(t)}
              className={`flex-1 py-2 rounded-xl text-sm font-bold border-2 transition-all duration-150
                ${filters.type === t || (!filters.type && t === 'all')
                  ? t === 'CAN'
                    ? 'bg-red-500 border-red-500 text-white shadow-sm'
                    : t === 'CO'
                      ? 'bg-[#0068FF] border-[#0068FF] text-white shadow-sm'
                      : 'bg-gray-900 border-gray-900 text-white shadow-sm'
                  : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
            >
              {t === 'all' ? 'Tất cả' : t === 'CAN' ? 'Cần' : 'Có'}
            </button>
          ))}
        </div>
      </div>

      {/* ── 2. Phường / Xã ── */}
      <div className="relative">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Phường / Xã
        </label>
        <div className="relative">
          <input
            type="text"
            value={wardSearch}
            onChange={(e) => {
              setWardSearch(e.target.value);
              setShowWardDropdown(true);
            }}
            onFocus={() => setShowWardDropdown(true)}
            onBlur={() => setTimeout(() => setShowWardDropdown(false), 150)}
            placeholder="Tìm phường, xã..."
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#0068FF] focus:ring-2 focus:ring-[#0068FF]/10 transition-all pr-16"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {wardSearch && (
              <button onClick={handleWardClear} className="text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            )}
            <ChevronDown size={14} className="text-gray-400" />
          </div>
        </div>

        {/* Dropdown */}
        {showWardDropdown && filteredWards.length > 0 && (
          <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
            {filteredWards.map((ward) => (
              <button
                key={ward}
                onMouseDown={() => handleWardSelect(ward)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 hover:text-[#0068FF] transition-colors first:rounded-t-xl last:rounded-b-xl"
              >
                {ward}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── 3. Khoảng giá ── */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Khoảng giá
        </label>
        <div className="flex justify-between text-xs font-bold text-gray-700 mb-3">
          <span className="bg-gray-100 px-2 py-1 rounded-lg">
            {formatPriceLabel(priceRange[0])}
          </span>
          <span className="bg-gray-100 px-2 py-1 rounded-lg">
            {priceRange[1] >= PRICE_MAX ? '50tỷ+' : formatPriceLabel(priceRange[1])}
          </span>
        </div>
        <Slider.Root
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={500_000_000}
          value={priceRange}
          onValueChange={handlePriceChange}
          className="relative flex items-center w-full h-5 select-none touch-none"
        >
          <Slider.Track className="relative h-1.5 flex-1 rounded-full bg-gray-200">
            <Slider.Range className="absolute h-full rounded-full bg-[#0068FF]" />
          </Slider.Track>
          <Slider.Thumb
            className="block w-4 h-4 bg-white border-2 border-[#0068FF] rounded-full shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#0068FF]/30 cursor-grab active:cursor-grabbing transition-shadow"
            aria-label="Giá tối thiểu"
          />
          <Slider.Thumb
            className="block w-4 h-4 bg-white border-2 border-[#0068FF] rounded-full shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#0068FF]/30 cursor-grab active:cursor-grabbing transition-shadow"
            aria-label="Giá tối đa"
          />
        </Slider.Root>
        <div className="flex justify-between text-[10px] text-gray-400 mt-1.5">
          <span>0</span>
          <span>25 tỷ</span>
          <span>50 tỷ+</span>
        </div>
      </div>

      {/* ── 4. Chỉ hiện đã xác thực ── */}
      <div>
        <button
          onClick={handleVerifiedToggle}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all duration-150
            ${filters.verified
              ? 'bg-blue-50 border-[#0068FF] text-[#0068FF]'
              : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
        >
          <span className="flex items-center gap-2 text-sm font-semibold">
            <ShieldCheck size={16} />
            Chỉ tin đã xác thực
          </span>
          {/* Toggle pill */}
          <div className={`w-10 h-5 rounded-full transition-colors duration-200 relative
            ${filters.verified ? 'bg-[#0068FF]' : 'bg-gray-200'}`}
          >
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200
              ${filters.verified ? 'translate-x-5' : 'translate-x-0.5'}`}
            />
          </div>
        </button>
      </div>
    </div>
  );

  // ── Desktop: always visible sidebar (dùng khi KHÔNG truyền isOpen) ──
  if (isOpen === undefined) {
    return (
      <div className="hidden lg:flex flex-col w-[280px] shrink-0 bg-white border-r border-gray-100 p-5 h-full overflow-y-auto">
        {panelContent}
      </div>
    );
  }

  // ── Mobile: drawer overlay (dùng khi truyền isOpen + onClose) ──
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={onClose}
        />
      )}
      {/* Drawer */}
      <div
        className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl p-5 pb-10 shadow-2xl transition-transform duration-300 ease-out max-h-[85vh] overflow-y-auto
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
      >
        {/* Drag handle */}
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
        {panelContent}
      </div>
    </>
  );
}
