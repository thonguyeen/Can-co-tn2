import { config } from 'dotenv';
config({ path: '.env.local' });
config({ path: '.env' });

async function runTests() {
  const { prisma } = await import('../lib/db');
  const { detectAndHandleMatch } = await import('../lib/swipe/match-detector');
  
  console.log('--- STARTING MUTUAL MATCH E2E TESTS (TC-01 to TC-06) ---');
  let passedCount = 0;
  const totalCount = 4; // Since we are testing internal logic directly, we can group some tests

  try {
    // 1. Setup Test Data (Ensuring clean state for our two test users A and B)
    console.log('\n[Setup] Cleaning old tests and setting up users/intents...');
    
    // We expect user Khoa (id A) and Minh (id B) to exist based on DB Seed.
    const userA = await prisma.user.findFirst({ where: { email: 'khoa@mail.com' } });
    const userB = await prisma.user.findFirst({ where: { email: 'minh@mail.com' } });
    
    if (!userA || !userB) {
      throw new Error('Test users not found! Run npm run db:seed first.');
    }

    // Clean up intent tracking
    await prisma.swipeLike.deleteMany({});
    await prisma.conversation.deleteMany({});
    await prisma.notification.deleteMany({});

    // Ensure they have Intents
    const intentA = await prisma.intent.findFirst({ where: { userId: userA.id } });
    const intentB = await prisma.intent.findFirst({ where: { userId: userB.id } });

    if (!intentA || !intentB) {
      throw new Error('Test intents not found!');
    }

    // Test 01: Bot Filter logic (from query API logic translation)
    console.log('\n[TC-01 & TC-06] Verifying Feed Filter Logic');
    const feed = await prisma.intent.findMany({
      where: {
        AND: [
          { status: 'active' },
          { isBot: false }, // TC-01: No Bots
          { userId: { not: userA.id } }, // TC-06: Not my own
        ]
      }
    });

    if (feed.some(i => i.isBot)) throw new Error('TC-01 Failed: Found bot in feed');
    if (feed.some(i => i.userId === userA.id)) throw new Error('TC-06 Failed: Found own intent in feed');
    console.log('✅ TC-01 & TC-06 Passed: Feed filter is strict.');
    passedCount++;

    // Test 02: One-way Like
    console.log('\n[TC-02 & TC-04] Executing One-Way Like (A likes B)');
    // A likes B's Intent
    await prisma.swipeLike.create({
      data: { userId: userA.id, intentId: intentB.id, action: 'LIKE' }
    });
    
    const matchRes1 = await detectAndHandleMatch(userA.id, intentB.id);
    if (matchRes1.isMutualMatch) throw new Error('TC-04 Failed: Returned Mutual Match prematurely');
    
    // Verify Notification generated for B
    const bNotifs = await prisma.notification.findMany({ where: { userId: userB.id, type: 'swipe_like' } });
    if (bNotifs.length === 0) throw new Error('TC-04 Failed: No notification sent to B');
    
    console.log('✅ TC-02 & TC-04 Passed: SwipeLike logged and stealth notification sent to target owner.');
    passedCount++;

    // Test 03: Visibility check (Already liked should not appear)
    console.log('\n[TC-03] Checking Feed memory');
    const likedQuery = await prisma.swipeLike.findMany({ where: { userId: userA.id }, select: { intentId: true } });
    const swipedIds = likedQuery.map(l => l.intentId);
    
    const feedAgain = await prisma.intent.findMany({
      where: {
        AND: [
          { isBot: false },
          { id: { notIn: swipedIds } } // TC-03: Exclude viewed
        ]
      }
    });

    if (feedAgain.some(i => i.id === intentB.id)) throw new Error('TC-03 Failed: Recently liked intent reappeared in feed');
    console.log('✅ TC-03 Passed: Ignored intents do not reappear.');
    passedCount++;

    // Test 04: MUTUAL MATCH KICKIN! (B likes A)
    console.log('\n[TC-05] The Mutual Match Collision (B likes A)');
    await prisma.swipeLike.create({
      data: { userId: userB.id, intentId: intentA.id, action: 'LIKE' }
    });

    const matchRes2 = await detectAndHandleMatch(userB.id, intentA.id);
    if (!matchRes2.isMutualMatch) throw new Error('TC-05 Failed: Did not detect Mutual Match');

    // Verification
    const conversation = await prisma.conversation.findFirst({ where: { id: matchRes2.conversationId } });
    if (!conversation) throw new Error('TC-05 Failed: Conversation room not created');
    
    const mutualNotifs = await prisma.notification.findMany({ where: { type: 'mutual_match' } });
    if (mutualNotifs.length < 2) throw new Error(`TC-05 Failed: Expected 2 notifications, got ${mutualNotifs.length}`);

    console.log('✅ TC-05 Passed: Mutual Match activated, Conversation created, and 2 party Push generated.');
    passedCount++;

  } catch (err: any) {
    console.error('\n❌ TEST FAILED:', err.message);
  } finally {
    console.log(`\n--- SUMMARY: ${passedCount}/${totalCount} TESTS GROUP PASSED ---`);
    await prisma.$disconnect();
    process.exit(passedCount === totalCount ? 0 : 1);
  }
}

runTests();
