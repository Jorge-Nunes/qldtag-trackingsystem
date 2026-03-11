import prisma from '../config/database.js';

export const traccarConfigRepository = {
  async find() {
    return prisma.traccarConfig.findFirst();
  },

  async create(data) {
    return prisma.traccarConfig.create({ data });
  },

  async update(id, data) {
    return prisma.traccarConfig.update({
      where: { id },
      data
    });
  },

  async upsert(data) {
    const existing = await this.find();
    if (existing) {
      return this.update(existing.id, data);
    }
    return this.create(data);
  }
};

export const apiConfigRepository = {
  async find() {
    return prisma.apiConfig.findFirst();
  },

  async create(data) {
    return prisma.apiConfig.create({ data });
  },

  async update(id, data) {
    return prisma.apiConfig.update({
      where: { id },
      data
    });
  },

  async upsert(data) {
    const existing = await this.find();
    if (existing) {
      return this.update(existing.id, data);
    }
    return this.create(data);
  },

  async updateLastSync(id) {
    return prisma.apiConfig.update({
      where: { id },
      data: { lastSyncAt: new Date() }
    });
  }
};

export default { traccarConfigRepository, apiConfigRepository };
