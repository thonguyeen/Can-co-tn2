import 'dotenv/config';
import { prisma } from '../lib/db';

async function main() {
  try {
    const count = await prisma.marketReport.count();
    console.log('MarketReport table exists, rows:', count);
  } catch (e: any) {
    console.log('MarketReport table ERROR:', e.message?.slice(0, 200));
  }

  try {
    const intentCount = await prisma.intent.count({ where: { status: 'active' } });
    console.log('Active intents:', intentCount);
  } catch (e: any) {
    console.log('Intent count ERROR:', e.message?.slice(0, 200));
  }

  try {
    const analystBot = await prisma.bot.findFirst({ where: { handle: 'analyst_bds' } });
    console.log('Analyst bot exists:', !!analystBot);
  } catch (e: any) {
    console.log('Bot query ERROR:', e.message?.slice(0, 200));
  }

  process.exit(0);
}

main();
