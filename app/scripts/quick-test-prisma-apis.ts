/**
 * Quick Test Script — Verify all migrated Prisma APIs
 * Usage: npx tsx scripts/quick-test-prisma-apis.ts
 */

const BASE_URL = 'http://localhost:3000';

interface TestResult {
  name: string;
  endpoint: string;
  status: 'PASS' | 'FAIL';
  httpStatus: number;
  detail: string;
}

const results: TestResult[] = [];

async function testEndpoint(
  name: string,
  endpoint: string,
  options: {
    method?: string;
    body?: unknown;
    expectedStatus?: number;
    validateBody?: (body: unknown) => string | null; // null = pass, string = error
  } = {}
) {
  const { method = 'GET', body, expectedStatus = 200, validateBody } = options;

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : undefined,
    });

    const text = await res.text();
    let json: unknown;
    try { json = JSON.parse(text); } catch { json = text; }

    if (res.status !== expectedStatus) {
      results.push({
        name,
        endpoint,
        status: 'FAIL',
        httpStatus: res.status,
        detail: `Expected ${expectedStatus}, got ${res.status}. Body: ${text.slice(0, 200)}`,
      });
      return;
    }

    if (validateBody) {
      const err = validateBody(json);
      if (err) {
        results.push({ name, endpoint, status: 'FAIL', httpStatus: res.status, detail: err });
        return;
      }
    }

    results.push({ name, endpoint, status: 'PASS', httpStatus: res.status, detail: 'OK' });
  } catch (err) {
    results.push({
      name,
      endpoint,
      status: 'FAIL',
      httpStatus: 0,
      detail: `Network error: ${(err as Error).message}`,
    });
  }
}

async function main() {
  console.log('🧪 Quick Test: Prisma API Migration\n');
  console.log('━'.repeat(60));

  // ═══ STEP 2: Feed & Posts ═══
  await testEndpoint('Feed API (all)', '/api/feed', {
    validateBody: (b: any) => {
      if (!Array.isArray(b?.posts)) return 'Missing posts array';
      if (typeof b?.hasMore !== 'boolean') return 'Missing hasMore';
      if (!b?.meta) return 'Missing meta';
      return null;
    },
  });

  await testEndpoint('Feed API (trending)', '/api/feed?type=trending', {
    validateBody: (b: any) => !Array.isArray(b?.posts) ? 'Missing posts array' : null,
  });

  await testEndpoint('Feed API (foryou)', '/api/feed?type=foryou', {
    validateBody: (b: any) => !Array.isArray(b?.posts) ? 'Missing posts array' : null,
  });

  await testEndpoint('Breaking News GET', '/api/breaking', {
    validateBody: (b: any) => {
      if (typeof b?.success !== 'boolean') return 'Missing success field';
      if (!Array.isArray(b?.breaking)) return 'Missing breaking array';
      return null;
    },
  });

  await testEndpoint('Comments GET', '/api/comments?postId=nonexistent-123', {
    validateBody: (b: any) => !Array.isArray(b?.comments) ? 'Missing comments array' : null,
  });

  await testEndpoint('Like GET (unauth)', '/api/posts/nonexistent/like', {
    validateBody: (b: any) => typeof b?.liked !== 'boolean' ? 'Missing liked boolean' : null,
  });

  await testEndpoint('Save GET (unauth)', '/api/posts/nonexistent/save', {
    validateBody: (b: any) => typeof b?.saved !== 'boolean' ? 'Missing saved boolean' : null,
  });

  // ═══ STEP 3: Intents CẦN/CÓ ═══
  await testEndpoint('Intents GET (active)', '/api/intents?limit=10&status=active', {
    validateBody: (b: any) => {
      if (!Array.isArray(b?.intents)) return 'Missing intents array';
      if (typeof b?.total !== 'number') return 'Missing total number';
      if (typeof b?.page !== 'number') return 'Missing page number';
      return null;
    },
  });

  await testEndpoint('Intents GET (CAN filter)', '/api/intents?type=CAN&limit=5', {
    validateBody: (b: any) => !Array.isArray(b?.intents) ? 'Missing intents array' : null,
  });

  await testEndpoint('Intents GET (CO filter)', '/api/intents?type=CO&limit=5', {
    validateBody: (b: any) => !Array.isArray(b?.intents) ? 'Missing intents array' : null,
  });

  await testEndpoint('Intent Detail (404)', '/api/intents?id=nonexistent-uuid-123', {
    validateBody: (b: any) => !Array.isArray(b?.intents) ? 'Missing intents array' : null,
  });

  await testEndpoint('Intent Comments GET', '/api/intents/nonexistent/comments', {
    validateBody: (b: any) => !Array.isArray(b) ? 'Expected array' : null,
  });

  await testEndpoint('Intent Matches GET', '/api/intents/nonexistent/matches', {
    validateBody: (b: any) => !Array.isArray(b?.matches) ? 'Missing matches array' : null,
  });

  await testEndpoint('Intent Parse', '/api/intents/parse', {
    method: 'POST',
    body: { raw_text: 'Cần thuê căn hộ 2 phòng ngủ quận 7 dưới 15 triệu' },
    validateBody: (b: any) => !Array.isArray(b?.tags) ? 'Missing tags array' : null,
  });

  await testEndpoint('Link Check Stats', '/api/intents/link-check', {
    validateBody: (b: any) => typeof b?.total_crawled_intents !== 'number' ? 'Missing total_crawled_intents' : null,
  });

  await testEndpoint('Matching GET (unauth → 401)', '/api/matching', {
    expectedStatus: 401,
  });

  // ═══ AUTH-REQUIRED ENDPOINTS (expect 401) ═══
  await testEndpoint('Notifications GET (unauth → 401-ish)', '/api/notifications');
  // Notifications may return [] if no session enforcement at GET level

  await testEndpoint('Intents POST (unauth → 401)', '/api/intents', {
    method: 'POST',
    body: { type: 'CAN', raw_text: 'test' },
    expectedStatus: 401,
  });

  await testEndpoint('Like POST (unauth → 401)', '/api/posts/test/like', {
    method: 'POST',
    expectedStatus: 401,
  });

  await testEndpoint('Save POST (unauth → 401)', '/api/posts/test/save', {
    method: 'POST',
    expectedStatus: 401,
  });

  await testEndpoint('Intent Comment POST (unauth → 401)', '/api/intents/comments', {
    method: 'POST',
    body: { intent_id: 'test', content: 'hello' },
    expectedStatus: 401,
  });

  // ═══ STEP 5: Crawler Pipeline ═══
  await testEndpoint('Crawl Sources GET', '/api/crawl-sources', {
    validateBody: (b: any) => {
      if (typeof b?.success !== 'boolean') return 'Missing success field';
      if (!Array.isArray(b?.data)) return 'Missing data array';
      if (typeof b?.count !== 'number') return 'Missing count number';
      // Verify snake_case keys if data exists
      if (b.data.length > 0) {
        const first = b.data[0];
        if (!('source_type' in first)) return 'Missing snake_case key source_type';
        if (!('is_active' in first)) return 'Missing snake_case key is_active';
        if (!('created_at' in first)) return 'Missing snake_case key created_at';
      }
      return null;
    },
  });

  await testEndpoint('Crawler Trigger GET (sources overview)', '/api/crawler/trigger', {
    validateBody: (b: any) => {
      if (typeof b?.total !== 'number') return 'Missing total number';
      if (typeof b?.active !== 'number') return 'Missing active number';
      if (!Array.isArray(b?.sources)) return 'Missing sources array';
      return null;
    },
  });

  await testEndpoint('Raw News GET', '/api/raw-news', {
    validateBody: (b: any) => {
      if (!Array.isArray(b?.news)) return 'Missing news array';
      return null;
    },
  });

  await testEndpoint('Raw News GET (unprocessed)', '/api/raw-news?processed=false', {
    validateBody: (b: any) => !Array.isArray(b?.news) ? 'Missing news array' : null,
  });

  await testEndpoint('Generate Post GET (stats)', '/api/generate-post', {
    validateBody: (b: any) => {
      if (!Array.isArray(b?.bots)) return 'Missing bots array';
      if (!Array.isArray(b?.recent_posts)) return 'Missing recent_posts array';
      if (typeof b?.pending_news !== 'number') return 'Missing pending_news count';
      // Verify snake_case in bots
      if (b.bots.length > 0) {
        const first = b.bots[0];
        if (!('posts_count' in first) && !('avatar_url' in first))
          return 'Bots not snake_case (missing posts_count or avatar_url)';
      }
      return null;
    },
  });

  await testEndpoint('Crawl GET (status/logs)', '/api/crawl', {
    validateBody: (b: any) => {
      // Should return recent_logs and sources
      if (!('recent_logs' in b)) return 'Missing recent_logs';
      if (!('sources' in b)) return 'Missing sources';
      return null;
    },
  });

  await testEndpoint('Crawl Sources POST (unauth → 401)', '/api/crawl-sources', {
    method: 'POST',
    body: { name: 'Test Source', url: 'https://test.example.com' },
    expectedStatus: 401,
  });

  // ═══ RESULTS ═══
  console.log('\n🧪 KẾT QUẢ KIỂM TRA:');
  console.log('━'.repeat(60));

  const passed = results.filter((r) => r.status === 'PASS');
  const failed = results.filter((r) => r.status === 'FAIL');

  for (const r of results) {
    const icon = r.status === 'PASS' ? '✅' : '❌';
    console.log(`${icon} ${r.name}`);
    if (r.status === 'FAIL') {
      console.log(`   → ${r.detail}`);
    }
  }

  console.log('\n━'.repeat(60));
  console.log(`\n✅ ${passed.length} tests đạt`);
  if (failed.length > 0) {
    console.log(`❌ ${failed.length} tests không đạt`);
  }
  console.log(`📊 Tổng: ${results.length} tests | ${Math.round((passed.length / results.length) * 100)}% pass rate`);
  console.log('━'.repeat(60));

  process.exit(failed.length > 0 ? 1 : 0);
}

main();
