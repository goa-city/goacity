import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const userId = 1; // Assuming 1 exists
    const user = await prisma.member.findUnique({
        where: { id: userId },
        include: { streams: true }
    });
    console.log("User streams:", user?.streams);
    
    if (user && user.streams.length > 0) {
        const streamIds = user.streams.map((s: any) => s.stream_id);
        const peers = await prisma.member.findMany({
            where: {
                id: { not: userId },
                streams: {
                    some: {
                        stream_id: { in: streamIds }
                    }
                }
            },
            select: { id: true, first_name: true }
        });
        console.log("Peers:", peers);
    }
}
main();
