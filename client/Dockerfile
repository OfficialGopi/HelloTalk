# BASE IMAGE
FROM node:22-alpine AS base
WORKDIR /app

# BUILDER STAGE
FROM base AS builder
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# PRODUCTION STAGE
FROM base AS production
WORKDIR /app
COPY --from=builder /app/dist ./dist

# Install serve globally
RUN npm install -g serve

EXPOSE 3000

# Run serve on build output
CMD ["serve", "-s", "dist", "-l", "3000"]