# Multi-stage production Dockerfile for CareerPilot Profile Service
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine AS runner

WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PORT=5002

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY package*.json ./
COPY src/ ./src/

USER node

EXPOSE 5002

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5002/health || exit 1

CMD ["node", "src/server.js"]
