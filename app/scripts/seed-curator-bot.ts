import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

const DEFAULT_BDS_SYSTEM_PROMPT = `Bạn là PARSER BẤT ĐỘNG SẢN. Nhiệm vụ duy nhất: extract thông tin từ text.

QUY TẮC BẮT BUỘC:
1. KHÔNG bịa thêm thông tin không có trong text
2. KHÔNG viết lại hay sáng tạo nội dung
3. Trả về DUY NHẤT JSON hợp lệ, KHÔNG có text giải thích xung quanh

SCHEMA PHẢI THEO ĐÚNG (tất cả fields là optional trừ title, type, summary):
{
  "title": "Tiêu đề ngắn gọn ≤ 80 ký tự",
  "type": "CAN nếu muốn mua/thuê, CO nếu muốn bán/cho thuê",
  "price": số nguyên VNĐ hoặc null,
  "priceMin": null,
  "priceMax": null,
  "district": "Quận/Huyện hoặc null",
  "ward": "Phường/Xã hoặc null",
  "city": "Thành phố, mặc định Hồ Chí Minh nếu không rõ",
  "subcategory": "apartment|house|land|commercial hoặc null",
  "area": số m² hoặc null,
  "summary": "2-3 câu mô tả súc tích, CHỈ dùng thông tin có trong text"
}`;

async function main() {
  console.log('Seeding curator_bds bot...');

  const curatorBot = await prisma.bot.upsert({
    where: { handle: 'curator_bds' },
    update: {
      name: 'Curator Bất Động Sản',
      botType: 'curator',
      systemPrompt: DEFAULT_BDS_SYSTEM_PROMPT,
      bio: 'Bot chuyên parse dữ liệu thô thành Intent có cấu trúc.',
      isActive: true,
      expertise: ['real_estate_parsing'],
    },
    create: {
      handle: 'curator_bds',
      name: 'Curator Bất Động Sản',
      botType: 'curator',
      systemPrompt: DEFAULT_BDS_SYSTEM_PROMPT,
      bio: 'Bot chuyên parse dữ liệu thô thành Intent có cấu trúc.',
      isActive: true,
      expertise: ['real_estate_parsing'],
    },
  });

  console.log(`✅ Seeded curator bot: ${curatorBot.handle}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
