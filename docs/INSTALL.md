# AdegaTV Live - Guia de Instalação

## Requisitos

- Docker 24+
- Docker Compose 2.20+
- Git
- Node.js 20+ (para desenvolvimento)

## Instalação Rápida

```bash
# Clone ou entre no diretório do projeto
cd adegativ-live

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# Execute o setup
chmod +x scripts/setup.sh
./scripts/setup.sh
```

O setup.sh irá:
1. Criar arquivo .env
2. Gerar certificados SSL
3. Buildar e iniciar os containers
4. Rodar migrations e seed do banco

## Acesso

| Serviço | URL |
|---------|-----|
| Frontend (Cliente) | https://localhost |
| API | https://localhost/api |
| Admin | https://localhost/admin |
| Web Player | https://localhost/player |
| MinIO Console | http://localhost:9001 |

## Credenciais Padrão

**Admin:**
- Email: admin@adegatv.com
- Senha: admin123

## Comandos Úteis

```bash
# Ver logs
docker-compose logs -f api
docker-compose logs -f frontend

# Parar serviços
docker-compose down

# Rebuildar um serviço
docker-compose build api
docker-compose up -d api

# Executar migrations
docker-compose exec api npx prisma migrate deploy

# Executar seed
docker-compose exec api npx prisma db seed

# Backup
./scripts/backup.sh

# Restore
./scripts/restore.sh 20240315_143022
```

## Estrutura de Diretórios

```
adegativ-live/
  apps/
    api/          - Backend NestJS
    frontend/     - Painel do Cliente (Next.js)
    admin/        - Painel Admin (Next.js)
    player-web/   - Web Player (HTML5)
  packages/
    database/     - Prisma Schema
    shared/       - Tipos compartilhados
    video-worker/ - Processamento FFmpeg
  docker/         - Configurações Docker
  nginx/          - Proxy reverso
  scripts/        - Utilitários
  docs/           - Documentação
```

## Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| DATABASE_URL | PostgreSQL connection | postgresql://adegatv:adegatv123@postgres:5432/adegatv |
| REDIS_URL | Redis connection | redis://redis:6379 |
| JWT_SECRET | Chave secreta JWT | (obrigatório alterar) |
| JWT_REFRESH_SECRET | Chave refresh token | (obrigatório alterar) |
| MINIO_ROOT_USER | Usuário MinIO | adegatv |
| MINIO_ROOT_PASSWORD | Senha MinIO | (obrigatório alterar) |
| TRIAL_DAYS | Dias de trial | 3 |
| PAIRING_CODE_EXPIRY_MINUTES | Expiração código pareamento | 10 |
| MAX_UPLOAD_SIZE_MB | Tamanho máximo upload | 500 |

## Plano de Expansão

### Fase 2 - Apps Nativos
- App Samsung Tizen
- App LG webOS
- App Android TV (Kotlin)
- App Roku

### Fase 3 - Avançado
- Editor de vídeo integrado
- IA para criação de conteúdo
- Importação YouTube
- Relatórios avançados
- Integração completa com Stripe/Asaas
