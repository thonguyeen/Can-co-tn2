// ═══════════════════════════════════════════════════════
// CẦN & CÓ — Programmatic Intent Generator (80 intents)
// ═══════════════════════════════════════════════════════

import type { MockIntent, MockUser, MockComment } from './intents';
import { ALL_USERS } from './users';

const BASE = new Date('2026-03-22T08:00:00Z').getTime();
const h = (hours: number) => new Date(BASE - hours * 60 * 60 * 1000).toISOString();

// Seeded PRNG to avoid SSR/client hydration mismatch
let _seed = 42;
function seededRandom(): number {
  _seed = (_seed * 16807 + 0) % 2147483647;
  return (_seed - 1) / 2147483646;
}
function pick<T>(arr: T[]): T { return arr[Math.floor(seededRandom() * arr.length)]; }
function randInt(min: number, max: number) { return Math.floor(min + seededRandom() * (max - min + 1)); }

const DISTRICTS = ['Quận 1', 'Quận 3', 'Quận 7', 'Bình Thạnh', 'Gò Vấp', 'Thủ Đức', 'Phú Nhuận', 'Tân Bình', 'Tân Phú', 'Quận 12', 'Nhà Bè', 'Bình Chánh'];
const PROJECTS = ['Vinhomes Central Park', 'Masteri Thảo Điền', 'Sunrise City', 'Saigon Pearl', 'The Sun Avenue', 'Gateway Thảo Điền', 'Estella Heights', 'Landmark 81', 'Phú Mỹ Hưng', 'Diamond Island', 'Hado Centrosa', 'RichStar', 'The Marq', 'Empire City'];

const BOT_NAMES = ['match_advisor', 'nha_advisor', 'market_analyst', 'trust_checker', 'connector', 'concierge'];

// ═══════════════════════════════════════════════════════
// CẦN Templates (30)
// ═══════════════════════════════════════════════════════

interface IntentTemplate {
  title: string;
  raw_text: string;
  district: string | null;
  price_min: number | null;
  price_max: number | null;
  price: number | null;
  subcategory: string;
  parsed_data: Record<string, unknown>;
}

const CAN_TEMPLATES: IntentTemplate[] = [
  // Apartments (15)
  { title: 'Tìm căn hộ 2PN Q7 gần trường quốc tế', raw_text: 'Tìm mua căn hộ 2PN Quận 7, gần trường quốc tế cho con học. Budget 3-4 tỷ. Ưu tiên tầng cao, ban công hướng ĐN.', district: 'Quận 7', price_min: 3e9, price_max: 4e9, price: null, subcategory: 'apartment', parsed_data: { district: 'Quận 7', bedrooms: 2, keywords: ['gần trường quốc tế', 'tầng cao'] } },
  { title: 'Thuê studio Thủ Đức gần ĐHQG', raw_text: 'Cần thuê studio hoặc 1PN khu Thủ Đức, gần ĐH Quốc Gia. Budget 5-8 triệu/tháng. Dọn vào ngay, ưu tiên nội thất đầy đủ.', district: 'Thủ Đức', price_min: 5e6, price_max: 8e6, price: null, subcategory: 'apartment', parsed_data: { district: 'Thủ Đức', bedrooms: 1, keywords: ['gần ĐHQG', 'nội thất'] } },
  { title: 'Tìm căn hộ 3PN Thủ Đức cho gia đình', raw_text: 'Tìm mua căn hộ 3PN Quận 2 (Thủ Đức) cho gia đình 5 người. Gần trường Việt Úc, có hồ bơi và sân chơi trẻ em. Budget 5-8 tỷ.', district: 'Thủ Đức', price_min: 5e9, price_max: 8e9, price: null, subcategory: 'apartment', parsed_data: { district: 'Thủ Đức', bedrooms: 3, keywords: ['gần trường Việt Úc', 'hồ bơi'] } },
  { title: 'Thuê 1PN Bình Thạnh gần Hàng Xanh', raw_text: 'Cần thuê 1PN Bình Thạnh gần ngã tư Hàng Xanh, 6-10 triệu/tháng, có nội thất cơ bản. Ưu tiên gần metro.', district: 'Bình Thạnh', price_min: 6e6, price_max: 10e6, price: null, subcategory: 'apartment', parsed_data: { district: 'Bình Thạnh', bedrooms: 1, keywords: ['gần Hàng Xanh', 'gần metro'] } },
  { title: 'Mua căn hộ Vinhomes Q9 tầng thấp', raw_text: 'Tìm mua căn hộ Vinhomes Q9, 2PN, tầng thấp cho người già. Budget 2.5-3.5 tỷ. Cần gần thang máy, an ninh tốt.', district: 'Thủ Đức', price_min: 2.5e9, price_max: 3.5e9, price: null, subcategory: 'apartment', parsed_data: { district: 'Thủ Đức', bedrooms: 2, keywords: ['tầng thấp', 'cho người già'] } },
  { title: 'Thuê căn hộ 2PN Phú Nhuận', raw_text: 'Cần thuê căn hộ 2PN Phú Nhuận hoặc Q3, nội thất đầy đủ, 12-18 triệu/tháng. Ưu tiên view đẹp, có gym.', district: 'Phú Nhuận', price_min: 12e6, price_max: 18e6, price: null, subcategory: 'apartment', parsed_data: { district: 'Phú Nhuận', bedrooms: 2, keywords: ['nội thất đầy đủ', 'gym'] } },
  { title: 'Mua penthouse Q1 cao cấp', raw_text: 'Tìm mua penthouse Q1, 150-200m², view panorama. Budget 15-25 tỷ. Cần đỗ xe 2 ô tô, hồ bơi riêng.', district: 'Quận 1', price_min: 15e9, price_max: 25e9, price: null, subcategory: 'apartment', parsed_data: { district: 'Quận 1', area: 175, keywords: ['penthouse', 'view panorama'] } },
  { title: 'Thuê officetel Tân Bình', raw_text: 'Cần thuê officetel 30-50m² Tân Bình gần sân bay, 5-8 triệu/tháng. Dùng làm văn phòng nhỏ 2-3 người.', district: 'Tân Bình', price_min: 5e6, price_max: 8e6, price: null, subcategory: 'apartment', parsed_data: { district: 'Tân Bình', area: 40, keywords: ['officetel', 'gần sân bay'] } },
  { title: 'Mua duplex Q7 Phú Mỹ Hưng', raw_text: 'Tìm duplex hoặc căn hộ thông tầng khu Phú Mỹ Hưng Q7, 120-180m², 8-12 tỷ. Cho gia đình 3 thế hệ.', district: 'Quận 7', price_min: 8e9, price_max: 12e9, price: null, subcategory: 'apartment', parsed_data: { district: 'Quận 7', area: 150, keywords: ['duplex', 'Phú Mỹ Hưng'] } },
  { title: 'Thuê ngắn hạn 3 tháng Q1', raw_text: 'Cần thuê căn hộ 1PN Q1 trong 3 tháng (tháng 4-6/2026). Budget 15-20 triệu. Đi công tác, cần đầy đủ nội thất.', district: 'Quận 1', price_min: 15e6, price_max: 20e6, price: null, subcategory: 'apartment', parsed_data: { district: 'Quận 1', bedrooms: 1, keywords: ['ngắn hạn 3 tháng', 'công tác'] } },
  { title: 'Mua căn hộ 2PN Bình Thạnh', raw_text: 'Tìm căn hộ 2PN Bình Thạnh, gần Vinhomes hoặc Saigon Pearl. Budget 3-5 tỷ. Ưu tiên view sông, ban công rộng.', district: 'Bình Thạnh', price_min: 3e9, price_max: 5e9, price: null, subcategory: 'apartment', parsed_data: { district: 'Bình Thạnh', bedrooms: 2, keywords: ['view sông', 'ban công rộng'] } },
  { title: 'Thuê phòng trọ gần ĐH Bách Khoa', raw_text: 'Sinh viên cần thuê phòng trọ sạch sẽ gần ĐH Bách Khoa, dưới 3 triệu/tháng, có wifi và chỗ để xe.', district: 'Bình Thạnh', price_min: null, price_max: 3e6, price: null, subcategory: 'room', parsed_data: { district: 'Bình Thạnh', keywords: ['gần ĐH Bách Khoa', 'wifi'] } },
  { title: 'Mua căn hộ Q12 giá rẻ', raw_text: 'Tìm căn hộ 2PN Q12 hoặc Tân Phú, giá 1.5-2.5 tỷ. Cần sổ hồng, gần chợ và trường học.', district: 'Quận 12', price_min: 1.5e9, price_max: 2.5e9, price: null, subcategory: 'apartment', parsed_data: { district: 'Quận 12', bedrooms: 2, keywords: ['giá rẻ', 'gần chợ'] } },
  { title: 'Thuê căn hộ 3PN Q7 cho gia đình', raw_text: 'Cần thuê 3PN Q7, nội thất cao cấp, khu an ninh, gần trường quốc tế. Budget 25-35 triệu/tháng.', district: 'Quận 7', price_min: 25e6, price_max: 35e6, price: null, subcategory: 'apartment', parsed_data: { district: 'Quận 7', bedrooms: 3, keywords: ['cao cấp', 'khu an ninh'] } },
  { title: 'Mua căn hộ 1PN Tân Phú đầu tư', raw_text: 'Tìm mua căn hộ 1PN Tân Phú, 1-1.8 tỷ, cho thuê lại. Ưu tiên gần trạm metro, nhiều tiện ích.', district: 'Tân Phú', price_min: 1e9, price_max: 1.8e9, price: null, subcategory: 'apartment', parsed_data: { district: 'Tân Phú', bedrooms: 1, keywords: ['đầu tư', 'gần metro'] } },

  // Houses (8)
  { title: 'Tìm nhà phố Gò Vấp hẻm xe hơi', raw_text: 'Tìm mua nhà phố Gò Vấp, hẻm xe hơi, 3 tầng trở lên, 3PN+. Budget 5-7 tỷ. Cần sổ hồng riêng.', district: 'Gò Vấp', price_min: 5e9, price_max: 7e9, price: null, subcategory: 'house', parsed_data: { district: 'Gò Vấp', bedrooms: 3, keywords: ['hẻm xe hơi', 'sổ hồng riêng'] } },
  { title: 'Mua nhà mặt tiền Q3 kinh doanh', raw_text: 'Cần mua nhà mặt tiền đường lớn Q3, 4x20m trở lên. Budget 15-25 tỷ. Kinh doanh hoặc cho thuê.', district: 'Quận 3', price_min: 15e9, price_max: 25e9, price: null, subcategory: 'house', parsed_data: { district: 'Quận 3', keywords: ['mặt tiền', 'kinh doanh'] } },
  { title: 'Tìm nhà cấp 4 Bình Chánh', raw_text: 'Tìm nhà cấp 4 có sân vườn Bình Chánh hoặc Hóc Môn, 200-500m². Budget 2-3 tỷ. Cho bố mẹ về hưu.', district: 'Bình Chánh', price_min: 2e9, price_max: 3e9, price: null, subcategory: 'house', parsed_data: { district: 'Bình Chánh', keywords: ['nhà cấp 4', 'sân vườn'] } },
  { title: 'Thuê nhà nguyên căn Q1 văn phòng', raw_text: 'Cần thuê nhà nguyên căn Q1 4 tầng, 4x15m, làm văn phòng công ty. Budget 30-50 triệu/tháng.', district: 'Quận 1', price_min: 30e6, price_max: 50e6, price: null, subcategory: 'house', parsed_data: { district: 'Quận 1', keywords: ['nguyên căn', 'văn phòng'] } },
  { title: 'Mua nhà phố Bình Thạnh', raw_text: 'Tìm nhà phố Bình Thạnh, hẻm ô tô, 2-3 tầng, 4-6 tỷ. Gần chợ Bà Chiểu, trường học.', district: 'Bình Thạnh', price_min: 4e9, price_max: 6e9, price: null, subcategory: 'house', parsed_data: { district: 'Bình Thạnh', keywords: ['hẻm ô tô', 'gần chợ Bà Chiểu'] } },
  { title: 'Thuê nhà Thủ Đức gần Suối Tiên', raw_text: 'Cần thuê nhà trọ hoặc nhà nguyên căn gần khu Suối Tiên Thủ Đức, 5-10 triệu/tháng. Có chỗ đậu xe.', district: 'Thủ Đức', price_min: 5e6, price_max: 10e6, price: null, subcategory: 'house', parsed_data: { district: 'Thủ Đức', keywords: ['gần Suối Tiên', 'đậu xe'] } },
  { title: 'Mua nhà phố Tân Bình', raw_text: 'Tìm nhà phố Tân Bình, diện tích 4x12m+, 2-3 tầng, hẻm 5m. Budget 4.5-6.5 tỷ. SHR pháp lý rõ ràng.', district: 'Tân Bình', price_min: 4.5e9, price_max: 6.5e9, price: null, subcategory: 'house', parsed_data: { district: 'Tân Bình', keywords: ['4x12m', 'hẻm 5m', 'SHR'] } },
  { title: 'Thuê biệt thự Q2 cho expat', raw_text: 'Cần thuê biệt thự khu Thảo Điền Q2, 3-4PN, có sân vườn, hồ bơi. Budget 40-70 triệu/tháng. Cho gia đình expat.', district: 'Thủ Đức', price_min: 40e6, price_max: 70e6, price: null, subcategory: 'house', parsed_data: { district: 'Thủ Đức', bedrooms: 4, keywords: ['biệt thự', 'Thảo Điền', 'expat'] } },

  // Commercial (4)
  { title: 'Thuê mặt bằng café Q3/Phú Nhuận', raw_text: 'Cần thuê mặt bằng kinh doanh quán cà phê Quận 3 hoặc Phú Nhuận, 50-100m², mặt tiền. Budget 30-50 triệu/tháng.', district: 'Quận 3', price_min: 30e6, price_max: 50e6, price: null, subcategory: 'commercial', parsed_data: { district: 'Quận 3', area: 75, keywords: ['quán cà phê', 'mặt tiền'] } },
  { title: 'Thuê kho xưởng Q12/Hóc Môn', raw_text: 'Cần thuê kho xưởng 200-500m² khu vực Q12 hoặc Hóc Môn. Budget 20-40 triệu/tháng. Có bãi xe container.', district: 'Quận 12', price_min: 20e6, price_max: 40e6, price: null, subcategory: 'commercial', parsed_data: { district: 'Quận 12', area: 350, keywords: ['kho xưởng', 'bãi xe container'] } },
  { title: 'Tìm office Q1 cho startup', raw_text: 'Tìm office 100-200m² Q1 cho startup 20 người. Budget 50-80 triệu/tháng. Cần có phòng họp, pantry.', district: 'Quận 1', price_min: 50e6, price_max: 80e6, price: null, subcategory: 'commercial', parsed_data: { district: 'Quận 1', area: 150, keywords: ['startup', 'phòng họp'] } },
  { title: 'Mặt bằng nhà hàng Q7 Phú Mỹ Hưng', raw_text: 'Cần mặt bằng nhà hàng khu Phú Mỹ Hưng Q7, 100-150m², mặt tiền đường lớn. Budget 50-80 triệu/tháng.', district: 'Quận 7', price_min: 50e6, price_max: 80e6, price: null, subcategory: 'commercial', parsed_data: { district: 'Quận 7', area: 125, keywords: ['nhà hàng', 'Phú Mỹ Hưng'] } },

  // Land (3)
  { title: 'Đất nền Long An gần HCM', raw_text: 'Tìm đất nền Long An gần HCM, 100-200m², dưới 2 tỷ. Pháp lý sạch, thổ cư, đường ô tô.', district: null, price_min: null, price_max: 2e9, price: null, subcategory: 'land', parsed_data: { keywords: ['đất nền Long An', 'thổ cư', 'đường ô tô'] } },
  { title: 'Đất mặt tiền Nhơn Trạch đầu tư', raw_text: 'Cần mua đất mặt tiền Nhơn Trạch Đồng Nai, 500m²+ cho đầu tư. Budget 5-10 tỷ.', district: null, price_min: 5e9, price_max: 10e9, price: null, subcategory: 'land', parsed_data: { keywords: ['Nhơn Trạch', 'mặt tiền', 'đầu tư'] } },
  { title: 'Đất vườn Củ Chi làm farmstay', raw_text: 'Tìm đất vườn Củ Chi 1000m²+ có cây ăn quả, đường ô tô. Làm farmstay cuối tuần. Budget 1-3 tỷ.', district: null, price_min: 1e9, price_max: 3e9, price: null, subcategory: 'land', parsed_data: { keywords: ['Củ Chi', 'farmstay', 'cây ăn quả'] } },
];

const CO_USER_TEMPLATES: IntentTemplate[] = [
  { title: 'Bán Vinhomes Central Park 2PN view sông', raw_text: 'Bán căn hộ Vinhomes Central Park, 2PN 75m², tầng 18 view sông Sài Gòn. Full nội thất cao cấp. Sổ hồng chính chủ. Giá 3.5 tỷ TL.', district: 'Bình Thạnh', price_min: null, price_max: null, price: 3.5e9, subcategory: 'apartment', parsed_data: { district: 'Bình Thạnh', bedrooms: 2, area: 75, floor: 18, project_name: 'Vinhomes Central Park' } },
  { title: 'Bán nhà phố Gò Vấp hẻm 6m', raw_text: 'Bán gấp nhà phố Gò Vấp, hẻm 6m Nguyễn Oanh, 4x15m, 3 tầng, 3PN 3WC. SHR, khu yên tĩnh. Giá 6.2 tỷ.', district: 'Gò Vấp', price_min: null, price_max: null, price: 6.2e9, subcategory: 'house', parsed_data: { district: 'Gò Vấp', bedrooms: 3, area: 60 } },
  { title: 'Cho thuê Masteri Thảo Điền 2PN', raw_text: 'Cho thuê căn hộ Masteri Thảo Điền, 2PN 70m², nội thất cơ bản, tầng 12, view TP. Giá 15 triệu/tháng. Sẵn ở ngay.', district: 'Thủ Đức', price_min: null, price_max: null, price: 15e6, subcategory: 'apartment', parsed_data: { district: 'Thủ Đức', bedrooms: 2, area: 70, project_name: 'Masteri Thảo Điền' } },
  { title: 'Bán Sunrise City Q7 3PN view sông', raw_text: 'Bán căn hộ Sunrise City Q7, 3PN 100m², full nội thất nhập khẩu. Tầng 25, 2 view sông + công viên. Đã GPS verify. Giá 6.5 tỷ.', district: 'Quận 7', price_min: null, price_max: null, price: 6.5e9, subcategory: 'apartment', parsed_data: { district: 'Quận 7', bedrooms: 3, area: 100, project_name: 'Sunrise City' } },
  { title: 'Cho thuê mặt bằng Q3', raw_text: 'Cho thuê mặt bằng Q3, Nguyễn Đình Chiểu, 80m², mặt tiền 6m. Phù hợp café, showroom. Giá 45 triệu/tháng.', district: 'Quận 3', price_min: null, price_max: null, price: 45e6, subcategory: 'commercial', parsed_data: { district: 'Quận 3', area: 80 } },
  { title: 'Cho thuê phòng trọ Bình Thạnh', raw_text: 'Cho thuê phòng trọ Bình Thạnh gần ĐH Hutech, 20m² gác lửng, wifi free, giờ giấc tự do. Giá 2.5 triệu/tháng.', district: 'Bình Thạnh', price_min: null, price_max: null, price: 2.5e6, subcategory: 'room', parsed_data: { district: 'Bình Thạnh', area: 20 } },
  { title: 'Bán Saigon Pearl 3PN 135m²', raw_text: 'Bán căn hộ Saigon Pearl 3PN 135m², tầng 20, view Bitexco. Nội thất Châu Âu. Chính chủ, xác thực đầy đủ. Giá 8.5 tỷ.', district: 'Bình Thạnh', price_min: null, price_max: null, price: 8.5e9, subcategory: 'apartment', parsed_data: { district: 'Bình Thạnh', bedrooms: 3, area: 135, project_name: 'Saigon Pearl' } },
  { title: 'Bán nhà phố Tân Bình 4x12m', raw_text: 'Bán nhà phố Tân Bình, hẻm 5m, 4x12m, 1 trệt 2 lầu, 3PN 2WC. SHR, khu an ninh. Giá 5.5 tỷ thương lượng.', district: 'Tân Bình', price_min: null, price_max: null, price: 5.5e9, subcategory: 'house', parsed_data: { district: 'Tân Bình', bedrooms: 3, area: 48 } },
  { title: 'Cho thuê căn hộ 1PN Q1 full NT', raw_text: 'Cho thuê căn hộ Q1, Nguyễn Trãi, 1PN 45m², full nội thất, an ninh 24/7. Giá 12 triệu/tháng. Sẵn ở 1/4.', district: 'Quận 1', price_min: null, price_max: null, price: 12e6, subcategory: 'apartment', parsed_data: { district: 'Quận 1', bedrooms: 1, area: 45 } },
  { title: 'Bán đất Bình Chánh 100m² SHR', raw_text: 'Bán đất nền Bình Chánh, mặt tiền đường lớn, 100m², thổ cư 100%, SHR. Gần KCN, trường học. Giá 1.8 tỷ.', district: 'Bình Chánh', price_min: null, price_max: null, price: 1.8e9, subcategory: 'land', parsed_data: { district: 'Bình Chánh', area: 100 } },
  { title: 'Bán căn hộ Hado Centrosa Q10 2PN', raw_text: 'Bán căn hộ Hado Centrosa Garden Q10, 2PN 80m², tầng 15. Nội thất bàn giao CĐT. Giá 4.2 tỷ bao phí.', district: 'Quận 3', price_min: null, price_max: null, price: 4.2e9, subcategory: 'apartment', parsed_data: { district: 'Quận 3', bedrooms: 2, area: 80, project_name: 'Hado Centrosa' } },
  { title: 'Cho thuê biệt thự Thảo Điền', raw_text: 'Cho thuê biệt thự Thảo Điền, 4PN, 300m² sân vườn, hồ bơi riêng. Nội thất đầy đủ. Giá 60 triệu/tháng.', district: 'Thủ Đức', price_min: null, price_max: null, price: 60e6, subcategory: 'house', parsed_data: { district: 'Thủ Đức', bedrooms: 4, area: 300 } },
  { title: 'Bán nhà mặt tiền Q3', raw_text: 'Bán nhà mặt tiền Võ Văn Tần Q3, 5x20m, 4 tầng. Đang cho thuê 80 triệu/tháng. Giá 22 tỷ. SHR rõ ràng.', district: 'Quận 3', price_min: null, price_max: null, price: 22e9, subcategory: 'house', parsed_data: { district: 'Quận 3', area: 100 } },
  { title: 'Cho thuê kho xưởng Q12', raw_text: 'Cho thuê kho xưởng 300m² Q12, đường container, có văn phòng 30m², WC. Giá 25 triệu/tháng.', district: 'Quận 12', price_min: null, price_max: null, price: 25e6, subcategory: 'commercial', parsed_data: { district: 'Quận 12', area: 300 } },
  { title: 'Bán căn hộ Empire City 2PN', raw_text: 'Bán căn hộ Empire City Thủ Thiêm, 2PN 90m², tầng 30, view sông 180°. Bàn giao hoàn thiện. Giá 7.8 tỷ.', district: 'Thủ Đức', price_min: null, price_max: null, price: 7.8e9, subcategory: 'apartment', parsed_data: { district: 'Thủ Đức', bedrooms: 2, area: 90, project_name: 'Empire City' } },
  { title: 'Cho thuê phòng trọ Q12 giá rẻ', raw_text: 'Cho thuê phòng trọ Q12, 18m², có ban công, WC riêng, wifi free. An ninh, giờ giấc tự do. Giá 1.8 triệu/tháng.', district: 'Quận 12', price_min: null, price_max: null, price: 1.8e6, subcategory: 'room', parsed_data: { district: 'Quận 12', area: 18 } },
  { title: 'Bán căn hộ RichStar Tân Phú', raw_text: 'Bán căn hộ RichStar Tân Phú, 2PN 65m², tầng 10, nội thất cơ bản. Gần Aeon Mall. Giá 2.1 tỷ. SHR.', district: 'Tân Phú', price_min: null, price_max: null, price: 2.1e9, subcategory: 'apartment', parsed_data: { district: 'Tân Phú', bedrooms: 2, area: 65, project_name: 'RichStar' } },
  { title: 'Cho thuê nhà nguyên căn Gò Vấp', raw_text: 'Cho thuê nhà nguyên căn Gò Vấp, 4x16m, 2 tầng, 3PN. Hẻm 4m, gần chợ. Giá 12 triệu/tháng.', district: 'Gò Vấp', price_min: null, price_max: null, price: 12e6, subcategory: 'house', parsed_data: { district: 'Gò Vấp', bedrooms: 3, area: 64 } },
  { title: 'Bán căn hộ Diamond Island 3PN', raw_text: 'Bán căn hộ Diamond Island Q2, 3PN 117m², tầng 22, view sông full. Nội thất Boffi Italia. Giá 9.2 tỷ.', district: 'Thủ Đức', price_min: null, price_max: null, price: 9.2e9, subcategory: 'apartment', parsed_data: { district: 'Thủ Đức', bedrooms: 3, area: 117, project_name: 'Diamond Island' } },
  { title: 'Cho thuê văn phòng Phú Nhuận', raw_text: 'Cho thuê văn phòng 120m² Phú Nhuận, Phan Đăng Lưu. Tầng 5, thang máy, parking. Giá 35 triệu/tháng.', district: 'Phú Nhuận', price_min: null, price_max: null, price: 35e6, subcategory: 'commercial', parsed_data: { district: 'Phú Nhuận', area: 120 } },
];

// ═══════════════════════════════════════════════════════

const HUMAN_COMMENTS = [
  'View hướng nào vậy anh?', 'Phí quản lý bao nhiêu/tháng?', 'Có cho xem nhà cuối tuần không ạ?',
  'Giá này có thương lượng không?', 'Đã có sổ hồng chưa ạ?', 'Tầng bao nhiêu vậy bạn?',
  'Nội thất mới hay cũ rồi ạ?', 'Gần trường học nào không?', 'Có slot đậu xe ô tô không?',
  'Bao giờ có thể vào ở?', 'Hẻm rộng mấy mét vậy anh?', 'Có gần siêu thị không?',
  'Hướng Đông Nam mát mẻ nha bạn, mình ở 3 năm recommend!', 'Cẩn thận mùa mưa ngập khu này nha bạn.',
  'Nên kiểm tra kỹ sổ hồng, khu này hay có tranh chấp.', 'Block A view đẹp hơn block B nha bạn.',
  'Giá đã giảm 200tr rồi bạn, chốt nhanh còn TL thêm.', 'Dạ hướng Đông Nam bạn, sáng mát chiều không nắng.',
  'Phí QL 15k/m²/tháng bạn nhé.', 'Cuối tuần OK ạ, bạn nhắn tin hẹn giờ.',
  'Khu này giao thông thuận lợi, gần đường lớn.', 'Đã có sổ hồng riêng, pháp lý rõ ràng ạ.',
  'Cho mình hỏi có thể đổi nội thất không?', 'Anh có thêm ảnh thực tế không ạ?',
  'Mình đang ở đây, yên tĩnh lắm, gần công viên.', 'Giá hợp lý so với khu vực, nên xem sớm.',
];

const BOT_COMMENT_TEMPLATES: Record<string, string[]> = {
  match_advisor: [
    'Tìm thấy {n} tin phù hợp nhu cầu. Bấm "Xem match" để xem chi tiết.',
    '{n} người đang tìm kiếm phù hợp với tin bạn. Đã gợi ý cho họ.',
    'Chưa tìm thấy match. Đang theo dõi — sẽ thông báo khi có.',
    'Match mới! {n} tin CÓ phù hợp budget và khu vực bạn.',
    '{n} người quan tâm tin này tuần qua.',
  ],
  nha_advisor: [
    'Giá trung bình {district} hiện khoảng {price_range}. Tin bạn đăng hợp thị trường.',
    '{district} đang phát triển mạnh nhờ metro. Giá tăng 10-15%/năm.',
    'Khu vực {district}: thanh khoản tốt, hẻm xe hơi là điểm cộng lớn.',
    'So sánh: {district} giá mềm hơn Q7/Bình Thạnh 15-20%, tiềm năng tăng.',
    'Budget bạn phù hợp tầm trung khu vực. Nhiều lựa chọn trong tầm giá.',
    '{district}: ưu tiên xem tầng 10-20 cho view và gió tốt nhất.',
    'Lưu ý: giá {district} dao động mạnh tùy block và view. Nên so sánh kỹ.',
  ],
  market_analyst: [
    '📊 {district}: {can} CẦN vs {co} CÓ — tỷ lệ cầu/cung {ratio}x',
    '📊 Thị trường {district} đang {trend}. Tín hiệu {signal}.',
    '📊 So với tuần trước: CẦN {district} {change}.',
    '📊 Giá TB 2PN {district}: {avg_price}. Budget bạn {assessment}.',
  ],
  trust_checker: [
    '✅ Tin đã xác thực đầy đủ (CCCD + Sổ đỏ + GPS). Yên tâm liên hệ.',
    '🛡️ Đã KYC. Xác thực thêm sổ đỏ và GPS để tăng tin cậy.',
    '🛡️ Tip: Xác thực danh tính để được ưu tiên matching →',
    '✅ Người đăng Trust {score}/5, {count} đánh giá tốt.',
    '⚠️ Giá thấp hơn thị trường — nên kiểm tra kỹ trước giao dịch.',
  ],
  connector: [
    '🤝 {n} người khác cũng quan tâm {district}. Kết nối trao đổi?',
    '🤝 Bạn và {name} cùng quan tâm {district}. Kết nối?',
    '🤝 {n} sinh viên cũng tìm trọ khu vực này. Kết nối?',
  ],
  concierge: [
    '🎯 Tin đầu tiên! Mẹo: mô tả chi tiết hơn → AI match chính xác hơn.',
    '🎯 Mẹo: thêm ảnh thật và xác thực → tin hấp dẫn hơn 👍',
    '🎯 Tin thứ {n} rồi! Mẹo: check phần match để xem gợi ý mới.',
  ],
};

function generateBotComment(botId: string, intent: IntentTemplate, matchCount: number): string {
  const templates = BOT_COMMENT_TEMPLATES[botId] || ['Đang theo dõi.'];
  let tpl = templates[Math.floor(seededRandom() * templates.length)];
  tpl = tpl.replace('{n}', String(matchCount || randInt(1, 5)));
  tpl = tpl.replace('{district}', intent.district || 'khu vực');
  tpl = tpl.replace('{price_range}', '3-5 tỷ');
  tpl = tpl.replace('{can}', String(randInt(3, 12)));
  tpl = tpl.replace('{co}', String(randInt(2, 6)));
  tpl = tpl.replace('{ratio}', (randInt(10, 40) / 10).toFixed(1));
  tpl = tpl.replace('{trend}', pick(['ổn định', 'tăng nhẹ', 'nóng', 'cân bằng']));
  tpl = tpl.replace('{signal}', pick(['tích cực', 'trung lập', 'người bán có lợi', 'nhiều lựa chọn']));
  tpl = tpl.replace('{change}', pick(['tăng 25%', 'giữ nguyên', 'tăng 15%', 'giảm nhẹ 5%']));
  tpl = tpl.replace('{avg_price}', pick(['3.2 tỷ', '3.8 tỷ', '2.5 tỷ', '5.0 tỷ']));
  tpl = tpl.replace('{assessment}', pick(['phù hợp', 'hợp lý', 'trong tầm', 'hơi thấp']));
  tpl = tpl.replace('{score}', String(randInt(35, 48) / 10));
  tpl = tpl.replace('{count}', String(randInt(3, 12)));
  tpl = tpl.replace('{name}', pick(['Minh Đức', 'Lan Anh', 'Hoàng Nam', 'Thanh Hằng']));
  return tpl;
}

function getUserForIntent(type: 'CAN' | 'CO', index: number): MockUser {
  const allUsers = ALL_USERS.map((u) => ({
    id: u.id, name: u.name, avatar_url: u.avatar_url, trust_score: u.trust_score, verification_level: u.verification_level,
  }));
  return allUsers[index % allUsers.length];
}

export function generateAllIntents(): MockIntent[] {
  const intents: MockIntent[] = [];
  let id = 1;

  // 30 CẦN
  for (let i = 0; i < CAN_TEMPLATES.length; i++) {
    const tpl = CAN_TEMPLATES[i];
    const user = getUserForIntent('CAN', i);
    const hoursAgo = i < 3 ? randInt(1, 6) : i < 10 ? randInt(12, 72) : i < 20 ? randInt(72, 168) : randInt(168, 720);
    const matchCount = i < 5 ? randInt(2, 5) : i < 15 ? randInt(0, 3) : 0;
    const viewCount = randInt(8, 200);
    const interestedCount = Math.floor(viewCount * (0.05 + seededRandom() * 0.15));

    const botComments: MockComment[] = [];
    // Match Advisor always
    botComments.push({ id: `bc-c${id}-1`, intent_id: `i-c${String(id).padStart(3, '0')}`, user_id: null, content: generateBotComment('match_advisor', tpl, matchCount), is_bot: true, bot_name: 'match_advisor', created_at: h(hoursAgo - 0.5) });
    // Nhà Advisor for real_estate (70% chance)
    if (tpl.district && seededRandom() > 0.3) {
      botComments.push({ id: `bc-c${id}-2`, intent_id: `i-c${String(id).padStart(3, '0')}`, user_id: null, content: generateBotComment('nha_advisor', tpl, matchCount), is_bot: true, bot_name: 'nha_advisor', created_at: h(hoursAgo - 0.3) });
    }
    // Market Analyst (40% chance)
    if (tpl.district && seededRandom() > 0.6) {
      botComments.push({ id: `bc-c${id}-3`, intent_id: `i-c${String(id).padStart(3, '0')}`, user_id: null, content: generateBotComment('market_analyst', tpl, matchCount), is_bot: true, bot_name: 'market_analyst', created_at: h(hoursAgo - 0.2) });
    }
    // Trust Checker for unverified (60% chance)
    if (user.verification_level === 'none' && seededRandom() > 0.4) {
      botComments.push({ id: `bc-c${id}-4`, intent_id: `i-c${String(id).padStart(3, '0')}`, user_id: null, content: generateBotComment('trust_checker', tpl, matchCount), is_bot: true, bot_name: 'trust_checker', created_at: h(hoursAgo - 0.1) });
    }

    // Human comments (40% chance, 1-3 per intent)
    const humanComments: MockComment[] = [];
    if (seededRandom() > 0.4) {
      const count = randInt(1, 3);
      for (let c = 0; c < count; c++) {
        const commenter = ALL_USERS[randInt(0, ALL_USERS.length - 1)];
        humanComments.push({ id: `hc-c${id}-${c}`, intent_id: `i-c${String(id).padStart(3, '0')}`, user_id: commenter.id, content: HUMAN_COMMENTS[randInt(0, HUMAN_COMMENTS.length - 1)], is_bot: false, bot_name: null, created_at: h(hoursAgo - randInt(1, 10)), user: { name: commenter.name } });
      }
    }

    intents.push({
      id: `i-c${String(id).padStart(3, '0')}`,
      user_id: user.id,
      type: 'CAN',
      raw_text: tpl.raw_text,
      title: tpl.title,
      parsed_data: tpl.parsed_data,
      category: 'real_estate',
      subcategory: tpl.subcategory,
      price: tpl.price,
      price_min: tpl.price_min,
      price_max: tpl.price_max,
      address: null,
      district: tpl.district,
      ward: null,
      city: 'Hồ Chí Minh',
      lat: null, lng: null,
      trust_score: user.trust_score,
      verification_level: user.verification_level,
      comment_count: humanComments.length + botComments.length,
      match_count: matchCount,
      view_count: viewCount,
      reactions: { interested: interestedCount, fair_price: Math.floor(interestedCount * 0.4), hot: Math.floor(interestedCount * 0.2) },
      status: 'active',
      expires_at: null,
      created_at: h(hoursAgo),
      updated_at: h(hoursAgo),
      user,
      images: [],
      bot_comments: botComments.slice(0, 3),
      bot_comment: botComments[0] || null,
      latest_comment: humanComments[humanComments.length - 1] || null,
    });
    id++;
  }

  // 20 CÓ user-posted
  for (let i = 0; i < CO_USER_TEMPLATES.length; i++) {
    const tpl = CO_USER_TEMPLATES[i];
    const user = getUserForIntent('CO', i + 5); // offset to vary users
    const hoursAgo = i < 3 ? randInt(1, 8) : i < 10 ? randInt(12, 96) : randInt(96, 500);
    const matchCount = i < 5 ? randInt(3, 6) : i < 12 ? randInt(1, 3) : randInt(0, 1);
    const viewCount = randInt(15, 250);
    const interestedCount = Math.floor(viewCount * (0.08 + seededRandom() * 0.2));
    const hasImages = tpl.subcategory !== 'room' && tpl.subcategory !== 'land';

    const botComments: MockComment[] = [];
    botComments.push({ id: `bc-o${id}-1`, intent_id: `i-o${String(i + 1).padStart(3, '0')}`, user_id: null, content: generateBotComment('match_advisor', tpl, matchCount), is_bot: true, bot_name: 'match_advisor', created_at: h(hoursAgo - 0.5) });
    if (user.verification_level === 'verified') {
      botComments.push({ id: `bc-o${id}-2`, intent_id: `i-o${String(i + 1).padStart(3, '0')}`, user_id: null, content: generateBotComment('trust_checker', tpl, matchCount), is_bot: true, bot_name: 'trust_checker', created_at: h(hoursAgo - 0.3) });
    }
    if (tpl.district && seededRandom() > 0.4) {
      botComments.push({ id: `bc-o${id}-3`, intent_id: `i-o${String(i + 1).padStart(3, '0')}`, user_id: null, content: generateBotComment('nha_advisor', tpl, matchCount), is_bot: true, bot_name: 'nha_advisor', created_at: h(hoursAgo - 0.2) });
    }

    const humanComments: MockComment[] = [];
    if (seededRandom() > 0.3) {
      const count = randInt(1, 4);
      for (let c = 0; c < count; c++) {
        const commenter = ALL_USERS[randInt(0, ALL_USERS.length - 1)];
        humanComments.push({ id: `hc-o${id}-${c}`, intent_id: `i-o${String(i + 1).padStart(3, '0')}`, user_id: commenter.id, content: HUMAN_COMMENTS[randInt(0, HUMAN_COMMENTS.length - 1)], is_bot: false, bot_name: null, created_at: h(hoursAgo - randInt(1, 20)), user: { name: commenter.name } });
      }
    }

    const images = hasImages ? [
      { id: `img-o${i}-1`, url: `https://placehold.co/600x400/${pick(['1B6B4A', '2563EB', 'F97316', '7c3aed', 'dc2626', '0891b2'])}/fff?text=${encodeURIComponent(tpl.title.split(' ').slice(0, 2).join('+'))}`, display_order: 0 },
      { id: `img-o${i}-2`, url: `https://placehold.co/600x400/${pick(['374151', '6366f1', '65a30d', 'ea580c'])}/fff?text=Interior`, display_order: 1 },
    ] : [];

    intents.push({
      id: `i-o${String(i + 1).padStart(3, '0')}`,
      user_id: user.id,
      type: 'CO',
      raw_text: tpl.raw_text,
      title: tpl.title,
      parsed_data: tpl.parsed_data,
      category: 'real_estate',
      subcategory: tpl.subcategory,
      price: tpl.price,
      price_min: tpl.price_min,
      price_max: tpl.price_max,
      address: null,
      district: tpl.district,
      ward: null,
      city: 'Hồ Chí Minh',
      lat: null, lng: null,
      trust_score: user.trust_score,
      verification_level: user.verification_level,
      comment_count: humanComments.length + botComments.length,
      match_count: matchCount,
      view_count: viewCount,
      reactions: { interested: interestedCount, fair_price: Math.floor(interestedCount * 0.35), hot: Math.floor(interestedCount * 0.15) },
      status: 'active',
      expires_at: null,
      created_at: h(hoursAgo),
      updated_at: h(hoursAgo),
      user,
      images,
      bot_comments: botComments.slice(0, 3),
      bot_comment: botComments[0] || null,
      latest_comment: humanComments[humanComments.length - 1] || null,
    });
    id++;
  }

  // Sort by created_at DESC (newest first)
  intents.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return intents;
}

// Pre-generate and export
export const GENERATED_INTENTS = generateAllIntents();
