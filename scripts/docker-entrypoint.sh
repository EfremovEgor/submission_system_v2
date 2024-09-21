#!/bin/bash

echo "Apply database migrations"

npx prisma migrate deploy

node -r dotenv/config build