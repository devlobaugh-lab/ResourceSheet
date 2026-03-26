# Production Database Backup

Run this before deploying migrations or significant changes to prod.

## Get the connection string

Supabase dashboard → **Settings → Database → Connection string → Direct connection** (not pooler — `pg_dump` doesn't work through pooler):

```
postgresql://postgres:[PASSWORD]@db.[project-ref].supabase.co:5432/postgres
```

---

## Option A — Supabase CLI

```bash
# Schema only
supabase db dump --db-url "postgresql://postgres:[PASSWORD]@db.[project-ref].supabase.co:5432/postgres" \
  -f prod-backup-$(date +%Y-%m-%d).sql

# Data only
supabase db dump --db-url "postgresql://postgres:[PASSWORD]@db.[project-ref].supabase.co:5432/postgres" \
  --data-only \
  -f prod-backup-data-$(date +%Y-%m-%d).sql
```

## Option B — pg_dump

```bash
pg_dump "postgresql://postgres:[PASSWORD]@db.[project-ref].supabase.co:5432/postgres" \
  --no-owner \
  --no-privileges \
  -f prod-backup-$(date +%Y-%m-%d).sql
```

---

## Restore

```bash
psql "postgresql://postgres:[PASSWORD]@db.[project-ref].supabase.co:5432/postgres" \
  -f prod-backup-2026-03-21.sql
```

---

## Notes

- Use the **direct connection** URL, not the pooler URL — `pg_dump` is incompatible with the pooler.
- Supabase manages `auth.*` and `storage.*` internally. The dump covers your `public` schema cleanly. Restoring auth users on top of existing ones can cause conflicts — for a migration rollback (not a full wipe), the dump is safe to selectively apply.
- If the deploy goes wrong at the app level but doesn't corrupt data, the admin JSON backup (`/admin` → System Backup → Export) is enough. This SQL dump is the safety net if a migration itself causes damage.
