# Database Wipe Instructions Using Supabase Studio

Since `psql` is not available, you can perform the database wipe using the Supabase Studio interface.

## Step 1: Access Supabase Studio

Your local Supabase Studio is running at: **http://127.0.0.1:54323**

## Step 2: Navigate to SQL Editor

1. Open Supabase Studio in your browser
2. Click on **"SQL Editor"** in the left sidebar
3. Click on **"New query"** to create a new SQL query

## Step 3: Execute the Wipe Script

Copy and paste the following SQL commands into the SQL Editor and click **"Run"**:

```sql
-- Disable triggers temporarily to avoid conflicts
ALTER TABLE drivers DISABLE TRIGGER ALL;
ALTER TABLE car_parts DISABLE TRIGGER ALL;
ALTER TABLE collections DISABLE TRIGGER ALL;
ALTER TABLE user_drivers DISABLE TRIGGER ALL;
ALTER TABLE user_car_parts DISABLE TRIGGER ALL;

-- Clear data from the tables we want to wipe
DELETE FROM user_drivers;
DELETE FROM user_car_parts;
DELETE FROM drivers;
DELETE FROM car_parts;
DELETE FROM collections;

-- Re-enable triggers
ALTER TABLE drivers ENABLE TRIGGER ALL;
ALTER TABLE car_parts ENABLE TRIGGER ALL;
ALTER TABLE collections ENABLE TRIGGER ALL;
ALTER TABLE user_drivers ENABLE TRIGGER ALL;
ALTER TABLE user_car_parts ENABLE TRIGGER ALL;

-- Verify the wipe was successful
SELECT 'Drivers count: ' || COUNT(*) FROM drivers;
SELECT 'Car parts count: ' || COUNT(*) FROM car_parts;
SELECT 'Collections count: ' || COUNT(*) FROM collections;
SELECT 'User drivers count: ' || COUNT(*) FROM user_drivers;
SELECT 'User car parts count: ' || COUNT(*) FROM user_car_parts;
```

## Step 4: Verify the Wipe

After running the script, execute this query to verify the wipe was successful:

```sql
SELECT 'Drivers count: ' || COUNT(*) FROM drivers
UNION ALL
SELECT 'Car parts count: ' || COUNT(*) FROM car_parts
UNION ALL
SELECT 'Collections count: ' || COUNT(*) FROM collections
UNION ALL
SELECT 'User drivers count: ' || COUNT(*) FROM user_drivers
UNION ALL
SELECT 'User car parts count: ' || COUNT(*) FROM user_car_parts;
```

Expected results: All counts should be 0.

## Step 5: Import Clean Data

1. Navigate to your application's admin interface at `/admin/content-cache`
2. Upload your `content_cache.json` file
3. Set the season filter and choose the appropriate mode
4. Click "Upload & Process"

## Alternative: Use the SQL File

If you prefer to use the SQL file directly:

1. Open the file `scripts/wipe_drivers_and_collections.sql` in your text editor
2. Copy all the SQL commands from the file
3. Paste them into the Supabase Studio SQL Editor
4. Click "Run"

## Notes

- This method uses the Supabase Studio interface, which is accessible through your local development environment
- No additional tools or installations are required
- The process is the same as running the SQL script directly
- You can see the results immediately in the Studio interface

## Troubleshooting

If you encounter any issues:
1. Make sure Supabase Studio is running (check `supabase status`)
2. Ensure you're connected to the correct database
3. Check that you have the necessary permissions
4. Verify the SQL syntax is correct

This method provides a user-friendly way to execute the database wipe without requiring additional command-line tools.