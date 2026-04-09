// ═══════════════════════════════════════════════════════
// CẦN & CÓ — Demo Market Insights
// ═══════════════════════════════════════════════════════

export interface MarketInsight {
  id: string;
  district: string;
  can_count: number;
  co_count: number;
  ratio: number;
  avg_co_price: number;
  avg_can_budget: number;
  trend: 'hot' | 'increasing' | 'stable' | 'decreasing';
  suggestions: {
    buyer: string;
    seller: string;
  };
  created_at: string;
}

const BASE_TIME = new Date('2026-03-22T08:00:00Z').getTime();
const h = (hours: number) => new Date(BASE_TIME - hours * 60 * 60 * 1000).toISOString();

export const DEMO_INSIGHTS: MarketInsight[] = [
  {
    id: 'insight-1',
    district: 'Quận 7',
    can_count: 8,
    co_count: 3,
    ratio: 2.7,
    avg_co_price: 3_600_000_000,
    avg_can_budget: 3_200_000_000,
    trend: 'increasing',
    suggestions: {
      buyer: 'Cân nhắc mở rộng sang Bình Thạnh hoặc Thủ Đức — giá mềm hơn 15-20%',
      seller: 'Nhu cầu cao, đây là thời điểm tốt để đăng tin',
    },
    created_at: h(2),
  },
  {
    id: 'insight-2',
    district: 'Bình Thạnh',
    can_count: 5,
    co_count: 4,
    ratio: 1.25,
    avg_co_price: 3_200_000_000,
    avg_can_budget: 2_800_000_000,
    trend: 'stable',
    suggestions: {
      buyer: 'Cung cầu cân bằng — có nhiều lựa chọn, nên so sánh kỹ',
      seller: 'Thị trường cạnh tranh, ảnh đẹp và xác thực sẽ tạo lợi thế',
    },
    created_at: h(8),
  },
  {
    id: 'insight-3',
    district: 'Thủ Đức',
    can_count: 12,
    co_count: 2,
    ratio: 6.0,
    avg_co_price: 2_500_000_000,
    avg_can_budget: 2_000_000_000,
    trend: 'hot',
    suggestions: {
      buyer: 'Cạnh tranh rất cao — nên phản hồi nhanh khi có match',
      seller: 'Nhu cầu gấp 6 lần cung — đăng tin sẽ match rất nhanh',
    },
    created_at: h(24),
  },
  {
    id: 'insight-4',
    district: 'Gò Vấp',
    can_count: 4,
    co_count: 7,
    ratio: 0.57,
    avg_co_price: 5_800_000_000,
    avg_can_budget: 5_500_000_000,
    trend: 'stable',
    suggestions: {
      buyer: 'Thị trường thiên người mua — nhiều lựa chọn nhà phố, có thể đàm phán giá',
      seller: 'Cạnh tranh cao giữa người bán. Xác thực đầy đủ + ảnh đẹp tạo lợi thế.',
    },
    created_at: h(36),
  },
  {
    id: 'insight-5',
    district: 'Quận 1',
    can_count: 6,
    co_count: 3,
    ratio: 2.0,
    avg_co_price: 12_000_000_000,
    avg_can_budget: 18_000_000_000,
    trend: 'increasing',
    suggestions: {
      buyer: 'Phân khúc premium, ít lựa chọn. Nên phản hồi nhanh khi có tin mới.',
      seller: 'Nhu cầu cao, đặc biệt penthouse và mặt tiền kinh doanh.',
    },
    created_at: h(48),
  },
  {
    id: 'insight-6',
    district: 'Phú Nhuận',
    can_count: 7,
    co_count: 4,
    ratio: 1.75,
    avg_co_price: 4_200_000_000,
    avg_can_budget: 3_800_000_000,
    trend: 'increasing',
    suggestions: {
      buyer: 'Khu vực đang lên — nhiều dự án mới, giao thông cải thiện.',
      seller: 'Nhu cầu tăng đều, giá ổn định, thích hợp đăng tin dài hạn.',
    },
    created_at: h(60),
  },
];
