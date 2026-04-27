import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const emailTemplates = await prisma.emailTemplate.findMany();
  console.log('--- Email Templates ---');
  console.table(emailTemplates.map(t => ({ id: t.id, title: t.title })));

  const whatsappTemplates = await prisma.whatsAppTemplate.findMany();
  console.log('\n--- WhatsApp Templates ---');
  console.table(whatsappTemplates.map(t => ({ id: t.id, title: t.title })));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
