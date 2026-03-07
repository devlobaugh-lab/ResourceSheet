#!/usr/bin/env bash
set -euo pipefail

# Usage: PGPASSWORD=postgres ./scripts/import_ordered.sh /path/to/backup.sql
BACKUP_FILE=${1:-backups/backup_full_2026-02-13T18-49-34-185Z.sql}
PGHOST=${PGHOST:-127.0.0.1}
PGPORT=${PGPORT:-54322}
PGUSER=${PGUSER:-postgres}
PGDB=${PGDB:-postgres}
: ${PGPASSWORD:=${PGPASSWORD:-postgres}}

echo "Preparing schema alterations..."
psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDB" -f scripts/prepare_import.sql

# Tables to import first (parents / reference data)	
tables=("seasons" "tracks" "collections" "car_parts" "drivers" "boosts" "users" "profiles")

for t in "${tables[@]}"; do
  echo "Importing table: $t"
  # Extract INSERTs for the table and add ON CONFLICT (id) DO NOTHING for id PK tables
  grep -P "^INSERT INTO\s+$t\s+\(" "$BACKUP_FILE" || true | \
    sed -E 's/;\s*$/ ON CONFLICT (id) DO NOTHING;/' | \
    psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDB"
done

# Import remaining INSERTs (tables not in parent list)
echo "Importing remaining tables..."
# Build grep exclude pattern
exclude_pattern=$(printf "|%s" "${tables[@]}")
exclude_pattern=${exclude_pattern:1}

# Use awk to select INSERT INTO lines not matching parent tables
awk '/^INSERT INTO/ {print}' "$BACKUP_FILE" | grep -Ev "^INSERT INTO\s+(${exclude_pattern})\s+\(" || true | \
  sed -E 's/;\s*$/ ON CONFLICT (id) DO NOTHING;/' | \
  psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDB"

echo "Import finished. Review psql output for errors."

echo "IMPORTANT: After verifying data, run the finalization steps to re-add NOT NULL/constraints and triggers." 

# Example finalize steps (do after manual verification):
# psql -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDB -c "ALTER TABLE public.boosts ALTER COLUMN rarity SET NOT NULL;"
# psql -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDB -c "ALTER TABLE public.collections ALTER COLUMN rarity SET NOT NULL;"
# Restore session_replication_role if changed earlier.

