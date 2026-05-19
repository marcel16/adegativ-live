# AdegaTV Live - Documentação da API

Base URL: `https://localhost/api`

## Autenticação

Todas as rotas protegidas requerem o header:
```
Authorization: Bearer <access_token>
```

### Registro
```
POST /auth/register
Body: { "name": "string", "email": "string", "password": "string" }
Response: { "user": {...}, "accessToken": "...", "refreshToken": "..." }
```

### Login
```
POST /auth/login
Body: { "email": "string", "password": "string" }
Response: { "user": {...}, "accessToken": "...", "refreshToken": "..." }
```

### Refresh Token
```
POST /auth/refresh
Body: { "refreshToken": "string" }
Response: { "accessToken": "...", "refreshToken": "..." }
```

### Logout
```
POST /auth/logout
Body: { "refreshToken": "string" }
```

## Adegas

### Listar Adegas
```
GET /adegas
Response: [{ id, name, city, state, tvDevices, ... }]
```

### Criar Adega
```
POST /adegas
Body: { "name": "string", "companyId": "string", "address?": "string", "city?": "string", "state?": "string" }
```

### Detalhes Adega
```
GET /adegas/:id
```

### Atualizar Adega
```
PUT /adegas/:id
```

### Deletar Adega
```
DELETE /adegas/:id
```

### Status Assinatura
```
GET /adegas/:id/subscription
Response: { status: "TRIAL|ACTIVE|EXPIRED", plan: "string", blocked: bool }
```

## TVs

### Gerar Código de Pareamento
```
POST /tv/pairing/generate
Body: { "platform": "WEB|SAMSUNG|LG|ANDROID_TV|ROKU", "model?": "string" }
Response: { code: "123456", deviceToken: "uuid", tvDeviceId: "uuid", expiresAt: "date" }
```

### Confirmar Pareamento
```
POST /tv/pairing/confirm
Body: { "code": "123456", "adegaId": "uuid" }
Response: { tvDeviceId: "uuid", token: "uuid", message: "TV paired successfully" }
```

### Obter Playlist da TV
```
GET /tv/playlist/:deviceToken
Response: { tvId, name, blocked, blockedMessage, schedule: [...], fallback: [...] }
```

### TVs por Adega
```
GET /tv/adega/:adegaId
```

### Ping TV
```
POST /tv/:id/ping
```

### Revogar TV
```
DELETE /tv/:id/revoke
```

## Mídia

### Upload
```
POST /media/upload
Content-Type: multipart/form-data
Fields: file (video/image), adegaId (uuid), tags? (string)
```

### Listar Mídia
```
GET /media/adega/:adegaId?folder=string
```

### Deletar
```
DELETE /media/:id
```

## Agendas

### Listar
```
GET /schedules/adega/:adegaId
```

### Criar
```
POST /schedules
Body: { "adegaId": "uuid", "name": "string", "startDate?": "date", "endDate?": "date" }
```

### Adicionar Item
```
POST /schedules/:id/items
Body: { "mediaFileId?": "uuid", "playlistId?": "uuid", "campaignId?": "uuid", "priority?": "NORMAL|HIGH|EMERGENCY", "dayOfWeek?": 0-6, "startTime?": "HH:mm", "endTime?": "HH:mm", "duration?": number }
```

## Playlists

### Listar
```
GET /playlists/adega/:adegaId
```

### Criar
```
POST /playlists
Body: { "adegaId": "uuid", "name": "string" }
```

## Planos

### Listar Planos
```
GET /plans
```

### Criar (Admin)
```
POST /plans
Auth: Admin
Body: { "name": "string", "priceMonthly": number, "priceYearly": number, "maxTvs": number, "maxStorageGb": number }
```

## Campanhas

### Listar
```
GET /campaigns/adega/:adegaId
```

### Criar
```
POST /campaigns
Body: { "adegaId": "uuid", "name": "string", "description?": "string", "startDate?": "date", "endDate?": "date", "isRecurring?": bool }
```

## WebSockets

Conectar: `wss://localhost/socket.io`

### Eventos

**Cliente autentica:**
```json
{ "event": "auth", "data": { "userId": "uuid" } }
```

**TV registra:**
```json
{ "event": "register", "data": { "deviceToken": "uuid" } }
```

**TV obtém playlist:**
```json
{ "event": "getPlaylist", "data": { "deviceToken": "uuid" } }
```

**Notificação de atualização:**
```json
{ "event": "contentUpdate", "data": { "timestamp": "ISO date" } }
```
