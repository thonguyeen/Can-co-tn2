// ═══════════════════════════════════════════════════════
// CẦN & CÓ — Mock Integrity Data (fraud + transparency)
// ═══════════════════════════════════════════════════════

import type { FraudReport } from '@/lib/agents/fraud-detector';
import type { TransparencyProfile, TransparencyGrade } from '@/lib/agents/transparency-score';

// Transparency scores for all 50 users
export function getDemoTransparency(userId: string): TransparencyProfile {
  const profiles: Record<string, { total: number; grade: TransparencyGrade; identity: number; behavior: number; history: number; community: number; highlights: string[]; improvement: string | null }> = {
    u01: { total: 95, grade: 'A+', identity: 25, behavior: 30, history: 25, community: 15, highlights: ['Trả lời 95% tin nhắn', 'TB trả lời <1 giờ', '8 giao dịch thành công', 'Rating 4.9/5'], improvement: null },
    u02: { total: 88, grade: 'A', identity: 25, behavior: 28, history: 22, community: 13, highlights: ['Trả lời 90% tin nhắn', '6 giao dịch thành công'], improvement: null },
    u03: { total: 82, grade: 'A', identity: 25, behavior: 25, history: 20, community: 12, highlights: ['5 giao dịch thành công', 'Rating 4.5/5'], improvement: null },
    u04: { total: 85, grade: 'A', identity: 25, behavior: 27, history: 22, community: 11, highlights: ['Môi giới đã khai báo', '7 giao dịch'], improvement: null },
    u05: { total: 92, grade: 'A+', identity: 25, behavior: 32, history: 25, community: 10, highlights: ['Top seller', '9 giao dịch', 'Rating 4.9/5'], improvement: null },
    u06: { total: 72, grade: 'B', identity: 20, behavior: 22, history: 18, community: 12, highlights: ['Trả lời 85% tin nhắn', '3 giao dịch'], improvement: 'Xác thực GPS để tăng 5 điểm' },
    u07: { total: 68, grade: 'B', identity: 20, behavior: 20, history: 16, community: 12, highlights: ['4 giao dịch', 'Rating 4.2/5'], improvement: 'Xác thực GPS' },
    u08: { total: 55, grade: 'C', identity: 10, behavior: 18, history: 15, community: 12, highlights: ['2 giao dịch'], improvement: 'Xác thực sổ đỏ và GPS' },
    u09: { total: 62, grade: 'B', identity: 10, behavior: 22, history: 18, community: 12, highlights: ['Trả lời nhanh', '3 giao dịch'], improvement: 'Xác thực đầy đủ' },
    u10: { total: 70, grade: 'B', identity: 20, behavior: 22, history: 16, community: 12, highlights: ['Chủ trọ uy tín'], improvement: 'Thêm ảnh tin đăng' },
  };

  const p = profiles[userId];
  if (p) {
    return { user_id: userId, identity_score: p.identity, behavior_score: p.behavior, history_score: p.history, community_score: p.community, total: p.total, grade: p.grade, highlights: p.highlights, improvement: p.improvement };
  }

  // Default for other users
  const hash = userId.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
  const total = 30 + (hash % 50);
  const grade: TransparencyGrade = total >= 75 ? 'A' : total >= 60 ? 'B' : total >= 40 ? 'C' : total >= 20 ? 'D' : 'F';
  return { user_id: userId, identity_score: Math.floor(total * 0.25), behavior_score: Math.floor(total * 0.35), history_score: Math.floor(total * 0.25), community_score: Math.floor(total * 0.15), total, grade, highlights: [], improvement: 'Xác thực danh tính để tăng điểm' };
}

// Bad actors for demo
export const BAD_ACTORS: { userId: string; name: string; report: FraudReport; transparency: TransparencyProfile }[] = [
  {
    userId: 'bad-01', name: 'Nguyễn Văn Toàn',
    report: { user_id: 'bad-01', total_score: 65, risk_level: 'high', recommended_action: 'reduce_ranking', scanned_at: '2026-03-22T06:00:00Z',
      signals: [
        { signal: 'multi_district_co', score: 25, evidence: 'Đăng bán ở 5 quận (Q1, Q3, Q7, Bình Thạnh, Thủ Đức)', severity: 'warning' },
        { signal: 'high_volume_co', score: 20, evidence: '8 tin CÓ active — người thường sở hữu 1-3 BĐS', severity: 'warning' },
        { signal: 'duplicate_content', score: 15, evidence: 'Nội dung giống >70% với 3 tin khác', severity: 'warning' },
        { signal: 'no_images_co', score: 5, evidence: '4/8 tin không có ảnh', severity: 'info' },
      ],
    },
    transparency: { user_id: 'bad-01', identity_score: 10, behavior_score: 8, history_score: 6, community_score: 8, total: 32, grade: 'D', highlights: ['⚠️ Chưa xác thực GPS', '⚠️ Tỷ lệ trả lời 35%'], improvement: 'Xác thực đầy đủ và giảm số tin đăng' },
  },
  {
    userId: 'bad-02', name: 'Trần Thị Mai',
    report: { user_id: 'bad-02', total_score: 48, risk_level: 'medium', recommended_action: 'warn_viewers', scanned_at: '2026-03-22T06:00:00Z',
      signals: [
        { signal: 'price_too_low', score: 25, evidence: 'Giá thấp hơn 40% so với TB khu vực — có thể bait giá', severity: 'danger' },
        { signal: 'low_content', score: 10, evidence: 'Mô tả quá ngắn (25 ký tự)', severity: 'info' },
        { signal: 'no_images_co', score: 5, evidence: 'Tin bán không có ảnh', severity: 'info' },
        { signal: 'new_account_bulk', score: 8, evidence: 'Account 3 ngày', severity: 'info' },
      ],
    },
    transparency: { user_id: 'bad-02', identity_score: 0, behavior_score: 10, history_score: 2, community_score: 3, total: 15, grade: 'F', highlights: ['⚠️ Chưa xác thực', '⚠️ Account rất mới'], improvement: 'Xác thực danh tính ngay' },
  },
  {
    userId: 'bad-03', name: 'Phạm Đức Long',
    report: { user_id: 'bad-03', total_score: 55, risk_level: 'high', recommended_action: 'reduce_ranking', scanned_at: '2026-03-22T06:00:00Z',
      signals: [
        { signal: 'high_volume_can', score: 30, evidence: '10 tin CẦN active — có thể thu thập leads', severity: 'warning' },
        { signal: 'new_account_bulk', score: 20, evidence: 'Account mới đã đăng 10 tin', severity: 'warning' },
        { signal: 'low_content', score: 5, evidence: 'Mô tả ngắn', severity: 'info' },
      ],
    },
    transparency: { user_id: 'bad-03', identity_score: 0, behavior_score: 5, history_score: 2, community_score: 0, total: 7, grade: 'F', highlights: ['⚠️ Chưa xác thực', '⚠️ Không trả lời tin nhắn'], improvement: 'Giảm số tin đăng và xác thực' },
  },
];

export const DEMO_CHAT_ALERTS = [
  { conversation_id: 'c-alert-1', message_id: 'm1', alert_type: 'app_redirect', evidence: '"Gọi zalo 0901234567 em tư vấn thêm nha"', severity: 'warning' as const, user: 'Nguyễn Văn Toàn', grade: 'D' },
  { conversation_id: 'c-alert-2', message_id: 'm2', alert_type: 'broker_language', evidence: '"Em đại diện cho chủ nhà, còn nhiều căn khác..."', severity: 'warning' as const, user: 'Phạm Đức Long', grade: 'F' },
];

export const DEMO_INTEGRITY_OVERVIEW = {
  clean: 42, low: 5, medium: 2, high: 2, critical: 0,
  avgTransparency: 71,
  avgGrade: 'B' as TransparencyGrade,
  reportsThisWeek: 8,
  reportsConfirmed: 5,
  autoHidden: 0,
  brokersDeclared: 1,
  brokersSuspected: 2,
  gradeDistribution: { 'A+': 4, 'A': 13, 'B': 16, 'C': 12, 'D': 3, 'F': 2 },
};
