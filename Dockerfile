FROM node:24-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG APP_NAME
RUN test -n "$APP_NAME" && npx nest build "$APP_NAME"


FROM node:24-alpine AS production

ENV NODE_ENV=production
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist

ARG APP_NAME
ENV APP_NAME=${APP_NAME}

CMD ["sh", "-c", "node dist/apps/${APP_NAME}/main.js"]