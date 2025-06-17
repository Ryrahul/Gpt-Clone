# Use official Node.js alpine image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy lock and manifest first for caching
COPY package.json pnpm-lock.yaml ./

# Install all dependencies (including devDependencies for build)
RUN pnpm install --frozen-lockfile

# Copy the rest of your source code
COPY . .

# Build the Next.js app
RUN pnpm build

# Remove devDependencies after build to reduce image size
RUN pnpm prune --prod

# Expose the port Next.js serves on
EXPOSE 3001

# Start the app
CMD ["pnpm", "start"]