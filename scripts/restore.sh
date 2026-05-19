#!/bin/bash

if [ -z "$1" ]; then
  echo "Usage: ./restore.sh <backup_timestamp>"
  echo "Example: ./restore.sh 20240315_143022"
  exit 1
fi

TIMESTAMP=$1
BACKUP_DIR="./backups"

echo "Restoring AdegaTV Live from backup: $TIMESTAMP"

if [ -f "$BACKUP_DIR/postgres_$TIMESTAMP.sql.gz" ]; then
  echo "Restoring PostgreSQL..."
  gunzip -c $BACKUP_DIR/postgres_$TIMESTAMP.sql.gz | docker-compose exec -T postgres psql -U adegatv adegatv
  echo "  PostgreSQL restored"
fi

if [ -f "$BACKUP_DIR/redis_$TIMESTAMP.rdb" ]; then
  echo "Restoring Redis..."
  docker cp $BACKUP_DIR/redis_$TIMESTAMP.rdb adegatv-redis:/data/dump.rdb
  docker-compose exec -T redis redis-cli CONFIG SET save ""
  echo "  Redis restored - restart Redis container to apply"
fi

echo "Restore process completed!"
