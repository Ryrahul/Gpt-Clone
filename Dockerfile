# Use official Node.js Alpine image
FROM node:20-alpine

# Set working directory
WORKDIR /app

RUN npm install -g pnpm

ARG MONGODB_URI
ENV MONGODB_URI=${MONGODB_URI}

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

RUN pnpm prune --prod

EXPOSE 3001

# Start the app
CMD ["pnpm", "start"]
