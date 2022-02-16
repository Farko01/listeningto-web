FROM ubuntu:20.04
FROM node:16.14

WORKDIR /app

COPY package*.json ./

RUN npm install -ignore-engines

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]