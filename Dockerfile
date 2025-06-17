# Use official Node.js alpine image
FROM node:20-alpine

# Set working directory
WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

ARG MONGODB_URI
ENV MONGODB_URI=$MONGODB_URI

RUN pnpm build

RUN pnpm prune --prod

EXPOSE 3001

CMD ["pnpm", "start"]
