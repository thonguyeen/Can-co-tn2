// ═══════════════════════════════════════════════════════
// CẦN & CÓ — Mock Analytics Data
// ═══════════════════════════════════════════════════════

export interface PlatformMetrics {
  total_intents: number;
  total_can: number;
  total_co: number;
  total_crawled: number;
  total_users: number;
  total_verified_users: number;
  total_matches: number;
  matches_to_chat: number;
  match_to_chat_rate: number;
  total_messages: number;
  total_reactions: number;
  total_saves: number;
  total_bot_comments: number;
  avg_trust_score: number;
  verified_intent_pct: number;
  total_knowledge_edges: number;
  avg_match_time_hours: number;
  funnel: { visitors: number; registered: number; posted: number; matched: number; chatted: number; deals: number };
  district_stats: { district: string; can: number; co: number; ratio: number; avgPrice: number; matchRate: number }[];
  trends: { intents: number; matches: number; chats: number };
  bot_stats: { name: string; avatar: string; count: number; pct: number }[];
}

export const DEMO_METRICS: PlatformMetrics = {
  total_intents: 80, total_can: 30, total_co: 50, total_crawled: 30, // 50 user + 30 crawled = 80
  total_users: 50, total_verified_users: 12,
  total_matches: 60, matches_to_chat: 15, match_to_chat_rate: 25.0,
  total_messages: 420, total_reactions: 340, total_saves: 45,
  total_bot_comments: 210,
  avg_trust_score: 3.1, verified_intent_pct: 42,
  total_knowledge_edges: 320, avg_match_time_hours: 86.4,
  funnel: { visitors: 2000, registered: 420, posted: 250, matched: 120, chatted: 35, deals: 8 },
  district_stats: [
    { district: 'Thủ Đức', can: 12, co: 2, ratio: 6.0, avgPrice: 2_500_000_000, matchRate: 15 },
    { district: 'Quận 7', can: 8, co: 3, ratio: 2.7, avgPrice: 3_600_000_000, matchRate: 40 },
    { district: 'Bình Thạnh', can: 5, co: 4, ratio: 1.25, avgPrice: 3_200_000_000, matchRate: 35 },
    { district: 'Gò Vấp', can: 3, co: 5, ratio: 0.6, avgPrice: 6_000_000_000, matchRate: 50 },
    { district: 'Phú Nhuận', can: 4, co: 2, ratio: 2.0, avgPrice: 4_500_000_000, matchRate: 30 },
  ],
  trends: { intents: 25, matches: 33, chats: 15 },
  bot_stats: [
    { name: 'Match Advisor', avatar: '🤖', count: 24, pct: 28.6 },
    { name: 'Nhà Advisor', avatar: '🏠', count: 20, pct: 23.8 },
    { name: 'Trust Checker', avatar: '🛡️', count: 14, pct: 16.7 },
    { name: 'Market Analyst', avatar: '📊', count: 12, pct: 14.3 },
    { name: 'Connector', avatar: '🤝', count: 8, pct: 9.5 },
    { name: 'Concierge', avatar: '🎯', count: 6, pct: 7.1 },
  ],
};
