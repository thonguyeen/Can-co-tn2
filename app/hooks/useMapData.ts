'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { MapGeoJSONCollection, MapFilters } from '@/types/map';

const REFRESH_INTERVAL_MS = 30_000; // 30 giây

function buildQueryString(filters: MapFilters): string {
  const params = new URLSearchParams();
  if (filters.type && filters.type !== 'all') params.set('type', filters.type);
  if (filters.priceMin) params.set('priceMin', String(filters.priceMin));
  if (filters.priceMax) params.set('priceMax', String(filters.priceMax));
  if (filters.district) params.set('district', filters.district);
  if (filters.verified) params.set('verified', 'true');
  return params.toString();
}

interface UseMapDataResult {
  geojson: MapGeoJSONCollection | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useMapData(filters: MapFilters = {}): UseMapDataResult {
  const [geojson, setGeojson] = useState<MapGeoJSONCollection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const fetchData = useCallback(async (isBackground = false) => {
    try {
      if (!isBackground) setIsLoading(true);
      setError(null);

      const qs = buildQueryString(filtersRef.current);
      const url = `/api/map/geojson${qs ? `?${qs}` : ''}`;
      const res = await fetch(url);

      if (!res.ok) throw new Error(`API error: ${res.status}`);

      const data: MapGeoJSONCollection = await res.json();
      setGeojson(data);
    } catch (err) {
      console.error('[useMapData] Fetch error:', err);
      if (!isBackground) {
        setError('Không thể tải dữ liệu bản đồ. Vui lòng thử lại.');
      }
    } finally {
      if (!isBackground) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtersKey = buildQueryString(filters);
  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchData(true);
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchData]);

  return {
    geojson,
    isLoading,
    error,
    refresh: () => fetchData(),
  };
}

// ─── Ward Prices Hook (Phường/Xã — VN bỏ cấp Quận từ 2025) ─────────────────

export interface WardPriceData {
  avgPrice: number;
  count: number;
}

interface UseWardPricesResult {
  wardPrices: Record<string, WardPriceData>;
  isLoading: boolean;
}

export function useWardPrices(): UseWardPricesResult {
  const [wardPrices, setWardPrices] = useState<Record<string, WardPriceData>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchPrices() {
      try {
        const res = await fetch('/api/map/ward-prices');
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && data.wards) {
          setWardPrices(data.wards);
        }
      } catch (err) {
        console.error('[useWardPrices] Error:', err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchPrices();
    // Refresh mỗi 5 phút (cùng cache TTL của API)
    const interval = setInterval(fetchPrices, 5 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return { wardPrices, isLoading };
}

// ─── Legacy: District Prices Hook (backwards compat) ─────────────────────────

/** @deprecated VN đã bỏ cấp Quận từ 2025. Dùng useWardPrices thay thế. */
export type DistrictPriceData = WardPriceData;

/** @deprecated Dùng useWardPrices thay thế. */
export function useDistrictPrices() {
  const { wardPrices, isLoading } = useWardPrices();
  return { districtPrices: wardPrices, isLoading };
}
