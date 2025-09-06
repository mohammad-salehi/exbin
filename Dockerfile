# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS deps
WORKDIR /app

# Copy and install dependencies
COPY package*.json ./
RUN npm ci

# Ensure clsx is installed in case it's missing from package.json
RUN npm install clsx@latest --save

FROM node:20-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the Next.js app
RUN npm run build
RUN npm prune --omit=dev

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=4173

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 4173
CMD ["sh", "-c", "npm run start -- -p ${PORT:-4173}"]
