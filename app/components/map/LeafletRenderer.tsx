'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useWardPrices } from '@/hooks/useMapData';
import { type MockIntent } from '@/lib/mock/intents';
import type { MapFeatureProperties, MapFilters } from '@/types/map';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

// ─────────────────────────────────────────────────────────────────────────────
// LeafletRenderer — Drop-in replacement for MapboxRenderer
// Same props interface → change 1 import line in MapRadarTab.tsx
// Zero cost: CartoDB Dark/Light tiles + JS clustering (no token needed)
// ─────────────────────────────────────────────────────────────────────────────

interface LeafletRendererProps {
    viewMode: 'map' | 'radar';
    userLocation: { lat: number; lng: number } | null;
    lat?: number;
    lng?: number;
    intents: MockIntent[];
    onPinClick: (pin: MapFeatureProperties, distance: string) => void;
    selectedPinId: string | null;
    filters?: MapFilters;
}

// ── Color helpers (mirrors MapboxRenderer color logic) ──
function getPinColor(type: string, price: number | null): string {
    if (type === 'CAN') return '#ef4444';    // rose-500  (cần tìm)
    return '#0068FF';                         // blue      (đang bán/cho thuê)
}

function getPinRadius(price: number | null): number {
    const p = price ?? 0;
    if (p > 5_000_000_000) return 14;
    if (p > 2_000_000_000) return 11;
    return 8;
}

// ── Cluster color by count (mirrors clusterLayerStyle) ──
function getClusterColor(count: number): string {
    if (count >= 30) return '#1d4ed8';   // blue-700
    if (count >= 10) return '#3b82f6';   // blue-500
    return '#60a5fa';                     // blue-400
}

// ── Distance calc (same formula as MapboxRenderer) ──
function calcDistance(
    lat1: number, lng1: number,
    lat2: number, lng2: number,
    userLoc: { lat: number; lng: number } | null
): string {
    if (!userLoc) return '?km';
    const dLat = lat1 - userLoc.lat;
    const dLng = lng1 - userLoc.lng;
    return `${(Math.sqrt(dLat * dLat + dLng * dLng) * 111).toFixed(1)}km`;
}

// ── Price color interpolation (mirrors wardFillLayerStyle paint) ──
function priceToColor(avgPrice: number | undefined): string {
    if (!avgPrice || avgPrice === 0) return '#d1fae5';
    if (avgPrice < 500_000_000) return '#bbf7d0';
    if (avgPrice < 2_000_000_000) return '#fef08a';
    if (avgPrice < 5_000_000_000) return '#fdba74';
    if (avgPrice < 10_000_000_000) return '#f87171';
    if (avgPrice < 20_000_000_000) return '#dc2626';
    return '#7c3aed';
}

function formatPriceLabel(avg: number): string {
    if (avg >= 1_000_000_000) return `~${(avg / 1_000_000_000).toFixed(1)} tỷ`;
    return `~${Math.round(avg / 1_000_000)} tr`;
}

// ─────────────────────────────────────────────────────────────────────────────
export default function LeafletRenderer({
    viewMode,
    userLocation,
    intents,
    onPinClick,
    selectedPinId,
    filters = {},
}: LeafletRendererProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const clusterGroupRef = useRef<any>(null);
    const userMarkerRef = useRef<L.CircleMarker | null>(null);
    const radarMarkersRef = useRef<L.Marker[]>([]);
    const radarOverlayRef = useRef<L.DivOverlay | null>(null);
    const choroplethLayerRef = useRef<L.GeoJSON | null>(null);
    const [mapReady, setMapReady] = useState(false);

    // ── Choropleth data hooks (same logic as MapboxRenderer) ──
    const { wardPrices } = useWardPrices();
    const [boundaryGeojson, setBoundaryGeojson] = useState<GeoJSON.FeatureCollection | null>(null);

    // Load ward boundaries once
    useEffect(() => {
        fetch('/geojson/hcm-wards.geojson')
            .then(r => r.json())
            .then(setBoundaryGeojson)
            .catch(err => console.error('[Choropleth] boundary load error:', err));
    }, []);

    // Join avgPrice into boundary features (same useMemo as MapboxRenderer)
    const choroplethGeojson = useMemo(() => {
        if (!boundaryGeojson) return null;
        return {
            ...boundaryGeojson,
            features: boundaryGeojson.features.map(f => {
                const name = (f.properties?.name ?? '') as string;
                const priceData = wardPrices[name];
                if (!priceData) return f;
                return {
                    ...f,
                    properties: {
                        ...f.properties,
                        avgPrice: priceData.avgPrice,
                        count: priceData.count,
                        priceLabel: formatPriceLabel(priceData.avgPrice),
                    },
                };
            }),
        };
    }, [boundaryGeojson, wardPrices]);


    const centerLat = userLocation?.lat ?? 10.7766;
    const centerLng = userLocation?.lng ?? 106.6953;

    // ── Task 1: Initialize map ──
    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;

        import('leaflet').then((L) => {
            import('leaflet.markercluster').then(() => {

                // Fix default icon path (Next.js webpack issue)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                delete (L.Icon.Default.prototype as any)._getIconUrl;
                L.Icon.Default.mergeOptions({
                    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
                    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
                });

                const map = L.map(containerRef.current!, {
                    center: [centerLat, centerLng],
                    zoom: 13,
                    zoomControl: false,
                    attributionControl: false,
                });

                // ── Tiles: CartoDB Dark (radar) / Light (map) ──
                const darkTile = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
                const lightTile = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

                const tileUrl = viewMode === 'radar' ? darkTile : lightTile;
                const tileLayer = L.tileLayer(tileUrl, { maxZoom: 19 });
                tileLayer.addTo(map);
                (map as L.Map & { _tileLayer?: L.TileLayer })._tileLayer = tileLayer;

                // Fallback if CartoDB fails
                tileLayer.on('tileerror', () => {
                    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
                });

                // Zoom control bottom-right
                L.control.zoom({ position: 'bottomright' }).addTo(map);

                mapRef.current = map;
                setMapReady(true);
            });
        });

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
                clusterGroupRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Task 5: User location marker (pulsing blue dot) ──
    useEffect(() => {
        if (!mapRef.current || !userLocation) return;

        import('leaflet').then((L) => {
            const map = mapRef.current!;

            if (userMarkerRef.current) {
                userMarkerRef.current.remove();
            }

            // Custom pulsing dot via divIcon
            const pulseIcon = L.divIcon({
                html: `
                    <div style="position:relative;width:48px;height:48px;display:flex;align-items:center;justify-content:center">
                        <div style="position:absolute;width:48px;height:48px;background:rgba(0,104,255,0.25);border-radius:50%;animation:leaflet-pulse 2s ease-out infinite"></div>
                        <div style="width:20px;height:20px;background:#0068FF;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,104,255,0.5)"></div>
                    </div>
                    <style>@keyframes leaflet-pulse{0%{transform:scale(0.5);opacity:0.8}100%{transform:scale(1.5);opacity:0}}</style>
                `,
                className: '',
                iconSize: [48, 48],
                iconAnchor: [24, 24],
            });

            const marker = L.marker([userLocation.lat, userLocation.lng], { icon: pulseIcon, zIndexOffset: 1000 });
            marker.addTo(map);
            userMarkerRef.current = marker as unknown as L.CircleMarker;

            // Fly to user on first location
            map.setView([userLocation.lat, userLocation.lng], map.getZoom());
        });
    }, [userLocation]);

    // ── Tasks 2+3+4: Intent pins with clustering (MAP mode) ──
    useEffect(() => {
        if (!mapRef.current || viewMode !== 'map') return;

        import('leaflet').then((L) => {
            import('leaflet.markercluster').then(() => {
                const map = mapRef.current!;

                // Clear existing cluster group
                if (clusterGroupRef.current) {
                    map.removeLayer(clusterGroupRef.current);
                }

                // Task 3: Custom cluster icon (blue gradient by count)
                // leaflet.markercluster patches window.L, not the ES module import
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const LG = (typeof window !== 'undefined' && (window as any).L) ? (window as any).L : L;
                const mcg = LG.markerClusterGroup({
                    maxClusterRadius: 50,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    iconCreateFunction: (cluster: any) => {
                        const count = cluster.getChildCount();
                        const color = getClusterColor(count);
                        const size = count >= 30 ? 42 : count >= 10 ? 32 : 22;
                        return L.divIcon({
                            html: `
                                <div style="
                                    width:${size}px;height:${size}px;
                                    background:${color};
                                    border:3px solid white;
                                    border-radius:50%;
                                    display:flex;align-items:center;justify-content:center;
                                    color:white;font-size:${size < 32 ? 11 : 13}px;font-weight:bold;
                                    box-shadow:0 2px 8px rgba(0,0,0,0.3);
                                    opacity:0.92;
                                ">${count}</div>
                            `,
                            className: '',
                            iconSize: [size, size],
                            iconAnchor: [size / 2, size / 2],
                        });
                    },
                });

                // Task 2: Add intent markers
                const validIntents = intents.filter(intent =>
                    typeof intent.lat === 'number' && typeof intent.lng === 'number'
                );

                validIntents.forEach((intent) => {
                    const lat = intent.lat as number;
                    const lng = intent.lng as number;
                    const price = intent.price ?? intent.price_min ?? null;
                    const pinColor = getPinColor(intent.type, price);
                    const radius = getPinRadius(price);
                    const isSelected = intent.id === selectedPinId;

                    const pinIcon = L.divIcon({
                        html: `
                            <div style="
                                width:${radius * 2}px;height:${radius * 2}px;
                                background:${pinColor};
                                border:${isSelected ? 4 : 2.5}px solid white;
                                border-radius:50%;
                                box-shadow:0 2px 6px rgba(0,0,0,0.35);
                                opacity:0.95;
                                ${isSelected ? `box-shadow:0 0 0 3px ${pinColor}80,0 2px 8px rgba(0,0,0,0.4)` : ''}
                            "></div>
                        `,
                        className: '',
                        iconSize: [radius * 2, radius * 2],
                        iconAnchor: [radius, radius],
                    });

                    const marker = L.marker([lat, lng], { icon: pinIcon });

                    // Task 4: Pin click → onPinClick callback
                    marker.on('click', () => {
                        const distanceStr = calcDistance(lat, lng, 0, 0, userLocation);
                        const props: MapFeatureProperties = {
                            id: intent.id,
                            type: intent.type as 'CAN' | 'CO',
                            title: intent.title,
                            price: price,
                            district: intent.district ?? null,
                            ward: intent.ward ?? null,
                            city: intent.city ?? null,
                            subcategory: intent.subcategory ?? null,
                            trustScore: intent.trust_score ?? 0,
                            verificationLevel: intent.verification_level ?? 'none',
                            imageUrl: intent.images?.[0]?.url ?? null,
                            userName: intent.user?.name ?? 'Người dùng',
                        };
                        onPinClick(props, distanceStr);
                    });

                    mcg.addLayer(marker);
                });

                // Task 3: Cluster expand on click (built-in MarkerClusterGroup)
                map.addLayer(mcg);
                clusterGroupRef.current = mcg;
            });
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [intents, userLocation, viewMode, selectedPinId]);

    // ── Radar mode markers + overlay ──
    useEffect(() => {
        if (!mapRef.current || !userLocation || viewMode !== 'radar') return;

        import('leaflet').then((L) => {
            const map = mapRef.current!;

            // Clear cluster group if switching from map mode
            if (clusterGroupRef.current) {
                map.removeLayer(clusterGroupRef.current);
                clusterGroupRef.current = null;
            }

            // Clear old radar markers
            radarMarkersRef.current.forEach(m => map.removeLayer(m));
            radarMarkersRef.current = [];

            const radarPins = intents.slice(0, 30).map((intent, idx) => {
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
                const km = (Math.sqrt(dLat * dLat + dLng * dLng) * 111).toFixed(1);
                const isCan = intent.type === 'CAN';
                return { ...intent, lat, lng, distance: `${km}km`, delay: idx * 0.5, isCan };
            });

            radarPins.forEach((pin) => {
                const pulseIcon = L.divIcon({
                    html: `
                        <div style="padding:16px;margin:-16px;cursor:pointer">
                            <div style="
                                width:12px;height:12px;
                                background:${pin.isCan ? '#ef4444' : '#0068FF'};
                                border:1px solid white;
                                border-radius:50%;
                                animation:leaflet-pulse-pin 2s ease-in-out ${pin.delay}s infinite;
                                box-shadow:0 0 15px ${pin.isCan ? 'rgba(239,68,68,0.8)' : 'rgba(0,104,255,0.8)'};
                            "></div>
                        </div>
                        <style>@keyframes leaflet-pulse-pin{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.3);opacity:0.7}}</style>
                    `,
                    className: '',
                    iconSize: [12, 12],
                    iconAnchor: [6, 6],
                });

                const marker = L.marker([pin.lat, pin.lng], { icon: pulseIcon, zIndexOffset: 500 });

                marker.on('click', () => {
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
                });

                marker.addTo(map);
                radarMarkersRef.current.push(marker);
            });

            // Center on user in radar mode
            map.setView([userLocation.lat, userLocation.lng], 13);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [intents, userLocation, viewMode]);

    // ── Task 6: Fly-to selected pin ──
    useEffect(() => {
        if (!mapRef.current || !selectedPinId || !intents) return;
        const intent = intents.find(i => i.id === selectedPinId);
        if (!intent || typeof intent.lat !== 'number' || typeof intent.lng !== 'number') return;
        mapRef.current.flyTo([intent.lat, intent.lng], 15, { duration: 0.7 });
    }, [selectedPinId, intents]);

    // ── Phase 02: Choropleth GeoJSON layer (tasks 1-4) ──
    useEffect(() => {
        if (!mapRef.current || !choroplethGeojson || viewMode !== 'map') return;

        import('leaflet').then((L) => {
            const map = mapRef.current!;

            // Remove old choropleth layer
            if (choroplethLayerRef.current) {
                map.removeLayer(choroplethLayerRef.current);
            }

            // Task 1: GeoJSON fill layer — color by avgPrice
            const layer = L.geoJSON(choroplethGeojson as GeoJSON.GeoJsonObject, {
                style: (feature) => {
                    const avgPrice = feature?.properties?.avgPrice as number | undefined;
                    const zoom = map.getZoom();

                    // Task 4: Zoom-based fill opacity (mirrors wardFillLayerStyle)
                    let fillOpacity = 0;
                    if (zoom <= 10) fillOpacity = 0;
                    else if (zoom <= 11) fillOpacity = 0.55;
                    else if (zoom <= 13) fillOpacity = 0.45;
                    else if (zoom <= 14) fillOpacity = 0.15;
                    else fillOpacity = 0;

                    // Task 4: Border opacity fade by zoom
                    const borderOpacity = zoom >= 15 ? 0 : zoom >= 11 ? 0.4 : 0;

                    return {
                        fillColor: priceToColor(avgPrice),
                        fillOpacity,
                        color: 'rgba(100,100,100,' + borderOpacity + ')',
                        weight: 1,
                        opacity: 1,
                    };
                },

                // Task 2: Ward label as permanent tooltip
                onEachFeature: (feature, featureLayer) => {
                    const name = feature.properties?.name as string | undefined;
                    const priceLabel = feature.properties?.priceLabel as string | undefined;

                    if (name) {
                        const tooltipContent = priceLabel
                            ? `<div style="font-size:10px;font-weight:600;line-height:1.3;text-align:center;color:#1f2937">${name}<br/><span style="color:#7c3aed">${priceLabel}</span></div>`
                            : `<div style="font-size:10px;font-weight:600;color:#1f2937">${name}</div>`;

                        featureLayer.bindTooltip(tooltipContent, {
                            permanent: true,
                            direction: 'center',
                            className: 'ward-tooltip',
                            opacity: map.getZoom() >= 15 ? 0 : map.getZoom() >= 11 ? 0.9 : 0,
                        });
                    }

                    // Task 3: Hover highlight — yellow stroke
                    featureLayer.on('mouseover', (e) => {
                        (e.target as L.Path).setStyle({
                            color: '#f59e0b',
                            weight: 2.5,
                            fillOpacity: 0.35,
                        });
                    });
                    featureLayer.on('mouseout', () => {
                        layer.resetStyle(featureLayer as L.Layer);
                    });
                },
            });

            // Insert choropleth BELOW cluster pins (pane order)
            layer.addTo(map);
            choroplethLayerRef.current = layer;

            // Task 4: Re-style on zoom change (update opacity)
            const onZoom = () => {
                const zoom = map.getZoom();
                layer.eachLayer((l) => {
                    const feature = (l as L.GeoJSON).feature as GeoJSON.Feature;
                    const avgPrice = feature?.properties?.avgPrice as number | undefined;

                    let fillOpacity = 0;
                    if (zoom <= 10) fillOpacity = 0;
                    else if (zoom <= 11) fillOpacity = 0.55;
                    else if (zoom <= 13) fillOpacity = 0.45;
                    else if (zoom <= 14) fillOpacity = 0.15;
                    else fillOpacity = 0;

                    const borderOpacity = zoom >= 15 ? 0 : zoom >= 11 ? 0.4 : 0;

                    (l as L.Path).setStyle({
                        fillColor: priceToColor(avgPrice),
                        fillOpacity,
                        color: `rgba(100,100,100,${borderOpacity})`,
                        weight: 1,
                    });

                    // Update tooltip opacity by zoom
                    const tooltip = (l as L.Layer).getTooltip?.();
                    if (tooltip) {
                        tooltip.setOpacity(zoom >= 15 ? 0 : zoom >= 11 ? 0.9 : 0);
                    }
                });
            };

            map.on('zoomend', onZoom);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [choroplethGeojson, viewMode, mapReady]);

    // Task 5: Clear choropleth on radar mode switch
    useEffect(() => {
        if (!mapRef.current || !choroplethLayerRef.current) return;
        if (viewMode === 'radar') {
            mapRef.current.removeLayer(choroplethLayerRef.current);
            choroplethLayerRef.current = null;
        }
    }, [viewMode]);

    return (
        <div className="w-full h-full relative">
            {/* Leaflet CSS */}
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />

            {/* Map container */}
            <div ref={containerRef} className="absolute inset-0 z-0" />

            {/* ── Radar overlay (CSS — no 3D pitch, flat but animated) ── */}
            {viewMode === 'radar' && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-[500] overflow-hidden">
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

            {/* Loading data toast */}
            {viewMode === 'map' && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none z-[1000] opacity-0">
                    {/* Shown via CSS animation when tiles are loading */}
                </div>
            )}
        </div>
    );
}
