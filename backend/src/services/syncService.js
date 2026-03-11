import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CA_CERT_PATH = process.env.CA_CERT_PATH || path.join(__dirname, '../../certs/cert.pem');
const CLIENT_KEY_PATH = process.env.CLIENT_KEY_PATH || path.join(__dirname, '../../certs/key.pem');

let httpsAgent = null;

const getHttpsAgent = () => {
  try {
    console.log('Carregando certificados SSL...');
    
    const certOptions = {
      rejectUnauthorized: false,
    };

    if (fs.existsSync(CA_CERT_PATH)) {
      console.log('Certificado encontrado:', CA_CERT_PATH);
      certOptions.cert = fs.readFileSync(CA_CERT_PATH);
    }

    if (fs.existsSync(CLIENT_KEY_PATH)) {
      console.log('Chave encontrada:', CLIENT_KEY_PATH);
      certOptions.key = fs.readFileSync(CLIENT_KEY_PATH);
    }

    const agent = new https.Agent(certOptions);
    console.log('HTTPS Agent criado com sucesso');
    return agent;
  } catch (error) {
    console.error('Erro ao carregar certificados SSL:', error.message);
    return new https.Agent({ rejectUnauthorized: false });
  }
};

export const initHttpsAgent = () => {
  httpsAgent = getHttpsAgent();
};

export const syncService = {
  async getConfig() {
    const { apiConfigRepository } = await import('../repositories/configRepository.js');
    return apiConfigRepository.find();
  },

  async saveConfig(data) {
    const { apiConfigRepository } = await import('../repositories/configRepository.js');
    return apiConfigRepository.upsert(data);
  },

  async sync(customConfig = null) {
    const config = customConfig || await this.getConfig();
    
    if (!config || !config.enabled) {
      console.log('API externa desabilitada ou configuração inválida');
      return { inserted: 0, skipped: 0 };
    }

    if (!httpsAgent) {
      initHttpsAgent();
    }

    const { deviceRepository } = await import('../repositories/deviceRepository.js');
    const devices = await deviceRepository.findAll();
    
    if (devices.length === 0) {
      console.log('Nenhum dispositivo cadastrado, pulando sincronização');
      return { inserted: 0, skipped: 0 };
    }

    console.log(`Sincronizando ${devices.length} dispositivos cadastrados...`);

    let totalInserted = 0;
    let totalSkipped = 0;

    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'Node.js'
    };

    for (const device of devices) {
      try {
        const params = {
          page: 1,
          size: config.syncSize || 100,
          deviceId: device.deviceId
        };

        const localName = device.localName || config.localName;
        if (localName) {
          params.localName = localName;
        }
        if (config.syncTime) {
          params.time = config.syncTime;
        }

        const response = await axios.get(`${config.baseUrl}`, {
          params,
          timeout: 30000,
          headers,
          httpsAgent: httpsAgent
        });

        if (!response.data || !response.data.data || response.data.data.length === 0) {
          console.log(`Dispositivo ${device.deviceId} não retornou dados. Marcando como offline.`);
          await deviceRepository.updateStatus(device.id, 'offline');
          continue;
        }

        const positions = response.data.data;
        const { positionService } = await import('./positionService.js');
        const { traccarService } = await import('./traccarService.js');
        
        let newPositionsCount = 0;

        for (const pos of positions) {
          try {
            const result = await positionService.createFromExternal(pos);
            
            if (result.inserted) {
              totalInserted++;
              newPositionsCount++;
            } else if (result.skipped) {
              totalSkipped++;
            }
          } catch (error) {
            totalSkipped++;
          }
        }

        // Keep-alive logic: If no new positions were found but the request was successful,
        // send a heartbeat to Traccar to keep the device online there.
        if (newPositionsCount === 0) {
          await traccarService.sendHeartbeat(device.id);
        }

        // Se chegamos aqui com dados, o dispositivo está online
        await deviceRepository.updateStatus(device.id, 'online');
      } catch (error) {
        console.error(`Erro ao sincronizar dispositivo ${device.deviceId}:`, error.message);
        const { deviceRepository } = await import('../repositories/deviceRepository.js');
        await deviceRepository.updateStatus(device.id, 'offline');
      }
    }

    const existingConfig = await this.getConfig();
    if (existingConfig) {
      const { apiConfigRepository } = await import('../repositories/configRepository.js');
      await apiConfigRepository.updateLastSync(existingConfig.id);
    }

    const { positionService } = await import('./positionService.js');
    await positionService.checkAllDevicesStatus();

    return { inserted: totalInserted, skipped: totalSkipped };
  },

  async syncDevicePositions(deviceIdString, localName, time = 1) {
    const config = await this.getConfig();
    
    if (!config || !config.enabled) {
      return { error: 'API externa desabilitada' };
    }

    if (!httpsAgent) {
      initHttpsAgent();
    }

    const { deviceRepository } = await import('../repositories/deviceRepository.js');
    const device = await deviceRepository.findByDeviceId(deviceIdString);
    
    const effectiveLocalName = localName || (device ? device.localName : null) || config.localName;

    try {
      const params = {
        page: 1,
        size: config.syncSize || 100,
        deviceId: deviceIdString
      };

      if (effectiveLocalName) params.localName = effectiveLocalName;
      if (time) params.time = time;

      const headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'Node.js'
      };

      const isHttps = config.baseUrl.startsWith('https');

      const response = await axios.get(`${config.baseUrl}`, {
        params,
        timeout: 30000,
        headers,
        httpsAgent: httpsAgent
      });

      if (!response.data || !response.data.data) {
        return { positions: [] };
      }

      const positions = response.data.data;
      let inserted = 0;
      let skipped = 0;

      const { positionService } = await import('./positionService.js');

      for (const pos of positions) {
        try {
          const result = await positionService.createFromExternal(pos);
          
          if (result.inserted) {
            inserted++;
          } else if (result.skipped) {
            skipped++;
          }
        } catch (error) {
          skipped++;
        }
      }

      await positionService.checkAllDevicesStatus();

      return { inserted, skipped };
    } catch (error) {
      console.error('Erro na sincronização:', error.message);
      return { error: error.message };
    }
  }
};

export default syncService;
