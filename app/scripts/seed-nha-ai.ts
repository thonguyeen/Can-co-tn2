// ═══════════════════════════════════════════════════════════════
// SEED: NHA.AI Chatbot Bot Record
// Chạy: npx tsx scripts/seed-nha-ai.ts
// Dùng upsert để an toàn khi chạy lại (Tech Lead condition C2)
// ═══════════════════════════════════════════════════════════════

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// Load .env.local
dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

const NHA_AI_SYSTEM_PROMPT = `Bạn là NHA.AI - Trợ lý ảo môi giới BĐS thông minh của nền tảng mạng xã hội CẦN & CÓ.

Nhiệm vụ của bạn là tư vấn cho người dùng về giá cả, xu hướng thị trường, hoặc cách sử dụng ứng dụng.

Quy tắc:
1. Luôn vui vẻ, lịch sự và sử dụng icon (emoji) tự nhiên.
2. Trả lời NGẮN GỌN, đi thẳng vào trọng tâm (tối đa 4 câu).
3. Nếu người dùng hỏi ngoài lề, hãy khéo léo từ chối và lái câu chuyện về BĐS.
4. Đừng tự ý xuất Markdown phức tạp, chỉ cần bôi đậm (**) và ngắt dòng hợp lý.
5. Khi có dữ liệu thị trường (MarketReport), hãy trích dẫn số liệu cụ thể.
6. Nếu chưa có dữ liệu, nói rõ: "Em chưa có số liệu mới nhất, anh/chị kiểm tra lại sau nhé."`;

async function seed() {
  console.log('[Seed] Seeding NHA.AI chatbot...');

  const bot = await prisma.bot.upsert({
    where: { handle: 'nha_ai' },
    update: {
      name: 'NHA.AI',
      botType: 'chatbot',
      systemPrompt: NHA_AI_SYSTEM_PROMPT,
      isActive: true,
    },
    create: {
      name: 'NHA.AI',
      handle: 'nha_ai',
      bio: 'Trợ lý ảo BĐS thông minh — hỏi gì về nhà đất, em biết hết! 🏠',
      botType: 'chatbot',
      systemPrompt: NHA_AI_SYSTEM_PROMPT,
      isActive: true,
      isEnvoy: false,
      expertise: ['real_estate', 'market_analysis', 'consultation'],
      personality: 'friendly',
      colorAccent: '#14b8a6',
      dailyQuota: 0,
      scheduleConfig: {
        activeHours: { start: '00:00', end: '23:59' },
        activeDays: [0, 1, 2, 3, 4, 5, 6],
        intervalMinutes: 0,
        timezone: 'Asia/Ho_Chi_Minh',
      },
    },
  });

  console.log(`[Seed] ✅ NHA.AI bot: ${bot.id}`);
  console.log(`[Seed]    handle: ${bot.handle}`);
  console.log(`[Seed]    botType: ${bot.botType}`);
  console.log(`[Seed]    prompt length: ${bot.systemPrompt?.length || 0} chars`);
}

seed()
  .then(() => {
    console.log('[Seed] Done!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('[Seed] Error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
