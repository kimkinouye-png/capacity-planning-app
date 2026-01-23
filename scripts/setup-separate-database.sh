#!/bin/bash

# Setup Separate Database for capacity-planner-2
# This script helps set up a new Neon database and provides instructions

set -e

echo "=========================================="
echo "Separate Database Setup for capacity-planner-2"
echo "=========================================="
echo ""

echo "This script will help you:"
echo "1. Create a new Neon database"
echo "2. Run migrations"
echo "3. Update Netlify environment variables"
echo ""

# Check if connection string is provided
if [ -z "$1" ]; then
    echo "Usage: ./scripts/setup-separate-database.sh <connection-string>"
    echo ""
    echo "Example:"
    echo "  ./scripts/setup-separate-database.sh 'postgresql://user:pass@host/db'"
    echo ""
    echo "Or run migrations manually:"
    echo "  1. Go to Neon Console → SQL Editor"
    echo "  2. Run database/schema.sql"
    echo "  3. Run database/migrations/add-date-columns.sql"
    exit 1
fi

CONNECTION_STRING="$1"

echo "Setting up database with connection string: ${CONNECTION_STRING:0:30}..."
echo ""

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "⚠️  psql not found. Please install PostgreSQL client tools."
    echo ""
    echo "Alternative: Use Neon SQL Editor:"
    echo "  1. Go to https://console.neon.tech"
    echo "  2. Select your database"
    echo "  3. Open SQL Editor"
    echo "  4. Copy and paste contents of database/schema.sql"
    echo "  5. Run it"
    echo "  6. Copy and paste contents of database/migrations/add-date-columns.sql"
    echo "  7. Run it"
    exit 1
fi

echo "Running base schema..."
psql "$CONNECTION_STRING" -f database/schema.sql

echo ""
echo "Running date columns migration..."
psql "$CONNECTION_STRING" -f database/migrations/add-date-columns.sql

echo ""
echo "✅ Database setup complete!"
echo ""
echo "Next steps:"
echo "1. Go to Netlify Dashboard → capacity-planner-2 site"
echo "2. Site settings → Environment variables"
echo "3. Set NETLIFY_DATABASE_URL to: $CONNECTION_STRING"
echo "4. Redeploy the site"
echo "5. Test that data is isolated between the two sites"
