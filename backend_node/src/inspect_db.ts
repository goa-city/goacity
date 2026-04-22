import prisma from './lib/prisma.js';

async function main() {
    try {
        const columns = await (prisma as any).$queryRaw`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'admins';
        `;
        console.log('Admins columns:', JSON.stringify(columns, null, 2));

        const cityCount = await prisma.city.count();
        console.log('City count:', cityCount);
        
        const firstCity = await prisma.city.findFirst();
        console.log('First city:', JSON.stringify(firstCity, null, 2));
        
    } catch (e: any) {
        console.error('Error:', e.message);
    } finally {
        process.exit(0);
    }
}
main();
