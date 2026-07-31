import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
    // 1. Get Marketplace Stream
    const stream = await prisma.stream.findFirst({
        where: { name: 'Marketplace' }
    });
    console.log('Marketplace Stream:', stream);

    // 2. Read members.csv
    const csvPath = path.join(__dirname, '../../members.csv');
    const content = fs.readFileSync(csvPath, 'utf8');
    const lines = content.split('\n').filter(line => line.trim().length > 0);

    console.log(`Read ${lines.length} lines from CSV`);

    let existingEmails = 0;
    let existingPhones = 0;

    for (const line of lines) {
        const parts = line.split(',').map(s => s.trim());
        const first_name = parts[0];
        const last_name = parts[1];
        const phone = parts[2];
        const email = parts[3];
        
        if (email) {
            const matchEmail = await prisma.member.findUnique({
                where: { email }
            });
            if (matchEmail) {
                console.log(`Email already exists: ${email} (${matchEmail.first_name} ${matchEmail.last_name})`);
                existingEmails++;
            }
        }

        if (phone) {
            const matchPhone = await prisma.member.findUnique({
                where: { phone }
            });
            if (matchPhone) {
                console.log(`Phone already exists: ${phone} (${matchPhone.first_name} ${matchPhone.last_name})`);
                existingPhones++;
            }
        }
    }

    console.log(`Summary: ${existingEmails} existing emails, ${existingPhones} existing phones.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
