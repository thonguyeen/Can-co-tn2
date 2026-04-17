// Types dành riêng cho tính năng Bản đồ (Map Feature)
// Tách biệt khỏi MockIntent để không phụ thuộc vào mock data

export interface MapFeatureProperties {
  id: string;
  type: 'CAN' | 'CO';
  title: string;
  price: number | null;          // VND, null nếu chưa có
  district: string | null;
  ward: string | null;
  city: string | null;
  subcategory: string | null;
  trustScore: number;
  verificationLevel: string;
  imageUrl: string | null;
  userName: string;
}

// GeoJSON Feature trả về từ /api/map/geojson
export interface MapGeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  properties: MapFeatureProperties;
}

export interface MapGeoJSONCollection {
  type: 'FeatureCollection';
  features: MapGeoJSONFeature[];
}

// Filters cho useMapData hook
export interface MapFilters {
  type?: 'CAN' | 'CO' | 'all';
  priceMin?: number;
  priceMax?: number;
  verified?: boolean;
  district?: string;
}
