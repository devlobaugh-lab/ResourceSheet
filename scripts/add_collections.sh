#!/bin/bash

# Script to add missing collections for Special Edition drivers

echo "Adding missing collections for Special Edition drivers..."

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "Error: psql command not found. Please install PostgreSQL client."
    exit 1
fi

# Get database URL from environment or use default
DB_URL="${DATABASE_URL:-postgresql://postgres:postgres@localhost:5432/postgres}"

echo "Using database URL: $DB_URL"

# Execute the SQL script
psql "$DB_URL" -f scripts/add_missing_collections.sql

if [ $? -eq 0 ]; then
    echo "Successfully added missing collections!"
else
    echo "Failed to add collections. Please check the database connection and permissions."
    exit 1
fi