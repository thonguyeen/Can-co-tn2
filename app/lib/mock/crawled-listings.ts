// ═══════════════════════════════════════════════════════
// CẦN & CÓ — 30 Crawled Listings (expand from 8 to 30)
// ═══════════════════════════════════════════════════════

import type { MockIntent, MockUser } from './intents';

const BASE_TIME = new Date('2026-03-22T08:00:00Z').getTime();
const h = (hours: number) => new Date(BASE_TIME - hours * 60 * 60 * 1000).toISOString();

const CRAWL_USER: MockUser = {
  id: 'crawl-system', name: 'Nguồn ngoài', avatar_url: null, trust_score: 0, verification_level: 'none',
};

function cr(id: number, title: string, raw: string, district: string, price: number, sub: string, pd: Record<string, unknown>, hoursAgo: number, hasImg = false): MockIntent {
  const img = hasImg ? [{ id: `cr-img-${id}`, url: `https://placehold.co/600x400/${['0e7490','374151','7c3aed','1B6B4A','dc2626','6366f1','ea580c','0891b2'][id % 8]}/fff?text=${encodeURIComponent(title.split(' ').slice(0,2).join('+'))}`, display_order: 0 }] : [];
  const mc = (id * 7 + 3) % 4; // 0-3 deterministic per id
  const vc = 8 + ((id * 13 + 5) % 80); // 8-87 deterministic per id
  return {
    id: `cr-${String(id).padStart(3,'0')}`, user_id: 'crawl-system', type: 'CO',
    raw_text: raw, title, parsed_data: { ...pd, source: 'batdongsan', source_url: `https://batdongsan.com.vn/${10000+id}` },
    category: 'real_estate', subcategory: sub,
    price, price_min: null, price_max: null,
    address: null, district, ward: null, city: 'Hồ Chí Minh', lat: null, lng: null,
    trust_score: 0, verification_level: 'none',
    comment_count: mc > 0 ? 1 : 0, match_count: mc, view_count: vc,
    reactions: { interested: Math.floor(vc*0.1), fair_price: Math.floor(vc*0.04), hot: Math.floor(vc*0.02) },
    status: 'active', expires_at: null, created_at: h(hoursAgo), updated_at: h(hoursAgo),
    user: CRAWL_USER, images: img,
    bot_comments: mc > 0 ? [{ id: `cr-bc-${id}`, intent_id: `cr-${String(id).padStart(3,'0')}`, user_id: null, content: `${mc} người đang tìm phù hợp khu vực ${district}. Tin từ nguồn ngoài — chưa xác thực chủ.`, is_bot: true, bot_name: 'match_advisor', created_at: h(hoursAgo-0.5) }] : undefined,
    bot_comment: null, latest_comment: null,
  };
}

export const CRAWLED_INTENTS: MockIntent[] = [
  cr(1, 'Bán The Sun Avenue 3PN 96m² view sông', 'Căn hộ cao cấp The Sun Avenue, tầng 20, 3PN, 96m², full nội thất. View sông Sài Gòn hướng ĐN.', 'Thủ Đức', 5.8e9, 'apartment', { bedrooms: 3, area: 96, project_name: 'The Sun Avenue' }, 6, true),
  cr(2, 'Cho thuê studio Bình Thạnh 3.5tr', 'Studio 25m² gần ĐH Hutech, đầy đủ nội thất, giờ giấc tự do. Wifi free.', 'Bình Thạnh', 3.5e6, 'room', { area: 25 }, 8),
  cr(3, 'Bán nhà phố Tân Bình hẻm 5m', 'Nhà phố 4x12m, 1 trệt 2 lầu, 3PN 2WC. SHR, khu an ninh.', 'Tân Bình', 5.5e9, 'house', { bedrooms: 3, area: 48 }, 10, true),
  cr(4, 'Cho thuê mặt bằng Phú Nhuận 35tr', 'Mặt bằng Phan Xích Long, 60m², mặt tiền 5m. Phù hợp café, spa.', 'Phú Nhuận', 35e6, 'commercial', { area: 60 }, 14),
  cr(5, 'Bán Gateway Thảo Điền 2PN 73m²', 'Căn hộ Gateway Thảo Điền, tầng 15, nội thất cơ bản. View Landmark 81.', 'Thủ Đức', 4.5e9, 'apartment', { bedrooms: 2, area: 73, project_name: 'Gateway Thảo Điền' }, 4, true),
  cr(6, 'Bán Estella Heights 2PN 100m²', 'Estella Heights Q2, tầng cao, view sông + công viên. Nội thất Châu Âu.', 'Thủ Đức', 8.2e9, 'apartment', { bedrooms: 2, area: 100, project_name: 'Estella Heights' }, 16, true),
  cr(7, 'Cho thuê 1PN Q1 Nguyễn Trãi 12tr', 'Căn hộ 1PN 45m², full nội thất, an ninh 24/7. Sẵn ở ngay.', 'Quận 1', 12e6, 'apartment', { bedrooms: 1, area: 45 }, 20),
  cr(8, 'Bán đất Bình Chánh 100m² SHR', 'Đất nền mặt tiền đường lớn, thổ cư 100%, SHR. Gần KCN.', 'Bình Chánh', 1.8e9, 'land', { area: 100 }, 22),
  // 9-30: NEW crawled intents
  cr(9, 'Bán căn hộ Landmark 81 2PN', 'Landmark 81, tầng 35, 2PN 80m², nội thất Versace. View toàn TP.', 'Bình Thạnh', 12e9, 'apartment', { bedrooms: 2, area: 80, project_name: 'Landmark 81' }, 3, true),
  cr(10, 'Cho thuê căn hộ Tân Phú 2PN 7tr', 'Căn hộ Celadon City 2PN 68m², nội thất cơ bản. Gần Aeon Mall.', 'Tân Phú', 7e6, 'apartment', { bedrooms: 2, area: 68, project_name: 'Celadon City' }, 7),
  cr(11, 'Bán nhà phố Q7 Phú Mỹ Hưng', 'Nhà phố PMH, 5x20m, 3 tầng, 4PN. Khu đô thị, an ninh. SHR.', 'Quận 7', 14e9, 'house', { bedrooms: 4, area: 100 }, 12, true),
  cr(12, 'Cho thuê phòng trọ Thủ Đức 2tr', 'Phòng trọ 15m², có gác, WC riêng, wifi. Gần ĐH Nông Lâm.', 'Thủ Đức', 2e6, 'room', { area: 15 }, 18),
  cr(13, 'Bán căn hộ Q12 giá rẻ 1.3 tỷ', 'Căn hộ Prosper Plaza Q12, 2PN 54m², tầng 8. Sổ hồng riêng.', 'Quận 12', 1.3e9, 'apartment', { bedrooms: 2, area: 54 }, 24),
  cr(14, 'Cho thuê văn phòng Q1 55tr', 'Văn phòng 100m² Nguyễn Huệ, tầng 8, thang máy. View đẹp.', 'Quận 1', 55e6, 'commercial', { area: 100 }, 28),
  cr(15, 'Bán Masteri An Phú 3PN 105m²', 'Masteri An Phú, tầng 22, 3PN, view sông. Nội thất cao cấp.', 'Thủ Đức', 7.5e9, 'apartment', { bedrooms: 3, area: 105, project_name: 'Masteri An Phú' }, 5, true),
  cr(16, 'Cho thuê nhà nguyên căn Gò Vấp 10tr', 'Nhà 3x10m, 1 lầu, 2PN. Hẻm 3m, gần chợ Hạnh Thông Tây.', 'Gò Vấp', 10e6, 'house', { bedrooms: 2, area: 30 }, 15),
  cr(17, 'Bán căn hộ Q3 Hado Centrosa 3.8 tỷ', 'Hado Centrosa, 1PN+1 60m², tầng 12. Gần công viên Lê Thị Riêng.', 'Quận 3', 3.8e9, 'apartment', { bedrooms: 1, area: 60, project_name: 'Hado Centrosa' }, 9, true),
  cr(18, 'Cho thuê kho Q12 15tr', 'Kho 150m², có toilet, điện 3 pha. Đường xe tải.', 'Quận 12', 15e6, 'commercial', { area: 150 }, 30),
  cr(19, 'Bán biệt thự Nhà Bè 8.5 tỷ', 'Biệt thự 200m², 4PN, sân vườn, hồ bơi. KDC yên tĩnh.', 'Nhà Bè', 8.5e9, 'house', { bedrooms: 4, area: 200 }, 36, true),
  cr(20, 'Cho thuê căn hộ Bình Thạnh 9tr', 'Căn hộ Wilton Tower 1PN 50m², full nội thất. Gần Hàng Xanh.', 'Bình Thạnh', 9e6, 'apartment', { bedrooms: 1, area: 50 }, 40),
  cr(21, 'Bán đất Củ Chi 500m² 1.2 tỷ', 'Đất vườn Củ Chi, đường ô tô, cây ăn quả. Thích hợp farmstay.', 'Bình Chánh', 1.2e9, 'land', { area: 500 }, 44),
  cr(22, 'Cho thuê mặt bằng Q7 Nguyễn Lương Bằng', 'Mặt bằng 120m², mặt tiền 8m. Phù hợp nhà hàng, showroom.', 'Quận 7', 65e6, 'commercial', { area: 120 }, 11, true),
  cr(23, 'Bán căn hộ Phú Nhuận Orchard Garden', 'Orchard Garden, 2PN 73m², tầng 18. Nội thất Bàn giao CĐT.', 'Phú Nhuận', 4.5e9, 'apartment', { bedrooms: 2, area: 73, project_name: 'Orchard Garden' }, 19, true),
  cr(24, 'Cho thuê phòng trọ Q3 2.8tr', 'Phòng trọ 18m², WC riêng, ban công. Gần chợ Tân Định.', 'Quận 3', 2.8e6, 'room', { area: 18 }, 25),
  cr(25, 'Bán nhà Bình Thạnh Nơ Trang Long', 'Nhà 4x14m, 3 tầng, 4PN, hẻm 5m. Gần Vincom Bà Chiểu.', 'Bình Thạnh', 6.8e9, 'house', { bedrooms: 4, area: 56 }, 32, true),
  cr(26, 'Cho thuê căn hộ Thủ Đức Vinhomes Grand Park', 'Vinhomes Grand Park, 1PN 30m² S1.01. Nội thất CĐT. 5.5tr/tháng.', 'Thủ Đức', 5.5e6, 'apartment', { bedrooms: 1, area: 30, project_name: 'Vinhomes Grand Park' }, 2),
  cr(27, 'Bán căn hộ Q7 Midtown Phú Mỹ Hưng', 'Midtown 2PN 89m², tầng trung, view Sakura Park. Nội thất cao cấp.', 'Quận 7', 5.2e9, 'apartment', { bedrooms: 2, area: 89 }, 13, true),
  cr(28, 'Cho thuê shophouse Sala Q2 120tr', 'Shophouse Sala Đại Quang Minh, 100m², mặt tiền. Kinh doanh đông.', 'Thủ Đức', 120e6, 'commercial', { area: 100 }, 48),
  cr(29, 'Bán căn hộ Tân Bình Cộng Hòa Garden', 'Cộng Hòa Garden, 2PN 72m², tầng 10. Gần sân bay, có nội thất.', 'Tân Bình', 2.8e9, 'apartment', { bedrooms: 2, area: 72, project_name: 'Cộng Hòa Garden' }, 38),
  cr(30, 'Cho thuê nhà Phú Nhuận mặt tiền 40tr', 'Nhà mặt tiền Phan Đình Phùng, 4x15m, 3 tầng. Kinh doanh sầm uất.', 'Phú Nhuận', 40e6, 'house', { area: 60 }, 52),
];
