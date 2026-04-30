import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function cleanup() {
    console.log('Cleaning up orphaned resources...');
    const result = await prisma.$executeRaw`DELETE FROM resources WHERE submitted_by NOT IN (SELECT id FROM members)`;
    console.log(`Deleted ${result} orphaned resources.`);
    await prisma.$disconnect();
}

cleanup().catch(e => {
    console.error(e);
    process.exit(1);
});
