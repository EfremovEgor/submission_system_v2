FROM node:20 AS build

WORKDIR /app

COPY package*.json .

RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build
RUN npm prune --production

FROM node:20 AS run

ENV NODE_ENV=production

WORKDIR /app
COPY .env ./
COPY ./scripts ./scripts
COPY ./email_templates ./email_templates
COPY --from=build /app/build ./build
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma
RUN ulimit -c unlimited
ENTRYPOINT ["/bin/bash", "./scripts/docker-entrypoint.sh"]