// ═══════════════════════════════════════════════════════
// CẦN & CÓ — Demo Mock Intents (12 realistic Vietnamese)
// ═══════════════════════════════════════════════════════

export interface MockUser {
  id: string;
  name: string;
  avatar_url: string | null;
  trust_score: number;
  verification_level: string;
}

export interface MockComment {
  id: string;
  intent_id: string;
  user_id: string | null;
  content: string;
  is_bot: boolean;
  bot_name: string | null;
  created_at: string;
  user?: { name: string };
}

export interface MockIntent {
  id: string;
  is_bot?: boolean;
  user_id: string;
  type: 'CAN' | 'CO';
  raw_text: string;
  title: string;
  parsed_data: Record<string, unknown>;
  category: string;
  subcategory: string | null;
  price: number | null;
  price_min: number | null;
  price_max: number | null;
  address: string | null;
  district: string | null;
  ward: string | null;
  city: string;
  lat: number | null;
  lng: number | null;
  trust_score: number;
  verification_level: string;
  comment_count: number;
  match_count: number;
  view_count: number;
  reactions?: { interested: number; fair_price: number; hot: number };
  status: string;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  user: MockUser;
  images: { id: string; url: string; display_order: number }[];
  bot_comments?: MockComment[];
  bot_comment: MockComment | null;
  latest_comment: MockComment | null;
}

// Fixed base time to avoid SSR/client hydration mismatch
const BASE_TIME = new Date('2026-03-22T08:00:00Z').getTime();
const h = (hours: number) => new Date(BASE_TIME - hours * 60 * 60 * 1000).toISOString();
const m = (minutes: number) => new Date(BASE_TIME - minutes * 60 * 1000).toISOString();

// ═══════════════════════════════════════════════════════
// Users
// ═══════════════════════════════════════════════════════

export const MOCK_USERS: MockUser[] = [
  { id: 'u1', name: 'Nguyễn Minh Tú', avatar_url: null, trust_score: 4.5, verification_level: 'verified' },
  { id: 'u2', name: 'Trần Anh Khoa', avatar_url: null, trust_score: 4.2, verification_level: 'verified' },
  { id: 'u3', name: 'Lê Hồng Nhung', avatar_url: null, trust_score: 3.0, verification_level: 'kyc' },
  { id: 'u4', name: 'Phạm Thảo Vy', avatar_url: null, trust_score: 1.0, verification_level: 'none' },
  { id: 'u5', name: 'Đặng Minh Đức', avatar_url: null, trust_score: 4.8, verification_level: 'verified' },
  { id: 'u6', name: 'Vũ Ngọc Anh', avatar_url: null, trust_score: 3.5, verification_level: 'kyc' },
  { id: 'u7', name: 'Hoàng Thanh Hà', avatar_url: null, trust_score: 4.0, verification_level: 'verified' },
  { id: 'u8', name: 'Bùi Quốc Huy', avatar_url: null, trust_score: 1.0, verification_level: 'none' },
];

// ═══════════════════════════════════════════════════════
// 12 Intent Posts
// ═══════════════════════════════════════════════════════

export const DEMO_INTENTS: MockIntent[] = [
  // --- CẦN 1: Căn hộ Q7 ---
  {
    id: 'i-001', user_id: 'u1', type: 'CAN',
    raw_text: 'Tìm mua căn hộ 2PN Quận 7, gần trường quốc tế cho con học, budget 3-4 tỷ. Ưu tiên tầng cao, ban công hướng Đông Nam.',
    title: 'Tìm căn hộ 2PN Quận 7 gần trường quốc tế',
    parsed_data: { district: 'Quận 7', bedrooms: 2, keywords: ['gần trường quốc tế', 'tầng cao', 'ban công hướng ĐN'] },
    category: 'real_estate', subcategory: 'apartment',
    price: null, price_min: 3_000_000_000, price_max: 4_000_000_000,
    address: null, district: 'Quận 7', ward: null, city: 'Hồ Chí Minh', lat: null, lng: null,
    trust_score: 4.5, verification_level: 'verified',
    comment_count: 3, match_count: 2, view_count: 67,
    reactions: { interested: 15, fair_price: 6, hot: 4 },
    status: 'active', expires_at: null, created_at: h(2), updated_at: h(2),
    user: MOCK_USERS[0], images: [],
    bot_comments: [
      { id: 'bc1a', intent_id: 'i-001', user_id: null, content: 'Tìm thấy 2 tin phù hợp nhu cầu của bạn. Bấm \"Xem match\" để xem chi tiết.', is_bot: true, bot_name: 'match_advisor', created_at: h(1.5) },
      { id: 'bc1b', intent_id: 'i-001', user_id: null, content: 'Bạn đã tìm nhà Q7 lần thứ 3 — budget hiện tại 3-4 tỷ (tăng từ 2.5 tỷ lần đầu). Giá TB 2PN Q7 khoảng 3.2-3.8 tỷ, tầm giá phù hợp thị trường.', is_bot: true, bot_name: 'nha_advisor', created_at: h(1.5) },
      { id: 'bc1c', intent_id: 'i-001', user_id: null, content: '📊 Q7: 8 CẦN vs 3 CÓ — tỷ lệ cầu/cung 2.7x (thiên người bán)', is_bot: true, bot_name: 'market_analyst', created_at: h(1.5) },
    ],
    bot_comment: { id: 'bc1', intent_id: 'i-001', user_id: null, content: 'Tìm thấy 2 tin phù hợp:\n1. Vinhomes Q7 3.5 tỷ ✅\n2. Sunrise City 3.8 tỷ 🟡\nĐộ phù hợp cao nhất: 87%', is_bot: true, bot_name: 'Match Advisor', created_at: h(1.5) },
    latest_comment: { id: 'c1', intent_id: 'i-001', user_id: 'u6', content: 'Khu Phú Mỹ Hưng cũng nhiều căn 2PN tầm giá này, bạn cân nhắc không?', is_bot: false, bot_name: null, created_at: m(30), user: { name: 'Vũ Ngọc Anh' } },
  },

  // --- CÓ 1: Vinhomes Central Park ---
  {
    id: 'i-002', user_id: 'u2', type: 'CO',
    raw_text: 'Bán căn hộ Vinhomes Central Park, 2PN 75m², full nội thất cao cấp, tầng 18 view sông Sài Gòn. Giá 3.5 tỷ thương lượng nhẹ. Sổ hồng chính chủ.',
    title: 'Bán Vinhomes Central Park 2PN view sông',
    parsed_data: { district: 'Bình Thạnh', bedrooms: 2, area: 75, floor: 18, project_name: 'Vinhomes Central Park' },
    category: 'real_estate', subcategory: 'apartment',
    price: 3_500_000_000, price_min: null, price_max: null,
    address: '208 Nguyễn Hữu Cảnh', district: 'Bình Thạnh', ward: 'Phường 22', city: 'Hồ Chí Minh', lat: 10.7942, lng: 106.7214,
    trust_score: 5, verification_level: 'verified',
    comment_count: 5, match_count: 4, view_count: 156,
    reactions: { interested: 28, fair_price: 18, hot: 9 },
    status: 'active', expires_at: null, created_at: m(45), updated_at: m(45),
    user: MOCK_USERS[1],
    images: [
      { id: 'img1', url: 'https://placehold.co/600x400/1B6B4A/fff?text=Phòng+khách', display_order: 0 },
      { id: 'img2', url: 'https://placehold.co/600x400/2563EB/fff?text=Phòng+ngủ', display_order: 1 },
      { id: 'img3', url: 'https://placehold.co/600x400/F97316/fff?text=Bếp', display_order: 2 },
      { id: 'img4', url: 'https://placehold.co/600x400/22C55E/fff?text=View+sông', display_order: 3 },
    ],
    bot_comments: [
      { id: 'bc2a', intent_id: 'i-002', user_id: null, content: '4 người đang tìm mua căn hộ khu Bình Thạnh tầm 3-4 tỷ. Tin đã được gợi ý cho họ.', is_bot: true, bot_name: 'match_advisor', created_at: h(1.5) },
      { id: 'bc2b', intent_id: 'i-002', user_id: null, content: '✅ Tin đã được xác thực đầy đủ (CCCD + Sổ đỏ + GPS). Người mua có thể yên tâm liên hệ.', is_bot: true, bot_name: 'trust_checker', created_at: h(1.5) },
      { id: 'bc2c', intent_id: 'i-002', user_id: null, content: 'Giá 3.5 tỷ cho Vinhomes 2PN tầng 18 view sông — hợp thị trường, thanh khoản tốt.', is_bot: true, bot_name: 'nha_advisor', created_at: h(1.5) },
    ],
    bot_comment: { id: 'bc2', intent_id: 'i-002', user_id: null, content: '4 người đang tìm mua căn hộ khu Bình Thạnh tầm 3-4 tỷ. Tin đã được gợi ý cho họ.', is_bot: true, bot_name: 'Match Advisor', created_at: m(40) },
    latest_comment: { id: 'c2', intent_id: 'i-002', user_id: 'u6', content: 'View sông hướng nào vậy anh? Có bị nắng chiều không?', is_bot: false, bot_name: null, created_at: m(20), user: { name: 'Vũ Ngọc Anh' } },
  },

  // --- CẦN 2: Studio Thủ Đức ---
  {
    id: 'i-003', user_id: 'u8', type: 'CAN',
    raw_text: 'Cần thuê studio hoặc 1PN khu Thủ Đức, gần ĐH Quốc Gia. Budget 5-8 triệu/tháng. Dọn vào ngay được, ưu tiên nội thất đầy đủ.',
    title: 'Thuê studio Thủ Đức gần ĐH Quốc Gia',
    parsed_data: { district: 'Thủ Đức', bedrooms: 1, keywords: ['gần ĐH Quốc Gia', 'nội thất đầy đủ', 'dọn vào ngay'] },
    category: 'real_estate', subcategory: 'apartment',
    price: null, price_min: 5_000_000, price_max: 8_000_000,
    address: null, district: 'Thủ Đức', ward: null, city: 'Hồ Chí Minh', lat: null, lng: null,
    trust_score: 1, verification_level: 'none',
    comment_count: 0, match_count: 0, view_count: 14,
    reactions: { interested: 3, fair_price: 0, hot: 0 },
    status: 'active', expires_at: null, created_at: h(5), updated_at: h(5),
    user: MOCK_USERS[7], images: [],
    bot_comments: [
      { id: 'bc3a', intent_id: 'i-003', user_id: null, content: '🎯 Đây là tin đầu tiên của bạn! Budget 5-8 triệu rõ ràng, tốt lắm. Mẹo: thêm thời gian dọn vào cụ thể, chủ nhà sẽ phản hồi nhanh hơn 👍', is_bot: true, bot_name: 'concierge', created_at: h(1.5) },
      { id: 'bc3b', intent_id: 'i-003', user_id: null, content: '🛡️ Tip: Xác thực SĐT để nhận match nhanh hơn. Tin đã xác thực được ưu tiên hiển thị →', is_bot: true, bot_name: 'trust_checker', created_at: h(1.5) },
    ],
    bot_comment: { id: 'bc3', intent_id: 'i-003', user_id: null, content: 'Chưa tìm thấy match phù hợp. Đang theo dõi — sẽ thông báo ngay khi có người đăng.', is_bot: true, bot_name: 'Match Advisor', created_at: h(4.5) },
    latest_comment: null,
  },

  // --- CÓ 2: Nhà phố Gò Vấp ---
  {
    id: 'i-004', user_id: 'u7', type: 'CO',
    raw_text: 'Bán gấp nhà phố Gò Vấp, hẻm 6m đường Nguyễn Oanh, 4x15m, 3 tầng, 3PN 3WC. Sổ hồng riêng, khu dân cư yên tĩnh. Giá 6.2 tỷ.',
    title: 'Bán nhà phố Gò Vấp hẻm 6m, 3 tầng',
    parsed_data: { district: 'Gò Vấp', bedrooms: 3, area: 60, keywords: ['hẻm 6m', 'sổ hồng riêng', 'khu yên tĩnh'] },
    category: 'real_estate', subcategory: 'house',
    price: 6_200_000_000, price_min: null, price_max: null,
    address: 'Đường Nguyễn Oanh, Gò Vấp', district: 'Gò Vấp', ward: 'Phường 17', city: 'Hồ Chí Minh', lat: 10.8382, lng: 106.6652,
    trust_score: 4, verification_level: 'verified',
    comment_count: 8, match_count: 3, view_count: 98,
    reactions: { interested: 20, fair_price: 9, hot: 6 },
    status: 'active', expires_at: null, created_at: h(8), updated_at: h(6),
    user: MOCK_USERS[6],
    images: [
      { id: 'img5', url: 'https://placehold.co/600x400/111827/fff?text=Mặt+tiền', display_order: 0 },
      { id: 'img6', url: 'https://placehold.co/600x400/374151/fff?text=Phòng+khách', display_order: 1 },
    ],
    bot_comments: [
      { id: 'bc4a', intent_id: 'i-004', user_id: null, content: '3 người đang tìm nhà phố Gò Vấp. Tin đã được gợi ý cho họ.', is_bot: true, bot_name: 'match_advisor', created_at: h(1.5) },
      { id: 'bc4b', intent_id: 'i-004', user_id: null, content: '📊 Gò Vấp: nhà phố 4x15m hẻm xe hơi khoảng 5.5-7.5 tỷ. Giá 6.2 tỷ nằm trong tầm trung.', is_bot: true, bot_name: 'market_analyst', created_at: h(1.5) },
      { id: 'bc4c', intent_id: 'i-004', user_id: null, content: 'Gò Vấp: thanh khoản tốt, hẻm 6m là điểm cộng lớn. Nên bổ sung ảnh thực tế để tăng match.', is_bot: true, bot_name: 'nha_advisor', created_at: h(1.5) },
    ],
    bot_comment: { id: 'bc4', intent_id: 'i-004', user_id: null, content: '3 người đang tìm nhà phố Gò Vấp. Giá bạn đăng nằm trong tầm trung khu vực (5.5-7 tỷ).', is_bot: true, bot_name: 'Market Analyst', created_at: h(7) },
    latest_comment: { id: 'c4', intent_id: 'i-004', user_id: 'u1', content: 'Nhà có hẻm xe hơi vào tận nơi không bác?', is_bot: false, bot_name: null, created_at: h(3), user: { name: 'Nguyễn Minh Tú' } },
  },

  // --- CẦN 3: Căn hộ 3PN Thủ Đức ---
  {
    id: 'i-005', user_id: 'u6', type: 'CAN',
    raw_text: 'Tìm mua căn hộ 3PN Quận 2 (Thủ Đức) cho gia đình 4 người. Gần trường Việt Úc, có hồ bơi và sân chơi trẻ em. Budget 5-8 tỷ.',
    title: 'Tìm căn hộ 3PN Thủ Đức cho gia đình',
    parsed_data: { district: 'Thủ Đức', bedrooms: 3, keywords: ['gần trường Việt Úc', 'hồ bơi', 'sân chơi trẻ em'] },
    category: 'real_estate', subcategory: 'apartment',
    price: null, price_min: 5_000_000_000, price_max: 8_000_000_000,
    address: null, district: 'Thủ Đức', ward: null, city: 'Hồ Chí Minh', lat: null, lng: null,
    trust_score: 3.5, verification_level: 'kyc',
    comment_count: 2, match_count: 4, view_count: 42,
    reactions: { interested: 10, fair_price: 4, hot: 2 },
    status: 'active', expires_at: null, created_at: h(12), updated_at: h(12),
    user: MOCK_USERS[5], images: [],
    bot_comments: [
      { id: 'bc5a', intent_id: 'i-005', user_id: null, content: 'Tìm thấy 4 tin phù hợp. Top: The Global City 3PN 6.2 tỷ ✅. Độ phù hợp: 82%', is_bot: true, bot_name: 'match_advisor', created_at: h(1.5) },
      { id: 'bc5b', intent_id: 'i-005', user_id: null, content: 'Thủ Đức đang phát triển mạnh nhờ metro. Giá 3PN tầm 5-8 tỷ tùy dự án và vị trí.', is_bot: true, bot_name: 'nha_advisor', created_at: h(1.5) },
    ],
    bot_comment: { id: 'bc5', intent_id: 'i-005', user_id: null, content: 'Tìm thấy 4 tin phù hợp:\n1. The Global City 3PN 6.2 tỷ ✅\n2. Masteri An Phú 3PN 7.5 tỷ 🟡\nĐộ phù hợp: 82%', is_bot: true, bot_name: 'Match Advisor', created_at: h(11) },
    latest_comment: null,
  },

  // --- CÓ 3: Cho thuê Masteri ---
  {
    id: 'i-006', user_id: 'u3', type: 'CO',
    raw_text: 'Cho thuê căn hộ Masteri Thảo Điền, 2PN 70m², nội thất cơ bản, tầng 12, view thành phố. Giá 15 triệu/tháng. Sẵn ở ngay.',
    title: 'Cho thuê Masteri Thảo Điền 2PN 15tr/tháng',
    parsed_data: { district: 'Thủ Đức', bedrooms: 2, area: 70, floor: 12, project_name: 'Masteri Thảo Điền' },
    category: 'real_estate', subcategory: 'apartment',
    price: 15_000_000, price_min: null, price_max: null,
    address: 'Masteri Thảo Điền, Xa Lộ Hà Nội', district: 'Thủ Đức', ward: 'Thảo Điền', city: 'Hồ Chí Minh', lat: 10.8024, lng: 106.7419,
    trust_score: 3, verification_level: 'kyc',
    comment_count: 6, match_count: 2, view_count: 189,
    reactions: { interested: 32, fair_price: 14, hot: 11 },
    status: 'active', expires_at: null, created_at: h(1), updated_at: h(1),
    user: MOCK_USERS[2],
    images: [
      { id: 'img7', url: 'https://placehold.co/600x400/6366f1/fff?text=Phòng+khách', display_order: 0 },
      { id: 'img8', url: 'https://placehold.co/600x400/8b5cf6/fff?text=View+TP', display_order: 1 },
    ],
    bot_comments: [
      { id: 'bc6a', intent_id: 'i-006', user_id: null, content: '2 người đang tìm thuê căn hộ Thủ Đức. Giá hợp lý so với thị trường (14-20 triệu cho Masteri 2PN).', is_bot: true, bot_name: 'match_advisor', created_at: h(1.5) },
      { id: 'bc6b', intent_id: 'i-006', user_id: null, content: '📊 Thủ Đức cho thuê: 12 CẦN vs 2 CÓ — nhu cầu gấp 6 lần cung, tin sẽ match rất nhanh.', is_bot: true, bot_name: 'market_analyst', created_at: h(1.5) },
    ],
    bot_comment: { id: 'bc6', intent_id: 'i-006', user_id: null, content: '2 người đang tìm thuê căn hộ Thủ Đức. Giá hợp lý so với thị trường (14-20 triệu cho Masteri 2PN).', is_bot: true, bot_name: 'Market Analyst', created_at: m(50) },
    latest_comment: { id: 'c6', intent_id: 'i-006', user_id: 'u8', content: 'Hợp đồng thuê tối thiểu mấy tháng ạ?', is_bot: false, bot_name: null, created_at: m(15), user: { name: 'Bùi Quốc Huy' } },
  },

  // --- CẦN 4: Mặt bằng Q3 ---
  {
    id: 'i-007', user_id: 'u3', type: 'CAN',
    raw_text: 'Cần thuê mặt bằng kinh doanh quán cà phê Quận 3 hoặc Phú Nhuận, 50-100m², mặt tiền đường lớn. Budget 30-50 triệu/tháng.',
    title: 'Thuê mặt bằng café Q3/Phú Nhuận',
    parsed_data: { district: 'Quận 3', area: 75, keywords: ['mặt tiền', 'quán cà phê', 'đường lớn'] },
    category: 'real_estate', subcategory: 'commercial',
    price: null, price_min: 30_000_000, price_max: 50_000_000,
    address: null, district: 'Quận 3', ward: null, city: 'Hồ Chí Minh', lat: null, lng: null,
    trust_score: 3, verification_level: 'kyc',
    comment_count: 1, match_count: 1, view_count: 31,
    reactions: { interested: 7, fair_price: 2, hot: 1 },
    status: 'active', expires_at: null, created_at: h(18), updated_at: h(18),
    user: MOCK_USERS[2], images: [],
    bot_comments: [
      { id: 'bc7a', intent_id: 'i-007', user_id: null, content: 'Có 1 mặt bằng Q3 phù hợp: Nguyễn Đình Chiểu 80m², 45tr/tháng. Độ phù hợp: 78%', is_bot: true, bot_name: 'match_advisor', created_at: h(1.5) },
    ],
    bot_comment: { id: 'bc7', intent_id: 'i-007', user_id: null, content: 'Có 1 mặt bằng Q3 phù hợp: Nguyễn Đình Chiểu 80m², 45tr/tháng. Độ phù hợp: 78%', is_bot: true, bot_name: 'Match Advisor', created_at: h(17) },
    latest_comment: null,
  },

  // --- CÓ 4: Sunrise City Q7 ---
  {
    id: 'i-008', user_id: 'u5', type: 'CO',
    raw_text: 'Bán căn hộ Sunrise City Quận 7, 3PN 100m², full nội thất nhập khẩu, 2 view sông + công viên, tầng 25. Giá 6.5 tỷ. Đã xác thực GPS.',
    title: 'Bán Sunrise City Q7 3PN 100m² view sông',
    parsed_data: { district: 'Quận 7', bedrooms: 3, area: 100, floor: 25, project_name: 'Sunrise City' },
    category: 'real_estate', subcategory: 'apartment',
    price: 6_500_000_000, price_min: null, price_max: null,
    address: 'Sunrise City, Nguyễn Hữu Thọ', district: 'Quận 7', ward: 'Tân Hưng', city: 'Hồ Chí Minh', lat: 10.7365, lng: 106.7005,
    trust_score: 4.8, verification_level: 'verified',
    comment_count: 14, match_count: 5, view_count: 203,
    reactions: { interested: 35, fair_price: 12, hot: 15 },
    status: 'active', expires_at: null, created_at: h(3), updated_at: h(2),
    user: MOCK_USERS[4],
    images: [
      { id: 'img9', url: 'https://placehold.co/600x400/dc2626/fff?text=View+sông', display_order: 0 },
      { id: 'img10', url: 'https://placehold.co/600x400/ea580c/fff?text=Phòng+khách', display_order: 1 },
      { id: 'img11', url: 'https://placehold.co/600x400/d97706/fff?text=Master+Bedroom', display_order: 2 },
      { id: 'img12', url: 'https://placehold.co/600x400/65a30d/fff?text=Bếp', display_order: 3 },
    ],
    bot_comments: [
      { id: 'bc8a', intent_id: 'i-008', user_id: null, content: '5 người đang tìm mua căn hộ Q7 tầm 5-8 tỷ. Tin hot nhất khu vực tuần này!', is_bot: true, bot_name: 'match_advisor', created_at: h(1.5) },
      { id: 'bc8b', intent_id: 'i-008', user_id: null, content: '✅ Tin đã xác thực đầy đủ. Đặng Minh Đức là người bán uy tín (Trust 4.8/5).', is_bot: true, bot_name: 'trust_checker', created_at: h(1.5) },
      { id: 'bc8c', intent_id: 'i-008', user_id: null, content: '🤝 5 người quan tâm khu vực Q7 cao cấp. Bạn có thể được kết nối tự động khi có match.', is_bot: true, bot_name: 'connector', created_at: h(1.5) },
    ],
    bot_comment: { id: 'bc8', intent_id: 'i-008', user_id: null, content: '5 người đang tìm mua căn hộ Q7 tầm 5-8 tỷ. Tin đã được gợi ý. Đây là tin hot nhất khu vực tuần này!', is_bot: true, bot_name: 'Match Advisor', created_at: h(2.5) },
    latest_comment: { id: 'c8', intent_id: 'i-008', user_id: 'u1', content: 'Phí quản lý hàng tháng bao nhiêu vậy anh?', is_bot: false, bot_name: null, created_at: h(1), user: { name: 'Nguyễn Minh Tú' } },
  },

  // --- CẦN 5: Nhà phố cho gia đình ---
  {
    id: 'i-009', user_id: 'u7', type: 'CAN',
    raw_text: 'Tìm mua nhà phố Gò Vấp hoặc Bình Thạnh, hẻm xe hơi, 3 tầng trở lên, 3PN+. Budget 5-7 tỷ. Cần sổ hồng riêng, pháp lý sạch.',
    title: 'Tìm nhà phố Gò Vấp/Bình Thạnh 5-7 tỷ',
    parsed_data: { district: 'Gò Vấp', bedrooms: 3, keywords: ['hẻm xe hơi', 'sổ hồng riêng', 'pháp lý sạch'] },
    category: 'real_estate', subcategory: 'house',
    price: null, price_min: 5_000_000_000, price_max: 7_000_000_000,
    address: null, district: 'Gò Vấp', ward: null, city: 'Hồ Chí Minh', lat: null, lng: null,
    trust_score: 4, verification_level: 'verified',
    comment_count: 4, match_count: 3, view_count: 55,
    reactions: { interested: 12, fair_price: 5, hot: 3 },
    status: 'active', expires_at: null, created_at: h(24), updated_at: h(24),
    user: MOCK_USERS[6], images: [],
    bot_comments: [
      { id: 'bc9a', intent_id: 'i-009', user_id: null, content: '3 tin nhà phố Gò Vấp phù hợp budget. Giá trung bình khu vực: 5.8-7.5 tỷ.', is_bot: true, bot_name: 'match_advisor', created_at: h(1.5) },
      { id: 'bc9b', intent_id: 'i-009', user_id: null, content: '📊 Gò Vấp: 3 CẦN vs 5 CÓ — thị trường cân bằng, người mua có nhiều lựa chọn.', is_bot: true, bot_name: 'market_analyst', created_at: h(1.5) },
    ],
    bot_comment: { id: 'bc9', intent_id: 'i-009', user_id: null, content: '3 tin nhà phố Gò Vấp phù hợp budget. Giá trung bình khu vực: 5.8-7.5 tỷ cho diện tích 4x15m.', is_bot: true, bot_name: 'Market Analyst', created_at: h(23) },
    latest_comment: { id: 'c9', intent_id: 'i-009', user_id: 'u2', content: 'Mình có 1 căn Gò Vấp 4x16m, 6.2 tỷ, SHR. Anh xem thử?', is_bot: false, bot_name: null, created_at: h(20), user: { name: 'Trần Anh Khoa' } },
  },

  // --- CÓ 5: Mặt bằng Q3 ---
  {
    id: 'i-010', user_id: 'u5', type: 'CO',
    raw_text: 'Cho thuê mặt bằng Quận 3, đường Nguyễn Đình Chiểu, 80m², phù hợp quán café hoặc showroom. Mặt tiền 6m. 45 triệu/tháng.',
    title: 'Cho thuê mặt bằng Q3, Nguyễn Đình Chiểu',
    parsed_data: { district: 'Quận 3', area: 80, keywords: ['mặt tiền 6m', 'quán café', 'showroom'] },
    category: 'real_estate', subcategory: 'commercial',
    price: 45_000_000, price_min: null, price_max: null,
    address: 'Nguyễn Đình Chiểu, Q3', district: 'Quận 3', ward: null, city: 'Hồ Chí Minh', lat: null, lng: null,
    trust_score: 4.8, verification_level: 'verified',
    comment_count: 3, match_count: 1, view_count: 76,
    reactions: { interested: 11, fair_price: 8, hot: 2 },
    status: 'active', expires_at: null, created_at: h(6), updated_at: h(6),
    user: MOCK_USERS[4], images: [],
    bot_comments: [
      { id: 'bc10a', intent_id: 'i-010', user_id: null, content: 'Có 1 người đang tìm mặt bằng café Q3. Đã gợi ý cho họ.', is_bot: true, bot_name: 'match_advisor', created_at: h(1.5) },
      { id: 'bc10b', intent_id: 'i-010', user_id: null, content: 'Mặt bằng Q3 Nguyễn Đình Chiểu: vị trí đẹp, phù hợp F&B. Giá 45tr hợp thị trường.', is_bot: true, bot_name: 'nha_advisor', created_at: h(1.5) },
    ],
    bot_comment: { id: 'bc10', intent_id: 'i-010', user_id: null, content: 'Có 1 người đang tìm mặt bằng café Q3 phù hợp. Đã gợi ý cho họ.', is_bot: true, bot_name: 'Match Advisor', created_at: h(5.5) },
    latest_comment: { id: 'c10', intent_id: 'i-010', user_id: 'u3', content: 'Có chỗ đậu xe máy cho khách không ạ?', is_bot: false, bot_name: null, created_at: h(4), user: { name: 'Lê Hồng Nhung' } },
  },

  // --- CẦN 6: Phòng trọ sinh viên ---
  {
    id: 'i-011', user_id: 'u4', type: 'CAN',
    raw_text: 'Sinh viên cần thuê phòng trọ sạch sẽ gần ĐH Bách Khoa, dưới 3 triệu/tháng, có wifi và chỗ để xe. Ưu tiên gần chợ.',
    title: 'Thuê phòng trọ gần ĐH Bách Khoa',
    parsed_data: { district: 'Bình Thạnh', keywords: ['gần ĐH Bách Khoa', 'wifi', 'chỗ để xe', 'gần chợ'] },
    category: 'real_estate', subcategory: 'room',
    price: null, price_min: null, price_max: 3_000_000,
    address: null, district: 'Bình Thạnh', ward: null, city: 'Hồ Chí Minh', lat: null, lng: null,
    trust_score: 1, verification_level: 'none',
    comment_count: 2, match_count: 1, view_count: 23,
    reactions: { interested: 5, fair_price: 1, hot: 0 },
    status: 'active', expires_at: null, created_at: h(36), updated_at: h(36),
    user: MOCK_USERS[3], images: [],
    bot_comments: [
      { id: 'bc11a', intent_id: 'i-011', user_id: null, content: '🤝 3 sinh viên khác cũng đang tìm trọ gần ĐH Bách Khoa. Kết nối để trao đổi?', is_bot: true, bot_name: 'connector', created_at: h(1.5) },
      { id: 'bc11b', intent_id: 'i-011', user_id: null, content: '🎯 Mẹo: ghi rõ ngân sách và thời gian vào ở, chủ trọ sẽ liên hệ nhanh hơn.', is_bot: true, bot_name: 'concierge', created_at: h(1.5) },
    ],
    bot_comment: null,
    latest_comment: { id: 'c11', intent_id: 'i-011', user_id: 'u7', content: 'Mình biết 1 dãy trọ gần BK, sạch sẽ, 2.5tr/tháng. Để mình gửi thông tin.', is_bot: false, bot_name: null, created_at: h(30), user: { name: 'Hoàng Thanh Hà' } },
  },

  // --- CÓ 6: Phòng trọ Bình Thạnh ---
  {
    id: 'i-012', user_id: 'u7', type: 'CO',
    raw_text: 'Cho thuê phòng trọ Bình Thạnh gần ĐH Hutech và ĐH Bách Khoa, 20m² có gác lửng, wifi free, giờ giấc tự do. 2.5 triệu/tháng.',
    title: 'Cho thuê phòng trọ Bình Thạnh 2.5tr',
    parsed_data: { district: 'Bình Thạnh', area: 20, keywords: ['gần ĐH Hutech', 'gần ĐH Bách Khoa', 'gác lửng', 'wifi free'] },
    category: 'real_estate', subcategory: 'room',
    price: 2_500_000, price_min: null, price_max: null,
    address: null, district: 'Bình Thạnh', ward: null, city: 'Hồ Chí Minh', lat: null, lng: null,
    trust_score: 4, verification_level: 'verified',
    comment_count: 5, match_count: 1, view_count: 45,
    reactions: { interested: 14, fair_price: 10, hot: 3 },
    status: 'active', expires_at: null, created_at: h(4), updated_at: h(4),
    user: MOCK_USERS[6], images: [],
    bot_comments: [
      { id: 'bc12a', intent_id: 'i-012', user_id: null, content: 'Có 1 sinh viên đang tìm phòng trọ gần ĐH Bách Khoa, budget dưới 3 triệu. Đã gợi ý.', is_bot: true, bot_name: 'match_advisor', created_at: h(1.5) },
      { id: 'bc12b', intent_id: 'i-012', user_id: null, content: '✅ Hoàng Thanh Hà là chủ trọ đã xác thực. Phản hồi nhanh, đáng tin cậy.', is_bot: true, bot_name: 'trust_checker', created_at: h(1.5) },
    ],
    bot_comment: { id: 'bc12', intent_id: 'i-012', user_id: null, content: 'Có 1 sinh viên đang tìm phòng trọ gần ĐH Bách Khoa, budget dưới 3 triệu. Đã gợi ý cho họ.', is_bot: true, bot_name: 'Match Advisor', created_at: h(3.5) },
    latest_comment: { id: 'c12', intent_id: 'i-012', user_id: 'u4', content: 'Phòng có ban công không ạ? Mình cần phơi đồ.', is_bot: false, bot_name: null, created_at: h(2), user: { name: 'Phạm Thảo Vy' } },
  },
];
