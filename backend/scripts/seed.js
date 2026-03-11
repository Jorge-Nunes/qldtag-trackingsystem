import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // 1. User
  const adminEmail = 'admin@qldtag.com';
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Admin',
      password: hashedPassword,
      role: 'ADMIN'
    }
  });
  console.log('Admin user seeded');

  // 2. TraccarConfig
  const traccarCount = await prisma.traccarConfig.count();
  if (traccarCount === 0) {
    await prisma.traccarConfig.create({
      data: {
        url: 'http://localhost',
        port: 5055,
        enabled: false
      }
    });
    console.log('TraccarConfig initialized');
  }

  // 3. ApiConfig
  const apiCount = await prisma.apiConfig.count();
  if (apiCount === 0) {
    await prisma.apiConfig.create({
      data: {
        name: 'Default API',
        baseUrl: 'http://localhost',
        enabled: false,
        syncSize: 100
      }
    });
    console.log('ApiConfig initialized');
  }

  // 4. AppConfig
  const appCount = await prisma.appConfig.count();
  if (appCount === 0) {
    await prisma.appConfig.create({
      data: {
        appName: 'SyncTAG'
      }
    });
    console.log('AppConfig initialized');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
