FROM node:20-alpine

RUN apk add --no-cache ffmpeg python3 make g++

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY src ./src

EXPOSE 3005

CMD ["node", "src/worker.js"]
