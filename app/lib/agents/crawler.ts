// ═══════════════════════════════════════════════════════
// CẦN & CÓ — Crawler Engine
// Transforms public listings → CÓ intents
// ═══════════════════════════════════════════════════════

export interface CrawledListing {
  source: string;
  source_url: string;
  title: string;
  description: string;
  price: number | null;
  area: number | null;
  bedrooms: number | null;
  district: string | null;
  ward: string | null;
  project_name: string | null;
  images: string[];
  posted_at: string;
}

function fmtPrice(p: number): string {
  if (p >= 1e9) return `${(p / 1e9).toFixed(1)} tỷ`;
  return `${Math.round(p / 1e6)} triệu`;
}

export function transformToIntent(listing: CrawledListing) {
  const parts = [listing.title];
  if (listing.district) parts.push(`Khu vực: ${listing.district}`);
  if (listing.project_name) parts.push(`Dự án: ${listing.project_name}`);
  if (listing.area) parts.push(`${listing.area}m²`);
  if (listing.bedrooms) parts.push(`${listing.bedrooms} phòng ngủ`);
  if (listing.price) parts.push(`Giá: ${fmtPrice(listing.price)}`);
  if (listing.description) parts.push(listing.description.slice(0, 300));

  const text = (listing.title + ' ' + listing.description).toLowerCase();
  let subcategory = 'apartment';
  if (text.includes('nhà phố') || text.includes('nhà riêng')) subcategory = 'house';
  else if (text.includes('đất') || text.includes('nền')) subcategory = 'land';
  else if (text.includes('mặt bằng') || text.includes('văn phòng')) subcategory = 'commercial';

  return {
    type: 'CO' as const,
    raw_text: parts.join('. '),
    title: listing.title,
    category: 'real_estate',
    subcategory,
    price: listing.price,
    district: listing.district,
    ward: listing.ward,
    parsed_data: {
      bedrooms: listing.bedrooms,
      area: listing.area,
      project_name: listing.project_name,
      source: listing.source,
      source_url: listing.source_url,
    },
    trust_score: 0,
    verification_level: 'none',
    status: 'active',
  };
}

export function titleSimilarity(a: string, b: string): number {
  const wordsA = new Set(a.toLowerCase().split(/\s+/));
  const wordsB = new Set(b.toLowerCase().split(/\s+/));
  const intersection = [...wordsA].filter((w) => wordsB.has(w));
  return intersection.length / Math.max(wordsA.size, wordsB.size);
}
