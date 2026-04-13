import 'dotenv/config';
import { prisma } from '../lib/db';
import { BotOrchestrator } from '../lib/openclaw/orchestrator';

async function run() {
  console.log('--- STARTING ORCHESTRATOR PHASE 04 TESTS ---');
  
  // Create / setup a test bot
  const testHandle = `test_bot_${Date.now()}`;
  console.log(`[1] Creating test bot: ${testHandle}`);
  
  await prisma.bot.create({
    data: {
      id: `bot-${Date.now()}`,
      handle: testHandle,
      name: 'Test Bot',
      bio: 'Bot for testing orchestrator schedule',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  });

  const orchestrator = new BotOrchestrator({ dryRun: true });

  console.log('\n[2] Testing isBotAvailable (Schedule Logic)');
  
  // Initial check (no schedule config, should be available)
  let isAvail = await (orchestrator as any).isBotAvailable(testHandle);
  console.log(`  - No schedule config => Available: [${isAvail}] (Expected: true)`);

  const now = new Date();
  const currentHour = now.getHours();
  const currentDay = now.getDay();

  // Update schedule to be active ONLY at current hour and day
  await prisma.bot.update({
    where: { handle: testHandle },
    data: {
      scheduleConfig: {
        activeDays: [currentDay],
        activeHours: [currentHour]
      } as any
    }
  });
  
  isAvail = await (orchestrator as any).isBotAvailable(testHandle);
  console.log(`  - Configured strictly to current day/hour => Available: [${isAvail}] (Expected: true)`);

  // Update schedule to be OUTSIDE current hour
  const offsetHour = (currentHour + 2) % 24;
  await prisma.bot.update({
    where: { handle: testHandle },
    data: {
      scheduleConfig: {
        activeDays: [currentDay],
        activeHours: [offsetHour]
      } as any
    }
  });

  isAvail = await (orchestrator as any).isBotAvailable(testHandle);
  console.log(`  - Configured to offset hour (${offsetHour}) => Available: [${isAvail}] (Expected: false)`);

  // Update schedule to be OUTSIDE current day
  const offsetDay = (currentDay + 2) % 7;
  await prisma.bot.update({
    where: { handle: testHandle },
    data: {
      scheduleConfig: {
        activeDays: [offsetDay],
        activeHours: [currentHour]
      } as any
    }
  });

  isAvail = await (orchestrator as any).isBotAvailable(testHandle);
  console.log(`  - Configured to offset day (${offsetDay}) => Available: [${isAvail}] (Expected: false)`);

  console.log('\n[3] Testing Intent Mock Selection Logic');
  console.log(`  - Calling triggerIntentComment in dry-run mode to ensure safe skipping.`);
  await orchestrator.triggerIntentComment();
  console.log(`  - Ensure test bot is processed or bypassed without errors.`);

  console.log('\n[4] Cleaning up test data');
  await prisma.bot.delete({
    where: { handle: testHandle }
  });

  console.log('\n--- TESTS COMPLETED SUCCESSFULLY ---');
  process.exit(0);
}

run().catch((e) => {
  console.error('Test script failed:', e);
  process.exit(1);
});
