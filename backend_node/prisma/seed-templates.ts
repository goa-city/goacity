import { PrismaClient } from '@prisma/client';
import { SYSTEM_TEMPLATES } from '../src/config/constants.js';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding system templates...');

  // 1. Email Templates
  const emailTemplates = [
    {
      id: SYSTEM_TEMPLATES.EMAIL.OTP.ID,
      title: SYSTEM_TEMPLATES.EMAIL.OTP.TITLE,
      subject: 'Your OTP Code',
      message: 'Your OTP code is {{otp_code}}. It will expire in 10 minutes.',
      city_id: 1,
    },
    {
      id: SYSTEM_TEMPLATES.EMAIL.MEETING.ID,
      title: SYSTEM_TEMPLATES.EMAIL.MEETING.TITLE,
      subject: 'New Meeting Notification',
      message: 'A new meeting has been scheduled: {{meeting_title}} on {{meeting_date}}.',
      city_id: 1,
    },
  ];

  for (const template of emailTemplates) {
    await prisma.emailTemplate.upsert({
      where: { id: template.id },
      update: template,
      create: template,
    });
    console.log(`Synced email template: ${template.title}`);
  }

  // 2. WhatsApp Templates
  const whatsappTemplates = [
    {
      id: SYSTEM_TEMPLATES.WHATSAPP.DEFAULT.ID,
      title: SYSTEM_TEMPLATES.WHATSAPP.DEFAULT.TITLE,
      content: 'Hello {{name}}, this is a notification from Goa.City.',
      city_id: 1,
    },
  ];

  for (const template of whatsappTemplates) {
    await prisma.whatsAppTemplate.upsert({
      where: { id: template.id },
      update: template,
      create: template,
    });
    console.log(`Synced WhatsApp template: ${template.title}`);
  }

  // Reset sequences in PostgreSQL to prevent duplicate key errors on future inserts
  await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('email_templates', 'id'), coalesce(max(id), 1)) FROM email_templates`;
  await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('whatsapp_templates', 'id'), coalesce(max(id), 1)) FROM whatsapp_templates`;

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
