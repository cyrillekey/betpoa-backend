FROM node:20-alpine as base

WORKDIR /app
COPY package.json ./
FROM base as build
# RUN yarn --frozen-lockfile
RUN yarn install
COPY . .
RUN yarn generate && yarn build:ts
# RUN yarn --production --frozen-lockfile
RUN yarn install --production
FROM base as release
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json /app/.env ./
EXPOSE 3000
CMD yarn start