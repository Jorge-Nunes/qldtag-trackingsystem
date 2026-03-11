import express from 'express';
import cors from 'cors';
import config from './config/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { startWorkers } from './workers/syncWorker.js';

import authRoutes from './routes/auth.js';
import deviceRoutes from './routes/devices.js';
import positionRoutes from './routes/positions.js';
import configRoutes from './routes/config.js';
import appConfigRoutes from './routes/appConfig.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/positions', positionRoutes);
app.use('/api/config', configRoutes);
app.use('/api/app-config', appConfigRoutes);

app.use(errorHandler);

const start = async () => {
  try {
    app.listen(config.port, () => {
      console.log(`Servidor rodando na porta ${config.port}`);
      console.log(`Ambiente: ${config.nodeEnv}`);
    });

    startWorkers();
  } catch (error) {
    console.error('Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

start();

export default app;
