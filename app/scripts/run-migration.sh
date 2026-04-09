#!/bin/bash
# Run Phase 13 Migration
# Usage: ./scripts/run-migration.sh <database-password>

if [ -z "$1" ]; then
  echo "Usage: ./scripts/run-migration.sh <database-password>"
  echo ""
  echo "Get your database password from:"
  echo "https://supabase.com/dashboard/project/gfqozoqlicpfmdstmelw/settings/database"
  echo ""
  echo "Or run the SQL manually at:"
  echo "https://supabase.com/dashboard/project/gfqozoqlicpfmdstmelw/sql/new"
  exit 1
fi

DB_PASSWORD="$1"
DB_HOST="aws-0-ap-southeast-1.pooler.supabase.com"
DB_PORT="6543"
DB_NAME="postgres"
DB_USER="postgres.gfqozoqlicpfmdstmelw"

echo "Running Phase 13 migration..."
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f supabase/migrations/012_openclaw_channels.sql

if [ $? -eq 0 ]; then
  echo "✓ Migration completed successfully!"
else
  echo "✗ Migration failed. Check the error above."
  exit 1
fi
