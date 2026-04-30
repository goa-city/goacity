import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const forms = await prisma.forms.findMany({
    select: { id: true, code: true, title: true, is_active: true }
  });
  console.log(JSON.stringify(forms, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
