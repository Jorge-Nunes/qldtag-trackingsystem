import positionService from '../services/positionService.js';

const normalizePosition = (pos) => {
  if (!pos) return pos;
  return {
    ...pos,
    timestamp: pos.timestamp ? new Date(pos.timestamp).toISOString() : null,
    serverTime: pos.serverTime ? new Date(pos.serverTime).toISOString() : null
  };
};

export const positionController = {
  async getAll(req, res, next) {
    try {
      const { deviceId, limit, offset, startDate, endDate } = req.query;
      
      const positions = await positionService.getAll(deviceId, {
        limit: limit ? parseInt(limit) : 100,
        offset: offset ? parseInt(offset) : 0,
        startDate,
        endDate
      });
      
      res.json(positions.map(normalizePosition));
    } catch (error) {
      next(error);
    }
  },

  async getByDevice(req, res, next) {
    try {
      const { limit } = req.query;
      const positions = await positionService.getByDevice(
        req.params.deviceId,
        limit ? parseInt(limit) : 100
      );
      res.json(positions.map(normalizePosition));
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const position = await positionService.getById(req.params.id);
      if (!position) {
        return res.status(404).json({ error: 'Position não encontrada' });
      }
      res.json(normalizePosition(position));
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const position = await positionService.create(req.body);
      res.status(201).json(position);
    } catch (error) {
      next(error);
    }
  },

  async getHistory(req, res, next) {
    try {
      const { deviceId, startDate, endDate } = req.query;
      
      if (!deviceId || !startDate || !endDate) {
        return res.status(400).json({ 
          error: 'Parâmetros obrigatórios: deviceId, startDate, endDate' 
        });
      }
      
      const positions = await positionService.getHistory(deviceId, startDate, endDate);
      res.json(positions.map(normalizePosition));
    } catch (error) {
      next(error);
    }
  },

  async getLatest(req, res, next) {
    try {
      const positions = await positionService.getLatestPositions();
      res.json(positions.map(normalizePosition));
    } catch (error) {
      next(error);
    }
  }
};

export default positionController;
