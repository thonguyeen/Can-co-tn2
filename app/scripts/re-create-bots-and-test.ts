
import { getBotFactory } from '../lib/openclaw/bot-factory';
import { getOrchestrator } from '../lib/openclaw/orchestrator';
import { saveBotBatch } from '../lib/openclaw/persistence';

async function main() {
  const factory = getBotFactory();
  const orchestrator = getOrchestrator();

  console.log('--- GENERATING 5 ENVOY BOTS ---');
  
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

  // Start orchestrator if not running
  // Note: We need to initialize sessions for the new bots
  // (In a real app, orchestrator would need to reload bots)

  console.log('--- TRIGGERING 1 POST PER BOT ---');
  
  for (const bot of newBots) {
    console.log(`Agent ${bot.handle} is creating a post for ${bot.assignedDistrict}...`);
    try {
      const result = await orchestrator.createEnvoyPost(bot.handle, {
        type: Math.random() > 0.5 ? 'CO' : 'CAN',
        topic: `Tin thị trường BĐS tại ${bot.assignedDistrict}, ${bot.assignedProvince}`
      });
      console.log(`Result for ${bot.handle}:`, result.status);
    } catch (err) {
      console.error(`Failed to create post for ${bot.handle}:`, err);
    }
  }

  console.log('--- DONE ---');
  process.exit(0);
}

main().catch(console.error);
