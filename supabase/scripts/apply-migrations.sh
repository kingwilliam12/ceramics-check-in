#!/bin/bash

# Apply database migrations to Supabase
# Usage: ./apply-migrations.sh [project-ref] [db-password] [region]

set -e

if [ $# -lt 3 ]; then
  echo "Usage: $0 [project-ref] [db-password] [region]"
  echo "Example: $0 abc123def456 supersecretpassword us-east-1"
  exit 1
fi

PROJECT_REF="$1"
DB_PASSWORD="$2"
REGION="$3"

# Install psql if not already installed
if ! command -v psql &> /dev/null; then
  echo "PostgreSQL client (psql) is not installed. Installing..."
  if [[ "$OSTYPE" == "darwin"* ]]; then
    brew install libpq
    echo 'export PATH="/opt/homebrew/opt/libpq/bin:$PATH"' >> ~/.zshrc
    source ~/.zshrc
  else
    echo "Please install PostgreSQL client (psql) and ensure it's in your PATH."
    exit 1
  fi
fi

# Create a temporary directory for migration files
echo "Preparing migration files..."
TMP_DIR=$(mktemp -d)
mkdir -p "$TMP_DIR/migrations"

# Copy migration files to temporary directory
find "$(pwd)/migrations" -type f -name "*.sql" | sort | while read -r file; do
  cp "$file" "$TMP_DIR/migrations/$(basename "$file")"
done

# Create a connection string
CONNECTION_STRING="postgresql://postgres:${DB_PASSWORD}@db.${PROJECT_REF}.supabase.co:5432/postgres"

# Apply migrations using migra
echo "Checking for migra..."
if ! command -v migra &> /dev/null; then
  echo "Installing migra..."
  pip install --user migra
  export PATH="$HOME/Library/Python/3.9/bin:$PATH"
fi

echo "Applying migrations..."
for migration in $(ls -1 "$TMP_DIR/migrations/" | sort); do
  echo "Applying migration: $migration"
  psql "$CONNECTION_STRING" -f "$TMP_DIR/migrations/$migration"
done

# Clean up
rm -rf "$TMP_DIR"

echo "Migrations applied successfully!"
echo "You can now access your Supabase database at:"
echo "Host: db.${PROJECT_REF}.supabase.co"
echo "Port: 5432"
echo "Database: postgres"
echo "Username: postgres"

echo "\nTo connect using psql:"
echo "psql postgresql://postgres:YOUR_PASSWORD@db.${PROJECT_REF}.supabase.co:5432/postgres"
