# syntax = docker/dockerfile:1

ARG NODE_VERSION="22.17.1"
ARG BASE_VERSION="alpine3.19"
ARG OLD_IMAGE="bulk-send-webapp:latest"
ARG KEEP_DAYS=60

FROM node:${NODE_VERSION}-${BASE_VERSION} AS builder

WORKDIR /app

# Add build arguments for env variables
ARG PUBLIC_PATH_URL
ARG MODULE_FEDERATION_CONNECT_URL
ARG API_BASE_URL
ARG WHATSAPP_FACEBOOK_APP_ID
ARG WHATSAPP_MMLITE_CONFIG_ID
ARG ENVIRONMENT

# Set them as environment variables
ENV PUBLIC_PATH_URL=${PUBLIC_PATH_URL}
ENV MODULE_FEDERATION_CONNECT_URL=${MODULE_FEDERATION_CONNECT_URL}
ENV API_BASE_URL=${API_BASE_URL}
ENV WHATSAPP_FACEBOOK_APP_ID=${WHATSAPP_FACEBOOK_APP_ID}
ENV WHATSAPP_MMLITE_CONFIG_ID=${WHATSAPP_MMLITE_CONFIG_ID}
ENV ENVIRONMENT=${ENVIRONMENT}

RUN apk add --no-cache \
    git \
    build-base \
    cairo-dev \
    pango-dev \
    jpeg-dev \
    giflib-dev \
    librsvg-dev

COPY package.json package-lock.json ./

RUN --mount=type=cache,target=/root/.npm NPM_CONFIG_CACHE=/root/.npm npm install

COPY . ./

RUN npm run build

FROM ${OLD_IMAGE} AS old_css

FROM nginxinc/nginx-unprivileged:1.25-alpine
ARG OLD_IMAGE=${OLD_IMAGE}
ARG KEEP_DAYS

COPY --chown=nginx:nginx docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY --chown=nginx:nginx docker/nginx/headers /usr/share/nginx/html/headers
COPY --chown=nginx:nginx docker/file_handler.sh /
COPY --from=builder --chown=nginx:nginx /app/dist /usr/share/nginx/html/bulk-send/
COPY --from=old_css --chown=nginx:nginx /usr/share/nginx/html/bulk-send/assets/all.tx[t] /usr/share/nginx/html/bulk-send/assets/*.css /usr/share/nginx/html/bulk-send/assets/

COPY docker-entrypoint.sh /

RUN mv /usr/share/nginx/html/bulk-send/index.html /usr/share/nginx/html/bulk-send/index.html.tmpl \
    && cd /usr/share/nginx/html/bulk-send/ \
    && ln -s /tmp/index.html \
    && /file_handler.sh css

EXPOSE 8080
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
