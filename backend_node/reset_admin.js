import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@goa.city';
  const newPassword = 'admin'; // Keeping it simple for the user as requested previously or just use a known one
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(newPassword, salt);

  console.log(`Setting password for ${email} to "${newPassword}"`);
  
  const admin = await prisma.admin.update({
    where: { email },
    data: { password_hash: hash }
  });

  console.log('Admin password updated successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
