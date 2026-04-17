'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Map, { Marker, Source, Layer } from 'react-map-gl/mapbox';
import type { MapRef, MapMouseEvent } from 'react-map-gl/mapbox';
import type { CircleLayerSpecification, FillLayerSpecification, SymbolLayerSpecification } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { type MockIntent } from '@/lib/mock/intents';
import { useMapData, useWardPrices } from '@/hooks/useMapData';
import type { MapFeatureProperties, MapFilters } from '@/types/map';

// 🗺️ Token từ biến môi trường
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

// ─── Layer Styles ───────────────────────────────────────────────────────────────

const clusterLayerStyle: Omit<CircleLayerSpecification, 'source'> = {
  id: 'clusters',
  type: 'circle',
  filter: ['has', 'point_count'],
  paint: {
    'circle-color': [
      'step', ['get', 'point_count'],
      '#60a5fa', 10, '#3b82f6', 30, '#1d4ed8',
    ],
    'circle-radius': [
      'step', ['get', 'point_count'],
      22, 10, 32, 30, 42,
    ],
    'circle-stroke-width': 3,
    'circle-stroke-color': '#ffffff',
    'circle-opacity': 0.92,
  },
};

const clusterCountLayerStyle: Omit<SymbolLayerSpecification, 'source'> = {
  id: 'cluster-count',
  type: 'symbol',
  filter: ['has', 'point_count'],
  layout: {
    'text-field': '{point_count_abbreviated}',
    'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
    'text-size': 13,
  },
  paint: {
    'text-color': '#ffffff',
  },
};

const unclusteredPointLayerStyle: Omit<CircleLayerSpecification, 'source'> = {
  id: 'unclustered-point',
  type: 'circle',
  filter: ['!', ['has', 'point_count']],
  paint: {
    'circle-color': [
      'match', ['get', 'type'],
      'CAN', '#ef4444',
      'CO', '#0068FF',
      '#888888',
    ],
    'circle-radius': [
      'case',
      ['>', ['coalesce', ['get', 'price'], 0], 5000000000], 14,
      ['>', ['coalesce', ['get', 'price'], 0], 2000000000], 11,
      8,
    ],
    'circle-stroke-width': 2.5,
    'circle-stroke-color': '#ffffff',
    'circle-opacity': 0.95,
  },
};

// ─── Choropleth Layer Styles (Phường/Xã — VN bỏ cấp Quận từ 2025) ──────────

const wardFillLayerStyle: Omit<FillLayerSpecification, 'source'> = {
  id: 'ward-fills',
  type: 'fill',
  paint: {
    // Tô màu theo giá trung bình (VND)
    'fill-color': [
      'interpolate', ['linear'], ['coalesce', ['get', 'avgPrice'], 0],
      0, '#d1fae5', // Không có data → xanh mint nhạt
      500_000_000, '#bbf7d0', // Dưới 500tr
      2_000_000_000, '#fef08a', // 2 tỷ → vàng
      5_000_000_000, '#fdba74', // 5 tỷ → cam
      10_000_000_000, '#f87171', // 10 tỷ → đỏ nhạt
      20_000_000_000, '#dc2626', // 20 tỷ+ → đỏ đậm
    ],
    // Phường/Xã nhỏ hơn quận → hiển thị ở zoom gần hơn
    'fill-opacity': [
      'interpolate', ['linear'], ['zoom'],
      10, 0.0,  // Zoom rất xa → ẩn
      11, 0.55, // Zoom tầm thành phố → hiện rõ
      13, 0.45,
      14, 0.15, // Zoom gần → mờ
      15, 0.0,  // Zoom street level → ẩn hoàn toàn
    ],
  },
};

const wardStrokeLayerStyle: Omit<FillLayerSpecification, 'source'> = {
  id: 'ward-strokes',
  type: 'fill',
  paint: {
    'fill-color': 'transparent',
    'fill-outline-color': [
      'interpolate', ['linear'], ['zoom'],
      11, 'rgba(100,100,100,0.4)',
      15, 'rgba(100,100,100,0.0)',
    ],
    'fill-opacity': 1,
  },
};

const wardLabelLayerStyle: Omit<SymbolLayerSpecification, 'source'> = {
  id: 'ward-labels',
  type: 'symbol',
  layout: {
    'text-field': [
      'case',
      ['has', 'avgPrice'],
      ['concat', ['get', 'name'], '\n', ['get', 'priceLabel']],
      ['get', 'name'],
    ],
    'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
    'text-size': [
      'interpolate', ['linear'], ['zoom'],
      11, 8,
      13, 11,
      14, 12,
    ],
    'text-anchor': 'center',
    'text-max-width': 8,
  },
  paint: {
    'text-color': '#1f2937',
    'text-halo-color': 'rgba(255,255,255,0.9)',
    'text-halo-width': 2,
    'text-opacity': [
      'interpolate', ['linear'], ['zoom'],
      11, 0.9,
      14, 0.5,
      15, 0.0,
    ],
  },
};

// ─── Props ──────────────────────────────────────────────────────────────────────

interface MapboxRendererProps {
  viewMode: 'map' | 'radar';
  userLocation: { lat: number; lng: number } | null;
  intents: MockIntent[];
  onPinClick: (pin: MapFeatureProperties, distance: string) => void;
  selectedPinId: string | null;
  filters?: MapFilters;
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function MapboxRenderer({
  viewMode,
  userLocation,
  intents,
  onPinClick,
  selectedPinId: _selectedPinId,
  filters = {},
}: MapboxRendererProps) {
  const mapRef = useRef<MapRef>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [viewState, setViewState] = useState({
    longitude: userLocation?.lng ?? 106.6953,
    latitude: userLocation?.lat ?? 10.7766,
    zoom: 13,
    pitch: viewMode === 'radar' ? 60 : 0,
    bearing: viewMode === 'radar' ? -15 : 0,
  });

  const { geojson, isLoading: isMapLoading } = useMapData(
    viewMode === 'map' ? filters : {}
  );

  // ── Choropleth: Fetch giá Phường/Xã, merge vào GeoJSON boundaries ──
  const { wardPrices } = useWardPrices();

  // Chỉ load file GeoJSON boundaries 1 lần
  const [boundaryGeojson, setBoundaryGeojson] = useState<GeoJSON.FeatureCollection | null>(null);
  useEffect(() => {
    fetch('/geojson/hcm-wards.geojson')
      .then(r => r.json())
      .then(setBoundaryGeojson)
      .catch(err => console.error('[Choropleth] Load ward boundary error:', err));
  }, []);

  // Client-side join: thêm avgPrice + priceLabel vào mỗi feature phường/xã
  const choroplethGeojson = useMemo(() => {
    if (!boundaryGeojson) return null;
    return {
      ...boundaryGeojson,
      features: boundaryGeojson.features.map(f => {
        const name = (f.properties?.name ?? '') as string;
        const priceData = wardPrices[name];
        if (!priceData) return f;

        // Format giá: 4.2 tỷ, 850 tr
        const avg = priceData.avgPrice;
        let priceLabel: string;
        if (avg >= 1_000_000_000) {
          priceLabel = `~${(avg / 1_000_000_000).toFixed(1)} tỷ`;
        } else {
          priceLabel = `~${Math.round(avg / 1_000_000)} tr`;
        }

        return {
          ...f,
          properties: {
            ...f.properties,
            avgPrice: avg,
            count: priceData.count,
            priceLabel,
          },
        };
      }),
    };
  }, [boundaryGeojson, wardPrices]);

  // ── Click handler đăng ký trên <Map> (cách chuẩn của react-map-gl v8) ──
  const handleMapClick = useCallback((e: MapMouseEvent) => {
    if (viewMode !== 'map') return;
    const map = mapRef.current?.getMap();
    if (!map) return;

    // 🛡️ Kiểm tra layer có tồn tại trước khi query để tránh crash
    const existingLayers = ['clusters', 'unclustered-point'].filter(id => map.getLayer(id));
    if (existingLayers.length === 0) return;

    const features = map.queryRenderedFeatures(e.point, {
      layers: existingLayers,
    });
    if (!features || features.length === 0) return;

    const feature = features[0];
    const geometry = feature.geometry;
    if (geometry.type !== 'Point') return;

    const coords = geometry.coordinates as [number, number];

    // Cluster → flyTo để mở rộng cụm
    if (feature.properties?.cluster) {
      const source = map.getSource('intents') as mapboxgl.GeoJSONSource;
      const clusterId = feature.properties.cluster_id as number;
      source.getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err || zoom == null) return;
        map.flyTo({ center: coords, zoom: zoom + 0.5, duration: 600 });
      });
      return;
    }

    // Unclustered point → callback
    const props = feature.properties as MapFeatureProperties;
    let distanceStr = '?km';
    if (userLocation) {
      const dLat = coords[1] - userLocation.lat;
      const dLng = coords[0] - userLocation.lng;
      distanceStr = `${(Math.sqrt(dLat * dLat + dLng * dLng) * 111).toFixed(1)}km`;
    }
    onPinClick(props, distanceStr);
  }, [viewMode, userLocation, onPinClick]);

  // ── Cursor pointer khi hover cluster/point ──
  const handleMouseEnter = useCallback((e: MapMouseEvent) => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    // 🛡️ Kiểm tra layer có tồn tại
    const existingLayers = ['clusters', 'unclustered-point'].filter(id => map.getLayer(id));
    if (existingLayers.length === 0) return;

    const features = map.queryRenderedFeatures(e.point, {
      layers: existingLayers,
    });
    if (features.length > 0) map.getCanvas().style.cursor = 'pointer';
  }, []);

  const handleMouseLeave = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (map) map.getCanvas().style.cursor = '';
  }, []);

  // ── Radar mode: tính toán vị trí pin ──
  const radarPins = React.useMemo(() => {
    if (!userLocation || viewMode !== 'radar') return [];
    return intents.slice(0, 30).map((intent, idx) => {
      let lat = typeof intent.lat === 'number' ? intent.lat : null;
      let lng = typeof intent.lng === 'number' ? intent.lng : null;
      if (!lat || !lng) {
        const r = 0.02 * Math.sqrt(Math.random());
        const theta = Math.random() * 2 * Math.PI;
        lat = userLocation.lat + r * Math.cos(theta);
        lng = userLocation.lng + r * Math.sin(theta);
      }
      const dLat = lat - userLocation.lat;
      const dLng = lng - userLocation.lng;
      const km = Math.sqrt(dLat * dLat + dLng * dLng) * 111;
      const isCan = intent.type === 'CAN';
      return {
        ...intent, lat, lng,
        distance: `${km.toFixed(1)}km`,
        delay: idx * 0.5,
        bgColor: isCan ? 'bg-red-500' : 'bg-[#0068FF]',
        radarGlow: isCan
          ? 'shadow-[0_0_15px_rgba(239,68,68,0.8)]'
          : 'shadow-[0_0_15px_rgba(0,104,255,0.8)]',
      };
    });
  }, [userLocation, intents, viewMode]);

  if (!userLocation) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 relative overflow-hidden">
        {/* Shimmer background */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 animate-pulse" />
        {/* Fake map grid lines */}
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'linear-gradient(#9ca3af 1px, transparent 1px), linear-gradient(90deg, #9ca3af 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        {/* Loading content */}
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-[3px] border-[#0068FF]/30 border-t-[#0068FF] rounded-full animate-spin" />
          <p className="text-sm font-semibold text-gray-500">Đang xin vị trí của bạn...</p>
          <p className="text-xs text-gray-400">Cho phép truy cập GPS để hiển thị bản đồ</p>
        </div>
      </div>
    );
  }

  const mapStyle = viewMode === 'radar'
    ? 'mapbox://styles/mapbox/dark-v11'
    : 'mapbox://styles/mapbox/light-v11';

  return (
    <div className="w-full h-full relative bg-gray-100">
      <Map
        ref={mapRef}
        id="main-map"
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        onClick={handleMapClick}
        onMouseMove={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onLoad={() => setIsMapReady(true)}
        mapStyle={mapStyle}
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%', opacity: isMapReady ? 1 : 0, transition: 'opacity 0.6s ease-in-out' }}
        attributionControl={false}
        interactiveLayerIds={viewMode === 'map' ? ['clusters', 'unclustered-point'] : []}
      >
        {/* ── Vị trí người dùng (cả 2 mode) ── */}
        <Marker longitude={userLocation.lng} latitude={userLocation.lat} anchor="center">
          <div className="relative flex items-center justify-center w-12 h-12">
            <div className="absolute w-full h-full bg-[#0068FF]/30 rounded-full animate-ping" />
            <div className="w-6 h-6 bg-[#0068FF] rounded-full border-2 border-white shadow-xl relative z-10" />
          </div>
        </Marker>

        {/* ══ MAP MODE: Choropleth Lớp nền tô màu Phường/Xã ══ */}
        {viewMode === 'map' && choroplethGeojson && (
          <Source id="wards" type="geojson" data={choroplethGeojson as GeoJSON.FeatureCollection}>
            <Layer {...wardFillLayerStyle} />
            <Layer {...wardStrokeLayerStyle} />
            <Layer {...wardLabelLayerStyle} />
          </Source>
        )}

        {/* ══ MAP MODE: GeoJSON Source/Layer (GPU render, clustering) ══ */}
        {viewMode === 'map' && geojson && (
          <Source
            id="intents"
            type="geojson"
            data={geojson}
            cluster={true}
            clusterMaxZoom={14}
            clusterRadius={50}
          >
            <Layer {...clusterLayerStyle} />
            <Layer {...clusterCountLayerStyle} />
            <Layer {...unclusteredPointLayerStyle} />
          </Source>
        )}

        {/* Loading toast — fade in/out */}
        <div
          className={`absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md rounded-full px-5 py-2.5 text-sm font-medium text-gray-600 shadow-lg flex items-center gap-2.5 z-10 transition-all duration-500 ${viewMode === 'map' && isMapLoading
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-2 pointer-events-none'
            }`}
        >
          <div className="w-3.5 h-3.5 border-2 border-[#0068FF] border-t-transparent rounded-full animate-spin" />
          Đang tải dữ liệu bản đồ...
        </div>

        {/* ══ RADAR MODE: React Marker (animation CSS pulse) ══ */}
        {viewMode === 'radar' && radarPins.map(pin => (
          <Marker key={pin.id} longitude={pin.lng} latitude={pin.lat} anchor="center">
            <div
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                const props: MapFeatureProperties = {
                  id: pin.id,
                  type: pin.type as 'CAN' | 'CO',
                  title: pin.title,
                  price: pin.price ?? pin.price_min ?? null,
                  district: pin.district ?? null,
                  ward: pin.ward ?? null,
                  city: pin.city ?? null,
                  subcategory: pin.subcategory ?? null,
                  trustScore: pin.trust_score ?? 0,
                  verificationLevel: pin.verification_level ?? 'none',
                  imageUrl: pin.images?.[0]?.url ?? null,
                  userName: pin.user?.name ?? 'Người dùng',
                };
                onPinClick(props, pin.distance);
              }}
              className="cursor-pointer hover:scale-150 transition-transform p-4 -m-4"
            >
              <div
                className={`w-3 h-3 rounded-full border border-white animate-pulse ${pin.bgColor} ${pin.radarGlow}`}
                style={{ animationDelay: `${pin.delay}s` }}
              />
            </div>
          </Marker>
        ))}

        {/* Lớp phủ hiệu ứng Radar */}
        {viewMode === 'radar' && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0 overflow-hidden">
            <div className="relative w-[300px] h-[300px] md:w-[600px] md:h-[600px] rounded-full border border-cyan-500/20">
              <div className="absolute inset-0 border border-cyan-500/10 rounded-full scale-75" />
              <div className="absolute inset-0 border border-cyan-500/30 rounded-full scale-50" />
              <div className="absolute w-1/2 h-1/2 top-0 right-0 origin-bottom-left border-r-2 border-cyan-400 bg-gradient-to-tr from-cyan-500/40 to-transparent animate-[spin_3s_linear_infinite] rounded-tr-full" />
            </div>
            <div className="absolute top-[15%] text-cyan-400 text-xs md:text-sm tracking-widest uppercase font-bold animate-pulse drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]">
              Đang quét bán kính 3km...
            </div>
          </div>
        )}
      </Map>
    </div>
  );
}
