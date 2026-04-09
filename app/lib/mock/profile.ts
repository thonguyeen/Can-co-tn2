// ═══════════════════════════════════════════════════════
// CẦN & CÓ — Mock Profile Data
// ═══════════════════════════════════════════════════════

import { GENERATED_INTENTS } from './intent-generator';

export const MOCK_PROFILE = {
  id: 'u1',
  name: 'Nguyễn Minh Tú',
  phone: '0901****67',
  avatar_url: null,
  trust_score: 4.2,
  verification_level: 'verified' as const,
  verifications: { cccd: true, sodo: true, gps: true },
  joined_at: '2026-01-15T00:00:00Z',
  stats: {
    intents_posted: 12,
    matches: 8,
    chats: 23,
    verified: 3,
  },
};

export const MOCK_RATINGS = [
  {
    id: 'r1',
    from_user: { id: 'u2', name: 'Anh Khoa' },
    stars: 5,
    comment: 'Chủ nhà rất nhiệt tình, nhà đúng mô tả. Giao dịch nhanh chóng!',
    intent_title: 'Bán Vinhomes Central Park 2PN',
    created_at: '2026-03-15T10:00:00Z',
  },
  {
    id: 'r2',
    from_user: { id: 'u5', name: 'Ngọc Anh' },
    stars: 4,
    comment: 'Phản hồi nhanh, thông tin chính xác. Recommend!',
    intent_title: 'Cho thuê Masteri Thảo Điền',
    created_at: '2026-03-10T14:30:00Z',
  },
  {
    id: 'r3',
    from_user: { id: 'u7', name: 'Thanh Tùng' },
    stars: 5,
    comment: 'Người bán đáng tin cậy, đã xác thực đầy đủ.',
    intent_title: 'Bán nhà phố Gò Vấp',
    created_at: '2026-02-28T09:00:00Z',
  },
  {
    id: 'r4',
    from_user: { id: 'u8', name: 'Đức Minh' },
    stars: 4,
    comment: 'Hỗ trợ tốt trong quá trình tìm hiểu.',
    intent_title: 'Tìm căn hộ 2PN Q7',
    created_at: '2026-02-20T16:00:00Z',
  },
  { id: 'r5', from_user: { id: 'u11', name: 'Đỗ Văn Hải' }, stars: 5, comment: 'Giao dịch suôn sẻ, anh rất tận tâm. Nhà đẹp hơn ảnh.', intent_title: 'Bán Sunrise City Q7', created_at: '2026-03-18T10:00:00Z' },
  { id: 'r6', from_user: { id: 'u12', name: 'Phan Thị Mai' }, stars: 5, comment: 'Chị tư vấn rất kỹ, giúp mình hiểu pháp lý rõ ràng.', intent_title: 'Bán nhà phố Tân Bình', created_at: '2026-03-16T08:00:00Z' },
  { id: 'r7', from_user: { id: 'u13', name: 'Hồ Quang Minh' }, stars: 4, comment: 'Office đẹp, đúng mô tả. Chủ nhà thân thiện.', intent_title: 'Cho thuê văn phòng Q1', created_at: '2026-03-14T14:00:00Z' },
  { id: 'r8', from_user: { id: 'u09', name: 'Vũ Ngọc Anh' }, stars: 3, comment: 'Phản hồi hơi chậm nhưng deal OK. Nên cải thiện tốc độ.', intent_title: 'Tìm căn hộ 3PN Thủ Đức', created_at: '2026-03-12T11:00:00Z' },
  { id: 'r9', from_user: { id: 'u14', name: 'Võ Thị Hương' }, stars: 5, comment: 'Mặt bằng rộng, vị trí đắc địa. Chủ rất chuyên nghiệp.', intent_title: 'Cho thuê mặt bằng Q3', created_at: '2026-03-10T09:00:00Z' },
  { id: 'r10', from_user: { id: 'u15', name: 'Dương Thanh Sơn' }, stars: 4, comment: 'Đất đẹp, pháp lý rõ. Giá hợp lý so với thị trường.', intent_title: 'Bán đất Bình Chánh', created_at: '2026-03-08T15:00:00Z' },
  { id: 'r11', from_user: { id: 'u16', name: 'Nguyễn Thu Thủy' }, stars: 5, comment: 'Lần đầu thuê nhà trên CẦN & CÓ, rất hài lòng!', intent_title: 'Cho thuê Masteri Thảo Điền', created_at: '2026-03-06T10:00:00Z' },
  { id: 'r12', from_user: { id: 'u17', name: 'Trịnh Đình Phúc' }, stars: 4, comment: 'Studio đúng như mô tả, wifi mạnh. Sẽ giới thiệu bạn bè.', intent_title: 'Cho thuê studio Bình Thạnh', created_at: '2026-03-04T13:00:00Z' },
  { id: 'r13', from_user: { id: 'u18', name: 'Lý Thị Ngọc' }, stars: 5, comment: 'Bán nhà nhanh, đúng giá cam kết. Rất hài lòng với dịch vụ.', intent_title: 'Bán nhà phố Gò Vấp', created_at: '2026-03-02T08:00:00Z' },
  { id: 'r14', from_user: { id: 'u19', name: 'Bùi Đức Trung' }, stars: 2, comment: 'Giá thực tế cao hơn giá đăng 300tr. Hơi thất vọng.', intent_title: 'Bán căn hộ Q7', created_at: '2026-02-28T16:00:00Z' },
  { id: 'r15', from_user: { id: 'u20', name: 'Mai Văn Tài' }, stars: 4, comment: 'Kho rộng, đúng diện tích. Chủ linh hoạt thời gian xem.', intent_title: 'Cho thuê kho Q12', created_at: '2026-02-25T11:00:00Z' },
  { id: 'r16', from_user: { id: 'u06', name: 'Nguyễn Minh Tú' }, stars: 5, comment: 'Anh Đức là người bán uy tín nhất mình từng giao dịch.', intent_title: 'Bán Sunrise City Q7', created_at: '2026-02-22T09:00:00Z' },
  { id: 'r17', from_user: { id: 'u07', name: 'Trần Anh Khoa' }, stars: 5, comment: 'Deal chốt nhanh gọn, chuyên nghiệp. 10/10 recommend.', intent_title: 'Bán Vinhomes Central Park', created_at: '2026-02-18T14:00:00Z' },
  { id: 'r18', from_user: { id: 'u10', name: 'Hoàng Thanh Hà' }, stars: 3, comment: 'Phòng OK nhưng hơi ồn buổi tối. Nên nói trước.', intent_title: 'Cho thuê phòng trọ Bình Thạnh', created_at: '2026-02-15T10:00:00Z' },
  { id: 'r19', from_user: { id: 'u08', name: 'Lê Hồng Nhung' }, stars: 4, comment: 'Nhà đẹp, chủ thân thiện. Hợp đồng rõ ràng.', intent_title: 'Cho thuê nhà Gò Vấp', created_at: '2026-02-10T08:00:00Z' },
  { id: 'r20', from_user: { id: 'u41', name: 'Bùi Quốc Huy' }, stars: 1, comment: 'Tin đăng sai thực tế, giá khác xa. Không recommend.', intent_title: 'Bán căn hộ Q12',
    created_at: '2026-02-20T16:00:00Z',
  },
];

export interface Achievement {
  id: string;
  icon: string;
  name: string;
  description: string;
  earned: boolean;
  earned_at?: string;
  hint?: string;
}

export const MOCK_ACHIEVEMENTS: Achievement[] = [
  { id: 'a1', icon: '🌱', name: 'Người mới', description: 'Đăng intent đầu tiên', earned: true, earned_at: '2026-01-16T00:00:00Z' },
  { id: 'a2', icon: '✅', name: 'Xác thực viên', description: 'Hoàn thành 3/3 verification', earned: true, earned_at: '2026-02-01T00:00:00Z' },
  { id: 'a3', icon: '🤝', name: 'Kết nối vàng', description: '5 matches dẫn đến chat', earned: true, earned_at: '2026-02-15T00:00:00Z' },
  { id: 'a4', icon: '💬', name: 'Giao tiếp tích cực', description: '20 tin nhắn đã gửi', earned: true, earned_at: '2026-03-01T00:00:00Z' },
  { id: 'a5', icon: '🏠', name: 'Chuyên gia khu vực', description: '10 intents cùng quận', earned: true, earned_at: '2026-03-10T00:00:00Z' },
  { id: 'a6', icon: '⭐', name: 'Được tin tưởng', description: 'Nhận 5 đánh giá ≥4 sao', earned: false, hint: 'Còn 1 đánh giá nữa' },
  { id: 'a7', icon: '🔥', name: 'Hot poster', description: '1 intent đạt 50+ views', earned: false, hint: 'Cao nhất hiện tại: 45 views' },
  { id: 'a8', icon: '📌', name: 'Được yêu thích', description: '10 người save intent của bạn', earned: false, hint: 'Hiện có 6/10' },
];

export const USER_CAN_INTENTS = GENERATED_INTENTS.filter((i) => i.type === 'CAN').slice(0, 3);
export const USER_CO_INTENTS = GENERATED_INTENTS.filter((i) => i.type === 'CO').slice(0, 3);
