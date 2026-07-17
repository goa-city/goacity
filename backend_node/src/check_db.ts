import prisma from './lib/prisma.js';

async function check() {
  const admins = await prisma.admin.findMany();
  console.log("Admins in DB:");
  console.log(JSON.stringify(admins, null, 2));
}

check().catch(console.error).finally(() => prisma.$disconnect());
