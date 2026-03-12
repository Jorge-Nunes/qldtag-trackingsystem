# QLD TAG - Sistema de Rastreamento GPS

Sistema completo para gerenciamento de dispositivos de rastreamento GPS com integração Traccar.

## Índice

- [Stack Tecnológica](#stack-tecnológica)
- [Funcionalidades](#funcionalidades)
- [Deploy em Produção (Docker)](#deploy-em-produção-docker)
- [Desenvolvimento Local](#desenvolvimento-local)
- [Credenciais](#credenciais)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [API Endpoints](#api-endpoints)
- [Fluxo de Dados](#fluxo-de-dados)
- [Estrutura do Projeto](#estrutura-do-projeto)

---

## Stack Tecnológica

### Backend
- Node.js + Express.js
- Prisma ORM
- PostgreSQL (produção)
- JWT Authentication
- node-cron (scheduler)
- SSL/TLS

### Frontend
- React + Vite
- Tailwind CSS
- Leaflet (mapas)
- React Router DOM

---

## Funcionalidades

1. **Autenticação** - Login, registro, JWT com aprovação de usuários
2. **Gestão de Usuários** - Admin pode aprobar, reprovar, editar e excluir usuários
3. **Gerenciamento de Dispositivos** - CRUD completo
4. **Posições GPS** - Armazenamento com deduplicação
5. **Detecção Online/Offline** - Atualização automática (60 min)
6. **Mapa Interativo** - Leaflet com marcadores coloridos
7. **Histórico** - Linha do tempo e trilha no mapa
8. **Integração Traccar** - Envio inteligente de posições
9. **Sincronização** - Worker para API externa

---

## Deploy em Produção (Docker)

### 1. Clone o repositório

```bash
git clone https://github.com/Jorge-Nunes/qldtag-trackingsystem.git
cd qldtag-trackingsystem
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env
nano .env
```

Edite o `.env` com senhas seguras:

```env
# PostgreSQL
POSTGRES_USER=qldtag
POSTGRES_PASSWORD=senha_segura_aqui
POSTGRES_DB=qldtag

# Backend
DATABASE_URL=postgresql://qldtag:senha_segura_aqui@postgres:5432/qldtag?schema=public
JWT_SECRET=senha_jwt_muito_segura_aqui
JWT_EXPIRES_IN=24h
PORT=6001
NODE_ENV=production
APP_URL=https://seudominio.com

# Frontend
VITE_API_URL=http://backend:6001
```

### 3. Inicie os containers

```bash
docker compose up -d --build
```

### 4. Acesso

- **Frontend**: http://seudominio.com:6173 (ou IP do servidor)
- **Backend**: http://seudominio.com:6001

### 5. Primeiro Login

- **Email**: admin@admin.com
- **Senha**: admin123

---

## Desenvolvimento Local

### Pré-requisitos

- Node.js 18+
- Docker e Docker Compose

### Opção 1: Com Docker (Recomendado)

```bash
# Clone o repositório
git clone https://github.com/Jorge-Nunes/qldtag-trackingsystem.git
cd qldtag-trackingsystem

# Copie o arquivo de exemplo
cp .env.example .env

# Inicie os containers
docker compose up -d --build

# Acesse
# Frontend: http://localhost:6173
# Backend: http://localhost:6001
```

### Opção 2: Sem Docker (Backend)

```bash
# Backend
cd backend
npm install
cp .env.example .env  # Configure o DATABASE_URL para PostgreSQL local
npx prisma generate
npx prisma migrate dev
npm run dev

# Frontend (outro terminal)
cd frontend
npm install
npm run dev
```

---

## Credenciais

### Usuário Admin (criado automaticamente no primeiro deploy)

- **Email**: admin@admin.com
- **Senha**: admin123

### Banco de Dados PostgreSQL

- **Usuário**: qldtag
- **Senha**: Configure no arquivo .env

---

## Variáveis de Ambiente

### Backend

| Variável | Descrição | Padrão |
|----------|-----------|---------|
| `DATABASE_URL` | String de conexão PostgreSQL | Obrigatório |
| `JWT_SECRET` | Chave secreta para JWT | Obrigatório |
| `JWT_EXPIRES_IN` | Tempo de expiração do token | 24h |
| `PORT` | Porta do servidor | 6001 |
| `NODE_ENV` | Ambiente | development |
| `APP_URL` | URL da aplicação | http://localhost:6001 |

### Frontend

| Variável | Descrição | Padrão |
|----------|-----------|---------|
| `VITE_API_URL` | URL da API backend | http://localhost:6001 |

---

## API Endpoints

### Autenticação
```
POST /api/auth/register - Criar conta (requer aprovação admin)
POST /api/auth/login   - Login (requer usuário aprovado)
GET  /api/auth/me     - Dados do usuário
```

### Usuários (Admin)
```
GET    /api/users              - Listar todos usuários
PATCH  /api/users/:id         - Atualizar usuário
PATCH  /api/users/:id/approve  - Aprovar usuário
PATCH  /api/users/:id/reject    - Reprovar usuário
PATCH  /api/users/:id/password - Alterar senha
DELETE /api/users/:id         - Excluir usuário
```

### Dispositivos
```
GET    /api/devices           - Listar dispositivos
GET    /api/devices/stats     - Estatísticas
POST   /api/devices           - Criar dispositivo
PUT    /api/devices/:id       - Atualizar
DELETE /api/devices/:id       - Excluir
POST   /api/devices/:id/link    - Vincular ao Traccar
POST   /api/devices/:id/unlink  - Desvincular
```

### Posições
```
GET /api/positions              - Listar posições
GET /api/positions/latest      - Últimas posições
GET /api/positions/device/:id  - Posições por dispositivo
GET /api/positions/history     - Histórico com filtros
```

### Configurações
```
GET    /api/config/system       - Informações do sistema
GET    /api/config/api         - Ver config API externa
PUT    /api/config/api         - Salvar config API externa
GET    /api/config/traccar     - Ver config Traccar
PUT    /api/config/traccar     - Salvar config Traccar
POST   /api/config/traccar/test - Testar conexão Traccar
GET    /api/app-config         - Ver config do app
POST   /api/app-config         - Salvar config do app
POST   /api/config/sync/trigger - Sincronizar agora
```

---

## Fluxo de Dados

1. Worker consulta API externa conforme intervalo configurado
2. Posições são salvas no banco (sem duplicatas)
3. Status do dispositivo é atualizado (online/offline)
4. Novas posições são enviadas para Traccar

---

## Estrutura do Projeto

```
qldtag-trackingsystem/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Controladores da API
│   │   ├── services/      # Lógica de negócio
│   │   ├── repositories/  # Acesso ao banco
│   │   ├── routes/        # Rotas da API
│   │   ├── middlewares/   # Middlewares (auth, etc)
│   │   ├── workers/       # Workers agendados
│   │   ├── config/        # Configurações
│   │   └── index.js       # Entry point
│   ├── prisma/
│   │   ├── schema.prisma  # Schema do banco
│   │   ├── migrations/    # Migrações
│   │   └── seed.js        # Seed de dados
│   ├── certs/             # Certificados SSL
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/         # Páginas React
│   │   ├── components/    # Componentes
│   │   ├── services/     # Serviços API
│   │   ├── contexts/     # Contextos React
│   │   └── styles/       # Estilos
│   ├── index.html
│   └── package.json
│
├── docker-compose.yml      # Orquestração Docker
├── .env.example           # Exemplo de variáveis
└── README.md
```

---

## Detecção de Status

- **Online**: Posição recebida nos últimos 60 minutos
- **Offline**: Sem posição nos últimos 60 minutos

---

## Integração com Traccar

Configure no painel de configurações:
- URL do servidor Traccar
- Porta (padrão: 5055)
- Protocolo (http/https)
- Ativar/desativar envio

---

## Telas

- **Login/Registro**: Autenticação com aprovação de admin
- **Dashboard**: Visão geral com estatísticas
- **Dispositivos**: Gerenciamento CRUD
- **Mapa**: Visualização em tempo real
- **Histórico**: Linha do tempo com filtros
- **Usuários**: Gestão de usuários (admin)
- **Configurações**: API externa, Traccar e App

---

## Licença

MIT
