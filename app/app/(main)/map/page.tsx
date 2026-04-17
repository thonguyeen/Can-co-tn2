'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Map as MapIcon, SlidersHorizontal, X, ArrowLeft } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { useFeedData } from '@/hooks/useFeedData';
import MapboxRenderer from '@/components/map/MapboxRenderer';
import MapPopupCard, { type LikeResult } from '@/components/map/MapPopupCard';
import MapFilterPanel from '@/components/map/MapFilterPanel';
import MapLegend from '@/components/map/MapLegend';
import { MutualMatchPopup } from '@/components/swipe/MutualMatchPopup';
import type { MapFeatureProperties, MapFilters } from '@/types/map';

// ─── Error Boundary ──────────────────────────────────────────────────────────
class MapErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-red-50 p-4">
          <h2 className="text-red-600 font-bold mb-2">Lỗi Render Bản Đồ</h2>
          <pre className="text-xs bg-white p-4 rounded shadow overflow-auto max-w-full max-h-40">
            {this.state.error?.message}
          </pre>
          <button
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Thử lại
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Match State ─────────────────────────────────────────────────────────────

interface MatchState {
  conversationId: string;
  partnerName: string;
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function MapPage() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [filters, setFilters] = useState<MapFilters>({ type: 'all' });
  const [selectedPin, setSelectedPin] = useState<{ intent: MapFeatureProperties; distance: string } | null>(null);
  const [matchState, setMatchState] = useState<MatchState | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { intents } = useFeedData();

  // ── GPS ──
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setUserLocation({ lat: 10.7766, lng: 106.6953 }),
        { timeout: 5000 }
      );
    } else {
      setUserLocation({ lat: 10.7766, lng: 106.6953 });
    }
  }, []);

  // ── Like handler ──
  const handleLikeSuccess = (result: LikeResult) => {
    if (result.isMutualMatch && result.conversationId && selectedPin) {
      setSelectedPin(null);
      setMatchState({
        conversationId: result.conversationId,
        partnerName: selectedPin.intent.userName,
      });
    }
  };

  // Active filter count badge
  const activeFilterCount = [
    filters.type && filters.type !== 'all',
    filters.priceMin,
    filters.priceMax,
    filters.district,
    filters.verified,
  ].filter(Boolean).length;

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50 overflow-hidden">

      {/* ── TOP NAV BAR ── */}
      <header className="flex items-center gap-3 px-4 h-14 bg-white border-b border-gray-100 shadow-sm shrink-0 z-20">
        <Link
          href="/feed"
          className="flex items-center justify-center w-9 h-9 rounded-xl hover:bg-gray-100 transition-colors text-gray-600"
        >
          <ArrowLeft size={20} />
        </Link>

        <div className="flex items-center gap-2 flex-1">
          <MapIcon size={20} className="text-[#0068FF]" />
          <h1 className="font-bold text-gray-900 text-base">Bản đồ BĐS</h1>
          {activeFilterCount > 0 && (
            <span className="bg-[#0068FF] text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {activeFilterCount}
            </span>
          )}
          {intents.length > 0 && (
            <span className="text-xs text-gray-400 font-medium transition-opacity duration-500">
              {intents.length} tin
            </span>
          )}
        </div>

        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={`lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors border
            ${isFilterOpen || activeFilterCount > 0
              ? 'bg-[#0068FF] text-white border-[#0068FF]'
              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }`}
        >
          {isFilterOpen ? <X size={16} /> : <SlidersHorizontal size={16} />}
          <span className="hidden sm:inline">Lọc</span>
          {activeFilterCount > 0 && !isFilterOpen && (
            <span className="w-4 h-4 bg-white text-[#0068FF] text-[10px] font-black rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </header>

      {/* ── MAIN CONTENT ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Desktop Sidebar Filter — renders via hidden lg:flex inside MapFilterPanel */}
        <MapFilterPanel filters={filters} onChange={setFilters} />

        {/* Map area — takes remaining flex space */}
        <div className="flex-1 relative overflow-hidden min-w-0">
          <MapErrorBoundary>
            <MapboxRenderer
              viewMode="map"
              userLocation={userLocation}
              intents={intents}
              filters={filters}
              selectedPinId={selectedPin?.intent.id || null}
              onPinClick={(intent, distance) => setSelectedPin({ intent, distance })}
            />
          </MapErrorBoundary>

          {/* Legend overlay */}
          <MapLegend />

          {/* Popup card chi tiết */}
          {selectedPin && (
            <MapPopupCard
              pin={selectedPin.intent}
              distance={selectedPin.distance}
              onClose={() => setSelectedPin(null)}
              onLikeSuccess={handleLikeSuccess}
            />
          )}
        </div>
      </div>

      {/* ── MOBILE FILTER DRAWER ── Rendered OUTSIDE flex layout to avoid squeezing map */}
      <MapFilterPanel
        filters={filters}
        onChange={setFilters}
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
      />

      {/* Mutual Match Popup */}
      <AnimatePresence>
        {matchState && (
          <MutualMatchPopup
            partnerName={matchState.partnerName}
            partnerAvatar={null}
            myAvatar={null}
            conversationId={matchState.conversationId}
            onClose={() => setMatchState(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
