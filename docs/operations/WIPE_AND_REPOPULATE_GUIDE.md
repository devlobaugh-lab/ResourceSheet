# Driver and Collections Data Wipe & Repopulate Guide

This guide provides a comprehensive process for safely wiping and repopulating driver and collections data in the F1 Resource Manager application.

## Overview

The application uses separate tables for drivers and collections:
- `drivers` table - stores driver information
- `car_parts` table - stores car part information  
- `collections` table - stores collection metadata
- `user_drivers` table - stores user-specific driver data
- `user_car_parts` table - stores user-specific car part data

## Prerequisites

1. **Environment Setup**: Ensure your `.env.local` file contains:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

2. **Database Access**: You need access to execute SQL commands on your Supabase database

3. **Content Cache File**: Have a valid `content_cache.json` file ready for import

## Process Overview

### Phase 1: Preparation
1. **Backup Current Data** - Create safety backups
2. **Verify Current State** - Check existing data

### Phase 2: Safe Wipe
1. **Execute Database Wipe** - Clear drivers and collections data
2. **Verify Wipe Success** - Confirm data was removed

### Phase 3: Repopulate
1. **Import via Content Cache** - Use admin interface to import clean data
2. **Verify Import Success** - Confirm data was imported correctly

### Phase 4: Validation
1. **Test Application** - Verify Special Edition drivers show correct names
2. **Test Functionality** - Ensure all features work correctly

## Step-by-Step Instructions

### Step 1: Create Backup

```bash
# Option 1: Use existing backup script
./backup_restore.sh

# Option 2: Manual backup using psql
pg_dump -h your-host -U your-user -d your-database -t drivers -t car_parts -t collections -t user_drivers -t user_car_parts > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Step 2: Execute Safe Wipe

**Option 1: Use Supabase Studio (Recommended - no additional tools required)**

1. Open Supabase Studio at **http://127.0.0.1:54323**
2. Navigate to **SQL Editor** → **New query**
3. Copy and paste the SQL commands from `scripts/wipe_drivers_and_collections_simple.sql`
4. Click **"Run"**
5. Verify the wipe was successful

**Option 2: Use Local Supabase Database (if psql is available)**

```bash
# Make the script executable and run it
chmod +x scripts/local_supabase_wipe.sh
./scripts/local_supabase_wipe.sh
```

**Option 3: Use simple script (if psql is available)**

```bash
# Make the script executable and run it
chmod +x scripts/simple_wipe.sh
./scripts/simple_wipe.sh
```

**Option 4: Direct SQL execution with local Supabase**

```bash
# Execute the SQL script directly using your local Supabase database
PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -f scripts/wipe_drivers_and_collections.sql
```

**Option 5: Use SQL script directly (if psql is available)**

```bash
# Use SQL script directly (replace with your connection details)
psql -h your-host -U your-user -d your-database -f scripts/wipe_drivers_and_collections.sql
```

**Option 6: Use Node.js script (may require environment variable fixes)**

```bash
node scripts/execute_wipe.js
```

### Step 3: Verify Wipe

```sql
-- Check that tables are empty
SELECT COUNT(*) FROM drivers;
SELECT COUNT(*) FROM car_parts; 
SELECT COUNT(*) FROM collections;
SELECT COUNT(*) FROM user_drivers;
SELECT COUNT(*) FROM user_car_parts;
```

Expected results: All counts should be 0.

### Step 4: Import Clean Data

1. **Access Admin Interface**: Navigate to `/admin/content-cache` in your application
2. **Upload Content Cache**: Select your `content_cache.json` file
3. **Set Season Filter**: Specify which seasons to import (e.g., "6" for season 6)
4. **Choose Mode**: 
   - **Change Detection Mode** (default) - Only adds new items, doesn't modify existing ones
   - **Override Mode** - Allows modifications to existing items (use with caution)
5. **Upload & Process**: Click "Upload & Process"

### Step 5: Verify Import

The import system will provide a detailed report showing:
- New items added
- Modified items (if in Override Mode)
- Unchanged items
- Any errors or issues

### Step 6: Test Application

1. **Navigate to Drivers Page**: `/drivers`
2. **Verify Special Edition Drivers**: Check that SE drivers show collection names like "Hot Prospects-2" instead of "Special Edition"
3. **Test Collections Context**: Ensure collections are properly linked to drivers
4. **Test Driver Comparison**: Verify the comparison functionality works correctly

## Testing the Process

You can run a comprehensive test of the entire process:

```bash
# Run the complete test suite
node scripts/test_wipe_and_repopulate.js
```

This test will:
1. Create a backup of current data
2. Execute the wipe process
3. Verify the wipe was successful
4. Test import compatibility
5. Restore from backup
6. Verify the restore was successful

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Ensure `SUPABASE_SERVICE_ROLE_KEY` is set correctly
   - Verify your Supabase project URL is correct

2. **Import Failures**
   - Check that your `content_cache.json` file is valid JSON
   - Verify the file contains the expected structure
   - Ensure season filter matches the data in your file

3. **Collection Names Not Showing**
   - Verify collections were imported successfully
   - Check that drivers have the correct `collection_id` values
   - Ensure the collections context is working properly

### Rollback Procedures

If something goes wrong, you can restore from your backup:

```bash
# Restore from SQL backup
psql -h your-host -U your-user -d your-database < backup_file.sql

# Or use Supabase CLI
supabase sql -f backup_file.sql
```

## Files Created

This implementation includes:

1. **`scripts/wipe_drivers_and_collections.sql`** - SQL script for safe data wipe
2. **`scripts/wipe_drivers_and_collections_simple.sql`** - Simplified SQL script (no sequence issues)
3. **`scripts/execute_wipe.js`** - Node.js script to execute the wipe
4. **`scripts/test_wipe_and_repopulate.js`** - Comprehensive test suite
5. **`scripts/studio_wipe_instructions.md`** - Detailed Supabase Studio instructions
6. **`scripts/local_supabase_wipe.sh`** - Local Supabase database script
7. **`scripts/simple_wipe.sh`** - Alternative psql script
8. **Updated `src/app/api/admin/content-cache/upload/route.ts`** - Fixed to work with separate tables
9. **Updated `src/components/DataGrid.tsx`** - Fixed infinite render loop and improved collection display

## Safety Features

- **Preserves User Data**: Only wipes driver and collection data, keeps user progress
- **Backup Creation**: Always create backups before wiping
- **Verification Steps**: Multiple verification points to ensure success
- **Rollback Capability**: Easy restoration from backups if needed
- **Change Detection**: Import system can detect and report changes without modifying existing data

## Notes

- The content cache import system has been updated to work with the separate table structure
- Collections are now properly imported and linked to drivers
- The import system provides detailed reporting of all changes
- Special Edition drivers should now display their correct collection names after import

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the test output for detailed error information
3. Verify your environment variables are set correctly
4. Ensure you have proper database access permissions