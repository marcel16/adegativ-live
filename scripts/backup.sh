#!/bin/bash

BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
mkdir -p $BACKUP_DIR

echo "Starting AdegaTV Live backup: $TIMESTAMP"

# Backup PostgreSQL
echo "Backing up PostgreSQL..."
docker-compose exec -T postgres pg_dump -U adegatv adegatv > $BACKUP_DIR/postgres_$TIMESTAMP.sql
gzip $BACKUP_DIR/postgres_$TIMESTAMP.sql
echo "  PostgreSQL backup done"

# Backup Redis
echo "Backing up Redis..."
docker-compose exec -T redis redis-cli SAVE
docker cp adegatv-redis:/data/dump.rdb $BACKUP_DIR/redis_$TIMESTAMP.rdb
echo "  Redis backup done"

# Backup uploads
echo "Backing up uploads..."
tar -czf $BACKUP_DIR/uploads_$TIMESTAMP.tar.gz -C ./apps/api uploads 2>/dev/null || true
echo "  Uploads backup done"

# Backup MinIO data
echo "Backing up MinIO data..."
docker-compose exec -T minio tar -czf - /data > $BACKUP_DIR/minio_$TIMESTAMP.tar.gz 2>/dev/null
echo "  MinIO backup done"

echo ""
echo "Backup completed successfully!"
echo "Files saved in: $BACKUP_DIR"
ls -lh $BACKUP_DIR/
