import deviceService from '../services/deviceService.js';

const normalizeDevice = (device) => {
  if (!device) return device;
  const lastUpdate = device.positions?.[0]?.timestamp || device.updatedAt;
  return {
    ...device,
    lastUpdate: lastUpdate ? new Date(lastUpdate).toISOString() : null,
    updatedAt: device.updatedAt ? new Date(device.updatedAt).toISOString() : null,
    createdAt: device.createdAt ? new Date(device.createdAt).toISOString() : null
  };
};

export const deviceController = {
  async getAll(req, res, next) {
    try {
      const devices = await deviceService.getAll();
      res.json(devices.map(normalizeDevice));
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const device = await deviceService.getById(req.params.id);
      res.json(normalizeDevice(device));
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const device = await deviceService.create(req.body);
      res.status(201).json(normalizeDevice(device));
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const device = await deviceService.update(req.params.id, req.body);
      res.json(normalizeDevice(device));
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      await deviceService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  async link(req, res, next) {
    try {
      const { traccarDeviceId } = req.body;
      const device = await deviceService.link(req.params.id, traccarDeviceId);
      res.json(normalizeDevice(device));
    } catch (error) {
      next(error);
    }
  },

  async unlink(req, res, next) {
    try {
      const device = await deviceService.unlink(req.params.id);
      res.json(normalizeDevice(device));
    } catch (error) {
      next(error);
    }
  },

  async getStats(req, res, next) {
    try {
      const stats = await deviceService.getStats();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }
};

export default deviceController;
