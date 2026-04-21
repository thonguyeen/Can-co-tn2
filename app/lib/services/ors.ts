/**
 * lib/services/ors.ts
 * OpenRouteService API client
 * - Free public API via NEXT_PUBLIC_ORS_API_KEY (500 req/day)
 * - Self-host via ORS_SELF_HOST_URL for production
 * - All functions gracefully fall back to mock data if unavailable
 */

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────

const ORS_PUBLIC_API = 'https://api.openrouteservice.org';
const ORS_API_KEY = typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_ORS_API_KEY ?? '')
    : (process.env.ORS_API_KEY ?? '');

// Self-hosted ORS URL (overrides public API for all calls)
const ORS_SELF_HOST = process.env.NEXT_PUBLIC_ORS_SELF_HOST_URL ?? '';
const ORS_BASE = ORS_SELF_HOST || ORS_PUBLIC_API;

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface IsochroneResult {
    minutes: number;
    /** Leaflet-friendly [lat, lng] pairs */
    coords: [number, number][];
    /** Whether the coordinates come from ORS or the fallback mock */
    isMock: boolean;
}

export interface POI {
    name: string;
    category: POICategory;
    emoji: string;
    lat: number;
    lng: number;
    /** Straight-line distance in metres from the query point */
    distanceM?: number;
}

export type POICategory = 'school' | 'hospital' | 'supermarket' | 'park' | 'restaurant' | 'market';

export type TransportProfile = 'driving-car' | 'cycling-regular' | 'foot-walking';

export interface DirectionsResult {
    /** GeoJSON LineString coordinates [lng, lat][] */
    coordinates: [number, number][];
    distanceM: number;
    durationSec: number;
    isMock: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal: localStorage cache
// ─────────────────────────────────────────────────────────────────────────────

function cacheKey(prefix: string, params: string) {
    return `ors_cache:${prefix}:${params}`;
}

function readCache<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        const { value, expiry } = JSON.parse(raw) as { value: T; expiry: number };
        if (Date.now() > expiry) {
            localStorage.removeItem(key);
            return null;
        }
        return value;
    } catch {
        return null;
    }
}

function writeCache<T>(key: string, value: T, ttlMs = CACHE_TTL_MS) {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(key, JSON.stringify({ value, expiry: Date.now() + ttlMs }));
    } catch {
        // Quota exceeded — silently skip
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal: ORS auth headers
// ─────────────────────────────────────────────────────────────────────────────

function orsHeaders(): HeadersInit {
    const h: HeadersInit = { 'Content-Type': 'application/json', 'Accept': 'application/json, application/geo+json' };
    if (ORS_API_KEY) h['Authorization'] = ORS_API_KEY;
    return h;
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal: mock generators (fallback when ORS unavailable)
// ─────────────────────────────────────────────────────────────────────────────

function mockIsochroneCoords(lat: number, lng: number, radiusKm: number, points = 48): [number, number][] {
    const coords: [number, number][] = [];
    for (let i = 0; i <= points; i++) {
        const angle = (i / points) * 2 * Math.PI;
        const jitter = 0.75 + Math.random() * 0.5;
        const dLat = (radiusKm * jitter / 111) * Math.cos(angle);
        const dLng = (radiusKm * jitter / (111 * Math.cos(lat * Math.PI / 180))) * Math.sin(angle);
        coords.push([lat + dLat, lng + dLng]);
    }
    return coords;
}

const MOCK_POI_TEMPLATES: { name: string; category: POICategory; emoji: string; dLat: number; dLng: number }[] = [
    { name: 'Trường THPT', category: 'school', emoji: '🏫', dLat: 0.003, dLng: 0.004 },
    { name: 'Trường Tiểu Học', category: 'school', emoji: '🏫', dLat: 0.006, dLng: -0.002 },
    { name: 'Bệnh viện Quận', category: 'hospital', emoji: '🏥', dLat: -0.005, dLng: 0.002 },
    { name: 'Phòng khám đa khoa', category: 'hospital', emoji: '🏥', dLat: -0.002, dLng: 0.006 },
    { name: 'Siêu thị CoopMart', category: 'supermarket', emoji: '🛒', dLat: 0.001, dLng: -0.003 },
    { name: 'Vinmart+', category: 'supermarket', emoji: '🛒', dLat: -0.004, dLng: -0.001 },
    { name: 'Chợ Phường', category: 'market', emoji: '🏪', dLat: -0.002, dLng: -0.004 },
    { name: 'Công viên Gia đình', category: 'park', emoji: '🌳', dLat: 0.004, dLng: -0.001 },
    { name: 'Nhà hàng Bình Dân', category: 'restaurant', emoji: '🍜', dLat: 0.002, dLng: 0.005 },
    { name: 'Cà phê & Ăn sáng', category: 'restaurant', emoji: '☕', dLat: -0.003, dLng: 0.003 },
];

function mockPOIs(lat: number, lng: number): POI[] {
    return MOCK_POI_TEMPLATES.map(t => {
        const poiLat = lat + t.dLat;
        const poiLng = lng + t.dLng;
        const dist = Math.round(
            Math.sqrt(Math.pow(t.dLat * 111000, 2) + Math.pow(t.dLng * 111000 * Math.cos(lat * Math.PI / 180), 2))
        );
        return { name: t.name, category: t.category, emoji: t.emoji, lat: poiLat, lng: poiLng, distanceM: dist };
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch isochrone polygon from ORS for a given travel time.
 * Falls back to a mock circular polygon on error or missing API key.
 */
export async function getIsochrone(
    lat: number,
    lng: number,
    minutes: number,
    profile: TransportProfile = 'driving-car'
): Promise<IsochroneResult> {
    const ck = cacheKey('iso', `${lat.toFixed(4)},${lng.toFixed(4)},${minutes},${profile}`);
    const cached = readCache<IsochroneResult>(ck);
    if (cached) return cached;

    // Radius approximations for mock fallback
    const radiusMap: Record<number, number> = { 5: 1.5, 10: 3.5, 15: 5, 30: 12 };
    const radiusKm = radiusMap[minutes] ?? minutes * 0.4;

    if (!ORS_API_KEY && !ORS_SELF_HOST) {
        const result: IsochroneResult = { minutes, coords: mockIsochroneCoords(lat, lng, radiusKm), isMock: true };
        writeCache(ck, result);
        return result;
    }

    try {
        const res = await fetch(`${ORS_BASE}/v2/isochrones/${profile}`, {
            method: 'POST',
            headers: orsHeaders(),
            body: JSON.stringify({
                locations: [[lng, lat]],
                range: [minutes * 60],
                range_type: 'time',
                smoothing: 0.5,
            }),
        });
        if (!res.ok) throw new Error(`ORS isochrone ${res.status}`);
        const data = await res.json();
        const rawCoords: number[][] = data?.features?.[0]?.geometry?.coordinates?.[0] ?? [];
        if (rawCoords.length === 0) throw new Error('Empty isochrone');
        // GeoJSON [lng, lat] → Leaflet [lat, lng]
        const coords: [number, number][] = rawCoords.map(c => [c[1], c[0]]);
        const result: IsochroneResult = { minutes, coords, isMock: false };
        writeCache(ck, result);
        return result;
    } catch (err) {
        console.warn('[ORS] isochrone error, using mock:', err);
        const result: IsochroneResult = { minutes, coords: mockIsochroneCoords(lat, lng, radiusKm), isMock: true };
        writeCache(ck, result);
        return result;
    }
}

/**
 * Fetch nearby POIs.
 * Falls back to mock POIs on error or missing API key.
 *
 * NOTE: ORS POI API does NOT support numeric category_ids filter in the request body.
 * Instead, we fetch all POIs and map/filter client-side using category_name from response.
 */
export async function getPOIs(
    lat: number,
    lng: number,
    radiusMeters = 1000,
    categories: POICategory[] = ['school', 'hospital', 'supermarket', 'park', 'restaurant', 'market']
): Promise<POI[]> {
    const ck = cacheKey('poi', `${lat.toFixed(3)},${lng.toFixed(3)},${radiusMeters},${categories.join(',')}`);
    const cached = readCache<POI[]>(ck);
    if (cached) return cached;

    if (!ORS_API_KEY && !ORS_SELF_HOST) {
        const mocks = mockPOIs(lat, lng).filter(p => categories.includes(p.category));
        writeCache(ck, mocks);
        return mocks;
    }

    // Map ORS category_name → our POICategory
    const catNameMap: Record<string, POICategory> = {
        school: 'school',
        university: 'school',
        college: 'school',
        kindergarten: 'school',
        hospital: 'hospital',
        clinic: 'hospital',
        doctors: 'hospital',
        pharmacy: 'hospital',
        supermarket: 'supermarket',
        convenience: 'market',
        marketplace: 'market',
        market: 'market',
        park: 'park',
        garden: 'park',
        playground: 'park',
        restaurant: 'restaurant',
        cafe: 'restaurant',
        food_court: 'restaurant',
        fast_food: 'restaurant',
    };

    const emojiMap: Record<POICategory, string> = {
        school: '🏫', hospital: '🏥', supermarket: '🛒',
        market: '🏪', park: '🌳', restaurant: '🍜',
    };

    try {
        const res = await fetch(`${ORS_BASE}/pois`, {
            method: 'POST',
            headers: orsHeaders(),
            body: JSON.stringify({
                request: 'pois',
                geometry: {
                    bbox: [
                        [lng - 0.01, lat - 0.01],
                        [lng + 0.01, lat + 0.01],
                    ],
                    geojson: { type: 'Point', coordinates: [lng, lat] },
                    buffer: radiusMeters,
                },
                // No category filter — fetch all, then map client-side
                limit: 60,
                sortby: 'distance',
            }),
        });
        if (!res.ok) throw new Error(`ORS POI ${res.status}`);
        const data = await res.json();

        const results: POI[] = [];

        for (const f of (data.features ?? [])) {
            const osmTags = f.properties?.osm_tags ?? {};
            const name: string = osmTags.name || osmTags['name:vi'] || osmTags['name:en'] || '';
            if (!name) continue; // skip unnamed POIs

            // Determine category from ORS category_ids response
            const catIds: Record<string, { category_name: string }> = f.properties?.category_ids ?? {};
            let category: POICategory | null = null;
            for (const { category_name } of Object.values(catIds)) {
                const mapped = catNameMap[category_name.toLowerCase().replace(/\s+/g, '_')];
                if (mapped && categories.includes(mapped)) {
                    category = mapped;
                    break;
                }
            }

            // Also try osm amenity/leisure/shop tags as fallback
            if (!category) {
                const amenity = (osmTags.amenity ?? '').toLowerCase();
                const leisure = (osmTags.leisure ?? '').toLowerCase();
                const shop = (osmTags.shop ?? '').toLowerCase();
                const tag = amenity || leisure || shop;
                const mapped = catNameMap[tag];
                if (mapped && categories.includes(mapped)) category = mapped;
            }

            if (!category) continue; // skip unrecognised POI types

            const [poiLng, poiLat] = f.geometry?.coordinates ?? [lng, lat];
            results.push({
                name,
                category,
                emoji: emojiMap[category] ?? '📍',
                lat: poiLat,
                lng: poiLng,
                distanceM: f.distance ? Math.round(f.distance) : undefined,
            });
        }

        writeCache(ck, results);
        return results;
    } catch (err) {
        console.warn('[ORS] POI error, using mock:', err);
        const mocks = mockPOIs(lat, lng).filter(p => categories.includes(p.category));
        writeCache(ck, mocks);
        return mocks;
    }
}

/**
 * Fetch turn-by-turn route between two points.
 * Falls back to straight-line mock on error.
 */
export async function getDirections(
    fromLat: number, fromLng: number,
    toLat: number, toLng: number,
    profile: TransportProfile = 'driving-car'
): Promise<DirectionsResult> {
    const ck = cacheKey('dir', `${fromLat.toFixed(4)},${fromLng.toFixed(4)}-${toLat.toFixed(4)},${toLng.toFixed(4)},${profile}`);
    const cached = readCache<DirectionsResult>(ck);
    if (cached) return cached;

    const mockResult: DirectionsResult = {
        coordinates: [[fromLng, fromLat], [toLng, toLat]],
        distanceM: Math.round(Math.sqrt(
            Math.pow((toLat - fromLat) * 111000, 2) +
            Math.pow((toLng - fromLng) * 111000 * Math.cos(fromLat * Math.PI / 180), 2)
        )),
        durationSec: 0,
        isMock: true,
    };

    if (!ORS_API_KEY && !ORS_SELF_HOST) {
        writeCache(ck, mockResult);
        return mockResult;
    }

    try {
        const res = await fetch(`${ORS_BASE}/v2/directions/${profile}/geojson`, {
            method: 'POST',
            headers: orsHeaders(),
            body: JSON.stringify({ coordinates: [[fromLng, fromLat], [toLng, toLat]] }),
        });
        if (!res.ok) throw new Error(`ORS directions ${res.status}`);
        const data = await res.json();
        const feature = data?.features?.[0];
        if (!feature) throw new Error('No route feature');
        const result: DirectionsResult = {
            coordinates: feature.geometry.coordinates,
            distanceM: Math.round(feature.properties.summary.distance),
            durationSec: Math.round(feature.properties.summary.duration),
            isMock: false,
        };
        writeCache(ck, result);
        return result;
    } catch (err) {
        console.warn('[ORS] directions error, using mock:', err);
        writeCache(ck, mockResult);
        return mockResult;
    }
}

/**
 * Format distance for display.
 */
export function formatDistance(meters: number): string {
    if (meters < 1000) return `${meters}m`;
    return `${(meters / 1000).toFixed(1)}km`;
}

/**
 * Format duration for display.
 */
export function formatDuration(seconds: number): string {
    if (seconds < 60) return `${seconds}s`;
    const min = Math.round(seconds / 60);
    if (min < 60) return `${min} phút`;
    return `${Math.floor(min / 60)} giờ ${min % 60} phút`;
}
