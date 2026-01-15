# WebSocket Server Dockerfile
FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app

COPY package*.json ./

RUN npm ci

# Development stage
FROM base AS development
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=development

EXPOSE 3003 3004

CMD ["npm", "run", "dev"]

# Build stage
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production stage
FROM base AS production
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 wsserver

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

RUN mkdir -p logs && chown -R wsserver:nodejs logs

USER wsserver

EXPOSE 3003 3004

CMD ["npm", "start"]
