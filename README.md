# QLD TAG - Sistema de Rastreamento GPS

Sistema completo para gerenciamento de dispositivos de rastreamento GPS com integração Traccar.

## Stack Tecnológica

### Backend
- Node.js + Express.js
- Prisma ORM
- SQLite (desenvolvimento) / PostgreSQL (produção)
- JWT Authentication
- node-cron (scheduler)

### Frontend
- React + Vite
- Tailwind CSS
- Leaflet (mapas)
- React Router DOM

## Funcionalidades

1. **Autenticação** - Login, registro, JWT
2. **Gerenciamento de Dispositivos** - CRUD completo
3. **Posições GPS** - Armazenamento com deduplicação
4. **Detecção Online/Offline** - Atualização automática (60 min)
5. **Mapa Interativo** - Leaflet com marcadores coloridos
6. **Histórico** - Linha do tempo e trilha no mapa
7. **Integração Traccar** - Envio inteligente de posições
8. **Sincronização** - Worker para API externa

## Pré-requisitos

- Node.js 18+
- npm ou yarn

## Instalação

### Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Variáveis de Ambiente

### Backend (.env)

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="sua-chave-secreta"
JWT_EXPIRES_IN="24h"
PORT=3001
```

### Configuração para PostgreSQL

```env
DATABASE_URL="postgresql://user:password@localhost:5432/qldtag"
```

## Docker

```bash
docker-compose up -d
```

Acesse:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## API Endpoints

### Autenticação
```
POST /api/auth/register - Criar conta
POST /api/auth/login - Login
GET /api/auth/me - Dados do usuário
```

### Dispositivos
```
GET /api/devices - Listar dispositivos
GET /api/devices/stats - Estatísticas
POST /api/devices - Criar dispositivo
PUT /api/devices/:id - Atualizar
DELETE /api/devices/:id - Excluir
POST /api/devices/:id/link - Vincular ao Traccar
POST /api/devices/:id/unlink - Desvincular
```

### Posições
```
GET /api/positions - Listar posições
GET /api/positions/latest - Últimas posições
GET /api/positions/device/:deviceId - Posições por dispositivo
GET /api/positions/history - Histórico com filtros
```

### Configurações
```
GET /api/config/api - Ver config API externa
PUT /api/config/api - Salvar config API externa
GET /api/config/traccar - Ver config Traccar
PUT /api/config/traccar - Salvar config Traccar
POST /api/config/sync/trigger - Sincronizar agora
```

## Fluxo de Dados

1. Worker consulta API externa a cada minuto
2. Posições são salvas no banco (sem duplicatas)
3. Status do dispositivo é atualizado (online/offline)
4. Novas posições são enviadas para Traccar

## Detecção de Status

- **Online**: Posição recebida nos últimos 60 minutos
- **Offline**: Sem posição nos últimos 60 minutos

## Integração com Traccar

Configure no painel de configurações:
- URL do servidor Traccar
- Porta (padrão: 8082)
- Usuário e senha
- Ativar/desativar envio

## Telas

- **Login/Registro**: Autenticação
- **Dashboard**: Visão geral com estatísticas
- **Dispositivos**: Gerenciamento CRUD
- **Mapa**: Visualização em tempo real
- **Histórico**: Linha do tempo com filtros
- **Configurações**: API externa e Traccar

## Estrutura do Projeto

```
backend/
├── src/
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── routes/
│   ├── middlewares/
│   ├── workers/
│   ├── config/
│   └── index.js
└── prisma/
    └── schema.prisma

frontend/
├── src/
│   ├── pages/
│   ├── components/
│   ├── services/
│   ├── contexts/
│   └── styles/
├── index.html
└── package.json
```

## Licença

MIT
