import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  const data = await prisma.$queryRaw<any[]>`
    SELECT title, trust_score, created_at FROM intents 
    ORDER BY trust_score DESC, created_at DESC
  `;
  
  console.log(`Total intents in DB: ${data.length}`);
  if (data.length > 0) {
     console.log('Top 5 by trust_score, created_at:');
     data.slice(0, 5).forEach(i => console.log(`[${i.trust_score}] ${i.created_at} - ${i.title}`));
  }
}
run();
