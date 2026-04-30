import prisma from '../lib/prisma.js';
import { generateUniqueSlug } from '../lib/utils.js';

async function migrate() {
    console.log('Starting slug migration...');

    // 1. Migrate Meetings
    const meetings = await (prisma as any).meetings.findMany({ 
        where: { OR: [{ slug: null }, { slug: '' }] } 
    });
    console.log(`Found ${meetings.length} meetings without slugs.`);
    for (const m of meetings) {
        const base = m.title;
        const slug = await generateUniqueSlug(prisma.meetings, base, m.city_id);
        await prisma.meetings.update({ where: { id: m.id }, data: { slug } });
        console.log(`Updated meeting ${m.id}: ${slug}`);
    }

    // 2. Migrate Members
    const members = await (prisma as any).member.findMany({ 
        where: { OR: [{ slug: null }, { slug: '' }] } 
    });
    console.log(`Found ${members.length} members without slugs.`);
    for (const m of members) {
        const base = `${m.first_name}-${m.last_name}`;
        const cityId = (m as any).city_id || 1;
        const slug = await generateUniqueSlug(prisma.member, base, cityId);
        await prisma.member.update({ where: { id: m.id }, data: { slug } });
        console.log(`Updated member ${m.id}: ${slug}`);
    }

    // 3. Migrate Jobs
    const jobs = await (prisma as any).jobs.findMany({ 
        where: { OR: [{ slug: null }, { slug: '' }] } 
    });
    console.log(`Found ${jobs.length} jobs without slugs.`);
    for (const j of jobs) {
        const base = j.title;
        const slug = await generateUniqueSlug(prisma.jobs, base, j.city_id);
        await prisma.jobs.update({ where: { id: j.id }, data: { slug } });
        console.log(`Updated job ${j.id}: ${slug}`);
    }

    console.log('Migration complete!');
}

migrate()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
