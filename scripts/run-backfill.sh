#!/bin/sh
# Run the Internet Archive links backfill script
# This script is idempotent and can be run multiple times safely

set -e

echo "Starting Internet Archive links backfill..."
node --loader tsx ./scripts/backfill-ia-links.ts

echo "Backfill completed successfully"
