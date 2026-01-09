# 1. Base image
FROM node:20-alpine AS base
ENV NODE_ENV=production

# 2. Dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --include=dev

# 3. Production Dependencies - Install only production dependencies
FROM base AS production-deps 
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# 4. Builder - Compile the code
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# This runs 'react-router build'
RUN npm run build

# 5. Runner - Production image
FROM base AS runner
WORKDIR /app

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 reactrouter

# Copy necessary files
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build ./build
# If you have a public folder with static assets, copy it too
# COPY --from=builder /app/public ./public 
# Copy Drizzle config and SQL migrations
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder /app/drizzle ./drizzle

# Copy the source code for the migration script
COPY --from=builder /app/app/db ./app/db

# Switch to non-root user
USER reactrouter

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Run migrations and start the server
# Note: In a complex cluster, migrations should be a separate job. 
# For MVP, running them on start is usually fine.
CMD ["sh", "-c", "npm run db:migrate && npm run start"]