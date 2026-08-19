FROM node:20-slim

WORKDIR /app

COPY frontend/package*.json ./

RUN npm install --no-audit --no-fund

COPY frontend/ .

RUN npm run build

RUN npm prune --production

CMD ["npm", "start"]