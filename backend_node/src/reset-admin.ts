import prisma from './lib/prisma.js';
import bcrypt from 'bcryptjs';

async function reset() {
    const email = 'admin@goa.city';
    const newPassword = 'NewSecurePassword123!'; // User should change this
    const hash = await bcrypt.hash(newPassword, 10);

    try {
        const admin = await prisma.admin.update({
            where: { email },
            data: { password_hash: hash }
        });
        console.log(`Password reset successful for ${email}`);
        console.log(`New password is: ${newPassword}`);
    } catch (error) {
        console.error('Reset failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

reset();
