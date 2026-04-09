import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  const data = await prisma.$queryRaw<any[]>`
    SELECT title, trust_score, created_at FROM intents 
    ORDER BY trust_score DESC, created_at DESC
  `;
  
  console.log(`Total intents in DB: ${data?.length}`);
  if (data && data.length > 0) {
     data.forEach((i, idx) => {
         if (idx < 5 || idx > data.length - 5) {
            console.log(`[${idx}] [T:${i.trust_score}] ${i.created_at} - ${i.title}`);
         } else if (idx === 5) {
            console.log('...');
         }
     });
  }
}
run();
