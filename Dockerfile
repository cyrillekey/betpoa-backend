FROM node:20-alpine as base

ARG SENTRY_AUTH_TOKEN
WORKDIR /app

COPY package.json yarn.lock ./
FROM base as build
RUN yarn --frozen-lockfile
COPY . .
RUN yarn generate && yarn build:ts
RUN yarn --production --frozen-lockfile
FROM base as release
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json /app/.env ./
EXPOSE 3000
CMD yarn start