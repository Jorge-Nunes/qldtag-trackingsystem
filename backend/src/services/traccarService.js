import axios from 'axios';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { traccarConfigRepository } from '../repositories/configRepository.js';
import positionRepository from '../repositories/positionRepository.js';
import deviceRepository from '../repositories/deviceRepository.js';

dayjs.extend(utc);
dayjs.extend(timezone);

export const traccarService = {
  async getConfig() {
    return traccarConfigRepository.find();
  },

  async saveConfig(data) {
    // Filter allowed fields to avoid Prisma validation errors
    const allowedFields = ['url', 'port', 'protocol', 'enabled'];
    const filteredData = Object.keys(data)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = data[key];
        return obj;
      }, {});

    return traccarConfigRepository.upsert(filteredData);
  },

  async testConnection(data) {
    const { url, port, protocol } = data;
    const testDeviceId = 'test-device-01';
    
    const targetUrl = `${protocol}://${url}:${port}/`;
    
    const timestamp = Math.floor(Date.now() / 1000);
    
    const params = {
      id: testDeviceId,
      lat: -23.5505,
      lon: -46.6333,
      timestamp,
      accuracy: 1,
      altitude: 0,
      speed: 0,
      test: true
    };

    try {
      console.log(`Testando envio para Traccar: ${targetUrl}`, params);
      const response = await axios.get(targetUrl, {
        params,
        timeout: 5000
      });

      return { 
        success: true, 
        status: response.status,
        message: 'Posição de teste enviada com sucesso!' 
      };
    } catch (error) {
      console.error('Erro no teste de conexão Traccar:', error.message);
      let detail = error.message;
      if (error.code === 'ECONNREFUSED') detail = 'Conexão recusada (verifique se o Traccar está rodando e a porta está aberta)';
      if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') detail = 'Tempo de conexão esgotado (verifique o IP/URL)';
      
      return { 
        success: false, 
        error: detail 
      };
    }
  },

  async sendPosition(position) {
    const config = await this.getConfig();
    
    if (!config || !config.enabled) {
      return { skipped: true, reason: 'traccar_disabled' };
    }

    const device = await deviceRepository.findById(position.deviceId);
    
    if (!device || !device.linked || !device.traccarDeviceId) {
      return { skipped: true, reason: 'device_not_linked' };
    }

    const url = `${config.protocol}://${config.url}:${config.port}/`;
    
    const formattedDate = dayjs(position.timestamp).format('YYYY-MM-DD HH:mm:ss');
    const timestamp = Math.floor(new Date(position.timestamp).getTime() / 1000);
    
    const params = {
      id: device.traccarDeviceId,
      lat: position.latitude,
      lon: position.longitude,
      timestamp,
      accuracy: position.accuracy || 0,
      altitude: 0,
      speed: 0
    };

    try {
      console.log(`[Traccar] Enviando posição (${formattedDate}) para ${url}`, params);
      const response = await axios.get(url, {
        params,
        timeout: 10000
      });

      console.log(`[Traccar] Resposta: ${response.status}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao enviar posição para Traccar:', error.message);
      if (error.response) {
        console.error('Traccar Response Error:', error.response.status, error.response.data);
      }
      return { success: false, error: error.message };
    }
  },

  async sendHeartbeat(deviceId) {
    console.log(`[Keep-alive] Verificando heartbeat para dispositivo ${deviceId}`);
    const latestPosition = await positionRepository.findLatestByDevice(deviceId);
    
    if (latestPosition) {
      console.log(`[Keep-alive] Enviando heartbeat para dispositivo ${deviceId}`);
      // Send the same last position but with current timestamp
      const heartbeatPosition = {
        ...latestPosition,
        timestamp: new Date()
      };
      
      return this.sendPosition(heartbeatPosition);
    }
    
    return { skipped: true, reason: 'no_positions_found' };
  },

  async syncPendingPositions() {
    const config = await this.getConfig();
    
    if (!config || !config.enabled) {
      console.log('Traccar desabilitado, pulando sincronização');
      return { synced: 0 };
    }

    const pendingPositions = await positionRepository.findLastNotSent();
    
    if (pendingPositions.length === 0) {
      return { synced: 0 };
    }

    const sentIds = [];
    let synced = 0;

    for (const position of pendingPositions) {
      const result = await this.sendPosition(position);
      
      if (result.success) {
        sentIds.push(position.id);
        synced++;
      }
    }

    if (sentIds.length > 0) {
      await positionRepository.markAsSent(sentIds);
    }

    return { synced };
  }
};

export default traccarService;

