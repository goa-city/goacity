import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    console.log(await prisma.$queryRaw`SELECT * FROM meeting_responses`);
}
main().catch(console.error).finally(() => prisma.$disconnect());
