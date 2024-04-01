FROM node:20-alpine as base

WORKDIR /usr/src/app
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