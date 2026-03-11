import cron from 'node-cron';
import { initHttpsAgent } from '../services/syncService.js';
import syncService from '../services/syncService.js';
import traccarService from '../services/traccarService.js';
import positionService from '../services/positionService.js';
import { apiConfigRepository } from '../repositories/configRepository.js';

let syncJob = null;
let statusJob = null;

export const startWorkers = async () => {
  console.log('Iniciando workers...');

  await initHttpsAgent();

  statusJob = cron.schedule('*/5 * * * *', async () => {
    console.log('Verificando status dos dispositivos...');
    try {
      await positionService.checkAllDevicesStatus();
    } catch (error) {
      console.error('Erro ao verificar status:', error.message);
    }
  });

  syncJob = cron.schedule('*/1 * * * *', async () => {
    const config = await apiConfigRepository.find();
    
    if (!config || !config.enabled) {
      return;
    }

    console.log('Sincronizando com API externa...');
    try {
      const result = await syncService.sync();
      console.log('Resultado da sincronização:', result);
    } catch (error) {
      console.error('Erro na sincronização:', error.message);
    }

    console.log('Enviando posições para Traccar...');
    try {
      const result = await traccarService.syncPendingPositions();
      console.log('Posições enviadas para Traccar:', result);
    } catch (error) {
      console.error('Erro ao enviar para Traccar:', error.message);
    }
  });

  console.log('Workers iniciados com sucesso');
};

export const stopWorkers = () => {
  if (syncJob) {
    syncJob.stop();
  }
  if (statusJob) {
    statusJob.stop();
  }
  console.log('Workers parados');
};

export default { startWorkers, stopWorkers };
