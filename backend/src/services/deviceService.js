import deviceRepository from '../repositories/deviceRepository.js';
import positionRepository from '../repositories/positionRepository.js';

export const deviceService = {
  async getAll() {
    return deviceRepository.findAll();
  },

  async getById(id) {
    const device = await deviceRepository.findById(id);
    if (!device) {
      throw { name: 'ValidationError', message: 'Device não encontrado' };
    }
    return device;
  },

  async create(data) {
    const existing = await deviceRepository.findByDeviceId(data.deviceId);
    if (existing) {
      throw { name: 'ValidationError', message: 'Device ID já cadastrado' };
    }

    return deviceRepository.create(data);
  },

  async update(id, data) {
    const device = await deviceRepository.findById(id);
    if (!device) {
      throw { name: 'ValidationError', message: 'Device não encontrado' };
    }

    return deviceRepository.update(id, data);
  },

  async delete(id) {
    const device = await deviceRepository.findById(id);
    if (!device) {
      throw { name: 'ValidationError', message: 'Device não encontrado' };
    }

    return deviceRepository.delete(id);
  },

  async link(id, traccarDeviceId) {
    const device = await deviceRepository.findById(id);
    if (!device) {
      throw { name: 'ValidationError', message: 'Device não encontrado' };
    }

    return deviceRepository.link(id, traccarDeviceId);
  },

  async unlink(id) {
    const device = await deviceRepository.findById(id);
    if (!device) {
      throw { name: 'ValidationError', message: 'Device não encontrado' };
    }

    return deviceRepository.unlink(id);
  },

  async updateDeviceStatus(deviceId) {
    const device = await deviceRepository.findByDeviceId(deviceId);
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

  async getStats() {
    return deviceRepository.getStats();
  }
};

export default deviceService;
