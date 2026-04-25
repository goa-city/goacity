#!/bin/bash

# Database Backup Script for GoaCity
# Keeps backups for 5 days

PROJECT_ROOT="/Users/stevensdumpala/Imagefile/goa.city"
BACKUP_DIR="$PROJECT_ROOT/backups/db"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DATABASE_URL="postgresql://stevensdumpala@localhost:5432/goacity"

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

# Perform backup
echo "Starting database backup at $(date)"
pg_dump "$DATABASE_URL" > "$BACKUP_DIR/goacity_db_$TIMESTAMP.sql"

if [ $? -eq 0 ]; then
    echo "Backup successful: $BACKUP_DIR/goacity_db_$TIMESTAMP.sql"
else
    echo "Backup failed!"
    exit 1
fi

# Cleanup: Delete backups older than 5 days
echo "Cleaning up backups older than 5 days..."
find "$BACKUP_DIR" -name "goacity_db_*.sql" -type f -mtime +5 -delete

echo "Backup process completed at $(date)"
