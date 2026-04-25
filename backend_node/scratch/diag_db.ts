import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const jobsCount = await prisma.$queryRaw`SELECT status, COUNT(*)::int FROM jobs GROUP BY status`;
    console.log('Jobs counts:', jobsCount);
    const jobsTotal = await prisma.jobs.count();
    console.log('Jobs total:', jobsTotal);
    
    const resourcesCount = await prisma.$queryRaw`SELECT status, COUNT(*)::int FROM resources GROUP BY status`;
    console.log('Resources counts:', resourcesCount);
    const resourcesTotal = await prisma.resources.count();
    console.log('Resources total:', resourcesTotal);

    const meetingsCount = await prisma.$queryRaw`SELECT archived, COUNT(*)::int FROM meetings GROUP BY archived`;
    console.log('Meetings counts:', meetingsCount);
    const meetingsTotal = await prisma.meetings.count();
    console.log('Meetings total:', meetingsTotal);
}

main().catch(console.error).finally(() => prisma.$disconnect());
