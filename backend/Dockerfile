FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./

RUN npm install

COPY prisma ./prisma/
COPY src ./src/

RUN npx prisma generate
RUN npx prisma migrate deploy

EXPOSE 6001

CMD ["npm", "start"]
