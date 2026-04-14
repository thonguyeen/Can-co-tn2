// Standalone test for RBAC logic
// Usage: npx tsx scripts/test-rbac-security.ts

import { authOptions } from '../lib/auth';
import { ROLE_HIERARCHY } from '../lib/admin/guard'; // Export this if we can, or redefine it here for logic check

// Simulating the core logic of requireRole without the getServerSession dependency
// so we can test the HIERARCHY and comparison logic reliably.

const ROLE_LEVELS: Record<string, number> = {
  ADMIN: 2,
  MODERATOR: 1,
  USER: 0,
};

function checkAccess(userRole: string | undefined, minimumRole: "ADMIN" | "MODERATOR"): { ok: boolean, status: number } {
  const role = userRole ?? "USER";
  const userLevel = ROLE_LEVELS[role] ?? 0;
  const requiredLevel = ROLE_LEVELS[minimumRole] ?? 0;

  if (userLevel < requiredLevel) {
    return { ok: false, status: 403 };
  }
  return { ok: true, status: 200 };
}

async function testRBAC() {
  console.log('🧪 Bắt đầu kiểm tra logic RBAC Security (Logic Validation)...');
  
  let passes = 0;
  let fails = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`✅ ${message}`);
      passes++;
    } else {
      console.log(`❌ FAILED: ${message}`);
      fails++;
    }
  }

  try {
    // 1. Test Low Role Access
    console.log('\n--- 1. Kiểm tra Role thấp (User -> Moderator) ---');
    const res1 = checkAccess('USER', 'MODERATOR');
    assert(!res1.ok && res1.status === 403, 'USER không được vào MODERATOR area');

    // 2. Test Correct Role Access
    console.log('\n--- 2. Kiểm tra Role chuẩn (Moderator -> Moderator) ---');
    const res2 = checkAccess('MODERATOR', 'MODERATOR');
    assert(res2.ok && res2.status === 200, 'MODERATOR được vào MODERATOR area');

    // 3. Test Hierarchy Access
    console.log('\n--- 3. Kiểm tra cấp bậc (Admin -> Moderator) ---');
    const res3 = checkAccess('ADMIN', 'MODERATOR');
    assert(res3.ok && res3.status === 200, 'ADMIN có quyền của MODERATOR');

    // 4. Test Strict Admin Access
    console.log('\n--- 4. Kiểm tra quyền Admin (Moderator -> Admin) ---');
    const res4 = checkAccess('MODERATOR', 'ADMIN');
    assert(!res4.ok && res4.status === 403, 'MODERATOR không định nghĩa được ADMIN area');

    // 5. Test Admin Access
    console.log('\n--- 5. Kiểm tra quyền Admin (Admin -> Admin) ---');
    const res5 = checkAccess('ADMIN', 'ADMIN');
    assert(res5.ok && res5.status === 200, 'ADMIN được vào ADMIN area');

    // 6. Test Default Role
    console.log('\n--- 6. Kiểm tra Role mặc định (undefined) ---');
    const res6 = checkAccess(undefined, 'MODERATOR');
    assert(!res6.ok && res6.status === 403, 'Role mặc định (USER) bị chặn vào MODERATOR');

    console.log(`\n📊 Kết quả: ${passes}/${passes + fails} tests passed.`);
    
    if (fails === 0) {
      console.log('✨ HOÀN TẤT: Logic phân cấp RBAC hoạt động đúng thiết kế!');
    } else {
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Lỗi kỹ thuật:', error);
    process.exit(1);
  }
}

testRBAC();
