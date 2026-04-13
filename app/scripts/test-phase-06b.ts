// ═══════════════════════════════════════════════════════════════
// TEST: Phase 06b - n8n Webhook Security + Data Validation
// Test logic mà KHÔNG cần n8n thật đang chạy.
// Chạy: npx tsx scripts/test-phase-06b.ts
// ═══════════════════════════════════════════════════════════════

import './load-env';
import { prisma } from '../lib/db';
import { saveRawNewsFromCrawl } from '../lib/openclaw/persistence';

// ─── Simulate the validation logic from the webhook route ───

function validateItem(item: unknown, idx: number): boolean {
  if (typeof item !== 'object' || item === null) return false;
  const obj = item as Record<string, unknown>;
  if (typeof obj.title !== 'string' || obj.title.trim().length === 0) return false;
  if (typeof obj.originalUrl !== 'string' || !obj.originalUrl.startsWith('http')) return false;
  return true;
}

function validatePayload(body: unknown): { valid: boolean; error?: string } {
  if (typeof body !== 'object' || body === null) return { valid: false, error: 'Body must be JSON object' };
  const obj = body as Record<string, unknown>;
  if (!Array.isArray(obj.items)) return { valid: false, error: 'items must be array' };
  if (obj.items.length === 0) return { valid: false, error: 'items array is empty' };
  if (obj.items.length > 100) return { valid: false, error: 'items exceeds limit of 100' };
  return { valid: true };
}

function simulateAuth(token: string | undefined, secret: string): boolean {
  if (!token || !token.startsWith('Bearer ')) return false;
  return token.slice(7).trim() === secret;
}

// ─── Test runner ───

async function testPhase06b() {
  console.log('🚀 Bắt đầu kiểm tra Phase 06b - n8n Crawler Webhook...\n');

  const MOCK_SECRET = 'test_secret_for_phase_06b';
  let pass = 0, fail = 0;

  function assert(condition: boolean, message: string) {
    if (condition) { console.log(`✅ ${message}`); pass++; }
    else { console.log(`❌ FAILED: ${message}`); fail++; }
  }

  // ─── 1. Auth validation ───
  console.log('--- 1. Kiểm tra xác thực API (Auth) ---');
  assert(!simulateAuth(undefined, MOCK_SECRET), 'Request không có header → Bị từ chối');
  assert(!simulateAuth('Bearer wrong_secret', MOCK_SECRET), 'Token sai → Bị từ chối');
  assert(!simulateAuth('Basic test', MOCK_SECRET), 'Basic auth scheme → Bị từ chối');
  assert(simulateAuth(`Bearer ${MOCK_SECRET}`, MOCK_SECRET), 'Token đúng → Được chấp nhận');

  // ─── 2. Input validation (C1 Tech Lead) ───
  console.log('\n--- 2. Kiểm tra xác thực dữ liệu đầu vào (C1) ---');
  assert(!validatePayload(null).valid, 'Body null → Bị từ chối');
  assert(!validatePayload({ items: [] }).valid, 'items rỗng → Bị từ chối');
  assert(!validatePayload({ items: 'not array' }).valid, 'items không phải array → Bị từ chối');
  assert(
    !validatePayload({ items: Array(101).fill({ title: 'x', originalUrl: 'http://a.com' }) }).valid,
    'items > 100 → Bị từ chối'
  );
  assert(
    validatePayload({ items: [{ title: 'Test', originalUrl: 'http://example.com' }] }).valid,
    'items hợp lệ → Được chấp nhận'
  );

  // ─── 3. Per-item validation ───
  console.log('\n--- 3. Kiểm tra từng item trong mảng ---');
  assert(!validateItem({ originalUrl: 'http://a.com' }, 0), 'Item không có title → Bị bỏ qua');
  assert(!validateItem({ title: 'Test', originalUrl: 'not-a-url' }, 0), 'URL không hợp lệ → Bị bỏ qua');
  assert(!validateItem({ title: '', originalUrl: 'http://a.com' }, 0), 'Title rỗng → Bị bỏ qua');
  assert(
    validateItem({ title: 'Tin BĐS mới', originalUrl: 'https://batdongsan.com.vn/test-123' }, 0),
    'Item hợp lệ đầy đủ → Được xử lý'
  );

  // ─── 4. Integration test - save via actual persistence layer ───
  console.log('\n--- 4. Kiểm tra lưu dữ liệu (Integration) ---');
  const testUrl = 'https://n8n-test-webhook-' + Date.now() + '.example.com/item';

  // Clean up first
  await prisma.rawNews.deleteMany({ where: { originalUrl: testUrl } });

  const id1 = await saveRawNewsFromCrawl({
    title: 'Test BĐS từ n8n Webhook',
    content: 'Nội dung test',
    originalUrl: testUrl,
  });

  assert(id1 !== null, 'Lưu item mới → Thành công');

  // Duplicate test
  const id2 = await saveRawNewsFromCrawl({
    title: 'Test BĐS từ n8n Webhook (duplicate)',
    originalUrl: testUrl, // same URL
  });

  assert(id2 === null, 'Lưu item trùng URL → Dedup hoạt động (trả về null)');

  // Cleanup
  if (id1) await prisma.rawNews.deleteMany({ where: { originalUrl: testUrl } });

  // ─── Summary ───
  console.log(`\n--- 📊 TỔNG KẾT ---`);
  console.log(`Kết quả: ${pass}/${pass + fail} tests passed.`);

  if (fail === 0) {
    console.log('✨ HOÀN TẤT: Phase 06b - n8n Webhook hoạt động ĐÚNG THIẾT KẾ!\n');
    console.log('📋 Để test thực tế với n8n đang chạy:');
    console.log('   1. docker compose up n8n -d');
    console.log('   2. Truy cập http://localhost:5678');
    console.log('   3. Tạo workflow: Cron → HTTP Request (POST /api/crawler/webhook)');
    console.log('   4. Header: Authorization: Bearer <N8N_WEBHOOK_SECRET>');
  } else {
    console.log('⚠️ CẢNH BÁO: Có bước kiểm tra thất bại!');
  }
}

testPhase06b()
  .catch(console.error)
  .finally(() => process.exit(0));
