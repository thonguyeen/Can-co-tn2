// ═══════════════════════════════════════════════════════
// CẦN & CÓ — Template-based Bot Comment Generator (demo)
// ═══════════════════════════════════════════════════════

import type { BotPersona } from './personas';

interface CommentContext {
  intentType: 'CAN' | 'CO';
  district?: string | null;
  price?: number | null;
  priceMin?: number | null;
  priceMax?: number | null;
  bedrooms?: number | null;
  trustScore: number;
  verificationLevel: string;
  matchCount: number;
  userIntentCount?: number;
}

function fmtPrice(p: number): string {
  if (p >= 1e9) { const t = p / 1e9; return `${t % 1 === 0 ? t : t.toFixed(1)} tỷ`; }
  return `${Math.round(p / 1e6)} triệu`;
}

export function generateComment(persona: BotPersona, ctx: CommentContext): string | null {
  switch (persona.id) {
    case 'match_advisor':
      if (ctx.intentType === 'CAN') {
        return ctx.matchCount > 0
          ? `Tìm thấy ${ctx.matchCount} tin phù hợp nhu cầu của bạn. Bấm "Xem match" để xem chi tiết.`
          : 'Chưa tìm thấy match phù hợp. Đang theo dõi — sẽ thông báo ngay khi có.';
      }
      return ctx.matchCount > 0
        ? `${ctx.matchCount} người đang tìm kiếm phù hợp với tin của bạn. Tin đã được gợi ý cho họ.`
        : 'Đang tìm người phù hợp. Sẽ thông báo khi có match.';

    case 'nha_advisor': {
      if (!ctx.district) return null;
      const priceInfo = ctx.price ? fmtPrice(ctx.price) : ctx.priceMin && ctx.priceMax ? `${fmtPrice(ctx.priceMin)}-${fmtPrice(ctx.priceMax)}` : null;
      const tips: Record<string, string> = {
        'Quận 7': `Giá trung bình 2PN Q7 hiện khoảng 3.2-3.8 tỷ.${priceInfo ? ` Tin bạn đăng ${priceInfo} — hợp thị trường.` : ''}`,
        'Bình Thạnh': `Bình Thạnh có nhiều dự án lớn (Vinhomes, Saigon Pearl). Giá 2PN: 3.0-4.5 tỷ tùy dự án.`,
        'Thủ Đức': `Thủ Đức đang phát triển mạnh nhờ tuyến metro. Giá căn hộ tăng 10-15%/năm gần đây.`,
        'Gò Vấp': `Gò Vấp: nhà phố 4x15m hẻm xe hơi khoảng 5.5-7.5 tỷ. Giá ổn định, thanh khoản tốt.`,
      };
      return tips[ctx.district] || `${ctx.district}: khu vực có nhu cầu ổn định. Giá phụ thuộc vị trí cụ thể.`;
    }

    case 'market_analyst': {
      if (!ctx.district) return null;
      const stats: Record<string, { can: number; co: number }> = {
        'Quận 7': { can: 8, co: 3 },
        'Bình Thạnh': { can: 5, co: 4 },
        'Thủ Đức': { can: 12, co: 2 },
        'Gò Vấp': { can: 3, co: 5 },
        'Quận 3': { can: 4, co: 2 },
      };
      const s = stats[ctx.district] || { can: 3, co: 2 };
      const ratio = (s.can / Math.max(s.co, 1)).toFixed(1);
      const status = parseFloat(ratio) > 2 ? 'thiên người bán' : parseFloat(ratio) < 0.8 ? 'thiên người mua' : 'cân bằng';
      return `📊 ${ctx.district}: ${s.can} CẦN vs ${s.co} CÓ — tỷ lệ cầu/cung ${ratio}x (${status})`;
    }

    case 'trust_checker':
      if (ctx.verificationLevel === 'verified') {
        return '✅ Tin đã được xác thực đầy đủ (CCCD + Sổ đỏ + GPS). Người mua có thể yên tâm liên hệ.';
      }
      if (ctx.verificationLevel === 'kyc') {
        return '🛡️ Đã KYC. Xác thực thêm sổ đỏ và GPS để tăng tin cậy và được ưu tiên matching.';
      }
      return '🛡️ Tip: Tin đã xác thực được ưu tiên matching và hiển thị cao hơn. Xác thực ngay để tăng cơ hội →';

    case 'connector': {
      if (!ctx.district) return null;
      const counts: Record<string, number> = { 'Quận 7': 5, 'Bình Thạnh': 3, 'Thủ Đức': 7, 'Gò Vấp': 2 };
      const c = counts[ctx.district] || 2;
      return ctx.intentType === 'CAN'
        ? `🤝 ${c} người khác cũng đang tìm nhà ${ctx.district}. Kết nối để trao đổi kinh nghiệm?`
        : `🤝 Có ${c} người quan tâm khu vực ${ctx.district}. Bạn có thể được kết nối tự động khi có match.`;
    }

    case 'concierge':
      if ((ctx.userIntentCount || 0) < 3) {
        return ctx.intentType === 'CAN'
          ? '🎯 Chào bạn mới! Mẹo: mô tả càng chi tiết (quận, giá, số phòng), AI match càng chính xác.'
          : '🎯 Mẹo: thêm ảnh thật và xác thực danh tính sẽ giúp tin của bạn được quan tâm nhiều hơn.';
      }
      return null;

    default:
      return null;
  }
}
