// ═══════════════════════════════════════════════════════
// CẦN & CÓ — Pre-built Knowledge Graph (87 edges)
// ═══════════════════════════════════════════════════════

export interface MockEdge {
  source_type: string;
  source_id: string;
  relation: string;
  target_type: string;
  target_id: string;
  weight: number;
}

export const DEMO_GRAPH_STATS = {
  nodes: { intents: 80, users: 50, districts: 12, categories: 5 },
  edges: 360,
  hottestDistrict: { name: 'Thủ Đức', ratio: 6.0 },
  strongestConnection: { userA: 'Nguyễn Minh Tú', userB: 'Trần Anh Khoa', weight: 0.87 },
};

export const DEMO_DISTRICT_HEAT = [
  { district: 'Thủ Đức', canCount: 12, coCount: 2, totalInterest: 18, heatLevel: 'very_hot' as const },
  { district: 'Quận 7', canCount: 8, coCount: 3, totalInterest: 14, heatLevel: 'hot' as const },
  { district: 'Bình Thạnh', canCount: 5, coCount: 4, totalInterest: 11, heatLevel: 'hot' as const },
  { district: 'Gò Vấp', canCount: 3, coCount: 5, totalInterest: 9, heatLevel: 'warm' as const },
  { district: 'Quận 3', canCount: 4, coCount: 2, totalInterest: 7, heatLevel: 'warm' as const },
  { district: 'Phú Nhuận', canCount: 2, coCount: 1, totalInterest: 3, heatLevel: 'cold' as const },
];

export const DEMO_SIMILAR_USERS = [
  { userId: 'u2', name: 'Trần Anh Khoa', overlapCount: 3, sharedDistricts: ['Quận 7', 'Bình Thạnh'], reason: 'Cùng quan tâm Q7, Bình Thạnh + đã lưu 2 tin chung' },
  { userId: 'u5', name: 'Đặng Minh Đức', overlapCount: 2, sharedDistricts: ['Quận 7'], reason: 'Cùng quan tâm Q7 + 5 match' },
  { userId: 'u6', name: 'Vũ Ngọc Anh', overlapCount: 2, sharedDistricts: ['Quận 7', 'Thủ Đức'], reason: 'Cùng tìm nhà Q7 và Thủ Đức' },
];
