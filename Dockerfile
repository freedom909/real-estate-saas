FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose ports
EXPOSE 4000 4020 4030 4040 4050 4060 4070 4080

# Start the application
CMD ["node", "dist/gateway/index.js"]
