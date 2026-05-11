import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    try {
        const password = 'password123';
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        await prisma.admin.update({
            where: { email: 'admin@goa.city' },
            data: { password_hash: hash }
        });

        console.log('Admin password updated successfully!');
        console.log('Email: admin@goa.city');
        console.log('Password: password123');

    } catch (e: any) {
        console.error('Error updating admin password:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
