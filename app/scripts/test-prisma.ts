import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import fs from 'fs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

const results: string[] = [];
function log(msg: string) { results.push(msg); console.log(msg); }

async function main() {
  // TEST 1
  try {
    await prisma.$queryRaw`SELECT 1 as connected`;
    log('TEST1_CONNECT: PASS');
  } catch (e: any) {
    log('TEST1_CONNECT: FAIL - ' + e.message);
    fs.writeFileSync('scripts/test-output.txt', results.join('\n'));
    process.exit(1);
  }

  // TEST 2
  const testEmail = `test-${Date.now()}@example.com`;
  const testId = crypto.randomUUID();
  try {
    const hash = await bcrypt.hash('Test1234!', 10);
    const user = await prisma.user.create({
      data: {
        id: testId, email: testEmail, name: 'Test User',
        passwordHash: hash,
        profile: { create: { displayName: 'Test User' } }
      },
    });
    log('TEST2_CREATE: PASS - id=' + user.id);
  } catch (e: any) {
    log('TEST2_CREATE: FAIL - ' + e.message);
  }

  // TEST 3
  try {
    const found = await prisma.user.findUnique({ where: { email: testEmail }, include: { profile: true } });
    log('TEST3_READ: ' + (found ? 'PASS' : 'FAIL') + ' - email=' + found?.email + ' profile=' + found?.profile?.displayName);
  } catch (e: any) {
    log('TEST3_READ: FAIL - ' + e.message);
  }

  // TEST 4
  try {
    await prisma.profile.delete({ where: { id: testId } });
    await prisma.user.delete({ where: { id: testId } });
    log('TEST4_CLEANUP: PASS');
  } catch (e: any) {
    log('TEST4_CLEANUP: FAIL - ' + e.message);
  }

  await prisma.$disconnect();
  log('ALL_DONE');
  fs.writeFileSync('scripts/test-output.txt', results.join('\n'));
}

main();
