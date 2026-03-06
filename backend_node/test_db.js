import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const meeting = await prisma.$queryRaw`SELECT * FROM meetings WHERE id = 6`;
    console.log(meeting);
}
main().catch(console.error).finally(() => prisma.$disconnect());
