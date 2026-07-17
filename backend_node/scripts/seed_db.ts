import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('--- Database Seeding Started ---');

        // 1. Create Default City (Goa)
        let city = await prisma.city.findUnique({ where: { slug: 'goa' } });
        if (!city) {
            city = await prisma.city.create({
                data: {
                    name: 'Goa',
                    slug: 'goa',
                    domain: 'localhost',
                    timezone: 'Asia/Kolkata',
                    theme_config: {}
                }
            });
            console.log('✅ Default city "Goa" created.');
        } else {
            console.log('ℹ️ Default city "Goa" already exists.');
        }

        // 2. Create Default Admin
        const adminEmail = 'superadmin@goa.city';
        let admin = await prisma.admin.findUnique({ where: { email: adminEmail } });
        if (!admin) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            admin = await prisma.admin.create({
                data: {
                    full_name: 'System Admin',
                    email: adminEmail,
                    password_hash: hashedPassword,
                    role: 'admin',
                    is_super_admin: true,
                    city_id: city.id
                }
            });
            console.log('✅ Default admin "superadmin@goa.city" created (password: admin123).');
        } else {
            console.log('ℹ️ Default admin "superadmin@goa.city" already exists.');
        }

        console.log('--- Database Seeding Completed ---');
    } catch (error: any) {
        console.error('❌ Seeding failed:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
