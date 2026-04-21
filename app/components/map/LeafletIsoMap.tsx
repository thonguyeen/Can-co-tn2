'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, Clock, MapPin } from 'lucide-react';
import { getIsochrone, getPOIs, type POI, type IsochroneResult } from '@/lib/services/ors';

// ─────────────────────────────────────────────────────────────────────────────
// LeafletIsoMap — Leaflet + CartoDB Dark tiles + ORS Isochrone
// Uses lib/services/ors.ts — real ORS API with localStorage cache + mock fallback
// ─────────────────────────────────────────────────────────────────────────────

interface LeafletIsoMapProps {
    lat: number | null;
    lng: number | null;
    address?: string;
    className?: string;
    showIsochrone?: boolean;
    showPOIs?: boolean;
}

const ISO_CONFIGS = [
    { minutes: 5, radiusKm: 1.5, color: '#22c55e', fillColor: '#22c55e', label: '5 phút' },
    { minutes: 15, radiusKm: 5, color: '#eab308', fillColor: '#eab308', label: '15 phút' },
    { minutes: 30, radiusKm: 12, color: '#ef4444', fillColor: '#ef4444', label: '30 phút' },
];

export function LeafletIsoMap({
    lat, lng, address, className = '',
    showIsochrone = true, showPOIs = true,
}: LeafletIsoMapProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const isoLayersRef = useRef<L.Layer[]>([]);
    const poiLayersRef = useRef<L.Layer[]>([]);

    const [mapReady, setMapReady] = useState(false);
    const [isoData, setIsoData] = useState<IsochroneResult[]>([]);
    const [pois, setPois] = useState<POI[]>([]);
    const [activeMinutes, setActiveMinutes] = useState<number | null>(null);
    const [isoLoading, setIsoLoading] = useState(false);

    const centerLat = lat ?? 10.7769;
    const centerLng = lng ?? 106.7009;

    // ── Initialize Leaflet map ──
    useEffect(() => {
        if (!mapContainerRef.current || mapInstanceRef.current) return;

        import('leaflet').then((L) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            delete (L.Icon.Default.prototype as any)._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
                iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
            });

            const map = L.map(mapContainerRef.current!, {
                center: [centerLat, centerLng],
                zoom: 14,
                zoomControl: false,
                attributionControl: false,
            });

            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(map);
            L.control.zoom({ position: 'bottomright' }).addTo(map);

            // Property pin (violet)
            const violetIcon = L.divIcon({
                html: `<div style="width:32px;height:32px;background:#7c3aed;border:3px solid white;border-radius:50%;box-shadow:0 2px 10px rgba(124,58,237,0.6);display:flex;align-items:center;justify-content:center">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M3 22V8l9-6 9 6v14H3z"/></svg>
                </div>`,
                className: '',
                iconSize: [32, 32],
                iconAnchor: [16, 16],
            });
            L.marker([centerLat, centerLng], { icon: violetIcon })
                .bindPopup(`<b>${address || 'Vị trí BĐS'}</b>`)
                .addTo(map);

            mapInstanceRef.current = map;
            setMapReady(true);
        });

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Load isochrone data ──
    useEffect(() => {
        if (!mapReady || !showIsochrone) return;
        setIsoLoading(true);
        Promise.all(ISO_CONFIGS.map(cfg => getIsochrone(centerLat, centerLng, cfg.minutes)))
            .then(setIsoData)
            .finally(() => setIsoLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mapReady, showIsochrone]);

    // ── Draw isochrone polygons ──
    useEffect(() => {
        if (!mapInstanceRef.current || isoData.length === 0) return;
        import('leaflet').then((L) => {
            const map = mapInstanceRef.current!;
            // Remove old layers
            isoLayersRef.current.forEach(l => map.removeLayer(l));
            isoLayersRef.current = [];

            // Draw largest first
            const sorted = [...ISO_CONFIGS].sort((a, b) => b.minutes - a.minutes);
            sorted.forEach((cfg) => {
                const data = isoData.find(d => d.minutes === cfg.minutes);
                if (!data) return;
                const isActive = activeMinutes === null || activeMinutes === cfg.minutes;
                const layer = L.polygon(data.coords, {
                    color: cfg.color,
                    fillColor: cfg.fillColor,
                    fillOpacity: isActive ? 0.15 : 0.04,
                    weight: isActive ? 2.5 : 0.8,
                    opacity: isActive ? 0.9 : 0.25,
                } as L.PolylineOptions).addTo(map);
                isoLayersRef.current.push(layer);
            });
        });
    }, [isoData, activeMinutes]);

    // ── Load POIs ──
    useEffect(() => {
        if (!mapReady || !showPOIs) return;
        getPOIs(centerLat, centerLng, 1200).then(setPois);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mapReady, showPOIs]);

    // ── Draw POI markers ──
    useEffect(() => {
        if (!mapInstanceRef.current || pois.length === 0) return;
        import('leaflet').then((L) => {
            const map = mapInstanceRef.current!;
            poiLayersRef.current.forEach(l => map.removeLayer(l));
            poiLayersRef.current = [];

            pois.forEach(poi => {
                const icon = L.divIcon({
                    html: `<div style="font-size:20px;filter:drop-shadow(0 1px 3px rgba(0,0,0,0.6));line-height:1">${poi.emoji}</div>`,
                    className: '',
                    iconSize: [24, 24],
                    iconAnchor: [12, 12],
                });
                const distLabel = poi.distanceM ? `<br/><small style="color:#aaa">${poi.distanceM < 1000 ? poi.distanceM + 'm' : (poi.distanceM / 1000).toFixed(1) + 'km'}</small>` : '';
                const marker = L.marker([poi.lat, poi.lng], { icon })
                    .bindPopup(`<b>${poi.name}</b>${distLabel}`)
                    .addTo(map);
                poiLayersRef.current.push(marker);
            });
        });
    }, [pois]);

    return (
        <div className={`relative ${className}`}>
            {/* Leaflet CSS */}
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />

            {/* Map container */}
            <div ref={mapContainerRef} className="absolute inset-0 z-0" />

            {/* Loading overlay */}
            {!mapReady && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0f0f1a]">
                    <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
                </div>
            )}

            {/* ── Isochrone toggle pills ── */}
            {showIsochrone && mapReady && (
                <div className="absolute top-3 left-3 z-[1000] flex flex-col gap-1.5">
                    <div className="bg-black/65 backdrop-blur-md rounded-xl px-3 py-2 space-y-1">
                        <p className="text-[9px] uppercase tracking-wider text-white/50 font-bold flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {isoLoading ? 'Đang tải...' : 'Isochrone'}
                        </p>
                        {ISO_CONFIGS.map(({ minutes, color, label }) => (
                            <button
                                key={minutes}
                                onClick={() => setActiveMinutes(activeMinutes === minutes ? null : minutes)}
                                className={`flex items-center gap-2 w-full px-2 py-1 rounded-lg text-xs font-semibold transition cursor-pointer
                                    ${activeMinutes === minutes ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white/80'}`}
                            >
                                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Address label ── */}
            <div className="absolute bottom-3 left-3 z-[1000] bg-black/65 backdrop-blur-md rounded-lg px-3 py-1.5 flex items-center gap-1.5 max-w-[65%]">
                <MapPin className="w-3 h-3 text-violet-400 shrink-0" />
                <span className="text-[10px] text-white/70 font-medium truncate">
                    {address || 'TP.HCM'}
                </span>
            </div>

            {/* ── Expand hint ── */}
            <button className="absolute bottom-3 right-3 z-[1000] bg-black/65 backdrop-blur-md rounded-lg px-3 py-1.5 text-white/50 text-[10px] hover:text-white/70 transition cursor-pointer font-semibold">
                🗺 Mở rộng
            </button>
        </div>
    );
}
