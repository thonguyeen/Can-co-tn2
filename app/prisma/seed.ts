import { config } from 'dotenv';
// Load env BEFORE anything else
config({ path: '.env.local' });
config({ path: '.env' });

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { hashSync } from 'bcryptjs'

// SAFETY LOCK GUARD (TC-01)
const dbUrl = process.env.DATABASE_URL || 'postgresql://admin:admin123@localhost:5432/cancotn_local';
if (dbUrl.includes('supabase.com')) {
  console.error('\x1b[31m%s\x1b[0m', '⛔ DỪNG LẠI! BẠN ĐANG TRỎ ".env.local" VÀO PRODUCTION SUPABASE!');
  console.error('Hãy kiểm tra lại file .env.local và đảm bảo đang sử dụng Localhost url.');
  process.exit(1);
}

// Create PrismaClient with PrismaPg adapter (same as lib/db.ts)
const pool = new Pool({ connectionString: dbUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log('🌱 Bắt đầu gieo hạt Local DB...');

  // 1. CLEANUP THE DB FIRST (từ con đến cha để tránh lỗi Foreign Key Constraint)
  console.log('🧹 Đang dọn dẹp dữ liệu cũ (Cleanup)...');
  await prisma.rewardRedemption.deleteMany({});
  await prisma.rewardItem.deleteMany({});
  await prisma.intentBoost.deleteMany({});
  await prisma.referralLog.deleteMany({});
  await prisma.userStat.deleteMany({});
  await prisma.pointTransaction.deleteMany({});
  await prisma.userAchievement.deleteMany({});
  await prisma.pushLog.deleteMany({});
  await prisma.intentEmbedding.deleteMany({});
  await prisma.match.deleteMany({});
  await prisma.intentComment.deleteMany({});
  await prisma.intent.deleteMany({});
  await prisma.bot.deleteMany({});
  await prisma.profile.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('✅ Đã dọn dẹp xong. Bắt đầu chèn dữ liệu mới...\n');

  const defaultPasswordHash = hashSync('admin123', 10);

  // 2. TẠO USERS
  console.log('👤 Đang tạo Users (Admin + 2 Mem)...');
  
  const admin = await prisma.user.create({
    data: { email: 'test@admin.com', name: 'Admin', passwordHash: defaultPasswordHash }
  });
  await prisma.profile.create({
    data: { id: admin.id, displayName: 'Thắng Admin', avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Admin', verificationLevel: 'verified_expert', trustScore: 99 }
  });

  const user1 = await prisma.user.create({
    data: { email: 'khoa@mail.com', name: 'Khoa', passwordHash: defaultPasswordHash }
  });
  await prisma.profile.create({
    data: { id: user1.id, displayName: 'Khoa Cần Mua', trustScore: 10, verificationLevel: 'verified_phone' }
  });

  const user2 = await prisma.user.create({
    data: { email: 'minh@mail.com', name: 'Minh', passwordHash: defaultPasswordHash }
  });
  await prisma.profile.create({
    data: { id: user2.id, displayName: 'Minh Có Nhà', trustScore: 50, verificationLevel: 'verified_cccd' }
  });

  // 3. TẠO BOTS
  console.log('🤖 Đang tạo AI Bots...');
  const luatSuBot = await prisma.bot.create({
    data: {
      name: 'Luật Sư Tuấn', handle: 'luatsutuan',
      expertise: ['phap_ly', 'sang_ten', 'hop_dong'], personality: 'Chuyên nghiệp, cẩn thận',
      isEnvoy: false, avatarUrl: 'https://api.dicebear.com/9.x/bottts/svg?seed=Tuấn'
    }
  });

  const envoyBot = await prisma.bot.create({
    data: {
      name: 'Môi Giới Tốc Độ', handle: 'moigioitocdo',
      expertise: ['tim_nha_nhanh', ' crawl_data'], isEnvoy: true,
      assignedProvince: 'Hồ Chí Minh', assignedDistrict: 'Quận 1',
      avatarUrl: 'https://api.dicebear.com/9.x/bottts/svg?seed=Flash'
    }
  });

  // 4. TẠO INTENTS (CẦN & CÓ)
  console.log('📝 Đang tạo Intents (CẦN & CÓ)...');
  const canIntent = await prisma.intent.create({
    data: {
      userId: user1.id,
      type: 'CAN',
      title: 'Cần tìm phòng trọ Quận 1',
      rawText: 'Tôi cần tìm phòng trọ ở Quận 1, giá dưới 5 triệu, có chỗ để xe máy. Ai có báo giá m sớm.',
      parsedData: { category: 'room', area: 20 },
      city: 'Hồ Chí Minh', district: 'Quận 1', priceMax: 5000000,
      lat: 10.7769, lng: 106.7009
    }
  });

  const coIntent = await prisma.intent.create({
    data: {
      userId: user2.id,
      type: 'CO',
      title: 'Cho thuê phòng trọ cao cấp Q1',
      rawText: 'Còn 1 phòng ngay trung tâm Quận 1, 4.5 củ, full nội thất xách vali vào ở.',
      parsedData: { category: 'room', area: 25 },
      city: 'Hồ Chí Minh', district: 'Quận 1', price: 4500000,
      lat: 10.7800, lng: 106.7000
    }
  });

  // 5. TẠO MATCH
  console.log('🔗 Đang tạo Match (Khớp nối AI)...');
  await prisma.match.create({
    data: {
      canIntentId: canIntent.id, coIntentId: coIntent.id,
      similarity: 0.95, explanation: 'Bài viết có chung khu vực Quận 1 và tầm giá 4.5M - 5M. Kích thước phù hợp.',
      status: 'suggested'
    }
  });

  // 6. TẠO GAMIFICATION TRANSACTIONS
  console.log('🏆 Đang cấp Điểm và Thông báo (Gamification)...');
  await prisma.pointTransaction.create({
    data: { userId: user1.id, amount: 10, reason: 'Tạo bài đăng CẦN đầu tiên' }
  });
  await prisma.pointTransaction.create({
    data: { userId: user2.id, amount: 20, reason: 'Tạo bài đăng CÓ cực kỳ chi tiết' }
  });
  
  await prisma.userAchievement.create({
    data: {
      userId: user2.id, achievementType: 'first_post',
      metadata: { note: 'Bài post đầu tiên' }
    }
  });

  await prisma.pushLog.create({
    data: { userId: user1.id, title: 'Có 1 Match mới!', body: 'Có một phòng trọ đang cho thuê rất hợp ý bạn.', status: 'sent' }
  });

  // 7. TẠO DỮ LIỆU REFERRAL & REWARDS (Phase 06)
  console.log('🎁 Đang cấp dữ liệu Referral & Đổi quà...');
  await prisma.profile.update({ where: { id: admin.id }, data: { referralCode: 'ADMINVIP' } });
  await prisma.profile.update({ where: { id: user1.id }, data: { referralCode: 'KHOANE', totalReferrals: 3, tier: 2 } });
  await prisma.profile.update({ where: { id: user2.id }, data: { referralCode: 'MINHPRO', totalReferrals: 9, tier: 2 } });

  const user3 = await prisma.user.create({ data: { email: 'referee@mail.com', name: 'Người Mới', passwordHash: defaultPasswordHash } });
  await prisma.profile.create({ data: { id: user3.id, displayName: 'Người mới', referredBy: user1.id, referralCode: 'MROOKIE' } });
  
  await prisma.referralLog.create({
    data: { referrerId: user1.id, refereeId: user3.id, pointsAwarded: 20 }
  });

  // User Stats Update
  await prisma.userStat.upsert({
    where: { userId: user1.id },
    create: { userId: user1.id, points: 50, referralPoints: 20 },
    update: { points: { increment: 50 }, referralPoints: { increment: 20 } }
  });
  await prisma.userStat.upsert({
    where: { userId: user2.id },
    create: { userId: user2.id, points: 150 },
    update: { points: { increment: 150 } }
  });

  const reward1 = await prisma.rewardItem.create({
    data: { label: 'Đẩy bài lên đỉnh (24h)', description: 'Hiển thị nổi bật bài Cần/Có của bạn trên Feed', pointsCost: 50, stock: -1 }
  });
  const reward2 = await prisma.rewardItem.create({
    data: { label: 'Thẻ Garena 50k', description: 'Mã thẻ nạp Game trực tiếp qua Email', pointsCost: 100, stock: 10 }
  });

  await prisma.intentBoost.create({
    data: { 
      intentId: coIntent.id, 
      userId: user2.id, 
      pointsSpent: 50, 
      startAt: new Date(), 
      endAt: new Date(Date.now() + 24 * 60 * 60 * 1000) 
    }
  });

  await prisma.rewardRedemption.create({
    data: { userId: user2.id, rewardItemId: reward2.id, rewardLabel: reward2.label, pointsCost: 100, status: 'PENDING' }
  });

  console.log('\n🎉 ĐÃ GIEO HẠT LOCAL THÀNH CÔNG! HỆ THỐNG SẴN SÀNG.');
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
