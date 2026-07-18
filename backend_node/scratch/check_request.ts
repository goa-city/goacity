import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const formsCount = await prisma.forms.count();
    console.log('Forms total count:', formsCount);

    const allForms = await prisma.forms.findMany();
    console.log('Forms:', allForms.map(f => ({ id: f.id, code: f.code, title: f.title })));

    const responsesCount = await prisma.formResponse.count();
    console.log('Form responses total count:', responsesCount);

    const sampleResponses = await prisma.formResponse.findMany({
        take: 10,
        include: { form: true }
    });
    console.log('Sample responses:', sampleResponses.map(r => ({ id: r.id, form_id: r.form_id, form_code: r.form?.code, status: r.status })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
