#!/bin/sh
set -e

DB_PATH="/app/data/mydb.sqlite"

# Only run migrations and seeding if database doesn't exist or is empty
if [ ! -f "$DB_PATH" ] || [ ! -s "$DB_PATH" ]; then
    echo "Database not found or empty. Running migrations..."
    bun run db:push
    echo "Migrations completed."
    
    echo "Seeding database..."
    bun scripts/seed.ts
    echo "Seeding completed."
else
    echo "Database exists, skipping migrations and seeding."
fi

# Start the application
echo "Starting application..."
exec bun run ./build/index.js
