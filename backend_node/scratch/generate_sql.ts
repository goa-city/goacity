import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

// Slugify helper from utils
function slugify(text: string): string {
    if (!text) return '';
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

async function main() {
    // 1. Fetch existing members to avoid duplicate slugs/emails
    const existingMembers = await prisma.member.findMany({
        where: { city_id: 1 }
    });

    const existingSlugs = new Set(existingMembers.map(m => m.slug).filter(Boolean));
    const existingEmails = new Set(existingMembers.map(m => m.email?.toLowerCase()).filter(Boolean));
    const existingPhones = new Set(existingMembers.map(m => m.phone).filter(Boolean));

    // 2. Read members.csv
    const csvPath = path.join(__dirname, '../../members.csv');
    const content = fs.readFileSync(csvPath, 'utf8');
    const lines = content.split('\n').filter(line => line.trim().length > 0);

    const sqlLines: string[] = [
        '-- SQL migration to import CSV members and assign them to the Marketplace stream (ID: 1)',
        'BEGIN;',
        ''
    ];

    const processedEmails: string[] = [];
    const processedPhones: string[] = [];

    for (const line of lines) {
        const parts = line.split(',').map(s => s.trim());
        const first_name = parts[0];
        const last_name = parts[1] || '';
        const phone = parts[2] || '';
        const email = parts[3] || '';

        // Generate a unique slug
        let baseSlug = slugify(`${first_name}-${last_name}`);
        if (!baseSlug) baseSlug = 'member';
        let slug = baseSlug;
        let counter = 1;
        while (existingSlugs.has(slug)) {
            counter++;
            slug = `${baseSlug}-${counter}`;
        }
        existingSlugs.add(slug);

        // Escape single quotes for SQL
        const escFirst = first_name.replace(/'/g, "''");
        const escLast = last_name.replace(/'/g, "''");
        const escEmail = email ? `'${email.toLowerCase().replace(/'/g, "''")}'` : 'NULL';
        const escPhone = phone ? `'${phone.replace(/'/g, "''")}'` : 'NULL';

        sqlLines.push(`-- Inserting ${first_name} ${last_name}`);
        
        // Build INSERT statement with ON CONFLICT resolution
        if (email && phone) {
            sqlLines.push(
                `INSERT INTO members (first_name, last_name, email, phone, role, is_onboarded, slug, city_id) ` +
                `VALUES ('${escFirst}', '${escLast}', ${escEmail}, ${escPhone}, 'member', 0, '${slug}', 1) ` +
                `ON CONFLICT (email) DO UPDATE SET first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name, phone = EXCLUDED.phone ` +
                `;`
            );
            processedEmails.push(email.toLowerCase());
            processedPhones.push(phone);
        } else if (email) {
            sqlLines.push(
                `INSERT INTO members (first_name, last_name, email, phone, role, is_onboarded, slug, city_id) ` +
                `VALUES ('${escFirst}', '${escLast}', ${escEmail}, ${escPhone}, 'member', 0, '${slug}', 1) ` +
                `ON CONFLICT (email) DO UPDATE SET first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name ` +
                `;`
            );
            processedEmails.push(email.toLowerCase());
        } else if (phone) {
            sqlLines.push(
                `INSERT INTO members (first_name, last_name, email, phone, role, is_onboarded, slug, city_id) ` +
                `VALUES ('${escFirst}', '${escLast}', ${escEmail}, ${escPhone}, 'member', 0, '${slug}', 1) ` +
                `ON CONFLICT (phone) DO UPDATE SET first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name ` +
                `;`
            );
            processedPhones.push(phone);
        }
        sqlLines.push('');
    }

    // Now, associate all these members with the Marketplace stream (ID: 1)
    sqlLines.push('-- Associating newly imported/updated members to Marketplace stream (ID: 1)');
    
    const emailList = processedEmails.map(e => `'${e.replace(/'/g, "''")}'`).join(', ');
    const phoneList = processedPhones.map(p => `'${p.replace(/'/g, "''")}'`).join(', ');

    let selectConditions = [];
    if (emailList) selectConditions.push(`email IN (${emailList})`);
    if (phoneList) selectConditions.push(`phone IN (${phoneList})`);

    sqlLines.push(
        `INSERT INTO stream_members (stream_id, user_id)\n` +
        `SELECT 1, id FROM members\n` +
        `WHERE ${selectConditions.join(' OR ')}\n` +
        `ON CONFLICT (stream_id, user_id) DO NOTHING;`
    );

    sqlLines.push('', 'COMMIT;');

    const outputSqlPath = path.join(__dirname, '../../import_members.sql');
    fs.writeFileSync(outputSqlPath, sqlLines.join('\n'));
    console.log(`Successfully generated SQL file at: ${outputSqlPath}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
