// ═══════════════════════════════════════════════════════
// CẦN & CÓ — Pre-computed Predictions (demo)
// ═══════════════════════════════════════════════════════

import type { IntentPrediction, MarketData } from '@/lib/agents/predictions';

export const DEMO_MARKET_DATA: Record<string, MarketData> = {
  'Quận 7': { canCount: 8, coCount: 3, avgCanBudget: 3_300_000_000, matchRate: 0.4 },
  'Bình Thạnh': { canCount: 5, coCount: 4, avgCanBudget: 2_800_000_000, matchRate: 0.35 },
  'Thủ Đức': { canCount: 12, coCount: 2, avgCanBudget: 2_000_000_000, matchRate: 0.2 },
  'Gò Vấp': { canCount: 3, coCount: 5, avgCanBudget: 5_500_000_000, matchRate: 0.5 },
  'Quận 3': { canCount: 4, coCount: 2, avgCanBudget: 40_000_000, matchRate: 0.3 },
};

export const DEMO_PREDICTIONS: Record<string, IntentPrediction> = {
  'i-001': {
    match_time_days: { min: 3, max: 5, confidence: 0.85 },
    match_probability_7d: 75,
    competition_level: 'high',
    tips: ['Bạn đã tìm Q7 lần thứ 3 — nhu cầu rõ ràng', 'Cân nhắc mở rộng sang Bình Thạnh nếu chưa match'],
  },
  'i-002': {
    match_time_days: { min: 1, max: 2, confidence: 0.9 },
    match_probability_7d: 92,
    price_suggestion: { min: 3_200_000_000, max: 3_600_000_000, reason: 'Dựa trên 8 CẦN Q7, budget TB 3.3 tỷ' },
    competition_level: 'low',
    tips: ['Tin đã xác thực đầy đủ — rất tốt!', 'Giá 3.5 tỷ phù hợp thị trường'],
  },
  'i-003': {
    match_time_days: { min: 7, max: 14, confidence: 0.5 },
    match_probability_7d: 35,
    competition_level: 'very_high',
    tips: ['Cạnh tranh rất cao — Thủ Đức 12 CẦN vs 2 CÓ', 'Xác thực SĐT để tăng ưu tiên'],
  },
  'i-004': {
    match_time_days: { min: 2, max: 4, confidence: 0.8 },
    match_probability_7d: 82,
    price_suggestion: { min: 5_500_000_000, max: 6_500_000_000, reason: 'Dựa trên 3 CẦN Gò Vấp, budget TB 5.5-7 tỷ' },
    competition_level: 'medium',
    tips: ['Giá 6.2 tỷ hợp lý — nằm trong tầm trung khu vực'],
  },
  'i-005': {
    match_time_days: { min: 3, max: 7, confidence: 0.7 },
    match_probability_7d: 68,
    competition_level: 'high',
    tips: ['Thủ Đức đang phát triển mạnh', 'Budget 5-8 tỷ có nhiều lựa chọn 3PN'],
  },
  'i-006': {
    match_time_days: { min: 1, max: 2, confidence: 0.85 },
    match_probability_7d: 88,
    price_suggestion: { min: 13_000_000, max: 17_000_000, reason: 'Dựa trên 12 CẦN thuê Thủ Đức' },
    competition_level: 'low',
    tips: ['Nhu cầu gấp 6 lần cung — tin sẽ match rất nhanh!'],
  },
  'i-008': {
    match_time_days: { min: 1, max: 3, confidence: 0.88 },
    match_probability_7d: 90,
    price_suggestion: { min: 5_800_000_000, max: 7_000_000_000, reason: 'Dựa trên 8 CẦN Q7 cao cấp' },
    competition_level: 'low',
    tips: ['Top seller với Trust 4.8', 'Tin hot nhất Q7 tuần này'],
  },
};
