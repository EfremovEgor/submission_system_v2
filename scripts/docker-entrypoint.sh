#!/bin/sh
set -e

echo "Apply database migrations"
node -r dotenv/config node_modules/prisma/build/index.js migrate deploy --schema prisma/schema

exec node -r dotenv/config build
