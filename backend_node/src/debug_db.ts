import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    try {
        const count = await prisma.admin.count();
        console.log('Total admins:', count);

        if (count > 0) {
            const admins = await prisma.admin.findMany();
            console.log('Admins found:', admins.length);
            admins.forEach(a => {
                console.log(`- ${a.email} (${a.role}) hash_len: ${a.password_hash?.length}`);
            });
        }

        const membersWithAdminRole = await prisma.member.count({ where: { role: 'admin' } });
        console.log('Members with role admin:', membersWithAdminRole);

    } catch (e: any) {
        console.error('CRASH:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
