#!/bin/bash

# Database Backup Script for ResourceSheet
# This script creates a backup of your Supabase database

echo "Creating database backup..."

# Get current timestamp for unique backup filename
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE="database_backup_${TIMESTAMP}.sql"

echo "Backup file: $BACKUP_FILE"

# Create backup using pg_dump
# Using the Supabase connection details from .env.local
pg_dump "postgresql://postgres:postgres@localhost:5432/postgres" \
  --host=localhost \
  --port=5432 \
  --username=postgres \
  --dbname=postgres \
  --no-password \
  --verbose \
  --clean \
  --if-exists \
  --create \
  --format=plain \
  --file="$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Database backup created successfully: $BACKUP_FILE"
    echo "📁 Backup file size: $(du -h "$BACKUP_FILE" | cut -f1)"
    echo ""
    echo "To restore this backup later, run:"
    echo "  psql 'postgresql://postgres:postgres@localhost:5432/postgres' < $BACKUP_FILE"
else
    echo "❌ Database backup failed!"
    exit 1
fi