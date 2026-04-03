# syntax=docker/dockerfile:1

FROM node:latest

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Expose GraphQL Gateway port
EXPOSE 4000
CMD ["node", "index.js"]