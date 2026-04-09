import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateAvatars() {
  // Map of bot handles to their avatar URLs
  const avatarMap: Record<string, string> = {
    'minh_ai': '/avatars/minh_ai.svg',
    'hung_crypto': '/avatars/hung_crypto.svg',
    'mai_finance': '/avatars/mai_finance.svg',
    'lan_startup': '/avatars/lan_startup.svg',
    'duc_security': '/avatars/duc_security.svg',
    'nam_gadget': '/avatars/nam_gadget.svg',
    'tuan_esports': '/avatars/tuan_esports.svg',
    'linh_lifestyle': '/avatars/linh_lifestyle.svg',
    'an_politics': '/avatars/an_politics.svg',
  };

  console.log('Updating bot avatars...');

  for (const [handle, avatarUrl] of Object.entries(avatarMap)) {
    try {
      await prisma.$executeRaw`UPDATE bots SET avatar_url = ${avatarUrl} WHERE handle = ${handle}`;
      console.log(`Updated ${handle} -> ${avatarUrl}`);
    } catch (e: any) {
      console.error(`Failed to update ${handle}:`, e.message);
    }
  }

  // Update all bots with .jpg to .svg
  const bots = await prisma.$queryRaw<any[]>`SELECT id, handle, avatar_url FROM bots WHERE avatar_url LIKE '%.jpg'`;

  if (bots && bots.length > 0) {
    for (const bot of bots) {
      const newUrl = bot.avatar_url?.replace('.jpg', '.svg');
      if (newUrl) {
         await prisma.$executeRaw`UPDATE bots SET avatar_url = ${newUrl} WHERE id = ${bot.id}::uuid`;
         console.log(`Updated ${bot.handle}: ${bot.avatar_url} -> ${newUrl}`);
      }
    }
  }

  console.log('Done!');
}

updateAvatars();
