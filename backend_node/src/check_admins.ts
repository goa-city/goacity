import prisma from './lib/prisma.js';

async function main() {
    try {
        const adminCount = await prisma.admin.count();
        console.log('Admin count:', adminCount);
        
        const memberAdminCount = await prisma.member.count({ where: { role: 'admin' } });
        console.log('Member Admin count:', memberAdminCount);

        if (adminCount > 0) {
            const admins = await prisma.admin.findMany({ take: 5 });
            console.log('Admins (minus passwords):', JSON.stringify(admins.map(a => ({...a, password_hash: 'HIDDEN'})), null, 2));
        }

        if (memberAdminCount > 0) {
            const memberAdmins = await prisma.member.findMany({ where: { role: 'admin' }, take: 5 });
            console.log('Member Admins:', JSON.stringify(memberAdmins, null, 2));
        }
    } catch (e: any) {
        console.error('Error:', e.message);
    } finally {
        process.exit(0);
    }
}
main();
