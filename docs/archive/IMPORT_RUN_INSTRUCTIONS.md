# Import Run Instructions

How to run the parent-table import runner (created by the rescue agent):

1. From the repo root run:

   PGPASSWORD=postgres bash scripts/import_parent_strict.sh

   - By default the script uses: `backups/backup_full_2026-02-13T18-49-34-185Z.sql`.
   - To use a different backup file pass it as the first argument:

   PGPASSWORD=postgres bash scripts/import_parent_strict.sh backups/your_backup.sql

2. Output and logs:

   - Logs are written to `import_logs/parent_run_<TIMESTAMP>/` inside the workspace.
   - A human-readable report is emitted to `docs/development/IMPORT_RUN_<TIMESTAMP>.md`.

3. Post-run checks:

   - Inspect the per-table `*.err` files in the log dir for any errors.
   - Confirm per-table counts appended in `summary.txt`.
   - After parent imports succeed, run child-table import (can be implemented similarly).

4. Finalization steps (do after confirming data):

   - Re-enable NOT NULL and constraints as described in `scripts/prepare_import.sql` comments.
   - Restore triggers/session replication role if you changed it.
