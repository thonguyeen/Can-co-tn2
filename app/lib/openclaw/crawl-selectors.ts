// ═══════════════════════════════════════════════════════════════
// CRAWL SELECTORS — CSS Selector Presets per Domain
// Khi crawler gặp URL từ trang đã biết, tự động dùng đúng selectors
// Tránh dùng DEFAULT (generic) và thường xuyên fail
// ═══════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

export interface SiteSelectors {
  listItem: string;   // Container mỗi bài đăng trong danh sách
  title: string;      // Tiêu đề bài đăng
  link: string;       // Link đến trang chi tiết
  content: string;    // Mô tả/nội dung ngắn
  price?: string;     // Giá (optional)
  image?: string;     // Ảnh đại diện (optional)
}

export interface SitePreset {
  domain: string;           // Regex-friendly domain fragment, VD: "batdongsan.com.vn"
  name: string;             // Tên hiển thị, VD: "BatDongSan.com.vn"
  selectors: SiteSelectors;
  preferRss?: boolean;      // Nếu true → ưu tiên RSS nếu có
  lastVerifiedAt: string;   // YYYY-MM-DD — để theo dõi selector có bị stale không
}

// ─────────────────────────────────────────────────────────────
// DEFAULT FALLBACK SELECTORS (generic, áp dụng nếu không có preset)
// ─────────────────────────────────────────────────────────────

export const DEFAULT_SELECTORS: SiteSelectors = {
  listItem: 'article, .item, .listing, .property-item, .news-item, .post-item',
  title: 'h2 a, h3 a, .title a, .property-title a, h2, h3',
  link: 'h2 a, h3 a, .title a, a[href]',
  content: '.summary, .description, .excerpt, p, .content',
  price: '.price, .property-price',
  image: 'img',
};

// ─────────────────────────────────────────────────────────────
// SITE PRESETS: 4 trang BĐS ưu tiên
// ─────────────────────────────────────────────────────────────

export const SITE_PRESETS: SitePreset[] = [
  // ── 1. BatDongSan.com.vn ────────────────────────────────────
  {
    domain: 'batdongsan.com.vn',
    name: 'BatDongSan.com.vn',
    preferRss: false,
    lastVerifiedAt: '2026-04-11',
    selectors: {
      // BDS dùng class JS-driven, cần fallback nhiều selector
      listItem: '.js__card, .re__card-wrap, [data-testid="product-item"]',
      title: '.js__card-title, .re__card-title, h3 a',
      link: 'a.js__product-link-for-product-id, .re__card-title a, h3 a',
      content: '.re__card-config, .re__truncate, .re__card-brief-info',
      price: '.re__card-config-price--real, .re__card-config-price .re__card-config-value',
      image: '.re__card-image img, img[src*="batdongsan"]',
    },
  },

  // ── 2. AlonhaDat.com.vn ─────────────────────────────────────
  {
    domain: 'alonhadat.com.vn',
    name: 'AlonhaDat.com.vn',
    preferRss: false,
    lastVerifiedAt: '2026-04-11',
    selectors: {
      listItem: '.search-productItem',
      title: '.search-productItem h3 a',
      link: '.search-productItem h3 a',
      content: '.des',
      price: '.price-value, .price',
      image: '.product-img img',
    },
  },

  // ── 3. CafeLand.vn ──────────────────────────────────────────
  {
    domain: 'cafeland.vn',
    name: 'CafeLand.vn',
    preferRss: true, // CafeLand có RSS → ưu tiên, fallback HTML bên dưới
    lastVerifiedAt: '2026-04-11',
    selectors: {
      listItem: '.box-item, .news-item, .item-cls',
      title: 'h3 a, h2 a, .title a',
      link: 'h3 a, h2 a, .title a',
      content: '.box-desc, .sapo, p',
      price: '.price',
      image: 'img',
    },
  },

  // ── 4. MuaBanNhaDat.com.vn ──────────────────────────────────
  {
    domain: 'muabannhadat.com.vn',
    name: 'MuaBanNhaDat.com.vn',
    preferRss: false,
    lastVerifiedAt: '2026-04-11',
    selectors: {
      listItem: '.product-item, .item-list, .property-item',
      title: '.product-title a, h2 a, h3 a',
      link: '.product-title a, h2 a, h3 a',
      content: '.product-info, .description, p',
      price: '.price-value, .price',
      image: 'img',
    },
  },
];

// ─────────────────────────────────────────────────────────────
// HELPER: Tìm selector đúng cho URL
// Priority: customJson > domain preset > DEFAULT
// ─────────────────────────────────────────────────────────────

export function getSelectorsForUrl(
  url: string,
  customSelectorsJson?: string | null,
): { selectors: SiteSelectors; presetName: string | null } {
  // 1. Custom JSON override (lưu trong CrawlSource.notes)
  if (customSelectorsJson) {
    try {
      const parsed = JSON.parse(customSelectorsJson) as SiteSelectors;
      if (parsed.listItem && parsed.title && parsed.link) {
        return { selectors: parsed, presetName: 'custom' };
      }
    } catch {
      console.warn('[CrawlSelectors] Custom JSON parse failed, falling back to preset/default');
    }
  }

  // 2. Domain preset lookup
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '');
    const preset = SITE_PRESETS.find(p => hostname.includes(p.domain));
    if (preset) {
      return { selectors: preset.selectors, presetName: preset.name };
    }
  } catch {
    console.warn(`[CrawlSelectors] URL parse failed: ${url}`);
  }

  // 3. Default fallback
  return { selectors: DEFAULT_SELECTORS, presetName: null };
}

// ─────────────────────────────────────────────────────────────
// HELPER: Tìm preset info cho UI (Admin form preset hint)
// ─────────────────────────────────────────────────────────────

export function getPresetInfoForUrl(url: string): SitePreset | null {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '');
    return SITE_PRESETS.find(p => hostname.includes(p.domain)) || null;
  } catch {
    return null;
  }
}
