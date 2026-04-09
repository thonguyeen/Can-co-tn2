// Test OpenClaw integration
// Run with: npx ts-node test-openclaw.ts

import {
  getOpenClawClient,
  getSessionManager,
  FACEBOT_BOTS,
  BOT_HANDLES
} from './lib/openclaw';

async function testOpenClaw() {
  console.log('=== FACEBOT + OpenClaw Test ===\n');

  // 1. Check configuration
  console.log('1. Configuration:');
  console.log('   USE_OPENCLAW:', process.env.USE_OPENCLAW || 'not set');
  console.log('   GATEWAY_URL:', process.env.OPENCLAW_GATEWAY_URL || 'ws://127.0.0.1:18789');
  console.log('');

  // 2. List available bots
  console.log('2. Available Bots:');
  BOT_HANDLES.forEach(handle => {
    const bot = FACEBOT_BOTS[handle];
    console.log(`   @${handle}: ${bot.nameVi} (${bot.category})`);
  });
  console.log('');

  // 3. Test connection (only if USE_OPENCLAW=true)
  if (process.env.USE_OPENCLAW === 'true') {
    console.log('3. Testing OpenClaw Gateway connection...');
    try {
      const client = getOpenClawClient();
      await client.connect();
      console.log('   ✓ Connected to Gateway');

      const sessions = await client.listSessions();
      console.log(`   ✓ Found ${sessions.length} sessions`);

      client.disconnect();
      console.log('   ✓ Disconnected');
    } catch (error) {
      console.log('   ✗ Connection failed:', error instanceof Error ? error.message : error);
      console.log('   Make sure OpenClaw Gateway is running:');
      console.log('     openclaw gateway --port 18789 --verbose');
    }
  } else {
    console.log('3. OpenClaw disabled (set USE_OPENCLAW=true to test connection)');
  }

  console.log('\n=== Test Complete ===');
}

testOpenClaw().catch(console.error);
