import { NextRequest, NextResponse } from 'next/server';
import { DEMO_INTENTS } from '@/lib/mock/intents';
import { CRAWLED_INTENTS } from '@/lib/mock/crawled-listings';

const ALL_CO = [...DEMO_INTENTS, ...CRAWLED_INTENTS].filter((i) => i.type === 'CO');

function detectFlow(msg: string): 'CAN' | 'CO' | 'unclear' {
  const lower = msg.toLowerCase();
  if (/tìm|cần|mua|thuê|kiếm/.test(lower)) return 'CAN';
  if (/bán|cho thuê|có|đăng/.test(lower)) return 'CO';
  return 'unclear';
}

function fmtPrice(p: number): string {
  if (p >= 1e9) return `${(p / 1e9).toFixed(1)} tỷ`;
  return `${Math.round(p / 1e6)} triệu`;
}

function searchMatches(msg: string) {
  const lower = msg.toLowerCase();
  const districts = ['quận 1', 'quận 3', 'quận 7', 'bình thạnh', 'gò vấp', 'thủ đức', 'phú nhuận', 'tân bình'];
  const matchedDistrict = districts.find((d) => lower.includes(d));

  let results = ALL_CO.filter((i) => i.status === 'active');
  if (matchedDistrict) {
    const exact = results.filter((i) => i.district?.toLowerCase() === matchedDistrict);
    if (exact.length > 0) results = exact;
  }

  const pnMatch = lower.match(/(\d)\s*(?:pn|phòng ngủ)/);
  if (pnMatch) {
    const bd = parseInt(pnMatch[1]);
    const filtered = results.filter((i) => (i.parsed_data as Record<string, unknown>)?.bedrooms === bd);
    if (filtered.length > 0) results = filtered;
  }

  return results.slice(0, 3);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { message } = body;

  if (!message || message.trim().length === 0) {
    return NextResponse.json({
      reply: 'Xin chào! Tôi là trợ lý CẦN & CÓ. Bạn đang tìm gì? Hoặc bạn có gì muốn đăng?',
      quick_replies: ['Tìm căn hộ Q7', 'Tìm nhà Gò Vấp', 'Tôi muốn bán', 'Xem thị trường'],
    });
  }

  const flow = detectFlow(message);

  if (flow === 'CAN') {
    const matches = searchMatches(message);
    if (matches.length === 0) {
      return NextResponse.json({
        reply: `Chưa tìm thấy tin phù hợp. Hãy thử mô tả cụ thể hơn (quận, số phòng, giá).\n\nVí dụ: "Tìm căn hộ 2PN Quận 7 3-4 tỷ"`,
        quick_replies: ['Tìm căn hộ Q7', 'Tìm nhà Thủ Đức', 'Tìm phòng trọ'],
      });
    }

    const list = matches.map((m, i) => {
      const trust = m.verification_level === 'verified' ? '✅' : m.verification_level === 'kyc' ? '🟡' : '📡';
      return `${i + 1}. ${m.type === 'CO' ? '🟢' : ''} ${m.title}\n   ${m.price ? fmtPrice(m.price) : ''} ${trust}`;
    }).join('\n\n');

    return NextResponse.json({
      reply: `Tìm thấy ${matches.length} tin phù hợp:\n\n${list}\n\n💬 Muốn nhắn trực tiếp? Đăng ký tại CẦN & CÓ →`,
      quick_replies: ['Tìm thêm', 'Đăng tin bán', 'Xem thị trường', 'Đăng ký'],
      intents_found: matches.length,
    });
  }

  if (flow === 'CO') {
    return NextResponse.json({
      reply: `Bạn muốn đăng tin! 🟢\n\nMô tả chi tiết (địa chỉ, diện tích, số phòng, giá):\nVí dụ: "Bán căn hộ Masteri Q2, 2PN 70m², 4.2 tỷ"\n\nĐể đăng tin chính thức, truy cập CẦN & CÓ →`,
      quick_replies: ['Đăng ký ngay', 'Xem thị trường', 'Tìm mua'],
    });
  }

  // Unclear
  if (message.toLowerCase().includes('thị trường')) {
    return NextResponse.json({
      reply: `📊 Thị trường BĐS HCM hôm nay:\n\n🔴 Thủ Đức: 12 CẦN vs 2 CÓ (cầu/cung 6x) 🔥\n🔴 Quận 7: 8 CẦN vs 3 CÓ (2.7x)\n⚪ Bình Thạnh: 5/4 (cân bằng)\n🟢 Gò Vấp: 3/5 (thiên bán)\n\nĐăng tin hoặc tìm kiếm trên CẦN & CÓ →`,
      quick_replies: ['Tìm căn hộ', 'Đăng tin bán', 'Đăng ký'],
    });
  }

  return NextResponse.json({
    reply: `Tôi chưa hiểu rõ. Bạn đang:\n\n🔴 Tìm mua/thuê? → Gõ: "Tìm căn hộ 2PN Q7 3 tỷ"\n🟢 Bán/cho thuê? → Gõ: "Bán căn hộ Vinhomes 3.5 tỷ"\n📊 Xem thị trường? → Gõ: "Thị trường"`,
    quick_replies: ['Tìm căn hộ Q7', 'Tôi muốn bán', 'Xem thị trường'],
  });
}
