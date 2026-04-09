// ═══════════════════════════════════════════════════════
// CẦN & CÓ — Intent UI Utilities
// ═══════════════════════════════════════════════════════

export function formatPrice(price: number): string {
  if (price >= 1_000_000_000) {
    const ty = price / 1_000_000_000;
    return `${ty % 1 === 0 ? ty : ty.toFixed(1)} tỷ`;
  }
  if (price >= 1_000_000) {
    const trieu = Math.round(price / 1_000_000);
    return `${trieu} triệu`;
  }
  return new Intl.NumberFormat('vi-VN').format(price);
}

export function formatPriceRange(min?: number | null, max?: number | null): string | null {
  if (min && max) return `${formatPrice(min)} – ${formatPrice(max)}`;
  if (min) return `từ ${formatPrice(min)}`;
  if (max) return `đến ${formatPrice(max)}`;
  return null;
}

export interface IntentTypeInfo {
  label: string;
  color: string;
  bgClass: string;
  textClass: string;
}

export function getIntentTypeInfo(type: 'CAN' | 'CO'): IntentTypeInfo {
  if (type === 'CAN') {
    return {
      label: 'CẦN',
      color: '#EF4444',
      bgClass: 'intent-badge-can',
      textClass: 'text-red-500',
    };
  }
  return {
    label: 'CÓ',
    color: '#22C55E',
    bgClass: 'intent-badge-co',
    textClass: 'text-green-500',
  };
}

export interface Tag {
  icon: string;
  label: string;
  type: string;
}

export function parsedDataToTags(
  parsedData: Record<string, unknown>,
  opts?: { price?: number | null; priceMin?: number | null; priceMax?: number | null },
): Tag[] {
  const tags: Tag[] = [];

  if (parsedData.district) {
    tags.push({ icon: '📍', label: String(parsedData.district), type: 'district' });
  }
  if (parsedData.bedrooms) {
    tags.push({ icon: '🛏', label: `${parsedData.bedrooms} PN`, type: 'bedrooms' });
  }
  if (parsedData.area) {
    tags.push({ icon: '📐', label: `${parsedData.area}m²`, type: 'area' });
  }
  if (parsedData.floor) {
    tags.push({ icon: '🏢', label: `Tầng ${parsedData.floor}`, type: 'floor' });
  }
  if (parsedData.project_name) {
    tags.push({ icon: '🏘', label: String(parsedData.project_name), type: 'project' });
  }

  // Price tag — nếu không có numeric price thì dùng price_label từ AI
  if (opts?.price) {
    tags.push({ icon: '💰', label: formatPrice(opts.price), type: 'price' });
  } else {
    const range = formatPriceRange(opts?.priceMin, opts?.priceMax);
    if (range) {
      tags.push({ icon: '💰', label: range, type: 'price' });
    } else if (parsedData.price_label) {
      tags.push({ icon: '💰', label: String(parsedData.price_label), type: 'price' });
    }
  }

  // Keywords
  if (Array.isArray(parsedData.keywords)) {
    for (const kw of parsedData.keywords.slice(0, 3)) {
      tags.push({ icon: '🎯', label: String(kw), type: 'keyword' });
    }
  }

  // Fallback: dùng ai_tags trực tiếp nếu chưa có tag nào
  if (tags.length === 0 && Array.isArray(parsedData.ai_tags)) {
    return parsedData.ai_tags as Tag[];
  }

  return tags;
}

export function getVerificationInfo(level: string): { label: string; className: string } {
  switch (level) {
    case 'verified':
      return { label: 'Đã xác thực', className: 'wm-badge-normal' };
    case 'kyc':
      return { label: 'Đã KYC', className: 'wm-badge-info' };
    default:
      return { label: 'Chưa xác thực', className: 'wm-badge-elevated' };
  }
}
