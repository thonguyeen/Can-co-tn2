// ═══════════════════════════════════════════════════════
// CẦN & CÓ — 50 Mock Users
// ═══════════════════════════════════════════════════════

export interface MockUserFull {
  id: string;
  name: string;
  avatar_url: string | null;
  trust_score: number;
  verification_level: 'none' | 'kyc' | 'verified';
  phone: string;
  joined_at: string;
  bio: string;
  intent_count: number;
  match_count: number;
  rating_avg: number;
  rating_count: number;
}

const BASE = new Date('2026-03-22T08:00:00Z').getTime();
const day = (d: number) => new Date(BASE - d * 24 * 60 * 60 * 1000).toISOString();

// Power users (5)
const POWER: MockUserFull[] = [
  { id: 'u01', name: 'Đặng Minh Đức', avatar_url: null, trust_score: 4.8, verification_level: 'verified', phone: '0901****12', joined_at: day(180), bio: 'Chuyên BĐS Q7 & Thủ Đức. 15 tin đăng, 12 match.', intent_count: 15, match_count: 12, rating_avg: 4.9, rating_count: 8 },
  { id: 'u02', name: 'Nguyễn Thị Lan Anh', avatar_url: null, trust_score: 4.6, verification_level: 'verified', phone: '0912****34', joined_at: day(150), bio: 'Chuyên cho thuê căn hộ HCM. Phản hồi nhanh.', intent_count: 10, match_count: 8, rating_avg: 4.7, rating_count: 6 },
  { id: 'u03', name: 'Phạm Hoàng Nam', avatar_url: null, trust_score: 4.5, verification_level: 'verified', phone: '0933****56', joined_at: day(120), bio: 'Đầu tư BĐS đa khu vực. Kinh nghiệm 10 năm.', intent_count: 8, match_count: 6, rating_avg: 4.5, rating_count: 5 },
  { id: 'u04', name: 'Trần Thanh Hằng', avatar_url: null, trust_score: 4.7, verification_level: 'verified', phone: '0944****78', joined_at: day(200), bio: 'Môi giới chuyên nghiệp đã xác thực. Tư vấn miễn phí.', intent_count: 12, match_count: 10, rating_avg: 4.8, rating_count: 7 },
  { id: 'u05', name: 'Lê Quốc Bảo', avatar_url: null, trust_score: 4.9, verification_level: 'verified', phone: '0955****90', joined_at: day(160), bio: 'Chủ nhiều căn hộ Vinhomes, Masteri. Giá hợp lý.', intent_count: 10, match_count: 9, rating_avg: 4.9, rating_count: 9 },
];

// Active users (15)
const ACTIVE: MockUserFull[] = [
  { id: 'u06', name: 'Nguyễn Minh Tú', avatar_url: null, trust_score: 4.2, verification_level: 'verified', phone: '0901****67', joined_at: day(90), bio: 'Đang tìm nhà cho gia đình Q7.', intent_count: 5, match_count: 3, rating_avg: 4.3, rating_count: 3 },
  { id: 'u07', name: 'Trần Anh Khoa', avatar_url: null, trust_score: 4.0, verification_level: 'verified', phone: '0918****23', joined_at: day(75), bio: 'Chuyên bán căn hộ Bình Thạnh.', intent_count: 6, match_count: 4, rating_avg: 4.2, rating_count: 4 },
  { id: 'u08', name: 'Lê Hồng Nhung', avatar_url: null, trust_score: 3.5, verification_level: 'kyc', phone: '0923****45', joined_at: day(60), bio: 'Cho thuê khu vực Thủ Đức.', intent_count: 4, match_count: 2, rating_avg: 3.8, rating_count: 2 },
  { id: 'u09', name: 'Vũ Ngọc Anh', avatar_url: null, trust_score: 3.8, verification_level: 'kyc', phone: '0934****67', joined_at: day(45), bio: 'Active buyer, đang tìm căn hộ 3PN.', intent_count: 4, match_count: 3, rating_avg: 4.0, rating_count: 2 },
  { id: 'u10', name: 'Hoàng Thanh Hà', avatar_url: null, trust_score: 4.0, verification_level: 'verified', phone: '0945****89', joined_at: day(100), bio: 'Chủ trọ Bình Thạnh, phòng sạch giá rẻ.', intent_count: 5, match_count: 3, rating_avg: 4.1, rating_count: 3 },
  { id: 'u11', name: 'Đỗ Văn Hải', avatar_url: null, trust_score: 3.2, verification_level: 'kyc', phone: '0956****01', joined_at: day(55), bio: 'Tìm nhà phố Gò Vấp cho gia đình.', intent_count: 3, match_count: 2, rating_avg: 3.5, rating_count: 1 },
  { id: 'u12', name: 'Phan Thị Mai', avatar_url: null, trust_score: 3.6, verification_level: 'kyc', phone: '0967****23', joined_at: day(40), bio: 'Giáo viên, tìm nhà gần trường.', intent_count: 3, match_count: 1, rating_avg: 4.0, rating_count: 1 },
  { id: 'u13', name: 'Hồ Quang Minh', avatar_url: null, trust_score: 3.4, verification_level: 'kyc', phone: '0978****45', joined_at: day(35), bio: 'Startup founder, tìm office Q1.', intent_count: 3, match_count: 2, rating_avg: 3.8, rating_count: 1 },
  { id: 'u14', name: 'Võ Thị Hương', avatar_url: null, trust_score: 3.7, verification_level: 'kyc', phone: '0989****67', joined_at: day(50), bio: 'Kinh doanh café, tìm mặt bằng.', intent_count: 4, match_count: 2, rating_avg: 4.2, rating_count: 2 },
  { id: 'u15', name: 'Dương Thanh Sơn', avatar_url: null, trust_score: 3.9, verification_level: 'verified', phone: '0990****89', joined_at: day(80), bio: 'Đầu tư đất nền vùng ven HCM.', intent_count: 5, match_count: 3, rating_avg: 4.0, rating_count: 2 },
  { id: 'u16', name: 'Nguyễn Thu Thủy', avatar_url: null, trust_score: 3.3, verification_level: 'kyc', phone: '0901****11', joined_at: day(30), bio: 'Mới chuyển HCM, tìm thuê căn hộ.', intent_count: 3, match_count: 1, rating_avg: 0, rating_count: 0 },
  { id: 'u17', name: 'Trịnh Đình Phúc', avatar_url: null, trust_score: 3.1, verification_level: 'kyc', phone: '0912****33', joined_at: day(25), bio: 'IT engineer, tìm studio gần công ty.', intent_count: 3, match_count: 1, rating_avg: 0, rating_count: 0 },
  { id: 'u18', name: 'Lý Thị Ngọc', avatar_url: null, trust_score: 3.5, verification_level: 'kyc', phone: '0923****55', joined_at: day(65), bio: 'Bán nhà Tân Bình chuyển Thủ Đức.', intent_count: 4, match_count: 2, rating_avg: 3.5, rating_count: 1 },
  { id: 'u19', name: 'Bùi Đức Trung', avatar_url: null, trust_score: 3.8, verification_level: 'verified', phone: '0934****77', joined_at: day(70), bio: 'Chủ nhà phố Q3, bán để đầu tư.', intent_count: 3, match_count: 2, rating_avg: 4.5, rating_count: 2 },
  { id: 'u20', name: 'Mai Văn Tài', avatar_url: null, trust_score: 3.0, verification_level: 'kyc', phone: '0945****99', joined_at: day(20), bio: 'Tìm kho xưởng Q12 cho sản xuất.', intent_count: 3, match_count: 1, rating_avg: 0, rating_count: 0 },
];

// Regular users (20)
const REGULAR: MockUserFull[] = Array.from({ length: 20 }, (_, i) => {
  const names = [
    'Nguyễn Văn Tâm', 'Trần Thị Linh', 'Lê Hoàng Phong', 'Phạm Minh Châu', 'Hoàng Thị Yến',
    'Vũ Đình Khôi', 'Đặng Thị Hoa', 'Bùi Văn Long', 'Đỗ Thị Trang', 'Phan Quốc Việt',
    'Hồ Thị Nga', 'Võ Văn Bình', 'Dương Thị Huệ', 'Ngô Thanh Tùng', 'Đinh Thị Phượng',
    'Lưu Văn Dũng', 'Tô Thị Kim', 'Cao Minh Hiếu', 'Châu Thị Loan', 'Trương Văn Hòa',
  ];
  const bios = [
    'Tìm nhà lần đầu.', 'Mới kết hôn, tìm tổ ấm.', 'Đang thuê, muốn mua riêng.',
    'Bán nhà cũ tìm nhà mới.', 'Chuyển công tác vào HCM.', 'Tìm nơi ở cho bố mẹ.',
    'Muốn đổi căn lớn hơn.', 'Đầu tư nhỏ lẻ.', 'Sinh viên mới ra trường.',
    'Cần phòng trọ giá rẻ.', 'Tìm mặt bằng mở shop.', 'Muốn mua đất ven đô.',
    'Freelancer tìm studio.', 'Gia đình 3 thế hệ.', 'Cần thuê gấp.',
    'Bán căn hộ để chuyển nước ngoài.', 'Tìm nhà gần bệnh viện.', 'Tìm đất làm vườn.',
    'Mới chuyển từ Hà Nội.', 'Tìm nhà cho thuê lại.',
  ];
  return {
    id: `u${21 + i}`,
    name: names[i],
    avatar_url: null,
    trust_score: 1.5 + 0.6394 * 1.5,
    verification_level: (0.025 > 0.5 ? 'kyc' : 'none') as 'kyc' | 'none',
    phone: `09${Math.floor(10 + 0.275 * 89)}****${Math.floor(10 + 0.2232 * 89)}`,
    joined_at: day(Math.floor(10 + 0.7365 * 50)),
    bio: bios[i],
    intent_count: Math.floor(1 + 0.6767 * 2),
    match_count: 0.8922 > 0.5 ? 1 : 0,
    rating_avg: 0,
    rating_count: 0,
  };
});

// New users (10)
const NEW: MockUserFull[] = Array.from({ length: 10 }, (_, i) => {
  const names = [
    'Bùi Quốc Huy', 'Phạm Thảo Vy', 'Nguyễn Khánh Linh', 'Trần Đức Anh', 'Lê Thị Bích',
    'Hoàng Minh Quân', 'Vũ Thị Hằng', 'Đỗ Văn Sỹ', 'Phan Thùy Dung', 'Hồ Đăng Khoa',
  ];
  return {
    id: `u${41 + i}`,
    name: names[i],
    avatar_url: null,
    trust_score: 1.0,
    verification_level: 'none' as const,
    phone: `09${Math.floor(10 + 0.0869 * 89)}****${Math.floor(10 + 0.4219 * 89)}`,
    joined_at: day(Math.floor(1 + 0.0298 * 7)),
    bio: ['Người mới, đang tìm hiểu.', 'Sinh viên tìm trọ.', 'Mới tham gia.', 'Tìm nhà lần đầu.', 'Đang khảo sát thị trường.', 'Mới chuyển đến HCM.', 'Sinh viên năm cuối.', 'Vừa đi làm.', 'Tìm nơi ở mới.', 'Khám phá CẦN & CÓ.'][i],
    intent_count: 1,
    match_count: 0,
    rating_avg: 0,
    rating_count: 0,
  };
});

export const ALL_USERS: MockUserFull[] = [...POWER, ...ACTIVE, ...REGULAR, ...NEW];

export function getUser(id: string): MockUserFull | undefined {
  return ALL_USERS.find((u) => u.id === id);
}

export function getTopUsers(count = 20): MockUserFull[] {
  return [...ALL_USERS].sort((a, b) => b.trust_score - a.trust_score).slice(0, count);
}
