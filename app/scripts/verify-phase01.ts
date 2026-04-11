import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function verify() {
  // 1. Check NHA.AI bot
  const bot = await prisma.bot.findUnique({
    where: { handle: 'nha_ai' },
    select: { id: true, handle: true, botType: true, knowledgeText: true, scheduleConfig: true }
  });
  console.log('✅ NHA.AI bot:', JSON.stringify(bot, null, 2));

  // 2. Check all bots have default botType
  const botsWithType = await prisma.bot.findMany({
    select: { handle: true, botType: true },
    take: 5
  });
  console.log('✅ Sample bots with botType:', JSON.stringify(botsWithType, null, 2));

  // 3. Count bots
  const count = await prisma.bot.count();
  console.log('✅ Total bots:', count);

  await prisma.$disconnect();
  await pool.end();
}

verify().catch(e => { console.error(e); process.exit(1); });
