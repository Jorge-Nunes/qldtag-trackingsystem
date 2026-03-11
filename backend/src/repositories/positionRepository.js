import prisma from '../config/database.js';

export const positionRepository = {
  async findAll(deviceId, options = {}) {
    const { limit = 100, offset = 0, startDate, endDate } = options;
    
    const where = {};
    
    if (deviceId) {
      where.deviceId = deviceId;
    }
    
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate);
      if (endDate) where.timestamp.lte = new Date(endDate);
    }

    return prisma.position.findMany({
      where,
      include: {
        device: {
          select: {
            id: true,
            deviceId: true,
            name: true,
            status: true
          }
        }
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset
    });
  },

  async findByDeviceId(deviceId, limit = 100) {
    return prisma.position.findMany({
      where: { deviceId },
      orderBy: { timestamp: 'desc' },
      take: limit
    });
  },

  async findById(id) {
    return prisma.position.findUnique({
      where: { id },
      include: {
        device: true
      }
    });
  },

  async create(data) {
    return prisma.position.create({ data });
  },

  async createMany(dataArray) {
    return prisma.position.createMany({ data: dataArray, skipDuplicates: true });
  },

  async findLatestByDevice(deviceId) {
    return prisma.position.findFirst({
      where: { deviceId },
      orderBy: { timestamp: 'desc' }
    });
  },

  async findLatestByDeviceIdString(deviceIdString) {
    const device = await prisma.device.findUnique({
      where: { deviceId: deviceIdString }
    });
    
    if (!device) return null;
    
    return prisma.position.findFirst({
      where: { deviceId: device.id },
      orderBy: { timestamp: 'desc' }
    });
  },

  async findLastNotSent() {
    return prisma.position.findMany({
      where: { sentToTraccar: false },
      include: {
        device: true
      },
      orderBy: { timestamp: 'asc' },
      take: 100
    });
  },

  async markAsSent(ids) {
    return prisma.position.updateMany({
      where: { id: { in: ids } },
      data: { sentToTraccar: true }
    });
  },

  async count(deviceId) {
    const where = deviceId ? { deviceId } : {};
    return prisma.position.count({ where });
  },

  async findInTimeRange(deviceId, startDate, endDate) {
    return prisma.position.findMany({
      where: {
        deviceId,
        timestamp: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      },
      orderBy: { timestamp: 'asc' }
    });
  },

  async existsWithSameCoords(deviceId, latitude, longitude, timestamp) {
    const existing = await prisma.position.findFirst({
      where: {
        deviceId,
        latitude,
        longitude,
        timestamp: new Date(timestamp)
      }
    });
    return !!existing;
  }
};

export default positionRepository;
