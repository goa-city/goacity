import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const meetings = await prisma.meetings.findMany({
    take: 5,
    orderBy: { created_at: 'desc' }
  });
  console.log(JSON.stringify(meetings, null, 2));
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
