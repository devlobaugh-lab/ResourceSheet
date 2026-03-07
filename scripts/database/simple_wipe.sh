#!/bin/bash

# Simple script to execute the database wipe using psql directly
# This bypasses the Node.js environment variable issues

echo "🚀 Starting simple database wipe process..."

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "❌ psql command not found. Please install PostgreSQL client."
    exit 1
fi

# Check if the SQL script exists
if [ ! -f "scripts/wipe_drivers_and_collections.sql" ]; then
    echo "❌ SQL script not found at scripts/wipe_drivers_and_collections.sql"
    exit 1
fi

echo "📝 Executing wipe script using psql..."

# Execute the SQL script
# You'll need to replace these with your actual database connection details
echo "⚠️  Please provide your database connection details when prompted."
echo "⚠️  Or set them as environment variables: PGHOST, PGUSER, PGDATABASE, PGPASSWORD"

psql -f scripts/wipe_drivers_and_collections.sql

if [ $? -eq 0 ]; then
    echo "✅ Wipe completed successfully!"
    echo "📊 Verifying wipe results..."
    
    # Quick verification
    psql -c "SELECT 'Drivers: ' || COUNT(*) FROM drivers; SELECT 'Car Parts: ' || COUNT(*) FROM car_parts; SELECT 'Collections: ' || COUNT(*) FROM collections; SELECT 'User Drivers: ' || COUNT(*) FROM user_drivers; SELECT 'User Car Parts: ' || COUNT(*) FROM user_car_parts;"
    
    echo "🎉 Database wipe process completed!"
else
    echo "❌ Wipe failed. Please check the error messages above."
    exit 1
fi