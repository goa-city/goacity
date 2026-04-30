import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const admins = await prisma.admin.findMany({
        where: { full_name: { contains: 'Stevens', mode: 'insensitive' } }
    });
    console.log('Admins found:', JSON.stringify(admins, null, 2));

    const members = await prisma.member.findMany({
        where: { OR: [
            { first_name: { contains: 'Stevens', mode: 'insensitive' } },
            { email: { contains: 'stevens', mode: 'insensitive' } }
        ]}
    });
    console.log('Members found:', JSON.stringify(members, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
