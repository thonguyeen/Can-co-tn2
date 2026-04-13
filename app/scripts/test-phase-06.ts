// ═══════════════════════════════════════════════════════════════
// TEST: Phase 06 - Global Chatbot Personalization
// Chạy: npx tsx scripts/test-phase-06.ts
// ═══════════════════════════════════════════════════════════════

import './load-env';
import { prisma } from '../lib/db';
import { detectMarketKeywords, buildChatContext, checkDailyQuota } from '../lib/chat/context-builder';

async function testPhase06() {
  console.log('🚀 Bắt đầu kiểm tra Phase 06 - NHA.AI Personalization...');
  
  const TEST_USER_ID = 'abaece55-a8f2-4100-a148-f3264a51d3be';
  let successCount = 0;
  let totalCount = 0;

  function assert(condition: boolean, message: string) {
    totalCount++;
    if (condition) {
      successCount++;
      console.log(`✅ ${message}`);
    } else {
      console.log(`❌ FAILED: ${message}`);
    }
  }

  try {
    // 🔍 1. Test Market Keyword Detection
    console.log('\n--- 1. Kiểm tra nhận diện từ khóa thị trường ---');
    assert(detectMarketKeywords('Giá nhà quận 7 thế nào?'), 'Nên nhận diện được "giá" và "quận"');
    assert(detectMarketKeywords('Xu hướng BĐS tháng này?'), 'Nên nhận diện được "xu hướng" và "tháng"');
    assert(!detectMarketKeywords('Xin chào NHA.AI'), 'Không nên nhận diện câu chào thông thường');

    // 🔍 2. Test Context Building (Logic quan trọng nhất)
    console.log('\n--- 2. Kiểm tra truy xuất dữ liệu MarketReport ---');
    const ctx = await buildChatContext('Giá nhà Quận 7 bao nhiêu?', {
      userId: TEST_USER_ID,
      category: 'real_estate'
    });

    assert(ctx.hasMarketData === true, 'Nên tìm thấy dữ liệu thị trường (vì Phase 05 đã tạo báo cáo)');
    assert(ctx.systemContext.includes('--- DỮ LIỆU THỊ TRƯỜNG THỰC'), 'System context nên chứa tiêu đề dữ liệu thực');
    if (ctx.reportId) {
      console.log(`   (Sử dụng Report ID: ${ctx.reportId})`);
    }

    // 🔍 3. Test Persistence (Mô phỏng lưu vào DB)
    console.log('\n--- 3. Kiểm tra lưu lịch sử chat vào DB ---');
    
    // Cleanup old test messages
    await prisma.aIChatMessage.deleteMany({
      where: { userId: TEST_USER_ID, metadata: { path: ['isTest'], equals: true } }
    });

    const testTime = new Date();
    const userMsg = 'USER_TEST_' + testTime.getTime();
    const botReply = 'BOT_TEST_' + testTime.getTime();

    // Create sequentially to ensure different timestamps
    await prisma.aIChatMessage.create({
      data: { 
        userId: TEST_USER_ID, 
        role: 'user', 
        content: userMsg, 
        metadata: { isTest: true, category: 'real_estate' } as any 
      }
    });

    // Wait 10ms to be sure about timestamp
    await new Promise(r => setTimeout(r, 10));

    await prisma.aIChatMessage.create({
      data: { 
        userId: TEST_USER_ID, 
        role: 'bot', 
        content: botReply, 
        metadata: { isTest: true, category: 'real_estate', hasMarketContext: ctx.hasMarketData } as any 
      }
    });

    const savedMsgs = await prisma.aIChatMessage.findMany({
      where: { userId: TEST_USER_ID, metadata: { path: ['isTest'], equals: true } },
      orderBy: { createdAt: 'desc' },
      take: 2
    });

    assert(savedMsgs.length >= 2, 'Lưu 2 tin nhắn thành công');
    
    if (savedMsgs.length >= 2) {
      const matchBot = savedMsgs[0].role === 'bot' && savedMsgs[0].content === botReply;
      const matchUser = savedMsgs[1].role === 'user' && savedMsgs[1].content === userMsg;
      
      assert(matchBot, 'Tin bot lưu chính xác');
      assert(matchUser, 'Tin user lưu chính xác');

      if (!matchBot || !matchUser) {
        console.log('   Expected User:', userMsg);
        console.log('   Expected Bot:', botReply);
        console.log('   Found [0]:', savedMsgs[0].role, savedMsgs[0].content);
        console.log('   Found [1]:', savedMsgs[1].role, savedMsgs[1].content);
      }
    }

    // 🔍 4. Test Quota Check
    console.log('\n--- 4. Kiểm tra giới hạn Quota (50 msg/ngày) ---');
    const quota = await checkDailyQuota(TEST_USER_ID);
    console.log(`   (Hiện tại user đã dùng: ${quota.used}/${quota.limit})`);
    assert(quota.allowed === (quota.used < quota.limit), 'Quota check logic hoạt động');

    console.log('\n--- 📊 TỔNG KẾT ---');
    console.log(`Kết quả: ${successCount}/${totalCount} tests passed.`);
    
    if (successCount === totalCount) {
      console.log('✨ HOÀN TẤT: Phase 06 hoạt động ĐÚNG THIẾT KẾ!');
    } else {
      console.log('⚠️ CẢNH BÁO: Có bước kiểm tra thất bại, vui lòng check lại code.');
    }

  } catch (error) {
    console.error('❌ Lỗi trong quá trình test:', error);
  } finally {
    process.exit(0);
  }
}

testPhase06();
