import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const jobs = await prisma.jobs.findMany();
    console.log('Jobs found:', jobs.length);
    console.log('Sample job:', jobs[0]);
  } catch (err) {
    console.error('Diagnostic error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
