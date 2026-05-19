.PHONY: up down build logs api db psql seed reset backup restore

up:
	docker compose up -d

down:
	docker compose down

build:
	docker compose build --parallel

logs:
	docker compose logs -f

api:
	docker compose logs -f api

db:
	docker compose exec -T api npx prisma migrate deploy

psql:
	docker compose exec postgres psql -U adegatv adegatv

seed:
	docker compose exec -T api npx prisma db seed

reset:
	docker compose down -v
	docker compose up -d
	sleep 5
	docker compose exec -T api npx prisma migrate deploy
	docker compose exec -T api npx prisma db seed

backup:
	./scripts/backup.sh

restore:
	./scripts/restore.sh

prisma-studio:
	docker compose exec -T api npx prisma studio

test:
	docker compose exec -T api npm test

shell-api:
	docker compose exec api sh

shell-db:
	docker compose exec postgres sh