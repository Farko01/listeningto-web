FROM ubuntu:20.04
FROM node:16.14.0-buster
FROM yarnpkg/dev

WORKDIR /listeningto-web

COPY package*.json ./
COPY . ./

RUN yarn

EXPOSE 3000

CMD ["yarn", "dev"]