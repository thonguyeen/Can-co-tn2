import 'dotenv/config';
import { prisma } from '../lib/db';

async function seedAnalystData() {
  console.log('Seeding Analyst Bot and Market Intents...');

  // 1. Seed Analyst Bot
  const botHandle = 'analyst_bds';
  let bot = await prisma.bot.findUnique({ where: { handle: botHandle } });
  
  if (!bot) {
    bot = await prisma.bot.create({
      data: {
        name: 'Nhà Phân Tích BĐS',
        handle: botHandle,
        bio: 'Bot tự động phân tích và tạo báo cáo thị trường chuyên sâu dựa trên số liệu thực 100%.',
        botType: 'analyst',
        expertise: ['market_analysis', 'price_tracking', 'trend_reporting'],
        personality: 'data-driven, objective, professional',
        systemPrompt: '', // It uses buildPrompt internally
        knowledgeText: 'Market knowledge override if any.',
        scheduleConfig: {
          autoReportAt: ["08:00"],
          autoReportDays: [0, 1, 2, 3, 4, 5, 6] // Run everyday for testing easily
        },
        isActive: true,
        isEnvoy: false,
      } as any
    });
    console.log(`[+] Created Analyst Bot: @${botHandle}`);
  } else {
    console.log(`[~] Analyst Bot @${botHandle} already exists.`);
  }

  // 2. Generate generic Intents for stats (around 15 items so we surpass the limit of 5)
  // Generating some CAN (buying) and some CO (selling) intents
  const mockDistricts = ['Quận 1', 'Quận 2', 'Quận 3', 'Quận 7', 'Quận 9', 'Bình Thạnh', 'Tân Bình', 'Gò Vấp'];
  const mockSubcats = ['apartment', 'house', 'land', 'commercial'];
  
  let inserted = 0;
  for (let i = 0; i < 20; i++) {
    const isCan = Math.random() > 0.6; // 40% CAN, 60% CO
    const type = isCan ? 'CAN' : 'CO';
    const district = mockDistricts[Math.floor(Math.random() * mockDistricts.length)];
    const subcat = mockSubcats[Math.floor(Math.random() * mockSubcats.length)];
    const price = !isCan ? Math.floor(1000 + Math.random() * 5000) * 1000000 : null; // 1B - 6B randomly
    
    await prisma.intent.create({
      data: {
        title: `${type === 'CAN' ? 'Cần mua' : 'Cần bán'} ${subcat} tại ${district}`,
        type: type,
        category: 'real_estate',
        subcategory: subcat,
        rawText: `[Auto-seeded] Đây là tin đăng giả lập để test bot phân tích BĐS.`,
        parsedData: {},
        status: 'active',
        district,
        city: 'Hồ Chí Minh',
        price,
      }
    });
    inserted++;
  }

  console.log(`[+] Seeded ${inserted} dummy active intents for Analyst to process`);
  console.log('✅ Done seeding analyst data.');
}

seedAnalystData().catch(e => {
  console.error('Error seeding analyst data:', e);
  process.exit(1);
}).finally(() => {
  process.exit(0);
});
