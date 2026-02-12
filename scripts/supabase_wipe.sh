#!/bin/bash

# Script to execute the database wipe using Supabase CLI
# This works with your local Supabase setup

echo "🚀 Starting Supabase database wipe process..."

# Check if supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "   npm install -g @supabase/supabase"
    echo "   or follow: https://supabase.com/docs/guides/cli"
    exit 1
fi

# Check if the SQL script exists
if [ ! -f "scripts/wipe_drivers_and_collections.sql" ]; then
    echo "❌ SQL script not found at scripts/wipe_drivers_and_collections.sql"
    exit 1
fi

echo "📝 Executing wipe script using Supabase CLI..."

# Execute the SQL script using Supabase CLI
supabase sql -f scripts/wipe_drivers_and_collections.sql

if [ $? -eq 0 ]; then
    echo "✅ Wipe completed successfully!"
    echo "📊 Verifying wipe results..."
    
    # Quick verification using Supabase CLI
    echo "Checking table counts..."
    supabase sql -c "SELECT 'Drivers: ' || COUNT(*) FROM drivers;"
    supabase sql -c "SELECT 'Car Parts: ' || COUNT(*) FROM car_parts;"
    supabase sql -c "SELECT 'Collections: ' || COUNT(*) FROM collections;"
    supabase sql -c "SELECT 'User Drivers: ' || COUNT(*) FROM user_drivers;"
    supabase sql -c "SELECT 'User Car Parts: ' || COUNT(*) FROM user_car_parts;"
    
    echo "🎉 Database wipe process completed!"
else
    echo "❌ Wipe failed. Please check the error messages above."
    exit 1
fi