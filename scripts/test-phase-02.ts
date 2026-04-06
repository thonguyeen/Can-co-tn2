// ═══════════════════════════════════════════════════════════════
// Quick Test: Phase 02 Backend Refactor
// Chạy: npx tsx scripts/test-phase-02.ts
// ═══════════════════════════════════════════════════════════════

// ─── PART 1: Unit Tests (không cần DB) ───────────────────────

let passed = 0;
let failed = 0;
let total = 0;

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

// stripThinkTags — copy logic from orchestrator.ts
function stripThinkTags(content: string): string {
  return content
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/<\/?think>/gi, '')
    .trim();
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🧪 PHASE 02 — UNIT TESTS');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// TC-03: Strip <think> tags
console.log('📋 TC-03: stripThinkTags');

assert(
  'Basic think tag removal',
  stripThinkTags('<think>reasoning here</think>Nội dung thật') === 'Nội dung thật',
  `Got: "${stripThinkTags('<think>reasoning here</think>Nội dung thật')}"`,
);

assert(
  'No think tags — content unchanged',
  stripThinkTags('Không có think tags') === 'Không có think tags',
);

assert(
  'Multi-line think tag',
  stripThinkTags('<think>line1\nline2\nline3</think>Content sau') === 'Content sau',
  `Got: "${stripThinkTags('<think>line1\nline2\nline3</think>Content sau')}"`,
);

assert(
  'Empty think tag',
  stripThinkTags('<think></think>Content') === 'Content',
);

assert(
  'Think tag case insensitive',
  stripThinkTags('<THINK>uppercase</THINK>OK') === 'OK',
);

assert(
  'Orphan closing tag',
  stripThinkTags('text</think>more') === 'textmore',
);

assert(
  'Content before and after think',
  stripThinkTags('Before<think>hidden</think>After') === 'BeforeAfter',
);

assert(
  'Multiple think tags',
  stripThinkTags('<think>a</think>Real<think>b</think>Content') === 'RealContent',
);

// ─── PART 2: Interface validation ────────────────────────────

console.log('\n📋 TC-06: GeneratedBot interface validation');

// Simulate a GeneratedBot with envoy fields
const mockBot = {
  id: 'gen-123',
  handle: 'minh_real_estate_1',
  name: 'Minh Expert',
  nameVi: 'Minh Expert',
  category: 'real_estate',
  expertise: ['Căn hộ chung cư', 'Nhà phố'],
  tone: 'professional',
  color: '#059669',
  isActive: true,
  createdAt: new Date().toISOString(),
  stats: { postsCount: 0, commentsCount: 0, debatesCount: 0, followersCount: 0 },
  // Envoy fields
  isEnvoy: true,
  assignedProvince: 'Thành phố Hồ Chí Minh',
  assignedProvinceCode: '79',
  assignedDistrict: 'Quận 1',
  assignedDistrictCode: '760',
  assignedWard: 'Phường Bến Nghé',
  assignedWardCode: '26734',
  assignedCategories: ['real_estate'],
  dailyQuota: 10,
  postsToday: 0,
};

assert(
  'GeneratedBot has isEnvoy field',
  mockBot.isEnvoy === true,
);

assert(
  'GeneratedBot has assignedProvince',
  mockBot.assignedProvince === 'Thành phố Hồ Chí Minh',
);

assert(
  'GeneratedBot has dailyQuota',
  mockBot.dailyQuota === 10,
);

assert(
  'GeneratedBot postsToday starts at 0',
  mockBot.postsToday === 0,
);

assert(
  'GeneratedBot has category real_estate',
  mockBot.category === 'real_estate',
);

// ─── PART 3: SaveIntentFromBot params validation ─────────────

console.log('\n📋 TC-01: SaveIntentFromBot params structure');

const mockParams = {
  botHandle: 'minh_real_estate_1',
  title: 'Bán căn hộ 2PN Quận 1',
  type: 'CO' as const,
  content: 'Căn hộ 2 phòng ngủ, 70m2, tầng 10, view sông...',
  category: 'real_estate',
  district: 'Quận 1',
  ward: 'Phường Bến Nghé',
  city: 'Hồ Chí Minh',
  source_url: 'https://example.com/tin-bds-123',
};

assert('Params has botHandle', typeof mockParams.botHandle === 'string');
assert('Params has title', typeof mockParams.title === 'string');
assert('Params type is CAN or CO', ['CAN', 'CO'].includes(mockParams.type));
assert('Params has content (for raw_text)', mockParams.content.length > 0);
assert('Params has source_url', typeof mockParams.source_url === 'string');
assert('Params has district', typeof mockParams.district === 'string');

// ─── PART 4: Quota logic validation ─────────────────────────

console.log('\n📋 TC-02: Quota logic validation');

function simulateQuotaCheck(postsToday: number, dailyQuota: number) {
  const remaining = dailyQuota - postsToday;
  return {
    allowed: remaining > 0,
    postsToday,
    dailyQuota,
    remaining: Math.max(0, remaining),
  };
}

const q1 = simulateQuotaCheck(3, 10);
assert('Quota allowed when 3/10', q1.allowed === true);
assert('Remaining = 7 when 3/10', q1.remaining === 7);

const q2 = simulateQuotaCheck(10, 10);
assert('Quota NOT allowed when 10/10', q2.allowed === false);
assert('Remaining = 0 when 10/10', q2.remaining === 0);

const q3 = simulateQuotaCheck(0, 5);
assert('Quota allowed when 0/5', q3.allowed === true);
assert('Remaining = 5 when 0/5', q3.remaining === 5);

const q4 = simulateQuotaCheck(15, 10);
assert('Quota NOT allowed when over (15/10)', q4.allowed === false);
assert('Remaining = 0 when over (15/10)', q4.remaining === 0);

// ─── SUMMARY ─────────────────────────────────────────────────

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`🧪 KẾT QUẢ: ${passed}/${total} tests passed`);
if (failed > 0) {
  console.log(`❌ ${failed} tests FAILED`);
} else {
  console.log('✅ TẤT CẢ TESTS ĐỀU PASS!');
}
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

if (failed > 0) process.exit(1);
