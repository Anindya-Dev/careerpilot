# Multi-stage production Dockerfile for CareerPilot Auth Service
# Stage 1: Build & Dependencies
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Production Distroless / Minimal Alpine Runner
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

# Set production environment
ENV NODE_ENV=production
ENV PORT=5001

# Copy production node_modules from builder
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY package*.json ./
COPY src/ ./src/

# Run as non-root user for enterprise container security
USER node

EXPOSE 5001

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5001/health || exit 1

CMD ["node", "src/server.js"]
