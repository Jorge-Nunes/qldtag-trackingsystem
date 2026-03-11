import Database from 'better-sqlite3';
import { PrismaClient } from '@prisma/client';

const sqlite = new Database('./prisma/dev.db');
const prisma = new PrismaClient();

function toDateTime(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  return new Date(value);
}

function toBoolean(value) {
  if (typeof value === 'boolean') return value;
  return Boolean(value);
}

async function migrate() {
  console.log('Iniciando migração SQLite -> PostgreSQL...\n');

  try {
    // Migrar Users
    console.log('Migrando Users...');
    const users = sqlite.prepare('SELECT * FROM User').all();
    for (const user of users) {
      await prisma.user.upsert({
        where: { email: user.email },
        update: {
          ...user,
          createdAt: toDateTime(user.createdAt),
          updatedAt: toDateTime(user.updatedAt)
        },
        create: {
          ...user,
          createdAt: toDateTime(user.createdAt),
          updatedAt: toDateTime(user.updatedAt)
        }
      });
    }
    console.log(`  -> ${users.length} usuários migrados`);

    // Migrar Devices
    console.log('Migrando Devices...');
    const devices = sqlite.prepare('SELECT * FROM Device').all();
    for (const device of devices) {
      await prisma.device.upsert({
        where: { deviceId: device.deviceId },
        update: {
          ...device,
          linked: toBoolean(device.linked),
          createdAt: toDateTime(device.createdAt),
          updatedAt: toDateTime(device.updatedAt)
        },
        create: {
          ...device,
          linked: toBoolean(device.linked),
          createdAt: toDateTime(device.createdAt),
          updatedAt: toDateTime(device.updatedAt)
        }
      });
    }
    console.log(`  -> ${devices.length} dispositivos migrados`);

    // Migrar Positions
    console.log('Migrando Positions...');
    const positions = sqlite.prepare('SELECT * FROM Position').all();
    let migrated = 0;
    for (const pos of positions) {
      try {
        await prisma.position.create({
          data: {
            id: pos.id,
            deviceId: pos.deviceId,
            latitude: pos.latitude,
            longitude: pos.longitude,
            accuracy: pos.accuracy,
            timestamp: toDateTime(pos.timestamp),
            createdAt: toDateTime(pos.createdAt),
            sentToTraccar: Boolean(pos.sentToTraccar)
          }
        });
        migrated++;
      } catch (e) {
        if (e.code !== 'P2002') {
          console.log(`  Erro na posição ${pos.id}: ${e.message}`);
        }
      }
    }
    console.log(`  -> ${migrated} posições migradas`);

    // Migrar TraccarConfig
    console.log('Migrando TraccarConfig...');
    const traccarConfigs = sqlite.prepare('SELECT * FROM TraccarConfig').all();
    for (const config of traccarConfigs) {
      await prisma.traccarConfig.upsert({
        where: { id: config.id },
        update: {
          ...config,
          enabled: toBoolean(config.enabled),
          createdAt: toDateTime(config.createdAt),
          updatedAt: toDateTime(config.updatedAt)
        },
        create: {
          ...config,
          enabled: toBoolean(config.enabled),
          createdAt: toDateTime(config.createdAt),
          updatedAt: toDateTime(config.updatedAt)
        }
      });
    }
    console.log(`  -> ${traccarConfigs.length} configurações Traccar migradas`);

    // Migrar ApiConfig
    console.log('Migrando ApiConfig...');
    const apiConfigs = sqlite.prepare('SELECT * FROM ApiConfig').all();
    for (const config of apiConfigs) {
      await prisma.apiConfig.upsert({
        where: { id: config.id },
        update: {
          ...config,
          enabled: toBoolean(config.enabled),
          lastSyncAt: toDateTime(config.lastSyncAt),
          createdAt: toDateTime(config.createdAt),
          updatedAt: toDateTime(config.updatedAt)
        },
        create: {
          ...config,
          enabled: toBoolean(config.enabled),
          lastSyncAt: toDateTime(config.lastSyncAt),
          createdAt: toDateTime(config.createdAt),
          updatedAt: toDateTime(config.updatedAt)
        }
      });
    }
    console.log(`  -> ${apiConfigs.length} configurações de API migradas`);

    // Migrar AppConfig
    console.log('Migrando AppConfig...');
    const appConfigs = sqlite.prepare('SELECT * FROM AppConfig').all();
    for (const config of appConfigs) {
      await prisma.appConfig.upsert({
        where: { id: config.id },
        update: {
          ...config,
          createdAt: toDateTime(config.createdAt),
          updatedAt: toDateTime(config.updatedAt)
        },
        create: {
          ...config,
          createdAt: toDateTime(config.createdAt),
          updatedAt: toDateTime(config.updatedAt)
        }
      });
    }
    console.log(`  -> ${appConfigs.length} configurações de app migradas`);

    console.log('\n✅ Migração concluída com sucesso!');
  } catch (error) {
    console.error('\n❌ Erro durante migração:', error);
  } finally {
    sqlite.close();
    await prisma.$disconnect();
  }
}

migrate();
