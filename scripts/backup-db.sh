#!/usr/bin/env bash
# scripts/backup-db.sh — daily DB backup for the Alibaba ECS deployment.
#
# Backs up MongoDB (mongodump) and MySQL (mysqldump) into ./backups/ with
# gzip compression, keeping the last BACKUP_KEEP_DAYS days.
#
# Install as a cron job on the ECS host (NOT inside the container):
#   crontab -e
#   30 3 * * * /app/minshuku-saas/scripts/backup-db.sh >> /var/log/minshuku-backup.log 2>&1
#
# Requires: mongodump (mongodb-database-tools), mysqldump (mysql-client).
# Reads connection settings from the project .env (same file as docker-compose).

set -euo pipefail

cd "$(dirname "$0")/.."
[ -f .env ] && set -a && . ./.env && set +a

BACKUP_DIR="${BACKUP_DIR:-./backups}"
BACKUP_KEEP_DAYS="${BACKUP_KEEP_DAYS:-14}"
STAMP="$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "[backup] start $STAMP"

# --- MongoDB ---
if [ -n "${MONGO_URI:-}" ] && command -v mongodump >/dev/null 2>&1; then
  echo "[backup] dumping MongoDB..."
  mongodump --uri="$MONGO_URI" --gzip --archive="$BACKUP_DIR/mongo-$STAMP.archive.gz"
  echo "[backup] mongo ok"
else
  echo "[backup] SKIP mongo (MONGO_URI or mongodump missing)"
fi

# --- MySQL ---
if [ -n "${DB_HOST:-}" ] && command -v mysqldump >/dev/null 2>&1; then
  echo "[backup] dumping MySQL..."
  export MYSQL_PWD="${DB_PASSWORD:-}"
  mysqldump -h "$DB_HOST" -P "${DB_PORT:-3306}" -u "${DB_USER:-root}" \
    --single-transaction --quick --routines --triggers \
    "${DB_NAME:-nakano}" | gzip > "$BACKUP_DIR/mysql-$STAMP.sql.gz"
  echo "[backup] mysql ok"
else
  echo "[backup] SKIP mysql (DB_HOST or mysqldump missing)"
fi

# --- Retention ---
find "$BACKUP_DIR" -type f -name "*.gz" -mtime +"$BACKUP_KEEP_DAYS" -delete
echo "[backup] done (kept last ${BACKUP_KEEP_DAYS} days in $BACKUP_DIR)"
