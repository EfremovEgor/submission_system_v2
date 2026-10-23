# Built locally (scripts/deploy.sh) and pulled by the server: the VPS is too small
# to run the vite build next to everything else.
FROM node:24-bookworm-slim AS build
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json .npmrc ./
RUN npm ci --no-audit --no-fund
COPY prisma ./prisma
RUN npx prisma generate --schema prisma/schema
COPY . .
RUN npm run build

FROM node:24-bookworm-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production
# node_modules stay whole: the prisma CLI (a dev dependency) runs migrations on start.
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/build ./build
COPY package.json ./
COPY prisma ./prisma
COPY email_templates ./email_templates
COPY scripts/docker-entrypoint.sh ./docker-entrypoint.sh
RUN sed -i 's/\r$//' docker-entrypoint.sh && chmod +x docker-entrypoint.sh
# Secrets come from the .env mounted at /app/.env at runtime, never from the image.
CMD ["./docker-entrypoint.sh"]
