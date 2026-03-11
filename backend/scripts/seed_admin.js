import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@qldtag.com';
  const name = 'Admin';
  // Use the password from the user request: admin123
  const password = await bcrypt.hash('admin123', 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name,
      password,
      role: 'ADMIN'
    }
  });

  console.log('Admin user created/updated:', user.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
