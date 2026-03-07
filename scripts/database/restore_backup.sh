#!/bin/bash

# Database Restore Script for ResourceSheet
# This script restores your Supabase database from a backup file

if [ $# -eq 0 ]; then
    echo "Usage: $0 <backup_file.sql>"
    echo ""
    echo "Available backup files:"
    ls -lh database_backup_*.sql 2>/dev/null || echo "No backup files found"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "⚠️  WARNING: This will overwrite your current database!"
echo "Backup file: $BACKUP_FILE"
echo "File size: $(du -h "$BACKUP_FILE" | cut -f1)"
echo ""
read -p "Are you sure you want to continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Restore cancelled."
    exit 1
fi

echo "Restoring database from $BACKUP_FILE..."

# Restore using psql
psql "postgresql://postgres:postgres@localhost:54322/postgres" < "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Database restored successfully from: $BACKUP_FILE"
else
    echo "❌ Database restore failed!"
    exit 1
fi