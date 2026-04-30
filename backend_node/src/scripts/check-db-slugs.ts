import { basePrisma } from '../lib/prisma.js';

async function check() {
    console.log('Checking database...');
    const result = await basePrisma.$queryRaw`SELECT id, first_name, last_name, slug FROM members LIMIT 5`;
    console.log('Sample Members:', result);
    
    const nullCount = await basePrisma.$queryRaw`SELECT COUNT(*)::int FROM members WHERE slug IS NULL OR slug = ''`;
    console.log('Members with NULL/Empty slug:', nullCount);

    const meetingNullCount = await basePrisma.$queryRaw`SELECT COUNT(*)::int FROM meetings WHERE slug IS NULL OR slug = ''`;
    console.log('Meetings with NULL/Empty slug:', meetingNullCount);

    await basePrisma.$disconnect();
}

check().catch(console.error);
