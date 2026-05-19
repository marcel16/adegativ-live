# AdegaTV Live 🍺📺

Sistema SaaS de TV ao vivo para adegas, distribuidoras e lojas de bebidas exibirem vídeos promocionais, campanhas, cardápios, preços e ofertas em TVs Samsung, LG, Android TV, Roku e via navegador.

## 🚀 Funcionalidades

- **Multi-adega**: Gerencie várias lojas de uma só conta
- **Pareamento por código**: TV mostra código de 6 dígitos para vincular ao painel
- **Player web incluso**: Funciona em qualquer navegador
- **Upload de mídia**: Vídeos e imagens com preview
- **Agenda de programação**: Dias da semana, horários, prioridades
- **Playlists**: Organize conteúdos em listas de reprodução
- **Campanhas**: Crie campanhas promocionais
- **Trial automático**: 3 dias gratuitos
- **Planos**: Básico (2 TVs), Profissional (10 TVs), Premium (ilimitado)
- **Painel admin**: Gestão completa da plataforma
- **WebSocket**: Comunicação em tempo real com as TVs
- **Docker**: Implantação simplificada
- **Segurança**: JWT, HTTPS, rate limit, validação

## ⚡ Quick Start

```bash
# Clone o repositório
git clone <repo-url> adegativ-live
cd adegativ-live

# Configure
cp .env.example .env
# Edite .env com suas configurações

# Inicie
docker compose up -d

# Execute as migrations
docker compose exec api npx prisma migrate deploy
docker compose exec api npx prisma db seed
```

Acesse: **https://localhost**

## 📋 Pré-requisitos

- Docker 24+
- Docker Compose 2.20+
- Node.js 20+ (desenvolvimento)

## 🏗️ Arquitetura

```
adegativ-live/
├── apps/
│   ├── api/           # Backend NestJS + Prisma
│   ├── frontend/      # Painel Cliente (Next.js)
│   ├── admin/         # Painel Admin (Next.js)
│   └── player-web/    # Web Player (HTML5)
├── packages/
│   ├── database/      # Schema Prisma
│   ├── shared/        # Tipos compartilhados
│   └── video-worker/  # Processamento FFmpeg
├── nginx/             # Proxy reverso
├── scripts/           # Utilitários
└── docs/              # Documentação
```

## 🛠️ Stack

| Camada | Tecnologia |
|--------|-----------|
| Backend | NestJS, TypeScript, Prisma ORM |
| Banco | PostgreSQL 16 |
| Cache | Redis 7 |
| Storage | MinIO (S3-compatible) |
| Fila | BullMQ |
| Vídeo | FFmpeg |
| Frontend | Next.js 14, React 18, TailwindCSS |
| Proxy | Nginx |
| WebSocket | Socket.IO |
| Auth | JWT + Refresh Token |

## 📚 Documentação

- [Guia de Instalação](docs/INSTALL.md)
- [Documentação da API](docs/API.md)
- [Guia Apps TV](docs/TV_APPS_GUIDE.md)

## 📊 Planos

| Recurso | Básico | Profissional | Premium |
|---------|--------|-------------|---------|
| TVs | 2 | 10 | Ilimitado |
| Armazenamento | 5GB | 20GB | 100GB |
| Agendamento | ✅ | ✅ | ✅ |
| Analytics | ❌ | ✅ | ✅ |
| Import YouTube | ❌ | ✅ | ✅ |
| Recursos de IA | ❌ | ❌ | ✅ |
| Preço mensal | R$ 49,90 | R$ 99,90 | R$ 199,90 |

## 🔒 Segurança

- HTTPS obrigatório
- JWT + Refresh Token
- bcrypt/Argon2 para senhas
- Rate limiting
- CORS configurado
- Helmet headers
- Validação de entrada
- Sanitização de dados
- Tokens de TV criptografados
- Código de pareamento com expiração
- Proteção contra upload malicioso
- Limite de tamanho de arquivo

## 📱 Roadmap

### Fase 1 - MVP (atual)
- [x] Autenticação JWT
- [x] Cadastro/login com trial de 3 dias
- [x] Cadastro de adegas
- [x] Pareamento de TV com código de 6 dígitos
- [x] Upload de mídia
- [x] Playlists
- [x] Agenda de programação
- [x] Player web funcional
- [x] Bloqueio por trial vencido
- [x] Docker Compose
- [x] Painel admin básico

### Fase 2 - Apps Nativos
- [ ] App Samsung Tizen
- [ ] App LG webOS
- [ ] App Android TV (Kotlin)
- [ ] App Roku

### Fase 3 - Avançado
- [ ] Editor de vídeo integrado (FFmpeg)
- [ ] IA para criação de conteúdo
- [ ] Importação YouTube
- [ ] Relatórios avançados
- [ ] Integração Stripe/Asaas completa
- [ ] Backup automático

## 📄 Licença

Este projeto é privado. Todos os direitos reservados.
