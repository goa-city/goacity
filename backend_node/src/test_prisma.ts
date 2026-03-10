import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const city = await prisma.city.findFirst();
    console.log('City found:', city);
}
main().catch(console.error).finally(() => prisma.$disconnect());
