'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, Clock, MapPin } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// LeafletIsoMap — Leaflet + CartoDB Dark tiles + ORS Isochrone demo
// Replaces Mapbox static image. Zero-cost, self-hostable.
// ─────────────────────────────────────────────────────────────────────────────

interface LeafletIsoMapProps {
    lat: number | null;
    lng: number | null;
    address?: string;
    className?: string;
    showIsochrone?: boolean;  // toggle isochrone overlay
}

// Isochrone polygon data (from ORS or mock)
interface IsochroneLayer {
    minutes: number;
    color: string;
    fillColor: string;
    coords: [number, number][];  // [lat, lng][]
}

// ORS public API key (free tier: 500 req/day — enough for prototype)
const ORS_API_KEY = process.env.NEXT_PUBLIC_ORS_API_KEY || '';

// ── Generate mock isochrone polygons (circle approximation) ──
function generateMockIsochrone(lat: number, lng: number, radiusKm: number, points = 36): [number, number][] {
    const coords: [number, number][] = [];
    for (let i = 0; i <= points; i++) {
        const angle = (i / points) * 2 * Math.PI;
        // Add random jitter for natural shape (±20%)
        const jitter = 0.8 + Math.random() * 0.4;
        const dLat = (radiusKm * jitter / 111) * Math.cos(angle);
        const dLng = (radiusKm * jitter / (111 * Math.cos(lat * Math.PI / 180))) * Math.sin(angle);
        coords.push([lat + dLat, lng + dLng]);
    }
    return coords;
}

// ── Fetch real isochrone from ORS API ──
async function fetchIsochrone(lat: number, lng: number, minutes: number): Promise<[number, number][] | null> {
    if (!ORS_API_KEY) return null;
    try {
        const res = await fetch('https://api.openrouteservice.org/v2/isochrones/driving-car', {
            method: 'POST',
            headers: {
                'Authorization': ORS_API_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                locations: [[lng, lat]],  // ORS uses [lng, lat]
                range: [minutes * 60],    // seconds
                range_type: 'time',
            }),
        });
        const data = await res.json();
        if (data.features?.[0]?.geometry?.coordinates?.[0]) {
            // GeoJSON coords are [lng, lat] → convert to [lat, lng] for Leaflet
            return data.features[0].geometry.coordinates[0].map(
                (c: number[]) => [c[1], c[0]] as [number, number]
            );
        }
    } catch (e) {
        console.warn('[ORS isochrone] fetch failed, using mock:', e);
    }
    return null;
}

// ── Mock POIs around location ──
function generateMockPOIs(lat: number, lng: number) {
    return [
        { name: 'Trường THPT', type: '🏫', lat: lat + 0.003, lng: lng + 0.004 },
        { name: 'Bệnh viện Quận', type: '🏥', lat: lat - 0.005, lng: lng + 0.002 },
        { name: 'Siêu thị CoopMart', type: '🛒', lat: lat + 0.001, lng: lng - 0.003 },
        { name: 'Chợ Phường', type: '🏪', lat: lat - 0.002, lng: lng - 0.004 },
        { name: 'Công viên', type: '🌳', lat: lat + 0.004, lng: lng - 0.001 },
    ];
}

export function LeafletIsoMap({ lat, lng, address, className = '', showIsochrone = true }: LeafletIsoMapProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const [mapReady, setMapReady] = useState(false);
    const [isoLayers, setIsoLayers] = useState<IsochroneLayer[]>([]);
    const [activeMinutes, setActiveMinutes] = useState<number | null>(null);

    const centerLat = lat ?? 10.7769;
    const centerLng = lng ?? 106.7009;

    // ── Initialize Leaflet map ──
    useEffect(() => {
        if (!mapContainerRef.current || mapInstanceRef.current) return;

        // Dynamic import to avoid SSR
        import('leaflet').then((L) => {
            // Fix default marker icons
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

            // CartoDB Dark Matter tiles (free, dark theme, matches Dark Navy)
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                maxZoom: 19,
            }).addTo(map);

            // Zoom control bottom-right
            L.control.zoom({ position: 'bottomright' }).addTo(map);

            // Property pin (violet)
            const violetIcon = L.divIcon({
                html: `<div style="width:28px;height:28px;background:#7c3aed;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M3 22V8l9-6 9 6v14H3z"/></svg>
                </div>`,
                className: '',
                iconSize: [28, 28],
                iconAnchor: [14, 14],
            });
            L.marker([centerLat, centerLng], { icon: violetIcon })
                .bindPopup(`<b>${address || 'Vị trí BĐS'}</b>`)
                .addTo(map);

            // POI markers
            const pois = generateMockPOIs(centerLat, centerLng);
            pois.forEach(poi => {
                const poiIcon = L.divIcon({
                    html: `<div style="font-size:18px;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.5))">${poi.type}</div>`,
                    className: '',
                    iconSize: [24, 24],
                    iconAnchor: [12, 12],
                });
                L.marker([poi.lat, poi.lng], { icon: poiIcon })
                    .bindPopup(`<b>${poi.name}</b><br/><small>${poi.type}</small>`)
                    .addTo(map);
            });

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

    // ── Load isochrone layers ──
    useEffect(() => {
        if (!mapReady || !showIsochrone) return;

        const layers = [
            { minutes: 5, radiusKm: 1.5, color: '#22c55e', fillColor: '#22c55e' },
            { minutes: 15, radiusKm: 5, color: '#eab308', fillColor: '#eab308' },
            { minutes: 30, radiusKm: 12, color: '#ef4444', fillColor: '#ef4444' },
        ];

        Promise.all(
            layers.map(async (l) => {
                const realCoords = await fetchIsochrone(centerLat, centerLng, l.minutes);
                const coords = realCoords || generateMockIsochrone(centerLat, centerLng, l.radiusKm);
                return { minutes: l.minutes, color: l.color, fillColor: l.fillColor, coords };
            })
        ).then(setIsoLayers);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mapReady, showIsochrone]);

    // ── Draw isochrone polygons on map ──
    useEffect(() => {
        if (!mapInstanceRef.current || isoLayers.length === 0) return;

        import('leaflet').then((L) => {
            const map = mapInstanceRef.current!;

            // Clear existing polygons
            map.eachLayer((layer) => {
                if ((layer as L.Polygon).options?.className === 'isochrone-polygon') {
                    map.removeLayer(layer);
                }
            });

            // Draw from largest to smallest (30 → 15 → 5)
            const sorted = [...isoLayers].sort((a, b) => b.minutes - a.minutes);
            sorted.forEach((iso) => {
                const isActive = activeMinutes === null || activeMinutes === iso.minutes;
                L.polygon(iso.coords, {
                    color: iso.color,
                    fillColor: iso.fillColor,
                    fillOpacity: isActive ? 0.15 : 0.03,
                    weight: isActive ? 2 : 0.5,
                    opacity: isActive ? 0.8 : 0.2,
                    className: 'isochrone-polygon',
                } as L.PolylineOptions).addTo(map);
            });
        });
    }, [isoLayers, activeMinutes]);

    return (
        <div className={`relative ${className}`}>
            {/* Leaflet CSS */}
            <link
                rel="stylesheet"
                href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
            />

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
                    <div className="bg-black/60 backdrop-blur-md rounded-xl px-3 py-2 space-y-1">
                        <p className="text-[9px] uppercase tracking-wider text-white/50 font-bold flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Isochrone
                        </p>
                        {[
                            { min: 5, color: 'bg-green-500', label: '5 phút' },
                            { min: 15, color: 'bg-yellow-500', label: '15 phút' },
                            { min: 30, color: 'bg-red-500', label: '30 phút' },
                        ].map(({ min, color, label }) => (
                            <button
                                key={min}
                                onClick={() => setActiveMinutes(activeMinutes === min ? null : min)}
                                className={`flex items-center gap-2 w-full px-2 py-1 rounded-lg text-xs font-semibold transition cursor-pointer
                                    ${activeMinutes === min ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white/80'}`}
                            >
                                <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Address label ── */}
            <div className="absolute bottom-3 left-3 z-[1000] bg-black/60 backdrop-blur-md rounded-lg px-3 py-1.5 flex items-center gap-1.5 max-w-[60%]">
                <MapPin className="w-3 h-3 text-violet-400 shrink-0" />
                <span className="text-[10px] text-white/70 font-medium truncate">
                    {address || 'TP.HCM'}
                </span>
            </div>

            {/* ── "Xem bản đồ" expand hint ── */}
            <button className="absolute bottom-3 right-3 z-[1000] bg-black/60 backdrop-blur-md rounded-lg px-3 py-1.5 text-white/40 text-[10px] hover:text-white/60 transition cursor-pointer font-semibold">
                🗺 Mở rộng
            </button>
        </div>
    );
}
