FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./

RUN npm install

COPY prisma ./prisma/
COPY src ./src/

RUN npx prisma generate

EXPOSE 6001

CMD ["sh", "-c", "npx prisma migrate deploy && node src/index.js"]
