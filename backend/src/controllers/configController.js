import traccarService from '../services/traccarService.js';
import syncService from '../services/syncService.js';
import config from '../config/index.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const configController = {
  async getSystemInfo(req, res, next) {
    try {
      const dbUrl = process.env.DATABASE_URL || '';
      const isPostgres = dbUrl.includes('postgresql') || dbUrl.includes('postgres');
      
      const userCount = await prisma.user.count();
      const deviceCount = await prisma.device.count();
      const positionCount = await prisma.position.count();

      res.json({
        environment: config.nodeEnv || 'development',
        database: isPostgres ? 'PostgreSQL (Produção)' : 'SQLite (Desenvolvimento)',
        version: '1.0.0',
        stats: {
          usuarios: userCount,
          dispositivos: deviceCount,
          posicoes: positionCount
        }
      });
    } catch (error) {
      next(error);
    }
  },

  async getTraccarConfig(req, res, next) {
    try {
      const config = await traccarService.getConfig();
      res.json(config || {});
    } catch (error) {
      next(error);
    }
  },

  async saveTraccarConfig(req, res, next) {
    try {
      const config = await traccarService.saveConfig(req.body);
      res.json(config);
    } catch (error) {
      next(error);
    }
  },

  async getApiConfig(req, res, next) {
    try {
      const config = await syncService.getConfig();
      res.json(config || {});
    } catch (error) {
      next(error);
    }
  },

  async saveApiConfig(req, res, next) {
    try {
      const config = await syncService.saveConfig(req.body);
      res.json(config);
    } catch (error) {
      next(error);
    }
  },

  async triggerSync(req, res, next) {
    try {
      const config = req.body ? req.body.config : null;
      console.log('Triggering manual sync with config:', config ? 'custom' : 'default');
      const result = await syncService.sync(config);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async syncDevicePositions(req, res, next) {
    try {
      const { deviceId } = req.params;
      const { localName, time } = req.query;
      
      const result = await syncService.syncDevicePositions(deviceId, localName, time);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async syncTraccar(req, res, next) {
    try {
      const result = await traccarService.syncPendingPositions();
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async testTraccarConnection(req, res, next) {
    try {
      const result = await traccarService.testConnection(req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
};

export default configController;
