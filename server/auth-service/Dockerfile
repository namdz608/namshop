FROM node:21-alpine3.18

WORKDIR /app

COPY . .

RUN npm install --force

RUN npm run build

EXPOSE 4002

CMD ["node", "build/src/app.js"]