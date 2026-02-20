# 🚀 Database Migration & Data Seeding Guide

This guide provides step-by-step instructions to manually run the database migration and seed the new tables.

## 📋 Prerequisites

1. **Supabase CLI** installed and configured
2. **Local Supabase instance** running
3. **Node.js** installed (for data seeding)

## 🔧 Step 1: Fix Supabase Configuration

The Supabase CLI is having issues with the configuration file. Let's fix this:

### Option A: Update Supabase CLI
```bash
npm update -g supabase
```

### Option B: Use Docker Directly
If Supabase CLI continues to have issues, you can use Docker directly:

```bash
# Start Supabase services
docker compose -f supabase/docker-compose.yml up -d

# Check if services are running
docker ps
```

## 📁 Step 2: Apply Database Migration

### Option A: Using Supabase CLI (Recommended)
```bash
# Navigate to project directory
cd /home/christian/code/ResourceSheet

# Apply the migration
npx supabase migration up --local
```

### Option B: Manual SQL Execution
If Supabase CLI fails, you can execute the SQL directly:

```bash
# Connect to PostgreSQL
psql -h localhost -p 54321 -U postgres -d postgres

# Execute the migration SQL
\i supabase/migrations/20260109164845_separate_asset_tables.sql
```

### Option C: Using Supabase Studio
1. Open Supabase Studio: `http://localhost:54323`
2. Go to the SQL Editor
3. Copy and paste the contents of `supabase/migrations/20260109164845_separate_asset_tables.sql`
4. Execute the SQL

## 🌱 Step 3: Seed Data into New Tables

### Option A: Using the Seeding Script
```bash
# Install required dependencies if needed
npm install @supabase/supabase-js

# Run the seeding script
node scripts/seed_new_tables.js
```

### Option B: Manual Data Insertion
If the seeding script fails due to authentication issues, you can insert data manually:

```sql
-- Insert sample driver data
INSERT INTO public.drivers (id, name, rarity, series, season_id, stats_per_level, created_at, updated_at)
VALUES (
    'driver-1',
    'Test Driver',
    3,
    1,
    'season-1',
    '[{"speed": 10, "cornering": 8, "powerUnit": 9, "qualifying": 7, "drs": 5, "pitStopTime": 15, "cardsToUpgrade": 10, "softCurrencyToUpgrade": 500}]',
    NOW(),
    NOW()
);

-- Insert sample car part data
INSERT INTO public.car_parts (id, name, rarity, series, season_id, car_part_type, stats_per_level, created_at, updated_at)
VALUES (
    'car-part-1',
    'Test Engine',
    2,
    1,
    'season-1',
    0, -- Engine type
    '[{"speed": 8, "cornering": 9, "powerUnit": 10, "qualifying": 6, "drs": 4, "pitStopTime": 12, "cardsToUpgrade": 8, "softCurrencyToUpgrade": 300}]',
    NOW(),
    NOW()
);
```

## 🧪 Step 4: Verify the Migration

### Check Tables Exist
```sql
-- List all tables
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';

-- Should include: drivers, car_parts, user_drivers, user_car_parts
```

### Check Data Insertion
```sql
-- Check drivers table
SELECT COUNT(*) FROM public.drivers;

-- Check car parts table
SELECT COUNT(*) FROM public.car_parts;
```

## 🚀 Step 5: Test the API Endpoints

After successful migration and seeding:

```bash
# Test drivers endpoint
curl -X GET http://localhost:3000/api/drivers

# Test car parts endpoint
curl -X GET http://localhost:3000/api/car-parts

# Test user endpoints (requires authentication)
# curl -X GET http://localhost:3000/api/drivers/user
# curl -X GET http://localhost:3000/api/car-parts/user
```

## 🛠 Troubleshooting

### Supabase CLI Configuration Issues
If you continue to have issues with Supabase CLI:

1. **Check configuration file**:
   ```bash
   cat supabase/config.toml
   ```

2. **Update db.major_version**:
   ```toml
   # In supabase/config.toml
   [db]
   major_version = 16  # Change from 17 to 16
   ```

3. **Reinitialize Supabase**:
   ```bash
   npx supabase init
   ```

### Authentication Issues with Seeding Script
If the seeding script fails with authentication errors:

1. **Check your Supabase credentials**:
   ```javascript
   // In scripts/seed_new_tables.js
   const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:54321';
   const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';
   ```

2. **Use environment variables**:
   ```bash
   export SUPABASE_URL='http://localhost:54321'
   export SUPABASE_SERVICE_ROLE_KEY='your-service-role-key'
   node scripts/seed_new_tables.js
   ```

## 🎉 Success Criteria

✅ **Database Migration Complete**:
- All 4 new tables created: `drivers`, `car_parts`, `user_drivers`, `user_car_parts`
- Proper indexes, triggers, and RLS policies applied

✅ **Data Seeding Complete**:
- Drivers table populated with data
- Car parts table populated with data
- Sample data available for testing

✅ **API Endpoints Working**:
- `/api/drivers` returns driver data
- `/api/car-parts` returns car part data
- All endpoints return proper responses

## 📚 Additional Resources

- [Supabase CLI Documentation](https://supabase.com/docs/guides/cli)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Node.js Supabase Client](https://supabase.com/docs/guides/getting-started/tutorials/with-node-js)

---

**Need help?** The refactoring is complete, but if you encounter any issues with the migration process, I can provide additional guidance or alternative approaches.