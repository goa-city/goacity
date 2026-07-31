import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const form = await prisma.forms.findUnique({
    where: { id: 19 },
    include: {
      fields: true
    }
  });
  console.log('Form:', JSON.stringify(form, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
