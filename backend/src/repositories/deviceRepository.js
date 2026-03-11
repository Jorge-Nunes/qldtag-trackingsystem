import prisma from '../config/database.js';

export const deviceRepository = {
  async findAll() {
    return prisma.device.findMany({
      include: {
        positions: {
          orderBy: { timestamp: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  async findById(id) {
    return prisma.device.findUnique({
      where: { id },
      include: {
        positions: {
          orderBy: { timestamp: 'desc' },
          take: 10
        }
      }
    });
  },

  async findByDeviceId(deviceId) {
    return prisma.device.findUnique({
      where: { deviceId }
    });
  },

  async create(data) {
    return prisma.device.create({ data });
  },

  async update(id, data) {
    return prisma.device.update({
      where: { id },
      data
    });
  },

  async delete(id) {
    return prisma.device.delete({ where: { id } });
  },

  async link(id, traccarDeviceId) {
    return prisma.device.update({
      where: { id },
      data: {
        linked: true,
        traccarDeviceId
      }
    });
  },

  async unlink(id) {
    return prisma.device.update({
      where: { id },
      data: {
        linked: false,
        traccarDeviceId: null
      }
    });
  },

  async updateStatus(id, status) {
    return prisma.device.update({
      where: { id },
      data: { status }
    });
  },

  async updateLastPosition(id, positionId) {
    return prisma.device.update({
      where: { id },
      data: { lastPositionId: positionId }
    });
  },

  async getStats() {
    const total = await prisma.device.count();
    const online = await prisma.device.count({ where: { status: 'online' } });
    const offline = await prisma.device.count({ where: { status: 'offline' } });
    const linked = await prisma.device.count({ where: { linked: true } });

    return { total, online, offline, linked };
  },

  async findByStatus(status) {
    return prisma.device.findMany({
      where: { status },
      include: {
        positions: {
          orderBy: { timestamp: 'desc' },
          take: 1
        }
      }
    });
  }
};

export default deviceRepository;
