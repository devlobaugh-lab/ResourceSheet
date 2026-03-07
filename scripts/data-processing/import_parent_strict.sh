#!/usr/bin/env bash
set -euo pipefail

# Robust parent-table importer for DATABASE_RESCUE
# Usage: PGPASSWORD=postgres ./scripts/import_parent_strict.sh /path/to/backup.sql

BACKUP_FILE=${1:-backups/backup_full_2026-02-13T18-49-34-185Z.sql}
PGHOST=${PGHOST:-127.0.0.1}
PGPORT=${PGPORT:-54322}
PGUSER=${PGUSER:-postgres}
PGDB=${PGDB:-temp_import}
: ${PGPASSWORD:=${PGPASSWORD:-postgres}}

TIMESTAMP=$(date -u +%Y%m%dT%H%M%SZ)
LOGDIR=import_logs/parent_run_$TIMESTAMP
mkdir -p "$LOGDIR"

echo "Import run timestamp: $TIMESTAMP" > "$LOGDIR/summary.txt"
echo "backup_file: $BACKUP_FILE" >> "$LOGDIR/summary.txt"
echo "pg: $PGHOST:$PGPORT db:$PGDB user:$PGUSER" >> "$LOGDIR/summary.txt"

echo "Applying prepare_import.sql" >> "$LOGDIR/summary.txt"
psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDB" -f scripts/prepare_import.sql > "$LOGDIR/prepare.out" 2> "$LOGDIR/prepare.err" || true
cat "$LOGDIR/prepare.err" >> "$LOGDIR/summary.txt" || true

tables=(seasons tracks collections car_parts drivers boosts users profiles)

for t in "${tables[@]}"; do
  echo "---- IMPORT $t ----" >> "$LOGDIR/summary.txt"
  grep -P "^INSERT INTO\s+$t\s+\(" "$BACKUP_FILE" > "$LOGDIR/${t}_inserts.sql" || true
  sed -E 's/;\s*$/ ON CONFLICT (id) DO NOTHING;/' "$LOGDIR/${t}_inserts.sql" > "$LOGDIR/${t}_inserts_ready.sql" || true
  echo "prepared file: $LOGDIR/${t}_inserts_ready.sql (size: $(wc -c < "$LOGDIR/${t}_inserts_ready.sql") bytes)" >> "$LOGDIR/summary.txt"

  # Run psql with ON_ERROR_STOP to fail fast and capture stdout/stderr
  if [ -s "$LOGDIR/${t}_inserts_ready.sql" ]; then
    PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDB" --set=ON_ERROR_STOP=on -f "$LOGDIR/${t}_inserts_ready.sql" > "$LOGDIR/${t}.out" 2> "$LOGDIR/${t}.err" || {
      echo "$t import failed" >> "$LOGDIR/summary.txt"
      echo "--- ${t}.err ---" >> "$LOGDIR/summary.txt"
      sed -n '1,200p' "$LOGDIR/${t}.err" >> "$LOGDIR/summary.txt" || true
      echo "Full logs in $LOGDIR" >> "$LOGDIR/summary.txt"
      echo "Import failed at table $t. See $LOGDIR for details." >&2
      exit 1
    }
  else
    echo "no inserts found for $t (skipping)" >> "$LOGDIR/summary.txt"
    touch "$LOGDIR/${t}.out" "$LOGDIR/${t}.err"
  fi

  # record count (try public schema)
  cnt=$(PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDB" -t -A -c "SELECT count(*) FROM public.$t;" 2>/dev/null || echo "0")
  echo "$t row_count:$cnt" >> "$LOGDIR/summary.txt"
done

echo "Parent imports completed successfully" >> "$LOGDIR/summary.txt"
echo "Logs directory: $LOGDIR" >> "$LOGDIR/summary.txt"

# Create a human-readable report in docs
REPORT_FILE=docs/development/IMPORT_RUN_${TIMESTAMP}.md
mkdir -p docs/development
{
  echo "# Import Run $TIMESTAMP"
  echo
  echo "Backup: $BACKUP_FILE"
  echo
  echo "Log directory: $LOGDIR"
  echo
  echo '## Summary'
  sed -n '1,200p' "$LOGDIR/summary.txt" || true
  echo
  echo '## Per-table stderr (first 200 lines)'
  for t in "${tables[@]}"; do
    echo "### $t.err"
    sed -n '1,200p' "$LOGDIR/${t}.err" || true
    echo
  done
} > "$REPORT_FILE"

echo "Report written to $REPORT_FILE"
echo "DONE"
