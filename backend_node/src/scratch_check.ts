import prisma from './lib/prisma.js';

async function main() {
    const streams = await prisma.stream.findMany();
    console.log('STREAMS IN DB:', streams);
}

main().catch(console.error);
