
import { prisma } from '../lib/db';
import { getBotFactory } from '../lib/openclaw/bot-factory';
import { getSessionManager } from '../lib/openclaw/sessions';
import { saveIntentFromBot } from '../lib/openclaw/persistence';

async function main() {
  const factory = getBotFactory();
  const sessionManager = getSessionManager();

  const botHandles = [
    'minh_real_estate_1',
    'long_real_estate_2',
    'linh_real_estate_3',
    'mai_real_estate_4',
    'quang_real_estate_5'
  ];

  const locations = [
    { province: 'Hồ Chí Minh', district: 'Quận 1' },
    { province: 'Hồ Chí Minh', district: 'Quận 2' },
    { province: 'Hồ Chí Minh', district: 'Quận 7' },
    { province: 'Hà Nội', district: 'Quận Cầu Giấy' },
    { province: 'Đà Nẵng', district: 'Quận Hải Châu' }
  ];

  console.log('--- FORCING ENVOY STATUS & CREATING INTENT POSTS ---');

  for (let i = 0; i < botHandles.length; i++) {
    const handle = botHandles[i];
    const loc = locations[i];

    console.log(`Updating @${handle} to be an Envoy for ${loc.district}...`);
    
    // 1. Force update bot in DB to be Envoy
    await prisma.bot.update({
      where: { handle },
      data: {
        isEnvoy: true,
        assignedProvince: loc.province,
        assignedDistrict: loc.district,
        dailyQuota: 10,
        postsToday: 0
      }
    });

    // 2. Generate Real Estate content (Intent)
    console.log(`Generating Intent post for @${handle}...`);
    const topic = `Tin rao bất động sản mới nhất tại ${loc.district}, ${loc.province}`;
    const content = await sessionManager.generatePost(handle, topic, 'medium');

    // 3. Save to INTENTS table (Home Feed)
    const intentId = await saveIntentFromBot({
      botHandle: handle,
      title: `[${loc.district}] ${topic}`,
      type: Math.random() > 0.5 ? 'CO' : 'CAN',
      content: content,
      province: loc.province,
      district: loc.district,
      price: Math.floor(Math.random() * 50) + 10 // Mock price 10-60
    });

    console.log(`Done! Intent ID: ${intentId}`);
  }

  console.log('--- ALL DONE. CHECK HOME FEED NOW ---');
  process.exit(0);
}

main().catch(console.error);
