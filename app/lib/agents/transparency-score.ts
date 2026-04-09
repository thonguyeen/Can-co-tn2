// ═══════════════════════════════════════════════════════
// CẦN & CÓ — Transparency Score (public accountability)
// ═══════════════════════════════════════════════════════

export type TransparencyGrade = 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';

export interface TransparencyProfile {
  user_id: string;
  identity_score: number;
  behavior_score: number;
  history_score: number;
  community_score: number;
  total: number;
  grade: TransparencyGrade;
  highlights: string[];
  improvement: string | null;
}

export function calculateTransparency(input: {
  cccd: boolean; sodo: boolean; gps: boolean;
  replyRate: number; replyTimeHours: number;
  avgContentLength: number; hasImages: boolean;
  accountAgeDays: number; dealsCompleted: number;
  ratingAvg: number; ratingCount: number;
  confirmedReports: number;
}): TransparencyProfile {
  // Identity (max 25)
  let identity = 0;
  if (input.cccd) identity += 10;
  if (input.sodo) identity += 10;
  if (input.gps) identity += 5;

  // Behavior (max 35)
  let behavior = 0;
  behavior += input.replyRate > 80 ? 10 : input.replyRate > 60 ? 7 : input.replyRate > 40 ? 4 : 0;
  behavior += input.replyTimeHours < 1 ? 10 : input.replyTimeHours < 6 ? 7 : input.replyTimeHours < 24 ? 4 : 0;
  let contentQ = 0;
  if (input.avgContentLength > 100) contentQ += 5; else if (input.avgContentLength > 50) contentQ += 3;
  if (input.hasImages) contentQ += 5;
  behavior += Math.min(contentQ, 15);

  // History (max 25)
  let history = 0;
  history += input.accountAgeDays > 365 ? 10 : input.accountAgeDays > 180 ? 7 : input.accountAgeDays > 90 ? 4 : input.accountAgeDays > 30 ? 2 : 0;
  history += Math.min(input.dealsCompleted * 3, 15);

  // Community (max 15)
  let community = Math.min(Math.round(input.ratingAvg * 3), 15);
  community -= input.confirmedReports * 5;
  community = Math.max(community, 0);

  const total = Math.max(0, Math.min(100, identity + behavior + history + community));
  const grade: TransparencyGrade = total >= 90 ? 'A+' : total >= 75 ? 'A' : total >= 60 ? 'B' : total >= 40 ? 'C' : total >= 20 ? 'D' : 'F';

  const highlights: string[] = [];
  if (input.replyRate > 80) highlights.push(`Trả lời ${input.replyRate}% tin nhắn`);
  if (input.replyTimeHours < 6) highlights.push(`TB trả lời trong ${input.replyTimeHours < 1 ? '<1' : Math.round(input.replyTimeHours)} giờ`);
  if (input.dealsCompleted > 0) highlights.push(`${input.dealsCompleted} giao dịch thành công`);
  if (input.ratingAvg >= 4 && input.ratingCount >= 3) highlights.push(`Rating ${input.ratingAvg}/5 (${input.ratingCount} đánh giá)`);
  if (!input.gps) highlights.push('⚠️ Chưa xác thực GPS');

  let improvement: string | null = null;
  if (!input.gps) improvement = 'Xác thực GPS để tăng 5 điểm minh bạch';
  else if (input.replyRate < 60) improvement = 'Tăng tỷ lệ trả lời tin nhắn để cải thiện điểm';
  else if (!input.hasImages) improvement = 'Thêm ảnh thật cho tin đăng';

  return { user_id: '', identity_score: identity, behavior_score: behavior, history_score: history, community_score: community, total, grade, highlights, improvement };
}

export const GRADE_CONFIG: Record<TransparencyGrade, { label: string; color: string; bg: string }> = {
  'A+': { label: 'Cực tin', color: '#22c55e', bg: 'bg-emerald-500/15' },
  'A': { label: 'Đáng tin', color: '#22c55e', bg: 'bg-emerald-500/10' },
  'B': { label: 'Khá tốt', color: '#3b82f6', bg: 'bg-blue-500/10' },
  'C': { label: 'Trung bình', color: '#eab308', bg: 'bg-yellow-500/10' },
  'D': { label: 'Cần cải thiện', color: '#f97316', bg: 'bg-orange-500/10' },
  'F': { label: 'Nghi vấn', color: '#ef4444', bg: 'bg-red-500/10' },
};
