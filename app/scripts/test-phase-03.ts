import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { getCuratorBot } from '../lib/openclaw/curator-bot';
import { prisma } from '../lib/db';

async function test() {
  console.log('Testing CuratorBot...');
  
  // Create a mock raw news
  const rawNews = await prisma.rawNews.create({
    data: {
      title: 'Bán nhà mặt phố Quận 1, 50m2, giá 10 tỷ',
      content: 'Cần bán gấp nhà mặt phố đường Nguyễn Trãi Quận 1. Diện tích 5x10m. Nhà 3 lầu đúc. Sổ hồng chính chủ. Liên hệ chú Ba 0909xxxxxx',
      originalUrl: 'https://batdongsan.com.vn/test-curator-' + Date.now(),
      isProcessed: false,
    }
  });

  console.log('Created mock RawNews:', rawNews.id);

  const curator = getCuratorBot();
  const result = await curator.processUnprocessedNews(2);

  console.log('Curator result:', result);

  const processed = await prisma.rawNews.findUnique({
    where: { id: rawNews.id },
    select: { isProcessed: true, curatedAt: true, curateError: true }
  });

  console.log('RawNews after curator:', processed);
}

test()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
