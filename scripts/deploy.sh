#!/bin/bash

git pull origin main
npm ci
npx prisma generate 
npx prisma migrate deploy 
npm run build 
pm2 start ecosystem.config.cjs --env production