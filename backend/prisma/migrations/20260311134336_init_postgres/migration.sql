-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Device" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "linked" BOOLEAN NOT NULL DEFAULT false,
    "traccarDeviceId" TEXT,
    "lastPositionId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'offline',
    "localName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Position" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "accuracy" DOUBLE PRECISION,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentToTraccar" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TraccarConfig" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "port" INTEGER NOT NULL DEFAULT 5055,
    "protocol" TEXT NOT NULL DEFAULT 'http',
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TraccarConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiConfig" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "baseUrl" TEXT NOT NULL,
    "apiKey" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "syncInterval" INTEGER NOT NULL DEFAULT 60,
    "localName" TEXT,
    "syncTime" INTEGER NOT NULL DEFAULT 1,
    "syncSize" INTEGER NOT NULL DEFAULT 100,
    "lastSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApiConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppConfig" (
    "id" TEXT NOT NULL,
    "appName" TEXT NOT NULL DEFAULT 'SyncTAG',
    "appLogo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Device_deviceId_key" ON "Device"("deviceId");

-- CreateIndex
CREATE INDEX "Device_deviceId_idx" ON "Device"("deviceId");

-- CreateIndex
CREATE INDEX "Device_status_idx" ON "Device"("status");

-- CreateIndex
CREATE INDEX "Device_status_createdAt_idx" ON "Device"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Device_linked_idx" ON "Device"("linked");

-- CreateIndex
CREATE INDEX "Position_deviceId_idx" ON "Position"("deviceId");

-- CreateIndex
CREATE INDEX "Position_timestamp_idx" ON "Position"("timestamp");

-- CreateIndex
CREATE INDEX "Position_sentToTraccar_idx" ON "Position"("sentToTraccar");

-- CreateIndex
CREATE INDEX "Position_deviceId_timestamp_idx" ON "Position"("deviceId", "timestamp");

-- CreateIndex
CREATE INDEX "Position_sentToTraccar_timestamp_idx" ON "Position"("sentToTraccar", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "Position_deviceId_latitude_longitude_timestamp_key" ON "Position"("deviceId", "latitude", "longitude", "timestamp");

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;
