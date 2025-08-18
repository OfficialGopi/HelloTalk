# BASE IMAGE
FROM node:22-alpine AS base

# WORKING DIRECTORY
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
COPY --from=builder /app/package*.json ./
RUN npm install --omit=dev

EXPOSE 8080

CMD ["npm", "start"]