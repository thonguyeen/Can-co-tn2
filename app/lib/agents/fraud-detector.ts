// ═══════════════════════════════════════════════════════
// CẦN & CÓ — Fraud Detection Agent (bot #7, silent)
// ═══════════════════════════════════════════════════════

export interface FraudSignal {
  signal: string;
  score: number;
  evidence: string;
  severity: 'info' | 'warning' | 'danger';
}

export interface FraudReport {
  intent_id?: string;
  user_id: string;
  total_score: number;
  risk_level: 'clean' | 'low' | 'medium' | 'high' | 'critical';
  signals: FraudSignal[];
  recommended_action: string;
  scanned_at: string;
}

export interface ChatAlert {
  conversation_id: string;
  message_id: string;
  alert_type: string;
  evidence: string;
  severity: 'warning' | 'danger';
}

function textSimilarity(a: string, b: string): number {
  const wordsA = new Set(a.toLowerCase().split(/\s+/).filter(w => w.length > 1));
  const wordsB = new Set(b.toLowerCase().split(/\s+/).filter(w => w.length > 1));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  const intersection = [...wordsA].filter(w => wordsB.has(w));
  return intersection.length / Math.max(wordsA.size, wordsB.size);
}

interface ScanInput {
  intentType: 'CAN' | 'CO';
  rawText: string;
  price: number | null;
  district: string | null;
  images: number;
  verificationLevel: string;
  trustScore: number;
  ratingAvg: number;
  ratingCount: number;
  accountAgeDays: number;
  activeCoCount: number;
  activeCanCount: number;
  distinctDistricts: number;
  successfulDeals: number;
  otherTexts: string[];
  avgMarketPrice: number | null;
}

export function scanIntent(input: ScanInput): FraudReport {
  const signals: FraudSignal[] = [];

  // Signal 1: Volume anomaly
  if (input.activeCoCount > 5) {
    signals.push({ signal: 'high_volume_co', score: Math.min(25 + (input.activeCoCount - 5) * 5, 40), evidence: `${input.activeCoCount} tin CÓ active — người thường sở hữu 1-3 BĐS`, severity: input.activeCoCount > 10 ? 'danger' : 'warning' });
  }
  if (input.activeCanCount > 5) {
    signals.push({ signal: 'high_volume_can', score: Math.min(20 + (input.activeCanCount - 5) * 3, 30), evidence: `${input.activeCanCount} tin CẦN active — có thể thu thập leads`, severity: 'warning' });
  }

  // Signal 2: Multi-district CÓ
  if (input.intentType === 'CO' && input.distinctDistricts > 3) {
    signals.push({ signal: 'multi_district_co', score: 20 + (input.distinctDistricts - 3) * 5, evidence: `Đăng bán ở ${input.distinctDistricts} quận — khó sở hữu BĐS nhiều quận`, severity: 'warning' });
  }

  // Signal 3: Price anomaly
  if (input.price && input.avgMarketPrice && input.price / input.avgMarketPrice < 0.65) {
    signals.push({ signal: 'price_too_low', score: 25, evidence: `Giá thấp hơn 35%+ so với TB khu vực — có thể bait giá`, severity: 'danger' });
  }

  // Signal 4: Low content
  if (input.rawText.length < 30) {
    signals.push({ signal: 'low_content', score: 10, evidence: `Mô tả quá ngắn (${input.rawText.length} ký tự)`, severity: 'info' });
  }

  // Signal 5: Content similarity
  const highSim = input.otherTexts.filter(t => textSimilarity(input.rawText, t) > 0.7);
  if (highSim.length > 0) {
    signals.push({ signal: 'duplicate_content', score: 20, evidence: `Nội dung giống >70% với ${highSim.length} tin khác — có thể copy-paste`, severity: 'warning' });
  }

  // Signal 6: New account bulk
  if (input.accountAgeDays < 1 && (input.activeCoCount + input.activeCanCount) > 3) {
    signals.push({ signal: 'new_account_bulk', score: 20, evidence: `Account mới đã đăng ${input.activeCoCount + input.activeCanCount} tin`, severity: 'warning' });
  }

  // Signal 7: No images CÓ
  if (input.intentType === 'CO' && input.images === 0) {
    signals.push({ signal: 'no_images_co', score: 5, evidence: 'Tin bán không có ảnh', severity: 'info' });
  }

  // Positive signals
  if (input.verificationLevel === 'verified') {
    signals.push({ signal: 'gps_verified', score: -30, evidence: 'Đã xác thực GPS — bằng chứng mạnh là chủ thật', severity: 'info' });
  } else if (input.verificationLevel === 'kyc') {
    signals.push({ signal: 'kyc_verified', score: -10, evidence: 'Đã xác thực CCCD', severity: 'info' });
  }
  if (input.successfulDeals > 0) {
    signals.push({ signal: 'deal_history', score: -5 * Math.min(input.successfulDeals, 6), evidence: `${input.successfulDeals} giao dịch thành công`, severity: 'info' });
  }
  if (input.ratingAvg >= 4.0 && input.ratingCount >= 3) {
    signals.push({ signal: 'high_rating', score: -15, evidence: `Rating ${input.ratingAvg}/5 từ ${input.ratingCount} đánh giá`, severity: 'info' });
  }
  if (input.accountAgeDays > 90) {
    signals.push({ signal: 'mature_account', score: -10, evidence: `Account ${input.accountAgeDays} ngày`, severity: 'info' });
  }

  const totalScore = Math.max(0, Math.min(100, signals.reduce((s, sig) => s + sig.score, 0)));
  const riskLevel = totalScore < 15 ? 'clean' : totalScore < 30 ? 'low' : totalScore < 50 ? 'medium' : totalScore < 75 ? 'high' : 'critical';
  const action = riskLevel === 'clean' || riskLevel === 'low' ? 'none' : riskLevel === 'medium' ? 'warn_viewers' : riskLevel === 'high' ? 'reduce_ranking' : 'auto_hide';

  return { user_id: '', total_score: totalScore, risk_level: riskLevel, signals, recommended_action: action, scanned_at: new Date('2026-03-22T08:00:00Z').toISOString() };
}

export function scanMessage(message: string): ChatAlert | null {
  const redirectPatterns = [
    { pattern: /(?:gọi|liên hệ|lh|call)\s*(?:số|sđt)?\s*:?\s*0\d{9}/i, type: 'phone_redirect' },
    { pattern: /(?:zalo|viber|telegram)\s*:?\s*0?\d{9,}/i, type: 'app_redirect' },
    { pattern: /(?:inbox|ib|pm|nhắn)\s*(?:facebook|fb)/i, type: 'fb_redirect' },
  ];
  for (const { pattern, type } of redirectPatterns) {
    if (pattern.test(message)) {
      return { conversation_id: '', message_id: '', alert_type: type, evidence: `Chuyển hướng ngoài platform: "${message.slice(0, 80)}"`, severity: 'warning' };
    }
  }
  const brokerPhrases = [/(?:tôi|em)\s*(?:đại diện|hỗ trợ)\s*cho/i, /(?:hoa hồng|commission|phí môi giới)/i, /(?:còn nhiều|có thêm)\s*(?:căn|nhà)/i];
  for (const pattern of brokerPhrases) {
    if (pattern.test(message)) {
      return { conversation_id: '', message_id: '', alert_type: 'broker_language', evidence: `Ngôn ngữ trung gian: "${message.slice(0, 80)}"`, severity: 'warning' };
    }
  }
  return null;
}
