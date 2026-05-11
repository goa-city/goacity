import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('--- Database Admin Diagnostic ---');
        const count = await prisma.admin.count();
        console.log('Total admins:', count);

        if (count > 0) {
            const admins = await prisma.admin.findMany();
            console.log('Admins found:', admins.length);
            admins.forEach(a => {
                console.log(`- ${a.email} (${a.role})`);
            });
        }

        const membersWithAdminRole = await prisma.member.count({ where: { role: 'admin' } });
        console.log('Members with role admin in Member table:', membersWithAdminRole);

        if (membersWithAdminRole > 0) {
            const members = await prisma.member.findMany({ where: { role: 'admin' } });
            members.forEach(m => {
                console.log(`- Member Admin: ${m.email} (${m.role})`);
            });
        }

    } catch (e: any) {
        console.error('CRASH:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
