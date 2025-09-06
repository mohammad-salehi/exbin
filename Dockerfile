# syntax=docker/dockerfile:1.7
# Simple production Dockerfile (Node 20, multi-stage)
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build
RUN npm prune --omit=dev

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=4173
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
# For Next.js keep .next + public. Adjust if your framework differs.
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
EXPOSE 4173
# Use -p to force port 4173 (works for Next.js: next start -p)
CMD ["sh", "-c", "npm run start -- -p ${PORT:-4173}"]
