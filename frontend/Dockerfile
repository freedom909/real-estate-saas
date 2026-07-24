FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --no-audit --no-fund

# Copy source code
COPY . .

# Build Next.js (standalone output)
RUN npm run build

# Railway assigns PORT dynamically
ENV PORT=3000

CMD ["npm", "start"]
