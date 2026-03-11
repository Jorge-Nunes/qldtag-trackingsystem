import dotenv from 'dotenv';
dotenv.config();

export default {
  port: process.env.PORT || 3001,
  jwtSecret: process.env.JWT_SECRET || 'default-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  databaseUrl: process.env.DATABASE_URL || 'file:./dev.db',
  nodeEnv: process.env.NODE_ENV || 'development',
  appUrl: process.env.APP_URL || null,
};
