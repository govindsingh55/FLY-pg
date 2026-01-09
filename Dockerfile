# syntax=docker/dockerfile:1

# Use the latest Bun image as base
FROM oven/bun:latest AS base
WORKDIR /app

# Install dependencies (all deps needed for build)
FROM base AS deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Create data directory and set build-time environment variables
# DB_FILE_NAME is required by drizzle config during build
RUN mkdir -p /app/data /app/drizzle
ENV DB_FILE_NAME=/app/data/mydb.sqlite

# Build SvelteKit app
RUN bun run build

# Production image
FROM oven/bun:latest AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy built application and dependencies
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Copy drizzle config for runtime migration (drizzle dir may be empty if using db:push)
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/drizzle.config.ts ./

# Copy src/lib for seeding scripts (needed for $lib path resolution)
COPY --from=builder /app/src/lib ./src/lib

# Copy scripts for seeding
COPY --from=builder /app/scripts ./scripts

# Copy entrypoint script
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Create directories for volumes (db and static files)
RUN mkdir -p /app/data /app/static/uploads

# Expose the port
EXPOSE 4173

# Set environment variables for SvelteKit
ENV HOST=0.0.0.0
ENV PORT=4173
ENV ORIGIN=http://localhost:4173
ENV BODY_SIZE_LIMIT=Infinity
ENV DB_FILE_NAME=/app/data/mydb.sqlite

# Volume mounts for persistent data
# - /app/data: Database files (mydb.sqlite)
# - /app/static/uploads: User uploaded static files
VOLUME ["/app/data", "/app/static/uploads"]

# Use entrypoint script to run migrations then start app
ENTRYPOINT ["./docker-entrypoint.sh"]
