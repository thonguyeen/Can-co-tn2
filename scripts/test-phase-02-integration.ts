// ═══════════════════════════════════════════════════════════════
// Integration Test: Phase 02 Backend Refactor
// Chạy: npx tsx scripts/test-phase-02-integration.ts
// ⚠️ CẦN: .env.local với SUPABASE_SERVICE_ROLE_KEY
// ═══════════════════════════════════════════════════════════════

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load .env.local (try app/ dir first, then parent)
const envPaths = [
  path.resolve(__dirname, '../.env.local'),
  path.resolve(__dirname, '.env.local'),
  path.resolve(__dirname, '../../app/.env.local'),
];
const envPath = envPaths.find(p => fs.existsSync(p)) || envPaths[0];
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const [key, ...vals] = line.split('=');
    if (key && vals.length) {
      process.env[key.trim()] = vals.join('=').trim();
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Thiếu SUPABASE env vars! Kiểm tra .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ─── Test helpers ────────────────────────────────────────────

let passed = 0;
let failed = 0;
let total = 0;
let skipped = 0;

function assert(name: string, condition: boolean, detail?: string) {
  total++;
  if (condition) {
    passed++;
    console.log(`  ✅ ${name}`);
  } else {
    failed++;
    console.log(`  ❌ ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

function skip(name: string, reason: string) {
  total++;
  skipped++;
  console.log(`  ⏭️ ${name} — SKIP: ${reason}`);
}

// Test Bot handle (unique for this test run)
const TEST_HANDLE = `test_bot_${Date.now()}`;
const TEST_SOURCE_URL = `https://test-integration.example.com/${Date.now()}`;

// ─── Cleanup function ────────────────────────────────────────

async function cleanup() {
  console.log('\n🧹 Dọn dẹp test data...');
  
  // Delete test intents
  const { data: deletedIntents } = await supabase
    .from('intents')
    .delete()
    .eq('bot_handle', TEST_HANDLE)
    .select('id');
  console.log(`   Xóa ${deletedIntents?.length || 0} intents`);
  
  // Delete test bot
  const { data: deletedBots } = await supabase
    .from('bots')
    .delete()
    .eq('handle', TEST_HANDLE)
    .select('id');
  console.log(`   Xóa ${deletedBots?.length || 0} bots`);
}

// ─── MAIN TEST SUITE ─────────────────────────────────────────

async function runIntegrationTests() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🧪 PHASE 02 — INTEGRATION TESTS (Supabase thật)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📍 Supabase: ${supabaseUrl}`);
  console.log(`🤖 Test bot: @${TEST_HANDLE}\n`);

  // ═══════════════════════════════════════════════════════════
  // TEST 1: Kiểm tra migration schema
  // ═══════════════════════════════════════════════════════════
  console.log('📋 Test 1: Schema kiểm tra (migration 200 đã chạy?)');

  // Check bots table has envoy columns
  const { data: botsColumns, error: botsErr } = await supabase
    .from('bots')
    .select('is_envoy, daily_quota, posts_today, assigned_province')
    .limit(0);
  
  assert(
    'Bảng bots có cột is_envoy, daily_quota, posts_today',
    !botsErr,
    botsErr?.message,
  );

  // Check intents table has bot columns
  const { data: intentsColumns, error: intentsErr } = await supabase
    .from('intents')
    .select('is_bot, bot_handle, source_url')
    .limit(0);
  
  assert(
    'Bảng intents có cột is_bot, bot_handle, source_url',
    !intentsErr,
    intentsErr?.message,
  );

  // Check crawl_sources table exists
  const { error: crawlErr } = await supabase
    .from('crawl_sources')
    .select('id')
    .limit(0);
  
  assert(
    'Bảng crawl_sources tồn tại',
    !crawlErr,
    crawlErr?.message,
  );

  // ═══════════════════════════════════════════════════════════
  // TEST 2: Tạo test bot (Envoy)
  // ═══════════════════════════════════════════════════════════
  console.log('\n📋 Test 2: Tạo Bot Envoy');

  const { data: botData, error: botInsertErr } = await supabase
    .from('bots')
    .insert({
      handle: TEST_HANDLE,
      name: 'Test Bot Integration',
      bio: 'Bot tạo bởi integration test',
      avatar_url: '/avatars/bot_real_estate.jpg',
      expertise: ['Căn hộ chung cư'],
      personality: 'professional',
      color_accent: '#059669',
      system_prompt: 'Test bot',
      is_active: true,
      // Envoy fields
      is_envoy: true,
      assigned_province: 'Thành phố Hồ Chí Minh',
      assigned_province_code: '79',
      assigned_district: 'Quận 1',
      assigned_district_code: '760',
      daily_quota: 10,
      posts_today: 0,
      assigned_categories: ['real_estate'],
    })
    .select()
    .single();

  assert(
    'Insert bot envoy thành công',
    !botInsertErr && !!botData,
    botInsertErr?.message,
  );

  if (botData) {
    assert('Bot có is_envoy = true', botData.is_envoy === true);
    assert('Bot có daily_quota = 10', botData.daily_quota === 10);
    assert('Bot có posts_today = 0', botData.posts_today === 0);
    assert('Bot có assigned_province', botData.assigned_province === 'Thành phố Hồ Chí Minh');
  }

  // ═══════════════════════════════════════════════════════════
  // TEST 3: saveIntentFromBot — Insert vào intents
  // ═══════════════════════════════════════════════════════════
  console.log('\n📋 Test 3: saveIntentFromBot (Insert intent bởi bot)');

  const { data: intentData, error: intentErr } = await supabase
    .from('intents')
    .insert({
      title: '[TEST] Bán căn hộ 2PN Quận 1',
      type: 'CO',
      raw_text: 'Căn hộ 2 phòng ngủ, 70m2, tầng 10, view sông Sài Gòn. Giá 3.5 tỷ.',
      parsed_data: { test: true },
      category: 'real_estate',
      district: 'Quận 1',
      ward: 'Phường Bến Nghé',
      city: 'Hồ Chí Minh',
      status: 'active',
      // Bot fields
      is_bot: true,
      bot_handle: TEST_HANDLE,
      source_url: TEST_SOURCE_URL,
      user_id: null,
    })
    .select()
    .single();

  assert(
    'Insert intent với is_bot=true thành công',
    !intentErr && !!intentData,
    intentErr?.message,
  );

  if (intentData) {
    assert('Intent có is_bot = true', intentData.is_bot === true);
    assert('Intent có bot_handle', intentData.bot_handle === TEST_HANDLE);
    assert('Intent có user_id = null', intentData.user_id === null);
    assert('Intent có source_url', intentData.source_url === TEST_SOURCE_URL);
    assert('Intent có status = active', intentData.status === 'active');
    assert('Intent có type = CO', intentData.type === 'CO');
  }

  // ═══════════════════════════════════════════════════════════
  // TEST 4: Check constraint — Bot PHẢI có bot_handle
  // ═══════════════════════════════════════════════════════════
  console.log('\n📋 Test 4: Check constraint (chk_bot_intent)');

  const { error: constraintErr } = await supabase
    .from('intents')
    .insert({
      title: '[TEST] Không hợp lệ',
      type: 'CO',
      raw_text: 'Bot mà không có bot_handle',
      is_bot: true,
      bot_handle: null, // Vi phạm constraint
      user_id: null,
    });

  assert(
    'Constraint chặn: is_bot=true nhưng bot_handle=null → REJECT',
    !!constraintErr,
    constraintErr ? '(Đúng — bị reject)' : 'KHÔNG reject! Constraint không hoạt động?',
  );

  // ═══════════════════════════════════════════════════════════
  // TEST 5: checkDuplicate — source_url trùng
  // ═══════════════════════════════════════════════════════════
  console.log('\n📋 Test 5: checkDuplicate (source_url)');

  // URL đã tồn tại
  const { data: dupCheck1 } = await supabase
    .from('intents')
    .select('id')
    .eq('source_url', TEST_SOURCE_URL)
    .limit(1);

  assert(
    'Tìm thấy URL đã tồn tại → duplicate = true',
    (dupCheck1?.length || 0) > 0,
  );

  // URL chưa tồn tại
  const { data: dupCheck2 } = await supabase
    .from('intents')
    .select('id')
    .eq('source_url', 'https://this-url-never-exists-12345.com')
    .limit(1);

  assert(
    'URL chưa có → duplicate = false',
    (dupCheck2?.length || 0) === 0,
  );

  // ═══════════════════════════════════════════════════════════
  // TEST 6: RPC increment_posts_today
  // ═══════════════════════════════════════════════════════════
  console.log('\n📋 Test 6: RPC increment_posts_today');

  // posts_today đang = 0, increment lên 1
  const { error: rpcErr1 } = await supabase.rpc('increment_posts_today', {
    bot_handle_param: TEST_HANDLE,
  });

  assert(
    'RPC increment_posts_today chạy không lỗi',
    !rpcErr1,
    rpcErr1?.message,
  );

  // Check posts_today = 1
  const { data: botAfter1 } = await supabase
    .from('bots')
    .select('posts_today')
    .eq('handle', TEST_HANDLE)
    .single();

  assert(
    'posts_today = 1 sau increment đầu tiên',
    botAfter1?.posts_today === 1,
    `Got: ${botAfter1?.posts_today}`,
  );

  // Increment lần 2
  await supabase.rpc('increment_posts_today', { bot_handle_param: TEST_HANDLE });
  const { data: botAfter2 } = await supabase
    .from('bots')
    .select('posts_today')
    .eq('handle', TEST_HANDLE)
    .single();

  assert(
    'posts_today = 2 sau increment lần hai',
    botAfter2?.posts_today === 2,
    `Got: ${botAfter2?.posts_today}`,
  );

  // ═══════════════════════════════════════════════════════════
  // TEST 7: RPC reset_all_envoy_quota
  // ═══════════════════════════════════════════════════════════
  console.log('\n📋 Test 7: RPC reset_all_envoy_quota');

  const { data: resetResult, error: resetErr } = await supabase.rpc('reset_all_envoy_quota');

  assert(
    'RPC reset_all_envoy_quota chạy không lỗi',
    !resetErr,
    resetErr?.message,
  );

  assert(
    'Reset trả về số bot bị reset (≥ 1)',
    typeof resetResult === 'number' && resetResult >= 1,
    `Got: ${resetResult}`,
  );

  // Check posts_today = 0 sau reset
  const { data: botAfterReset } = await supabase
    .from('bots')
    .select('posts_today')
    .eq('handle', TEST_HANDLE)
    .single();

  assert(
    'posts_today = 0 sau reset',
    botAfterReset?.posts_today === 0,
    `Got: ${botAfterReset?.posts_today}`,
  );

  // ═══════════════════════════════════════════════════════════
  // TEST 8: Quota constraint — daily_quota phải 5-100
  // ═══════════════════════════════════════════════════════════
  console.log('\n📋 Test 8: CHECK constraint daily_quota (5-100)');

  const { error: quotaLowErr } = await supabase
    .from('bots')
    .update({ daily_quota: 3 })
    .eq('handle', TEST_HANDLE);

  assert(
    'Constraint chặn quota = 3 (dưới 5) → REJECT',
    !!quotaLowErr,
    quotaLowErr ? '(Đúng — bị reject)' : 'KHÔNG reject!',
  );

  const { error: quotaHighErr } = await supabase
    .from('bots')
    .update({ daily_quota: 200 })
    .eq('handle', TEST_HANDLE);

  assert(
    'Constraint chặn quota = 200 (trên 100) → REJECT',
    !!quotaHighErr,
    quotaHighErr ? '(Đúng — bị reject)' : 'KHÔNG reject!',
  );

  const { error: quotaOkErr } = await supabase
    .from('bots')
    .update({ daily_quota: 50 })
    .eq('handle', TEST_HANDLE);

  assert(
    'Quota = 50 (hợp lệ) → OK',
    !quotaOkErr,
    quotaOkErr?.message,
  );

  // ═══════════════════════════════════════════════════════════
  // TEST 9: matchBotToRegion — Tìm bot theo khu vực
  // ═══════════════════════════════════════════════════════════
  console.log('\n📋 Test 9: matchBotToRegion');

  // Reset quota trước (đảm bảo bot còn quota)
  await supabase
    .from('bots')
    .update({ posts_today: 0, daily_quota: 10 })
    .eq('handle', TEST_HANDLE);

  // Tìm bot TP.HCM, Quận 1 → phải tìm thấy test bot
  const { data: matchBots1 } = await supabase
    .from('bots')
    .select('handle, daily_quota, posts_today')
    .eq('is_envoy', true)
    .eq('is_active', true)
    .eq('assigned_province', 'Thành phố Hồ Chí Minh')
    .eq('assigned_district', 'Quận 1');

  assert(
    'Tìm bot Q.1 HCM → có kết quả',
    (matchBots1?.length || 0) >= 1,
    `Found: ${matchBots1?.length || 0}`,
  );

  // Tìm bot khu vực không tồn tại
  const { data: matchBots2 } = await supabase
    .from('bots')
    .select('handle')
    .eq('is_envoy', true)
    .eq('is_active', true)
    .eq('assigned_province', 'Tỉnh Không Tồn Tại ABC');

  assert(
    'Tìm bot tỉnh không tồn tại → rỗng',
    (matchBots2?.length || 0) === 0,
  );

  // ═══════════════════════════════════════════════════════════
  // TEST 10: Intent hiện trên Feed (query như GET /api/intents)
  // ═══════════════════════════════════════════════════════════
  console.log('\n📋 Test 10: Bot intent hiện trên Feed');

  const { data: feedIntents, error: feedErr } = await supabase
    .from('intents')
    .select('*, intent_images(*)')
    .or('status.eq.active,is_bot.eq.true')
    .eq('bot_handle', TEST_HANDLE)
    .order('created_at', { ascending: false })
    .limit(5);

  assert(
    'Feed query trả về intent của bot',
    !feedErr && (feedIntents?.length || 0) >= 1,
    feedErr?.message || `Found: ${feedIntents?.length}`,
  );

  if (feedIntents && feedIntents[0]) {
    assert('Feed intent có is_bot=true', feedIntents[0].is_bot === true);
    assert('Feed intent có bot_handle', feedIntents[0].bot_handle === TEST_HANDLE);
  }

  // ═══════════════════════════════════════════════════════════
  // CLEANUP + SUMMARY
  // ═══════════════════════════════════════════════════════════
  await cleanup();

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🧪 KẾT QUẢ: ${passed}/${total} tests passed`);
  if (skipped > 0) console.log(`⏭️ ${skipped} tests skipped`);
  if (failed > 0) {
    console.log(`❌ ${failed} tests FAILED`);
  } else {
    console.log('✅ TẤT CẢ INTEGRATION TESTS ĐỀU PASS!');
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (failed > 0) process.exit(1);
}

// Run
runIntegrationTests().catch((err) => {
  console.error('💥 Lỗi nghiêm trọng:', err);
  cleanup().then(() => process.exit(1));
});
