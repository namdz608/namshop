FROM node:21-alpine3.18

RUN apk add --no-cache curl

WORKDIR /app

COPY . .

RUN npm install --force

RUN npm run build

EXPOSE 4000

CMD ["node", "build/src/app.js"]