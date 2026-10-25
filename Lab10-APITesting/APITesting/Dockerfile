# Stage 1: Build
FROM node:24-bookworm-slim AS build
WORKDIR /app

# 1. Copy dependencies specification & install
COPY package*.json ./
RUN npm ci

# 2. Copy configs, Prisma schema & generate client
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY prisma7.config.ts ./
COPY prisma ./prisma
RUN npx prisma generate

# 3. Copy source and compile TypeScript
COPY src ./src
RUN npm run build

# Stage 2: Runtime
FROM node:24-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Install production-only dependencies
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Setup Prisma client for runtime
COPY prisma ./prisma
COPY prisma7.config.ts ./
RUN npx prisma generate

# Copy compiled JavaScript from build stage
COPY --from=build --chown=node:node /app/dist ./dist

USER node
EXPOSE 3000

# Entrypoint point to dist/src/main.jsÍ
CMD ["node", "dist/src/main.js"]
