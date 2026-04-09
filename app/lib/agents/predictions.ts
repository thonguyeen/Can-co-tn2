// ═══════════════════════════════════════════════════════
// CẦN & CÓ — Prediction Engine (statistical, not ML)
// ═══════════════════════════════════════════════════════

export interface MarketData {
  canCount: number;
  coCount: number;
  avgCanBudget: number;
  matchRate: number;
}

export interface IntentPrediction {
  match_time_days: { min: number; max: number; confidence: number };
  match_probability_7d: number;
  price_suggestion?: { min: number; max: number; reason: string };
  competition_level: 'low' | 'medium' | 'high' | 'very_high';
  tips: string[];
}

function fmtPrice(p: number): string {
  if (p >= 1e9) { const t = p / 1e9; return `${t % 1 === 0 ? t : t.toFixed(1)} tỷ`; }
  return `${Math.round(p / 1e6)} triệu`;
}

export function predictForIntent(
  intentType: 'CAN' | 'CO',
  trustScore: number,
  verificationLevel: string,
  price: number | null,
  district: string | null,
  market: MarketData,
): IntentPrediction {
  const ratio = market.canCount / Math.max(market.coCount, 1);

  // 1. Match time
  let min: number, max: number;
  if (intentType === 'CAN') {
    if (ratio > 3) { min = 7; max = 14; }
    else if (ratio > 1.5) { min = 3; max = 7; }
    else { min = 1; max = 3; }
  } else {
    if (ratio > 3) { min = 1; max = 2; }
    else if (ratio > 1.5) { min = 2; max = 5; }
    else { min = 5; max = 14; }
  }

  // 2. Probability
  let prob = 50;
  if (intentType === 'CAN' && market.coCount > 0) prob += 20;
  if (intentType === 'CO' && market.canCount > 0) prob += 20;
  if (trustScore >= 4) prob += 15;
  else if (trustScore >= 3) prob += 10;
  if (market.matchRate > 0.3) prob += 10;
  prob = Math.min(prob, 95);

  // 3. Price suggestion (CÓ only)
  let priceSuggestion: IntentPrediction['price_suggestion'];
  if (intentType === 'CO' && market.avgCanBudget > 0) {
    priceSuggestion = {
      min: Math.round(market.avgCanBudget * 0.9),
      max: Math.round(market.avgCanBudget * 1.1),
      reason: `Dựa trên ${market.canCount} người đang tìm, budget TB ${fmtPrice(market.avgCanBudget)}`,
    };
  }

  // 4. Competition
  const competition: IntentPrediction['competition_level'] = intentType === 'CAN'
    ? (ratio > 3 ? 'very_high' : ratio > 1.5 ? 'high' : ratio > 0.8 ? 'medium' : 'low')
    : (ratio > 3 ? 'low' : ratio > 1.5 ? 'medium' : ratio > 0.8 ? 'high' : 'very_high');

  // 5. Tips
  const tips: string[] = [];
  if (verificationLevel === 'none') tips.push('Xác thực danh tính để tăng ưu tiên matching');
  if (intentType === 'CAN' && ratio > 2) tips.push('Nhu cầu cao — cân nhắc mở rộng khu vực hoặc tăng budget');
  if (intentType === 'CO' && trustScore < 3) tips.push('Thêm ảnh và xác thực để tăng độ tin cậy');
  if (intentType === 'CO' && priceSuggestion && price && price > priceSuggestion.max * 1.2) {
    tips.push('Giá đăng cao hơn 20% so với budget TB người tìm. Cân nhắc điều chỉnh.');
  }
  if (tips.length === 0) tips.push('Tin của bạn đang ở trạng thái tốt!');

  return {
    match_time_days: { min, max, confidence: 0.7 + (trustScore > 4 ? 0.15 : 0) },
    match_probability_7d: prob,
    price_suggestion: priceSuggestion,
    competition_level: competition,
    tips,
  };
}
