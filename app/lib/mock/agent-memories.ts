// ═══════════════════════════════════════════════════════
// CẦN & CÓ — Pre-built Agent Memories (demo)
// ═══════════════════════════════════════════════════════

export interface MockMemory {
  bot_id: string;
  user_id: string;
  memory_type: string;
  content: string;
}

export const DEMO_MEMORIES: MockMemory[] = [
  // Nhà Advisor about Minh Tú
  { bot_id: 'nha_advisor', user_id: 'u1', memory_type: 'preference', content: 'Quan tâm Q7 (3 lần), Bình Thạnh (1 lần)' },
  { bot_id: 'nha_advisor', user_id: 'u1', memory_type: 'pattern', content: 'Budget tăng dần: 2.5 tỷ → 3 tỷ → 3-4 tỷ qua 3 lần tìm' },

  // Concierge about new users
  { bot_id: 'concierge', user_id: 'u4', memory_type: 'insight', content: 'Người mới, 1 intent, chưa xác thực, sinh viên' },
  { bot_id: 'concierge', user_id: 'u8', memory_type: 'insight', content: 'Người mới, 1 intent, sinh viên tìm trọ' },

  // Market Analyst global
  { bot_id: 'market_analyst', user_id: 'system', memory_type: 'insight', content: 'Q7 CẦN tăng 33% tuần này (6→8). Thủ Đức CẦN tăng 50% (8→12).' },
  { bot_id: 'market_analyst', user_id: 'system', memory_type: 'pattern', content: 'Bình Thạnh cung cầu cân bằng 3 tuần liên tiếp.' },

  // Trust Checker about verified users
  { bot_id: 'trust_checker', user_id: 'u2', memory_type: 'insight', content: 'Đã xác thực 3/3. Trust 4.2. Chuyên bán BĐS Q7.' },
  { bot_id: 'trust_checker', user_id: 'u5', memory_type: 'insight', content: 'Đã xác thực 3/3. Trust 4.8. Top seller. 15 tin đăng, 12 match.' },

  // Nhà Advisor about Ngọc Anh
  { bot_id: 'nha_advisor', user_id: 'u6', memory_type: 'preference', content: 'Tìm căn hộ 3PN Thủ Đức cho gia đình. Budget 5-8 tỷ.' },

  // Connector observations
  { bot_id: 'connector', user_id: 'system', memory_type: 'insight', content: '5 người cùng quan tâm Q7. 3 sinh viên tìm trọ Bình Thạnh.' },
];

/**
 * Get demo memories for a specific bot + user combo
 */
export function getDemoMemories(botId: string, userId: string): MockMemory[] {
  return DEMO_MEMORIES.filter((m) => m.bot_id === botId && (m.user_id === userId || m.user_id === 'system'));
}
