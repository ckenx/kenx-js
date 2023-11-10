# syntax = docker/dockerfile:1.2

FROM node:16-alpine as builder
WORKDIR /app

COPY package.json ./
COPY yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

FROM node:16-alpine
WORKDIR /app

COPY --from=builder /app .
EXPOSE 8008

CMD ["yarn", "start"]