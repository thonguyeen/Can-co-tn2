const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const email = 'test@admin.com';
  console.log(`Checking user: ${email}`);
  
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.log("User not found!");
    return;
  }
  console.log("User:", user.id);
  
  const profile = await prisma.profile.findUnique({ where: { id: user.id } });
  console.log("Profile:", profile ? "EXISTS" : "MISSING");
  
  const stat = await prisma.userStat.findUnique({ where: { userId: user.id } });
  console.log("UserStat:", stat ? "EXISTS" : "MISSING", stat);
  
  await prisma.$disconnect();
}
check();
