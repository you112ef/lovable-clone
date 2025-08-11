# Node 20 minimal image
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Install dependencies first
COPY server/package*.json ./
RUN npm ci --no-audit --no-fund

# Copy source
COPY server/. .

# Environment
ENV PORT=8080
EXPOSE 8080

# Start the server (uses tsx loader from devDependencies)
CMD ["npm", "start"]