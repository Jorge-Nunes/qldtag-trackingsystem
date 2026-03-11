import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const appConfigRepository = {
  // Always get the first one (we only need one global config)
  getConfig: async () => {
    let config = await prisma.appConfig.findFirst();
    if (!config) {
      config = await prisma.appConfig.create({
        data: {
          appName: 'SyncTAG',
        },
      });
    }
    return config;
  },

  updateConfig: async (data) => {
    const existing = await prisma.appConfig.findFirst();
    if (existing) {
      return prisma.appConfig.update({
        where: { id: existing.id },
        data,
      });
    } else {
      return prisma.appConfig.create({
        data,
      });
    }
  },
};
