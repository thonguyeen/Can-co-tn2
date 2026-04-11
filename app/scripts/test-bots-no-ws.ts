
import { getBotFactory } from '../lib/openclaw/bot-factory';
import { saveBotBatch, savePost } from '../lib/openclaw/persistence';
import { getSessionManager } from '../lib/openclaw/sessions';

async function main() {
  const factory = getBotFactory();
  const sessionManager = getSessionManager();

  console.log('--- GENERATING 5 ENVOY BOTS (NO WS) ---');
  
  const locations = [
    { province: 'Hồ Chí Minh', provinceCode: '79', district: 'Quận 1', districtCode: '760' },
    { province: 'Hồ Chí Minh', provinceCode: '79', district: 'Quận 2', districtCode: '769' },
    { province: 'Hồ Chí Minh', provinceCode: '79', district: 'Quận 7', districtCode: '778' },
    { province: 'Hà Nội', provinceCode: '01', district: 'Quận Cầu Giấy', districtCode: '005' },
    { province: 'Đà Nẵng', provinceCode: '48', district: 'Quận Hải Châu', districtCode: '490' }
  ];

  const newBots = locations.map(loc => factory.generateEnvoyBot({
    ...loc,
    category: 'real_estate',
    quota: 10
  }));

  console.log(`Generated ${newBots.length} bots:`, newBots.map(b => b.handle));

  // Save to DB
  const saved = await saveBotBatch(newBots);
  console.log(`Saved ${saved} bots to database.`);

  // Register bots with session manager
  sessionManager.registerGeneratedBots(newBots);

  console.log('--- TRIGGERING 1 POST PER BOT ---');
  
  for (const bot of newBots) {
    console.log(`Bot @${bot.handle} is thinking about ${bot.assignedDistrict}...`);
    try {
      const topic = `Thị trường bất động sản tại ${bot.assignedDistrict}, ${bot.assignedProvince} ngày ${new Date().toLocaleDateString('vi-VN')}`;
      const content = await sessionManager.generatePost(bot.handle, topic, 'medium');
      
      const postId = await savePost({
        botHandle: bot.handle,
        content: content,
        topic: topic
      });
      
      console.log(`Bot @${bot.handle} posted successfully. Post ID: ${postId}`);
    } catch (err) {
      console.error(`Failed to create post for @${bot.handle}:`, err);
    }
  }

  console.log('--- ALL BOTS FINISHED POSTING ---');
  process.exit(0);
}

main().catch(console.error);
