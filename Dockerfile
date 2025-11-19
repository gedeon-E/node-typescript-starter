# BUILD
FROM node:22-alpine as build-stage
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn --frozen-lockfile

COPY --chown=node:node . .
RUN yarn build

RUN rm -rf node_modules && \
  NODE_ENV=production yarn install \
  --prefer-offline \
  --pure-lockfile \
  --non-interactive \
  --production=true

# STARTER
FROM node:22-alpine
ENV NODE_ENV production
WORKDIR /app

COPY --from=build-stage --chown=node:node /app/dist ./dist
COPY --from=build-stage --chown=node:node /app/node_modules ./node_modules
COPY --from=build-stage --chown=node:node /app/package.json ./
COPY --from=build-stage --chown=node:node /app/public ./public
COPY --from=build-stage --chown=node:node /app/seeders ./seeders
COPY --from=build-stage --chown=node:node /app/migrations ./migrations
COPY --from=build-stage --chown=node:node /app/docker ./docker
COPY --from=build-stage --chown=node:node /app/.sequelizerc ./

EXPOSE 8000

USER node
CMD yarn start
