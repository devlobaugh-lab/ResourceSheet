#!/bin/bash

# Script to execute the database wipe using the local Supabase database
# Uses the local development database connection

echo "🚀 Starting local Supabase database wipe process..."

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "❌ psql command not found. Please install PostgreSQL client."
    echo "   You can install it with: sudo apt-get install postgresql-client"
    exit 1
fi

# Check if the SQL script exists
if [ ! -f "scripts/wipe_drivers_and_collections.sql" ]; then
    echo "❌ SQL script not found at scripts/wipe_drivers_and_collections.sql"
    exit 1
fi

echo "📝 Executing wipe script using local Supabase database..."

# Use the local Supabase database connection
# From supabase status output: postgresql://postgres:postgres@127.0.0.1:54322/postgres
DB_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"

echo "Using database URL: $DB_URL"

# Execute the SQL script
PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -f scripts/wipe_drivers_and_collections.sql

if [ $? -eq 0 ]; then
    echo "✅ Wipe completed successfully!"
    echo "📊 Verifying wipe results..."
    
    # Quick verification
    echo "Checking table counts..."
    PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -c "
        SELECT 'Drivers: ' || COUNT(*) FROM drivers;
        SELECT 'Car Parts: ' || COUNT(*) FROM car_parts;
        SELECT 'Collections: ' || COUNT(*) FROM collections;
        SELECT 'User Drivers: ' || COUNT(*) FROM user_drivers;
        SELECT 'User Car Parts: ' || COUNT(*) FROM user_car_parts;
    "
    
    echo "🎉 Local Supabase database wipe process completed!"
else
    echo "❌ Wipe failed. Please check the error messages above."
    exit 1
fi