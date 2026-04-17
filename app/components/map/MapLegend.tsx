'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

// ─── Choropleth scale (khớp với wardFillLayerStyle trong MapboxRenderer) ─────

const PRICE_SCALE = [
  { label: 'Không có data', color: '#d1fae5' },
  { label: 'Dưới 500 tr', color: '#bbf7d0' },
  { label: '~2 tỷ', color: '#fef08a' },
  { label: '~5 tỷ', color: '#fdba74' },
  { label: '~10 tỷ', color: '#f87171' },
  { label: '20 tỷ+', color: '#dc2626' },
];

// ─── Main Component ──────────────────────────────────────────────────────────

export default function MapLegend() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="absolute bottom-6 right-4 z-30 bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 w-[180px]">
      {/* Header — always visible */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 transition-colors"
      >
        <span className="text-xs font-bold text-gray-700 tracking-wide">Chú thích</span>
        <ChevronDown
          size={14}
          className={`text-gray-400 transition-transform duration-300 ${collapsed ? '' : 'rotate-180'}`}
        />
      </button>

      {/* Content — CSS slide transition */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${collapsed ? 'max-h-0 opacity-0' : 'max-h-[400px] opacity-100'
          }`}
      >
        <div className="px-3 pb-3 space-y-3">
          {/* ── Choropleth scale ── */}
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
              Giá trung bình / phường
            </p>
            {/* Gradient bar */}
            <div
              className="h-3 w-full rounded-full mb-1"
              style={{
                background: 'linear-gradient(to right, #d1fae5, #bbf7d0, #fef08a, #fdba74, #f87171, #dc2626)',
              }}
            />
            <div className="flex justify-between text-[9px] text-gray-400 font-medium">
              <span>Rẻ</span>
              <span>Đắt</span>
            </div>

            {/* Discrete dots for screen-reader / detail */}
            <div className="mt-2 space-y-1">
              {PRICE_SCALE.map(({ label, color }) => (
                <div key={label} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-sm flex-shrink-0 border border-black/5"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-[10px] text-gray-600">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Pin types ── */}
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
              Loại pin
            </p>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-white shadow-sm" />
                <span className="text-[10px] text-gray-600">Cần (CẦN mua/thuê)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#0068FF] border-2 border-white shadow-sm" />
                <span className="text-[10px] text-gray-600">Có (CÓ bán/cho thuê)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
