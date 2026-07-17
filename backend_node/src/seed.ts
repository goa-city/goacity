import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create City 1
  await prisma.city.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'Goa',
      slug: 'goa'
    }
  });

  // Create Admin
  const passwordHash = await bcrypt.hash('admin123', 10);
  await prisma.admin.upsert({
    where: { email: 'superadmin@goa.city' },
    update: {},
    create: {
      full_name: 'Admin',
      email: 'superadmin@goa.city',
      password_hash: passwordHash,
      role: 'admin',
      is_super_admin: true,
      city_id: 1
    }
  });

  console.log('Seeded City 1 and Admin: superadmin@goa.city / admin123');

  // Seed default Resource Categories
  const defaultCategories = ['Community', 'Awards', 'Event', 'Design', 'Interviews'];
  for (const cat of defaultCategories) {
    await prisma.resourceCategory.upsert({
      where: { name: cat },
      update: {},
      create: { name: cat }
    });
  }
  console.log('Seeded default resource categories:', defaultCategories);
}

main().catch(console.error).finally(() => prisma.$disconnect());
