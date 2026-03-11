import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(utc);
dayjs.extend(timezone);

import deviceRepository from '../repositories/deviceRepository.js';
import positionRepository from '../repositories/positionRepository.js';

export const positionService = {
  async getAll(deviceId, options = {}) {
    return positionRepository.findAll(deviceId, options);
  },

  async getByDevice(deviceId, limit = 100) {
    return positionRepository.findByDeviceId(deviceId, limit);
  },

  async getById(id) {
    return positionRepository.findById(id);
  },

  async create(data) {
    const exists = await positionRepository.existsWithSameCoords(
      data.deviceId,
      data.latitude,
      data.longitude,
      data.timestamp
    );

    if (exists) {
      return null;
    }

    const position = await positionRepository.create(data);
    
    await deviceRepository.updateLastPosition(data.deviceId, position.id);
    
    await this.updateDeviceStatus(data.deviceId);

    return position;
  },

  async createFromExternal(externalData) {
    const { deviceId, latitude, longitude, accuracy } = externalData;
    
    const device = await deviceRepository.findByDeviceId(deviceId);
    
    if (!device) {
      return { skipped: true, reason: 'device_not_registered' };
    }

    const exists = await positionRepository.existsWithSameCoords(
      device.id,
      parseFloat(latitude),
      parseFloat(longitude),
      new Date()
    );

    if (exists) {
      return { skipped: true, reason: 'duplicate' };
    }

    const position = await positionRepository.create({
      deviceId: device.id,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      accuracy: accuracy ? parseFloat(accuracy) : null,
      timestamp: new Date()
    });

    await deviceRepository.updateLastPosition(device.id, position.id);
    
    await this.updateDeviceStatus(device.id);

    return { inserted: true, position };
  },

  async getHistory(deviceId, startDate, endDate) {
    return positionRepository.findInTimeRange(deviceId, startDate, endDate);
  },

  async getLatestPositions() {
    const devices = await deviceRepository.findAll();
    
    const positions = [];
    for (const device of devices) {
      if (device.positions && device.positions.length > 0) {
        positions.push({
          ...device.positions[0],
          device: {
            id: device.id,
            deviceId: device.deviceId,
            name: device.name,
            status: device.status
          }
        });
      }
    }

    return positions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  },

  async updateDeviceStatus(deviceId) {
    const device = await deviceRepository.findById(deviceId);
    if (!device) return;

    const latestPosition = await positionRepository.findLatestByDevice(deviceId);
    
    if (!latestPosition) {
      await deviceRepository.updateStatus(deviceId, 'offline');
      return;
    }

    const now = new Date();
    const positionTime = new Date(latestPosition.timestamp);
    const diffMinutes = (now - positionTime) / (1000 * 60);

    const newStatus = diffMinutes <= 60 ? 'online' : 'offline';
    
    if (device.status !== newStatus) {
      await deviceRepository.updateStatus(deviceId, newStatus);
    }
  },

  async checkAllDevicesStatus() {
    const devices = await deviceRepository.findAll();
    
    for (const device of devices) {
      await this.updateDeviceStatus(device.id);
    }
  }
};

export default positionService;
