#!/bin/bash

echo "============================================"
echo "  AdegaTV Live - Setup & Installation"
echo "============================================"
echo ""

# Check prerequisites
command -v docker >/dev/null 2>&1 || { echo "Docker is required. Install it first."; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo "Docker Compose is required."; exit 1; }

echo "[1/4] Creating .env file..."
if [ ! -f .env ]; then
  cp .env.example .env
  echo "  .env file created from .env.example"
  echo "  IMPORTANT: Edit .env with your settings before continuing!"
else
  echo "  .env file already exists"
fi

echo "[2/4] Generating SSL certificates for development..."
mkdir -p nginx/ssl
if [ ! -f nginx/ssl/cert.pem ]; then
  openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout nginx/ssl/key.pem \
    -out nginx/ssl/cert.pem \
    -subj "/CN=localhost/O=AdegaTV/C=BR"
  echo "  Self-signed SSL certificates created"
fi

echo "[3/4] Building and starting containers..."
docker-compose build --parallel
docker-compose up -d

echo "[4/4] Running database migrations..."
sleep 5
docker-compose exec -T api npx prisma migrate deploy
docker-compose exec -T api npx prisma db seed

echo ""
echo "============================================"
echo "  AdegaTV Live is running!"
echo "============================================"
echo ""
echo "  Frontend:    https://localhost"
echo "  API:         https://localhost/api"
echo "  Admin:       https://localhost/admin"
echo "  Player Web:  https://localhost/player"
echo "  MinIO:       http://localhost:9000"
echo ""
echo "  Admin login: admin@adegatv.com / admin123"
echo ""
echo "============================================"
