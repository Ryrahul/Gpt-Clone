# Use official Node.js alpine image
FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm

ARG MONGODB_URI
ENV MONGODB_URI=$MONGODB_URI

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

# Build
RUN pnpm build

# Remove dev deps
RUN pnpm prune --prod

EXPOSE 3001
CMD ["pnpm", "start"]
